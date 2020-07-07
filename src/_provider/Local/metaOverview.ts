import { MetaOverviewAbstract } from '../metaOverviewAbstract';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('Local');
    this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
    return this;
  }

  protected readonly type;

  async _init() {
    return this;
  }
}
