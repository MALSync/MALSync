import { PageInterface } from '../../pageInterface';

export const Kuudere: PageInterface = {
  name: 'Kuudere',
  domain: 'https://Kuudere.to',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://kuudere.to/*', '*://kuudere.lol/*', '*://kuudere.ru/*'],
  },
  search: 'https://kuudere.to/search?keyword={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('watch').run(),
          $c.querySelector('[property="video:series"]').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('[property="video:series"]').getAttribute('content').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().replace('watch', 'anime').replaceRegex('/([^/]+)$', '').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .coalesce(
          $c.querySelector('.shadow-lg[data-episode]').run(),
          $c.querySelector('.ring-white[data-episode]').run(),
        )
        .next()
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.h-auto .bg-card-background:last-child').uiPrepend().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('anime').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('.flex-shrink-0 img.object-cover')
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').parent().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[data-episodes-container] a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('data-episode').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('[data-episodes-container]').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
