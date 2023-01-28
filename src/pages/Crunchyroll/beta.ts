import { pageInterface } from '../pageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';

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

interface SeasonType {
  __class__: string;
  __href__: string;
  __resource_key__: string;
  id: string;
  channel_id: string;
  title: string;
  series_id: string;
  season_number: number;
  is_complete: boolean;
  description: string;
  keywords: string[];
  season_tags: string[];
  is_mature: boolean;
  mature_blocked: boolean;
  is_subbed: boolean;
  is_dubbed: boolean;
  is_simulcast: boolean;
  seo_title: string;
  seo_description: string;
  availability_notes: string;
}

interface EpisodeType {
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
}

const status: {
  episode: EpisodeType | null;
} = {
  episode: null,
};

let authenticated = false;

export const beta: pageInterface = {
  name: 'BetaCrunchyroll',
  domain: 'https://www.crunchyroll.com',
  languages: [
    'English',
    'Spanish',
    'Portuguese',
    'French',
    'German',
    'Arabic',
    'Italian',
    'Russian',
  ],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(j.$('.erc-watch-episode-layout').length);
  },
  isOverviewPage(url) {
    return Boolean(j.$('.erc-series-hero').length);
  },
  sync: {
    getTitle(url) {
      return beta.overview!.getTitle(url);
    },
    getIdentifier(url) {
      return beta.overview!.getIdentifier(url);
    },
    getOverviewUrl(url) {
      const meta = status.episode!.episode_metadata;
      return utils.absoluteLink(`/series/${meta.series_id}/#season=${meta.season_id}`, beta.domain);
    },
    getEpisode(url) {
      return Number(status.episode!.episode_metadata.episode_number) || 1;
    },
    nextEpUrl(url) {
      if (
        $('[data-t="next-episode"] a').length &&
        $('[data-t="next-episode"] a').first().attr('href')
      ) {
        return utils.absoluteLink($('[data-t="next-episode"] a').first().attr('href'), beta.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return status
        .episode!.episode_metadata.season_title.replace(/\(.+[ds]ub\)/i, '')
        .replace(/\(\d+-\d+\)/, '')
        .trim();
    },
    getIdentifier(url) {
      return status.episode!.episode_metadata.season_id;
    },
    uiSelector(selector) {
      j.$('.top-controls').first().before(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('.episode-list .card');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), beta.domain);
      },
      elementEp(selector) {
        const text = selector.find('[class*="playable-card-static__title-link"]').first().text();

        const matches = text.match(/E(\d+)/);

        if (matches) {
          return Number(matches[1]);
        }

        return NaN;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./styleBeta.less').toString(),
    );
    let firstCall = true;
    let placeholderInterval;

    // Episode list update
    utils.changeDetect(
      () => {
        if (beta.overview!.list!.elementsSelector().length) {
          page.handleList();
        }
      },
      () => {
        return beta.overview!.list!.elementsSelector().length;
      },
    );

    j.$(document).ready(function () {
      check();
    });

    utils.changeDetect(
      () => check(),
      () => {
        const sesInfo = $('.season-info').first().text();
        if (sesInfo) return sesInfo;
        return window.location.href;
      },
    );

    async function check() {
      page.reset();
      status.episode = null;
      await auth();

      clearInterval(placeholderInterval);
      placeholderInterval = utils.waitUntilTrue(
        () => beta.isSyncPage(page.url) || beta.isOverviewPage!(page.url),
        async () => {
          // Overview
          if (beta.isOverviewPage!(page.url)) {
            console.log('Waiting for page to load');
            clearInterval(placeholderInterval);
            placeholderInterval = utils.waitUntilTrue(
              () => Boolean($('.episode-list .card a').length),
              async () => {
                const epUrl = $('.episode-list .card a').first().attr('href');
                if (!epUrl) throw 'No Episode found on the page';
                status.episode = await episode(getIdFromUrl(epUrl));
                page.handlePage();
                if (firstCall) firstCallFunction(beta.overview!.getIdentifier(page.url));
                firstCall = false;
              },
            );
            return;
          }
          status.episode = await episode(getIdFromUrl(page.url));
          page.handlePage();
          firstCall = false;
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
  },
};

async function auth() {
  if (authenticated) return;
  await getAuthData();
  await getAuthToken();
  await getAuthPolicy();
  authenticated = true;
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
  authObj.domain = (beta.domain as string) || data.apiDomain;
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
  const logger = con.m('Episode').m(String(id));
  logger.log('start');
  const response = await apiCall(`/objects/${id}`, 'GET', { cms: true });
  logger.log(response.finalUrl);
  const data = JSON.parse(response.responseText) as {
    items?: EpisodeType[];
  };
  if (!data || !data.items || !data.items.length) throw 'No Episode data found';
  const ep = data.items[0];
  if (ep.type !== 'episode') throw 'Not an Episode';

  logger.log(ep);
  return ep;
}

async function seasons(id: string) {
  const logger = con.m('Seasons').m(String(id));
  logger.log('start');
  const response = await apiCall(`/seasons?series_id=${id}`, 'GET', { cms: true });
  logger.log(response.finalUrl);
  const data = JSON.parse(response.responseText) as {
    items: SeasonType[];
  };
  if (!data || !data.items.length) throw 'No Season Data found';

  if (data.items[0].__class__ !== 'season') throw 'Are not seasons';

  logger.log(data.items);
  return data.items;
}

async function getAuthPolicy() {
  const logger = authLogger.m('Policy');
  logger.log('start');
  const response = await apiCall('/index/v2', 'GET', { bearer: true });
  if (response.status !== 200) throw 'Could not get Policy';
  const data = JSON.parse(response.responseText) as {
    cms_web: {
      bucket: string;
      policy: string;
      signature: string;
      key_pair_id: string;
      expires: Date;
    };
  };

  authObj.bucket.path = data.cms_web.bucket;
  authObj.bucket.keyPairId = data.cms_web.key_pair_id;
  authObj.bucket.policy = data.cms_web.policy;
  authObj.bucket.signature = data.cms_web.signature;

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
    let pre = '?';
    if (path.indexOf('?') !== -1) {
      pre = '&';
    }
    options.url = `${authObj.domain}/cms/v2${b.path}${path}${pre}Signature=${b.signature}&Policy=${b.policy}&Key-Pair-Id=${b.keyPairId}`;
  }

  return api.request.xhr(type, options);
}

function getIdFromUrl(url) {
  const res = url.match(/(series|watch)\/([^/]+)/i);
  if (!res[2]) throw `Could not find id in ${url}`;
  return res[2];
}

async function firstCallFunction(id: string) {
  const logger = con.m('Season Selecter');
  if (!window.location.href.includes('season')) {
    logger.log('Nothing to do');
    return;
  }
  const tempUrl = window.location.href.replace('#', '?');
  const selectId = utils.urlParam(tempUrl, 'season');
  logger.log(selectId, id);
  if (selectId === id) {
    logger.log('Correct Season');
    return;
  }

  const ses = await seasons(getIdFromUrl(tempUrl));
  const index = ses.findIndex(se => se.id === selectId);

  if (index === -1) {
    logger.log('Not available here');
    return;
  }

  if (!$('.seasons-select .c-dropdown-content').length) {
    $('.seasons-select [role="button"].trigger').click();
  }

  $('.seasons-select .c-dropdown-content [role="button"]').eq(index).click();
}
