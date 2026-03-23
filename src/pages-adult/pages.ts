import { PageInterface } from '../pages-chibi/pageInterface';

import { HentaiOcean } from './implementations/HentaiOcean/main';
import { Mangadistrict } from './implementations/Mangadistrict/main';

export const pages: { [key: string]: PageInterface } = {
  HentaiOcean,
  Mangadistrict,
};
