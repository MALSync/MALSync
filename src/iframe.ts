import { getPlayerTime, shortcutListener } from './utils/player';

let tempPlayer: any;

getPlayerTime(function(item, player) {
  chrome.runtime.sendMessage({ name: 'videoTime', item });
  tempPlayer = player;
});

// @ts-ignore
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === 'videoTimeSet') {
    con.log('[Iframe] Set Time', msg);
    if (typeof tempPlayer === 'undefined') {
      con.error('[Iframe] No player Found');
      return;
    }
    if (typeof msg.time !== 'undefined') {
      tempPlayer.play();
      tempPlayer.currentTime = msg.time;
      return;
    }
    if (typeof msg.timeAdd !== 'undefined') {
      tempPlayer.play();
      tempPlayer.currentTime += msg.timeAdd;
    }
  }
});

api.settings.init().then(() => {
  shortcutListener(shortcut => {
    con.log('[iframe] Shortcut', shortcut);
    switch (shortcut.shortcut) {
      case 'introSkipFwd':
        addVideoTime(true);
        break;
      case 'introSkipBwd':
        addVideoTime(false);
        break;
      case 'nextEpShort':
        chrome.runtime.sendMessage({
          name: 'content',
          item: { action: 'nextEpShort' },
        });
        break;
      case 'correctionShort':
        chrome.runtime.sendMessage({
          name: 'content',
          item: { action: 'correctionShort' },
        });
        break;
      case 'syncShort':
        chrome.runtime.sendMessage({
          name: 'content',
          item: { action: 'syncShort' },
        });
        break;
      default:
    }

    async function addVideoTime(forward: boolean) {
      if (typeof tempPlayer === 'undefined') {
        con.error('[Iframe] No player Found');
        return;
      }
      let time = parseInt(await api.settings.getAsync('introSkip'));
      if (!forward) time = 0 - time;
      tempPlayer.currentTime += time;
    }
  });
});
