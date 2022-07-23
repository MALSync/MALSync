import { pageInterface } from '../pageInterface';

export const tenshi: pageInterface = {
  name: 'tenshi',
  domain: 'https://tenshi.moe',
  languages: ['English'],
  type: 'anime',
  database: 'Tenshi',
  isSyncPage(url) {
    return url.split('/').length === 6;
  },
  isOverviewPage(url) {
    return url.split('/').length === 5;
  },
  sync: {
    getTitle(url) {
      return j.$('#content > ol.breadcrumb > li:nth-child(3) > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('#content > ol.breadcrumb > li:nth-child(3) > a').attr('href'),
        tenshi.domain,
      );
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('ol.playlist-episodes > li.sel').next('li').find('a').attr('href'),
        tenshi.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('header.entry-header > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('header.entry-header')
        .first()
        .after(j.html(`<section class="card"><div class="card-body">${selector}</div></section>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('section.entry-episodes > ul > li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), tenshi.domain);
      },
      elementEp(selector) {
        return tenshi.sync.getEpisode(tenshi.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('Not Found')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};
