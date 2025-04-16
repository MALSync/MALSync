import { PageInterface } from './pageInterface';

import { test } from './implementations/test/main';
import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';
import { mangaLib } from './implementations/mangaLib/main';

export const pages: { [key: string]: PageInterface } = {
  test,
  mangaNato,
  gojo,
  mangaLib,
};
