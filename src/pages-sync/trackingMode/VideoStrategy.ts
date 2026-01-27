import { PlayerSingleton } from '../../utils/player';
import { ProgressElement, TrackingModeInterface } from './TrackingModeInterface';

export class VideoStrategy implements TrackingModeInterface {
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

  start() {
    const syncDuration = Number(api.settings.get('videoDuration')) / 100;
    PlayerSingleton.getInstance()
      .startTracking()
      .addListener('VideoStrategy', item => {
        const progress = item.current / item.duration;
        if (this.trackingResolve && !item.paused && progress >= syncDuration) {
          this.trackingResolve();
          this.trackingResolve = null;
        }
        if (this.listener) {
          this.listener({
            progress,
            progressTrigger: syncDuration,
          });
        }
        // TODO: Error after 5 minutes
      });
  }

  stop() {
    PlayerSingleton.getInstance().removeListener('VideoStrategy');
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
