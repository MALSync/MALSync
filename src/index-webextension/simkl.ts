import { SimklClass } from '../simkl/simklClass';
import { firebaseNotification } from '../utils/firebaseNotification';

let lastFocus;

function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';
  const simkl = new SimklClass(window.location.href);
  messageSimklListener(simkl);
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

function messageSimklListener(simkl: SimklClass) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'TabMalUrl') {
      if (Date.now() - lastFocus < 3 * 1000) {
        con.info('miniMAL');
        simkl.getMalUrl().then(malUrl => {
          const res = {
            url: malUrl,
            image: simkl.getImage(),
            title: simkl.getTitle(),
          };
          if (!malUrl && api.settings.get('syncMode') === 'SIMKL') {
            res.url = simkl.url;
          }
          sendResponse(res);
        });
        return true;
      }
    }
    return false;
  });
}
