import 'windi.css';
import type {AppProps} from 'next/app';

/**
 * TikTokApp
 * @param {AppProps} arg0 App properties.
 * @return {JSX.Element}
 */
export default function TikTokApp({Component, pageProps}: AppProps) {
    return <Component {...pageProps} />;
}
