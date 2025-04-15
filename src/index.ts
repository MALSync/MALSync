import { SyncPage } from './pages/syncPage';
import { MyAnimeListClass } from './myanimelist/myanimelistClass';
import { AnilistClass } from './anilist/anilistClass';
import { KitsuClass } from './kitsu/kitsuClass';
import { SimklClass } from './simkl/simklClass';
import { firebaseNotification } from './utils/firebaseNotification';
import { getPlayerTime, shortcutListener } from './utils/player';
import { pages } from './pages/pages';
import { oauth } from './utils/oauth';
import { floatClick } from './floatbutton/userscript';
import { initUserProgressScheduler } from './background/releaseProgress';
import { pwa } from './floatbutton/userscriptPwa';
import { databaseRequest, initDatabase } from './background/database';
import { anilistOauth } from './anilist/oauth';
import { shikiOauth } from './_provider/Shikimori/oauth';
import { Chibi } from './pages-chibi/ChibiProxy';
import { NotFoundError } from './_provider/Errors';

let page;

async function main() {
  if (utils.isDomainMatching(window.location.href, 'myanimelist.net')) {
    injectDb();
    const mal = new MyAnimeListClass(window.location.href);
    mal.init();
    if (window.location.href.indexOf('episode') > -1) {
      await runPage();
    }
  } else if (utils.isDomainMatching(window.location.href, 'anilist.co')) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const anilist = new AnilistClass(window.location.href);
  } else if (utils.isDomainMatching(window.location.href, 'kitsu.app')) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const kitsu = new KitsuClass(window.location.href);
  } else if (utils.isDomainMatching(window.location.href, 'simkl.com')) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const simkl = new SimklClass(window.location.href);
  } else if (
    window.location.hostname === 'malsync.moe' &&
    window.location.pathname.startsWith('/mal/oauth')
  ) {
    oauth();
  } else if (
    window.location.hostname === 'malsync.moe' &&
    window.location.pathname.startsWith('/anilist/oauth')
  ) {
    anilistOauth();
  } else if (
    window.location.hostname === 'malsync.moe' &&
    window.location.pathname.startsWith('/shikimori/oauth')
  ) {
    shikiOauth();
  } else if (
    window.location.hostname === 'malsync.moe' &&
    window.location.pathname.startsWith('/pwa')
  ) {
    injectDb();
    pwa();
  } else {
    await runPage();
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

  initUserProgressScheduler();
}

const css =
  'font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;';
console.log('%cMAL-Sync', css, `Version: ${api.storage.version()}`);

api.settings.init().then(() => {
  main();
});

async function runPage() {
  const pageObjects = await Chibi().catch(e => {
    if (e instanceof NotFoundError) {
      return pages;
    }
    throw e;
  });

  try {
    if (inIframe()) throw 'iframe';
    page = new SyncPage(window.location.href, pageObjects, floatClick);
  } catch (e) {
    con.info(e);
    iframe();
    return;
  }
  page.init();
  api.storage.set('iframePlayer', 'null');
  setInterval(async function () {
    const item = await api.storage.get('iframePlayer');
    if (typeof item !== 'undefined' && item !== 'null') {
      page.setVideoTime(item, function (time) {
        /* Do nothing */
      });
      api.storage.set('iframePlayer', 'null');
    }
  }, 2000);
}

function iframe() {
  getPlayerTime(function (item) {
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

let dbActive = false;
function injectDb() {
  api.request.database = async (call, param) => {
    if (!dbActive) {
      await initDatabase();
      dbActive = true;
    }
    return databaseRequest(call, param);
  };
}
