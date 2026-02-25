import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const allManga: PageInterface = {
  name: 'allManga',
  domain: 'https://allmanga.to',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://allmanga.to/*', '*://youtu-chan.com/*'],
  },
  search: 'https://allmanga.to/search-anime?cty=ALL&query={searchtermRaw}',
  computedType: $c => {
    return $c.querySelector('.breadcrumb-item a[href]').text().trim().toLowerCase().run();
  },
  // Url link is mess and cannot be use in as reference
  sync: {
    isSyncPage($c) {
      return $c.querySelectorAll('.breadcrumb-item').length().equals(3).run();
    },
    getTitle($c) {
      return $c
        .querySelectorAll('.breadcrumb-item a')
        .arrayFind($item =>
          $item.getAttribute('href').urlPart(4).matches($c.this('sync.getIdentifier').run()).run(),
        )
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return getUrl($c).urlPart(4).run();
    },
    getOverviewUrl($c) {
      return getUrl($c).replaceRegex('/([^/]+)$', '').urlAbsolute().run();
    },
    getImage($c) {
      return $c
        .coalesce(
          $c.querySelector('.card-body img').run(),
          $c.querySelector('.card-header img').run(),
        )
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.breadcrumb-item:last-child span')
        .text()
        .regex('(?:chapter|episode)\\s*(\\d+)', 1)
        .number()
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
      return $c.querySelectorAll('.breadcrumb-item').length().equals(2).run();
    },
    getTitle($c) {
      return $c.querySelector('.breadcrumb-item span').text().trim().run();
    },
    getIdentifier($c) {
      return $c.querySelector('#linkInput').getAttribute('value').urlPart(4).run();
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
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.breadcrumb-item').boolean().run()).trigger().run();
    },
  },
};

function getUrl($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('.breadcrumb-item .btn-hv-link')
    .arrayFind($item => $item.getAttribute('href').urlPart(4).boolean().run())
    .getAttribute('href');
}
