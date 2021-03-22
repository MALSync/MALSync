import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { errorCode } from '../definitions';
import * as helper from './helper';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('Simkl');

    if (url.match(/simkl\.com\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.simklId = parseInt(utils.urlPart(url, 4));
      this.malId = NaN;
      if (this.type === 'manga') throw 'Simkl has no manga support';
      return this;
    }
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.malId = Number(utils.urlPart(url, 4));
      this.simklId = NaN;
      if (this.type === 'manga') throw 'Simkl has no manga support';
      return this;
    }

    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  protected readonly type;

  private simklId: number;

  private readonly malId: number;

  async _init() {
    this.logger.log('Retrieve', this.type, this.simklId ? `Simkl: ${this.simklId}` : `MAL: ${this.malId}`);

    const data = await this.getData();
    this.logger.log('Data', data);

    this.title(data);
    this.description(data);
    this.image(data);
    this.alternativeTitle(data);
    // this.characters(data);
    this.statistics(data);
    this.info(data);
    this.related(data);

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    let de;
    if (Number.isNaN(this.malId)) {
      de = { simkl: this.simklId };
    } else {
      de = { mal: this.malId };
    }

    if (Number.isNaN(this.simklId)) {
      const el = await this.call('https://api.simkl.com/search/id', de, true);
      if (!el) throw this.errorObj(errorCode.EntryNotFound, 'simklId');
      this.simklId = el[0].ids.simkl;
    }

    return this.call(`https://api.simkl.com/anime/${this.simklId}`, { extended: 'full' }, true);
  }

  private title(data) {
    const { title } = data;
    if (title) this.meta.title = title;
  }

  private description(data) {
    const description = data.overview;
    if (description) this.meta.description = description;
  }

  private image(data) {
    const image = data.poster;
    if (image) this.meta.image = `https://simkl.in/posters/${image}_ca.jpg`;
  }

  private alternativeTitle(data) {
    if (typeof data.en_title !== 'undefined' && data.en_title) this.meta.alternativeTitle.push(data.en_title);
  }

  private statistics(data) {
    if (data.ratings.simkl.rating)
      this.meta.statistics.push({
        title: 'Score:',
        body: data.ratings.simkl.rating,
      });
    if (data.ratings.mal && data.ratings.mal.rating)
      this.meta.statistics.push({
        title: 'MAL Score:',
        body: data.ratings.mal.rating,
      });

    if (data.rank && data.rank)
      this.meta.statistics.push({
        title: 'Ranked:',
        body: `#${data.rank}`,
      });
    if (data.ratings.simkl.votes)
      this.meta.statistics.push({
        title: 'Votes:',
        body: data.ratings.simkl.votes,
      });
  }

  private info(data) {
    if (data.anime_type && data.anime_type)
      this.meta.info.push({
        title: 'Type:',
        body: [{ text: data.anime_type }],
      });

    if (data.total_episodes && data.total_episodes)
      this.meta.info.push({
        title: 'Episodes:',
        body: [{ text: data.total_episodes }],
      });

    if (data.status && data.status)
      this.meta.info.push({
        title: 'Status:',
        body: [{ text: data.status }],
      });

    if (data.year && data.year)
      this.meta.info.push({
        title: 'Year:',
        body: [{ text: data.year }],
      });

    if (data.airs && data.airs)
      this.meta.info.push({
        title: 'Broadcast:',
        body: [{ text: `${data.airs.day} at ${data.airs.time}` }],
      });

    if (data.network && data.network)
      this.meta.info.push({
        title: 'Licensor:',
        body: [{ text: data.network }],
      });

    const genres: any[] = [];
    data.genres.forEach(i => {
      if (genres.length < 6) {
        genres.push({
          text: i,
          url: `https://simkl.com/${this.type}/${i.toLowerCase()}`,
        });
      }
    });
    if (genres.length)
      this.meta.info.push({
        title: 'Genres:',
        body: genres,
      });

    if (data.runtime && data.runtime)
      this.meta.info.push({
        title: 'Duration:',
        body: [{ text: `${data.runtime}mins` }],
      });

    if (data.certification && data.certification)
      this.meta.info.push({
        title: 'Rating:',
        body: [{ text: data.certification }],
      });
  }

  private related(data) {
    const links: any = {};
    if (!data.relations) return;
    data.relations.forEach(i => {
      if (!links[i.relation_type]) {
        let title = i.relation_type.toLowerCase().replace('_', ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);

        links[i.relation_type] = {
          type: title,
          links: [],
        };
      }
      links[i.relation_type].links.push({
        url: `https://simkl.com/anime/${i.ids.simkl}/${i.ids.slug}`,
        title: i.title,
        statusTag: '',
      });
    });
    this.meta.related = Object.keys(links).map(key => links[key]);
  }

  jsonParse(response) {
    if (response.responseText === '') {
      throw {
        code: 444,
        message: 'No Response',
      };
    }

    try {
      return JSON.parse(response.responseText);
    } catch (e) {
      throw {
        code: 406,
        message: 'Not Acceptable',
        error: e,
      };
    }
  }

  protected call = helper.call;

  protected errorHandling = helper.errorHandling;
}
