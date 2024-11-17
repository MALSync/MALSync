export interface JikanEntry {
  mal_id: number;
  url: string;
  titles: {
    type: string;
    title: string;
  }[];
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_romanji: string | null;
}

export interface FoundEntry {
  title: string;
  episodeNumber: number;
  mal_id: number;
}

export interface DisneyPlusProxyData {
  seriesId: string;
  nextEpisodeId: string;
  title: string;
}
