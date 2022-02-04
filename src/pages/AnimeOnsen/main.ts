import { pageInterface } from '../pageInterface';

export const AnimeOnsen: pageInterface = {
  name: 'AnimeOnsen',
  domain: ['https://animeonsen.xyz', 'https://www.animeonsen.xyz'],
  database: 'AnimeOnsen',
  languages: ['English', 'Japanese'],
  type: 'anime',
  isOverviewPage(url) {
    // check if current page is details/overview page
    const [, page] = new URL(url).pathname.split('/');
    if (/^details$/i.test(page)) return true;
    return false;
  },
  isSyncPage(url) {
    // check if current page is watch/sync page
    const [, page] = new URL(url).pathname.split('/');
    if (/^watch$/i.test(page)) return true;
    return false;
  },
  overview: {
    getTitle(_) {
      // get anime name
      return j.$('div.metadata-container div.title span[lang="en"]').text() || '';
    },
    getIdentifier(url) {
      // get animeonsen content id for database
      const [, , contentId] = new URL(url).pathname.split('/');
      return contentId || '';
    },
    uiSelector(selector) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('malp-wrapper');
      wrapper.innerHTML = selector;
      j.$('div.content-details').after(wrapper);
    },
    getMalUrl(provider) {
      // get myanimelist anime url
      return new Promise(resolve => {
        if (provider === 'MAL') return resolve(j.$('meta[name="ao-content-mal-url"]').attr('content') || false);
        return false;
      });
    },
  },
  sync: {
    getTitle(_) {
      // get anime name
      return j.$('span.ao-player-metadata-title').text() || '';
    },
    getIdentifier(url) {
      // get animeonsen content id for database
      const [, , contentId] = new URL(url).pathname.split('/');
      return contentId || '';
    },
    getOverviewUrl(url) {
      // generate ao.details url
      const [, , contentId] = new URL(url).pathname.split('/');
      const overviewUrl = new URL(`https://animeonsen.xyz`);
      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      overviewUrl.pathname = `/details/${contentId}`;
      return overviewUrl.href;
    },
    getEpisode(_) {
      // get current episode
      const episode = j.$('meta[name="ao-content-episode"]').attr('content');
      return Number(episode);
    },
    nextEpUrl(url) {
      // generate next episode url
      const currentEpisode = Number(j.$('meta[name="ao-content-episode"]').attr('vacontentlue'));
      const totalEpisodes = Number(j.$('meta[name="ao-content-episode-total"]').attr('content'));
      const nextEpisode: number = currentEpisode + 1;

      if (nextEpisode > totalEpisodes) return undefined;

      const nextEpisodeUrl = new URL(url);
      nextEpisodeUrl.searchParams.set('episode', nextEpisode.toString());

      return nextEpisodeUrl.href;
    },
    getMalUrl(provider) {
      // get myanimelist anime url
      return new Promise(resolve => {
        if (provider === 'MAL') return resolve(j.$('meta[name="ao-content-mal-url"]').attr('content') || false);
        return false;
      });
    },
  },
  init(page) {
    // add styles
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    const checkCondition = () => {
      // check if the document
      // has completed loading.
      return document.readyState === 'complete';
    };
    const start = () => {
      // set handle timeout to 500ms / 0.5s
      const handleTimeout = 5e2;

      // handlePage()
      page.handlePage();

      // handle going back
      j.$('div.ao-player-metadata-navigation button').on('click', () => {
        setTimeout(() => {
          page.handleList();
        }, handleTimeout);
      });

      // handle episode selection
      j.$('select.ao-player-metadata-episode').on('input', () => {
        setTimeout(() => {
          page.handleList();
        }, handleTimeout);
      });

      // handle next-episode
      j.$('button.ao-player-metadata-action-button').on('click', () => {
        setTimeout(() => {
          page.handleList();
        }, handleTimeout);
      });
    };

    // wait until page has fully loaded by
    // checking if loading element exists
    // then executes start() function if true
    /* .ready() method is deprecated since jquery v3.0.0 */
    j.$(document).ready(() => utils.waitUntilTrue(checkCondition, start));
  },
};
