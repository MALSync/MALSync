import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const batoV2: PageInterface = {
  name: 'bato',
  database: 'bato',
  domain: ['https://bato.to'],
  languages: ['Many'],
  type: 'manga',
  urls: {
    match: [
      '*://bato.to/*',
      '*://bato.ac/*',
      '*://bato.bz/*',
      '*://bato.cc/*',
      '*://bato.cx/*',
      '*://bato.id/*',
      '*://bato.pw/*',
      '*://bato.sh/*',
      '*://bato.vc/*',
      '*://bato.day/*',
      '*://bato.red/*',
      '*://bato.run/*',
      '*://ato.to/*',
      '*://lto.to/*',
      '*://nto.to/*',
      '*://vto.to/*',
      '*://xto.to/*',
      '*://yto.to/*',
      '*://vba.to/*',
      '*://wba.to/*',
      '*://xba.to/*',
      '*://yba.to/*',
      '*://zba.to/*',
      '*://kuku.to/*',
      '*://okok.to/*',
      '*://ruru.to/*',
      '*://xdxd.to/*',
      '*://batoto.in/*',
      '*://batoto.tv/*',
      '*://batpub.com/*',
      '*://batread.com/*',
      '*://fto.to/*',
      '*://jto.to/*',
      '*://hto.to/*',
      '*://zbato.com/*',
      '*://zbato.net/*',
      '*://zbato.org/*',
      '*://readtoto.com/*',
      '*://readtoto.net/*',
      '*://readtoto.org/*',
      '*://batocomic.com/*',
      '*://batocomic.net/*',
      '*://batocomic.org/*',
      '*://batotoo.com/*',
      '*://batotwo.com/*',
      '*://comiko.net/*',
      '*://comiko.org/*',
      '*://battwo.com/*',
      '*://dto.to/*',
      '*://mto.to/*',
      '*://wto.to/*',
      '*://xbato.com/*',
      '*://xbato.net/*',
      '*://xbato.org/*',
      '*://mangatoto.com/*',
      '*://mangatoto.net/*',
      '*://mangatoto.org/*',
      '*://bato.si/*',
      '*://bato.ing/*',
    ],
  },
  search: 'https://bato.to/search?word={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('chapter').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h3.nav-title > a').text().ifNotReturn().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('h3.nav-title > a')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return getChapter(getChapterText($c)).run();
    },
    getVolume($c) {
      return getVolume(getChapterText($c)).run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('div.nav-next > a[href*="/chapter/"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        condition: '.item:nth-child(2)',
        current: {
          selector: '#viewer > .item',
          mode: 'countAbove',
        },
        total: {
          selector: '.page-num',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        condition: 'div[name="image-items"] > div > div[name="image-item"]:nth-child(2)',
        current: {
          selector: 'div[name="image-item"]',
          mode: 'countAbove',
        },
        total: {
          selector: 'div[name="image-item"] span.text-3xl',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        condition: 'div[name="image-item"]',
        current: {
          selector: 'div[name="image-item"] > div > span:nth-child(1)',
          mode: 'text',
          regex: '^\\d+',
        },
        total: {
          selector: 'div[name="image-item"] > div > span:nth-child(1)',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        current: {
          selector: '.page-num',
          mode: 'text',
          regex: '^\\d+',
        },
        total: {
          selector: '.page-num',
          mode: 'text',
          regex: '\\d+$',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('series').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h3.item-title > a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).ifNotReturn().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.detail-set .attr-main').uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div.episode-list > div.main > div.item').run();
    },
    elementUrl($c) {
      return $c.target().find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return getChapter($c.target().find('a > b').text().ifNotReturn()).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./styleV2.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .querySelector('pre')
        .text()
        .contains('404 Page')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};

function getChapterText($c: ChibiGenerator<any>) {
  return $c.querySelector('[property="og:title"]').getAttribute('content').regex('^[^-]+-(.*)$', 1);
}

export function getChapter($c: ChibiGenerator<string>) {
  return $c
    .regex('(ch|chapter|episode|ep\\.?|chap|chp|no\\.?)\\D?(\\d+)', 2)
    .ifNotReturn()
    .number();
}

export function getVolume($c: ChibiGenerator<string>) {
  return $c.regex('(vol\\.|volume)\\D?(\\d+)', 2).ifNotReturn().number();
}
