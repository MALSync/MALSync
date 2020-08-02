import * as definitions from './definitions';
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
  openingSongs: string[];
  endingSongs: string[];
  related: {
    type: string;
    links: {
      url: string;
      title: string;
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

  protected abstract async _init();

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
    this.cacheObj = new Cache(this.url, 5 * 24 * 60 * 60 * 1000);
    return this.cacheObj;
  }

  protected errorObj(code: definitions.errorCode, message): definitions.error {
    return {
      code,
      message,
    };
  }
}
