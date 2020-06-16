import { releaseItemInterface } from '../background/releaseProgress';

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

  getPrediction(): number {
    return this.getProgressPrediction();
  }
}
