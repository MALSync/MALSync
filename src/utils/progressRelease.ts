import {
  releaseItemInterface,
  progressIsOld,
  single as updateProgress,
} from '../background/releaseProgressUtils';
import { Progress } from './progress';

export class ProgressRelease {
  protected logger;

  protected releaseItem?: releaseItemInterface;

  protected progressItem?: Progress;

  constructor(
    protected cacheKey: string,
    protected type: 'anime' | 'manga',
  ) {
    this.logger = con.m('progress').m(cacheKey.toString());
    return this;
  }

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
    await this.initReleaseProgress(live);

    if (this.releaseItem) {
      this.progressItem = new Progress(this.releaseItem.value, this.type);
    } else {
      this.progressItem = new Progress(null, this.type);
    }

    return this;
  }

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

  protected isProgressFinished() {
    const re = this.releaseItem;
    if (re && re.finished) return true;
    return false;
  }

  progress() {
    return this.progressItem;
  }

  isFinished(): boolean {
    return this.isProgressFinished();
  }

  isAiring(): boolean {
    return !this.isFinished();
  }

  getColor(): string {
    return '#f57c00';
  }
}
