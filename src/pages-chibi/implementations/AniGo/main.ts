import { PageInterface } from '../../pageInterface';

export const AniGo: PageInterface = {
  name: 'AniGo',
  type: 'anime',
  domain: 'https://anigo.to',
  languages: ['English'],
  urls: {
    match: ['*://anigo.to/*'],
  },
  search: 'https://anigo.to/browser?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h1')
        .getAttribute('data-jp')
        .ifNotReturn($c.querySelector('h1').text().trim().run())
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('-[^-]+$', '').trim().run();
    },
    getOverviewUrl($c) {
      return $c.url().replaceRegex('#[^-]+$', '').run();
    },
    getImage($c) {
      return $c.querySelector('.posterbox img').getAttribute('src').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().regex('#ep=(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.eplist .active')
        .parent()
        .next()
        .find('a')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      const getMal = $c
        .querySelector('.posterbox [href*="myanimelist"]')
        .ifNotReturn()
        .getAttribute('href')
        .run();

      const getAnilist = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .querySelector('.posterbox [href*="anilist"]')
        .getAttribute('href')
        .run();

      return $c.coalesce($c.fn(getAnilist).run(), $c.fn(getMal).run()).ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.eplist a').run();
    },
    elementEp($c) {
      return $c.getAttribute('num').number().run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      // It doesn't detect when use .detectURLChange for some reason
      return $c.detectChanges($c.url().run(), $c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      // It better to wait it until the link redirect to last episode you have watched.
      return $c.waitUntilTrue($c.url().contains('#ep').run()).trigger().run();
    },
  },
};
