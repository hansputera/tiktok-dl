import Head from 'next/head';

export default () => {
    return (
        <>
            <Head>
                <title>TikTok Downloader</title>
            </Head>
            {/**
			Body
		*/}
            <div>
                {/** Header 1*/}
                <div className="mt-5">
                    <h1 className="font-mono text-center text-4xl">
                        TikTok Downloader
                    </h1>
                    <p className="font-mono text-center text-xl">
                        Free, and open-source TikTok Video Downloader
                    </p>
                </div>

                {/** Content */}
                <div className="mt-3">
                    <pre className="text-xl text-center">
                        Hello, this page is still in development. Do you want to
                        help me? Visit{' '}
                        <a
                            className="text-blue-500"
                            href="https://github.com/hansputera/tiktok-dl"
                        >
                            github.com/hansputera/tiktok-dl
                        </a>
                        . Thanks!
                    </pre>
                </div>
            </div>
        </>
    );
};
