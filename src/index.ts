import { syncPage } from './pages/syncPage';
import { myanimelistClass } from './myanimelist/myanimelistClass';
import { anilistClass } from './anilist/anilistClass';
import { kitsuClass } from './kitsu/kitsuClass';
import { simklClass } from './simkl/simklClass';
import { scheduleUpdate } from './utils/scheduler';
import { firebaseNotification } from './utils/firebaseNotification';
import { getPlayerTime, shortcutListener } from './utils/player';
import { pages } from './pages/pages';
import { oauth } from './utils/oauth';
import { floatClick } from './floatbutton/userscript';

let page;

function main() {
  if (window.location.href.indexOf('myanimelist.net') > -1) {
    const mal = new myanimelistClass(window.location.href);
    mal.init();
    if (window.location.href.indexOf('episode') > -1) {
      runPage();
    }
  } else if (window.location.href.indexOf('anilist.co') > -1) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const anilist = new anilistClass(window.location.href);
  } else if (window.location.href.indexOf('kitsu.io') > -1) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const kitsu = new kitsuClass(window.location.href);
  } else if (window.location.href.indexOf('simkl.com') > -1) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const simkl = new simklClass(window.location.href);
  } else if (window.location.href.indexOf('malsync.moe/mal/oauth') > -1) {
    oauth();
  } else {
    runPage();
  }
  firebaseNotification();

  shortcutListener(shortcut => {
    con.log('[content] Shortcut', shortcut);
    switch (shortcut.shortcut) {
      case 'correctionShort':
        page.openCorrectionUi();
        break;
      case 'syncShort':
        j.$('#malSyncProgress').addClass('ms-done');
        j.$('.flash.type-update .sync').click();
        break;
      default:
    }
  });
}

const css =
  'font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;';
console.log('%cMAL-Sync', css, `Version: ${api.storage.version()}`);

api.settings.init().then(() => {
  main();
  scheduler();
});

function runPage() {
  try {
    if (inIframe()) throw 'iframe';
    page = new syncPage(window.location.href, pages, floatClick);
  } catch (e) {
    con.info(e);
    iframe();
    return;
  }
  page.init();
  api.storage.set('iframePlayer', 'null');
  setInterval(async function() {
    const item = await api.storage.get('iframePlayer');
    if (typeof item !== 'undefined' && item !== 'null') {
      page.setVideoTime(item, function(time) {
        /* Do nothing */
      });
      api.storage.set('iframePlayer', 'null');
    }
  }, 2000);
}

async function scheduler() {
  const schedule = await api.storage.get('timestampUpdate/release');
  if (typeof schedule === 'undefined' || j.$.now() - schedule > 345600000) {
    await scheduleUpdate();
    api.storage.set('timestampUpdate/release', j.$.now());
  }
}

function iframe() {
  getPlayerTime(function(item) {
    api.storage.set('iframePlayer', item);
  });
}

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
