import { pageInterface } from '../pageInterface';

export const BSTO: pageInterface = {
  domain: 'https://bs.to',
  languages: ['German'], // (ISO language name) https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
  name: 'bs.to',
  type: 'anime',

  isSyncPage(url) {
    if (url.split('/')[3] === 'serie' && url.split('/').length > 7) {
      return true;
    }
    return false;
  }, // Return true if the current page is the sync page (Chapter/episode page)
  isOverviewPage(url) {
    if (url.split('/')[3] === 'serie' && url.split('/').length === 7) {
      return true;
    }
    return false;
  },
  sync: {
    // Definitions for the sync page
    getTitle(url) {
      let title = j
        .$('h2')[0]
        .innerHTML.split('<small>')[0]
        .trim();
      if (title.split('|').length > 0) {
        title = title.split('|')[0];
      }
      const Volume = Number(url.split('/')[5]);
      return `${title} ${Volume}`;
    }, // Returns the title of the anime, used for the search on mal
    getIdentifier(url) {
      return url.split('/')[4] + Number(url.split('/')[5]);
    }, // An unique identifier of the anime. Has to be the same on the sync and overview page
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      return Number(j.$('.active>a')[1].innerText);
    }, // Return the recognized episode or chapter number as integer.
    nextEpUrl(url) {
      const currEp = Number(j.$('.active>a')[1].innerText);
      const nextEp = currEp + 1;
      const nextEle = j.$(`.e${nextEp}`)[0] as HTMLElement;
      if (nextEp) {
        const nextURL = nextEle.children[0] as HTMLAnchorElement;
        return nextURL.href;
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
      let title = j
        .$('h2')[0]
        .innerHTML.split('<small>')[0]
        .trim();
      let Volume = 1;
      if (url.split('/').length >= 5) {
        if (url.split('/')[5]) {
          Volume = Number(url.split('/')[5]);
        }
      }
      if (title.split('|').length > 0) {
        title = title.split('|')[0];
      }
      return `${title} ${Volume}`;
    }, // Returns the title of the anime, used for the search on mal
    getIdentifier(url) {
      const mainNAme = url.split('/')[4];
      let Volume = 1;
      if (url.split('/').length >= 5) {
        if (url.split('/')[5]) {
          Volume = Number(url.split('/')[5]);
        }
      }
      return `${mainNAme}${Volume}`;
    }, // An unique identifier of the anime. Has to be the same on the sync and overview page
    uiSelector(selector) {
      j.$('.selectors')
        .first()
        .before(j.html(`<div class="MALContainer"> ${selector}</div>`));
    },
    list: {
      // (optional) Used for recognizing the list of episodes/chapters on the overview page. Best is to ask for help on discord for this.
      offsetHandler: false,
      elementsSelector() {
        return j.$('table.episodes tr');
      }, //  => JQuery<HTMLElement>;
      elementUrl(selector: JQuery<HTMLElement>) {
        const anchorHref = selector
          .find('td')
          .first()
          .attr('href');
        if (!anchorHref) return '';
        return anchorHref;
      }, // => string;
      elementEp(selector) {
        const anchorNb = selector.find('td').first().innerText;
        if (!anchorNb) return '';
        return anchorNb;
      }, // => number;
    },
  },
  init(page) {
    // eslint-disable-next-line global-require
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      ready();
    });
    function ready() {
      /* eslint-disable-next-line */
      j.$('body').append(
        '<script>var openWindow = window.open; window.open = function (url, windowName, windowFeatures) {if(!url.startsWith("https://vivo")) openWindow(url, windowName, windowFeatures)}</script>',
      );
      page.reset();
      $('html').addClass('miniMAL-hide');
      if (
        j
          .$('.infos')
          .first()
          .children()
          .first()
          .children()[1]
          .innerText.indexOf('Anime') >= 0
      ) {
        $('html').removeClass('miniMAL-hide');
        page.handlePage();
      }
    }
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
