import React from 'react';
import useSWR, {Fetcher} from 'swr';
import {ExtractedInfo} from 'tiktok-dl-core';

export type ExtractedInfoWithProvider = ExtractedInfo & {
    provider: string;
};

// fetcher
const fetcher: Fetcher<ExtractedInfoWithProvider, string> = (...args) =>
    fetch(...args).then((res) => res.json());

/**
 * Render tiktok video component.
 * @param {{ url: URL; }} param0 TikTokVideoComponent props.
 * @return {JSX.Element}
 */
export const TikTokVideoComponent = ({url}: {url: URL}): JSX.Element => {
    url.search = ''; // clean params.
    const {data} = useSWR(
        [
            '/api/download',
            {
                method: 'POST',
                body: JSON.stringify({url: url.href}),
            },
        ],
        fetcher,
        {
            suspense: true,
        },
    );

    console.log(data);

    return (
        <React.Fragment>
            <section className="mt-5">
                {data && !data.error ? (
                    <>
                        <h1 className="text-base">Here is your video:</h1>
                        <ul className="flex flex-col md:flex-row flex-grow-0">
                            {data.video?.urls &&
                                data.video.urls.map((url, index) => (
                                    <li key={index.toString()}>{url}</li>
                                ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <h1 className="text-base text-red-500 font-medium">
                            Error: {data && data.error ? data.error : 'wait'}
                        </h1>
                    </>
                )}
            </section>
        </React.Fragment>
    );
};
