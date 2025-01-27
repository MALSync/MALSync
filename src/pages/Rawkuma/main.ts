import { pageInterface } from '../pageInterface';

export const Rawkuma: pageInterface = {
  name: 'Rawkuma',
  domain: 'https://rawkuma.com',
  languages: ['Japanese'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(j.$('.chapterbody').length);
  },
  isOverviewPage(url) {
    return Boolean(j.$('.animefull').length);
  },
  sync: {
    getTitle(url) {
      return j
        .$('.ts-breadcrumb [itemprop="itemListElement"]:nth-child(2) [itemprop="name"]')
        .text()
        .replace(/\s+raw$/i, '');
    },
    getIdentifier(url) {
      return Rawkuma.overview!.getIdentifier(Rawkuma.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      const overview = j
        .$('.ts-breadcrumb [itemprop="itemListElement"]:nth-child(2) a')
        .attr('href');
      return overview ? utils.absoluteLink(overview, Rawkuma.domain) : '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-chapter-\d*/gi);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j.$('div.nextprev > a.ch-next-btn:not(.disabled)').first().attr('href');
      if (href) {
        if (Rawkuma.sync.getEpisode(url) < Rawkuma.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.infox > h1.entry-title')
        .text()
        .replace(/\s+raw$/i, '');
    },
    getIdentifier(url) {
      return utils.urlPart(url.replace('manga/', ''), 3);
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
        return Rawkuma.sync.getEpisode(String(selector.find('a').first().attr('href')));
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
