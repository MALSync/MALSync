import { pageInterface } from '../pageInterface';

export const Proxer: pageInterface = {
  name: 'Proxer',
  domain: 'https://proxer.me',
  languages: ['German', 'English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch' || url.split('/')[3] === 'read') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      if (url.indexOf('watch') !== -1) {
        return j
          .$('.wName')
          .text()
          .trim();
      }
      if (url.indexOf('read') !== -1) {
        return j.$('div#breadcrumb a:first').text();
      }

      return '';
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return `${Proxer.domain}/info/${Proxer.sync.getIdentifier(url)}/list`;
    },
    getEpisode(url) {
      if (url.indexOf('watch') !== -1) {
        return getEpisodeFallback(
          `episode ${$('.wEp')
            .last()
            .text()
            .trim()}`,
          url.split('/')[5],
        );
      }
      return getEpisodeFallback(
        $('#breadcrumb > a')
          .last()
          .text()
          .trim(),
        url.split('/')[5],
      );
    },
    nextEpUrl(url) {
      return (
        Proxer.domain +
        $('.no_details a')!
          .last()!
          .attr('href')!
      );
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('#pageMetaAjax')
        .text()
        .split(' - ')[0]
        .replace(/\(Anime\)|\(Manga\)$/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return Proxer.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.hreview-aggregate > span')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j
          .$('span[id^="listTitle"]')
          .parent()
          .parent();
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a[href^="/watch"],a[href^="/read"],a[href^="/chapter"]')
            .first()
            .attr('href'),
          Proxer.domain,
        );
      },
      elementEp(selector) {
        return getEpisodeFallback(
          selector
            .find('span[id^="listTitle"]')
            .first()
            .text()
            .trim(),
          Proxer.overview!.list!.elementUrl(selector).split('/')[5],
        );
      },
      paginationNext(updateCheck) {
        con.error('sadsad', updateCheck);
        let el;
        if (updateCheck) {
          el = j.$('.menu').last();
          if (typeof el[0] === 'undefined' || el.hasClass('active')) {
            return false;
          }
          el[0].click();
          return true;
        }
        el = j
          .$('.menu.active')
          .first()
          .next();
        if (typeof el[0] === 'undefined') {
          return false;
        }
        el[0].click();
        return true;
      },
      getTotal() {
        const el = $('img[src="/images/misc/manga.png"], img[src="/images/misc/play.png"]')
          .last()
          .parent()
          .parent()
          .parent()
          .parent();
        if (el.length) {
          return Proxer.overview!.list!.elementEp(el);
        }
        return undefined;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    if (j.$('.g-recaptcha').length) {
      con.log('loading');
      page.cdn('captcha');
      return;
    }
    if (page.url.split('/')[3] === 'watch' || page.url.split('/')[3] === 'read') {
      if (page.url.split('/')[3] === 'watch') {
        Proxer.type = 'anime';
      } else if (page.url.split('/')[3] === 'read') {
        Proxer.type = 'manga';
      }
      j.$(document).ready(function() {
        page.handlePage();
      });
    }

    ajaxHandle(page);
    utils.urlChangeDetect(function() {
      page.reset();
      ajaxHandle(page);
    });
  },
};

let current = 0;

function ajaxHandle(page) {
  if (utils.urlPart(page.url, 3) !== 'info') return;
  const detailPart = utils.urlPart(page.url, 5);
  con.info('page', detailPart);
  if (detailPart === 'list') {
    utils.waitUntilTrue(
      function() {
        return j.$('#contentList').length;
      },
      function() {
        if (j.$('#simple-navi a[href*="manga"]').length) {
          Proxer.type = 'manga';
        } else {
          Proxer.type = 'anime';
        }

        const tempCurrent: number = parseInt(Proxer.overview!.getIdentifier(page.url));
        if (tempCurrent !== current) {
          current = tempCurrent;
          page.handlePage();
        } else {
          try {
            page.handleList();
          } catch (e) {
            con.error(e);
            page.handlePage();
          }
        }
      },
    );
  }
  if (detailPart === 'details' || !detailPart) {
    utils.waitUntilTrue(
      function() {
        return j.$('.hreview-aggregate').length;
      },
      function() {
        current = parseInt(Proxer.overview!.getIdentifier(page.url));
        if (j.$('#simple-navi a[href*="manga"]').length) {
          Proxer.type = 'manga';
        } else {
          Proxer.type = 'anime';
        }
        page.handlePage();
      },
    );
  }
}

function getEpisodeFallback(string, fallback) {
  const exclude = string.match(/(special|extra)/gi);
  if (exclude !== null) {
    return '';
  }

  const temp = string.match(/(kapitel |ep. |chapter |episode )\d+/gi);
  if (temp !== null) {
    return temp[0].match(/\d+/)[0];
  }

  return fallback;
}

/*
Chapter 10
Ep. 10
Kapitel 10
Episode 10
*/

/* Exclude
Special 1
Extra Story
*/
