import type {BaseProvider, ExtractedInfo} from './base';

import {MusicalyDown} from './musicalyDownProvider';
import {SnaptikProvider} from './snaptikProvider';
import {TikmateProvider} from './tikmateProvider';
import {TTDownloader} from './ttDownloaderProvider';
import {SaveFromProvider} from './saveFromProvider';
import {SaveTikProvider} from './saveTikProvider';
import {TikDownProvider} from './tikDownProvider';
import {DownTikProvider} from './downTikProvider';
// import {LoveTikProvider} from './loveTikProvider';
// import {DDDTikProvider} from './dddTikProvider';
// import {DownloadOne} from './downloaderOneProvider';
import {NativeProvider} from './nativeProvider';
// import {GetVidTikProvider} from './getVidTikProvider';

export const Providers: BaseProvider[] = [
    new SnaptikProvider(),
    new TikmateProvider(),
    new MusicalyDown(),
    new TTDownloader(),
    new SaveFromProvider(),
    new SaveTikProvider(),
    new TikDownProvider(),
    new DownTikProvider(), // SaveTik Mirror
    // new LoveTikProvider(),
    // new DDDTikProvider(),
    // new DownloadOne(),
    new NativeProvider(),
    // new GetVidTikProvider(),
];

export const getRandomProvider = () =>
    Providers[Math.floor(Math.random() * Providers.length)];

export const getProvider = (name: string) =>
    name.toLowerCase() !== 'random'
        ? Providers.find((p) => p.resourceName() === name.toLowerCase())
        : getRandomProvider();

export {BaseProvider, ExtractedInfo};
