import { pageInterface } from '../pageInterface';
import { beta } from './beta';

export const Crunchyroll: pageInterface = {
  name: 'Crunchyroll',
  domain: 'https://www.crunchyroll.com',
  languages: ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Arabic', 'Italian', 'Russian'],
  type: 'anime',
  isSyncPage(url) {
    if (typeof url.split('/')[4] !== 'undefined') {
      if (j.$('#showmedia_video').length) {
        return true;
      }
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return (
        j
          .$('link[rel="index"]')
          .first()
          .attr('title') ?? ''
      );
    },
    getIdentifier(url) {
      return Crunchyroll.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('link[rel="index"]')
          .first()
          .attr('href') ?? '',
        Crunchyroll.domain,
      );
    },
    getEpisode(url) {
      return episodeHelper(
        url,
        j
          .$('h1.ellipsis')
          .text()
          .replace(j.$('h1.ellipsis > a').text(), '')
          .trim(),
      );
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('.collection-carousel-media-link-current')
        .parent()
        .next()
        .find('.link')
        .attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, Crunchyroll.domain);
    },
  },
  init(page) {
    j.$(document).ready(function() {
      if ($('#content').length) {
        Crunchyroll.database = beta.database;
        Crunchyroll.isSyncPage = beta.isSyncPage;
        Crunchyroll.isOverviewPage = beta.isOverviewPage;
        Crunchyroll.sync = beta.sync;
        Crunchyroll.overview = beta.overview;
        Crunchyroll.name = beta.name;
        beta.init(page);
        return;
      }

      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

      page.handlePage();
    });
  },
};

function urlHandling(url) {
  const langslug = j
    .$('#home_link, #logo_beta a')
    .first()
    .attr('href');
  if (langslug === '/') {
    return url;
  }
  return url.replace(langslug, '');
}

function episodeHelper(url: string, _episodeText: string) {
  let episodePart = '';

  if (/\d+\.\d+/.test(_episodeText)) {
    const matches = _episodeText.match(/\d+\.\d+/);

    if (matches && matches.length !== 0) episodePart = `episode${matches[0]}`;
  } else episodePart = utils.urlPart(urlHandling(url), 4) || '';

  if (!episodePart) return NaN;

  const episodeTextMatches = episodePart.match(
    /([e,E][p,P][i,I]?[s,S]?[o,O]?[d,D]?[e,E]?|[f,F][o,O][l,L][g,G]?[e,E])\D?\d+/,
  );

  if (!episodeTextMatches || episodeTextMatches.length === 0) return NaN;

  const episodeNumberMatches = episodeTextMatches[0].match(/\d+/);

  if (!episodeNumberMatches || episodeNumberMatches.length === 0) return NaN;

  return Number(episodeNumberMatches[0]);
}
