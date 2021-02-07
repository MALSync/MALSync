import { pageInterface } from '../pageInterface';

export const WuxiaWorld: pageInterface = {
  name: 'WuxiaWorld',
  domain: 'https://wuxiaworld.site',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.entry-header > div > div.entry-header_wrap > div > div.c-breadcrumb > ol > li:nth-child(2) > a')
        .text()
        .replace(/(comics|comic)\s*$/i, '')
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return (
        j
          .$('div.entry-header> div > div.entry-header_wrap > div > div.c-breadcrumb > ol > li:nth-child(2) > a')
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      const episodePart = url.split('/')[5];

      const temp = episodePart.match(/(chapter|ch)-\d+/gim);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j
        .$('div.entry-header > div > div.select-pagination > div.nav-links > div.nav-next > a.next_page')
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return utils
        .getBaseText(j.$('div.profile-manga > div > div > div > div.post-title > h1'))
        .replace(/(comics|comic)\s*$/i, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.profile-manga > div > div > div > div.post-title > h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.page-content-listing.single-page > div > ul > li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          WuxiaWorld.domain,
        );
      },
      elementEp(selector) {
        return WuxiaWorld.sync.getEpisode(WuxiaWorld.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (WuxiaWorld.isSyncPage(page.url)) {
        if (j.$('.entry-content .reading-content img').length) {
          page.novel = false;
        } else {
          page.novel = true;
        }
        page.handlePage();
      } else if (WuxiaWorld.isOverviewPage!(page.url)) {
        const descriptionType = j
          .$('div.post-content > div.post-content_item > div.summary-heading > h5:contains("Type")')
          .parent()
          .parent()
          .find('div.summary-content')
          .text()
          .toLowerCase();
        if (descriptionType.includes('manga') || descriptionType.includes('comic')) {
          page.novel = false;
          page.handlePage();
        } else if (descriptionType.includes('novel')) {
          page.novel = true;
          page.handlePage();
        } else {
          con.error('could not detect type');
        }
      } else {
        con.error('could not detect page');
      }
    });
  },
};
