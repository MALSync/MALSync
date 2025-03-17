import { PageInterface } from '../../pageInterface';

export const test: PageInterface = {
  name: 'Test',
  domain: 'https://malsync.moe',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['https://malsync.moe/*'],
  },
  search: 'https://malsync.moe/search?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(0).equals('https:').run();
    },
    getTitle($c) {
      return $c.url().urlPart(2).run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getOverviewUrl($c) {
      return $c.url().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).number().run();
    },
  },
};
