import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { errorCode } from '../definitions';
import * as helper from './helper';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('Anilist');
    if (url.match(/anilist\.co\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.aniId = Number(utils.urlPart(url, 4));
      this.malId = NaN;
      return this;
    }
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.malId = Number(utils.urlPart(url, 4));
      this.aniId = NaN;
      return this;
    }
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  protected readonly type;

  private readonly aniId: number;

  private readonly malId: number;

  async _init() {
    this.logger.log('Retrieve', this.type, this.aniId ? `Anilist: ${this.aniId}` : `MAL: ${this.malId}`);

    const data = await this.getData();
    this.logger.log('Data', data);

    this.title(data);
    this.description(data);
    this.image(data);
    this.alternativeTitle(data);
    this.characters(data);
    this.statistics(data);
    this.info(data);
    this.related(data);

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    let selectId = this.malId;
    let selectQuery = 'idMal';
    if (Number.isNaN(this.malId)) {
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

    return this.apiCall(query, variables, false);
  }

  private title(data) {
    const title = data?.data?.Media?.title?.userPreferred;
    if (title) this.meta.title = title;
  }

  private description(data) {
    const description = data?.data?.Media?.description;
    if (description) this.meta.description = description;
  }

  private image(data) {
    const image = data?.data?.Media?.coverImage?.large;
    if (image) this.meta.image = image;
  }

  private alternativeTitle(data) {
    const titles = data?.data?.Media?.title;
    if (titles) {
      for (const prop in titles) {
        const el = data.data.Media.title[prop];
        if (el !== this.meta.title && el) {
          this.meta.alternativeTitle.push(el);
        }
      }
    }
  }

  private characters(data) {
    const chars = data?.data?.Media?.characters?.edges;
    if (chars) {
      chars.forEach(i => {
        let name = '';
        if (i.node.name.last) name += i.node.name.last;
        if (i.node.name.first && i.node.name.last) {
          name += ', ';
        }
        if (i.node.name.first) name += i.node.name.first;
        this.meta.characters.push({
          img: i.node.image.large,
          name,
          url: i.node.siteUrl,
        });
      });
    }
  }

  private statistics(data) {
    if (data.data.Media.averageScore)
      this.meta.statistics.push({
        title: 'Score:',
        body: data.data.Media.averageScore,
      });

    if (data.data.Media.favourites)
      this.meta.statistics.push({
        title: 'Favourites:',
        body: data.data.Media.favourites,
      });

    if (data.data.Media.popularity)
      this.meta.statistics.push({
        title: 'Popularity:',
        body: data.data.Media.popularity,
      });

    data.data.Media.rankings.forEach(i => {
      if (this.meta.statistics.length < 4 && i.allTime) {
        let title = `${i.context.replace('all time', '').trim()}:`;
        title = title.charAt(0).toUpperCase() + title.slice(1);

        this.meta.statistics.push({
          title,
          body: `#${i.rank}`,
        });
      }
    });
  }

  private info(data) {
    if (data.data.Media.format) {
      let format = data.data.Media.format.toLowerCase().replace('_', ' ');
      format = format.charAt(0).toUpperCase() + format.slice(1);
      this.meta.info.push({
        title: 'Format:',
        body: [{ text: format }],
      });
    }

    if (data.data.Media.episodes)
      this.meta.info.push({
        title: 'Episodes:',
        body: [{ text: data.data.Media.episodes }],
      });

    if (data.data.Media.duration)
      this.meta.info.push({
        title: 'Episode Duration:',
        body: [{ text: `${data.data.Media.duration} mins` }],
      });

    if (data.data.Media.status) {
      let status = data.data.Media.status.toLowerCase().replace('_', ' ');
      status = status.charAt(0).toUpperCase() + status.slice(1);
      this.meta.info.push({
        title: 'Status:',
        body: [{ text: status }],
      });
    }

    if (data.data.Media.startDate.year)
      this.meta.info.push({
        title: 'Start Date:',
        body: [
          {
            text: `${data.data.Media.startDate.year}-${data.data.Media.startDate.month}-${data.data.Media.startDate.day}`,
          },
        ],
      });

    if (data.data.Media.endDate.year)
      this.meta.info.push({
        title: 'End Date:',
        body: [
          { text: `${data.data.Media.endDate.year}-${data.data.Media.endDate.month}-${data.data.Media.endDate.day}` },
        ],
      });

    if (data.data.Media.season) {
      let season = data.data.Media.season.toLowerCase().replace('_', ' ');
      season = season.charAt(0).toUpperCase() + season.slice(1);
      if (data.data.Media.endDate.year) season += ` ${data.data.Media.endDate.year}`;
      this.meta.info.push({
        title: 'Season:',
        body: [{ text: season }],
      });
    }

    const studios: any = [];
    data.data.Media.studios.edges.forEach(function(i, index) {
      if (i.isMain) {
        studios.push({
          text: i.node.name,
          url: i.node.siteUrl,
        });
      }
    });
    if (studios.length)
      this.meta.info.push({
        title: 'Studios:',
        body: studios,
      });

    if (data.data.Media.source) {
      let source = data.data.Media.source.toLowerCase().replace('_', ' ');
      source = source.charAt(0).toUpperCase() + source.slice(1);
      this.meta.info.push({
        title: 'Source:',
        body: [{ text: source }],
      });
    }

    if (data.data.Media.genres) {
      const gen: any[] = [];
      data.data.Media.genres.forEach(function(i, index) {
        gen.push({
          text: i,
          url: `https://anilist.co/search/anime?includedGenres=${i}`,
        });
      });
      this.meta.info.push({
        title: 'Genres:',
        body: gen,
      });
    }

    const external: any[] = [];
    data.data.Media.externalLinks.forEach(function(i, index) {
      external.push({
        text: i.site,
        url: i.url,
      });
    });
    if (external.length)
      this.meta.info.push({
        title: 'External Links:',
        body: external,
      });
  }

  private related(data) {
    const links: any = {};
    data.data.Media.relations.edges.forEach(i => {
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
    this.meta.related = Object.keys(links).map(key => links[key]);
  }

  protected apiCall = helper.apiCall;
}
