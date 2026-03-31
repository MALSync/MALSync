import { PageInterface } from '../../pageInterface';

export const AniZen: PageInterface = {
  name: 'AniZen',
  type: 'anime',
  domain: 'https://anizen.tr',
  languages: ['English'],
  urls: {
    match: ['*://anizen.tr/*'],
  },
  search: 'https://anizen.tr/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#anime-poster').getAttribute('alt').ifNotReturn().run();
    },
    getIdentifier($c) {
      return $c.querySelector('#anime-poster').getAttribute('data-anime-id').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('h2 a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
    /*
    nextEpUrl($c) {
      return $c
        .querySelector('.ep-item.active')
        .next()
        .boolean()
        .ifThen($c =>
          $c
            .url()
            .replaceRegex('ep=\\d+', 'ep=')
            .concat($c.this('sync.getEpisode').calculate('+', 1).string().run())
            .run(),
        )
        .run();
    },
    */
    getImage($c) {
      return $c
        .querySelector('#anime-poster')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .string('https://myanimelist.net/anime/')
            .concat(
              $c.querySelector('#anime-poster').getAttribute('data-mal-id').ifNotReturn().run(),
            )
            .run(),
          anilistUrl: $c
            .string('https://anilist.co/anime/')
            .concat(
              $c.querySelector('#anime-poster').getAttribute('data-anilist-id').ifNotReturn().run(),
            )
            .run(),
        })
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('details').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h2').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.this('sync.getImage').run();
    },
    uiInjection($c) {
      return $c.querySelector('#mal-sync').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.ep-item').run();
    },
    elementEp($c) {
      return $c.find('.ssli-order').text().number().run();
    },
    elementUrl($c) {
      return $c
        .string('/watch/')
        .concat($c.this('sync.getIdentifier').concat('?ep=').run())
        .concat($c.target().this('list.elementEp').run())
        .urlAbsolute()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().detectURLChanges($c.trigger().run()).run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#episodes-content').boolean().run())
        .trigger()
        .run();
    },
  },
};
