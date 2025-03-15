import { PageInterface } from '../../pageInterface';

export const test: PageInterface = {
  name: 'Test',
  domain: 'https://malsync.moe',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['https://malsync.moe'],
  },
  search: 'https://malsync.moe/search?q={searchterm}',
};
