import { SimklClass } from '../simkl/simklClass';
import { firebaseNotification } from '../utils/firebaseNotification';

let lastFocus;

function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';
  const simkl = new SimklClass(window.location.href);
  messageSimklListener(simkl);
  firebaseNotification();

  $(window).blur(function() {
    lastFocus = Date.now();
  });
}

const css =
  'font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;';
console.log('%cMAL-Sync', css, `Version: ${api.storage.version()}`);

api.settings.init().then(() => {
  main();
});

function messageSimklListener(simkl) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action === 'TabMalUrl') {
      if (Date.now() - lastFocus < 3 * 1000) {
        con.info('miniMAL');
        simkl.getMalUrl().then(malUrl => {
          if (malUrl !== '') {
            con.log('TabMalUrl Message', malUrl);
            sendResponse(malUrl);
          } else if (api.settings.get('syncMode') === 'SIMKL') {
            con.log('TabUrl Message', simkl.url);
            sendResponse(simkl.url);
          }
        });
        return true;
      }
    }
    return false;
  });
}
