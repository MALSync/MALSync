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
  if (window.location.href.indexOf('id=') !== -1) {
    const id = utils.urlParam(window.location.href, 'id');
    checkItemId(page, id);
  }
}

async function checkItemId(page, id, curUrl = '', video = false) {
  let reqUrl = `/Items?ids=${id}`;
  apiCall(reqUrl, true).then(response => {
    const data = JSON.parse(response.responseText);
    switch (data.Items[0].Type) {
      case 'Episode':
      case 'Season':
        if (data.Items[0].Type === 'Episode' && !video) {
          con.log('Execute Episode only on video');
          return;
        }

        con.log('Season', data);
        item = data.Items[0];
        reqUrl = `/Genres?Ids=${item.SeriesId}`;
        apiCall(reqUrl).then(response2 => {
          const genres: any = JSON.parse(response2.responseText);
          con.log('genres', genres);
          for (let i = 0; i < genres.Items.length; i++) {
            const genre = genres.Items[i];
            if (genre.Name === 'Anime') {
              con.info('Anime detected');
              if (curUrl) {
                page.url = curUrl;
                page.handlePage(page.url);
              } else {
                page.handlePage();
              }

              $('html').removeClass('miniMAL-hide');
              break;
            }
          }
        });
        break;
      case 'Series':
        con.log('Series', data);
        break;
      default:
        con.log('Not recognized', data);
    }
  });
}

async function returnPlayingItemId() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 10000);
  }).then(() => {
    return apiCall('/Sessions', false, true).then(response => {
      const data = JSON.parse(response.responseText);
      con.log('Session', data);
      for (let i = 0; i < data.length; i++) {
        const sess = data[i];
        if (typeof sess.NowPlayingItem !== 'undefined') {
          con.log('Now Playing', sess.NowPlayingItem);
          return sess.NowPlayingItem.Id;
        }
      }
      return '';
    });
  });
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

  return apiCall('/System/Info').then(async response => {
    if (response.status !== 200) {
      con.error('Not Authenticated');
      setBase('');
      setApiKey('');
      setUser('');
      retry++;
      return testApi(retry);
    }
    return true;
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
        }
        resolve(true);
        return;
      }
      reject();
    });
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
    if (item.Type === 'Episode') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return item.SeriesName + (item.ParentIndexNumber > 1 ? ` Season ${item.ParentIndexNumber}` : '');
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
      j.$('.page:not(.hide) .detailPageContent')
        .first()
        .prepend(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    testApi().then(() => {
      con.info('Authenticated');
      utils.changeDetect(
        () => {
          page.reset();
          checkApi(page);
        },
        () => {
          const src = $('video')
            .first()
            .attr('src');
          if (typeof src === 'undefined') return 'NaN';
          return src;
        },
      );
      utils.urlChangeDetect(function() {
        if (!(window.location.href.indexOf('video') !== -1)) {
          page.reset();
          urlChange(page);
        }
      });
      j.$(document).ready(function() {
        utils.waitUntilTrue(
          function() {
            return j.$('.page').length;
          },
          function() {
            urlChange(page);
          },
        );
      });
      document.addEventListener('fullscreenchange', function() {
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
