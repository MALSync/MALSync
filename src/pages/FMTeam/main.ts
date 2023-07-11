import { pageInterface } from '../pageInterface';

export const FMTeam: pageInterface = {
  name: 'FMTeam',
  domain: 'https://fmteam.fr/',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[3] === 'read';
  },
  sync: {
    getTitle() {
      return j.$('.comic-title').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return utils.absoluteLink(j.$('.comic-title').attr('href'), FMTeam.domain);
    },
    getVolume(url) {
      if (Number(utils.urlPart(url, 9))) {
        return Number(utils.urlPart(url, 7));
      }
      return 0;
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 9)) || Number(utils.urlPart(url, 7));
    },
    nextEpUrl(url) {
      const nextChapter = j.$('#jump-chapter option:selected').prev();

      if (nextChapter && typeof nextChapter !== 'undefined') {
        let temp = nextChapter
          .text()
          .trim()
          .match(/(ch\.|chapitre)\D?\d+/i);
        if (temp !== null) {
          temp = temp[0].replace('.', '-').match(/\d+/);
          if (temp !== null) {
            return utils.absoluteLink(temp[0], FMTeam.sync.getOverviewUrl(url));
          }
        }
      }
      return '';
    },
  },
  overview: {
    getTitle() {
      return j.$('#comic > div:nth-child(1) > div.card-header').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#comic > div:nth-child(1)').after(
        j.html(
          `<div class="card mt-3"><div class="card-header"><span class="fas fa-rotate fa-fw"></span> MAL-Sync</div><div class="card-body">${selector}</div></div>`,
        ),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.item');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('.filter').attr('href'), FMTeam.domain);
      },
      elementEp(selector) {
        return FMTeam.sync.getEpisode(FMTeam.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(() => {
      utils.changeDetect(
        () => {
          page.reset();
          start();
        },
        () => {
          return j.$('head > meta[property="og:title"]').text() || '';
        },
      );
    });
    function start() {
      const urlSegment = page.url.split('/')[3];
      const handlingPage = urlSegment === 'read' || urlSegment === 'comics';

      if (handlingPage && typeof page.url.split('/')[4] !== 'undefined') {
        con.info('Waiting');
        utils.waitUntilTrue(
          () => {
            return j.$('#comic').length || j.$('#jump-chapter').length;
          },
          () => {
            con.info('Start');
            page.handlePage();
          },
        );
      }
    }
  },
};
