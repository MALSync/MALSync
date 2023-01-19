import { pageInterface } from '../pageInterface';

export const ADN: pageInterface = {
  name: 'ADN',
  domain: 'https://animationdigitalnetwork.fr',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean($('div[data-testid="video-player"]').length);
  },
  isOverviewPage(url) {
    return Boolean($('a[data-testid="watchlist-button"]').length);
  },
  sync: {
    getTitle(url) {
      return j.$('div[data-testid="player-content"] h1 a').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return `${ADN.domain}/video/${ADN.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const temp = url.match(/episode-(\d+)/i);
      if (!temp) return 1;
      return Number(temp[1]);
    },
  },
  overview: {
    getTitle(url) {
      return $('div[data-testid="default-layout"] h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('div[data-testid="default-layout"] h2').first().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div[data-testid="default-layout"] ul li[itemtype] > div');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), ADN.domain);
      },
      elementEp(selector) {
        return ADN.sync.getEpisode(selector.find('a').attr('href') || '');
      },
    },
  },
  init(page) {
    const handlePage = () => {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
      utils.changeDetect(
        () => {
          page.handleList(true, 3);
        },
        () => {
          return j.$('div[data-testid="default-layout"] ul li[itemtype] > div > a').attr('href');
        },
      );
    };
    utils.waitUntilTrue(
      () =>
        Boolean(j.$('div[data-testid="comments-panel"]').length) &&
        (Boolean(j.$('div[data-testid="video-player"]').length) ||
          Boolean(j.$('div[data-testid="viewbar-progress"]').length)),
      handlePage,
      1000,
    );
  },
};
