import { pageInterface } from '../pageInterface';

export const Vostfree: pageInterface = {
  name: 'Vostfree',
  domain: ['https://vostfree.com', 'https://vostfree.cx', 'https://vostfree.tv'],
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return !!j.$('#player-tabs').length;
  },
  sync: {
    getTitle(url) {
      return j.$("h1").text().replace(/ (FRENCH|VOSTFR)$/, '');
    },
    getIdentifier(url) {
      return url.split('/')[2].match(/[0-9]+/)?.[0] || '';
    },
    getOverviewUrl(url) {
      return url;
    },
    getEpisode(url) {
      var selectText = j.$('#player-tabs .new_player_selector_box .jq-selectbox__select-text').text();
      return Number(selectText.replace('Episode ', ''));
    },
    uiSelector(selector) {
      j.$('#player-tabs .new_player_top').first().after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (document.title.includes('Not Found')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};
