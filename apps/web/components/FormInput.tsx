import React from 'react';
import useSWR, {Fetcher} from 'swr';
import {ExtractedInfo} from 'tiktok-dl-core';
import {getTikTokURL} from '../lib/url';
import {VideoComponent} from './Video';

// // ERRORS ///
/**
 * @class InvalidUrlError
 */
class InvalidUrlError extends Error {
    /**
     * @param {string} msg error message.
     */
    constructor(msg?: string) {
        super(msg);
        this.name = 'INVALID_URL';
    }
}

export type ExtractedInfoWithProvider = ExtractedInfo & {
    provider: string;
    _url: string;
};

const fetcher: Fetcher<ExtractedInfoWithProvider, string> = (...args) =>
    fetch(...args).then((r) => r.json());

/**
 * FormInput Component.
 * @return {JSX.Element}
 */
export const FormInputComponent = (): JSX.Element => {
    const [url, setUrl] = React.useState('');
    const [error, setError] = React.useState<string | Error>();
    const [submitted, setSubmit] = React.useState<boolean>(false);
    const {data, mutate} = useSWR(
        submitted && (!error || !(error as string).length) && url.length
            ? [
                  '/api/download',
                  {
                      method: 'POST',
                      body: JSON.stringify({url}),
                  },
              ]
            : null,
        fetcher,
        {
            loadingTimeout: 10_000,
            refreshInterval: 0,
        },
    );

    React.useEffect(() => {
        if (
            !/^http(s?)(:\/\/)([a-z]+\.)*tiktok\.com\/(.+)$/gi.test(url) &&
            url.length
        ) {
            setError(new InvalidUrlError('Invalid TikTok Video URL'));
            try {
                const u = getTikTokURL(url);
                if (!u) {
                    setError(new InvalidUrlError('Invalid TikTok URL'));
                    return;
                }
                setUrl(u);
            } catch {
                setError(new InvalidUrlError('Invalid TikTok Video URL'));
            }
        } else {
            // submit event trigger.
            if (submitted && !error) {
                mutate();
            }

            setError(undefined);
        }
    }, [url, submitted]);

    return (
        <React.Fragment>
            <section className="inline-block">
                <h1 className="text-lg leading-relaxed">
                    Fill TikTok's Video URL below:
                </h1>
                <p className="text-red-400 font-sans font-semibold">
                    {error instanceof Error
                        ? error.name.concat(': '.concat(error.message))
                        : error
                        ? error
                        : ''}
                </p>
                <form
                    className="flex flex-col md:flex-row"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!url.length) {
                            setError('Please fill the URL!');
                            return;
                        }
                        !error && setSubmit(true);
                    }}
                >
                    <div>
                        <input
                            type="url"
                            onChange={(event) => setUrl(event.target.value)}
                            value={url}
                            placeholder="e.g: "
                            className="p-3 border border-gray-300 font-sans h-auto w-auto outline-solid-blue-500"
                        />
                    </div>

                    <div>
                        <button
                            className="p-3 lg:ml-2 mt-1 bg-sky-400 uppercase text-white shadow-sm"
                            disabled={submitted}
                        >
                            download
                        </button>
                    </div>
                </form>

                <section className="mt-3">
                    {submitted && !data ? (
                        <p className={'text-base font-sans text-blue-500'}>
                            Wait a minute
                        </p>
                    ) : (
                        data && <VideoComponent data={data} />
                    )}
                </section>
            </section>
        </React.Fragment>
    );
};

export default FormInputComponent;
