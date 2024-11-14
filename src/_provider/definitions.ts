/* eslint-disable no-shadow */
/* export enum type {
  Anime = "anime",
  Manga = "manga"
} */

import { Component } from 'vue';

export type contentType = 'anime' | 'manga';

export type syncMethod = 'normal' | 'listSync';

export enum status {
  NoState = 0,
  Watching = 1,
  Completed = 2,
  Onhold = 3,
  Dropped = 4,
  PlanToWatch = 6,
  All = 7,
  Rewatching = 23,
}

export enum score {
  NoScore = 0,
  R1 = 1,
  R2 = 2,
  R3 = 3,
  R4 = 4,
  R5 = 5,
  R6 = 6,
  R7 = 7,
  R8 = 8,
  R9 = 9,
  R10 = 10,
}

// score range 0 - 100
export type score100 = number;

// YYYY-MM-DD format
export type startFinishDate = string | null;

export type fuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

export type rewatchCount = number;

export type searchResult = {
  id: number;
  name: string;
  altNames: string[];
  url: string;
  malUrl: () => Promise<string | null>;
  image: string;
  imageLarge: string;
  imageBanner?: string;
  media_type: string;
  isNovel: boolean;
  score: string;
  year: string;
  totalEp?: number;
  list?: {
    status: status;
    score: score;
    episode: number;
  };
};

export type searchInterface = (
  keyword: string,
  type: 'anime' | 'manga',
  options?: {},
  sync?: boolean,
) => Promise<searchResult[]>;

export interface ConfObj {
  key: string;
  title: string | (() => string);
  system?: 'userscript' | 'webextension';
  component: Component;
  condition?: () => boolean;
  change?: () => void;
  props?: { [key: string]: any };
  children?: ConfObj[];
}
