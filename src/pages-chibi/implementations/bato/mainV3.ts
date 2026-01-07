import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';
import { getChapter, getVolume } from './mainV2';

export const batoV3: PageInterface = {
  name: 'bato',
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
        .and(
          $c.url().urlPart(3).equals('title').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('div.comic-detail > h3 > a').text().ifNotReturn().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('div.comic-detail > h3 > a')
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
        .querySelector('a.btn:nth-child(6)[href*="/title/"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('title').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h3.text-lg > a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).ifNotReturn().split('-').first().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('main > *').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div.scrollable-panel > div.group > astro-slot > div').run();
    },
    elementUrl($c) {
      return $c.target().find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return getChapter($c.target().find('a').text().ifNotReturn()).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./styleV3.less?raw').toString()).run();
    },
    ready($c) {
      return $c.string('Defined in V2').log().run();
    },
  },
};

function getChapterText($c: ChibiGenerator<any>) {
  return $c.querySelector('.link-primary[href*="/title/"]').text().ifNotReturn();
}
