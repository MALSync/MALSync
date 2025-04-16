import { PageInterface } from './pageInterface';

import { test } from './implementations/test/main';
import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';
import { animeLib } from './implementations/animeLib/main';

export const pages: { [key: string]: PageInterface } = {
  test,
  mangaNato,
  gojo,
  animeLib,
};
