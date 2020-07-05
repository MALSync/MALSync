import { MetaOverviewAbstract } from '../metaOverviewAbstract';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('Local');
    return this;
  }

  async _init() {
    return this;
  }
}
