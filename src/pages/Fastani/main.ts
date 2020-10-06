import { pageInterface } from '../pageInterface';
import { apiCall } from '../../_provider/AniList/helper';

const data = {
  title: '',
  id: '',
  episode: 0,
  aniId: 0,
  malId: 0,
};

export const Fastani: pageInterface = {
  name: 'Fastani',
  domain: 'https://fastani.net',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return data.title;
    },
    getIdentifier(url) {
      return data.id;
    },
    getOverviewUrl(url) {
      const oUrl = url.split('/');
      oUrl[6] = '1';
      return oUrl.join('/');
    },
    getEpisode(url) {
      return data.episode;
    },
    nextEpUrl(url) {
      const nextEp = Number(j.$('#watch-page-main').attr('data-fastani-next'));
      if (nextEp >= 1) {
        const nextUrl = url.split('/');
        nextUrl[6] = nextEp.toString();
        return nextUrl.join('/');
      }
      return '';
    },
    getMalUrl(provider) {
      if (data.malId) {
        return `https://myanimelist.net/anime/${data.malId}`;
      }
      if (provider === 'ANILIST' && data.aniId) {
        return `https://anilist.co/anime/${data.aniId}`;
      }
      return false;
    },
  },
  init(page) {
    // eslint-disable-next-line global-require
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let Interval;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      $('html').addClass('miniMAL-hide');
      clearInterval(Interval);
      Interval = utils.waitUntilTrue(
        function() {
          return j.$('#watch-page-main').length && j.$('#watch-page-main').attr('data-fastani-ani') !== 'loading';
        },
        async function() {
          await getData(
            Number(j.$('#watch-page-main').attr('data-fastani-ani')),
            j.$('#watch-page-main').attr('data-fastani-title'),
            Number(utils.urlPart(page.url, 5)),
            Number(utils.urlPart(page.url, 6)),
          );
          $('html').removeClass('miniMAL-hide');
          page.handlePage();
        },
      );
    });
  },
};

async function getData(id, title, season, episode) {
  console.log('id', id, 'title', title, 'season', season, 'episode', episode);
  data.id = `${id}?s=${season}`;
  data.episode = episode;

  const query = `
    query ($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        id
        idMal
        title {
          romaji
        }
        relations {
          edges {
            id
            relationType(version: 2)
            node {
              id
              format
            }
          }
        }
      }
    }`;

  try {
    let currentId = id;
    for (let i = 1; i <= season; i++) {
      const variables = {
        id: currentId,
        type: 'ANIME',
      };
      const res = await apiCall(query, variables, false);

      if (i !== season) {
        await waitFor(500);
        let nextId;
        res.data.Media.relations.edges.forEach(relation => {
          if (relation.relationType === 'SEQUEL' && relation.node.format.startsWith('TV')) {
            nextId = relation.node.id;
          }
        });
        if (!nextId) {
          res.data.Media.relations.edges.forEach(relation => {
            if (relation.relationType === 'SEQUEL') {
              nextId = relation.node.id;
            }
          });
        }
        if (!nextId) throw 'no nextId found';
        currentId = nextId;
      } else {
        data.title = res.data.Media.title.romaji;
        data.malId = res.data.Media.idMal;
        data.aniId = res.data.Media.id;
      }
    }
  } catch (error) {
    con.error(error);
    data.title = `${title} season ${season}`;
  }
}

const waitFor = ms => new Promise(r => setTimeout(r, ms));
