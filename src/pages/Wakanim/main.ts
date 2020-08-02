import { pageInterface } from '../pageInterface';

export const Wakanim: pageInterface = {
  name: 'Wakanim',
  domain: 'https://www.wakanim.tv',
  languages: ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Arabic', 'Italian', 'Russian'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('body > section.episode > div > div > div.episode_main > div.episode_video > div').length) {
      return true;
    }
    return false;
  },

  sync: {
    getTitle(url) {
      return Wakanim.sync.getIdentifier(url);
    },

    getIdentifier(url) {
      const ses = seasonHelper(j.$('span.episode_subtitle > span:nth-child(2)').text());
      return `${j.$('[itemprop="partOfSeries"] meta[itemprop="name"]').attr('content')} ${ses}`;
    },

    getOverviewUrl(url) {
      return (
        Wakanim.domain +
        (j
          .$('body > section.episode > div > div > div.episode_info > div.episode_buttons > a:nth-child(2)')
          .attr('href') || '')
      );
    },

    getEpisode(url) {
      return Number(
        j.$('body > section.episode > div > div > div.episode_info > h1 > span.episode_subtitle > span > span').text(),
      );
    },

    nextEpUrl(url) {
      return j
        .$(
          'body > section.episode > div > div > div.episode_main > div.episode_video > div > div.episode-bottom > div.episodeNPEp-wrapperBlock > a.episodeNPEp.episodeNextEp.active',
        )
        .attr('href');
    },
  },

  overview: {
    getTitle(url) {
      return Wakanim.overview!.getIdentifier(url);
    },
    getIdentifier(url) {
      const secondPart = seasonHelper(j.$('#list-season-container > div > select > option:selected').text());
      return `${j.$('[itemtype="http://schema.org/TVSeries"] > meta[itemprop="name"]').attr('content')} ${secondPart}`;
    },

    uiSelector(selector) {
      j.$('#nav-show')
        .first()
        .before(j.html(selector));
    },

    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('li.-big');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), Wakanim.domain);
      },
      elementEp(selector) {
        const url = Wakanim.overview!.list!.elementUrl(selector);
        const anchorTitle = selector.find('a').attr('title');

        if (!anchorTitle) return NaN;

        return episodeHelper(url, anchorTitle.trim());
      },
    },
  },

  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    if (
      (page.url.split('/')[6] === 'show' && page.url.split('/')[9] === 'season') ||
      page.url.split('/')[6] === 'episode'
    ) {
      utils.waitUntilTrue(
        function() {
          if (
            j.$('body > div.SerieV2 > section > div.container > div > div.SerieV2-content').length ||
            j.$('#jwplayer-container').length
          ) {
            return true;
          }
          return false;
        },
        function() {
          page.reset();
          page.handlePage();
        },
      );
    }

    utils.urlChangeDetect(function() {
      page.reset();
      if (page.url.split('/')[6] === 'show' && page.url.split('/')[9] === 'season') {
        utils.waitUntilTrue(
          function() {
            if (j.$('#list-season-container').length) {
              return true;
            }
            return false;
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};

function seasonHelper(text) {
  // Check if season is split in 2 cour.
  // If yes, so rename "Cour 2" as "Part 2 " for better detection.
  // If no, simply remove "Cour".

  if (text.includes('Cour')) {
    const temp = text.match(/Cour (\d+)/);
    if (temp[1] === 2) {
      return text
        .replace(temp[0], 'Part 2 ')
        .trim()
        .replace('-', '');
    }
    return text
      .replace(/Cour \d+/, '')
      .trim()
      .replace('-', '');
  }
  return text;
}

function episodeHelper(url: string, _episodeText: string) {
  let episodePart = '';

  if (/\d+\.\d+/.test(_episodeText)) {
    const matches = _episodeText.match(/\d+\.\d+/);

    if (matches && matches.length !== 0) episodePart = `episode${matches[0]}`;
  } else episodePart = utils.urlPart(url, 8) || '';

  if (!episodePart) return NaN;

  const episodeTextMatches = episodePart.match(
    /([e,E][p,P][i,I]?[s,S]?[o,O]?[d,D]?[e,E]?|[f,F][o,O][l,L][g,G]?[e,E])\D?\d+/,
  );

  if (!episodeTextMatches || episodeTextMatches.length === 0) return NaN;

  const episodeNumberMatches = episodeTextMatches[0].match(/\d+/);

  if (!episodeNumberMatches || episodeNumberMatches.length === 0) return NaN;

  return Number(episodeNumberMatches[0]);
}
