import { pageInterface } from '../pageInterface';
import { pathToUrl, urlToSlug } from '../../utils/slugs';

async function apiCall(url: string) {
  url = window.location.origin + url;
  con.log('Api Call', url);
  return api.request.xhr('GET', url);
}

const chapter = {
  pid: '',
  chapter: '',
  mode: 'chapter',
  totalPages: null,
};

const series = {
  name: '',
  links: {
    mal: '',
    al: '',
    kt: '',
  },
};

export const Komga: pageInterface = {
  name: 'Komga',
  domain: 'https://komga.org',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 5) === 'read' && utils.urlParam(url, 'incognito') !== 'true';
  },
  isOverviewPage(url) {
    const urlTypePart = utils.urlPart(url, 3);
    if (urlTypePart === 'oneshot') chapter.mode = 'oneshot';
    return (
      (urlTypePart === 'series' || urlTypePart === 'oneshot') && utils.urlPart(url, 5) !== 'read'
    );
  },
  sync: {
    getTitle(url) {
      if (!series.name) throw 'No name';
      return series.name;
    },
    getIdentifier(url) {
      if (!chapter.pid) throw 'No pid';
      return chapter.pid;
    },
    getOverviewUrl(url) {
      return `${window.location.origin}/series/${chapter.pid}`;
    },
    getEpisode(url) {
      if (chapter.mode === 'oneshot') return 1;
      if (chapter.mode !== 'chapter') return 0;
      if (!chapter.chapter || !parseInt(chapter.chapter)) throw 'No chapter number';
      return parseInt(chapter.chapter);
    },
    getVolume(url) {
      if (chapter.mode === 'oneshot') return 1;
      if (chapter.mode !== 'volume') return 0;
      if (!chapter.chapter || !parseInt(chapter.chapter)) throw 'No volume number';
      return parseInt(chapter.chapter);
    },
    getMalUrl(provider) {
      if (series.links.mal) return series.links.mal;
      if (provider === 'ANILIST' && series.links.al) return series.links.al;
      if (provider === 'KITSU' && series.links.kt) return series.links.kt;
      return false;
    },
    readerConfig: [
      {
        current: {
          mode: 'url',
          regex: '(\\?|&)page=(\\d+)',
          group: 2,
        },
        total: {
          callback: () => chapter.totalPages as any,
          mode: 'callback',
        },
      },
    ],
  },
  overview: {
    getTitle() {
      let element: JQuery<HTMLElement>;
      if (chapter.mode === 'oneshot') element = j.$('.py-1.col > span.text-h6:nth-child(1)');
      else element = j.$('.v-toolbar__title > span:nth-child(1)');
      return element.first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      let element: JQuery<HTMLElement>;
      if (chapter.mode === 'oneshot') element = j.$('.text-h6');
      else element = j.$('.text-h5');
      element.first().after(j.html(selector));
    },
    getMalUrl(provider) {
      return Komga.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        let element: JQuery<HTMLElement>;
        if (chapter.mode === 'oneshot') element = j.$('a.v-btn--router.accent');
        else element = j.$('div.my-2');
        return element;
      },
      elementUrl(selector) {
        let element: JQuery<HTMLElement>;
        if (chapter.mode === 'oneshot') element = selector;
        else element = selector.find('a');
        return utils.absoluteLink(element.first().attr('href'), Komga.domain);
      },
      elementEp(selector) {
        if (chapter.mode === 'oneshot') return 1;
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
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    let checker;

    loaded();
    utils.changeDetect(loaded, () => {
      return window.location.href.split('?')[0].split('#')[0];
    });

    function loaded() {
      chapter.chapter = '';
      chapter.pid = '';
      chapter.mode = 'chapter';
      chapter.totalPages = null;
      page.strongVolumes = false;
      series.name = '';
      series.links = {
        mal: '',
        al: '',
        kt: '',
      };
      clearInterval(checker);
      if (Komga.isOverviewPage!(window.location.href)) {
        checker = utils.waitUntilTrue(
          () => Komga.overview!.getTitle(window.location.href),
          () => {
            const metadata = {
              links: [
                {
                  url: '',
                },
              ],
            };
            j.$.each(j.$('.v-icon.mdi-open-in-new'), (i, icon) => {
              const jIcon = j.$(icon);
              const linkUrl = jIcon.parents('a.v-chip--link').first().attr('href');
              if (linkUrl)
                metadata.links.push({
                  url: linkUrl,
                });
            });
            setLinks(metadata);
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
            if (jn.metadata && jn.metadata.number) chapter.chapter = jn.metadata.number;
            if (jn.media && jn.media.pagesCount) chapter.totalPages = jn.media.pagesCount;
            else chapter.chapter = jn.number;
            chapter.pid = jn.seriesId;
            if (!ifIsOneshot(jn.oneshot)) ifIsVolume(jn.metadata);
            setLinks(jn.metadata);
            return apiCall(`/api/v1/series/${jn.seriesId}`);
          })
          .then(res => {
            const jn = JSON.parse(res.responseText);
            con.m('Series').log(jn);
            if (jn.metadata && jn.metadata.title) series.name = jn.metadata.title;
            else series.name = jn.name;
            if (!ifIsOneshot(jn.oneshot)) ifIsVolume(jn.metadata);
            setLinks(jn.metadata);
            con.m('Object').log(chapter);
            page.reset();
            page.handlePage();
          });
      } else {
        page.reset();
      }
    }

    function ifIsVolume(metadata) {
      if (metadata && metadata.tags && metadata.tags.length) {
        const lowerArray = metadata.tags.map(el => el.toLowerCase());
        if (lowerArray.includes('volume') || lowerArray.includes('volumes')) {
          chapter.mode = 'volume';
          page.strongVolumes = true;
          return true;
        }
      }
      return false;
    }

    function ifIsOneshot(isOneshot) {
      if (isOneshot) {
        chapter.mode = 'oneshot';
        return true;
      }
      return false;
    }

    function setLinks(metadata) {
      if (metadata && metadata.links && metadata.links.length) {
        metadata.links.forEach(link => {
          if (!link.url) return;
          const obj = urlToSlug(link.url);
          if (!obj.path || obj.path.type !== 'manga') return;
          const url = pathToUrl(obj.path);
          if (!series.links.mal && obj.path.slug.match(/^\d+$/)) series.links.mal = url;
          else if (!series.links.al && obj.path.slug.startsWith('a:')) series.links.al = url;
          else if (!series.links.kt && obj.path.slug.startsWith('k:')) series.links.kt = url;
        });
      }
    }
  },
};
