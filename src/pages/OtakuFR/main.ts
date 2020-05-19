import { pageInterface } from './../pageInterface';

export const OtakuFR: pageInterface = {
  name: 'OtakuFR',
  domain: 'https://www.otakufr.com',
  type: 'anime',
  isSyncPage: function(url) {
    if (j.$('.vdo_wrp > iframe').length) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('#sct_content > div > ul > li:nth-child(2) > a').text();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 3) || '';
    },
    getOverviewUrl: function(url) {
      return j.$('.breadcrumb > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode: function(url) {
      const selectedOptionText = j
        .$(
          '#sct_content > div > div.wpa_pag.anm_pyr > div > ul.nav_eps > li:nth-child(2) > select > option:selected',
        )
        .text();

      if (!selectedOptionText && selectedOptionText.length < 2) return NaN;

      return Number(selectedOptionText.split(' ')[1]);
    },
    nextEpUrl: function(url) {
      return utils.absoluteLink(
        j.$('div.wpa_nav > ul:nth-child(2) > li > a').attr('href'),
        OtakuFR.domain,
      );
    },
  },

  overview: {
    getTitle: function(url) {
      return utils.getBaseText($('h1.ttl'));
    },
    getIdentifier: function(url) {
      return OtakuFR.sync.getIdentifier(url);
    },
    uiSelector: function(selector) {
      selector.insertAfter(
        j.$('#sct_content > div.wpa_pag.anm_det > h1').first(),
      );
    },
    list: {
      offsetHandler: true,
      elementsSelector: function() {
        return j.$('#sct_content > div.wpa_pag.anm_det > ul > li');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          OtakuFR.domain,
        );
      },
      elementEp: function(selector) {
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
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (
        $('.vdo_wrp > iframe').length ||
        $('#sct_content > div.wpa_pag.anm_det > ul').length
      ) {
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
  } else {
    return url.replace(langslug, '');
  }
}

function episodeHelper(url: string, episodeText: string) {
  const episodePart = utils.urlPart(urlHandling(url), 1);

  if (!episodePart) return NaN;

  const episodeNumberMatches = episodeText.match(/\d+\.\d+/);

  if (!episodeNumberMatches || episodeNumberMatches.length === 0) return NaN;

  return Number(episodeNumberMatches[0]);
}
