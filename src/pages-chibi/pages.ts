import { PageInterface } from './pageInterface';

import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';
import { animeLib } from './implementations/animeLib/main';
import { mangaLib } from './implementations/mangaLib/main';


export const pages: { [key: string]: PageInterface } = {
  mangaNato,
  gojo,
  animeLib,
  mangaLib,
};
