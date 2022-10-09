import { pageInterface } from '../pageInterface';

export const Vostfree: pageInterface = {
  name: 'Vostfree',
  domain: 'https://vostfree.cx',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return !!j.$('#player-tabs').length;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h1')
        .text()
        .replace(/ (FRENCH|VOSTFR|VF)$/, '');
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3).split('-')[0] || '';
    },
    getOverviewUrl(url) {
      return url;
    },
    getEpisode(url) {
      const selectText = j
        .$('#player-tabs .new_player_selector_box .jq-selectbox__select-text')
        .text();
      return Number(selectText.replace('Episode ', '')) || 1;
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

      utils.changeDetect(
        () => {
          page.reset();
          page.handlePage();
        },
        () => {
          return j.$('#player-tabs .new_player_selector_box .jq-selectbox__select-text').text();
        },
      );
    });
  },
};
