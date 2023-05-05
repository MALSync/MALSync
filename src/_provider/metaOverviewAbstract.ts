import { Cache } from '../utils/Cache';

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
    body: {
      text: string;
      url?: string;
      subtext?: string;
    }[];
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

    if (await this.getCache().hasValueAndIsNotEmpty()) {
      this.logger.log('Cached');
      this.meta = await this.getCache().getValue();
      this.run = true;
      await this.fillOverviewState();
      return this;
    }

    await this._init();
    this.run = true;
    this.getCache().setValue(this.getMeta());
    await this.fillOverviewState();
    return this;
  }

  protected async fillOverviewState() {
    for (const relation in this.meta.related) {
      for (const link in this.meta.related[relation].links) {
        // eslint-disable-next-line no-await-in-loop
        const dbEntry = await api.request.database('entry', {
          id: this.meta.related[relation].links[link].id,
          type: this.meta.related[relation].links[link].type,
        });
        if (dbEntry) {
          this.meta.related[relation].links[link].list = {
            status: dbEntry.status,
            score: dbEntry.score,
            episode: dbEntry.watchedEp,
          };
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

  cacheObj: any = undefined;

  getCache() {
    if (this.cacheObj) return this.cacheObj;
    this.cacheObj = new Cache(`v3/${this.url}`, 5 * 24 * 60 * 60 * 1000);
    return this.cacheObj;
  }
}
