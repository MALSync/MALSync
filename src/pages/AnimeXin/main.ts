import { pageInterface } from '../pageInterface';

export const AnimeXin: pageInterface = {
  name: 'AnimeXin',
  domain: 'https://animexin.vip',
  languages: ['English', 'Spanish', 'Indonesian', 'Portuguese', 'Turkish', 'Italian'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(j.$('.megavid').length);
  },
  isOverviewPage(url) {
    return Boolean(j.$('.animefull').length);
  },
  sync: {
    getTitle(url) {
      return j
        .$('.ts-breadcrumb [itemprop="itemListElement"]:nth-child(2) [itemprop="name"]')
        .text();
    },
    getIdentifier(url) {
      return AnimeXin.overview!.getIdentifier(AnimeXin.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      const overview = j
        .$('.ts-breadcrumb [itemprop="itemListElement"]:nth-child(2) a')
        .attr('href');
      return overview ? utils.absoluteLink(overview, AnimeXin.domain) : '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-episode-\d*/gi);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j.$('div.naveps.bignav > div:nth-child(3) > a').first().attr('href');
      if (href) {
        if (AnimeXin.sync.getEpisode(url) < AnimeXin.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.infox > h1.entry-title').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url.replace('anime/', ''), 3);
    },
    uiSelector(selector) {
      j.$('div.infox > h1.entry-title').first().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.bixbox.bxcl.epcheck > div.eplister > ul > li');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return AnimeXin.sync.getEpisode(String(selector.find('a').first().attr('href')));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};
