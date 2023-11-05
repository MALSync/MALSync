import { pageInterface } from '../pageInterface';

export const LynxScans: pageInterface = {
  name: 'LynxScans',
  domain: 'https://lynxscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 3) !== 'comics';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'comics' && Boolean(utils.urlPart(url, 4));
  },
  sync: {
    getTitle(url) {
      return j.$('.ts-breadcrumb [href*="/comics/"]').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(LynxScans.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      const link = j.$('.ts-breadcrumb [href*="/comics/"]').first().attr('href');
      return link ? utils.absoluteLink(link, LynxScans.domain) : '';
    },
    getEpisode(url) {
      const chapterPart = utils.urlPart(url, 3);
      const chapter = chapterPart.match(/(\d+)(-\d+)?$/i);
      if (chapter) {
        return Number(chapter[1]);
      }

      return 0;
    },
    getVolume(url) {
      const chapterPart = utils.urlPart(url, 3);
      const vol = chapterPart.match(/vol(ume)?-(\d+)/i);
      if (vol) {
        return Number(vol[2]);
      }

      return 0;
    },
    nextEpUrl(url) {
      return j.$('.nextprev .ch-next-btn:not(".disabled")').attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.entry-title').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.info-desc')
        .first()
        .after(j.html(`<div class="bixbox" id="malthing">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#chapterlist li');
      },
      elementUrl(selector) {
        const link = selector.find('a').first().attr('href');
        return link ? utils.absoluteLink(link, LynxScans.domain) : '';
      },
      elementEp(selector) {
        return LynxScans.sync.getEpisode(LynxScans.overview!.list!.elementUrl!(selector));
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
