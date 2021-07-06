import { pageInterface } from '../pageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';

let item: any;

const proxy = new ScriptProxy();
proxy.addCaptureVariable(
  'auth',
  `
    if (window.hasOwnProperty("localStorage")) {
      return {
        apiKey: window.localStorage.myPlexAccessToken,
        users: window.localStorage.users
      }
    } else {
      return undefined;
    }
  `,
);

const auth: {
  apiKey: null | string;
  serverApiKey: null | string;
  base: null | string;
} = {
  apiKey: null,
  serverApiKey: null,
  base: null,
};

let loadInterval;

async function urlChange(page) {
  window.clearInterval(loadInterval);
  page.reset();
  $('html').addClass('miniMAL-hide');
  let curUrl: string = window.location.href;
  if ($('[class*="MetadataPosterTitle-isSecondary"] [data-qa-id="metadataTitleLink"]').attr('href')) {
    curUrl = $('[class*="MetadataPosterTitle-isSecondary"] [data-qa-id="metadataTitleLink"]').attr('href')!;
  }

  const path = String(utils.urlParam(curUrl, 'key'));
  if (!path) return;
  if (!(path.indexOf('metadata') !== -1)) return;

  apiCall(decodeURIComponent(path)).then(response => {
    let data;
    try {
      data = JSON.parse(response.responseText);
    } catch (e) {
      con.error(e);
      return;
    }

    if (!/(anime|asian)/i.test(data.MediaContainer.librarySectionTitle)) {
      con.info('!Not an Anime!');
      return;
    }

    item = data.MediaContainer.Metadata[0];

    switch (item.type) {
      case 'show':
        con.log('Show', data);

        if (!item.skipChildren) {
          con.log('Series overview. Dont do anything');
          item = undefined;
          return;
        }

        loadInterval = utils.waitUntilTrue(
          function() {
            return j.$('[data-qa-id="preplay-mainTitle"]').length;
          },
          function() {
            page.UILoaded = false;
            page.handlePage(curUrl);
            $('html').removeClass('miniMAL-hide');
          },
        );
        break;
      case 'season':
        con.log('Season', data);
        loadInterval = utils.waitUntilTrue(
          function() {
            return j.$('[data-qa-id="preplay-mainTitle"]').length;
          },
          function() {
            page.UILoaded = false;
            page.handlePage(curUrl);
            $('html').removeClass('miniMAL-hide');
          },
        );
        break;
      case 'episode':
        con.log('Episode', data);
        page.handlePage(curUrl);
        $('html').removeClass('miniMAL-hide');
        break;
      default:
        con.log('Not recognized', data);
    }
  });
}

// Helper
async function apiCall(url) {
  if (!auth.apiKey || !auth.base) await authenticate();
  let pre;
  if (url.indexOf('?') !== -1) {
    pre = '&';
  } else {
    pre = '?';
  }
  const reqUrl = `${auth.base + url + pre}X-Plex-Token=${auth.apiKey}`;
  con.log('Api Call', reqUrl);
  return api.request
    .xhr('GET', {
      url: reqUrl,
      headers: {
        Accept: 'application/json',
      },
    })
    .then(response => {
      if (response.status !== 200) {
        if (!auth.serverApiKey) throw 'Could not authenticate';
        auth.apiKey = auth.serverApiKey;
        auth.serverApiKey = null;
        con.log('Use server apikey');
        return apiCall(url);
      }
      return response;
    });
}

async function authenticate() {
  const logger = con.m('auth');
  logger.log('Start');
  return new Promise((resolve, reject) => {
    proxy.addProxy(async (caller: ScriptProxy) => {
      try {
        const tempAuth: any = proxy.getCaptureVariable('auth');
        if (!tempAuth) throw 'authInfo not found';

        if (!tempAuth.users) throw 'users not found';
        const users = JSON.parse(tempAuth.users);

        if (!tempAuth.apiKey) {
          if (
            users &&
            users.users &&
            users.users.length &&
            (!users.users[0].servers.length || typeof users.users[0].servers[0].accessToken === 'undefined')
          ) {
            logger.log('Switching to no account mode');

            auth.apiKey = null;
            auth.serverApiKey = null;
            auth.base = window.location.origin;

            resolve('');
            return;
          }

          throw 'apiKey not found';
        }
        auth.apiKey = tempAuth.apiKey;

        const user = users.users.find(el => el.authToken === auth.apiKey);
        if (!user) throw 'User not found';
        logger.log('User found', user.id);
        const serverId = user.lastPrimaryServerID;
        logger.log('Server', serverId);
        const server = user.servers.find(el => el.machineIdentifier === serverId);
        if (!server) throw 'Server not found';
        auth.serverApiKey = server.accessToken;
        logger.log('Connections', server.connections);
        if (!server.connections.length) throw 'No connection found';

        // We try to get one working connection uri
        let connection = server.connections[0];
        if (server.connections.length > 1) {
          for (let i = 0; i < server.connections.length; i += 1) {
            const url = server.connections[i].uri;
            logger.log(`Trying ${url}`);

            try {
              // eslint-disable-next-line no-await-in-loop
              const data = await api.request.xhr('GET', {
                url: `${url}/library/sections?X-Plex-Token=${auth.apiKey}`,
                headers: {
                  Accept: 'application/json',
                },
              });

              if (data.status !== 200) {
                throw 'Not reached';
              }

              logger.log(`Reached ${url}`);
              connection = server.connections[i];
              break;
            } catch (e) {
              logger.log(`Ignoring unreachable server url ${url}`);
            }
          }
        }

        auth.base = connection.uri;
        logger.log('Done', auth);
        resolve('');
      } catch (e) {
        logger.error(e);
        reject(e);
      }
    });
  });
}

export const Plex: pageInterface = {
  name: 'Plex',
  domain: 'http://app.plex.tv',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url) {
    if (item && item.type === 'episode') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return item.grandparentTitle + (item.parentIndex > 1 ? ` Season ${item.parentIndex}` : '');
    },
    getIdentifier(url) {
      if (typeof item.parentKey !== 'undefined') return item.parentKey.split('/')[3];
      if (typeof item.grandparentKey !== 'undefined') return item.grandparentKey.split('/')[3];
      return item.key.split('/')[3];
    },
    getOverviewUrl(url) {
      let base = window.location.href.split('?')[0];
      if (!base.includes('server/')) {
        const href =
          window.location.href.split('#')[0] +
          j
            .$('[href^="#!/server"]')
            .first()
            .attr('href');
        base = href.split('?')[0];
      }
      return `${base}?key=/library/metadata/${Plex.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return item.index;
    },
  },
  overview: {
    getTitle(url) {
      if (item.parentTitle) return item.parentTitle;
      return item.title;
    },
    getIdentifier(url) {
      return item.key.split('/')[3];
    },
    uiSelector(selector) {
      j.$('[data-qa-id="preplay-mainTitle"]')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(document).ready(function() {
      urlChange(page);
    });

    utils.changeDetect(
      () => urlChange(page),
      () => {
        const epUrl = $('[class*="MetadataPosterTitle-isSecondary"] [data-qa-id="metadataTitleLink"]').attr('href');
        if (epUrl) return epUrl;
        return String(utils.urlParam(window.location.href, 'key'));
      },
    );

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

    setInterval(() => {
      if (Plex.isSyncPage(page.url)) {
        if (!$('video').length) {
          const seekbar = $('[class*="SeekBar-seekBar-"] [aria-valuemax]').first();
          if (!seekbar) {
            con.m('Player').log('no seekbar');
            return;
          }
          const total = seekbar.attr('aria-valuemax');
          const cur = seekbar.attr('aria-valuenow');
          const playing = Boolean($('[data-qa-id="pauseButton"]').length);
          con.m('Player').debug(cur, total, !playing);
          if (total && cur) {
            page.setVideoTime(
              {
                current: cur,
                duration: total,
                paused: !playing,
              },
              () => {
                con.log('Not supported during chromecast');
              },
            );
          }
        }
      }
    }, 1000);
  },
};
