import { pageInterface } from '../pageInterface';

export const OtakuFR: pageInterface = {
  name: 'OtakuFR',
  domain: 'https://www.otakufr.com',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('.vdo_wrp > iframe').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#sct_content > div > ul > li:nth-child(2) > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3) || '';
    },
    getOverviewUrl(url) {
      return j.$('.breadcrumb > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      const selectedOptionText = j
        .$('#sct_content > div > div.wpa_pag.anm_pyr > div > ul.nav_eps > li:nth-child(2) > select > option:selected')
        .text();

      if (!selectedOptionText && selectedOptionText.length < 2) return NaN;

      return Number(selectedOptionText.split(' ')[1]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(j.$('div.wpa_nav > ul:nth-child(2) > li > a').attr('href'), OtakuFR.domain);
    },
  },

  overview: {
    getTitle(url) {
      return utils.getBaseText($('h1.ttl'));
    },
    getIdentifier(url) {
      return OtakuFR.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#sct_content > div.wpa_pag.anm_det > h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('#sct_content > div.wpa_pag.anm_det > ul > li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          OtakuFR.domain,
        );
      },
      elementEp(selector) {
        const url = OtakuFR.overview!.list!.elementUrl(selector);
        return episodeHelper(
          urlHandling(url),
          selector
            .find('a')
            .text()
            .trim(),
        );
      },
    },
  },

  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if ($('.vdo_wrp > iframe').length || $('#sct_content > div.wpa_pag.anm_det > ul').length) {
        page.handlePage();
      }
    });
  },
};

function urlHandling(url) {
  const langslug = j
    .$('#sct_banner_head > div > a')
    .first()
    .attr('href');
  if (langslug === '/') {
    return url;
  }
  return url.replace(langslug, '');
}

function episodeHelper(url: string, episodeText: string) {
  const episodePart = utils.urlPart(urlHandling(url), 1);

  if (!episodePart) return NaN;

  const episodeNumberMatches = episodeText.match(/\d+\.\d+/);

  if (!episodeNumberMatches || episodeNumberMatches.length === 0) return NaN;

  return Number(episodeNumberMatches[0]);
}
