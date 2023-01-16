import { pageInterface } from '../pageInterface';

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
    if ($('div[data-testid="img-testid"]').length) return true;
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
      return Number(j.$('div[data-testid="player-content"] h1 span').text().split(' ')[2]);
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
      offsetHandler: true,
      elementsSelector() {
        return j.$('div[data-testid="default-layout"] ul li[itemtype] div');
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
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if ($('div[data-testid="comments-panel"]').length) {
        page.handlePage();
      }
    });
  },
};
