import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const Aniworld: PageInterface = {
  name: 'Aniworld',
  type: 'anime',
  domain: 'https://aniworld.to',
  languages: ['German'],
  urls: {
    match: ['*://aniworld.to/*'],
  },
  search: 'https://aniworld.to/search?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).equals('stream').run(),
          $c
            .url()
            .urlPart(7)
            .ifNotReturn($c.boolean(false).run())
            .matches('^(episode|film)-')
            .run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .if(
          $c.exec(isMovie).run(),
          $c.this('overview.getTitle').concat(' ').concat($c.exec(getMovieTitle).run()).run(),
          $c.this('overview.getTitle').run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c
        .if(
          $c.exec(isMovie).run(),
          $c
            .url()
            .urlPart(5)
            .concat('?m=')
            .concat($c.exec(getMovieTitle).split(' ').join('-').string().toLowerCase().run())
            .run(),
          $c.this('overview.getIdentifier').run(),
        )
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .url()
        .split('/')
        .slice(0, $c.if($c.exec(isMovie).run(), $c.number(6).run(), $c.number(7).run()).run())
        .join('/')
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(7).split('-').at(1).number().run();
    },
    getSeason($c) {
      return $c.this('overview.getSeason').run();
    },
    getRuleSet($c) {
      return $c.exec(getRuleSet).run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('div.hosterSiteDirectNav > ul:nth-of-type(2) a.active')
        .ifNotReturn()
        .parent()
        .next()
        .ifNotReturn()
        .find('a')
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
          $c.url().urlPart(4).equals('stream').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(7).boolean().not().run(),
          $c.exec(isMovie).not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('div.series-title > h1 > span').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).concat('?s=').concat($c.exec(getSeasonPart).run()).run();
    },
    getSeason($c) {
      return $c.exec(getSeason).run();
    },
    getRuleSet($c) {
      return $c.exec(getRuleSet).run();
    },
    getImage($c) {
      return $c
        .querySelector('.seriesCoverBox img')
        .ifNotReturn()
        .getAttribute('data-src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('div.hosterSiteDirectNav').ifNotReturn().uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div.hosterSiteDirectNav > ul:nth-of-type(2) > li > a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.text().number().run();
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

function isMovie($c: ChibiGenerator<unknown>) {
  return $c.url().urlPart(6).equals('filme');
}

function getMovieTitle($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('div.hosterSiteTitle > h2 > small.episodeEnglishTitle')
    .ifNotReturn()
    .text()
    .replaceRegex('\\[[A-Za-z\\0-9]+\\]', '', 'gm')
    .trim();
}

// Seasons are numbered like tvdb, movies keep the default
function getRuleSet($c: ChibiGenerator<unknown>) {
  return $c.exec(isMovie).not().ifNotReturn().ruleSet('tvdb');
}

// staffel-N in the url, the series page shows season 1
function getSeasonPart($c: ChibiGenerator<unknown>) {
  return $c
    .coalesce($c.fn($c.url().urlPart(6).ifNotReturn().run()).run(), $c.string('staffel-1').run())
    .string();
}

function getSeason($c: ChibiGenerator<unknown>) {
  return $c
    .exec(isMovie)
    .not()
    .ifNotReturn()
    .exec(getSeasonPart)
    .regex('^staffel-(\\d+)', 1)
    .ifNotReturn()
    .number();
}
