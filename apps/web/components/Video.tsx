import React from 'react';
import type {ExtractedInfoWithProvider} from './FormInput';

export const VideoComponent = ({data}: {data: ExtractedInfoWithProvider}) => {
    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        if (typeof window !== 'undefined') {
            window.alert('URL Copied');
        }
    };
    return (
        <React.Fragment>
            This video is downloaded from{' '}
            <span className="font-semibold">{data.provider}</span>.
            {data.caption && <pre>{data.caption}</pre>}
            <div className="md:grid md:grid-cols-3 md:gap-4">
                <video
                    controls={true}
                    autoPlay={false}
                    className="rounded-md h-64 w-80"
                >
                    <source src={data.video?.urls[0]} />
                </video>
                <div className="flex flex-row font-sans basis-8 mt-2">
                    {data.video?.urls.map((url, index) => (
                        <button
                            key={index.toString()}
                            className="mr-1 bg-teal-400 md:p-2 p-1 rounded-md shadow"
                            onClick={() => copyUrl(url)}
                        >
                            LINK {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
};
