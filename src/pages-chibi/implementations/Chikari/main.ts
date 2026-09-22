import { PageInterface } from '../../pageInterface';

export const Chikari: PageInterface = {
  name: 'Chikari',
  domain: 'https://chikari.moe',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://chikari.moe/*'],
  },
  search: 'https://chikari.moe/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .url()
        .matches('^https?://[^/]+/series/[^/?#]+/\\d+(?:\\.\\d+)?/?(?:[?#].*)?$')
        .run();
    },
    getTitle($c) {
      return $c.title().regex('^Chapter [\\d.]+ · (.+)$', 1).trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.string('/series/').concat($c.this('sync.getIdentifier').run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[aria-label="Next chapter"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('.paged-track').boolean().run(),
        current: $c => {
          const track = $c.querySelector('.paged-track').ifNotReturn();
          const firstPage = $c.getVariable<number[]>('visiblePages').first();
          const lastPage = $c.getVariable<number[]>('visiblePages').last();

          return $c
            .querySelectorAll('.paged-track > .snap-center')
            .arrayFind($page =>
              $page
                .type<HTMLElement>()
                .get('offsetLeft')
                .equals(track.get('scrollLeft').run())
                .run(),
            )
            .ifNotReturn($c.number(0).run())
            .findAll('img[alt^="Page "]')
            .map($image => $image.getAttribute('alt').regex('^Page (\\d+)$', 1).number().run())
            .setVariable('visiblePages')
            .if(firstPage.greaterThan(lastPage.run()).run(), firstPage.run(), lastPage.run())
            .run();
        },
        total: $c => $c.querySelectorAll('.paged-track img[alt^="Page "]').length().run(),
      },
      {
        current: $c =>
          $c
            .querySelectorAll(
              $c
                .string('[data-chapter-col="')
                .concat($c.url().urlPart(5).run())
                .concat('"] > img')
                .run(),
            )
            .countAbove()
            .run(),
        total: $c =>
          $c
            .querySelectorAll(
              $c
                .string('[data-chapter-col="')
                .concat($c.url().urlPart(5).run())
                .concat('"] > img')
                .run(),
            )
            .length()
            .run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().matches('^https?://[^/]+/series/[^/?#]+/?(?:[?#].*)?$').run();
    },
    getTitle($c) {
      return $c.querySelector('main h1.font-black').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('main img[src*="/series/"]')
        .ifNotReturn()
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector('a[aria-label="View on MyAnimeList"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          anilistUrl: $c
            .querySelector('a[aria-label="View on AniList"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          kitsuUrl: $c
            .querySelector('a[aria-label="View on Kitsu"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          mangabakaId: $c
            .querySelector('a[aria-label="View on MangaBaka"]')
            .ifNotReturn()
            .getAttribute('href')
            .urlPart(4)
            .run(),
        })
        .run();
    },
    uiInjection($c) {
      return (
        $c
          .querySelectorAll('main > div')
          // The site renders separate desktop and mobile details layouts.
          .arrayFind($el => $el.getComputedStyle('display').equals('none').not().run())
          .ifNotReturn()
          .setVariable('detailsLayout')
          .coalesce(
            $c.getVariable<Element>('detailsLayout').find('.min-w-0.space-y-5').run(),
            $c.getVariable<Element>('detailsLayout').run(),
          )
          .uiPrepend()
          .run()
      );
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll(
          $c
            .string('main section a[href^="/series/')
            .concat($c.this('sync.getIdentifier').run())
            .concat('/"]')
            .run(),
        )
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.title().regex('^Chapter ([\\d.]+) · ', 1).equals($c.url().urlPart(5).run()).run(),
              $c
                .querySelector('a[aria-label="Series details"]')
                .ifNotReturn()
                .getAttribute('href')
                .urlAbsolute()
                .equals($c.this('sync.getOverviewUrl').run())
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges($c.this('list.elementsSelector').length().run(), $c.trigger().run())
        .run();
    },
  },
};
