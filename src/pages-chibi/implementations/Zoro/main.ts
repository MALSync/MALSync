import { PageInterface } from '../../pageInterface';

export const Zoro: PageInterface = {
  name: 'HiAnime',
  domain: 'https://hianime.to',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://hianime.do/*'],
  },
  features: {
    customDomains: true,
  },
  sync: {
    isSyncPage($c) {
      return $c.boolean(false).run();
    },
    getTitle($c) {
      return $c.string('').run();
    },
    getIdentifier($c) {
      return $c.string('').run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    getOverviewUrl($c) {
      return $c.string('').run();
    },
    getEpisode($c) {
      return $c.number(1).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.run();
    },
  },
};
