import { PageInterface } from '../../pageInterface';

//
// implementation made by apix <@apix0n>
//

export const BigSolo: PageInterface = {
  name: 'BigSolo',
  domain: 'https://bigsolo.org',
  languages: ['French'],
  type: 'manga',
  urls: {
    match: ['*://bigsolo.org/*'],
  },
  search: 'https://bigsolo.org/series?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.querySelector('#readerpage').boolean().run();
    },
    getTitle($c) {
      return $c.querySelector('#japanese-title').getAttribute('value').trim().ifNotReturn().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 4).join('/').run();
    },
    getVolume($c) {
      return $c.querySelector('#current-volume').getAttribute('value').trim().number().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).ifNotReturn().number().run();
    },
    nextEpUrl($c) {
      const nextChapterId = $c
        .querySelector('.chapter-list a:has(+ a.active)')
        .getAttribute('data-chapter-id')
        .trim();
      return $c
        .if(
          nextChapterId.boolean().run(),
          $c.this('sync.getOverviewUrl').concat('/').concat(nextChapterId.run()).run(),
          $c.boolean(false).run(),
        )
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '#live-page-counter',
          mode: 'text',
          regex: '\\d+',
        },
        total: {
          selector: '#live-page-counter',
          mode: 'text',
          regex: '\\d+$',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.querySelector('#seriesdetailpage').boolean().run();
    },
    getTitle($c) {
      return $c.querySelector('.detail-jp-title').text().trim().ifNotReturn().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getImage($c) {
      return $c.querySelector('img.detail-cover').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.series-chapters-list').uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-card-list-item').run();
    },
    elementEp($c) {
      return $c.getAttribute('data-chapter-id').ifNotReturn().number().run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .querySelector('section.series-chapters-list > .chapters-list-container > :first-child')
            .boolean()
            .run(),
        )
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('aside#info-sidebar').boolean().run())
        .trigger()
        .run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
  },
};
