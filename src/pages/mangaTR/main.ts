import { pageInterface } from '../pageInterface';

const BASE_DOMAIN = 'https://manga-tr.com';

const slugPatterns = [
  /manga-([^/?#.]+?)\.html/i,
  /id-\d+-(?:read|oku)-(.+?)-(?:chapter|bolum)-/i,
  /(?:read|oku)-(.+?)-(?:chapter|bolum)-/i,
];

function extractSlug(url: string): string {
  const clean = utils.urlStrip(url || '');
  const lastSegment = clean.split('/').pop() || '';

  for (const pattern of slugPatterns) {
    const match = lastSegment.match(pattern);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }

  return '';
}

function buildOverviewUrl(slug: string): string {
  if (!slug) return '';

  return `${BASE_DOMAIN}/manga-${slug}.html`;
}

function resolveIdentifier(url: string): string {
  const navHref = j.$('.navbar-brand').first().attr('href');
  if (navHref) {
    const slug = extractSlug(navHref);
    if (slug) return slug;
  }

  const canonical = j.$('link[rel="canonical"]').attr('href');
  if (canonical) {
    const slug = extractSlug(canonical);
    if (slug) return slug;
  }

  return extractSlug(url);
}

export const mangaTR: pageInterface = {
  name: 'mangaTR',
  domain: ['https://manga-tr.com', 'https://www.manga-tr.com'],
  languages: ['Turkish'],
  type: 'manga',
  isSyncPage() {
    return j.$('div.chapter-content').length > 0;
  },
  isOverviewPage() {
    return j.$('div.well2 h1').length > 0 && j.$('#results').length > 0;
  },
  sync: {
    getTitle() {
      return j.$('.navbar-brand').first().text().trim();
    },
    getIdentifier(url) {
      return resolveIdentifier(url);
    },
    getOverviewUrl(url) {
      const navHref = j.$('.navbar-brand').first().attr('href');
      if (navHref) return utils.absoluteLink(navHref, BASE_DOMAIN);

      const slug = resolveIdentifier(url);
      if (slug) return buildOverviewUrl(slug);

      return '';
    },
    getEpisode(url) {
      const segment = utils.urlStrip(url).split('/').pop() || '';
      const match = segment.match(/(?:chapter|bolum)-(\d+(?:\.\d+)?)/i);

      if (!match) return NaN;

      return Number(match[1]);
    },
    nextEpUrl() {
      const nextHref =
        j
          .$("a.btn.btn-warning[href]")
          .filter(function () {
            const element = j.$(this);
            return (
              element.find('.glyphicon-chevron-right').length > 0 ||
              element.text().toLowerCase().indexOf('sonraki') > -1
            );
          })
          .first()
          .attr('href') ||
        j
          .$('.navbar-nav a[href*="chapter"], .navbar-nav a[href*="bolum"]')
          .filter(function () {
            return j.$(this).find('.glyphicon-chevron-right').length > 0;
          })
          .first()
          .attr('href');

      if (!nextHref) return undefined;

      return utils.absoluteLink(nextHref, BASE_DOMAIN);
    },
  },
  overview: {
    getTitle() {
      return j.$('div.well2 h1').first().text().trim();
    },
    getIdentifier(url) {
      return resolveIdentifier(url);
    },
    uiSelector(selector) {
      j.$('div.well2').first().after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      page.handlePage();
    });
  },
};
