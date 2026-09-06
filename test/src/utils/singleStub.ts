import { Single as MalSingle } from '../../../src/_provider/MyAnimeList_api/single';
import { Single as MalHybridSingle } from '../../../src/_provider/MyAnimeList_hybrid/single';
import { Single as AnilistSingle } from '../../../src/_provider/AniList/single';
import { Single as KitsuSingle } from '../../../src/_provider/Kitsu/single';
import { Single as SimklSingle } from '../../../src/_provider/Simkl/single';
import { Single as ShikimoriSingle } from '../../../src/_provider/Shikimori/single';
import { Single as MangaBakaSingle } from '../../../src/_provider/MangaBaka/single';
import { Single as LocalSingle } from '../../../src/_provider/Local/single';

export const classConfigs: {
  name: string;
  url: string;
  class;
  internalStates: number;
  noManga?: boolean;
  setup: (single) => void;
}[] = [
  {
    name: 'myanimelist',
    url: 'https://myanimelist.net/manga/2/Berserk',
    class: MalSingle,
    internalStates: 10,
    setup: single => {
      single.animeInfo = {};
      single.animeInfo.my_list_status = {
        is_rereading: false,
        num_chapters_read: 0,
        num_volumes_read: 0,
        score: 0,
        status: 'plan_to_read',
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
        included: [
          {
            attributes: {
              slug: 'test',
              titles: { en: 'Test' },
              canonicalTitle: 'Test',
              episodeCount: 0,
              chapterCount: 0,
              volumeCount: 0,
            },
          },
        ],
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
    noManga: true,
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
    name: 'MyAnimeList_hybrid',
    url: 'https://myanimelist.net/manga/2/Berserk',
    class: MalHybridSingle,
    internalStates: 10,
    setup: single => {
      single.animeInfo = {};
      single.animeInfo.my_list_status = {
        is_rereading: false,
        num_chapters_read: 0,
        num_volumes_read: 0,
        score: 0,
        status: 'plan_to_read',
        tags: [],
      };
    },
  },
  {
    name: 'Shikimori',
    url: 'https://shikimori.one/animes/21-one-piece',
    class: ShikimoriSingle,
    internalStates: 10,
    setup: single => {
      single.animeInfo = {
        user_id: 1,
        target_id: 21,
        target_type: 'Anime',
        score: 0,
        status: 'planned',
        rewatches: 0,
        episodes: 0,
        volumes: 0,
        chapters: 0,
        text: '',
      };
      single.animeMeta = {
        name: 'Test',
        russian: 'Test',
        episodes: 0,
        chapters: 0,
        volumes: 0,
        image: {},
      };
    },
  },
  {
    name: 'MangaBaka',
    url: 'https://mangabaka.org/21',
    class: MangaBakaSingle,
    internalStates: 100,
    setup: single => {
      single.libraryEntry = {
        state: 'plan_to_read',
        rating: 0,
        progress_chapter: 0,
        progress_volume: 0,
        number_of_rereads: 0,
        start_date: null,
        finish_date: null,
        Series: {
          title: 'Test',
          total_chapters: '0',
          final_volume: null,
          status: 'releasing',
          rating: null,
          cover: {},
        },
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
  const singelConfig = classConfigs.find((c) => c.name === pageName);
  if (!singelConfig) {
    throw new Error(`Provider ${pageName} not found.`);
  }
  const single = new singelConfig.class(singelConfig.url);
  singelConfig.setup(single);
  single._onList = true;
  return single;
}
