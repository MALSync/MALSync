import { PageInterface } from './pageInterface';

import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';
import { mangadex } from './implementations/mangadex/main';

export const pages: { [key: string]: PageInterface } = {
  mangaNato,
  gojo,
  mangadex,
};
