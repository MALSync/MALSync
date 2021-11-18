import { Cache } from '../utils/Cache';

export interface Overview {
  title: string;
  alternativeTitle: string[];
  description: string;
  image: string;
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
      statusTag: string;
    }[];
  }[];
}

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
      return this;
    }

    await this._init();
    this.run = true;
    this.getCache().setValue(this.getMeta());
    return this;
  }

  protected abstract _init();

  protected logger;

  protected meta: Overview = {
    title: '',
    alternativeTitle: [],
    description: '',
    image: '',
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
    this.cacheObj = new Cache(`v2/${this.url}`, 5 * 24 * 60 * 60 * 1000);
    return this.cacheObj;
  }
}
