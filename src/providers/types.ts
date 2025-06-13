/* eslint-disable no-shadow */

export type contentType = 'anime' | 'manga';
export type syncMethod = 'normal' | 'listSync';

export enum Status {
  NoState = 0,
  Watching = 1,
  Completed = 2,
  Onhold = 3,
  Dropped = 4,
  PlanToWatch = 6,
  All = 7,
  Rewatching = 23,
}

export enum Score {
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
export type Score100 = number;

// YYYY-MM-DD format
export type StartFinishDate = string | null;

export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

export type RewatchCount = number;

export interface ListEntry {
  malId: number;
  title: string;
  type: contentType;
  status: Status;
  score: Score;
  watchedEp: number;
  totalEp: number;
  readVol?: number;
  totalVol?: number;
  startDate: StartFinishDate;
  finishDate: StartFinishDate;
  rewatchCount: RewatchCount;
  url: string;
  image?: string;
  notes?: string;
}

export interface SyncResult {
  success: boolean;
  error?: string;
  changes?: {
    status?: Status;
    score?: Score;
    watchedEp?: number;
    readVol?: number;
    startDate?: StartFinishDate;
    finishDate?: StartFinishDate;
    rewatchCount?: RewatchCount;
  };
}

export interface ProviderCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface ProviderUserInfo {
  username: string;
  picture: string;
  href: string;
}

export abstract class ProviderBase {
  protected credentials: ProviderCredentials;
  protected serviceName: string;

  constructor(serviceName: string, credentials: ProviderCredentials) {
    this.serviceName = serviceName;
    this.credentials = credentials;
  }

  abstract getUserInfo(): Promise<ProviderUserInfo>;
  abstract getList(type: contentType, status?: Status): Promise<ListEntry[]>;
  abstract updateEntry(entry: Partial<ListEntry>): Promise<SyncResult>;
  abstract deleteEntry(malId: number, type: contentType): Promise<SyncResult>;
  abstract searchEntry(title: string, type: contentType): Promise<ListEntry | null>;
}
