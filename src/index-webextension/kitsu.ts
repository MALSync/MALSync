import { KitsuClass } from '../kitsu/kitsuClass';
import { firebaseNotification } from '../utils/firebaseNotification';

let lastFocus;

function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';
  const kitsu = new KitsuClass(window.location.href);
  messageKitsuListener(kitsu);
  firebaseNotification();

  $(window).blur(function () {
    lastFocus = Date.now();
  });
}

const css =
  'font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;';
console.log('%cMAL-Sync', css, `Version: ${api.storage.version()}`);

api.settings.init().then(() => {
  main();
});

function messageKitsuListener(kitsu: KitsuClass) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'TabMalUrl') {
      if (Date.now() - lastFocus < 3 * 1000) {
        con.info('miniMAL');
        kitsu.getMalUrl().then(malUrl => {
          const res = {
            url: malUrl,
            image: kitsu.getImage(),
            title: kitsu.getTitle(),
          };
          if (!malUrl && api.settings.get('syncMode') === 'KITSU') {
            res.url = kitsu.url;
          }
          sendResponse(res);
        });
        return true;
      }
    }
    return false;
  });
}
