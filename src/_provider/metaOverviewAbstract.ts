import * as definitions from './definitions';

export interface Overview {
  title: string;
  alternativeTitle: string[];
  description: string;
  image: string;
  characters: {
    img: string;
    html: string;
  }[];
  statistics: {
    title: string;
    body: string;
  }[];
  info: {
    title: string;
    body: string;
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

  async init() {
    await this._init();
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

  protected errorObj(code: definitions.errorCode, message): definitions.error {
    return {
      code,
      message,
    };
  }
}
