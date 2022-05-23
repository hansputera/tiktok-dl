import React from 'react';
import {ExtractedInfo} from 'tiktok-dl-core';

type ExtractedInfoWithProvider = ExtractedInfo & {
    provider: string;
};

/**
 * Render tiktok video component.
 * @param {ExtractedInfoWithProvider} data tiktok's api result.
 * @return {JSX.Element}
 */
export const TikTokVideoComponent = (
    data: ExtractedInfoWithProvider,
): JSX.Element => {
    return (
        <React.Fragment>
            <section className="mt-5">
                {data.error ? (
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
                            Error: {data.error}
                        </h1>
                    </>
                )}
            </section>
        </React.Fragment>
    );
};
