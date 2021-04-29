import { SyncPage } from './pages/syncPage';
import { AnilistClass } from './anilist/anilistClass';
import { KitsuClass } from './kitsu/kitsuClass';
import { SimklClass } from './simkl/simklClass';
import { getPlayerTime } from './utils/player';
import { pages } from './pages-adult/pages';
import { oauth } from './utils/oauth';
import { floatClick } from './floatbutton/userscript';

function main() {
  if (window.location.href.indexOf('myanimelist.net') > -1) {
    // Do nothing
  } else if (window.location.href.indexOf('anilist.co') > -1) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const anilist = new AnilistClass(window.location.href);
  } else if (window.location.href.indexOf('kitsu.io') > -1) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const kitsu = new KitsuClass(window.location.href);
  } else if (window.location.href.indexOf('simkl.com') > -1) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const simkl = new SimklClass(window.location.href);
  } else if (window.location.href.indexOf('malsync.moe/mal/oauth') > -1) {
    oauth();
  } else {
    let page;
    try {
      if (inIframe()) throw 'iframe';
      page = new SyncPage(window.location.href, pages, floatClick);
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
          /* do nothing */
        });
        api.storage.set('iframePlayer', 'null');
      }
    }, 2000);
  }
}

const css =
  'font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;';
console.log('%cMAL-Sync Adult', css, `Version: ${api.storage.version()}`);

api.settings.init().then(() => {
  main();
});

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
