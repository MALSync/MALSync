import { PageInterface } from '../../pageInterface';

export const animevost: PageInterface = {
  name: 'AnimeVost',
  domain: ['https://animevost.org', 'https://v7.vost.pw'],
  languages: ['Russian'],
  type: 'anime',
  urls: {
    match: ['*://animevost.org/tip/*', '*://v7.vost.pw/tip/*'],
  },

  sync: {
    isSyncPage($c) {
      return $c.url().regex('tip\\/[a-z0-9-]+\\/\\d+-[^\\/]+\\.html').boolean().run();
    },

    getTitle($c) {
      return $c.querySelector('title').text().regex('\\/\\s*(.*?)\\s*\\[', 1).trim().run();
    },

    getIdentifier($c) {
      return $c.url().regex('tip\\/[a-z0-9-]+\\/(\\d+)-', 1).run();
    },

    getOverviewUrl($c) {
      return $c.url().run();
    },

    getEpisode($c) {
      return $c.querySelector('#items .epizode.active').text().regex('(\\d+)', 1).number().run();
    },
  },

  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },

    ready($c) {
      return $c
        .title()
        .contains('404')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .trigger()
        .run();
    },

    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#items .epizode.active').boolean().run())
        .trigger()
        .detectChanges($c.querySelector('#items .epizode.active').text().run(), $c.trigger().run())
        .run();
    },
  },
};
