import { releaseItemInterface, progressIsOld, single as updateProgress } from '../background/releaseProgress';
import { timestampToShortTime } from './time';

export class Progress {
  protected logger;

  protected releaseItem: undefined | releaseItemInterface = undefined;

  protected updateItem: undefined | { timestamp: number; finished: boolean; newestEp: any; error?: string } = undefined;

  constructor(protected cacheKey: string, protected type: 'anime' | 'manga') {
    this.logger = con.m('progress').m(cacheKey.toString());
    return this;
  }

  // Progress
  protected async initReleaseProgress(liveData) {
    if (liveData) await updateProgress(liveData, this.type, liveData.progressMode);

    const releaseItem: undefined | releaseItemInterface = await api.storage.get(
      `release/${this.type}/${this.cacheKey}`,
    );

    this.logger.m('Init Release').log(releaseItem);
    if (!releaseItem) return;
    if (progressIsOld(releaseItem)) {
      this.logger.log('Too old');
      return;
    }

    this.releaseItem = releaseItem;
  }

  protected getProgressCurrentEpisode() {
    const re = this.releaseItem;
    if (re && re.value && re.value.lastEp && re.value.lastEp.total) return re.value.lastEp.total;
    return null;
  }

  protected isProgressFinished() {
    const re = this.releaseItem;
    if (re && re.finished) return true;
    return false;
  }

  protected getProgressPrediction() {
    const re = this.releaseItem;
    if (re && re.value && re.value.predicition && re.value.predicition.timestamp) return re.value.predicition.timestamp;
    return null;
  }

  protected getProgressLastTimestamp() {
    const re = this.releaseItem;
    if (re && re.value && re.value.lastEp && re.value.lastEp.timestamp) return re.value.lastEp.timestamp;
    return null;
  }

  // Update Check
  protected async initUpdateCheck() {
    if (api.type !== 'webextension') return;
    const update = await api.storage.get(`updateCheck/${this.type}/${this.cacheKey}`);
    if (!update) return;
    if (update.error) return;
    if (!update.timestamp) return;
    if (new Date().getTime() - update.timestamp > 24 * 60 * 60 * 1000) {
      con.log('too old');
      return;
    }
    con.m('update check').log(update);
    this.updateItem = update;
  }

  protected getUpdateCurrentEpisode() {
    const re = this.updateItem;
    if (re && re.newestEp) return re.newestEp;
    return null;
  }

  // General
  async init(
    live:
      | {
          uid: number;
          apiCacheKey: number | string | null;
          title: string;
          cacheKey: string;
          progressMode: string;
          watchedEp: number;
          single: any;
          xhr?: object;
        }
      | false = false,
  ) {
    await Promise.all([this.initReleaseProgress(live), this.initUpdateCheck()]);

    return this;
  }

  getCurrentEpisode(): number {
    // @ts-ignore
    if (!api.settings.get('epPredictions')) return null;
    if (this.updateItem && this.getUpdateCurrentEpisode()) return this.getUpdateCurrentEpisode();
    return this.getProgressCurrentEpisode();
  }

  isFinished(): boolean {
    return this.isProgressFinished();
  }

  isAiring(): boolean {
    return !this.isFinished();
  }

  getPredictionTimestamp(): number {
    if (
      this.updateItem &&
      this.getUpdateCurrentEpisode() &&
      this.getUpdateCurrentEpisode() !== this.getProgressCurrentEpisode()
    ) {
      return NaN;
    }
    if (!this.getProgressPrediction() || new Date().getTime() > this.getProgressPrediction()) return NaN;
    return this.getProgressPrediction();
  }

  getPrediction(): string {
    return timestampToShortTime(this.getPredictionTimestamp());
  }

  getPredictionText(): string {
    const pre = this.getPrediction();
    if (pre) return api.storage.lang(`prediction_Episode_${this.type}`, [pre]);
    return '';
  }

  getLastTimestamp(): number {
    if (
      this.updateItem &&
      this.getUpdateCurrentEpisode() &&
      this.getUpdateCurrentEpisode() !== this.getProgressCurrentEpisode()
    ) {
      return NaN;
    }
    return this.getProgressLastTimestamp();
  }

  getLast(ago = true): string {
    return timestampToShortTime(this.getLastTimestamp(), ago);
  }

  getLastText(): string {
    const last = this.getLast(false);
    if (last) return api.storage.lang(`prediction_Last_${this.type}`, [last]);
    return '';
  }

  getAuto(): string {
    const preT = this.getPrediction();
    if (preT) return preT;
    const lastT = this.getLast();
    if (lastT) return lastT;
    return '';
  }

  getAutoText(): string {
    const preT = this.getPredictionText();
    if (preT) return preT;
    const lastT = this.getLastText();
    if (lastT) return lastT;
    return '';
  }

  getColor(): string {
    if (this.updateItem && this.getUpdateCurrentEpisode()) return '#e91e63';
    return '#f57c00';
  }

  getBars(curEp, totalEp): { totalWidth: number; epWidth: number; predWidth: number } {
    const predEp = this.getCurrentEpisode();
    const res = {
      totalWidth: 100,
      epWidth: 0,
      predWidth: 0,
    };
    if (!totalEp) {
      res.totalWidth = 0;
      if (curEp && (!predEp || curEp >= predEp)) {
        totalEp = Math.ceil(curEp * 1.2);
      } else if (predEp && (!curEp || curEp < predEp)) {
        totalEp = Math.ceil(predEp * 1.2);
      } else {
        return res;
      }
    }
    if (curEp) {
      res.epWidth = (curEp / totalEp) * 100;
      if (res.epWidth > 100) res.epWidth = 100;
    }
    if (predEp) {
      res.predWidth = (predEp / totalEp) * 100;
      if (res.predWidth > 100) res.predWidth = 100;
    }
    return res;
  }
}
