import { pageInterface } from '../pageInterface';

export const Mangarock: pageInterface = {
  name: 'Mangarock',
  domain: 'https://mangarock.com',
  database: 'Mangarock',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (utils.urlPart(url, 5)) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$(`a[href*="${Mangarock.overview!.getIdentifier(url)}"]`)
        .text()
        .trim();
    },
    getIdentifier(url) {
      return Mangarock.overview!.getIdentifier(url);
    },
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      con.log(
        j
          .$("option:contains('Chapter')")
          .first()
          .parent()
          .find(':selected')
          .text(),
      );
      return EpisodePartToEpisode(
        j
          .$("option:contains('Chapter')")
          .first()
          .parent()
          .find(':selected')
          .text(),
      );
    },
    getVolume(url) {
      // TODO
      return 0;
    },
    nextEpUrl(url) {
      const num = j
        .$("option:contains('Chapter')")
        .first()
        .parent()
        .find(':selected')
        .next()
        .attr('value');
      if (num !== undefined) {
        return `${url
          .split('/')
          .slice(0, 6)
          .join('/')}/${num}`;
      }
      return '';
    },
  },
  overview: {
    getTitle() {
      return j
        .$('h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).replace(/mrs-serie-/i, '');
    },
    uiSelector(selector) {
      $('#chapters-list')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('[data-test="chapter-table"] tr');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Mangarock.domain,
        );
      },
      elementEp(selector) {
        return EpisodePartToEpisode(selector.find('a').text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    start();

    utils.urlChangeDetect(function() {
      page.reset();
      start();
    });

    function start() {
      if (!/manga/i.test(utils.urlPart(page.url, 3))) {
        con.log('Not a manga page!');
        return;
      }
      if (Mangarock.isSyncPage(page.url)) {
        utils.waitUntilTrue(
          function() {
            return Mangarock.sync.getTitle(page.url);
          },
          function() {
            page.handlePage();
          },
        );
      } else {
        j.$(document).ready(function() {
          let waitTimeout = false;
          utils.waitUntilTrue(
            function() {
              con.log('visibility', j.$('#page-content .col-lg-8 .lazyload-placeholder:visible').length);
              return !j.$('#page-content .col-lg-8 .lazyload-placeholder:visible').length || waitTimeout;
            },
            function() {
              page.handlePage();
            },
          );
          setTimeout(function() {
            waitTimeout = true;
          }, 1000);
        });
      }
    }
  },
};

function EpisodePartToEpisode(string) {
  if (!string) return '';
  if (!Number.isNaN(parseInt(string))) {
    return string;
  }
  // https://mangarock.com/manga/mrs-serie-124208
  string = string.replace(/(campaign|battle)/i, 'Chapter');
  let temp = [];
  temp = string.match(/Chapter \d+/i);
  con.log(temp);
  if (temp !== null) {
    string = temp[0];
    temp = string.match(/\d+/);
    if (temp !== null) {
      return temp[0];
    }
  } else {
    let tempString = string.replace(/vol(ume)?.?\d+/i, '');
    tempString = tempString.replace(/:.+/i, '');
    temp = tempString.match(/\d+/i);
    if (temp !== null && temp.length === 1) {
      return temp[0];
    }
  }

  return '';
}
