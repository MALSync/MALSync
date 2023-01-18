import { pageInterface } from '../pageInterface';

const style = require('!to-string-loader!css-loader!less-loader!./style.less');

export const ADN: pageInterface = {
  name: 'ADN',
  domain: 'https://animationdigitalnetwork.fr/',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    if ($('div[data-testid="video-player"]').length) return true;
    return false;
  },
  isOverviewPage(url) {
    if ($('div[data-testid="downline-content-test-id"]').length) return true;
    return false;
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
      return Number(utils.urlPart(url, 5) ? utils.urlPart(url, 5).split('-')[2] : '');
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
      utils.waitUntilTrue(
        () => {
          if (j.$('div[data-testid="viewbar-progress"]').length) return true;
          return false;
        },
        () => {
          j.$('div[data-testid="default-layout"] h2').first().before(j.html(selector));
        },
        100,
      );
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
        return Number(selector.find('h3').first().text().split(' ').pop() || '');
      },
    },
  },
  init(page) {
    const handlePage = () => {
      api.storage.addStyle(style.toString());
      page.handlePage();
      utils.changeDetect(
        () => {
          page.handleList(true, 3);
        },
        () => {
          return j.$('div[data-testid="default-layout"] ul li[itemtype]').first().parent();
        },
      );
    };
    utils.waitUntilTrue(
      () => {
        if (j.$('div[data-testid="comments-panel"]').length) return true;
        return false;
      },
      handlePage,
      1000,
    );
  },
};
