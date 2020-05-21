import { metadataInterface, searchInterface } from '../listInterface';

export class metadata implements metadataInterface {
  private xhr;

  id: number;

  private aniId = NaN;

  readonly type: 'anime' | 'manga';

  constructor(public malUrl: string) {
    this.id = NaN;
    this.type = 'anime';

    const urlPart3 = utils.urlPart(malUrl, 3);

    if (urlPart3 !== 'anime' && urlPart3 !== 'manga') return;

    this.type = urlPart3;

    if (
      typeof malUrl !== 'undefined' &&
      malUrl.indexOf('myanimelist.net') > -1
    ) {
      this.id = Number(utils.urlPart(malUrl, 4));
    } else if (
      typeof malUrl !== 'undefined' &&
      malUrl.indexOf('anilist.co') > -1
    ) {
      this.id = NaN;
      this.aniId = Number(utils.urlPart(malUrl, 4));
    } else {
      this.id = NaN;
    }
  }

  init() {
    con.log(
      'Update AniList info',
      this.id ? `MAL: ${this.id}` : `AniList: ${this.aniId}`,
    );
    let selectId = this.id;
    let selectQuery = 'idMal';
    if (Number.isNaN(this.id)) {
      selectId = this.aniId;
      selectQuery = 'id';
    }

    const query = `
    query ($id: Int, $type: MediaType) {
      Media (${selectQuery}: $id, type: $type) {
        id
        idMal
        siteUrl
        episodes
        chapters
        volumes
        averageScore
        synonyms
        description(asHtml: true)
        coverImage{
          large
        }
        title {
          userPreferred
          romaji
          english
          native
        }
        characters (perPage: 6, sort: [ROLE, ID]) {
            edges {
                id
                role
                node {
                    id
                    siteUrl
                    name {
                        first
                        last
                    }
                    image {
                        large
                    }
                }
            }
        }
        popularity
        favourites
        rankings {
          id
          rank
          type
          format
          year
          season
          allTime
          context
        }
        relations {
            edges {
                id
                relationType (version: 2)
                node {
                    id
                    siteUrl
                    title {
                        userPreferred
                    }
                }
            }
        }
        format
        episodes
        duration
        status
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        studios {
            edges {
                isMain
                node {
                    siteUrl
                    id
                    name
                }
            }
        }
        source(version: 2)
        genres
        externalLinks {
          site
          url
        }
      }
    }
    `;
    const variables = {
      id: selectId,
      type: this.type.toUpperCase(),
    };

    return api.request
      .xhr('POST', {
        url: 'https://graphql.anilist.co',
        headers: {
          // 'Authorization': 'Bearer ' + helper.accessToken(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: JSON.stringify({
          query,
          variables,
        }),
      })
      .then(response => {
        const res = JSON.parse(response.responseText);
        con.log(res);
        this.xhr = res;
        return this;
      });
  }

  getTitle() {
    let title = '';
    try {
      title = this.xhr.data.Media.title.userPreferred;
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return title;
  }

  getDescription() {
    let description = '';
    try {
      description = this.xhr.data.Media.description;
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return description;
  }

  getImage() {
    let image = '';
    try {
      image = this.xhr.data.Media.coverImage.large;
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return image;
  }

  getAltTitle() {
    const altTitle: string[] = [];
    try {
      for (const prop in this.xhr.data.Media.title) {
        const el = this.xhr.data.Media.title[prop];
        if (el !== this.getTitle() && el) {
          altTitle.push(el);
        }
      }
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return altTitle;
  }

  getCharacters() {
    const charArray: any[] = [];
    try {
      this.xhr.data.Media.characters.edges.forEach(function(i) {
        let name = '';
        if (i.node.name.last !== null) name += i.node.name.last;
        if (
          i.node.name.first !== '' &&
          i.node.name.last !== '' &&
          i.node.name.first !== null &&
          i.node.name.last !== null
        ) {
          name += ', ';
        }
        if (i.node.name.first !== null) name += i.node.name.first;
        name = `<a href="${i.node.siteUrl}">${name}</a>`;
        charArray.push({
          img: i.node.image.large,
          html: name,
        });
      });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return charArray;
  }

  getStatistics() {
    const stats: any[] = [];
    try {
      if (this.xhr.data.Media.averageScore !== null)
        stats.push({
          title: 'Score:',
          body: this.xhr.data.Media.averageScore,
        });

      if (this.xhr.data.Media.favourites !== null)
        stats.push({
          title: 'Favourites:',
          body: this.xhr.data.Media.favourites,
        });

      if (this.xhr.data.Media.popularity !== null)
        stats.push({
          title: 'Popularity:',
          body: this.xhr.data.Media.popularity,
        });

      this.xhr.data.Media.rankings.forEach(function(i) {
        if (stats.length < 4 && i.allTime) {
          let title = `${i.context.replace('all time', '').trim()}:`;
          title = title.charAt(0).toUpperCase() + title.slice(1);

          stats.push({
            title,
            body: `#${i.rank}`,
          });
        }
      });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return stats;
  }

  getInfo() {
    const html: any[] = [];
    try {
      if (this.xhr.data.Media.format !== null) {
        let format = this.xhr.data.Media.format.toLowerCase().replace('_', ' ');
        format = format.charAt(0).toUpperCase() + format.slice(1);
        html.push({
          title: 'Format:',
          body: format,
        });
      }

      if (this.xhr.data.Media.episodes !== null)
        html.push({
          title: 'Episodes:',
          body: this.xhr.data.Media.episodes,
        });

      if (this.xhr.data.Media.duration !== null)
        html.push({
          title: 'Episode Duration:',
          body: `${this.xhr.data.Media.duration} mins`,
        });

      if (this.xhr.data.Media.status !== null) {
        let status = this.xhr.data.Media.status.toLowerCase().replace('_', ' ');
        status = status.charAt(0).toUpperCase() + status.slice(1);
        html.push({
          title: 'Status:',
          body: status,
        });
      }

      if (this.xhr.data.Media.startDate.year !== null)
        html.push({
          title: 'Start Date:',
          body: `${this.xhr.data.Media.startDate.year}-${this.xhr.data.Media.startDate.month}-${this.xhr.data.Media.startDate.day}`,
        });

      if (this.xhr.data.Media.endDate.year !== null)
        html.push({
          title: 'End Date:',
          body: `${this.xhr.data.Media.endDate.year}-${this.xhr.data.Media.endDate.month}-${this.xhr.data.Media.endDate.day}`,
        });

      if (this.xhr.data.Media.season !== null) {
        let season = this.xhr.data.Media.season.toLowerCase().replace('_', ' ');
        season = season.charAt(0).toUpperCase() + season.slice(1);
        if (this.xhr.data.Media.endDate.year !== null)
          season += ` ${this.xhr.data.Media.endDate.year}`;
        html.push({
          title: 'Season:',
          body: season,
        });
      }

      let studios = '';
      this.xhr.data.Media.studios.edges.forEach(function(i, index) {
        if (i.isMain) {
          if (studios !== '') studios += ', ';
          studios += `<a href="${i.node.siteUrl}">${i.node.name}</a>`;
        }
      });
      if (studios !== '')
        html.push({
          title: 'Studios:',
          body: studios,
        });

      if (this.xhr.data.Media.source !== null) {
        let source = this.xhr.data.Media.source.toLowerCase().replace('_', ' ');
        source = source.charAt(0).toUpperCase() + source.slice(1);
        html.push({
          title: 'Source:',
          body: source,
        });
      }

      if (this.xhr.data.Media.genres !== null) {
        const gen: string[] = [];
        this.xhr.data.Media.genres.forEach(function(i, index) {
          gen.push(
            `<a href="https://anilist.co/search/anime?includedGenres=${i}">${i}</a>`,
          );
        });
        html.push({
          title: 'Genres:',
          body: gen.join(', '),
        });
      }

      let external = '';
      this.xhr.data.Media.externalLinks.forEach(function(i, index) {
        if (external !== '') external += ', ';
        external += `<a href="${i.url}">${i.site}</a>`;
      });
      if (external !== '')
        html.push({
          title: 'External Links:',
          body: external,
        });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return html;
  }

  getOpeningSongs() {
    const openingSongs = [];
    return openingSongs;
  }

  getEndingSongs() {
    const endingSongs = [];
    return endingSongs;
  }

  getRelated() {
    let el: {
      type: string;
      links: { url: string; title: string; statusTag: string }[];
    }[] = [];
    const links: any = {};
    try {
      this.xhr.data.Media.relations.edges.forEach(function(i) {
        if (typeof links[i.relationType] === 'undefined') {
          let title = i.relationType.toLowerCase().replace('_', ' ');
          title = title.charAt(0).toUpperCase() + title.slice(1);

          links[i.relationType] = {
            type: title,
            links: [],
          };
        }
        links[i.relationType].links.push({
          url: i.node.siteUrl,
          title: i.node.title.userPreferred,
          statusTag: '',
        });
      });
      el = Object.keys(links).map(key => links[key]);
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return el;
  }
}

export async function search(
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
): Promise<searchInterface> {
  const query = `
    query ($search: String) {
      ${type}: Page (perPage: 10) {
        pageInfo {
          total
        }
        results: media (type: ${type.toUpperCase()}, search: $search) {
          id
          siteUrl
          idMal
          title {
            userPreferred
            romaji
            english
            native
          }
          coverImage {
            medium
          }
          type
          format
          averageScore
          startDate {
            year
          }
          synonyms
        }
      }
    }
  `;

  const variables = {
    search: keyword,
  };

  const response = await api.request.xhr('POST', {
    url: 'https://graphql.anilist.co',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: JSON.stringify({
      query,
      variables,
    }),
  });

  const res = JSON.parse(response.responseText);
  con.log(res);

  const resItems: any = [];

  j.$.each(res.data[type].results, function(index, item) {
    resItems.push({
      id: item.id,
      name: item.title.userPreferred,
      altNames: Object.values(item.title).concat(item.synonyms),
      url: item.siteUrl,
      malUrl: () => {
        return item.idMal
          ? `https://myanimelist.net/${type}/${item.idMal}`
          : null;
      },
      image: item.coverImage.medium,
      media_type: item.format
        ? (item.format.charAt(0) + item.format.slice(1).toLowerCase()).replace(
            '_',
            ' ',
          )
        : '',
      isNovel: item.format === 'NOVEL',
      score: item.averageScore,
      year: item.startDate.year,
    });
  });

  return resItems;
}
