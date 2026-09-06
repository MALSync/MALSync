import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const BSTO: PageInterface = {
  name: 'bs.to',
  type: 'anime',
  domain: 'https://bs.cine.to',
  languages: ['German'],
  urls: {
    match: [
      '*://bs.cine.to/*',
      '*://burningseries.ac/*',
      '*://burningseries.cx/*',
      '*://board.cine.to/*',
    ],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('serie').run(),
          $c.url().urlPart(7).boolean().run(),
          $c.exec(isAnime).run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.url().this('overview.getTitle').run();
    },
    getIdentifier($c) {
      return $c.url().this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c.querySelector('.episode .active > a').ifNotReturn().text().number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector(
          $c
            .string('.e')
            .concat($c.url().this('sync.getEpisode').calculate('+', 1).string().run())
            .concat(' > a')
            .run(),
        )
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('serie').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.exec(isAnime).run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h2')
        .ifNotReturn()
        .getBaseText()
        .split('|')
        .first()
        .trim()
        .concat($c.string(' ').concat($c.exec(getSeason).run()).run())
        .run();
    },
    getIdentifier($c) {
      return $c
        .url()
        .urlPart(4)
        .concat($c.string('?s=').concat($c.exec(getSeason).run()).run())
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.selectors').ifNotReturn().uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('table.episodes tr, div.episode li[class^="e"]').run();
    },
    elementUrl($c) {
      return $c.find('a').ifNotReturn().getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('a').ifNotReturn().text().number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
  },
};

function isAnime($c: ChibiGenerator<unknown>) {
  return $c.and(
    $c.url().urlPart(5).equals('0').not().run(),
    $c
      .fn(
        $c
          .querySelectorAll('.infos span')
          .arrayFind($item => $item.text().string().includes('Genres').run())
          .ifNotReturn($c.boolean(false).run())
          .next()
          .ifNotReturn($c.boolean(false).run())
          .text()
          .string()
          .includes('Anime')
          .run(),
      )
      .boolean()
      .run(),
  );
}

function getSeason($c: ChibiGenerator<unknown>) {
  return $c.coalesce($c.fn($c.url().urlPart(5).ifNotReturn().run()).run(), $c.string('1').run());
}
