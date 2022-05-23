import React from 'react';

/**
 * FormInput Component.
 * @return {JSX.Element}
 */
export const FormInputComponent = (): JSX.Element => {
    const [url, setUrl] = React.useState('');

    return (
        <React.Fragment>
            <section className="inline-block">
                <h1 className="text-lg leading-relaxed">
                    Fill TikTok's Video URL below:
                </h1>
                <form
                    target="#"
                    className="flex flex-col md:flex-row"
                    onSubmit={() => {}}
                >
                    <div>
                        <input
                            type="url"
                            onChange={(event) => setUrl(event.target.value)}
                            value={url}
                            className="p-3 border border-gray-300 font-sans h-auto w-auto outline-solid-blue-500"
                        />
                    </div>

                    <div>
                        <button
                            type="button"
                            className="p-3 ml-2 bg-sky-400 uppercase text-white"
                        >
                            download
                        </button>
                    </div>
                </form>
            </section>
        </React.Fragment>
    );
};

export default FormInputComponent;
