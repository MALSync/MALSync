/* eslint-disable no-shadow */
export interface IAnime {
  data: Data;
  meta?: Meta;
  player: Player;
}

export interface Player {
  episode: number;
  total: number;
  season?: number;
  next?: string;
}

export interface Data {
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
  releaseDateString?: string;
  shikimori_href?: string;
  shiki_rate?: number;
}

export interface Label {
  id: number;
  label: string;
}

export interface Cover {
  filename?: string;
  thumbnail?: string;
  default: string;
  md?: string;
}

export interface Meta {
  country: string;
}

export interface IEpisodes {
  data: IEpisodeData[];
}

export interface IEpisode {
  data: IEpisodeData;
}

export interface IEpisodeData {
  id: number;
  model: Model;
  name: string;
  number: string;
  number_secondary: string;
  season: string;
  status: Status;
  anime_id: number;
  created_at: Date;
  item_number: number;
  type: Model;
}

export enum Statuses {
  ПолноценныйЭпизод = 'Полноценный эпизод',
}

export enum Model {
  Episodes = 'episodes',
}

export interface Status {
  id: ID;
  label: Statuses;
  abbr: null;
}
export enum ID {
  Default = 'default',
}
