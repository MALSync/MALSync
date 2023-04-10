/* eslint-disable no-await-in-loop */
import { flashm } from '../../utils/general';
import { ScriptProxy } from '../../utils/scriptProxy';
import { pageInterface } from '../pageInterface';

// Define the variable proxy element:
const proxy = new ScriptProxy();
proxy.addCaptureVariable(
  'ApiClient',
  `
    if (window.hasOwnProperty("ApiClient")) {
      return ApiClient;
    } else {
      return undefined;
    }
  `,
);

let item: any;

class SessionsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SessionsError';
  }
}

async function getApiKey() {
  return api.storage.get('Jellyfin_Api_Key');
}

async function setApiKey(key) {
  return api.storage.set('Jellyfin_Api_Key', key);
}

async function getBase() {
  return api.storage.get('Jellyfin_Base');
}

async function setBase(key) {
  return api.storage.set('Jellyfin_Base', key);
}

async function getUser() {
  return api.storage.get('Jellyfin_User');
}

async function setUser(key) {
  return api.storage.set('Jellyfin_User', key);
}

async function checkApi(page) {
  const videoEl = $('video');
  if (videoEl.length) {
    $('html').addClass('miniMAL-hide');
    const url = videoEl.attr('src');
    con.log('Video', url);

    if (url) {
      const itemId = await returnPlayingItemId();
      if (!itemId) con.log('No video id');

      const curUrl = `${window.location.origin}/#!/details?id=${itemId}`;

      checkItemId(page, itemId, curUrl, true);
    }
  }
}

async function urlChange(page) {
  $('html').addClass('miniMAL-hide');
  if (window.location.href.includes('id=')) {
    const id = utils.urlParam(window.location.href, 'id');
    await checkItemId(page, id);
  }
}

async function checkItemId(page, id, curUrl = '', video = false) {
  const reqUrl = `/Items?ids=${id}`;
  const response = await apiCall(reqUrl, true);
  const data = JSON.parse(response.responseText);
  if (!data.Items.length) {
    return checkIfAuthIsUpToDate();
  }

  let seriesId;

  const tempItem = data.Items[0];

  switch (tempItem.Type) {
    case 'Episode':
      con.m('Episode').log(data);

      if (!video || !$('video').first().attr('src')) {
        throw 'Execute Episode only on video';
      }

      seriesId = tempItem.SeriesId;
      break;
    case 'Season':
      con.m('Season').log(data);

      seriesId = tempItem.SeriesId;
      break;
    case 'Movie':
      con.m('Movie').log(data);

      if (!video || !$('video').first().attr('src')) {
        throw 'Execute Movie only on video';
      }

      seriesId = tempItem.SeriesId || tempItem.Id;
      break;
    case 'Series':
      con.m('Series').log(data);
      break;
    default:
      con.m('Not recognized').log(data);
  }

  if (!seriesId) {
    throw 'No series id found';
  }

  if (!(await isAnime(seriesId))) {
    throw 'Not an Anime';
  }

  item = tempItem;

  con.info('Anime detected');
  if (curUrl) {
    page.url = curUrl;
    page.handlePage(page.url);
  } else {
    page.handlePage();
  }

  $('html').removeClass('miniMAL-hide');

  return true;
}

const isAnimeCache = {};

async function isAnime(seriesId: string) {
  const logger = con.m('isAnime').m(seriesId);
  if (seriesId in isAnimeCache) {
    logger.m('cached').log(isAnimeCache[seriesId]);
    return isAnimeCache[seriesId];
  }
  const reqUrl = `/Items/${seriesId}`;
  return apiCall(reqUrl, true).then(response => {
    const meta: any = JSON.parse(response.responseText);
    logger.log('meta', meta);
    let isAnimeBool = false;
    if (
      meta.Path.toLowerCase().includes('anime') ||
      meta.GenreItems.find(genre => genre.Name.toLowerCase() === 'anime') ||
      meta.Tags.find(tag => tag.toLowerCase() === 'anime')
    ) {
      isAnimeBool = true;
    }
    logger.log('isAnime', isAnimeBool);
    isAnimeCache[seriesId] = isAnimeBool;
    return isAnimeBool;
  });
}

async function returnPlayingItemId() {
  const deviceId = await getDeviceId();
  const userId = await getUser();
  let i = 0;
  while ($('video').first().attr('src') && i < 10) {
    con.m('playing').log('Waiting for session');
    try {
      const ses = await getSession(deviceId, userId).then(sess => {
        con.log('Now Playing', sess.NowPlayingItem);
        return sess.NowPlayingItem.Id;
      });
      return ses;
    } catch (error) {
      if (error.name !== 'SessionsError') {
        throw error;
      }
    }
    await utils.wait(5000);
    i++;
  }

  throw new SessionsError('No Session');
}

async function getSession(deviceId, userId, user = true) {
  return apiCall('/Sessions', false, user).then(response => {
    const data = JSON.parse(response.responseText);
    con.m('Session').log('Session', data, deviceId, userId, user);
    return parseSession(data, deviceId, userId, user);
  });
}

async function parseSession(data, deviceId, userId, user) {
  if (deviceId) {
    data = data.filter(el => el.DeviceId === deviceId);
  } else if (userId) {
    data = data.filter(el => el.UserId === userId);
  }
  data = data.filter(el => typeof el.NowPlayingItem !== 'undefined');

  if (!data.length) {
    if (deviceId) {
      con.m('Session').m(user).log('Fallback to userId');
      return parseSession(data, null, userId, user);
    }
    if (user) {
      con.m('Session').m(user).log('Fallback to request without ControllableByUserId');
      return getSession(deviceId, userId, false);
    }
    throw new SessionsError('Could not get session');
  }
  con.m('Session').log('found', data);
  return data[0];
}

async function testApi(retry = 0) {
  if (retry > 19) {
    flashm('MALSync could not Authenticate', { error: true });
    throw 'Not Authenticated [Jellyfin]';
  }

  const key = await getApiKey();
  const base = await getBase();
  const user = await getUser();

  if (!key || !base || !user) {
    con.m('Authentication').error('base, user or Key are not set', base, user, key);
    await checkApiClient();
    retry++;
    return testApi(retry);
  }

  return apiCall('/System/Info').then(response => {
    if (response.status !== 200) {
      con.error('Not Authenticated');
      setBase('');
      setApiKey('');
      setUser('');
      retry++;
      return testApi(retry);
    }
    // Calls users to check if userId is correct
    return apiCall('', true)
      .catch(e => {
        con.error('User wrong', e);
        setUser('');
        retry++;
        return testApi(retry);
      })
      .then(response2 => {
        if (response2.status !== 200) {
          con.error('User wrong');
          setUser('');
          retry++;
          return testApi(retry);
        }
        return true;
      });
  });
}

async function checkApiClient() {
  return new Promise((resolve, reject) => {
    proxy.addProxy(async (caller: ScriptProxy) => {
      const apiClient: any = proxy.getCaptureVariable('ApiClient');
      con.m('apiClient').log(apiClient);

      if (apiClient) {
        if (apiClient._serverInfo && apiClient._serverInfo.AccessToken) {
          setApiKey(apiClient._serverInfo.AccessToken);
        }
        if (apiClient._serverAddress) {
          setBase(apiClient._serverAddress);
        }
        if (apiClient._currentUser && apiClient._currentUser.Id) {
          setUser(apiClient._currentUser.Id);
        } else if (apiClient._serverInfo && apiClient._serverInfo.UserId) {
          setUser(apiClient._serverInfo.UserId);
        }
        resolve(true);
        return;
      }
      reject();
    });
  });
}

async function getDeviceId(): Promise<string> {
  return new Promise((resolve, reject) => {
    proxy.addProxy(async (caller: ScriptProxy) => {
      const apiClient: any = proxy.getCaptureVariable('ApiClient');
      con.m('apiClient').log(apiClient);

      if (apiClient && apiClient._deviceId) {
        con.m('apiClient').log('clientId', apiClient._deviceId);
        resolve(apiClient._deviceId);
        return;
      }
      reject();
    });
  });
}

function checkIfAuthIsUpToDate() {
  proxy.addProxy(async (caller: ScriptProxy) => {
    const apiClient: any = proxy.getCaptureVariable('ApiClient');
    con.m('apiClient').log(apiClient);
    const curKey = getApiKey();

    if (
      apiClient &&
      apiClient._serverInfo &&
      apiClient._serverInfo.AccessToken &&
      curKey === apiClient._serverInfo.AccessToken
    ) {
      return;
    }
    con.error('Reset Authentication');
    await setBase('');
    await setApiKey('');
    await setUser('');
    await checkApiClient();
  });
}

// Helper
async function apiCall(url, needsUser = false, filterByUser = false) {
  const apiKey = await getApiKey();
  const base = await getBase();
  let pre;
  if (url.indexOf('?') !== -1) {
    pre = '&';
  } else {
    pre = '?';
  }
  if (needsUser) {
    const user = await getUser();
    url = `/Users/${user}${url}`;
  }
  url = `${base + url + pre}api_key=${apiKey}`;
  if (filterByUser) {
    const user = await getUser();
    url = `${url}&ControllableByUserId=${user}`;
  }
  con.log('Api Call', url);
  return api.request.xhr('GET', url).then(res => {
    if (res.status === 500) {
      con.error('Something went wrong', url, res);
      throw 'Something went wrong';
    }
    return res;
  });
}

export const Jellyfin: pageInterface = {
  name: 'Jellyfin',
  domain: 'https://jellyfin.org/',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url) {
    if (item.Type === 'Episode' || item.Type === 'Movie') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      if (item.Type === 'Movie') {
        return item.Name;
      }
      return (
        item.SeriesName + (item.ParentIndexNumber > 1 ? ` Season ${item.ParentIndexNumber}` : '')
      );
    },
    getIdentifier(url) {
      if (typeof item.SeasonId !== 'undefined') return item.SeasonId;
      if (typeof item.SeriesId !== 'undefined') return item.SeriesId;
      return item.Id;
    },
    getOverviewUrl(url) {
      return `${Jellyfin.domain}/#!/details?id=${Jellyfin.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return item.IndexNumber;
    },
  },
  overview: {
    getTitle(url) {
      return item.SeriesName + (item.IndexNumber > 1 ? ` Season ${item.IndexNumber}` : '');
    },
    getIdentifier(url) {
      return item.Id;
    },
    uiSelector(selector) {
      j.$('.page:not(.hide) .detailPageContent').first().prepend(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    testApi().then(() => {
      con.info('Authenticated');
      utils.changeDetect(
        () => {
          page.reset();
          checkApi(page);
        },
        () => {
          const src = $('video').first().attr('src');
          if (typeof src === 'undefined') return 'NaN';
          return src;
        },
      );
      utils.urlChangeDetect(() => {
        const newUrl = window.location.href;
        // We don't need to reset state when switching to the video player or if a dialog pops up
        if (newUrl.includes('/video') || newUrl.includes('/dialog')) return;

        page.reset();
        urlChange(page);
      });
      j.$(document).ready(function () {
        utils.waitUntilTrue(
          function () {
            return j.$('.page').length;
          },
          function () {
            urlChange(page);
          },
        );
      });
      document.addEventListener('fullscreenchange', function () {
        if (
          window.fullScreen ||
          (window.innerWidth === window.screen.width && window.innerHeight === window.screen.height)
        ) {
          $('html').addClass('miniMAL-Fullscreen');
        } else {
          $('html').removeClass('miniMAL-Fullscreen');
        }
      });
    });
  },
};
