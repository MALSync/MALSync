import { pageInterface } from '../pageInterface';

export const BSTO: pageInterface = {
  domain: 'https://bs.to',
  languages: ['German'],
  name: 'bs.to',
  type: 'anime',

  isSyncPage(url) {
    if (url.split('/')[3] === 'serie' && url.split('/').length > 7) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'serie' && url.split('/').length >= 4) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return BSTO.overview!.getTitle(url);
    },
    getIdentifier(url) {
      return BSTO.overview!.getIdentifier(url);
    },
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      return Number(j.$('.episode .active > a').text());
    },
    nextEpUrl(url) {
      const currEp = BSTO.sync.getEpisode(url);
      const nextEp = currEp + 1;
      const nextEle = j.$(`.e${nextEp} > a`);
      if (nextEle.length) {
        return utils.absoluteLink(nextEle.attr('href'), BSTO.domain);
      }
      return '';
    },
    uiSelector(selector) {
      j.$('.selectors')
        .first()
        .before(j.html(`<div class="MALContainer"> ${selector}</div>`));
    },
  },
  overview: {
    getTitle(url) {
      let title = utils.getBaseText(j.$('h2').first()).trim();
      title = title.split('|')[0];

      let Season = 1;
      if (utils.urlPart(url, 5)) {
        Season = Number(utils.urlPart(url, 5));
      }

      return `${title} ${Season}`;
    },
    getIdentifier(url) {
      const mainId = url.split('/')[4];

      let Season = 1;
      if (utils.urlPart(url, 5)) {
        Season = Number(utils.urlPart(url, 5));
      }

      return `${mainId}?s=${Season}`;
    },
    uiSelector(selector) {
      j.$('.selectors')
        .first()
        .before(j.html(`<div class="MALContainer"> ${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('table.episodes tr, div.episode li[class^="e"]');
      },
      elementUrl(selector: JQuery<HTMLElement>) {
        const anchorHref = selector
          .find('a')
          .first()
          .attr('href');
        if (!anchorHref) return '';
        return anchorHref;
      },
      elementEp(selector) {
        const anchorNb = selector
          .find('a')
          .first()
          .text();
        if (!anchorNb) return '';
        return anchorNb;
      },
    },
  },
  init(page) {
    // eslint-disable-next-line global-require
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      /* eslint-disable-next-line */
      j.$('body').append(
        '<script>var openWindow = window.open; window.open = function (url, windowName, windowFeatures) {if(!url.startsWith("https://vivo")) openWindow(url, windowName, windowFeatures)}</script>',
      );
      $('html').addClass('miniMAL-hide');
      if (
        j
          .$('.infos span:contains("Genres")')
          .next('p')
          .text()
          .indexOf('Anime') >= 0 &&
        parseInt(utils.urlPart(page.url, 5)) !== 0 // ignore specials since its bad on this page
      ) {
        $('html').removeClass('miniMAL-hide');
        page.handlePage();
      }
    });
    utils.waitUntilTrue(
      function() {
        return j.$('div.hoster-player > a[href^="https://vivo"]').length;
      },
      function() {
        const array = j
          .$('div.hoster-player > a[href^="https://vivo"]')!
          .attr('href')!
          .split('/');
        const id = array.pop()!;
        array.push('embed');
        array.push(id);
        const output = array.join('/');
        /* eslint-disable-next-line */
        j.$('div.hoster-player').html('');
        /* eslint-disable-next-line */
        j.$('div.hoster-player').append(
          `<iframe src="${output}" width="560" height="315" scrolling="no" frameborder="0" allowfullscreen></iframe>`,
        );
      },
    );
  },
};
