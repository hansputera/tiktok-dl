import type {BaseProvider} from './baseProvider';

import {MusicalyDown} from './musicalyDownProvider';
import {SnaptikProvider} from './snaptikProvider';
import {TikmateProvider} from './tikmateProvider';
import {TTDownloader} from './ttDownloaderProvider';
import {TTSave} from './ttSaveProvider';
import {DLTikProvider} from './DLTikProvider';
import {SaveFromProvider} from './saveFromProvider';

export const Providers: BaseProvider[] = [
  new SnaptikProvider(),
  new TikmateProvider(),
  new MusicalyDown(),
  new TTDownloader(),
  new TTSave(),
  new DLTikProvider(),
  new SaveFromProvider(),
];

export const getRandomProvider = () => Providers[
    Math.floor(Math.random() * Providers.length)
];

export const getProvider = (name: string) => name.toLowerCase() !== 'random' ?
Providers.find(
    (p) => p.resourceName() === name.toLowerCase(),
) : getRandomProvider();
