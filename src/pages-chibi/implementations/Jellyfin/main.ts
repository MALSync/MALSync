import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import type { PageInterface } from '../../pageInterface';

export const Jellyfin: PageInterface = {
  name: 'Jellyfin',
  domain: 'https://jellyfin.org/',
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
              meta($c).get('Type').equals('Episode').run(),
              meta($c).get('Type').equals('Movie').run(),
            )
            .run(),
        )
        .run();
    },
    getTitle($c) {
      const title = meta($c).get('SeriesName') as ChibiGenerator<string>;
      const seasonIndex = meta($c).get('ParentIndexNumber');

      return meta($c)
        .get('Type')
        .equals('Movie')
        .ifThen($c => meta($c).get('Name').return().run())
        .if(
          seasonIndex.number().greaterThan(1).run(),
          title.concat(' ').concat('Season ').concat(seasonIndex.run()).run(),
          title.run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c
        .coalesceFn(
          meta($c).get('SeasonId').run(),
          meta($c).get('SeriesId').run(),
          meta($c).get('Id').run(),
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
      return meta($c).get('IndexNumber').run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return meta($c).get('Type').equals('Season').run();
    },
    getTitle($c) {
      const title = meta($c).get('SeriesName') as ChibiGenerator<string>;
      const seasonIndex = meta($c).get('IndexNumber');

      return $c
        .if(
          seasonIndex.number().greaterThan(1).run(),
          title.concat(' ').concat('Season ').concat(seasonIndex.run()).run(),
          title.run(),
        )
        .run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    getIdentifier($c) {
      return meta($c).get('Id').run();
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
      ($c.getVariable('metadata').get('Path') as ChibiGenerator<string>)
        .toLowerCase()
        .includes('anime')
        .run(),
      ($c.getVariable('metadata').get('GenreItems') as ChibiGenerator<{ Name: string }[]>)
        .arrayFind(genre =>
          (genre.get('Name') as ChibiGenerator<string>).toLowerCase().equals('anime').run(),
        )
        .boolean()
        .run(),
      ($c.getVariable('metadata').get('Tags') as ChibiGenerator<string[]>)
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

function meta($c: ChibiGenerator<unknown>) {
  return $c.getGlobalVariable('metadataGlobal');
}
