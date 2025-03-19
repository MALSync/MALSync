import { PageInterface } from './pageInterface';

import { test } from './implementations/test/main';
import { mangaNato } from './implementations/mangaNato/main';

export const pages: { [key: string]: PageInterface } = {
  test,
  mangaNato,
};
