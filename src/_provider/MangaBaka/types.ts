export type BakaState =
  | 'completed'
  | 'dropped'
  | 'paused'
  | 'plan_to_read'
  | 'reading'
  | 'rereading';

export type BakaSorting =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'default'
  | 'my_rating_asc'
  | 'my_rating_desc';

export interface BakaPagination {
  count: number;
  next: string;
  previous: any;
  page: number;
  limit: number;
}

export interface BakaLibraryEntry {
  note?: string;
  read_link?: string;
  rating?: number;
  state?: BakaState;
  priority?: number;
  is_private?: boolean;
  number_of_rereads?: number;
  progress_chapter?: number;
  progress_volume?: number;
  start_date?: string;
  finish_date?: string;
  id: number;
  series_id: number;
  user_id: string;
  Series: BakaSeries;
}

export interface BakaImageSize {
  x1: string | null;
  x2: string | null;
  x3: string | null;
}

export interface BakaSeries {
  id: number;
  state: 'active' | 'merged' | 'deleted';
  merged_with: number | null;
  title: string;
  native_title: string | null;
  romanized_title: string | null;
  secondary_titles: {
    [k: string]:
      | {
          type: 'alternative' | 'native' | 'official' | 'unofficial';
          title: string;
          note?: string | null;
        }[]
      | null;
  };
  cover: {
    raw: {
      url: string | null;
      size?: number | null;
      height?: number | null;
      width?: number | null;
      blurhash?: string | null;
      thumbhash?: string | null;
      format?: string | null;
      [k: string]: unknown;
    };
    x150: BakaImageSize;
    x250: BakaImageSize;
    x350: BakaImageSize;
  };
  authors: string[] | null;
  artists: string[] | null;
  description: string | null;
  year: number | null;
  status: 'cancelled' | 'completed' | 'hiatus' | 'releasing' | 'unknown' | 'upcoming';
  is_licensed: boolean;
  has_anime: boolean;
  anime: {
    start: string | null;
    end: string | null;
  } | null;
  content_rating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
  type: 'manga' | 'novel' | 'manhwa' | 'manhua' | 'oel' | 'other';
  rating: number | null;
  final_volume: string | null;
  final_chapter: string | null;
  total_chapters: string | null;
  links?: string[] | null;
  publishers:
    | {
        name: string | null;
        type: string | null;
        note: string | null;
        [k: string]: unknown;
      }[]
    | null;
  genres_v2?:
    | {
        id: number;
        parent_id: number | null;
        name: string;
        name_path: string;
        description?: string | null;
        is_spoiler?: boolean;
        content_rating?: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
        series_count?: number;
        level?: number;
        [k: string]: unknown;
      }[]
    | null;
  genres?: string[] | null;
  tags_v2?:
    | {
        id: number;
        parent_id: number | null;
        name: string;
        name_path: string;
        description?: string | null;
        is_spoiler?: boolean;
        content_rating?: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
        series_count?: number;
        level?: number;
        [k: string]: unknown;
      }[]
    | null;
  tags: string[] | null;
  last_updated_at: string | null;
  relationships: {
    main_story?: number[];
    adaptation?: number[];
    prequel?: number[];
    sequel?: number[];
    side_story?: number[];
    spin_off?: number[];
    alternative?: number[];
    other?: number[];
  } | null;
  source: {
    anilist: {
      id: number | null;
      rating: number | null;
      [k: string]: unknown;
    };
    anime_planet?: {
      id: string | null;
      rating: number | null;
      [k: string]: unknown;
    };
    anime_news_network: {
      id: number | null;
      rating: number | null;
      [k: string]: unknown;
    };
    kitsu: {
      id: number | null;
      rating: number | null;
      [k: string]: unknown;
    };
    manga_updates: {
      id: string | null;
      rating: number | null;
      [k: string]: unknown;
    };
    mangadex?: {
      id: {
        [k: string]: unknown;
      };
      rating: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    } | null;
    my_anime_list: {
      id: number | null;
      rating: number | null;
      [k: string]: unknown;
    };
    shikimori?: {
      id: number | null;
      rating: number | null;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
}

export interface LibraryResponse {
  status: number;
  pagination: BakaPagination;
  data: BakaLibraryEntry[];
}
