import { ScriptProxy } from '../../utils/scriptProxy';
import { pageInterface } from '../pageInterface';

let idPosition;

// Define the variable proxy element:
const proxy = new ScriptProxy();
proxy.addCaptureVariable(
  'TITLE_DATA',
  `
    if (window.hasOwnProperty("TITLE_DATA")) {
      return TITLE_DATA;
    } else {
      return undefined;
    }
  `,
);

function extractMetadata() {
  const meta: any = proxy.getCaptureVariable('TITLE_DATA');

  if (!(meta instanceof Object)) {
    throw new Error('Invalid metadata');
  }

  if (meta.alpha === 'extras') {
    throw new Error('Not a Episode page');
  }

  return meta;
}

export const Funimation: pageInterface = {
  name: 'Funimation',
  domain: 'https://www.funimation.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('h1.show-headline.video-title').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const meta = extractMetadata();
      let season = '';
      if (meta.seasonNum > 1) season = ` season ${meta.seasonNum}`;
      return (
        j
          .$('h1.show-headline.video-title a')
          .text()
          .trim() + season
      );
    },
    getIdentifier(url) {
      const meta = extractMetadata();
      return `${url.split('/')[idPosition]}?s=${meta.seasonNum}`;
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('h1.show-headline.video-title a').attr('href') || '', Funimation.domain);
    },
    getEpisode(url) {
      const meta = extractMetadata();
      return meta.episodeNum || 1;
    },
  },
  overview: {
    getTitle(url) {
      const title = j.$('h1.heroTitle').text() || '';
      if (getSeasonFromOverview() > 1) {
        return `${title} season ${getSeasonFromOverview()}`;
      }
      return title;
    },
    getIdentifier(url) {
      return `${url.split('/')[idPosition]}?s=${getSeasonFromOverview()}`;
    },
    uiSelector(selector) {
      j.$('div.gradient-bg')
        .first()
        .before(j.html(`<div class="container"> ${selector}</div>`));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('#quadSection > div > div > div.row > div.details-episode-wrap a.trackVideo.episodeDesc');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Funimation.domain);
      },
      elementEp(selector) {
        return parseInt(selector.text().replace(/\D+/, '')) || 1;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      utils.waitUntilTrue(
        function() {
          return (
            j.$('h1.show-headline.video-title').length ||
            (j.$('h1.heroTitle').text().length &&
              j.$('#seasonSelect').length &&
              Funimation.overview!.list!.elementsSelector().length)
          );
        },
        function() {
          proxy.addProxy(async (caller: ScriptProxy) => {
            idPosition = window.location.href.split('/').indexOf('shows') + 1;
            page.handlePage();

            let wait;
            let oldElements = $('#quadSection > div > div > div.row > div.details-episode-wrap').html();

            j.$(document).on('change', '#seasonSelect', () => {
              page.reset();
              window.clearInterval(wait);

              wait = utils.waitUntilTrue(
                function() {
                  return (
                    Funimation.overview!.list!.elementsSelector().length &&
                    oldElements !== $('#quadSection > div > div > div.row > div.details-episode-wrap').html()
                  );
                },
                function() {
                  oldElements = $('#quadSection > div > div > div.row > div.details-episode-wrap').html();
                  page.handlePage();
                },
              );
            });
          });
        },
      );
    });
  },
};

function getSeasonFromOverview(): number {
  const select = $('#seasonSelect option:selected').val();
  if (select) {
    return parseInt(select.toString().replace(/\D+/, '')) || 1;
  }
  return 1;
}
