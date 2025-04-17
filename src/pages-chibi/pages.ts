import { PageInterface } from './pageInterface';

import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';

export const pages: { [key: string]: PageInterface } = {
  mangaNato,
  gojo,
};
