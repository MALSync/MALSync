import { syncPage } from './pages/syncPage';
import { anilistClass } from './anilist/anilistClass';
import { kitsuClass } from './kitsu/kitsuClass';
import { simklClass } from './simkl/simklClass';
import { getPlayerTime } from './utils/player';
import { pages } from './pages-adult/pages';

function main() {
  if (window.location.href.indexOf('myanimelist.net') > -1) {
  } else if (window.location.href.indexOf('anilist.co') > -1) {
    const anilist = new anilistClass(window.location.href);
  } else if (window.location.href.indexOf('kitsu.io') > -1) {
    const kitsu = new kitsuClass(window.location.href);
  } else if (window.location.href.indexOf('simkl.com') > -1) {
    const simkl = new simklClass(window.location.href);
  } else {
    try {
      if (inIframe()) throw 'iframe';
      var page = new syncPage(window.location.href, pages);
    } catch (e) {
      con.info(e);
      iframe();
      return;
    }
    page.init();
    api.storage.set('iframePlayer', 'null');
    setInterval(async function() {
      const item = await api.storage.get('iframePlayer');
      if (typeof item !== 'undefined' && item != 'null') {
        page.setVideoTime(item, function(time) {});
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
