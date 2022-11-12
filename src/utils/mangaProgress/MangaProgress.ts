import { collectorConfig, executeCollector } from './ModeFactory';

export type mangaProgressConfig = {
  condition?: string;
  current: collectorConfig;
  total: collectorConfig;
};

export type mangaProgress = { current: number; total: number };

const logger = con.m('MangaProgress');

export class MangaProgress {
  protected configs: mangaProgressConfig[];

  protected result: mangaProgress | null = null;

  protected interval;

  protected stopPromise = () => {
    // do nothing
  };

  constructor(configs: mangaProgressConfig[]) {
    this.configs = configs;
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

  start() {
    clearInterval(this.interval);
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
    if (this.finished()) {
      j.$('#malSyncProgress').addClass('ms-done');
      j.$('.flash.type-update .sync').trigger('click');
      clearInterval(this.interval);
    }
  }
}
