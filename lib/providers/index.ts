import type {BaseProvider} from './baseProvider';

import {MusicalyDown} from './musicalyDownProvider';
import {SnaptikProvider} from './snaptikProvider';
import {TikmateProvider} from './tikmateProvider';
import {TTDownloader} from './ttDownloaderProvider';
import {TTSave} from './ttSaveProvider';
import {DLTikProvider} from './DLTikProvider';
import {SaveFromProvider} from './saveFromProvider';
import {SaveTikProvider} from './saveTikProvider';
import {FireTikProvider} from './fireTikProvider';
import {TikDownProvider} from './tikDownProvider';
import {DownTikProvider} from './downTikProvider';
import {LoveTikProvider} from './loveTikProvider';
import {DDDTikProvider} from './dddTikProvider';

export const Providers: BaseProvider[] = [
  new SnaptikProvider(),
  new TikmateProvider(),
  new MusicalyDown(),
  new TTDownloader(),
  new TTSave(),
  new DLTikProvider(),
  new SaveFromProvider(),
  new SaveTikProvider(),
  new FireTikProvider(), // DDDTik Mirror
  new TikDownProvider(),
  new DownTikProvider(), // SaveTik Mirror
  new LoveTikProvider(),
  new DDDTikProvider(),
];

export const getRandomProvider = () => Providers[
    Math.floor(Math.random() * Providers.length)
];

export const getProvider = (name: string) => name.toLowerCase() !== 'random' ?
Providers.find(
    (p) => p.resourceName() === name.toLowerCase(),
) : getRandomProvider();
