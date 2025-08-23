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

interface StateData {
    submitted: boolean;
    error?: string | Error;
    url: string;
}

const fetcher: Fetcher<ExtractedInfoWithProvider, string> = (...args) =>
    fetch(...args).then((r) => r.json());

/**
 * FormInput Component.
 * @return {JSX.Element}
 */
export const FormInputComponent = (): JSX.Element => {
    const [state, setState] = React.useState<StateData>({
        submitted: false,
        error: undefined,
        url: '',
    });
    const {data, mutate} = useSWR(
        (!state.error || !(state.error as string).length) &&
            /^http(s?)(:\/\/)([a-z]+\.)*tiktok\.com\/(.+)$/gi.test(state.url)
            ? [
                  '/api/download',
                  {
                      method: 'POST',
                      body: JSON.stringify({url: state.url}),
                  },
              ]
            : null,
        fetcher,
        {
            loadingTimeout: 5_000,
            refreshInterval: 60_000,
            revalidateOnMount: false,
            onSuccess: () =>
                setState({
                    ...state,
                    submitted: false,
                }),
        },
    );

    React.useEffect(() => {
        if (
            !/^http(s?)(:\/\/)([a-z]+\.)*tiktok\.com\/(.+)$/gi.test(
                state.url,
            ) &&
            state.url.length
        ) {
            setState({
                ...state,
                error: new InvalidUrlError('Invalid TikTok URL'),
            });
        } else {
            // submit event trigger.
            if (state.submitted && !state.error) {
                mutate();
            }

            try {
                const u = getTikTokURL(state.url);
                if (!u) {
                    setState({
                        ...state,
                        error: new InvalidUrlError('Invalid TikTok URL'),
                    });
                    return;
                }

                setState({
                    ...state,
                    url: u,
                });
            } catch {
                setState({
                    ...state,
                    error: new InvalidUrlError('Invalid TikTok URL'),
                });
            }

            setState({
                ...state,
                error: undefined,
            });
        }
    }, [state.submitted, state.url]);

    return (
        <React.Fragment>
            <section className="inline-block">
                <h1 className="text-lg leading-relaxed">
                    Fill TikTok's Video URL below:
                </h1>
                <p className="text-red-400 font-sans font-semibold">
                    {state.error instanceof Error
                        ? state.error.name.concat(
                              ': '.concat(state.error.message),
                          )
                        : state.error
                        ? state.error
                        : ''}
                </p>
                <form
                    className="flex flex-col md:flex-row"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!state.url.length) {
                            setState({
                                ...state,
                                error: 'Please fill the URL!',
                            });
                            return;
                        }
                        !state.error &&
                            setState({
                                ...state,
                                submitted: true,
                            });
                    }}
                >
                    <div>
                        <input
                            type="url"
                            onChange={(event) =>
                                setState({
                                    ...state,
                                    url: event.target.value,
                                })
                            }
                            value={state.url}
                            placeholder="e.g: "
                            className="p-3 border border-gray-300 font-sans h-auto w-auto outline-solid-blue-500"
                        />
                    </div>

                    <div>
                        <button
                            className="p-3 lg:ml-2 mt-1 bg-sky-400 uppercase text-white shadow-sm"
                            disabled={state.submitted}
                        >
                            download
                        </button>
                    </div>
                </form>

                <section className="mt-3 mb-3">
                    {state.submitted && !data && (
                        <p className={'text-base font-sans text-blue-500'}>
                            Wait a minute
                        </p>
                    )}
                    {data && data.video && data.video.urls.length && (
                        <VideoComponent data={data} />
                    )}
                </section>
            </section>
        </React.Fragment>
    );
};

export default FormInputComponent;
