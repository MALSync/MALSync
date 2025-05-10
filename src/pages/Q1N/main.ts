import { PageInterface } from '../pageInterface';

export const Q1N: PageInterface = {
  name: 'Q1N',
  domain: 'https://q1n.net',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return ['e', 'f'].includes(url.split('/')[3]);
  },
  isOverviewPage(url) {
    return ['a'].includes(utils.urlPart(url, 3));
  },
  sync: {
    getTitle(url) {
      return j.$('#titleHis').text().split('- EP')[0].trim() || j.$('.data h1').text().trim();
    },
    getIdentifier(url) {
      return Q1N.overview!.getIdentifier(Q1N.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return j.$('.pag_episodes .item:nth-child(2) a').first().attr('href') || window.location.href;
    },
    getEpisode(url) {
      const episode = j.$('#titleHis').text().split('- EP')[1]?.trim();
      return episode ? Number(episode) : 1;
    },
    nextEpUrl(url) {
      return j.$('.pag_episodes .item:nth-child(3) a').first().attr('href') || '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.sheader h1').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#single .sgeneros')
        .first()
        .after(j.html(`<div title="MalSync">${j.html(selector)}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        if (j.$('.episodios [class^="item-"]').length) return j.$('.episodios [class^="item-"]');
        return j.$('.episodios .episodiotitle');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), Q1N.domain);
      },
      elementEp(selector) {
        if (j.$('.episodios [class^="item-"]').length)
          return Number(j.$(selector).find('.epnumber').text().trim());
        return Number(j.$(selector).siblings('.epnumber').text().trim());
      },
    },
  },
  init(page) {
    j.$(function () {
      console.log('init mal');
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
    });
  },
};
