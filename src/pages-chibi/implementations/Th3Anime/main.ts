import { PageInterface } from '../../pageInterface';

export const Th3Anime: PageInterface = {
  name: 'Th3Anime',
  domain: 'https://th3anime.me/',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://th3anime.me/*'],
  },
  search: 'https://th3anime.me/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).matches('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.text-white.dynamic-name').getAttribute('data-title').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().urlStrip().replace('watch', 'details').run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
    uiInjection($c) {
      return $c.querySelector('.player-control').uiAfter().run();
    },
    nextEpUrl($c) {
      return $c
        .url()
        .split('/')
        .slice(0, 4)
        .join(
          $c
            .querySelector('.ssl-item .ep-item .active')
            .parent()
            .next()
            .ifNotReturn()
            .find('a')
            .getAttribute('data-id')
            .ifNotReturn()
            .urlAbsolute()
            .run(),
        )
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .title()
        .contains('Error 404')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
