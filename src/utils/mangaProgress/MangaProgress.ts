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

  finished(): boolean {
    const result = this.getProgress();
    const percentage = 90;
    if (result === null) return false;
    const limit = Math.floor((result.total / 100) * percentage);
    if (limit < 1) return true;
    return result.current >= limit;
  }

  execute() {
    this.result = this.applyConfig();
  }
}
