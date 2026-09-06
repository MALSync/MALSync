import { MangaBakaClass } from '../mangabaka/MangaBakaClass';

let lastFocus;

function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';
  const mangabaka = new MangaBakaClass();
  messageMangaBakaListener(mangabaka);

  const linkEl = document.createElement('link');
  linkEl.setAttribute('rel', 'stylesheet');
  linkEl.setAttribute('href', chrome.runtime.getURL('vendor/materialFont.css'));
  // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
  j.$('head').append(linkEl);

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

function messageMangaBakaListener(mangabaka: MangaBakaClass) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'TabMalUrl') {
      if (Date.now() - lastFocus < 3 * 1000) {
        let url = mangabaka.getUrl();

        if (api.settings.get('syncMode') !== 'MANGABAKA' && mangabaka.getMalUrl()) {
          url = mangabaka.getMalUrl();
        }
        con.info('miniMAL', url);

        sendResponse({
          url,
          image: mangabaka.getImage(),
          title: mangabaka.getTitle(),
        });

        return true;
      }
    }
    return false;
  });
}
