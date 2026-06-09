import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

type CREpisode = {
  type: 'episode';
  id: string;
  title: string;
  description: string;
  slug_title: string;
  episode_metadata: {
    episode_number: number;
    season_display_number: string;
    season_id: string;
    season_number: number;
    season_sequence_number: number;
    season_slug_title: string;
    season_title: string;
    sequence_number: number;
    series_id: string;
    series_slug_title: string;
    series_title: string;
  };
};

type CRSeason = {
  id: string;
  title: string;
  description: string;
  season_display_number?: string;
  season_number: number;
  season_sequence_number: number;
  series_id: string;
  slug_title: string;
  number_of_episodes: number;
};
type CRMetadata = CREpisode;

type EpisodeRequestData = {
  data: [CREpisode];
  meta: {};
  total: number;
};

type SeasonRequestData = {
  data: CRSeason[];
  meta: {};
  total: number;
};

function meta<P = CRMetadata>($c: ChibiGenerator<unknown>) {
  return $c.getGlobalVariable<P>('metadataGlobal');
}

export const Crunchyroll: PageInterface = {
  name: 'Crunchyroll',
  domain: ['https://www.crunchyroll.com'],
  languages: [
    'English',
    'Spanish',
    'Portuguese',
    'French',
    'German',
    'Arabic',
    'Italian',
    'Russian',
  ],
  type: 'anime',
  urls: {
    match: ['*://*.crunchyroll.com/*'],
  },
  features: {
    requestProxy: true,
  },
  search: 'https://www.crunchyroll.com/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .or($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(4).equals('watch').run())
        .run();
    },
    getTitle($c) {
      const seasonSuffix = $c
        .if(
          getSeasonNumber($c).number().greaterThan(1).run(),
          $c.string(' Season ').concat(getSeasonNumber($c).string().run()).run(),
          $c.string('').run(),
        )
        .run();

      return getSeriesName($c)
        .ifNotReturn()
        .string()
        .replaceRegex('\\([^\\)]+\\)', '')
        .trim()
        .concat(seasonSuffix)
        .run();
    },
    getIdentifier($c) {
      return $c
        .setVariable('identifier.seriesId', meta($c).get('episode_metadata').get('series_id').run())
        .setVariable(
          'identifier.seasonSlug',
          meta($c).get('episode_metadata').get('season_slug_title').run(),
        )
        .exec(getIdentifier)
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/series/')
        .concat(meta($c).get('episode_metadata').get('series_id').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return meta($c).get('episode_metadata').get('episode_number').run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('[data-t="next-episode"] a')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .or($c.url().urlPart(3).equals('series').run(), $c.url().urlPart(4).equals('series').run())
        .run();
    },
    getTitle($c) {
      return $c.exec(getActiveSeasonTitle).run();
    },
    getIdentifier($c) {
      return $c
        .setVariable('activeTitle', $c.exec(getActiveSeasonTitle).run())
        .getGlobalVariable<CRSeason[]>('seasonsGlobal')
        .arrayFind(season =>
          season.get('title').trim().equals($c.getVariable('activeTitle').run()).run(),
        )
        .ifNotReturn()
        .setVariable('foundSeason')
        .setVariable('identifier.seriesId', $c.getVariable('foundSeason').get('series_id').run())
        .setVariable('identifier.seasonSlug', $c.getVariable('foundSeason').get('slug_title').run())
        .exec(getIdentifier)
        .run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    uiInjection($c) {
      return $c.querySelector('.top-controls').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episode-list .card').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .find('[class*="playable-card__title-link"]')
        .ifNotReturn()
        .text()
        .regex('E(\\d+)', 1)
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($c =>
          $c.setVariable('request').get('url').setVariable('requestUrl').exec(checkRequest).run(),
        )
        .detectChanges($c.exec(getActiveSeasonTitle).run(), $c.trigger().run())
        .run();
    },
  },
};

function checkRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable<string>('requestUrl')
    .matches('(/cms/objects/)')
    .ifThen($c => $c.exec(checkMetadataRequest).run())
    .getVariable<string>('requestUrl')
    .matches('(/cms/series/[^/]+/seasons)')
    .ifThen($c => $c.exec(handleSeasonsRequest).run());
}

function checkMetadataRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('requestUrl')
    .log('url')
    .getVariable<{ data: EpisodeRequestData }>('request')
    .get('data')
    .get('data')
    .log()
    .get(0)
    .setVariable('metadata')
    .log($c.getVariable('metadata').get('type').run())
    .getVariable<CRMetadata>('metadata')
    .get('type')
    .equals('episode')
    .ifThen($c => $c.exec(handleEpisode).return().run());
}

function handleSeasonsRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('requestUrl')
    .log('url')
    .getVariable<{ data: SeasonRequestData }>('request')
    .get('data')
    .get('data')
    .log('seasons')
    .setGlobalVariable('seasonsGlobal');
}

function handleEpisode($c: ChibiGenerator<unknown>) {
  return $c.debounce(500).getVariable('metadata').setGlobalVariable('metadataGlobal').trigger();
}

function getSeasonNumber($c: ChibiGenerator<unknown>) {
  return meta($c).get('episode_metadata').get('season_number');
}

function getSeasonName($c: ChibiGenerator<unknown>) {
  return meta($c).get('episode_metadata').get('season_title');
}

function getSeriesName($c: ChibiGenerator<unknown>) {
  return meta($c).get('episode_metadata').get('series_title');
}

function getActiveSeasonTitle($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('.season-info [class*="select-trigger__title-truncated-text--"]')
    .ifNotReturn()
    .text();
}

function getIdentifier($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable<string>('identifier.seriesId')
    .concat('|')
    .concat($c.getVariable<string>('identifier.seasonSlug').run());
}
