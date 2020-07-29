import { pageInterface } from '../pageInterface';

export const Mangadex: pageInterface = {
  name: 'Mangadex',
  domain: 'https://www.mangadex.org',
  database: 'Mangadex',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] !== 'chapter') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.manga-link, a.manga_title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(Mangadex.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('a.manga-link, a.manga_title')
          .first()
          .attr('href'),
        Mangadex.domain,
      );
    },
    getEpisode(url) {
      const chapterId = url.split('/')[4];
      const curOption = j.$(`#jump-chapter option[value="${chapterId}"], #jump_chapter option[value="${chapterId}"]`);
      if (curOption.length) {
        const temp = curOption
          .text()
          .trim()
          .match(/(ch\.|chapter)\D?\d+/i);
        if (temp !== null) {
          return EpisodePartToEpisode(temp[0]);
        }
        if (curOption.text().indexOf('oneshot') !== -1 || curOption.text().indexOf('Oneshot') !== -1) {
          return 1;
        }
      }
      return NaN;
    },
    getVolume(url) {
      const chapterId = url.split('/')[4];
      const curOption = j.$(`#jump-chapter option[value="${chapterId}"], #jump_chapter option[value="${chapterId}"]`);
      if (curOption.length) {
        let temp = curOption
          .text()
          .trim()
          .match(/(vol\.|volume)\D?\d+/i);
        if (temp !== null) {
          temp = temp[0].match(/\d+/);
          if (temp !== null) {
            return parseInt(temp[0]);
          }
        }
      }
      return 0;
    },
    nextEpUrl(url) {
      let linkDirection = 'left';

      if (j.$('#content').attr('data-direction') === 'ltr') linkDirection = 'right';

      const chapterAnchorHref = j
        .$(`a.chapter-link-${linkDirection}.col-auto.arrow-link`)
        .first()
        .attr('href');

      if (!chapterAnchorHref) return '';

      const chapterHrefParts = chapterAnchorHref.split('/');

      if (chapterHrefParts.length < 2 || chapterHrefParts[1] !== 'chapter') return '';

      return (
        Mangadex.domain +
        (j
          .$(`a.chapter-link-${linkDirection}.col-auto.arrow-link`)
          .first()
          .attr('href') || '')
      );
    },
  },
  overview: {
    getTitle() {
      return j
        .$('.card-header')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.container .card .edit.row > * > .row')
        .first()
        .after(
          j.html(
            '<div class="row m-0 py-1 px-0 border-top"><div class="col-lg-3 col-xl-2 strong">MAL-Sync:</div><div class="col-lg-9 col-xl-10 kal-ui"></div></div>',
          ),
        );
      j.$('.container .card .kal-ui')
        .first()
        .append(j.html(selector));
    },
    getMalUrl(provider) {
      let url = j
        .$('a[href^="https://myanimelist.net/manga/"]')
        .not('#malRating')
        .first()
        .attr('href');
      if (url) return url;
      if (provider === 'ANILIST') {
        url = j
          .$('a[href^="https://anilist.co/manga/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      if (provider === 'KITSU') {
        url = j
          .$('a[href^="https://kitsu.io/manga/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.chapter-container > .row:not(:first-of-type) .chapter-row');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Mangadex.domain,
        );
      },
      elementEp(selector) {
        return selector.attr('data-chapter');
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    if (j.$('.card-header').length) {
      if (/chapter\/\d+\/comments/i.test(window.location.href)) {
        con.info('Comments');
        return;
      }
      j.$(document).ready(function() {
        page.handlePage();
      });
    } else {
      con.info('Waiting');
      utils.waitUntilTrue(
        function() {
          return Mangadex.sync.getOverviewUrl('');
        },
        function() {
          con.info('Start');
          page.handlePage();
          let tempChapterId = utils.urlPart(window.location.href, 4);
          utils.urlChangeDetect(function() {
            const newTempChapterId = utils.urlPart(window.location.href, 4);
            if (tempChapterId !== newTempChapterId) {
              tempChapterId = newTempChapterId;
              con.info('Check');
              page.handlePage();
            } else {
              con.info('Nothing to do');
            }
          });
        },
      );
    }
    j.$(document).ready(function() {
      switch ($('#theme_id').val()) {
        case '2':
        case '4':
        case '6':
        case '7':
          $('body').addClass('MALSyncDark');
          break;
        default:
      }
    });
  },
};

function EpisodePartToEpisode(string) {
  if (!string) return '';
  if (!Number.isNaN(parseInt(string))) {
    return string;
  }
  let temp = [];
  temp = string.match(/(ch\.|chapter)\D?\d+/i);
  console.log(temp);
  if (temp !== null) {
    string = temp[0];
    temp = string.match(/\d+/);
    if (temp !== null) {
      return temp[0];
    }
  }
  return '';
}
