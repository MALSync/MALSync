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

type Override = {
  season?: number;
  offset?: number;
  malId?: number;
};

type Overrides = {
  seasons: Record<string, { override: Override }>;
};

// Short keys of the overrides compiled into the page: season, episode offset, MAL id
type CompactOverride = { s?: number; o?: number; m?: number };

// Overrides of overrides.json by Netflix season id, shortened at build time
function compactOverrides(overrides: Overrides) {
  const compact: Record<string, CompactOverride> = {};
  Object.entries(overrides.seasons).forEach(([seasonId, { override }]) => {
    compact[seasonId] = { s: override.season, o: override.offset, m: override.malId };
  });
  return compact;
}

type NetflixEpisodeNode = { videoId: number; number: number; title: string };

type NetflixSeasonNode = {
  videoId: number;
  title: string;
  number: number;
  episodes: { edges: { node: NetflixEpisodeNode }[] };
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
  title: string;
  videoId: number;
  seasons: { edges: { node: NetflixSeasonNode }[] };
};

// PlayerMetadataData graphql response of the player
type NetflixRequestResponse = {
  data: {
    data: {
      entities: { __typename: string; parentShow: NetflixVideoShow }[];
    };
  };
};

export const Netflix: PageInterface = {
  name: 'Netflix',
  domain: 'https://www.netflix.com',
  database: 'Netflix',
  languages: ['Many'],
  type: 'anime',
  minimumVersion: '0.13.0',
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
            .equals($c.getGlobalVariable('meta.episode').get('videoId').string().run())
            .run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.getGlobalVariable<NetflixVideoShow>('meta.show').get('title').run();
    },
    getIdentifier($c) {
      return $c.getGlobalVariable<NetflixSeasonNode>('meta.season').get('videoId').string().run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/title/')
        .concat($c.getGlobalVariable<NetflixVideoShow>('meta.show').get('videoId').string().run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .getGlobalVariable<NetflixEpisodeNode>('meta.episode')
        .get('number')
        .calculate('+', $c.exec(getEpisodeOffset).run())
        .run();
    },
    // Override season, no season if the override sets the MAL entry (a season would remap it),
    // else the Netflix season
    getSeason($c) {
      return $c
        .exec(getOverride)
        .setVariable('override')
        .get('s')
        .ifThen($o => $o.getVariable<CompactOverride>('override').get('s').return().run())
        .getVariable<CompactOverride>('override')
        .get('m')
        .ifThen($m => $m.string('NaN').number().return().run())
        .getGlobalVariable<NetflixSeasonNode>('meta.season')
        .get('number')
        .exec(skipFirstSeason)
        .run();
    },
    getMalUrl($c) {
      return $c
        .exec(getOverride)
        .get('m')
        .ifNotReturn()
        .log('Override MAL id')
        .setVariable('overrideMalId')
        .providerUrlUtility({ malId: $c.getVariable<number>('overrideMalId').run() })
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c
        .addStyle(require('./style.less?raw').toString())
        .setGlobalVariable(
          'overrides',
          $c.object(compactOverrides(require('./overrides.json'))).run(),
        )
        .run();
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

// Override of overrides.json for the current Netflix season, {} if there is none
function getOverride($c: ChibiGenerator<unknown>) {
  return $c.coalesce(
    $c
      .getGlobalVariable<Record<string, CompactOverride>>('overrides')
      .get($c.getGlobalVariable<NetflixSeasonNode>('meta.season').get('videoId').string().run())
      .run(),
    $c.object({}).run(),
  ) as unknown as ChibiGenerator<CompactOverride>;
}

// TVDB episode = Netflix episode + offset
function getEpisodeOffset($c: ChibiGenerator<unknown>) {
  return $c.coalesce($c.exec(getOverride).get('o').run(), $c.number(0).run());
}

// Season 1 is often the whole show, so do not infer a mal entry from it.
function skipFirstSeason($c: ChibiGenerator<unknown>) {
  return $c
    .number()
    .setVariable('season')
    .equals(1)
    .ifThen($c => $c.string('NaN').number().return().run())
    .getVariable<number>('season');
}

function handleMetadataRequest($c: ChibiGenerator<{ url: string; data: unknown }>) {
  return $c
    .get('url')
    .matches('/graphql')
    .ifNotReturn()
    .getVariable<NetflixRequestResponse>('request')
    .get('data')
    .ifNotReturn()
    .get('data')
    .ifNotReturn()
    .get('entities')
    .ifNotReturn()
    .arrayFind($entity => $entity.get('__typename').equals('Episode').run())
    .ifNotReturn()
    .get('parentShow')
    .ifNotReturn()
    .log('Metadata video')
    .setVariable('meta.video')
    .getPersistentVariable(
      $c.getVariable<NetflixVideoShow>('meta.video').get('videoId').log('id').string().run(),
    )
    .log('IsAnime')
    .ifNotReturn()
    .getVariable<NetflixVideoShow>('meta.video')
    .setGlobalVariable('meta.show')
    .log('Show')
    .get('seasons')
    .get('edges')
    .arrayFind($season =>
      $season
        .get('node')
        .get('episodes')
        .get('edges')
        .arrayFind($episode =>
          $episode
            .get('node')
            .get('videoId')
            .string()
            .equals($episode.url().urlPart(4).run())
            .run(),
        )
        .boolean()
        .run(),
    )
    .ifNotReturn()
    .get('node')
    .setGlobalVariable('meta.season')
    .log('Active season')
    .get('episodes')
    .get('edges')
    .arrayFind($episode =>
      $episode.get('node').get('videoId').string().equals($episode.url().urlPart(4).run()).run(),
    )
    .ifNotReturn()
    .get('node')
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
    .log('[handle] Shows')
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
    .log('[handle] isAnime')
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
