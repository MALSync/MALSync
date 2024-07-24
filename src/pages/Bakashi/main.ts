import { pageInterface } from '../pageInterface';

export const Bakashi: pageInterface = {
  name: 'Bakashi',
  domain: 'https://bakashi.tv',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3).startsWith('episodio');
  },
  isOverviewPage(url) {
    return ['animes'].includes(utils.urlPart(url, 3));
  },
  sync: {
    getTitle(url) {
      return j.$('#titleHis').text().split('- EP')[0].trim();
    },
    getIdentifier(url) {
      return Bakashi.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      // @ts-ignore
      return j.$('.pag_episodes>.item:nth-child(2)>a')[0].href ?? '';
    },
    getEpisode(url) {
      return Number(j.$('#titleHis').text().split('- EP')[1].trim());
    },
    nextEpUrl(url) {
      // @ts-ignore
      return j.$('.pag_episodes>.item:nth-child(3)>a')[0].href ?? '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#single .sheader>.data>h1').text().trim();
    },
    getIdentifier(url) {
      return Bakashi.overview?.getTitle(url) ?? '';
    },
    uiSelector(selector) {
      j.$('#single .sgeneros').after(j.html(`<div title="MalSync">${j.html(selector)}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        if ($('.episodios [class^="item-"]').length > 0) return j.$('.episodios [class^="item-"]');
        return j.$('.episodios .episodiotitle');
      },
      elementUrl(selector) {
        return utils.absoluteLink(j.$(selector.find('a').first()).attr('href'), Bakashi.domain);
      },
      elementEp(selector) {
        if ($('.episodios [class^="item-"]').length > 0)
          return Number(j.$(selector).find('.epnumber').text().trim());
        return Number(j.$(selector).siblings('.epnumber').text().trim());
      },
    },
  },
  init(page) {
    setTimeout(function () {
      console.log('init mal');
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
    }, 2000);
  },
};
