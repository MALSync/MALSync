import { TrackingModeInterface } from './TrackingModeInterface';

export class ManualStrategy implements TrackingModeInterface {
  start() {}

  stop() {}

  waitForTrackingAction() {
    // Do nothing and wait for manual action
    return new Promise<void>(() => {});
  }

  flashOptions() {
    return {
      hoverInfo: true,
      error: true,
      type: 'update',
      minimized: false,
    };
  }
}
