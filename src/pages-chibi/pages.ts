import { PageInterface } from './pageInterface';

import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';
import { animeLib } from './implementations/animeLib/main';

export const pages: { [key: string]: PageInterface } = {
  mangaNato,
  gojo,
  animeLib,
};
