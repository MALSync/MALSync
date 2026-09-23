import { pageInterface } from '../pageInterface';

export const Animex: pageInterface = {
  name: 'Animex',
  domain: 'https://animex.one',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    // Match: animex.one/watch/one-piece-21-episode-1
    return /animex\.one\/watch\/.+-episode-\d+/.test(url);
  },
  sync: {
    getTitle(url) {
      // <h1 class="line-clamp-2 text-xl font-black select-text md:text-4xl">ONE PIECE</h1>
      return j.$('h1.line-clamp-2').first().text().trim();
    },
    getIdentifier(url) {
      // Extract slug before "-episode-", e.g. "one-piece-21" from "one-piece-21-episode-1"
      const match = url.match(/\/watch\/(.+)-episode-\d+/);
      return match ? match[1] : '';
    },
    getOverviewUrl(url) {
      const identifier = Animex.sync.getIdentifier(url);
      return `https://animex.one/anime/${identifier}`;
    },
    getEpisode(url) {
      // Extract episode number from URL: "...episode-1" → 1
      const match = url.match(/episode-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    },
    nextEpUrl(url) {
      const ep = Animex.sync.getEpisode(url);
      const identifier = Animex.sync.getIdentifier(url);
      return `https://animex.one/watch/${identifier}-episode-${ep + 1}`;
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.line-clamp-2').first().text().trim();
    },
    getIdentifier(url) {
      // Match: animex.one/anime/one-piece-21
      const match = url.match(/\/anime\/(.+)/);
      return match ? match[1] : '';
    },
    uiSelector(selector) {
      j.$('h1.line-clamp-2').first().after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less'));
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};
