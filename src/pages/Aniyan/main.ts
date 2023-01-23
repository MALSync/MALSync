import { pageInterface } from '../pageInterface';

export const Aniyan: pageInterface = {
  name: 'Aniyan',
  domain: 'https://aniyan.net',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'episodios') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('.pag_episodes > .item:nth-child(2) > a').attr('title') || '';
    },
    getIdentifier(url) {
      return Aniyan.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('.pag_episodes > .item:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      return getEpisode(j.$('.anipage_tituloep > h1').text());
    },
    nextEpUrl(url) {
      return j.$('.pag_episodes > .item:nth-child(3) > a').attr('href');
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};

function getEpisode(text) {
  if (text.length === 0) return NaN;

  const matches = text.match(/(:E)\s*\d+/gim);

  if (!matches || matches.length === 0) return 1;

  return Number(matches[0].replace(/\D+/g, ''));
}
