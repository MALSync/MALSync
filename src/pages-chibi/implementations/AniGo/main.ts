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
      return getJsonData($c).get('page').equals('episode').run();
    },
    getTitle($c) {
      return getJsonData($c).get('name').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('anime_id').run();
    },
    getOverviewUrl($c) {
      return getJsonData($c).get('series_url').ifNotReturn().string().urlAbsolute().run();
    },
    getEpisode($c) {
      return getJsonData($c).get('episode').number().run();
    },
    getImage($c) {
      return $c.querySelector('.poster img').getAttribute('src').ifNotReturn().urlAbsolute().run();
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
      const getMal = getJsonData($c)
        .get('mal_id')
        .number()
        .ifNotReturn()
        .string('https://myanimelist.net/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('mal_id').run())
        .run();

      const getAnilist = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .get('al_id')
        .number()
        .ifNotReturn()
        .string('https://anilist.co/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('al_id').run())
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
      return $c
        .domReady()
        .detectChanges(
          $c.querySelector('#syncData').ifNotReturn().text().trim().run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
  },
};

function getJsonData($c) {
  return $c.querySelector('#syncData').ifNotReturn().text().jsonParse();
}
