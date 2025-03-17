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
      return $c.string('test').run();
    },
    getOverviewUrl($c) {
      return $c.url().run();
    },
    getEpisode($c) {
      return $c.url().number(3).run();
    },
    getVolume($c) {
      return $c.number(4).run();
    },
    nextEpUrl($c) {
      return $c.string('https://malsync.moe/next').run();
    },
    uiInjection($c) {
      return $c.string('UI').run();
    },
    getMalUrl($c) {
      return $c.string('https://myanimelist.net/manga/1').run();
    },
  },
};
