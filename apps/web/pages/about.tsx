import useSWR from 'swr';
import Head from 'next/head';

export default () => {
    const {data, error} = useSWR(
        'https://api.github.com/repos/hansputera/tiktok-dl',
        (...args) => fetch(...args).then((r) => r.json()),
    );
    return (
        <>
            <Head>
                <title>About</title>
            </Head>
            <section className="p-5">
                <h1 className="text-center text-2xl">About TikTok-DL</h1>

                <div className="mt-3">
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        data && (
                            <>
                                <p className="text-center font-sans">
                                    {data.description}
                                </p>
                                <ul className="mb-3 mt-3">
                                    <li>
                                        This project is based on{' '}
                                        <span className="font-semibold">
                                            {data.license.name}
                                        </span>
                                    </li>
                                    <li>
                                        Currently, we have{' '}
                                        {data.stargazers_count.toLocaleString()}{' '}
                                        stars, {data.forks.toLocaleString()}{' '}
                                        forks, and {data.open_issues} opened
                                        issues.
                                    </li>
                                    <li>
                                        Also, this project is created at{' '}
                                        <span className="font-semibold">
                                            {new Date(
                                                data.created_at,
                                            ).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                timeZone: 'Asia/Jakarta',
                                            })}
                                        </span>{' '}
                                        by{' '}
                                        <span className="font-medium">
                                            {data.owner.login}
                                        </span>
                                    </li>
                                    <li>
                                        Last update:{' '}
                                        <span className="font-semibold">
                                            {new Date(
                                                data.updated_at,
                                            ).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                timeZone: 'Asia/Jakarta',
                                            })}
                                        </span>
                                    </li>
                                </ul>{' '}
                                If you want see the source code,{' '}
                                <a
                                    href={data.html_url}
                                    className="font-semibold text-blue-500"
                                    target="_blank"
                                >
                                    click here
                                </a>
                                . And feel free to open an{' '}
                                <a
                                    href={data.html_url.concat(
                                        '/issues/new/choose',
                                    )}
                                    className="text-blue-500"
                                    target="_blank"
                                >
                                    issue
                                </a>{' '}
                                if you have a problem or find a bug. Thank you!
                            </>
                        )
                    )}
                </div>
            </section>
        </>
    );
};
