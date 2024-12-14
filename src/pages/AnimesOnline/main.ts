import { pageInterface } from '../pageInterface';

let originalSrc;
const changeSrc = (currentPlayer, currentTries = 0) => {
  const tempSrc = $(`#tab-${currentPlayer} video`).attr('src');

  if (tempSrc === undefined) {
    if (currentTries >= 100) {
      utils.flashm('MAL-SYNC: Cant find target src video, please refresh the page and try again!', {
        error: true,
        type: 'error',
      });
      return;
    }

    setTimeout(() => {
      currentTries++;
      changeSrc(currentPlayer, currentTries);
    }, 50);
    return;
  }

  $('.player.current').removeClass('current');
  $('#tab-1').addClass('current');

  $($('video')[0]).attr('src', currentPlayer === 1 ? originalSrc : (tempSrc ?? originalSrc));
};

export const AnimesOnline: pageInterface = {
  name: 'Animes Online',
  domain: 'https://animesonline.in',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3).startsWith('video');
  },
  isOverviewPage(url) {
    return ['anime', 'animes-dublado'].includes(utils.urlPart(url, 3));
  },
  sync: {
    getTitle(url) {
      return j.$(j.$('.breadcrumb li')[2]).text().replace('- Dublado', '').trim();
    },
    getIdentifier(url) {
      return AnimesOnline.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      return j.$(j.$('.breadcrumb li')[2]).find('a').attr('href') ?? '';
    },
    getEpisode(url) {
      return Number(j.$(j.$('.breadcrumb li')[3]).text().split('ep')[1].trim());
    },
    nextEpUrl(url) {
      return j.$(j.$('.playerbox .controls a')[2]).attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return AnimesOnline.sync.getTitle(url);
    },
    getIdentifier(url) {
      return AnimesOnline.sync.getTitle(url);
    },
    uiSelector(selector) {
      j.$('.banner-infos > .info:last-child').after(
        j.html(`<div title="MalSync">${j.html(selector)}</div>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episode-card');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          j.$(selector.find('a').first()).attr('href'),
          AnimesOnline.domain,
        );
      },
      elementEp(selector) {
        return Number(selector.find('.card-title span').text().split('EP')[1].trim());
      },
    },
  },
  init(page) {
    j.$(document).ready(function () {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );

      originalSrc = $($('.player video')[0]).attr('src');

      page.handlePage();

      $('.player-option a').on('click', function () {
        const currentPlayer = Number($(this).parent().data('tab').split('-')[1]);

        // required to make a first click so it thinks that the player is setup and playing
        $('video')[0].click();
        // @ts-ignore
        $('video')[0].pause();

        setTimeout(() => {
          changeSrc(currentPlayer);
        }, 500);
      });
    });
  },
};
