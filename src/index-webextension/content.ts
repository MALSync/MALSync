import { SyncPage } from '../pages/syncPage';
import { firebaseNotification } from '../utils/firebaseNotification';
import { shortcutListener } from '../utils/player';
import { floatClick } from '../floatbutton/extension';
import { pageInterface } from '../pages/pageInterface';

let lastFocus;

declare let _Page: pageInterface;

// @ts-ignore
if (typeof global.doubleLoad !== 'undefined' && global.doubleLoad) {
  con.error('Double Execution');
  throw 'Double Execution';
}
// @ts-ignore
global.doubleLoad = true;

function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';
  const page = new SyncPage(window.location.href, _Page, floatClick);
  messagePageListener(page);
  page.init();
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

let timeAddCb;
function messagePageListener(page) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action === 'TabMalUrl') {
      if (Date.now() - lastFocus < 3 * 1000) {
        con.log('TabMalUrl Message', page.singleObj.url);
        sendResponse(page.singleObj.url);
      }
    }
    if (msg.action === 'videoTime') {
      page.setVideoTime(msg.item, function(time) {
        chrome.runtime.sendMessage({
          name: 'videoTimeSet',
          time,
          sender: msg.sender,
        });
      });
      timeAddCb = async function(forward) {
        let time = parseInt(await api.settings.getAsync('introSkip'));
        if (!forward) time = 0 - time;
        chrome.runtime.sendMessage({
          name: 'videoTimeSet',
          timeAdd: time,
          sender: msg.sender,
        });
      };
    }

    if (msg.action === 'videoTimeSet') {
      con.log('[Iframe] Set Time', msg);
      if (typeof page.tempPlayer === 'undefined') {
        con.error('[Iframe] No player Found');
        return;
      }
      if (typeof msg.time !== 'undefined') {
        page.tempPlayer.play();
        page.tempPlayer.currentTime = msg.time;
        return;
      }
      if (typeof msg.timeAdd !== 'undefined') {
        page.tempPlayer.play();
        page.tempPlayer.currentTime += msg.timeAdd;
        return;
      }
    }
    if (msg.action === 'content') {
      switch (msg.item.action) {
        case 'nextEpShort':
          page.openNextEp();
          break;
        case 'correctionShort':
          page.openCorrectionUi();
          break;
        case 'syncShort':
          j.$('#malSyncProgress').addClass('ms-done');
          j.$('.flash.type-update .sync').click();
          break;
        default:
      }
    }
  });

  shortcutListener(shortcut => {
    con.log('[content] Shortcut', shortcut);
    switch (shortcut.shortcut) {
      case 'introSkipFwd':
        addVideoTime(true);
        break;
      case 'introSkipBwd':
        addVideoTime(false);
        break;
      case 'nextEpShort':
        page.openNextEp();
        break;
      case 'correctionShort':
        page.openCorrectionUi();
        break;
      case 'syncShort':
        j.$('#malSyncProgress').addClass('ms-done');
        j.$('.flash.type-update .sync').click();
        break;
      default:
    }

    async function addVideoTime(forward: boolean) {
      if (typeof page.tempPlayer === 'undefined') {
        if (!timeAddCb) {
          con.error('[content] No iframe and onsite player found');
          return;
        }
        timeAddCb(forward);
        return;
      }
      let time = parseInt(await api.settings.getAsync('introSkip'));
      if (!forward) time = 0 - time;
      page.tempPlayer.currentTime += time;
    }
  });
}
