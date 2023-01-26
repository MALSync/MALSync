import { pageInterface } from '../pageInterface';

export const Hdrezka: pageInterface = {
  name: 'Hdrezka',
  domain: 'https://hdrezka.ag',
  languages: ['Russian'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(Hdrezka.sync.getIdentifier(url)) && Hdrezka.sync.getIdentifier(url) !== 'page';
  },
  isOverviewPage(url) {
    return false;
  },
  sync: {
    getTitle(url) {
      const title =
        j.$('.b-post__origtitle').first().text() || j.$('.b-post__title h1').first().text();
      return title;
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      return `${Hdrezka.domain}/animation/${Hdrezka.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return Number(j.$('.b-simple_episode__item.active').last().attr('data-episode_id'));
    },
    uiSelector(selector) {
      if (!j.$('.malsync-section').length) {
        j.$('.b-post__infotable')
          .first()
          .before(j.html(`<div class="b-sidelinks__link malsync-section"></div>`));
      }

      j.$('.malsync-section').html(j.html(selector));
    },
    nextEpUrl(url) {
      const selector = j.$('.b-simple_episode__item.active').last().next();
      if (!selector.length) return '';
      return `${Hdrezka.sync.getOverviewUrl(url)}#${epLinkAnchor(selector)}`;
    },
  },
  overview: {
    getTitle(url) {
      return url;
    },
    getIdentifier(url) {
      return url;
    },
    uiSelector(selector) {
      j.$('#animepagetitle').after(j.html(`${selector}`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.b-simple_episode__item');
      },
      elementUrl(selector) {
        return `${Hdrezka.sync.getOverviewUrl(
          window.location.href.split('#')[0].split('?')[0],
        )}#${epLinkAnchor(selector)}`;
      },
      elementEp(selector) {
        return Number(selector.attr('data-episode_id'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(document).ready(() => {
      utils.changeDetect(
        () => {
          page.reset();
          page.handlePage();
        },
        () => {
          return Hdrezka.sync.getEpisode(window.location.href) || '';
        },
        true,
      );
    });
  },
};

function epLinkAnchor(element: JQuery<HTMLElement>): string {
  const t = j.$('.b-translator__item.active').last().attr('data-translator_id');
  const s = element.attr('data-season_id');
  const e = element.attr('data-episode_id');
  return `t:${t}-s:${s}-e:${e}`;
}
