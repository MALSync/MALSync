import { pageInterface } from '../pageInterface';

export const Animeworld: pageInterface = {
  name: 'Animeworld',
  domain: 'https://www.animeworld.tv',
  languages: ['Italian'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#anime-title').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('div.server:not([style*="display: none"]) a[href*="/play"]').first().attr('href'),
        Animeworld.domain,
      );
    },
    getMalUrl(provider) {
      const malUrl = j.$('#mal-button').attr('href');
      if (malUrl) {
        return malUrl;
      }

      if (provider === 'ANILIST') {
        return j.$('#anilist-button').attr('href') || false;
      }

      return false;
    },
    getEpisode(url) {
      return parseInt(
        j.$('div.server a[href*="/play"].active').first().attr('data-episode-num') || '1',
      );
    },
    uiSelector(selector) {
      j.$('div.widget.player')
        .first()
        .after(
          j.html(
            `<div id="mal-sync-ui-selector" class="widget crop text-center">${selector}</div>`,
          ),
        );
    },
  },
  overview: {
    getTitle(url) {
      return '';
    },
    getIdentifier(url) {
      return '';
    },
    uiSelector(selector) {
      // no ui
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.server a[href*="/play"]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Animeworld.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-episode-num'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.fullUrlChangeDetect(() => {
      page.reset();
      j.$('#mal-sync-ui-selector').remove();
      if (document.title.includes('Pagina non trovata')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};
