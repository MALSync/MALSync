/* eslint-disable no-shadow */
import { status } from '../definitions';

export type UserRateStatusEnum =
  | 'planned'
  | 'watching'
  | 'rewatching'
  | 'completed'
  | 'on_hold'
  | 'dropped';

// eslint-disable-next-line no-shadow
export enum statusTranslate {
  watching = status.Watching,
  planned = status.PlanToWatch,
  completed = status.Completed,
  dropped = status.Dropped,
  on_hold = status.Onhold,
  rewatching = status.Rewatching,
}

export interface CurrentUser {
  data: UserData;
}
export interface Users {
  data: UsersData;
}

export interface UsersData {
  users: User[];
}
export interface UserData {
  currentUser: User;
}
export interface User {
  avatarUrl: string;
  id: string;
  lastOnlineAt: string;
  nickname: string;
  url: string;
}

export interface UserRateOrderInputType {
  field: 'id' | 'updated_at';
  order: 'asc' | 'desc';
}

export interface UserRates {
  data: {
    userRates: UserRate[];
  };
}
/**
 * @deprecated Use only for v2 API. For GRAPHQL use {@link UserRate}
 */
export interface UserRateV2 {
  id: string;
  user_id: number;
  target_id: number;
  target_type: 'Anime' | 'Manga';
  updated_at: string;
  created_at: string;
  score: number;
  status: UserRateStatusEnum;
  rewatches: number;
  episodes: number;
  volumes: number;
  chapters: number;
  text?: string;
  text_html?: string;
}
export interface UserRate {
  id: string;
  updatedAt: string;
  createdAt: string;
  score: number;
  status: UserRateStatusEnum;
  rewatches: number;
  episodes: number;
  volumes: number;
  chapters: number;
  text?: string;
  anime?: Anime;
  manga?: Manga;
}

export interface Mangas {
  data: MangasData;
}

export interface MangasData {
  mangas: Manga[];
}

export interface Manga {
  id: string;
  malId?: string;
  name: string;
  russian?: string;
  licenseNameRu?: string;
  english?: string;
  japanese?: string;
  synonyms: string[];
  chronology?: Manga[];
  kind?: MangaKindEnum;
  score?: number;
  status: string;
  volumes: number;
  chapters: number;
  airedOn?: IncompleteDate;
  releasedOn: IncompleteDate;
  url: string;
  poster?: Poster;
  licensors?: string[];
  createdAt: string;
  updatedAt: string;
  isCensored?: boolean;
  franchise?: string;
  genres?: Genre[];
  publishers: Publisher[];
  externalLinks?: ExternalLink[];
  personRoles?: PersonRole[];
  characterRoles?: CharacterRole[];
  related?: Related[];
  scoresStats?: ScoreStat[];
  statusesStats?: StatusStat[];
  description?: string;
  descriptionHtml?: string;
  descriptionSource?: string;
  opengraphImageUrl?: string;
  topic: Topic;
  userRate?: UserRate;
}

export interface Publisher {
  id: string;
  name: string;
}

export interface Poster {
  id: string;
  main2xUrl: string;
  mainAlt2xUrl: string;
  mainAltUrl: string;
  mainUrl: string;
  mini2xUrl: string;
  miniAlt2xUrl: string;
  miniAltUrl: string;
  miniUrl: string;
  originalUrl: string;
  preview2xUrl: string;
  previewAlt2xUrl: string;
  previewAltUrl: string;
  previewUrl: string;
}

export interface Animes {
  data: AnimesData;
}

export interface AnimesData {
  animes: Anime[];
}

export interface Anime {
  id: string;
  malId?: string;
  name: string;
  russian?: string;
  licenseNameRu?: null;
  english?: string;
  japanese?: string;
  synonyms: string[];
  kind?: AnimeKindEnum;
  rating?: string;
  score?: number;
  status?: string;
  episodes: number;
  episodesAired: number;
  duration?: number;
  airedOn?: IncompleteDate;
  releasedOn?: IncompleteDate;
  url: string;
  season?: string; // Not like 1,2,3 seasons but winter 2024, spring, summer 2023 etc.
  poster?: Poster;
  fansubbers: string[];
  fandubbers: string[];
  licensors?: string[];
  createdAt: string;
  updatedAt: string;
  nextEpisodeAt?: string;
  isCensored?: boolean;
  genres?: Genre[];
  studios: Studio[];
  externalLinks?: ExternalLink[];
  personRoles?: PersonRole[];
  characterRoles?: CharacterRole[];
  related?: Related[];
  videos: Video[];
  screenshots: Screenshot[];
  scoresStats?: ScoreStat[];
  statusesStats?: StatusStat[];
  description?: string;
  descriptionHtml?: string;
  descriptionSource?: string;
  franchise?: string;
  opengraphImageUrl?: string;
  chronology?: Anime[];
  userRate?: UserRate;
}

export interface IncompleteDate {
  year: number | null;
  month: number | null;
  day: number | null;
  date: string | null;
}

export interface CharacterRole {
  id: string;
  rolesRu: string[];
  rolesEn: string[];
  character: Character;
}
export interface PersonRole {
  id: string;
  rolesRu: string[];
  rolesEn: string[];
  person?: Person;
}
export interface Person {
  birthOn?: IncompleteDate;
  createdAt: string;
  deceasedOn?: IncompleteDate;
  id: string;
  isMangaka: boolean;
  isProducer: boolean;
  isSeyu: boolean;
  japanese?: string;
  malId?: string;
  name: string;
  poster?: Poster;
  russian?: string;
  synonyms: string[];
  topic?: Topic;
  updatedAt: string;
  url: string;
  website?: string;
}
export interface Topic {
  body: string;
  commentsCount: number;
  createdAt: string;
  htmlBody: string;
  id?: string;
  tags: string[];
  title: string;
  type: string;
  updatedAt: string;
  url: string;
}
export interface Character {
  createdAt: string;
  description?: string;
  descriptionHtml?: string;
  descriptionSource?: string;
  id: string;
  isAnime: boolean;
  isManga: boolean;
  isRanobe: boolean;
  japanese?: string;
  malId?: string;
  name: string;
  poster?: Poster;
  russian?: string;
  synonyms: string[];
  topic?: Topic;
  updatedAt: string;
  url: string;
}

export interface ExternalLink {
  id: null | string;
  kind: ExternalLinkKindEnum;
  url: string;
  createdAt: string | null;
  updatedAt: string | null;
}
export type ExternalLinkKindEnum =
  | 'official_site'
  | 'wikipedia'
  | 'anime_news_network'
  | 'myanimelist'
  | 'anime_db'
  | 'world_art'
  | 'kinopoisk'
  | 'kage_project'
  | 'twitter'
  | 'smotret_anime'
  | 'crunchyroll'
  | 'amazon'
  | 'hidive'
  | 'hulu'
  | 'ivi'
  | 'kinopoisk_hd'
  | 'wink'
  | 'netflix'
  | 'okko'
  | 'youtube'
  | 'readmanga'
  | 'mangalib'
  | 'remanga'
  | 'mangaupdates'
  | 'mangadex'
  | 'mangafox'
  | 'mangachan'
  | 'mangahub'
  | 'novel_tl'
  | 'ruranobe'
  | 'ranobelib'
  | 'novelupdates';

export interface Genre {
  id: string;
  name: string;
  russian: string;
  kind: GenreKindEnum;
  entryType: GenreEntryTypeEnum;
}
export type GenreKindEnum = 'demographic' | 'genre' | 'theme';
export type GenreEntryTypeEnum = 'Anime' | 'Manga';

export interface Related {
  id: string;
  anime?: Anime;
  manga?: Manga;
  relationKind: RelationKindEnum;
  relationText: string;
}
export enum RelationKindEnum {
  adaptation = 'Adaptation',
  alternative_setting = 'Alternative setting',
  alternative_version = 'Alternative version',
  character = 'Character',
  full_story = 'Full story',
  other = 'Other',
  parent_story = 'Parent story',
  prequel = 'Prequel',
  sequel = 'Sequel',
  side_story = 'Side story',
  spin_off = 'Spin-off',
  summary = 'Summary',
}

export interface ScoreStat {
  score: number;
  count: number;
}

export interface Screenshot {
  id: string;
  originalUrl: string;
  x166Url: string;
  x332Url: string;
}

export interface StatusStat {
  status: UserRateStatusEnum;
  count: number;
}

export interface Studio {
  id: string;
  name: string;
  imageUrl?: string;
}
export interface Video {
  id: string;
  imageUrl: string;
  kind:
    | 'pv'
    | 'character_trailer'
    | 'cm'
    | 'op'
    | 'ed'
    | 'op_ed_clip'
    | 'clip'
    | 'other'
    | 'episode_preview';
  name?: string;
  playerUrl: string;
  url: string;
}
export type OrderEnum =
  | 'id'
  | 'id_desc'
  | 'ranked'
  | 'kind'
  | 'popularity'
  | 'name'
  | 'aired_on'
  | 'episodes'
  | 'status'
  | 'random'
  | 'ranked_random'
  | 'ranked_shiki'
  | 'created_at'
  | 'created_at_desc';

export type AnimeStatusString =
  | 'anons' // - Planned
  | 'ongoing' // - Airing
  | 'released'; // - Released

export type AnimeKindString =
  | 'movie' // - Movies
  | 'music' // - Music
  | 'ona' // - ONA
  | 'ova/ona' // - OVA/ONA
  | 'ova' // - OVA
  | 'special' // - Specials
  | 'tv' // - TV Series
  | 'tv_13' // - Short TV Series
  | 'tv_24' // - Average TV Series
  | 'tv_48' // - Long TV Series
  | 'tv_special' // - TV Specials
  | 'pv' // - Promotional Videos
  | 'cm'; // - Commercial Messages

export type MangaKindEnum =
  | 'manga'
  | 'manhwa'
  | 'manhua'
  | 'light_novel'
  | 'novel'
  | 'one_shot'
  | 'doujin';
export type AnimeKindEnum =
  | 'tv'
  | 'movie'
  | 'ova'
  | 'ona'
  | 'special'
  | 'tv_special'
  | 'music'
  | 'pv'
  | 'cm';

export enum MangaStatusEnum {
  anons = 'Planned',
  ongoing = 'Publishing',
  released = 'Published',
  paused = 'Paused',
  discontinued = 'Discontinued',
}

export enum AnimeStatusEnum {
  anons = 'Planned',
  ongoing = 'Publishing',
  released = 'Published',
}
