import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import type { PageInterface } from '../../pageInterface';

type CommonMetadata = {
  Id: string;
  Path: string;
  GenreItems: { Name: string }[];
  Tags: string[];
};

type EpisodeMetadata = {
  Type: 'Episode';
  SeasonId: string;
  SeasonName: string;
  SeriesId: string;
  SeriesName: string;
  IndexNumber: number;
  ParentIndexNumber: number;
} & CommonMetadata;

type SeasonMetadata = {
  Type: 'Season';
  SeriesId: string;
  SeriesName: string;
  IndexNumber: number;
} & CommonMetadata;

type MovieMetadata = {
  Type: 'Movie';
  Name: string;
} & CommonMetadata;

type Metadata = EpisodeMetadata | SeasonMetadata | MovieMetadata;

type OverviewMeta = SeasonMetadata;

type SyncMeta = EpisodeMetadata | MovieMetadata;

export const Jellyfin: PageInterface = {
  name: 'Jellyfin',
  domain: 'https://jellyfin.org',
  languages: ['Many'],
  type: 'anime',
  minimumVersion: '0.12.3',
  urls: {
    match: [],
  },
  features: {
    requestProxy: true,
    customDomains: true,
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.querySelector('video').boolean().run(),
          $c
            .or(
              meta<SyncMeta>($c).get('Type').equals('Episode').run(),
              meta<SyncMeta>($c).get('Type').equals('Movie').run(),
            )
            .run(),
        )
        .run();
    },
    getTitle($c) {
      const title = meta<EpisodeMetadata>($c).get('SeriesName');
      const seasonIndex = meta<EpisodeMetadata>($c).get('ParentIndexNumber');

      return meta<SyncMeta>($c)
        .get('Type')
        .equals('Movie')
        .ifThen($c => meta<MovieMetadata>($c).get('Name').return().run())
        .if(
          seasonIndex.number().greaterThan(1).run(),
          title.concat(' ').concat('Season ').concat(seasonIndex.string().run()).run(),
          title.run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c
        .coalesceFn(
          meta<EpisodeMetadata>($c).get('SeasonId').run(),
          meta<EpisodeMetadata>($c).get('SeriesId').run(),
          meta<SyncMeta>($c).get('Id').run(),
        )
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .url()
        .replaceRegex(
          '#[^#]+$',
          $c.string('#details?id=').concat($c.this('sync.getIdentifier').run()).run(),
        )
        .run();
    },
    getEpisode($c) {
      return meta<EpisodeMetadata>(
        meta<SyncMeta>($c)
          .get('Type')
          .equals('Movie')
          .ifThen($c => $c.number(1).return().run()),
      )
        .get('IndexNumber')
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return meta<OverviewMeta>($c).get('Type').equals('Season').run();
    },
    getTitle($c) {
      const title = meta<OverviewMeta>($c).get('SeriesName');
      const seasonIndex = meta<OverviewMeta>($c).get('IndexNumber');

      return $c
        .if(
          seasonIndex.number().greaterThan(1).run(),
          title.concat(' ').concat('Season ').concat(seasonIndex.string().run()).run(),
          title.run(),
        )
        .run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    getIdentifier($c) {
      return meta<OverviewMeta>($c).get('Id').run();
    },
    uiInjection($c) {
      return $c.querySelector('.page:not(.hide) .detailSectionContent').uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.detailSection .listItem[data-type="Episode"]').run();
    },
    elementEp($c) {
      return $c.find('.listItemBodyText').text().regex('^\\d+').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($c =>
          checkRequest($c.setVariable('request').get('url').setVariable('requestUrl')).run(),
        )
        .run();
    },
  },
};

function checkRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable<string>('requestUrl')
    .matches('/Items/[^/]+(\\?|$)')
    .ifThen($c => checkMetadataRequest($c));
}

function checkMetadataRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('request')
    .get('data')
    .setVariable('metadata')
    .debounce(500)
    .log($c.getVariable('metadata').get('Type').run())
    .get('Type')
    .equals('Season')
    .ifThen($c => handleSeason($c).return().run())
    .getVariable('metadata')
    .get('Type')
    .equals('Episode')
    .ifThen($c => handleEpisode($c).return().run())
    .getVariable('metadata')
    .get('Type')
    .equals('Movie')
    .ifThen($c => handleMovie($c).return().run())
    .run();
}

function isAnime($c: ChibiGenerator<unknown>) {
  return $c
    .or(
      $c.getVariable<Metadata>('metadata').get('Path').toLowerCase().includes('anime').run(),
      $c
        .getVariable<Metadata>('metadata')
        .get('GenreItems')
        .arrayFind(genre =>
          (genre.get('Name') as ChibiGenerator<string>).toLowerCase().equals('anime').run(),
        )
        .boolean()
        .run(),
      $c
        .getVariable<Metadata>('metadata')
        .get('Tags')
        .arrayFind(tag => tag.toLowerCase().equals('anime').run())
        .boolean()
        .run(),
    )
    .log('isAnime');
}

function handleSeason($c: ChibiGenerator<unknown>) {
  return isAnime($c).ifThen($c =>
    $c.getVariable('metadata').setGlobalVariable('metadataGlobal').trigger().run(),
  );
}

function handleEpisode($c: ChibiGenerator<unknown>) {
  return isAnime($c).ifThen($c =>
    $c.getVariable('metadata').setGlobalVariable('metadataGlobal').trigger().run(),
  );
}

function handleMovie($c: ChibiGenerator<unknown>) {
  return isAnime($c).ifThen($c =>
    $c.getVariable('metadata').setGlobalVariable('metadataGlobal').trigger().run(),
  );
}

function meta<P>($c: ChibiGenerator<unknown>) {
  return $c.getGlobalVariable<P>('metadataGlobal');
}
