import type {BaseProvider, ExtractedInfo} from './base';

import {MusicalyDown} from './musicalyDownProvider';
import {SnaptikProvider} from './snaptikProvider';
import {TikmateProvider} from './tikmateProvider';
import {TTDownloader} from './ttDownloaderProvider';
import {TTSave} from './ttSaveProvider';
import {DLTikProvider} from './DLTikProvider';
import {SaveFromProvider} from './saveFromProvider';
import {SaveTikProvider} from './saveTikProvider';
import {TikDownProvider} from './tikDownProvider';
import {DownTikProvider} from './downTikProvider';
import {LoveTikProvider} from './loveTikProvider';
import {DDDTikProvider} from './dddTikProvider';
import {TokupProvider} from './tokupProvider';
import {DownloadOne} from './downloaderOneProvider';
import {NativeProvider} from './nativeProvider';
import {GetVidTikProvider} from './getVidTikProvider';

export const Providers: BaseProvider[] = [
    new SnaptikProvider(),
    new TikmateProvider(),
    new MusicalyDown(),
    new TTDownloader(),
    new TTSave(), // won't work because we coudn't receive the cookie.
    new DLTikProvider(),
    new SaveFromProvider(),
    new SaveTikProvider(),
    new TikDownProvider(),
    new DownTikProvider(), // SaveTik Mirror
    new LoveTikProvider(),
    new DDDTikProvider(),
    new TokupProvider(), // ttsave alternative
    new DownloadOne(),
    new NativeProvider(),
    new GetVidTikProvider(),
];

export const getRandomProvider = () =>
    Providers[Math.floor(Math.random() * Providers.length)];

export const getProvider = (name: string) =>
    name.toLowerCase() !== 'random'
        ? Providers.find((p) => p.resourceName() === name.toLowerCase())
        : getRandomProvider();

export {BaseProvider, ExtractedInfo};