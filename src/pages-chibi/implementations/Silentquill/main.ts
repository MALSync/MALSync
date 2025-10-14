import { PageInterface } from '../../pageInterface';
import { Armageddon } from '../Armageddon/main';

export const Silentquill: PageInterface = {
  name: 'Silentquill',
  domain: 'https://www.silentquill.net',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://www.silentquill.net/*'],
  },
  search: 'https://www.silentquill.net/?s={searchtermPlus}',
  sync: { ...Armageddon.sync },
  overview: Armageddon.overview && { ...Armageddon.overview },
  list: Armageddon.list && { ...Armageddon.list },
  lifecycle: Armageddon.lifecycle && { ...Armageddon.lifecycle },
};
