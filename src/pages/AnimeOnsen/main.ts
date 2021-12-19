import { pageInterface } from '../pageInterface';

export const AnimeOnsen: pageInterface = {
  name: 'AnimeOnsen',
  domain: ['https://animeonsen.xyz', 'https://www.animeonsen.xyz'],
  database: 'AnimeOnsen',
  languages: ['English', 'Japanese'],
  type: 'anime',
  isOverviewPage(url) {
    // added from: https://github.com/MALSync/MALSync/pull/984#discussion_r770401087
    return false;
  },
  isSyncPage(url) {
    // check if current page is /watch page
    const { pathname, searchParams } = new URL(url);
    if (pathname.startsWith('/watch') && searchParams.has('v')) return true;
    return false;
  },
  sync: {
    getTitle(url) {
      // get anime name
      return j.$('meta[name="ao-api-malsync-title"]').attr('value') || '';
    },
    getIdentifier(url) {
      // get ao.id identifier for database
      const urlParams = new URL(url).searchParams;
      const identifier = urlParams.get('v');
      return identifier || '';
    },
    getOverviewUrl(url) {
      // generate ao.details url
      const urlParams = new URL(url).searchParams;
      const overviewUrl = new URL(`https://animeonsen.xyz`);
      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      overviewUrl.searchParams.append('md', urlParams.get('v') || '0');
      return overviewUrl.href;
    },
    getEpisode(url) {
      // get current episode
      const episode = j.$('meta[name="ao-api-malsync-episode"]').attr('value');
      return Number(episode);
    },
    nextEpUrl(url) {
      // generate next episode url
      const currentEpisode = Number(j.$('meta[name="ao-api-malsync-episode"]').attr('value'));
      const totalEpisodes = Number(j.$('meta[name="ao-api-malsync-episodes"]').attr('value'));
      const nextEpisode: number = currentEpisode + 1;

      if (nextEpisode > totalEpisodes) return undefined;

      const nextEpisodeUrl = new URL(url);
      nextEpisodeUrl.searchParams.set('ep', nextEpisode.toString());

      return nextEpisodeUrl.href;
    },
    getMalUrl(url) {
      // get myanimelist anime url
      return new Promise(resolve => {
        resolve(url !== 'MAL' ? false : j.$('meta[name="ao-api-malsync-mal-url"]').attr('value') || false);
      });
    },
  },
  init(page) {
    const checkCondition = () => {
      // check if loading element is still there,
      // this is a shorthand way of checking if
      // the page has fully loaded.
      return j.$('div#loader-wrapper_handler').length === 0;
    };
    const start = () => {
      // set handle timeout to 500ms / 0.5s
      const handleTimeout = 5e2;

      // handlePage()
      page.handlePage();

      // go-home + episode-next
      j.$('div#ao-episode-buttons-wrapper').on('click', () => {
        setTimeout(() => {
          page.handleList();
        }, handleTimeout);
      });

      // next-episode
      j.$('div#ao-button-overlay').on('click', () => {
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
