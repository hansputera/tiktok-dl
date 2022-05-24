import React, {Suspense} from 'react';
import {ErrorBoundary} from './ErrorBoundary';
import {TikTokVideoComponent} from './Video';

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
/**
 * FormInput Component.
 * @return {JSX.Element}
 */
export const FormInputComponent = (): JSX.Element => {
    const [url, setUrl] = React.useState('');
    const [error, setError] = React.useState<string | Error>();
    const [submitted, setSubmit] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (
            !/^http(s?)(:\/\/)([a-z]+\.)*tiktok\.com\/(.+)$/gi.test(url) &&
            url.length
        ) {
            setError(new InvalidUrlError('Invalid TikTok Video URL'));
        } else {
            setError(undefined);
        }
    }, [url]);

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
                    target="#"
                    className="flex flex-col md:flex-row"
                    onSubmit={() => {
                        !error && setSubmit(true);
                        return;
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
                            className="p-3 lg:ml-2 md:mt-2 sm:mt-2 bg-sky-400 uppercase text-white"
                            disabled={submitted}
                        >
                            download
                        </button>
                    </div>
                </form>

                {submitted && (
                    <ErrorBoundary
                        fallback={
                            <h2 className="text-red-500 font-sans font-medium text-base">
                                Couldn't fetch tiktok's video url
                            </h2>
                        }
                    >
                        <Suspense
                            fallback={
                                <h2 className="font-sans font-medium text-base">
                                    Loading...
                                </h2>
                            }
                        >
                            <TikTokVideoComponent url={new URL(url)} />
                        </Suspense>
                    </ErrorBoundary>
                )}
            </section>
        </React.Fragment>
    );
};

export default FormInputComponent;
