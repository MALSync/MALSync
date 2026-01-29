import { isIframeUrl } from '../../utils/manifest';
import { hasMissingPermissions } from '../../utils/customDomains';
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

  errorListener: ((error: HTMLElement | null) => void) | null = null;

  addErrorListener(callback: (error: HTMLElement | null) => void): void {
    this.errorListener = callback;
  }

  playerFoundTimeout: NodeJS.Timeout | null = null;

  start() {
    const syncDuration = Number(api.settings.get('videoDuration')) / 100;
    let playerFound = false;

    this.playerFoundTimeout = setTimeout(
      async () => {
        if (this.errorListener) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'player-error';
          errorDiv.style.cssText = `
          display: block;
          padding: 5px;
          padding-top: 15px;
          outline: 1px solid #e13f7b;
        `;

          const linkContainer = document.createElement('div');
          linkContainer.style.cssText = `
          display: flex;
          justify-content: space-evenly;
        `;

          if (await hasMissingPermissions()) {
            const missingPermissionsSpan = document.createElement('span');
            missingPermissionsSpan.className = 'player-error-missing-permissions';
            missingPermissionsSpan.style.cssText = `
          padding-top: 10px;
        `;
            missingPermissionsSpan.textContent = api.storage.lang(
              'settings_custom_domains_missing_permissions_header',
            );

            errorDiv.appendChild(missingPermissionsSpan);

            const addLink = document.createElement('a');
            addLink.className = 'player-error-missing-permissions';
            addLink.href = 'https://malsync.moe/pwa/#/settings/customDomains';
            addLink.style.cssText = `
          margin: 10px;
          border-bottom: 2px solid #e13f7b;
        `;
            addLink.textContent = api.storage.lang('Add');

            linkContainer.appendChild(addLink);
          } else {
            const defaultSpan = document.createElement('span');
            defaultSpan.className = 'player-error-default';
            defaultSpan.textContent = api.storage.lang('syncPage_flash_player_error');

            errorDiv.appendChild(defaultSpan);
          }

          const helpLink = document.createElement('a');
          helpLink.href = 'https://discord.com/invite/cTH4yaw';
          helpLink.style.cssText = `
          display: block;
          margin: 10px;
        `;
          helpLink.textContent = 'Help';

          linkContainer.appendChild(helpLink);

          errorDiv.appendChild(linkContainer);

          this.errorListener(errorDiv);

          const iframes = $('iframe')
            .toArray()
            .map(el => utils.absoluteLink($(el).attr('src'), window.location.origin))
            .filter(el => el)
            .filter(el => !isIframeUrl(el));

          con.log('No Player found', iframes);
        }
      },
      5 * 60 * 1000,
    );
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
            current: item.current,
            total: item.duration,
          });
        }
        if (!playerFound) {
          playerFound = true;
          clearTimeout(this.playerFoundTimeout!);
          if (this.errorListener) {
            this.errorListener(null);
          }
        }
      });
  }

  getResumeText(state: ProgressElement) {
    if (!state.current) return null;
    const minutes = Math.floor(state.current / 60);
    const sec = Math.floor(state.current - minutes * 60);
    return `${minutes}:${String(sec).padStart(2, '0')}`;
  }

  canResume(state: ProgressElement) {
    if (!state.current && state.current < 45) return false;
    return PlayerSingleton.getInstance().canSetTime();
  }

  resumeTo(state: ProgressElement) {
    if (!state.current) return Promise.resolve();
    return PlayerSingleton.getInstance().setTime(state.current);
  }

  stop() {
    PlayerSingleton.getInstance().removeListener('VideoStrategy');
    clearTimeout(this.playerFoundTimeout!);
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
