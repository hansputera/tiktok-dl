import {createHash} from 'node:crypto';
import {appendFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import type {Got} from 'got';
import {getFetch} from '../fetch';

export interface HttpRequest {
    base: string;
    path: string;
    search?: Record<string, string>;
    form?: Record<string, string | number>;
    json?: unknown;
    headers?: Record<string, string | undefined>;
    throwHttpErrors?: boolean;
    socketTimeoutMs?: number;
}

export interface HttpResponse {
    status: number;
    statusMessage: string;
    body: string;
    headers: Record<string, string>;
}

interface RequestPlan {
    method: string;
    url: string;
    noQuery: string;
    host: string;
    key: string;
    query: Record<string, string>;
}

const clients = new Map<string, Got>();

export const prefixUrl = (base: string): string => {
    const href = new URL(base).href;
    return href.endsWith('/') ? href : href + '/';
};

const sortedPairs = (
    values: Record<string, string | number> | undefined,
    drop: string[] = [],
): string => {
    if (!values) return '';
    return Object.keys(values)
        .filter((key) => !drop.includes(key))
        .sort()
        .map((key) => `${key}=${values[key]}`)
        .join('&');
};

const canonicalJson = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
    if (value && typeof value === 'object') {
        const object = value as Record<string, unknown>;
        return `{${Object.keys(object)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
            .join(',')}}`;
    }
    return JSON.stringify(value) ?? 'undefined';
};

const buildPlan = (req: HttpRequest): RequestPlan => {
    const url = new URL(prefixUrl(req.base) + req.path);
    if (req.search) {
        url.search = '';
        for (const [key, value] of Object.entries(req.search)) {
            url.searchParams.append(key, value);
        }
    }

    const method = req.form || req.json !== undefined ? 'POST' : 'GET';
    const noQuery = url.origin + url.pathname;
    const query = Object.fromEntries(url.searchParams);
    const form = sortedPairs(req.form, ['ts', '_ts']);
    const payload =
        form || (req.json !== undefined ? canonicalJson(req.json) : '');
    const key = createHash('sha1')
        .update(`${method}\n${noQuery}\n${sortedPairs(query)}\n${payload}`)
        .digest('hex')
        .slice(0, 16);

    return {method, url: url.href, noQuery, host: url.host, key, query};
};

const clientFor = (base: string): Got => {
    let client = clients.get(base);
    if (!client) {
        client = getFetch(base);
        clients.set(base, client);
    }
    return client;
};

const applyThrow = (
    req: HttpRequest,
    response: HttpResponse,
): HttpResponse => {
    if (
        req.throwHttpErrors !== false &&
        (response.status < 200 || response.status > 299)
    ) {
        throw new Error(
            `Response code ${response.status} (${response.statusMessage})`,
        );
    }
    return response;
};

const live = async (req: HttpRequest): Promise<HttpResponse> => {
    const options: Record<string, unknown> = {
        method: req.form || req.json !== undefined ? 'POST' : 'GET',
        throwHttpErrors: false,
    };
    if (req.headers) options.headers = req.headers;
    if (req.search) options.searchParams = new URLSearchParams(req.search);
    if (req.form) options.form = req.form;
    if (req.json !== undefined) options.json = req.json;
    if (req.socketTimeoutMs) {
        options.timeout = {socket: req.socketTimeoutMs};
    }

    const response = await clientFor(req.base)(req.path, options as never);
    const headers: Record<string, string> = {};
    for (const [name, value] of Object.entries(response.headers)) {
        if (value === undefined) continue;
        headers[name] = Array.isArray(value)
            ? value.join(', ')
            : String(value);
    }

    return {
        status: response.statusCode,
        statusMessage: response.statusMessage ?? '',
        body: response.body,
        headers,
    };
};

const writeFixture = async (
    dir: string,
    plan: RequestPlan,
    payload: Record<string, unknown>,
): Promise<void> => {
    const file = join(dir, plan.host, `${plan.method}-${plan.key}.json`);
    await mkdir(dirname(file), {recursive: true});
    await writeFile(file, JSON.stringify(payload, null, 2) + '\n');
    await appendFile(
        join(dir, 'index.jsonl'),
        JSON.stringify({
            method: plan.method,
            url: plan.url,
            file: file.slice(dir.length + 1),
            status: typeof payload.status === 'number' ? payload.status : null,
        }) + '\n',
    );
};

const replay = async (
    dir: string,
    req: HttpRequest,
): Promise<HttpResponse> => {
    const plan = buildPlan(req);
    const relative = join(plan.host, `${plan.method}-${plan.key}.json`);
    let text: string;
    try {
        text = await readFile(join(dir, relative), 'utf8');
    } catch {
        throw new Error(`NO_FIXTURE ${relative}`);
    }

    const raw = JSON.parse(text);
    if (raw.error !== undefined) throw new Error(raw.error);

    const headers: Record<string, string> = {};
    for (const [name, value] of raw.headers as [string, string][]) {
        const key = name.toLowerCase();
        headers[key] =
            headers[key] !== undefined && key === 'set-cookie'
                ? `${headers[key]}, ${value}`
                : value;
    }

    return applyThrow(req, {
        status: raw.status,
        statusMessage: raw.statusMessage ?? '',
        body: raw.body,
        headers,
    });
};

export const request = async (req: HttpRequest): Promise<HttpResponse> => {
    const dir = process.env.TIKTOK_DL_HTTP_FIXTURES;
    if (!dir) return applyThrow(req, await live(req));

    const plan = buildPlan(req);
    if (process.env.TIKTOK_DL_HTTP_FIXTURES_RECORD === '1') {
        const file = join(
            dir,
            plan.host,
            `${plan.method}-${plan.key}.json`,
        );
        if (existsSync(file)) return replay(dir, req);

        let response: HttpResponse;
        try {
            response = await live(req);
        } catch (error) {
            await writeFixture(dir, plan, {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }

        await writeFixture(dir, plan, {
            status: response.status,
            statusMessage: response.statusMessage,
            headers: Object.entries(response.headers),
            body: response.body,
        });
        return applyThrow(req, response);
    }

    return replay(dir, req);
};
