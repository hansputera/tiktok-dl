import React from 'react';
import type {ExtractedInfoWithProvider} from './FormInput';

export const VideoComponent = ({data}: {data: ExtractedInfoWithProvider}) => {
    return (
        <React.Fragment>
            <h1 className="text-2xl text-center">Your Video Is Ready!</h1>
            <div className="grid grid-cols-3 gap-x-1">
                {data.video?.thumb && (
                    <div>
                        <input
                            type="image"
                            src={data.video.thumb}
                            className="h-64 rounded-md"
                        />
                    </div>
                )}
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
                        <li>
                            <p className="font-semibold">Download URLs:</p>
                        </li>
                        {data.video!.urls.map((url, index) => (
                            <li>
                                <a href={url}>Click to Download #{index + 1}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <p className="font-sans text-base">Source: {data.provider}</p>
        </React.Fragment>
    );
};
