interface rules {
  provider: 'firebase' | 'user';
  cache?: boolean;
  updated: number;
  last_modified?: string;
  rules: {
    from: {
      title?: string;
      url: number;
      start: number;
      end: number;
    };
    to: {
      title?: string;
      url: number;
      start: number;
      end: number;
    };
  }[];
}

export class RulesClass {
  protected logger;

  protected state: rules | undefined;

  constructor(protected cacheKey: string, protected type: 'anime' | 'manga') {
    this.logger = con.m('Rules');
    return this;
  }

  public async init() {
    this.state = await this.getCache();

    if (!this.state) this.state = await this.api();

    this.logger.m('Result').log(this.state);

    if (this.state) {
      await this.setCache(this.state);
    }
  }

  public getRules() {
    if (this.state && this.state.rules && this.state.rules.length) return this.state.rules;
    return [];
  }

  protected async api(): Promise<rules | undefined> {
    const logger = this.logger.m('API');
    try {
      if (this.type !== 'anime') {
        logger.info('Only supports anime');
        return undefined;
      }

      if (String(this.cacheKey).startsWith('simkl:')) {
        logger.info('Simkl is not supported');
        return undefined;
      }

      const url = `https://api.malsync.moe/rules/${this.cacheKey}`;
      logger.log(url);

      const response = await api.request.xhr('GET', url);
      logger.log('Response', response);

      const res = JSON.parse(response.responseText);

      return {
        provider: 'firebase',
        updated: new Date().getTime(),
        last_modified: res.last_modified,
        rules: res.rules.map(rule => {
          return {
            from: {
              title: rule.from.title,
              url: utils.pageUrl(res.page, this.type, rule.from.id),
              start: rule.from.start,
              end: rule.from.end,
            },
            to: {
              title: rule.to.title,
              url: utils.pageUrl(res.page, this.type, rule.to.id),
              start: rule.to.start,
              end: rule.to.end,
            },
          };
        }),
      };
    } catch (e) {
      logger.error(e);
      return undefined;
    }
  }

  protected async getCache(): Promise<rules | undefined> {
    return api.storage.get(`${this.type}/${this.cacheKey}/Rules`).then(state => {
      if (state) state.cache = true;
      return state;
    });
  }

  protected setCache(cache: rules) {
    cache = JSON.parse(JSON.stringify(cache));
    return api.storage.set(`${this.type}/${this.cacheKey}/Rules`, cache);
  }
}
