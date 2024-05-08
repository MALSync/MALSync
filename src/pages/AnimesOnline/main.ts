import { pageInterface } from '../pageInterface';

export const AnimesOnline: pageInterface = {
  name: 'Animes Online',
  domain: 'animesonline.in',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3).startsWith('video');
  },
  isOverviewPage(url) {
    return ['anime', 'animes-dublado'].includes(utils.urlPart(url, 3));
  },
  sync: {
    getTitle(url) {
      return j.$(j.$('.breadcrumb li')[2]).text().replace('- Dublado', '').trim();
    },
    getIdentifier(url) {
      return j.$(j.$('.breadcrumb li')[2]).text().trim().replace('- Dublado', '');
    },
    getOverviewUrl(url) {
      return j.$(j.$('.breadcrumb li')[2]).find('a').attr('href') ?? '';
    },
    getEpisode(url) {
      return Number(j.$(j.$('.breadcrumb li')[3]).text().split('ep')[1].trim());
    },
    nextEpUrl(url) {
      return j.$(j.$('.playerbox .controls a')[2]).attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j.$(j.$('.breadcrumb li')[2]).text().replace('- Dublado', '').trim();
    },
    getIdentifier(url) {
      return j.$(j.$('.breadcrumb li')[2]).text().replace('- Dublado', '').trim();
    },
    uiSelector(selector) {
      j.$('.banner-infos > .info:last-child').after(
        j.html(`<div title="MalSync">${j.html(selector)}</div>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episode-card');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          j.$(selector.find('a').first()).attr('href'),
          AnimesOnline.domain,
        );
      },
      elementEp(selector) {
        return Number(selector.find('.card-title span').text().split('EP')[1].trim());
      },
    },
  },
  init(page) {
    j.$(document).ready(function () {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
    });
  },
};
