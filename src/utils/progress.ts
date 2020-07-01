import { releaseItemInterface } from '../background/releaseProgress';
import { timestampToShortTime } from './time';

export class Progress {
  protected logger;

  protected releaseItem: undefined | releaseItemInterface = undefined;

  constructor(protected cacheKey: string, protected type: 'anime' | 'manga') {
    this.logger = con.m('progress').m(cacheKey.toString());
    return this;
  }

  // Progress
  protected async initReleaseProgress() {
    const releaseItem: undefined | releaseItemInterface = await api.storage.get(
      `release/${this.type}/${this.cacheKey}`,
    );

    this.logger.m('Init Release').log(releaseItem);
    if (!releaseItem) return;

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

  // General
  async init() {
    await this.initReleaseProgress();
    return this;
  }

  getCurrentEpisode(): number {
    return this.getProgressCurrentEpisode();
  }

  isFinished(): boolean {
    return this.isProgressFinished();
  }

  getPredictionTimestamp(): number {
    return this.getProgressPrediction();
  }

  getPrediction(): string {
    return timestampToShortTime(this.getPredictionTimestamp());
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
