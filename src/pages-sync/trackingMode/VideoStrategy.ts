import { PlayerSingleton } from '../../utils/player';
import { TrackingModeInterface } from './TrackingModeInterface';

export class VideoStrategy implements TrackingModeInterface {
  trackingResolve: (() => void) | null = null;

  async waitForTrackingAction() {
    await utils.wait(10 * 1000);
    return new Promise<void>(resolve => {
      this.trackingResolve = resolve;
    });
  }

  start() {
    const syncDuration = api.settings.get('videoDuration') as number;
    PlayerSingleton.getInstance()
      .startTracking()
      .addListener('VideoStrategy', item => {
        const progressInPercent = (item.current / item.duration) * 100;
        if (this.trackingResolve && !item.paused && progressInPercent >= syncDuration) {
          this.trackingResolve();
          this.trackingResolve = null;
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
