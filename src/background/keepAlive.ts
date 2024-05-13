export class KeepAlive {
  timer: NodeJS.Timer | null = null;

  start() {
    this.timer = setInterval(chrome.runtime.getPlatformInfo, 20e3);
  }

  stop() {
    clearInterval(this.timer!);
  }
}
