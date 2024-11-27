import {
  releaseItemInterface,
  progressIsOld,
  single as updateProgress,
} from '../background/releaseProgressUtils';
import { IntlWrapper } from './IntlWrapper';

export class Progress {
  protected logger;

  protected releaseItem: undefined | releaseItemInterface = undefined;

  constructor(
    protected cacheKey: string,
    protected type: 'anime' | 'manga',
  ) {
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
    if (re && re.value && re.value.predicition && re.value.predicition.timestamp)
      return re.value.predicition.timestamp;
    return null;
  }

  protected getProgressLastTimestamp() {
    const re = this.releaseItem;
    if (re && re.value && re.value.lastEp && re.value.lastEp.timestamp)
      return re.value.lastEp.timestamp;
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
    await Promise.all([this.initReleaseProgress(live)]);

    return this;
  }

  getCurrentEpisode(): number {
    // @ts-ignore
    if (!api.settings.get('epPredictions')) return null;
    return this.getProgressCurrentEpisode();
  }

  isFinished(): boolean {
    return this.isProgressFinished();
  }

  isAiring(): boolean {
    return !this.isFinished();
  }

  getPredictionTimestamp(): number {
    if (!this.getProgressPrediction() || new Date().getTime() > this.getProgressPrediction())
      return NaN;
    return this.getProgressPrediction();
  }

  getPrediction(): string {
    const progress = new IntlWrapper().setTimestamp(this.getPredictionTimestamp()).Progress.get();
    return progress.time;
  }

  getPredictionText(): string {
    const pre = this.getPrediction();
    if (pre) return api.storage.lang(`prediction_Episode_${this.type}`, [pre]);
    return '';
  }

  getLastTimestamp(): number {
    return this.getProgressLastTimestamp();
  }

  getLast(): string {
    const last = new IntlWrapper().setTimestamp(this.getLastTimestamp()).Progress.get();
    return last.time;
  }

  getLastText(): string {
    const last = this.getLast();
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
