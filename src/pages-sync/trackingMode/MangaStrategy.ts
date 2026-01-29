import { MangaProgress } from '../../utils/mangaProgress/MangaProgress';
import type { SyncPage } from '../syncPage';
import { ProgressElement, TrackingModeInterface } from './TrackingModeInterface';

export class MangaStrategy implements TrackingModeInterface {
  trackingResolve: (() => void) | null = null;

  async waitForTrackingAction() {
    await utils.wait(10 * 1000);
    return new Promise<void>(resolve => {
      this.trackingResolve = resolve;
    });
  }

  listener: ((progress: ProgressElement) => void) | null = null;

  addListener(callback: (progress: ProgressElement) => void): void {
    this.listener = callback;
  }

  interval: NodeJS.Timeout | null = null;

  start(page: SyncPage) {
    return new Promise<void>((resolve, reject) => {
      const mangaProgress = new MangaProgress(page.page.sync.readerConfig || []);
      const syncDuration = Number(api.settings.get('mangaCompletionPercentage')) / 100;
      let mangaFound = false;

      setTimeout(() => {
        if (!mangaFound) {
          this.stop();
          reject(new Error('MangaStrategy: Timeout waiting for progress'));
        }
      }, 5000);

      this.interval = setInterval(() => {
        const mangaStatus = mangaProgress.execute();
        if (!mangaStatus || !mangaStatus.current || !mangaStatus.total) {
          return;
        }
        mangaFound = true;
        resolve();
        const progress = mangaStatus.current / mangaStatus.total;
        if (this.trackingResolve && progress >= syncDuration) {
          this.trackingResolve();
          this.trackingResolve = null;
        }
        if (this.listener) {
          this.listener({
            progress,
            progressTrigger: syncDuration,
            current: mangaStatus.current,
            total: mangaStatus.total,
          });
        }
      }, 1000);
    });
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  flashOptions() {
    return {
      hoverInfo: true,
      error: false,
      type: 'update',
      minimized: true,
    };
  }
}
