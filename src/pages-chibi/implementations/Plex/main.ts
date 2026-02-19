import type { ChibiGenerator, ChibiJson } from '../../../chibiScript/ChibiGenerator';
import type { PageInterface } from '../../pageInterface';

const syncSelector = '[class*="MetadataPosterTitle-isSecondary"] [data-testid="metadataTitleLink"]';

export const Plex: PageInterface = {
  name: 'Plex',
  domain: 'http://app.plex.tv/',
  languages: ['Many'],
  type: 'anime',
  minimumVersion: '0.12.3',
  urls: {
    match: ['*://app.plex.tv/*'],
  },
  features: {
    requestProxy: true,
    customDomains: true,
  },
  search: 'https://app.plex.tv/desktop/#!/search?pivot=top&query={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return isPlayerOpen($c).run();
    },
    getTitle($c) {
      const parentTitle = getPlayerMeta($c).get('parentTitle') as ChibiGenerator<string>;
      const grandparentTitle = getPlayerMeta($c).get('grandparentTitle') as ChibiGenerator<string>;

      return $c
        .if(
          grandparentTitle.boolean().run(),
          grandparentTitle.concat(' ').concat(parentTitle.run()).run(),
          parentTitle.run(),
        )
        .run();
    },
    getIdentifier($c) {
      return getPlayerMeta($c).get('parentRatingKey').run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/title/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return getPlayerMeta($c).get('index').ifNotReturn($c.number(1).run()).number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return isPlayerOpen($c).not().run();
    },
    getTitle($c) {
      const title = meta($c).get('title');
      const parentTitle = meta($c).get('parentTitle') as ChibiGenerator<string>;
      const grandparentTitle = meta($c).get('grandparentTitle') as ChibiGenerator<string>;
      return typeHandling(
        $c,
        $c
          .if(
            parentTitle.boolean().run(),
            parentTitle.concat(' ').concat(title.run()).run(),
            title.run(),
          )
          .run(),
        $c
          .if(
            grandparentTitle.boolean().run(),
            grandparentTitle.concat(' ').concat(parentTitle.run()).run(),
            parentTitle.run(),
          )
          .run(),
      );
    },
    getIdentifier($c) {
      return typeHandling(
        $c,
        meta($c).get('ratingKey').run(),
        meta($c).get('parentRatingKey').run(),
      );
    },
    getImage($c) {
      return typeHandling(
        $c,
        (meta($c).get('thumb') as ChibiGenerator<string>).ifNotReturn().urlAbsolute().run(),
        (meta($c).get('parentThumb') as ChibiGenerator<string>).ifNotReturn().urlAbsolute().run(),
      );
    },
    uiInjection($c) {
      return $c.querySelector('[data-testid="metadata-children"]').uiBefore().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($c =>
          checkRequest(
            $c
              .setVariable('request')
              .get('url') /* .log('url') */
              .setVariable('requestUrl'),
          ).run(),
        )
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.main.mobile').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

function checkRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable<string>('requestUrl')
    .matches('/library/metadata/\\d+(/grandchildren)?(\\?|$)')
    .ifThen($c => checkMetadataRequest($c));
}

function checkMetadataRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('request')
    .get('data')
    .get('MediaContainer')
    .get('Metadata')
    .get(0 as unknown as string)
    .setVariable('metadata')
    .log($c.getVariable('metadata').get('type').run())
    .get('type')
    .equals('show')
    .ifThen($c => handleShow($c).return().run())
    .getVariable('metadata')
    .get('type')
    .equals('season')
    .ifThen($c => handleSeason($c).return().run())
    .getVariable('metadata')
    .get('type')
    .equals('episode')
    .ifThen($c =>
      $c
        .if(
          $c
            .getVariable<string>('requestUrl')
            .matches('/library/metadata/\\d+/grandchildren(\\?|$)')
            .run(),
          handleGrandEpisode($c).string('').log('Grand Episode').run(),
          handleEpisode($c).run(),
        )
        .return()
        .run(),
    )
    .run();
}

function isAnime($c: ChibiGenerator<unknown>) {
  return ($c.getVariable('metadata').get('librarySectionTitle') as ChibiGenerator<string>)
    .matches('(anime|asian)')
    .log('isAnime');
}

function handleShow($c: ChibiGenerator<unknown>) {
  return isAnime($c).ifThen($c =>
    $c
      .setVariable(
        $c.getVariable('metadata').get('ratingKey').run(),
        $c.getVariable('metadata').run(),
      )
      .run(),
  );
}

function handleSeason($c: ChibiGenerator<unknown>) {
  return isAnime($c).ifThen($c =>
    triggerIfPlayerIsClosed($c.getVariable('metadata').setGlobalVariable('metadataGlobal')).run(),
  );
}

function handleEpisode($c: ChibiGenerator<unknown>) {
  return isAnime($c).ifThen($c =>
    $c
      .setGlobalVariable(
        $c.getVariable('metadata').get('ratingKey').run(),
        $c.getVariable('metadata').run(),
      )
      .trigger()
      .run(),
  );
}

function handleGrandEpisode($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('metadata')
    .get('skipParent')
    .ifThen($c =>
      $c
        .getVariable($c.getVariable('metadata').get('grandparentRatingKey').run())
        .ifThen($c =>
          triggerIfPlayerIsClosed(
            $c
              .string('')
              .log('Single Season')
              .getVariable('metadata')
              .setGlobalVariable('metadataGlobal'),
          ).run(),
        )
        .run(),
    );
}

function meta($c: ChibiGenerator<unknown>) {
  return $c.getGlobalVariable('metadataGlobal');
}

function typeHandling($c, $season: ChibiJson<unknown>, $episode: ChibiJson<unknown>) {
  return $c
    .if(meta($c).get('type').equals('season').run(), $season, $episode)
    .run() as ChibiJson<string>;
}

function isPlayerOpen($c: ChibiGenerator<unknown>) {
  return $c.querySelector(syncSelector).boolean();
}

function getPlayerMeta($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector(syncSelector)
    .getAttribute('href')
    .regex('%2Flibrary%2Fmetadata%2F(\\d+)', 1)
    .setVariable('playerMetadataId')
    .log('Player Metadata ID')
    .getGlobalVariable($c.getVariable('playerMetadataId').run())
    .log('Player Metadata');
}

function triggerIfPlayerIsClosed($c: ChibiGenerator<unknown>) {
  return isPlayerOpen($c)
    .not()
    .ifThen($c => $c.trigger().run());
}
