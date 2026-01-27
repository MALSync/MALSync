import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const allManga: PageInterface = {
  name: 'allManga',
  domain: 'https://allmanga.to',
  languages: ['English'],
  type: 'manga',
  urls: {
    // Url here is mess and cannot be use in coding
    match: ['*://allmanga.to/*', '*://youtu-chan.com/*'],
  },
  search: 'https://allmanga.to/search-manga?cty=ALL&query={searchtermRaw}',
  computedType: $c => {
    return $c.querySelector('breadcrumb-item a').text().toLowerCase().run();
  },
  sync: {
    isSyncPage($c) {
      return getJsonData($c).length().equals(3).run();
    },
    getTitle($c) {
      return $c.querySelector('.h4 a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.h4 a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getImage($c) {
      return $c.querySelector('.card-body img').getAttribute('src').ifNotReturn().run();
    },
    getEpisode($c) {
      return getJsonData($c).get('2').get('name').string().regex('(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.container .btn[aria-label*="Next"]:not(.disabled)')
        .ifNotReturn()
        .url()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('#pictureViewer img').countAbove().run(),
        total: $c => $c.querySelectorAll('#pictureViewer img').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return getJsonData($c).length().equals(2).run();
    },
    getTitle($c) {
      return $c.querySelector('.breadcrumb-item span').text().trim().run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('1').get('item').string().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('#collapsed-informations .row').uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.list-group .simple-box').run();
    },
    elementEp($c) {
      return $c.find('div').text().regex('(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectChanges(getJsonData($c).run(), $c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.h4 a').boolean().run()).trigger().run();
    },
  },
};

// I don't know if it is a good idea to use json or query selector.
function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('[type="application/ld+json"]')
    .ifNotReturn()
    .text()
    .jsonParse()
    .get('@graph')
    .get('2')
    .get('itemListElement')
    .type<HTMLElement[]>();
}
