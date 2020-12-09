import { pageInterface } from '../pageInterface';

export const Okanime: pageInterface = {
  name: 'Okanime',
  domain: 'https://okanime.tv',
  type: 'anime',
  languages: ['Arabic'],

  isOverviewPage: url => utils.urlPart(url, 3) === 'animes' || utils.urlPart(url, 3) === 'movies',
  isSyncPage: url =>
    utils.urlPart(url, 5) === 'episodes' || (utils.urlPart(url, 3) === 'movies' && utils.urlPart(url, 5) === 'watch'),

  overview: {
    getTitle: url =>
      isRealOverview(url)
        ? j
            .$('.author-info-title > span')
            .first()
            .text()
        : Okanime.sync.getTitle(url),
    getIdentifier: url => (isRealOverview(url) ? utils.urlPart(url, 4) : Okanime.sync.getIdentifier(url)),
    uiSelector: selector => {
      j.$('div.whitebox .whitebox-wrap .review-author-info .author-info-title')
        .first()
        .append(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector: () =>
        isRealOverview(window.location.href)
          ? j.$('#episodes .enable-photos-box a:not(.btn)')
          : j.$('.result-item.episode'),
      elementUrl: selector => utils.absoluteLink(selector.attr('href'), Okanime.domain),
      elementEp: selector => {
        return Okanime.sync.getEpisode(Okanime.overview!.list!.elementUrl(selector));
      },
      getTotal: () =>
        isRealOverview(window.location.href)
          ? Number(
              j
                .$('div.review-author-wrap .content-block .full-list-info:last-child small:last-child')
                .first()
                .text()
                .split('/')[1],
            )
          : undefined,
    },
  },
  sync: {
    getTitle: url =>
      j
        .$('.summary-block p a')
        .first()
        .text(),
    getIdentifier: url => utils.urlPart(url, 4),
    getOverviewUrl: url =>
      `${url
        .split('/')
        .slice(0, 5)
        .join('/')}`,
    getEpisode: url =>
      Number(
        utils
          .urlPart(url, 6)
          .split('-')
          .slice(-2)[0],
      ),
    nextEpUrl: url => {
      return utils.absoluteLink(
        j
          .$('div.action-tiem.backward a')
          .first()
          .attr('href'),
        Okanime.domain,
      );
    },
    uiSelector: selector => {
      j.$('div.user-block .translated-box')
        .first()
        .prepend(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(() => {
      utils.waitUntilTrue(
        () => Okanime.overview!.list!.elementsSelector().length,
        () => {
          page.handlePage();
        },
      );
    });
  },
};

const isRealOverview = (url: string): boolean => {
  const overview = url.split('/');
  return (overview[3] === 'animes' || overview[3] === 'movies') && overview.length === 5;
};
