/* export enum type {
  Anime = "anime",
  Manga = "manga"
} */

export type contentType = 'anime' | 'manga';

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

export enum errorCode {
  UrlNotSuported = 901,
  NotAutenticated = 902,
  ServerOffline = 903,
  EntryNotFound = 904,
  GenericError = 905,
}

export interface error {
  code: errorCode;
  message: string;
}

export type searchInterface = (
  keyword: string,
  type: 'anime' | 'manga',
  options?: {},
  sync?: boolean,
) => Promise<
  {
    id: number;
    name: string;
    altNames: string[];
    url: string;
    malUrl: () => Promise<string | null>;
    image: string;
    media_type: string;
    isNovel: boolean;
    score: string;
    year: string;
  }[]
>;
