import { pageInterface } from '../pageInterface';

const temp: { id: any; media: any } = {
  id: null,
  media: null,
};

export const Crunchyroll: pageInterface = {
  name: 'Crunchyroll',
  domain: 'https://www.crunchyroll.com',
  database: 'Crunchyroll',
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
      return Crunchyroll.sync
        .getIdentifier(urlHandling(url))
        .replace(/\(\d+-\d+\)/, '')
        .trim();
    },
    getIdentifier(url) {
      return `${temp.id}`;
    },
    getOverviewUrl(url) {
      return `${urlHandling(url)
        .split('/')
        .slice(0, 4)
        .join('/')}?media_id=${temp.media}`;
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
      return Crunchyroll.domain + nextEp;
    },
  },
  overview: {
    getTitle(url) {
      return Crunchyroll.overview!.getIdentifier(urlHandling(url))
        .replace(/\(\d+-\d+\)/, '')
        .trim();
    },
    getIdentifier(url) {
      if (j.$('.season-dropdown').length > 1) {
        throw new Error('MAL-Sync does not support multiple seasons');
      } else {
        return `${temp.id}`;
      }
    },
    uiSelector(selector) {
      j.$('#tabs')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('#showview_content_videos .list-of-seasons .group-item a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Crunchyroll.domain);
      },
      elementEp(selector) {
        const url = Crunchyroll.overview!.list!.elementUrl(selector);
        return episodeHelper(
          urlHandling(url),
          selector
            .find('.series-title')
            .text()
            .trim(),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(document).ready(function() {
      if (j.$('.season-dropdown').length > 1) {
        j.$('.season-dropdown').append(
          j.html(
            '<span class="exclusivMal" style="float: right; margin-right: 20px; color: #0A6DA4;" onclick="return false;">MAL</span>',
          ),
        );
        j.$('.exclusivMal').click(function(evt) {
          j.$('#showview_content').before(
            j.html(`<div><a href="${page.url.split('?')[0]}">Show hidden seasons</a></div>`),
          );
          const thisparent = j.$(evt.target).parent();
          j.$('.season-dropdown')
            .not(thisparent)
            .siblings()
            .remove();
          j.$('.season-dropdown')
            .not(thisparent)
            .remove();
          j.$('.portrait-grid')
            .css('display', 'block')
            .find('li.group-item img.landscape')
            .each(function() {
              // @ts-ignore
              void 0 === j.$(this).attr('src') && // eslint-disable-line
                j
                  .$(this)
                  .attr('src', String(j.$(this).attr('data-thumbnailUrl')));
            });
          j.$('.exclusivMal').remove();

          const epUrl = utils.absoluteLink(
            $('.list-of-seasons a.episode')
              .first()
              .attr('href'),
            Crunchyroll.domain,
          );
          handle(epUrl, page);
        });
        let season = new RegExp('[?&]media_id=([^&#]*)').exec(page.url);
        if (season !== null) {
          // @ts-ignore
          season = season[1] || null;
          if (season !== null) {
            // @ts-ignore
            season = parseInt(season);
            j.$(`#showview_videos_media_${season}`)
              .first()
              .parent()
              .parent()
              .find('.exclusivMal')
              .first()
              .click();
          }
        }
      } else if (
        j.$('.header-navigation ul .state-selected').length &&
        !j
          .$('.header-navigation ul .state-selected')
          .first()
          .index()
      ) {
        const epUrl = utils.absoluteLink(
          $('.list-of-seasons a.episode')
            .first()
            .attr('href'),
          Crunchyroll.domain,
        );
        handle(epUrl, page);
      } else if (j.$('#showmedia_video').length) {
        handle(page.url, page);
      } else {
        con.info('No anime page');
      }
    });
  },
};

function handle(epUrl, page) {
  const mediaUrl = epUrl.split('?')[0].split('#')[0];
  const mediaId = parseInt(mediaUrl.split('-').pop());
  if (!mediaId) throw 'Media Id not found';
  temp.media = mediaId;
  api.request
    .xhr(
      'GET',
      `https://www.crunchyroll.com/en-gb/xml?req=RpcApiVideoPlayer_GetStandardConfig&media_id=${mediaId}&video_format=108&video_quality=80&current_page=${mediaUrl}`,
    )
    .then(response => {
      con.log(response);
      const xmlDoc = $.parseXML(response.responseText);
      const $xml = $(xmlDoc);
      const title = $xml
        .find('series_title')
        .first()
        .text();
      con.m('title').log(title);
      temp.id = title;
      page.handlePage();
    });
}

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
