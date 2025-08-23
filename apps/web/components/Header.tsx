/**
 * Next Head Component.
 * @param {{title: string, children: JSX.Element }} param0 NextHeadComponent args.
 * @return {JSX.Element}
 */
export const NextHeadComponent = ({
    title,
    children,
}: {
    title?: string;
    children?: JSX.Element;
}): JSX.Element => {
    return (
        <>
            <title>{title ?? 'TikTok Downloader'}</title>
            <meta
                name="title"
                content="TikTok Downloader | Non&Watermark Support"
            />
            <meta
                name="description"
                content="An Open-Source Project where it could download TikTok's Video without annoying ads!"
            />
            <meta
                name="keywords"
                content="tiktok-downloader, tiktokdl, tiktok, download video tiktok, tiktok no watermark"
            />
            <meta
                name="author"
                content="Hanif Dwy Putra S <github.com/hansputera>"
            />
            <meta name="robots" content="index, follow" />
            {children}
        </>
    );
};
