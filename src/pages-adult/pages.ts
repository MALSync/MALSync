import { PageInterface } from '../pages-chibi/pageInterface';

import { hentaimama } from './implementations/HentaiMama/main';
import { HentaiOcean } from './implementations/HentaiOcean/main';
import { Mangadistrict } from './implementations/Mangadistrict/main';
import { OmegaScans } from './implementations/OmegaScans/main';

export const pages: { [key: string]: PageInterface } = {
  Hentaimama: hentaimama,
  HentaiOcean,
  Mangadistrict,
  OmegaScans,
};
