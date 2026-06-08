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

type CRMetadata = CREpisode;

type RequestData = {
  data: [CREpisode];
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
      return meta($c).get('episode_metadata').get('season_id').run();
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
    uiInjection($c) {
      return $c.querySelector('.erc-current-media-info').uiPrepend().run();
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
        .run();
    },
  },
};

function checkRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable<string>('requestUrl')
    .matches('/(cms/objects)/')
    .ifThen($c => $c.exec(checkMetadataRequest).run());
}

function checkMetadataRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('requestUrl')
    .log('url')
    .getVariable<{ data: RequestData }>('request')
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
