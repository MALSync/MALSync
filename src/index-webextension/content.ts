import { SyncPage } from '../pages-sync/syncPage';
import { firebaseNotification } from '../utils/firebaseNotification';
import { PlayerSingleton, shortcutListener } from '../utils/player';
import { floatClick } from '../floatbutton/extension';
import { pageInterface } from '../pages/pageInterface';

let lastFocus;

declare let _Page: pageInterface | (() => Promise<pageInterface>);
declare let _PageChibi: pageInterface | (() => Promise<pageInterface>) | undefined;

// @ts-ignore
if (typeof global.doubleLoad !== 'undefined' && global.doubleLoad) {
  con.error('Double Execution');
  throw 'Double Execution';
}
// @ts-ignore
global.doubleLoad = true;

async function main() {
  if (api.settings.get('userscriptModeButton')) throw 'Userscript mode';

  let pageObject = typeof _PageChibi !== 'undefined' ? _PageChibi : _Page;
  if (typeof pageObject === 'function') {
    pageObject = await pageObject();
  }

  const page = new SyncPage(window.location.href, pageObject, floatClick);
  messagePageListener(page);
  page.init();
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

let timeAddCb;
function messagePageListener(page) {
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'TabMalUrl') {
      if (Date.now() - lastFocus < 3 * 1000) {
        con.log('TabMalUrl Message', page.singleObj.url);
        sendResponse({
          url: page.singleObj.url,
          title: page.singleObj.getTitle(),
          image: page.singleObj.getImage(),
        });
      }
    }
    if (msg.action === 'videoTime') {
      PlayerSingleton.getInstance().setIframeProgress(msg.item, time => {
        chrome.runtime.sendMessage({
          name: 'videoTimeSet',
          time,
          sender: msg.sender,
        });
      });
      timeAddCb = async function (forward) {
        chrome.runtime.sendMessage({
          name: 'videoTimeSet',
          timeAdd: forward,
          sender: msg.sender,
        });
      };
    }

    if (msg.action === 'videoTimeSet') {
      con.log('[Iframe] Set Time', msg);
      const player = PlayerSingleton.getInstance()['currentPlayer'];
      if (!player) {
        con.error('[Iframe] No player Found');
        return;
      }
      if (typeof msg.time !== 'undefined') {
        player.play();
        player.currentTime = msg.time;
        return;
      }
      if (typeof msg.timeAdd !== 'undefined') {
        player.play();
        player.currentTime += msg.timeAdd;
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
      if (!PlayerSingleton.getInstance().canSetTime()) {
        if (!timeAddCb) {
          con.error('[content] No iframe and onsite player found');
          return;
        }
        timeAddCb(forward);
        return;
      }
      let time = parseInt(await api.settings.getAsync('introSkip'));
      if (!forward) time = 0 - time;

      const player = PlayerSingleton.getInstance()['currentPlayer'];
      if (!player) return;
      await player.play();
      const totalTime = player.currentTime + time;
      if (player.duration && player.duration > 15 && totalTime > player.duration - 3) {
        player.currentTime = player.duration - 3;
        return;
      }
      player.currentTime = totalTime;
    }
  });
}
