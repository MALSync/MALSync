import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

type CREpisode = {
  type: 'episode';
  id: string;
  title: string;
  description: string;
  slug_title: string;
  episode_metadata: {
    episode: string;
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
      return $c
        .setVariable('seriesTitle', meta($c).get('episode_metadata').get('series_title').run())
        .setVariable('seriesSlug', meta($c).get('episode_metadata').get('series_slug_title').run())
        .setVariable('seasonTitle', meta($c).get('episode_metadata').get('season_title').run())
        .setVariable('seasonNumber', meta($c).get('episode_metadata').get('season_number').run())
        .setVariable('season', $c.this('sync.getSeason').run())
        .exec(getTitle)
        .ifNotReturn()
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
      // Specials (OVA5, SP, 13.5, ...) still have an episode_number. Episode 0 does not sync
      return $c
        .if(
          $c.exec(isSpecialEpisode).run(),
          $c.number(0).run(),
          meta($c).get('episode_metadata').get('episode_number').run(),
        )
        .run();
    },
    getSeason($c) {
      return $c.exec(setSyncSeasonVariables).exec(getSeason).run();
    },
    getRuleSet($c) {
      return $c
        .exec(setSyncSeasonVariables)
        .this('sync.getEpisode')
        .number()
        .calculate('-', meta($c).get('episode_metadata').get('sequence_number').run())
        .log('Episode difference')
        .greaterThan(10)
        .setVariable('isAbsolute')
        .exec(getRuleSet)
        .run();
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
      return $c
        .setVariable('activeTitle', $c.exec(getActiveSeasonTitle).run())
        .exec(getActiveSeason)
        .setVariable('seriesTitle', $c.querySelector('h1').text().trim().run())
        .setVariable(
          'seriesSlug',
          $c
            .querySelector('[rel="alternate"][hreflang="en"]')
            .getAttribute('href')
            .urlPart(5)
            .run(),
        )
        .setVariable('seasonTitle', $c.getVariable('foundSeason').get('title').run())
        .setVariable('seasonNumber', $c.getVariable('foundSeason').get('season_number').run())
        .setVariable('season', $c.this('overview.getSeason').run())
        .exec(getTitle)
        .ifNotReturn()
        .run();
    },
    getIdentifier($c) {
      return $c
        .setVariable('activeTitle', $c.exec(getActiveSeasonTitle).run())
        .exec(getActiveSeason)
        .setVariable('identifier.seriesId', $c.getVariable('foundSeason').get('series_id').run())
        .setVariable('identifier.seasonSlug', $c.getVariable('foundSeason').get('slug_title').run())
        .exec(getIdentifier)
        .run();
    },
    getSeason($c) {
      return $c.exec(setOverviewSeasonVariables).exec(getSeason).run();
    },
    getRuleSet($c) {
      return $c.exec(setOverviewSeasonVariables).exec(getRuleSet).run();
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

function getActiveSeasonTitle($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector(
      '.season-info [class*="select-trigger__title-truncated-text--"], .seasons-select [seasontitle]',
    )
    .ifNotReturn()
    .text();
}

function getActiveSeason($c: ChibiGenerator<unknown>) {
  return $c
    .getGlobalVariable<CRSeason[]>('seasonsGlobal')
    .arrayFind(season =>
      season
        .get('title')
        .trim()
        .equals(
          $c
            .getVariable<string>('activeTitle')
            // Seasons with a season_display_number are shown as "S1: Season 1"
            .replaceRegex('^S(\\d+(\\.\\d+)?|P): ', '')
            .run(),
        )
        .run(),
    )
    .ifNotReturn()
    .setVariable('foundSeason');
}

function getIdentifier($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable<string>('identifier.seriesId')
    .concat('|')
    .concat($c.getVariable<string>('identifier.seasonSlug').run());
}

function getTitle($c: ChibiGenerator<unknown>) {
  return $c
    .if(
      $c.getVariable<number>('season').greaterThan(0).run(),
      $c.getVariable<string>('seriesTitle').run(),
      $c
        .if(
          $c.getVariable<number>('seasonNumber').greaterThan(1).run(),
          $c
            .getVariable<string>('seriesSlug')
            .replaceAll('-', ' ')
            .concat(' ')
            .concat(
              $c
                .getVariable<string>('seasonTitle')
                .replace($c.getVariable<string>('seriesTitle').trim().run(), '')
                .trim()
                .run(),
            )
            .run(),
          $c.getVariable<string>('seriesSlug').replaceAll('-', ' ').run(),
        )
        .run(),
    )
    .replaceRegex('\\s+', ' ')
    .trim();
}

function setSyncSeasonVariables($c: ChibiGenerator<unknown>) {
  return $c
    .setVariable('season.slug', meta($c).get('episode_metadata').get('season_slug_title').run())
    .setVariable(
      'season.seriesSlug',
      meta($c).get('episode_metadata').get('series_slug_title').run(),
    )
    .setVariable('season.number', meta($c).get('episode_metadata').get('season_number').run())
    .setVariable(
      'season.displayNumber',
      meta($c).get('episode_metadata').get('season_display_number').run(),
    )
    .setVariable('season.specialEpisode', $c.exec(isSpecialEpisode).run());
}

function setOverviewSeasonVariables($c: ChibiGenerator<unknown>) {
  return $c
    .setVariable('activeTitle', $c.exec(getActiveSeasonTitle).run())
    .exec(getActiveSeason)
    .setVariable('season.slug', $c.getVariable('foundSeason').get('slug_title').run())
    .setVariable(
      'season.seriesSlug',
      $c.querySelector('[rel="alternate"][hreflang="en"]').getAttribute('href').urlPart(5).run(),
    )
    .setVariable('season.number', $c.getVariable('foundSeason').get('season_number').run())
    .setVariable(
      'season.displayNumber',
      $c.getVariable('foundSeason').get('season_display_number').run(),
    )
    .setVariable('season.specialEpisode', $c.boolean(false).run());
}

function isSpecialEpisode($c: ChibiGenerator<unknown>) {
  return meta($c).get('episode_metadata').get('episode').string().matches('^[1-9]\\d*$').not();
}

// OVAs, movies, extras, ... and specials inside a regular season
function isSpecialSeason($c: ChibiGenerator<unknown>) {
  return $c.or(
    $c.getVariable<boolean>('season.specialEpisode').run(),
    $c.getVariable<number>('season.number').equals(0).run(),
    $c.getVariable<number>('season.number').greaterThanOrEqual(100).run(),
    $c
      .getVariable<string>('season.slug')
      .matches(
        '(^|-)(ovas?|oads?|onas?|specials?|extras?|movies?|film|recaps?|shorts?|picture-drama|bonus)(-|$)',
      )
      .run(),
  );
}

// season_number counts every entry of the season list (movies, specials, region locked seasons),
// so it is often too high. season_display_number is right when set (about a quarter of the seasons),
// otherwise the language independent slug mostly has the real number.
// Without a number no season is returned (NaN) and the rules infer it from the matched entry.
function getSeason($c: ChibiGenerator<unknown>) {
  const seasonPattern = '(?:^|-)season-?([1-9]|[12]\\d|30)(?=-|$)';
  return (
    $c
      .getVariable<string>('season.slug')
      .replaceRegex('-+', '-')
      // <series>2, <series>-2-nomad, <series>-r2
      .replaceRegex(
        $c
          .string('^')
          .concat($c.getVariable<string>('season.seriesSlug').replaceRegex('-+', '-').run())
          .concat('-?r?(\\d{1,2})(?=-|$)')
          .run(),
        'season-$1',
      )
      .replaceRegex('-ii(?=-|$)', '-season-2')
      .replaceRegex('-iii(?=-|$)', '-season-3')
      .replaceRegex('-iv(?=-|$)', '-season-4')
      .replaceRegex('-vi(?=-|$)', '-season-6')
      .replaceRegex('(^|-)(\\d+)(?:st|nd|rd|th)-(?:season|stage|attack|cour)(?=-|$)', '$1season-$2')
      .replaceRegex('(^|-)second-season(?=-|$)', '$1season-2')
      .replaceRegex('(^|-)third-season(?=-|$)', '$1season-3')
      .replaceRegex('(^|-)fourth-season(?=-|$)', '$1season-4')
      .replaceRegex('(^|-)fifth-season(?=-|$)', '$1season-5')
      .setVariable('season.parsedSlug')
      .if(
        $c.exec(isSpecialSeason).run(),
        $c.string('none').number().run(),
        $c
          .if(
            $c
              .getVariable<string>('season.displayNumber')
              .string()
              .matches('^([1-9]|[12]\\d|30)$')
              .run(),
            $c.getVariable<string>('season.displayNumber').number().run(),
            $c
              .if(
                $c.getVariable<string>('season.parsedSlug').matches(seasonPattern).run(),
                $c.getVariable<string>('season.parsedSlug').regex(seasonPattern, 1).number().run(),
                // The first entry of the list is season 1 whatever its slug
                $c
                  .if(
                    $c.getVariable<number>('season.number').equals(1).run(),
                    $c.number(1).run(),
                    $c.string('none').number().run(),
                  )
                  .run(),
              )
              .run(),
          )
          .run(),
      )
  );
}

function getRuleSet($c: ChibiGenerator<unknown>) {
  return $c.if(
    $c.exec(isSpecialSeason).run(),
    $c.ruleSet('off').run(),
    $c
      .if(
        $c.getVariable<boolean>('isAbsolute').run(),
        $c.ruleSet('absolute').run(),
        $c.ruleSet('cour').run(),
      )
      .run(),
  );
}
