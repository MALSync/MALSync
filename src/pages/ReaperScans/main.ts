import { pageInterface } from '../pageInterface';

export const ReaperScans: pageInterface = {
  name: 'ReaperScans',
  domain: 'https://reaperscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('.wp-manga-nav').length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (j.$('.manga-title-badges').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$(j.$('.c-breadcrumb-wrapper .breadcrumb li')[2])
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('.c-breadcrumb-wrapper .breadcrumb li a')[2]).attr('href') || '';
    },
    getEpisode(url) {
      let episodePart = utils.urlPart(url, 5);

      if (episodePart.match(/volume-\d+/gim)) {
        episodePart = utils.urlPart(url, 6);
      }

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || temp.length === 0) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j
        .$('.nav-links .next_page')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.post-title h1')
        .prop('innerText')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.c-page__content .c-blog__heading')
        .first()
        .before(
          j.html(
            `<div id="malthing"><div id= "MALSyncheading" class="c-blog__heading style-2 font-heading"><h2 class="h4"> MAL-Sync</h2></div>${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.wp-manga-chapter');
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return ReaperScans.sync.getEpisode(ReaperScans.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (ReaperScans.isSyncPage(page.url)) {
        if (j.$('.page-break.no-gaps').length) {
          page.handlePage();
        }
      }
      if (ReaperScans.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          function() {
            if (j.$('.wp-manga-chapter').length) {
              return true;
            }
            return false;
          },
          function() {
            const typeRS = j
              .$('.manga-title-badges')
              .text()
              .toLowerCase();
            if (!typeRS.includes('novel')) {
              page.handlePage();
            }
          },
        );
      }
    });
  },
};
