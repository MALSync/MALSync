/* eslint-disable no-shadow */

const API_DOMAIN = 'https://api.mangalib.me/api';
export interface Anime {
  data: Data;
  meta?: Meta;
  player: Player;
}
export interface Manga {
  data: Data;
  meta?: Meta;
  reader: Reader;
}
export interface Chapters {
  data: ChapterData[];
}
export interface Chapter {
  data: ChapterData;
}
export interface Episodes {
  data: EpisodeData[];
}
export interface Episode {
  data: EpisodeData;
}
interface Player {
  episode: number;
  total?: number;
  season?: number;
  next?: string;
}
interface Reader {
  chapter: number;
  total?: number;
  volume?: number;
  next?: string;
}
interface Data {
  id: number;
  name: string;
  rus_name: string;
  eng_name: string;
  slug?: string;
  slug_url: string;
  cover: Cover;
  ageRestriction?: Label;
  site?: number;
  type?: Label;
  is_licensed?: boolean;
  model?: string;
  status?: Label;
  items_count?: Count;
  releaseDateString?: string;
  shikimori_href?: string;
  shiki_rate?: number;
}
interface Count {
  uploaded: number;
  total?: number | 0;
}
interface Label {
  id: number;
  label: string;
}
interface Cover {
  filename?: string;
  thumbnail: string;
  default: string;
  md?: string;
}
interface Meta {
  country: string;
}
interface EpisodeData {
  id: number;
  model: string;
  name: string;
  number: string;
  number_secondary: string;
  season: string;
  status: Status;
  anime_id: number;
  created_at: Date;
  item_number: number;
  type: string;
}
interface Status {
  id: string;
  label: string;
  abbr: unknown;
}
interface ChapterData {
  id: number;
  index: number;
  item_number: number;
  volume: string;
  number: string;
  number_secondary: string;
  name: null | string;
  branches_count: number;
  branches: Branch[];
}
interface Branch {
  id: number;
  branch_id: number;
  created_at: Date;
  teams: Team[];
  user: User;
}
interface Team {
  id: number;
  slug: string;
  slug_url: string;
  model: string;
  name: string;
  cover: Cover;
}
interface User {
  username: string;
  id: number;
}

function apiRequest(path: string) {
  return api.request.xhr('GET', `${API_DOMAIN}/${path}`);
}

// NOTE - Anime API
/**
 *
 * @param anime_slug - Can ONLY be like {@link Data.slug_url} from {@link Data}
 * @returns Promise with {@link Anime} object
 */
export async function getAnimeData(anime_slug: string): Promise<Anime> {
  const data = await apiRequest(`anime/${anime_slug}`);
  try {
    return JSON.parse(data.responseText);
  } catch (e) {
    return {} as Anime;
  }
}
/**
 * Request may be blocked by MangaLib API since some requests are protected from accessing directly. CORS Same Origin Policy
 * @param episode_id - {@link EpisodeData.id} from {@link EpisodeData}
 * @returns Promise with {@link Episode} object
 */
export async function getEpisodeData(episode_id: string): Promise<Episode> {
  const data = await apiRequest(`episodes/${episode_id}`);
  try {
    return JSON.parse(data.responseText);
  } catch (e) {
    return {} as Episode;
  }
}
/**
 * Request may be blocked by MangaLib API since some requests are protected from accessing directly. CORS Same Origin Policy
 * @param anime_id - Either like {@link Data.id} or {@link Data.slug_url} from {@link Data}
 * @returns Promise with {@link Episodes} object
 */
export async function getEpisodesData(anime_id: string): Promise<Episodes> {
  const data = await apiRequest(`episodes?anime_id=${anime_id}`);
  try {
    return JSON.parse(data.responseText);
  } catch (e) {
    return {} as Episodes;
  }
}

// NOTE - Manga API
/**
 *
 * @param manga_slug - Can ONLY be like {@link Data.slug_url} from {@link Data}
 * @returns Promise with {@link Manga} object
 */
export async function getMangaData(manga_slug: string): Promise<Manga | undefined> {
  const data = await apiRequest(`manga/${manga_slug}?fields[]=chap_count`);
  try {
    return JSON.parse(data.responseText);
  } catch (e) {
    return undefined;
  }
}
/**
 * Request may be blocked by MangaLib API since some requests are protected from accessing directly. CORS Same Origin Policy
 * @param manga_slug - Can ONLY be like {@link Data.slug_url} from {@link Data}
 * @param chapter_number - {@link ChapterData.number} from {@link ChapterData}
 * @param volume_number - {@link ChapterData.volume} from {@link ChapterData}
 * @param branch_id - {@link Branch.branch_id} from {@link Branch}
 * @returns Promise with {@link Chapter} object
 */
export async function getChapterData(
  manga_slug: string,
  chapter_number: string,
  volume_number: string,
  branch_id?: string | number,
): Promise<Chapter | undefined> {
  const data = await apiRequest(
    `manga/${manga_slug}/chapter?number=${chapter_number}&volume=${volume_number}${branch_id ? `&branch_id=${branch_id}` : ''}`,
  );
  try {
    return JSON.parse(data.responseText);
  } catch (e) {
    return undefined;
  }
}
/**
 * Request may be blocked by MangaLib API since some requests are protected from accessing directly. CORS Same Origin Policy
 * @param manga_id - Either like {@link Data.id} or {@link Data.slug_url} from {@link Data} object
 * @returns Promise with {@link Chapters} object
 */
export async function getChaptersData(manga_id: string): Promise<Chapters | undefined> {
  const data = await apiRequest(`manga/${manga_id}/chapters`);
  try {
    return JSON.parse(data.responseText);
  } catch (e) {
    return undefined;
  }
}