import { MyAnimeListClass } from '../myanimelist/myanimelistClass';
import { firebaseNotification } from '../utils/firebaseNotification';

let lastFocus: number;

function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';
  const mal = new MyAnimeListClass(window.location.href);
  messageMalListener(mal);
  mal.init();
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

function messageMalListener(mal: MyAnimeListClass) {
  const logger = con.m('TabMalUrl');
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (Date.now() - lastFocus < 3 * 1000) {
      if (msg.action === 'TabMalUrl') {
        logger.log('Response', mal.url);
        sendResponse({
          url: mal.url,
          title: mal.getTitle(),
          image: mal.getImage(),
        });
      }
      return;
    }
    logger.log('Focus timeout');
  });
}
