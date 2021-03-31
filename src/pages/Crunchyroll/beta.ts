import { pageInterface } from '../pageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';
import { handle } from './main';

const proxy = new ScriptProxy();

proxy.addCaptureVariable(
  'auth',
  `
    if (window.hasOwnProperty("__APP_CONFIG__")) {
      return __APP_CONFIG__.cxApiParams
    } else {
      return undefined;
    }
  `,
);

export const beta: pageInterface = {
  name: 'BetaCrunchyroll',
  domain: 'https://beta.crunchyroll.com',
  database: 'Crunchyroll',
  languages: ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Arabic', 'Italian', 'Russian'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(j.$('.erc-watch-episode-layout').length);
  },
  isOverviewPage(url) {
    return Boolean(j.$('.erc-series-hero').length);
  },
  sync: {
    getTitle(url) {
      return '123';
    },
    getIdentifier(url) {
      return '123';
    },
    getOverviewUrl(url) {
      return '123';
    },
    getEpisode(url) {
      return 123;
    },
    nextEpUrl(url) {
      return '123';
    },
  },
  overview: {
    getTitle(url) {
      return '123';
    },
    getIdentifier(url) {
      return '123';
    },
    uiSelector(selector) {
      j.$('#tabs')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('#showview_content_videos .list-of-seasons .group-item a');
      },
      elementUrl(selector) {
        return '123';
      },
      elementEp(selector) {
        return 123;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let placeholderInterval;

    j.$(document).ready(function() {
      check();
    });

    utils.urlChangeDetect(() => {
      check();
    });
    function check() {
      auth().then(() => episode('GR4G22K3Y'));

      return;
      clearInterval(placeholderInterval);
      placeholderInterval = utils.waitUntilTrue(
        () => beta.isSyncPage(page.url) || beta.isOverviewPage!(page.url),
        () => {
          // Overview
          if (beta.isOverviewPage!(page.url)) {
            console.log('Waiting for episodes to load');
            clearInterval(placeholderInterval);
            placeholderInterval = utils.waitUntilTrue(
              () => Boolean($('.episode-list .c-playable-card a').length),
              () => {
                const epUrl = $('.episode-list .c-playable-card a')
                  .first()
                  .attr('href');
                handle(epUrl, page);
              },
            );
            return;
          }
          alert('noonon');
          //page.handlePage();
        },
      );
    }
  },
};

const authLogger = con.m('auth');

const authObj = {
  domain: '',
  clientId: '',
  token: '',
  bucket: {
    path: '',
    keyPairId: '',
    policy: '',
    signature: '',
  }
};

async function auth() {
  await getAuthData();
  await getAuthToken();
  await getAuthPolicy();
}

async function getAuthData() {
  const logger = authLogger.m('Data');
  logger.log('start');
  const data = (await proxy.getProxyVariable('auth')) as
    | {
        accountAuthClientId: string;
        anonClientId: string;
        apiDomain: string;
      }
    | undefined;
  if (!data) throw 'No auth Data found';
  authObj.domain = data.apiDomain;
  authObj.clientId = data.accountAuthClientId;
  logger.log(authObj);
}

async function getAuthToken() {
  const logger = authLogger.m('Token');
  logger.log('start');
  const response = await apiCall('/auth/v1/token', 'POST', { basic: true });
  if (response.status !== 200) throw 'Could not get Token';
  const data = JSON.parse(response.responseText) as { access_token: string };
  authObj.token = data.access_token;
  logger.log(authObj);
}

async function episode(id: string) {
  const response = await apiCall(`/objects/${id}`, 'GET', { cms: true });
  console.log(response);
  const data = JSON.parse(response.responseText) as {
    items: {
      id: string;
      external_id: string;
      channel_id: string;
      title: string;
      description: string;
      promo_title: string;
      promo_description: string;
      type: string;
      slug: string;
      episode_metadata: {
        series_id: string;
        series_title: string;
        season_id: string;
        season_title: string;
        season_number: number;
        episode_number: number;
        episode: string;
        sequence_number: number;
        duration_ms: number;
        episode_air_date: Date;
        is_premium_only: boolean;
        is_mature: boolean;
        mature_blocked: boolean;
        is_subbed: boolean;
        is_dubbed: boolean;
        is_clip: boolean;
        available_offline: boolean;
        tenant_categories: string[];
        maturity_ratings: string[];
        subtitle_locales: string[];
        availability_notes: string;
      };
      playback: string;
      linked_resource_key: string;
    }[];
  };
  console.log(data);
}

async function getAuthPolicy() {
  const logger = authLogger.m('Policy');
  logger.log('start');
  const response = await apiCall('/index/v2', 'GET', { bearer: true });
  if (response.status !== 200) throw 'Could not get Policy';
  const data = JSON.parse(response.responseText) as {
    cms: {
      bucket: string;
      policy: string;
      signature: string;
      key_pair_id: string;
      expires: Date;
    }
  };

  authObj.bucket.path = data.cms.bucket;
  authObj.bucket.keyPairId = data.cms.key_pair_id;
  authObj.bucket.policy = data.cms.policy;
  authObj.bucket.signature = data.cms.signature;

  logger.log(authObj);
}

async function apiCall(
  path: string,
  type: 'GET' | 'POST' = 'GET',
  mode: { basic?: boolean; bearer?: boolean; cms?: boolean } = {},
) {
  const reqUrl = authObj.domain + path;
  const options: any = {
    url: reqUrl,
    headers: {
      Accept: 'application/json',
    },
  };

  if (mode.basic) {
    options.headers.authorization = `Basic ${btoa(`${authObj.clientId}:`)}`;
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.data = 'grant_type=etp_rt_cookie';
  }

  if (mode.bearer) {
    options.headers.authorization = `Bearer ${authObj.token}`;
  }

  if (mode.cms) {
    const b = authObj.bucket;
    options.url = `${authObj.domain}/cms/v2${b.path}${path}?Signature=${b.signature}&Policy=${b.policy}&Key-Pair-Id=${b.keyPairId}`;
  }

  return api.request.xhr(type, options);
}
