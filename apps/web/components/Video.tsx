import React from 'react';
import type {ExtractedInfoWithProvider} from './FormInput';

export const VideoComponent = ({data}: {data: ExtractedInfoWithProvider}) => {
    return (
        <React.Fragment>
            <h1 className="text-2xl text-center">Your Video Is Ready!</h1>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <video
                        autoPlay={false}
                        controls
                        className="h-64 w-80 rounded-md md:ml-2"
                    >
                        <source src={data.video?.urls[0]} />
                    </video>
                </div>
                <div className="bg-teal-200 rounded-sm text-center">
                    <ul className="grid grid-cols-1 gap-1">
                        <li key="download-url">
                            <p className="font-semibold">Download URLs:</p>
                        </li>
                        {data.video!.urls.map((url, index) => (
                            <li key={index}>
                                <a href={url}>Click to Download #{index + 1}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                {data.music && (
                    <div className="bg-light-500 rounded-sm text-center">
                        <ul className="grid grid-cols-1 gap-1">
                            <li key="music-head">
                                <p className="font-semibold">Music:</p>
                            </li>
                            <li key="music-url">
                                Music URL:{' '}
                                <a
                                    href={data.music.url}
                                    className="text-blue-500 uppercase"
                                    target="_blank"
                                >
                                    Click here
                                </a>
                            </li>
                            {data.music.author && (
                                <li key="music-author">
                                    Music Author: {data.music.author}
                                </li>
                            )}
                            {data.music.title && (
                                <li key="music-title">
                                    Music Title: {data.music.title}
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            <p className="font-sans text-base mt-2">
                &copy; Source: {data.provider}
            </p>
        </React.Fragment>
    );
};
