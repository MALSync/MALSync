import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

const genres = [
  '2797624',
  '7424',
  '67614',
  '2653',
  '587',
  '625',
  '79307',
  '9302',
  '79488',
  '452',
  '79448',
  '11146',
  '79440',
  '3063',
  '79543',
  '79427',
  '10695',
  '2729',
  '79329',
  '79572',
  '64256',
  '2951909',
  '6721',
  '2867325',
  '1522234',
  '1623841',
  '81216565',
  '3073', // anime from the 1970s
  '3095', // anime from the 1980s
];

type NetflixEpisodeNode = { id: number; seq: number; title: string };

type NetflixSeasonNode = {
  id: string;
  title: string;
  seq: number;
  episodes?: NetflixEpisodeNode[];
};

type NetflixShow = {
  __typename: 'Show';
  videoId: number;
  genreTags: {
    edges: { node: { genreId: number; name: string } }[];
  };
  seasons?: {
    edges: { node: NetflixSeasonNode }[];
  };
};

type NetflixGraphqlSeasons = {
  data: {
    data: {
      unifiedEntities: NetflixShow[];
    };
  };
};

type NetflixVideoShow = {
  type: 'show';
  title: string;
  id: number;
  seasons: NetflixSeasonNode[];
};

type NetflixRequestResponse = {
  data: {
    video: NetflixVideoShow;
  };
};

export const Netflix: PageInterface = {
  name: 'Netflix',
  domain: 'https://www.netflix.com',
  database: 'Netflix',
  languages: ['Many'],
  type: 'anime',
  minimumVersion: '0.12.6',
  urls: {
    match: ['*://www.netflix.com/*'],
  },
  features: {
    requestProxy: true,
  },
  search: 'https://www.netflix.com/search?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('watch').run(),
          $c
            .url()
            .urlPart(4)
            .string()
            .equals($c.getGlobalVariable('meta.episode').get('id').string().run())
            .run(),
        )
        .run();
    },
    getTitle($c) {
      const title = $c.getGlobalVariable<NetflixSeasonNode>('meta.show').get('title');

      return $c
        .setVariable(
          'seasonSeq',
          $c.getGlobalVariable<NetflixSeasonNode>('meta.season').get('seq').run(),
        )
        .if(
          $c.getVariable('seasonSeq').number().greaterThan(1).run(),
          title
            .concat(' ')
            .concat('Season ')
            .concat($c.getVariable('seasonSeq').string().run())
            .run(),
          title.run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.getGlobalVariable<NetflixSeasonNode>('meta.season').get('id').run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/title/')
        .concat($c.getGlobalVariable<NetflixSeasonNode>('meta.show').get('id').string().run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.getGlobalVariable<NetflixEpisodeNode>('meta.episode').get('seq').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($request =>
          $request
            .setVariable('request')
            .fn($c.getVariable('request').exec(handleGraphqlRequest).run())
            .fn($c.getVariable('request').exec(handleMetadataRequest).run())
            .run(),
        )
        .detectChanges(
          $c.this('sync.isSyncPage').boolean().run(),
          $c.this('sync.isSyncPage').boolean().not().ifNotReturn().trigger().run(),
        )
        .run();
    },
  },
};

function handleMetadataRequest($c: ChibiGenerator<{ url: string; data: unknown }>) {
  return $c
    .get('url')
    .matches('/metadata')
    .ifNotReturn()
    .getVariable<NetflixRequestResponse>('request')
    .log('Metadata request')
    .get('data')
    .log('Metadata data')
    .get('video')
    .log('Metadata video')
    .setVariable('meta.video')
    .getPersistentVariable(
      $c.getVariable<NetflixVideoShow>('meta.video').get('id').log('id').string().run(),
    )
    .log('IsAnime')
    .ifNotReturn()
    .getVariable<NetflixVideoShow>('meta.video')
    .setGlobalVariable('meta.show')
    .log('Show')
    .get('seasons')
    .arrayFind($season =>
      $season
        .get('episodes')
        .arrayFind($episode =>
          $episode.get('id').string().equals($episode.url().urlPart(4).run()).run(),
        )
        .boolean()
        .run(),
    )
    .ifNotReturn()
    .setGlobalVariable('meta.season')
    .log('Active season')
    .get('episodes')
    .arrayFind($episode =>
      $episode.get('id').string().equals($episode.url().urlPart(4).run()).run(),
    )
    .ifNotReturn()
    .setGlobalVariable('meta.episode')
    .log('Active episode')
    .trigger();
}

function handleGraphqlRequest($c: ChibiGenerator<{ url: string; data: unknown }>) {
  return $c
    .get('url')
    .matches('/graphql')
    .ifNotReturn()
    .getVariable<NetflixGraphqlSeasons>('request')
    .get('data')
    .ifNotReturn()
    .get('data')
    .ifNotReturn()
    .get('unifiedEntities')
    .ifNotReturn()
    .filter($c => $c.get('__typename').equals('Show').run())
    .filter($c => $c.get('genreTags').boolean().run())
    .ifNotReturn()
    .setVariable('request.shows')
    .fn($c.getVariable('request.shows').exec(setAnime).run());
}

function setAnime($c: ChibiGenerator<NetflixShow[]>) {
  return $c.filter($c => $c.exec(isAnime).run());
}

function isAnime($c: ChibiGenerator<NetflixShow>) {
  return $c
    .setVariable('isAnime.show')
    .get('genreTags')
    .get('edges')
    .ifThen($c =>
      $c
        .arrayFind($c =>
          $c
            .get('node')
            .get('genreId')
            .setVariable('isAnime.genreId')
            .array(genres)
            .arrayIncludes($c => $c.getVariable('isAnime.genreId').string().run())
            .run(),
        )
        .run(),
    )
    .boolean()
    .setPersistentVariable(
      $c.getVariable<NetflixShow>('isAnime.show').get('videoId').string().run(),
    );
}
