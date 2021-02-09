import { AnilistClass } from '../anilist/anilistClass';
import { firebaseNotification } from '../utils/firebaseNotification';

let lastFocus;

function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';
  const anilist = new AnilistClass(window.location.href);
  messageAniListListener(anilist);
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

function messageAniListListener(anilist) {
  const logger = con.m('TabMalUrl');
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (Date.now() - lastFocus < 3 * 1000) {
      if (msg.action === 'TabMalUrl') {
        logger.info('miniMAL');
        anilist.getMalUrl().then(malUrl => {
          if (malUrl !== '') {
            logger.log('TabMalUrl Message', malUrl);
            sendResponse(malUrl);
          } else if (api.settings.get('syncMode') === 'ANILIST') {
            logger.log('TabUrl Message', anilist.url);
            sendResponse(anilist.url);
          }
        });
        return true;
      }
      return false;
    }
    logger.log('Focus timeout');
    return false;
  });
}
