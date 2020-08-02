import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { errorCode } from '../definitions';
import * as helper from './helper';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('Kitsu');

    if (url.match(/kitsu\.io\/(anime|manga)\/.*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.kitsuSlug = utils.urlPart(url, 4);
      this.malId = NaN;
      return this;
    }
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.malId = Number(utils.urlPart(url, 4));
      this.kitsuSlug = '';
      return this;
    }
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  protected readonly type;

  private kitsuSlug: string;

  private kitsuId = NaN;

  private readonly malId: number;

  private animeInfo: any;

  animeI() {
    return this.animeInfo.data;
  }

  async _init() {
    this.logger.log('Retrieve', this.type, this.kitsuSlug ? `Kitsu: ${this.kitsuSlug}` : `MAL: ${this.malId}`);

    await this.getData();
    this.logger.log('Data', this.animeInfo);

    this.title();
    this.description();
    this.image();
    this.alternativeTitle();
    this.characters();
    this.statistics();
    this.info();
    this.related();

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    if (!this.kitsuSlug) {
      const kitsuRes = await this.malToKitsu(this.malId, this.type);
      try {
        this.kitsuId = kitsuRes.data[0].relationships.item.data.id;
        kitsuRes.included.forEach(el => {
          if (el.id === this.kitsuId) {
            this.kitsuSlug = el.attributes.slug;
          }
        });
        if (!this.kitsuSlug) throw 'No slug';
      } catch (e) {
        throw this.errorObj(errorCode.EntryNotFound, e.message);
      }
    }

    return this.apiCall(
      'GET',
      `https://kitsu.io/api/edge/${this.type}?filter[slug]=${this.kitsuSlug}&include=characters.character,mediaRelationships.destination,categories&fields[categories]=slug,title&`,
      {},
      false,
    ).then(res => {
      try {
        res.data = res.data[0];
        // eslint-disable-next-line no-unused-expressions
        res.data.attributes.slug;
      } catch (e) {
        throw this.errorObj(errorCode.EntryNotFound, e.message);
      }

      this.animeInfo = res;
    });
  }

  private title() {
    this.meta.title = helper.getTitle(this.animeI().attributes.titles, this.animeI().attributes.canonicalTitle);
  }

  private description() {
    this.meta.description = `<span style="white-space: pre-line;">${this.animeI().attributes.synopsis.replace(
      '—',
      ' ',
    )}</span>`;
  }

  private image() {
    this.meta.image = this.animeI().attributes.posterImage.large;
  }

  private alternativeTitle() {
    for (const prop in this.animeI().attributes.abbreviatedTitles) {
      const el = this.animeI().attributes.abbreviatedTitles[prop];
      if (el !== this.meta.title && el) {
        this.meta.alternativeTitle.push(el);
      }
    }

    for (const prop in this.animeI().attributes.titles) {
      const el = this.animeI().attributes.titles[prop];
      if (el !== this.meta.title && el) {
        this.meta.alternativeTitle.push(el);
      }
    }
  }

  private characters() {
    this.animeInfo.included.forEach(i => {
      if (i.type === 'characters' && this.meta.characters.length < 10) {
        const { name } = i.attributes;

        this.meta.characters.push({
          img: i.attributes.image !== null ? i.attributes.image.original : api.storage.assetUrl('questionmark.gif'),
          name,
          url: `https://myanimelist.net/character/${i.attributes.malId}`,
        });
      }
    });
  }

  private statistics() {
    if (this.animeI().attributes.averageRating !== null)
      this.meta.statistics.push({
        title: 'Score:',
        body: this.animeI().attributes.averageRating,
      });

    if (this.animeI().attributes.ratingRank !== null)
      this.meta.statistics.push({
        title: 'Ranked:',
        body: `#${this.animeI().attributes.ratingRank}`,
      });

    if (this.animeI().attributes.popularityRank !== null)
      this.meta.statistics.push({
        title: 'Popularity:',
        body: `#${this.animeI().attributes.popularityRank}`,
      });

    if (this.animeI().attributes.userCount !== null)
      this.meta.statistics.push({
        title: 'Members:',
        body: this.animeI().attributes.userCount,
      });
  }

  private info() {
    if (typeof this.animeI().attributes.subtype !== 'undefined' && this.animeI().attributes.subtype !== null) {
      let format = this.animeI()
        .attributes.subtype.toLowerCase()
        .replace('_', ' ');
      format = format.charAt(0).toUpperCase() + format.slice(1);
      this.meta.info.push({
        title: 'Format:',
        body: [{ text: format }],
      });
    }

    if (typeof this.animeI().attributes.episodeCount !== 'undefined' && this.animeI().attributes.episodeCount !== null)
      this.meta.info.push({
        title: 'Episodes:',
        body: [{ text: this.animeI().attributes.episodeCount }],
      });

    if (
      typeof this.animeI().attributes.episodeLength !== 'undefined' &&
      this.animeI().attributes.episodeLength !== null
    )
      this.meta.info.push({
        title: 'Episode Duration:',
        body: [{ text: `${this.animeI().attributes.episodeLength} mins` }],
      });

    if (typeof this.animeI().attributes.status !== 'undefined' && this.animeI().attributes.status !== null) {
      let status = this.animeI()
        .attributes.status.toLowerCase()
        .replace('_', ' ');
      status = status.charAt(0).toUpperCase() + status.slice(1);
      this.meta.info.push({
        title: 'Status:',
        body: [{ text: status }],
      });
    }

    if (typeof this.animeI().attributes.startDate !== 'undefined' && this.animeI().attributes.startDate !== null)
      this.meta.info.push({
        title: 'Start Date:',
        body: [{ text: this.animeI().attributes.startDate }],
      });

    if (typeof this.animeI().attributes.endDate !== 'undefined' && this.animeI().attributes.endDate !== null)
      this.meta.info.push({
        title: 'Start Date:',
        body: [{ text: this.animeI().attributes.endDate }],
      });

    const genres: any[] = [];
    this.animeInfo.included.forEach(i => {
      if (i.type === 'categories' && genres.length < 6) {
        genres.push({
          text: i.attributes.title,
          url: `https://kitsu.io/${this.type}?categories=${i.attributes.slug}`,
        });
      }
    });
    if (genres.length)
      this.meta.info.push({
        title: 'Genres:',
        body: genres,
      });

    if (typeof this.animeI().attributes.ageRating !== 'undefined' && this.animeI().attributes.ageRating !== null)
      this.meta.info.push({
        title: 'Rating:',
        body: [{ text: this.animeI().attributes.ageRating }],
      });

    if (typeof this.animeI().attributes.totalLength !== 'undefined' && this.animeI().attributes.totalLength !== null)
      this.meta.info.push({
        title: 'Total playtime:',
        body: [{ text: `${this.animeI().attributes.totalLength} mins` }],
      });
  }

  private related() {
    const links: any = {};
    const an: any[] = [];
    this.animeInfo.included.forEach(function(i) {
      if (i.type === 'manga' || i.type === 'anime') {
        an[i.id] = {
          url: `https://kitsu.io/${i.type}/${i.attributes.slug}`,
          title: helper.getTitle(i.attributes.titles, i.attributes.canonicalTitle),
          statusTag: '',
        };
      }
    });

    this.animeInfo.included.forEach(function(i) {
      if (i.type === 'mediaRelationships') {
        if (typeof links[i.attributes.role] === 'undefined') {
          let title = i.attributes.role.toLowerCase().replace('_', ' ');
          title = title.charAt(0).toUpperCase() + title.slice(1);

          links[i.attributes.role] = {
            type: title,
            links: [],
          };
        }
        const tempEl = an[i.relationships.destination.data.id];
        links[i.attributes.role].links.push(tempEl);
      }
    });
    this.meta.related = Object.keys(links).map(key => links[key]);
  }

  protected apiCall = helper.apiCall;

  protected malToKitsu = helper.malToKitsu;
}
