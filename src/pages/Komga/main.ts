import { pageInterface } from '../pageInterface';

async function apiCall(url: string) {
  url = window.location.origin + url;
  con.log('Api Call', url);
  return api.request.xhr('GET', url);
}

const chapter = {
  pid: '',
  name: '',
  chapter: '',
  mode: 'chapter',
};

export const Komga: pageInterface = {
  name: 'Komga',
  domain: 'https://komga.org',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 5) === 'read';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'series' && utils.urlPart(url, 5) !== 'read';
  },
  sync: {
    getTitle(url) {
      if (!chapter.name) throw 'No name';
      return chapter.name;
    },
    getIdentifier(url) {
      if (!chapter.pid) throw 'No pid';
      return chapter.pid;
    },
    getOverviewUrl(url) {
      return `${window.location.origin}/series/${chapter.pid}`;
    },
    getEpisode(url) {
      if (chapter.mode !== 'chapter') return 0;
      if (!chapter.chapter || !parseInt(chapter.chapter)) throw 'No chapter number';
      return parseInt(chapter.chapter);
    },
    getVolume(url) {
      if (chapter.mode !== 'volume') return 0;
      if (!chapter.chapter || !parseInt(chapter.chapter)) throw 'No volume number';
      return parseInt(chapter.chapter);
    },
  },
  overview: {
    getTitle() {
      return j
        .$('.v-toolbar__title > span:nth-child(1)')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.text-h5')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.my-2');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Komga.domain,
        );
      },
      elementEp(selector) {
        const chapterAsText = selector
          .find('div:nth-child(1) > a:nth-child(2) > div:nth-child(1)')
          .first()
          .text()
          .split(' - ')[0]
          .replace(/( |#)/g, '');

        return Number(chapterAsText);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    let checker;

    loaded();
    utils.changeDetect(loaded, () => {
      return window.location.href.split('?')[0].split('#')[0];
    });

    function loaded() {
      chapter.chapter = '';
      chapter.name = '';
      chapter.pid = '';
      chapter.mode = 'chapter';
      page.strongVolumes = false;
      clearInterval(checker);
      if (Komga.isOverviewPage!(window.location.href)) {
        checker = utils.waitUntilTrue(
          () => Komga.overview!.getTitle(window.location.href),
          () => {
            con.log('pagehandle');
            page.reset();
            page.handlePage();
          },
        );
      } else if (Komga.isSyncPage!(window.location.href)) {
        apiCall(`/api/v1/books/${utils.urlPart(window.location.href, 4)}`)
          .then(res => {
            const jn = JSON.parse(res.responseText);
            if (!jn.seriesId) throw 'No seriesId found';
            con.m('Book').log(jn);
            chapter.chapter = jn.metadata.number;
            chapter.pid = jn.seriesId;
            return apiCall(`/api/v1/series/${jn.seriesId}`);
          })
          .then(res => {
            const jn = JSON.parse(res.responseText);
            con.m('Series').log(jn);
            chapter.name = jn.name;
            if (jn.metadata && jn.metadata.tags && jn.metadata.tags.length) {
              const lowerArray = jn.metadata.tags.map(el => el.toLowerCase());
              if (lowerArray.includes('volume') || lowerArray.includes('volumes')) {
                chapter.mode = 'volume';
                page.strongVolumes = true;
              }
            }
            con.m('Object').log(chapter);
            page.reset();
            page.handlePage();
          });
      } else {
        page.reset();
      }
    }
  },
};
