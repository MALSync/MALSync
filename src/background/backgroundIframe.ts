import { Mutex } from 'async-mutex';
import { getList } from '../_provider/listFactory';
import { openInvisiblePage } from './exclusive/iframeOpen-general';

declare let browser: any;
export function checkInit() {
  chrome.alarms.get('updateCheck', function(a) {
    if (typeof a !== 'undefined') {
      con.log(a);
    }
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'updateCheck' || alarm.name === 'updateCheckNow') {
      api.settings.init().then(() => {
        startCheck('anime');
        startCheck('manga');
      });
    }
  });
}

let retry = false;

export function checkContinue(message) {
  if (message.id === 'retry') {
    retry = true;
    con.log('Retry recived');
    return;
  }

  let { id } = message;
  con.log('Iframe update check done', message);
  removeIframes();

  if (id === null) {
    const contObj = Object.keys(continueCheck);
    con.info('Missing Id', contObj.length);
    if (contObj.length === 1) {
      [id] = contObj;
      con.log('Auto set Id', contObj[0]);
    }
  }

  if (continueCheck[id]) {
    continueCheck[id](message.epList, message.len, message.error);
    delete continueCheck[id];
  }
}

let continueCheck = {};
let hiddenTabs: any = [];
const mutex = new Mutex();

async function startCheck(type = 'anime') {
  const release = await mutex.acquire();

  con.log('startCheck', type);
  con.log('hideTab', utils.canHideTabs());
  setBadgeText('⟲');

  const mutexTimout = setTimeout(() => {
    setBadgeText('');
    release();
  }, 30 * 60 * 1000);

  continueCheck = {};

  const listProvider = await getList(1, type);
  listProvider
    .getCompleteList()
    .then(async list => {
      con.log('list', list);
      for (let i = 0; i < list.length; i++) {
        con.log('el', list[i]);
        await updateElement(list[i], type);
      }
      removeIframes();
      api.storage.set('updateCheckLast', Date.now());
      setBadgeText('');
      release();
      clearTimeout(mutexTimout);
    })
    .catch(e => {
      con.error(e);
      setBadgeText('');
      release();
    });
}

async function updateElement(el, type = 'anime', retryNum = 0) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve, reject) => {
    const anime_num_episodes = el.totalEp;
    const anime_image_path = el.image;
    const anime_title = el.title;
    const num_watched_episodes = el.watchedEp;

    const id = Math.random()
      .toString(36)
      .substr(2, 9);

    if (el.options && el.options.u) {
      console.log(el.options.u);

      const elCache = await api.storage.get(`updateCheck/${type}/${el.cacheKey}`);
      con.log('cached', elCache);
      if ((typeof elCache !== 'undefined' && elCache.finished) || !isSupported(el.options.u)) {
        resolve();
        return;
      }

      // Remove other iframes
      removeIframes();
      // Create iframe
      openInvisiblePage(el.options.u, id, hiddenTabs);

      const timeout = setTimeout(async function() {
        api.storage.set(`updateCheck/${type}/${el.cacheKey}`, checkError(elCache, 'Timeout'));
        if (retry && retryNum < 3) {
          con.log('retry', retryNum);
          retry = false;
          retryNum++;
          await updateElement(el, type, retryNum);
        }
        resolve();
      }, 60000);
      continueCheck[id] = async function(list, len, error) {
        clearTimeout(timeout);

        if (typeof error !== 'undefined' && error) {
          api.storage.set(`updateCheck/${type}/${el.cacheKey}`, checkError(elCache, error));
          resolve();
          return;
        }

        let newestEpisode = 0;
        if (typeof list !== 'undefined' && list.length > 0) {
          newestEpisode = list.length - 1;
        }
        if (typeof len !== 'undefined' && len) {
          newestEpisode = len;
        }

        if (newestEpisode) {
          con.log('Episode list found', {
            newestEpisode,
          });

          let finished = false;
          if (newestEpisode >= parseInt(anime_num_episodes) && parseInt(anime_num_episodes) !== 0) {
            con.log('Finished');
            finished = true;
          }

          api.storage.set(`updateCheck/${type}/${el.cacheKey}`, {
            timestamp: Date.now(),
            newestEp: newestEpisode,
            finished,
          });

          if (typeof elCache !== 'undefined' && newestEpisode > elCache.newestEp && elCache.newestEp !== '') {
            con.log('new Episode');
            api.settings.init().then(() => {
              if (api.settings.get('updateCheckNotifications')) {
                let EpisodeText = 'Episode ';
                if (type === 'manga') {
                  EpisodeText = 'Chapter ';
                }

                utils.notifications(el.options.u, anime_title, EpisodeText + newestEpisode, anime_image_path);
              }
            });
          } else {
            con.log('No new episode');
          }

          if (typeof list !== 'undefined' && list.length > 0) {
            // Update next Episode link
            const continueUrlObj = await utils.getContinueWaching(type, el.cacheKey);
            const nextUserEp = parseInt(num_watched_episodes) + 1;

            con.log('Continue', continueUrlObj);
            if (typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === nextUserEp) {
              con.log('Continue link up to date');
            } else {
              con.log('Update continue link');
              const nextUserEpUrl = list[nextUserEp];
              if (typeof nextUserEpUrl !== 'undefined') {
                con.log('set continue link', nextUserEpUrl, nextUserEp);
                utils.setContinueWaching(nextUserEpUrl, nextUserEp, type, el.cacheKey);
              }
            }
          }
        } else {
          con.log(checkError(elCache, 'Episode list empty'));
          api.storage.set(`updateCheck/${type}/${el.cacheKey}`, checkError(elCache, 'Episode list empty'));
          con.error('Episode list empty');
        }
        resolve();
      };
    } else {
      resolve();
    }
  });
}

function checkError(elCache, error) {
  if (typeof elCache === 'undefined') {
    elCache = { newestEp: '', finished: false, timestamp: Date.now() };
  }
  elCache.error = error;
  return elCache;
}

function removeIframes() {
  if (utils.canHideTabs()) {
    // Firefox
    if (hiddenTabs.length) {
      for (let i = 0; i < hiddenTabs.length; i++) {
        chrome.tabs.remove(hiddenTabs[i]);
      }
    }
    hiddenTabs = [];
  } else {
    // Chrome
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
      iframes[i].parentNode!.removeChild(iframes[i]);
    }
  }
}

function setBadgeText(text: string) {
  try {
    chrome.browserAction.setBadgeText({ text });
  } catch (e) {
    con.error(e);
  }
}

function isSupported(url: string) {
  if (url.indexOf('netflix.') > -1) return false;
  if (url.indexOf('emby.') > -1) return false;
  if (url.indexOf('plex.') > -1) return false;
  return true;
}
