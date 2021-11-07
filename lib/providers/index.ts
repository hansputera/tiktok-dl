import {SnaptikProvider} from './snaptikProvider';

export const Providers = [
  new SnaptikProvider(),
];

export const getRandomProvider = () => Providers[
    Math.floor(Math.random() * Providers.length)
];
