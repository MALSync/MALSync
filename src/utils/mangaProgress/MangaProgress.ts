import { collectorConfig, executeCollector } from './ModeFactory';
import { Cache } from '../Cache';

export type mangaProgressConfig = {
  condition?: string;
  current: collectorConfig;
  total: collectorConfig;
};

export type mangaProgress = { current: number; total: number };

const logger = con.m('MangaProgress');

const alternativeReader: mangaProgressConfig[] = [
  // AMR
  {
    condition: '#amrapp',
    current: {
      mode: 'text',
      selector: '.amr-pages-nav .text-h6',
      regex: '(\\d+) /',
      group: 1,
    },
    total: {
      mode: 'text',
      selector: '.amr-pages-nav .text-h6',
      regex: '/ (\\d+)',
      group: 1,
    },
  },
];

export class MangaProgress {
  protected configs: mangaProgressConfig[];

  protected page: string;

  protected result: mangaProgress | null = null;

  protected interval;

  protected stopPromise = () => {
    // do nothing
  };

  constructor(configs: mangaProgressConfig[], page: string) {
    this.configs = [...alternativeReader, ...configs];
    this.page = page;
    logger.log('config', this.configs);
  }

  protected getProgressFromCollectors(config: mangaProgressConfig) {
    const current = executeCollector(config.current);
    const total = executeCollector(config.total);
    return { current, total };
  }

  protected applyConfig() {
    for (const key in this.configs) {
      const config = this.configs[key];
      if (config.condition && !j.$(config.condition).length) continue;
      try {
        return this.getProgressFromCollectors(config);
      } catch (e) {
        logger.m(`skip ${key}`).debug(e.message, config);
      }
    }
    return null;
  }

  getProgress() {
    return this.result;
  }

  isSuccessful() {
    return this.result !== null;
  }

  protected getLimit() {
    const percentage = 90;
    const result = this.getProgress();
    if (result === null) return 0;
    const limit = Math.floor((result.total / 100) * percentage);
    return limit;
  }

  progressPercentage() {
    const result = this.getProgress();
    if (result === null) return null;
    if (result.total === 0) return 0;
    const res = result.current / this.getLimit();
    if (res > 1) return 1;
    if (res < 0) return 0;
    return res;
  }

  finished(): boolean {
    const result = this.getProgress();
    if (result === null) return false;
    const limit = this.getLimit();
    if (limit < 1) return true;
    return result.current >= limit;
  }

  execute() {
    this.result = this.applyConfig();
  }

  async start() {
    clearInterval(this.interval);
    await this.checkForUpdatedConfig().catch(e => logger.error(e));
    return new Promise<boolean>((resolve, reject) => {
      this.stopPromise = () => resolve(false);
      let resolved = false;
      this.interval = setInterval(() => {
        this.execute();

        if (!this.isSuccessful()) {
          clearInterval(this.interval);
          reject(new Error('MangaProgress: Progress not found'));
          return;
        }

        if (!resolved) {
          resolved = true;
          resolve(true);
        }

        this.setProgress();

        logger.debug(this.finished(), this.getProgress());
      }, 1000);
    });
  }

  stop() {
    clearInterval(this.interval);
  }

  setProgress() {
    j.$('.ms-progress').css('width', `${this.progressPercentage()! * 100}%`);
    j.$('#malSyncProgress').removeClass('ms-loading').removeClass('ms-done');
    if (this.finished() && j.$('#malSyncProgress').length) {
      j.$('#malSyncProgress').addClass('ms-done');
      j.$('.flash.type-update .sync').trigger('click');
      clearInterval(this.interval);
    }
  }

  protected async checkForUpdatedConfig() {
    const cacheObj = new Cache(`reader/${this.page}`, 24 * 60 * 60 * 1000);
    let res;

    if (await cacheObj.hasValue()) {
      res = await cacheObj.getValue();
    } else {
      const url = `https://api.malsync.moe/static/reader/${this.page}`;
      res = await api.request.xhr('GET', url).then(async response => {
        if (response.status === 200 && response.responseText) {
          return JSON.parse(response.responseText);
        }
        return null;
      });
      await cacheObj.setValue(res);
    }

    if (res) {
      logger.log('Override config', res);
      this.configs = [...alternativeReader, ...res];
    }
  }
}
