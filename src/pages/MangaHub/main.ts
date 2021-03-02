import { pageInterface } from '../pageInterface';

export const MangaHub: pageInterface = {
  name: 'MangaHub',
  domain: 'https://mangahub.io',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('#mangareader').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div._3_X6m.container-fluid h3 a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$('div._3_X6m.container-fluid h3 a').attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return $('ul.dropdown-menu li.active')
        .next()
        .find('a')
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div._3QCtP.col-md-9.col-sm-8.col-xs-6 h1')
        .clone()
        .children()
        .remove()
        .end()
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('section._2fecr').after(
        j.html(
          `<section class="_2fecr"><div style="background-color: inherit;" class="container-fluid"><div class="row" style="background-color: inherit;"><div class="col-md-1"><span style="font-weight: 700;">MALSync:</span></div><div class="col-md-11" style="background-color: inherit;">${selector}</div></div></div></section>`,
        ),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#noanim-content-tab div').find('li');
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
        return MangaHub.sync.getEpisode(MangaHub.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      utils.urlChangeDetect(() => {
        utils.waitUntilTrue(
          function() {
            return !j.$('html.no-js.nprogress-busy').length;
          },
          function() {
            page.reset();
            if (j.$('#mangareader').length) {
              utils.waitUntilTrue(
                function() {
                  return j.$('ul.dropdown-menu li.active').length;
                },
                function() {
                  page.handlePage();
                },
              );
            }
            if (j.$('#mangadetail').length) {
              utils.waitUntilTrue(
                function() {
                  if (j.$('div.ads-container').length > 0) {
                    return true;
                  }
                  return false;
                },
                function() {
                  page.handlePage();
                },
              );
            }
          },
        );
      });
      if (j.$('#mangareader').length) {
        utils.waitUntilTrue(
          function() {
            return j.$('ul.dropdown-menu li.active').length;
          },
          function() {
            page.handlePage();
          },
        );
      }
      if (j.$('#mangadetail').length) {
        utils.waitUntilTrue(
          function() {
            if (j.$('div.ads-container').length > 0) {
              return true;
            }
            return false;
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
