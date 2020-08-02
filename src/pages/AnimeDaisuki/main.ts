import { pageInterface } from '../pageInterface';

export const AnimeDaisuki: pageInterface = {
  name: 'AnimeDaisuki',
  domain: 'https://animedaisuki.moe',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('nav.Brdcrmb.fa-home a:nth-child(3)')
        .text()
        .trim();
    },
    getIdentifier(url) {
      const anchorHref = j.$('nav.Brdcrmb.fa-home a:nth-child(3)').attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[3];
    },
    getOverviewUrl(url) {
      return AnimeDaisuki.domain + (j.$('nav.Brdcrmb.fa-home a:nth-child(3)').attr('href') || '');
    },
    getEpisode(url) {
      return Number(
        j
          .$('h2.SubTitle')
          .text()
          .replace(/\D+/g, ''),
      );
    },
    nextEpUrl(url) {
      const href = j
        .$('.CapNv .CapNvNx')
        .first()
        .attr('href');
      if (typeof href !== 'undefined') {
        return AnimeDaisuki.domain + href;
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h2.Title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[5];
    },
    uiSelector(selector) {
      j.$('section.WdgtCn')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.ListCaps > li.fa-play-circle:not(.Next,.Issues)');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          AnimeDaisuki.domain,
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('a > p')
            .first()
            .text()
            .replace(/\D+/g, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'watch' || page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
