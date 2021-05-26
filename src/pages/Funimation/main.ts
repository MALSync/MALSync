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
      var bodyh = document.body.innerHTML;
      if (bodyh.includes('TITLE_DATA')) {
        var bomatch = bodyh.match(/TITLE_DATA *= *({[^}]*})/);

        if (bomatch) {
          return {
            seasonNum: parseInt(bomatch[1].match(/seasonNum *: *(\\d+|null),/)[1]),
            episodeNum: parseInt(bomatch[1].match(/episodeNum *: *(\\d+|null),/)[1]),
            alpha: bomatch[1].includes('extras') ? 'extras' : 'something',
          }
        }
      }

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
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      utils.waitUntilTrue(
        function() {
          return j.$('h1.show-headline.video-title').length;
        },
        function() {
          proxy.addProxy(async (caller: ScriptProxy) => {
            idPosition = window.location.href.split('/').indexOf('shows') + 1;
            page.handlePage();
          });
        },
      );
    });
  },
};
