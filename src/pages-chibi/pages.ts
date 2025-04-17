import { PageInterface } from './pageInterface';

import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';
import { ranobeLib } from './implementations/ranobeLib/main';

export const pages: { [key: string]: PageInterface } = {
  mangaNato,
  gojo,
  ranobeLib,
};
