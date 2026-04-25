import { TrackingModeInterface } from './TrackingModeInterface';

export class InstantStrategy implements TrackingModeInterface {
  protected timeout: NodeJS.Timeout | null = null;

  waitForTrackingAction() {
    return new Promise<void>(resolve => {
      this.timeout = setTimeout(
        () => {
          resolve();
        },
        api.settings.get('delay') * 1000,
      );
    });
  }

  start() {}

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
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

  note() {
    if (!api.settings.get('delay')) return null;
    return api.storage.lang('settings_AutoTracking_Instant', [api.settings.get('delay')]);
  }
}
