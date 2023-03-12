/* eslint-disable no-shadow */
import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { UrlNotSupportedError } from '../Errors';
import * as helper from './helper';
import { msDiffToShortTimeString } from '../../utils/time';

enum mediaTypeDefinition {
  unknown = 'Unknown',
  tv = 'TV',
  ova = 'OVA',
  movie = 'Movie',
  special = 'Special',
  ona = 'ONA',
  music = 'Music',
  manga = 'Manga',
  novel = 'Novel',
  one_shot = 'One shot',
  doujinshi = 'Doujinshi',
  manhwa = 'Manhwa',
  manhua = 'Manhua',
  oel = 'OEL',
}

enum airingStatusDefinition {
  finished_airing = 'Finished Airing',
  currently_airing = 'Currently Airing',
  not_yet_aired = 'Not Yet Aired',
  finished = 'Finished',
  currently_publishing = 'Currently Publishing',
  not_yet_published = 'Not Yet Published',
}

enum sourceDefinition {
  other = 'Other',
  original = 'Original',
  manga = 'Manga',
  '4_koma_manga' = '4 Koma Manga',
  web_manga = 'Web Manga',
  digital_manga = 'Digital Manga',
  novel = 'Novel',
  light_novel = 'Light Novel',
  visual_novel = 'Visual Novel',
  game = 'Game',
  card_game = 'Card Game',
  book = 'Book',
  picture_book = 'Picture Book',
  radio = 'Radio',
  music = 'Music',
}

enum ratingDefinition {
  g = 'G - All Ages',
  pg = 'PG - Children',
  pg_13 = 'PG 13 - Teens 13 and Older',
  r = 'R - 17+ (violence & profanity)',
  'r+' = 'R+ - Profanity & Mild Nudity',
  rx = 'Rx - Hentai',
}

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('MAL');
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.malId = Number(utils.urlPart(url, 4));
      return;
    }
    throw new UrlNotSupportedError(url);
  }

  protected readonly type;

  private readonly malId: number;

  async _init() {
    this.logger.log('Retrieve', this.type, this.malId);

    const data = await this.getData();
    this.logger.log('Data', data);

    this.title(data);
    this.description(data);
    this.image(data);
    this.alternativeTitle(data);
    this.statistics(data);
    this.info(data);
    this.related(data);

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    return this.apiCall({
      type: 'GET',
      path: `${this.type}/${this.malId}`,
      fields: [
        'synopsis',
        'alternative_titles',
        'mean',
        'rank',
        'popularity',
        'num_list_users',
        'num_scoring_users',
        'related_anime',
        'related_manga',
        // Info
        'media_type',
        'num_episodes',
        'num_chapters',
        'num_volumes',
        'status',
        'start_date',
        'end_date',
        'start_season',
        'broadcast',
        'studios',
        'authors{first_name,last_name}',
        'source',
        'genres',
        'average_episode_duration',
        'rating',
        'serialization',
      ],
    });
  }

  private title(data) {
    this.meta.title = data.title;
  }

  private description(data) {
    if (data.synopsis) this.meta.description = data.synopsis;
  }

  private image(data) {
    if (data.main_picture && data.main_picture.medium) this.meta.image = data.main_picture.medium;
    this.meta.imageLarge = data.main_picture?.large || data.main_picture?.medium || '';
  }

  private alternativeTitle(data) {
    if (data.alternative_titles) {
      for (const prop in data.alternative_titles) {
        const el = data.alternative_titles[prop];
        if (Array.isArray(el)) {
          this.meta.alternativeTitle = this.meta.alternativeTitle.concat(el);
        } else if (el) this.meta.alternativeTitle.push(el);
      }
    }
  }

  private statistics(data) {
    if (data.mean)
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Score'),
        body: data.mean,
      });

    if (data.rank)
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Ranked'),
        body: `#${data.rank}`,
      });

    if (data.popularity)
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Popularity'),
        body: `#${data.popularity}`,
      });

    if (data.num_list_users)
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Members'),
        body: data.num_list_users.toLocaleString(),
      });

    if (data.num_scoring_users)
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Votes'),
        body: data.num_scoring_users.toLocaleString(),
      });
  }

  private info(data) {
    if (data.media_type) {
      const format = mediaTypeDefinition[data.media_type];
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Format'),
        body: [
          {
            text: format ?? data.media_type,
            url: `https://myanimelist.net/top${this.type}.php?type=${data.media_type}`,
          },
        ],
      });
    }

    if (data.num_episodes) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Episodes'),
        body: [{ text: data.num_episodes }],
      });
    } else if (data.num_episodes === 0) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Episodes'),
        body: [{ text: 'Unknown' }],
      });
    }

    if (data.num_chapters) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Chapters'),
        body: [{ text: data.num_chapters }],
      });
    } else if (data.num_chapters === 0) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Chapters'),
        body: [{ text: 'Unknown' }],
      });
    }

    if (data.num_volumes) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Volumes'),
        body: [{ text: data.num_volumes }],
      });
    } else if (data.num_volumes === 0) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Volumes'),
        body: [{ text: 'Unknown' }],
      });
    }

    if (data.status) {
      const format = airingStatusDefinition[data.status];
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Status'),
        body: [{ text: format ?? data.status }],
      });
    }

    if (data.start_date) {
      let format = '';
      if (data.start_date) format += `${data.start_date} `;
      format += 'to ';
      if (data.end_date) {
        format += data.end_date;
      } else {
        format += '?';
      }
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Aired'),
        body: [{ text: format }],
      });
    }

    if (data.start_season) {
      let format = '';
      if (data.start_season.season) format += `${data.start_season.season} `;
      if (data.start_season.year) format += data.start_season.year;
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Season'),
        body: [
          {
            url: `https://myanimelist.net/${this.type}/season/${data.start_season.year}/${data.start_season.season}`,
            text: format,
          },
        ],
      });
    }

    if (data.broadcast) {
      let format = '';
      if (data.broadcast.day_of_the_week) format += `${data.broadcast.day_of_the_week} `;
      if (data.broadcast.day_of_the_week && data.broadcast.start_time) format += 'at ';
      if (data.broadcast.start_time) format += `${data.broadcast.start_time} (JST)`;
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Broadcast'),
        body: [{ text: format }],
      });
    }

    if (data.studios) {
      const studios: any[] = [];
      data.studios.forEach(function (i, index) {
        studios.push({
          text: i.name,
          url: `https://myanimelist.net/anime/producer/${i.id}`,
        });
      });
      if (studios.length)
        this.meta.info.push({
          title: api.storage.lang('overview_sidebar_Studios'),
          body: studios,
        });
    }

    if (data.authors) {
      const authors: any[] = [];
      data.authors.forEach(function (i, index) {
        authors.push({
          text: `${i.node.last_name ?? ''}${i.node.last_name && i.node.first_name ? ',' : ''} ${
            i.node.first_name ?? ''
          }`,
          url: `https://myanimelist.net/people/${i.node.id}`,
          subtext: i.role || '',
        });
      });
      if (authors.length)
        this.meta.info.push({
          title: api.storage.lang('overview_sidebar_Authors'),
          body: authors,
        });
    }

    if (data.source) {
      const format = sourceDefinition[data.source];
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Source'),
        body: [{ text: format ?? data.source }],
      });
    }

    if (data.genres) {
      const genres: any[] = [];
      data.genres.forEach((i, index) => {
        genres.push({
          text: i.name,
          url: `https://myanimelist.net/${this.type}/genre/${i.id}`,
        });
      });
      if (genres.length)
        this.meta.info.push({
          title: api.storage.lang('overview_sidebar_Genres'),
          body: genres,
        });
    }

    if (data.average_episode_duration) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Duration'),
        body: [{ text: msDiffToShortTimeString(data.average_episode_duration * 1000) }],
      });
    }

    if (data.rating) {
      const format = ratingDefinition[data.rating];
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Rating'),
        body: [{ text: format ?? data.rating }],
      });
    }

    if (data.serialization) {
      const serialization: any[] = [];
      data.serialization.forEach(function (i, index) {
        serialization.push({
          text: i.node.name,
          url: `https://myanimelist.net/manga/magazine/${i.node.id}`,
        });
      });
      if (serialization.length)
        this.meta.info.push({
          title: api.storage.lang('overview_sidebar_Serialization'),
          body: serialization,
        });
    }
  }

  private related(data) {
    const links: any = {};

    if (data.related_anime.length) {
      data.related_anime.forEach(el => {
        if (typeof links[el.relation_type] === 'undefined') {
          links[el.relation_type] = {
            type: el.relation_type_formatted,
            links: [],
          };
        }

        links[el.relation_type].links.push({
          url: `https://myanimelist.net/anime/${el.node.id}`,
          title: el.node.title,
          id: el.node.id,
          type: 'anime',
        });
      });
    }

    if (data.related_manga.length) {
      data.related_manga.forEach(el => {
        if (typeof links[el.relation_type] === 'undefined') {
          links[el.relation_type] = {
            type: el.relation_type_formatted,
            links: [],
          };
        }

        links[el.relation_type].links.push({
          url: `https://myanimelist.net/manga/${el.node.id}`,
          title: el.node.title,
          id: el.node.id,
          type: 'manga',
        });
      });
    }

    this.meta.related = Object.keys(links).map(key => links[key]);
  }

  protected apiCall = helper.apiCall;
}
