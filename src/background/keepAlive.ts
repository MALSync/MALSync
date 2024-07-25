export class KeepAlive {
  timer: NodeJS.Timer | null = null;

  start() {
    if (api.type === 'webextension') {
      this.timer = setInterval(chrome.runtime.getPlatformInfo, 20e3);
    }
  }

  stop() {
    if (api.type === 'webextension') {
      clearInterval(this.timer!);
    }
  }
}
