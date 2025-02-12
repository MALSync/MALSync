import { Single as MalSingle } from '../../../src/_provider/MyAnimeList_api/single';
import { Single as AnilistSingle } from '../../../src/_provider/AniList/single';
import { Single as KitsuSingle } from '../../../src/_provider/Kitsu/single';
import { Single as SimklSingle } from '../../../src/_provider/Simkl/single';
import { Single as LocalSingle } from '../../../src/_provider/Local/single';
import { Single as ShikiSingle } from '../../../src/_provider/Shikimori/single';

export const classConfigs: {
  name: string;
  url: string;
  class;
  internalStates: number;
  setup: (single) => void;
}[] = [
  {
    name: 'myanimelist',
    url: 'https://myanimelist.net/anime/21/One_Piece',
    class: MalSingle,
    internalStates: 10,
    setup: single => {
      single.animeInfo = {};
      single.animeInfo.my_list_status = {
        is_rewatching: false,
        num_watched_episodes: 0,
        score: 0,
        status: 'plan_to_watch',
        tags: [],
      };
    },
  },
  {
    name: 'Anilist',
    url: 'https://anilist.co/anime/21/One_Piece',
    class: AnilistSingle,
    internalStates: 100,
    setup: single => {
      single.animeInfo = {};
      single.animeInfo.mediaListEntry = {
        notes: '',
        progress: 0,
        progressVolumes: 0,
        repeat: 0,
        score: 0,
        status: 'PLANNING',
      };
    },
  },
  {
    name: 'Kitsu',
    url: 'https://kitsu.app/anime/one-piece',
    class: KitsuSingle,
    internalStates: 100,
    setup: single => {
      single.animeInfo = {
        data: {},
      };
      single.animeInfo.data[0] = {
        attributes: {
          notes: '',
          progress: 0,
          volumesOwned: 0,
          reconsuming: false,
          reconsumeCount: false,
          ratingTwenty: null,
          status: 'planned',
        },
      };
    },
  },
  {
    name: 'Simkl',
    url: 'https://simkl.com/anime/38636/one-piece',
    class: SimklSingle,
    internalStates: 10,
    setup: single => {
      single.animeInfo = {
        last_watched: '',
        last_watched_at: '',
        next_to_watch: '',
        not_aired_episodes_count: 0,
        private_memo: '',
        status: 'plantowatch',
        total_episodes_count: 0,
        user_rating: null,
        watched_episodes_count: 0,
        show: 'el',
      };
    },
  },
  {
    name: 'Shiki',
    url: 'https://shikimori.one/animes/21-one-piece',
    class: ShikiSingle,
    internalStates: 10,
    setup: single => {
      single.userRate = {
        id: '',
        score: 0,
        status: 'planned',
        episodes: 0,
        chapters: 0,
        rewatches: 0,
        volumes: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
    },
  },
  {
    name: 'Local',
    url: 'local://crunchyroll/anime/nogamenolife',
    class: LocalSingle,
    internalStates: 10,
    setup: single => {
      single.animeInfo = {
        name: 'this.title',
        tags: '',
        sUrl: '',
        image: '',
        progress: 0,
        volumeprogress: 0,
        score: 0,
        status: 6,
      };
    },
  },
];

export function getSingle(pageName) {
  const singleConfig = classConfigs.find((c) => c.name === pageName);
  if (!singleConfig) {
    throw new Error(`Provider ${pageName} not found.`);
  }
  const single = new singleConfig.class(singleConfig.url);
  singleConfig.setup(single);
  return single;
}
