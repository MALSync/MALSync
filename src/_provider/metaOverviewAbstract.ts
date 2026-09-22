import { Cache } from '../utils/Cache';
import { getSyncMode } from './helper';

export interface Overview {
  title: string;
  alternativeTitle: string[];
  description: string;
  image: string;
  imageLarge: string;
  imageBanner?: string;
  characters: {
    img: string;
    name: string;
    url: string;
    subtext?: string;
  }[];
  statistics: {
    title: string;
    body: string;
  }[];
  info: {
    title: string;
    body: (
      | {
          text: string;
          url?: string;
          subtext?: string;
        }
      | {
          date: Date | string;
          type: 'weektime';
        }
    )[];
  }[];
  openingSongs: {
    title: string;
    author: string;
    episode: string;
    url?: string;
  }[];
  endingSongs: {
    title: string;
    author: string;
    episode: string;
    url?: string;
  }[];
  related: {
    type: string;
    links: {
      url: string;
      title: string;
      type: 'anime' | 'manga';
      id: number | string;
      list?: {
        status: number;
        score: number;
        episode: number;
      };
    }[];
  }[];
  recommendations?: Recommendation[];
  reviews?: Review[];
}

export type Recommendation = {
  entry: {
    title: string;
    url: string;
    image: string;
    list?: {
      status: number;
      score: number;
      episode: number;
    };
  };
  stats?: {
    users: string;
  };
  user?: {
    name: string;
    href: string;
  };
  body?: {
    text: string;
    more: {
      url: string;
      number: number;
    };
  };
};

export type Review = {
  user: {
    name: string;
    image: string;
    href: string;
  };
  body: {
    people: number;
    date: string;
    rating: number;
    text: string;
  };
};

export abstract class MetaOverviewAbstract {
  constructor(protected url: string) {
    this.logger = con.m('Meta [O]', 'green');
    return this;
  }

  protected abstract readonly type: 'anime' | 'manga';

  private run = false;

  async init() {
    if (this.run) return this;

    const cache = this.getCache();
    if (await cache.hasValueAndIsNotEmpty()) {
      this.logger.log('Cached');
      this.meta = await cache.getValue();
      this.run = true;
      await this.fillOverviewState();
      return this;
    }

    await this._init();
    this.run = true;
    await cache.setValue(this.getMeta());
    await this.fillOverviewState();
    return this;
  }

  protected async fillOverviewState() {
    const useEnglishTitle = api.settings.get('forceEnglishTitles');
    for (const relation in this.meta.related) {
      for (const linkIndex in this.meta.related[relation].links) {
        const link = this.meta.related[relation].links[linkIndex];
        // eslint-disable-next-line no-await-in-loop
        const dbEntry = await api.request.database('entry', {
          id: link.id,
          type: link.type,
        });
        if (dbEntry) {
          link.list = {
            status: dbEntry.status,
            score: dbEntry.score,
            episode: dbEntry.watchedEp,
          };
          const syncMode = getSyncMode(link.type);
          if (
            useEnglishTitle &&
            dbEntry.title &&
            (syncMode === 'MAL' || syncMode === 'MALAPI')
          ) {
            link.title = dbEntry.title;
          }
        }
      }
    }
  }

  protected abstract _init();

  protected logger;

  protected meta: Overview = {
    title: '',
    alternativeTitle: [],
    description: '',
    image: '',
    imageLarge: '',
    characters: [],
    statistics: [],
    info: [],
    openingSongs: [],
    endingSongs: [],
    related: [],
  };

  getMeta() {
    return this.meta;
  }

  cacheObj?: Cache = undefined;

  getCache() {
    if (this.cacheObj) return this.cacheObj;
    this.cacheObj = new Cache(
      `v4/${api.storage.lang('locale')}/${this.url}`,
      5 * 24 * 60 * 60 * 1000,
    );
    return this.cacheObj;
  }
}
