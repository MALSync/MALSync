import { parse as mdParse } from 'marked';
import { MetaOverviewAbstract, Recommendation, Review } from '../metaOverviewAbstract';
import { UrlNotSupportedError } from '../Errors';
import { IntlDateTime, IntlDuration } from '../../utils/IntlWrapper';
import { BakaSeries, RelatedSeries } from './types';
import { call, getAlternativeTitles, getImageUrl, urls } from './helper';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('MangaBaka');
    if (url.match(/mangabaka\.(dev|org)\/\d*(\/|$)/i)) {
      this.type = 'manga';
      this.malId = NaN;
      this.bakaId = Number(utils.urlPart(url, 3));
      return this;
    }
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.malId = Number(utils.urlPart(url, 4));
      this.bakaId = NaN;
      if (this.type !== 'manga') {
        throw new Error('MangaBaka only supports manga');
      }
      return this;
    }
    throw new UrlNotSupportedError(url);
  }

  protected readonly type;

  private readonly bakaId: number;

  private readonly malId: number;

  async _init() {
    this.logger.log(
      'Retrieve',
      this.type,
      this.bakaId ? `MangaBaka: ${this.bakaId}` : `MAL: ${this.malId}`,
    );

    const data = await this.getData();
    const relatedData = await this.relatedData(data.id);
    this.logger.log('Data', data, relatedData);

    this.title(data);
    this.description(data);
    this.image(data);
    this.alternativeTitle(data);
    this.statistics(data);
    this.info(data);
    this.related(relatedData);

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    let seriesEntry: BakaSeries;
    if (this.bakaId) {
      seriesEntry = (await call(urls.series(this.bakaId))).data as BakaSeries;
    } else if (this.malId) {
      seriesEntry = (await call(urls.seriesByMalId(this.malId))).data.series[0] as BakaSeries;
    } else {
      throw new Error('No valid ID found');
    }

    return seriesEntry;
  }

  private async relatedData(bakaId: number) {
    return (await call(urls.seriesRelated(bakaId))).data as RelatedSeries;
  }

  private title(data: BakaSeries) {
    if (data.title) this.meta.title = data.title;
  }

  private description(data: BakaSeries) {
    if (data.description) this.meta.description = mdParse(data.description) as string;
  }

  private image(data: BakaSeries) {
    this.meta.image = getImageUrl(data, 'large');
  }

  private alternativeTitle(data: BakaSeries) {
    this.meta.alternativeTitle = getAlternativeTitles(data);
  }

  private statistics(data: BakaSeries) {
    if (data.rating) {
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Score'),
        body: String(data.rating.toFixed(0)),
      });
    }

    if (data.year) {
      this.meta.statistics.push({
        title: api.storage.lang('search_Year'),
        body: String(data.year),
      });
    }

    if (data.status) {
      const status = data.status.charAt(0).toUpperCase() + data.status.slice(1);
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Status'),
        body: status,
      });
    }
  }

  private info(data: BakaSeries) {
    if (data.type) {
      const type = data.type.charAt(0).toUpperCase() + data.type.slice(1);
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Type'),
        body: [{ text: type }],
      });
    }
    if (data.year) {
      this.meta.info.push({
        title: api.storage.lang('search_Year'),
        body: [{ text: String(data.year) }],
      });
    }
    if (data.status) {
      const status = data.status.charAt(0).toUpperCase() + data.status.slice(1);
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Status'),
        body: [{ text: status }],
      });
    }

    if (data.content_rating) {
      const contentRating =
        data.content_rating.charAt(0).toUpperCase() + data.content_rating.slice(1);
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Rating'),
        body: [{ text: contentRating }],
      });
    }

    if (data.anime?.start) {
      this.meta.info.push({
        title: 'Anime start',
        body: [
          {
            text: data.anime.start,
          },
        ],
      });
    }

    if (data.anime?.end) {
      this.meta.info.push({
        title: 'Anime end',
        body: [
          {
            text: data.anime.end,
          },
        ],
      });
    }

    const authors: { text: string; roles: string[] }[] = [];
    if (data.authors && data.authors.length) {
      data.authors.forEach(author => {
        authors.push({ text: author, roles: ['Story'] });
      });
    }

    if (data.artists && data.artists.length) {
      data.artists.forEach(artist => {
        const existing = authors.find(a => a.text === artist);
        if (existing) {
          existing.roles.push('Art');
        } else {
          authors.push({ text: artist, roles: ['Art'] });
        }
      });
    }

    if (authors.length) {
      const authorList: any[] = [];
      authors.forEach(author => {
        authorList.push({
          text: author.text,
          subtext: author.roles.join(', '),
        });
      });
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Authors'),
        body: authorList,
      });
    }

    if (data.publishers && data.publishers.length) {
      const publishers: any[] = [];
      data.publishers.forEach(publisher => {
        if (publisher.name) {
          publishers.push({
            text: publisher.name,
          });
        }
      });
      if (publishers.length) {
        this.meta.info.push({
          title: api.storage.lang('overview_sidebar_Licensors'),
          body: publishers,
        });
      }
    }

    if (data.genres_v2 && data.genres_v2.length) {
      const gen: any[] = [];
      data.genres_v2.forEach(i => {
        gen.push({
          text: i.name,
          url: `https://mangabaka.org/search?genre=${i.name}`,
        });
      });
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Genres'),
        body: gen,
      });
    }

    if (data.links && data.links.length) {
      const external: any[] = [];
      data.links.forEach(url => {
        const hostParts = new URL(url).hostname.split('.');
        const domain = hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostParts[0];
        external.push({
          text: domain,
          url,
        });
      });
      if (external.length)
        this.meta.info.push({
          title: api.storage.lang('overview_sidebar_external_links'),
          body: external,
        });
    }

    if (data.source) {
      const sources: any[] = [];
      const src = data.source;
      if (src.anilist && src.anilist.id) {
        let title = 'AniList';
        if (src.anilist.rating_normalized) {
          title += ` (${src.anilist.rating_normalized})`;
        }
        sources.push({
          text: title,
          url: `https://anilist.co/manga/${src.anilist.id}`,
        });
      }
      if (src.anime_planet && src.anime_planet.id) {
        let title = 'Anime-Planet';
        if (src.anime_planet.rating_normalized) {
          title += ` (${src.anime_planet.rating_normalized})`;
        }
        sources.push({
          text: title,
          url: `https://www.anime-planet.com/manga/${src.anime_planet.id}`,
        });
      }
      if (src.my_anime_list && src.my_anime_list.id) {
        let title = 'MyAnimeList';
        if (src.my_anime_list.rating_normalized) {
          title += ` (${src.my_anime_list.rating_normalized})`;
        }
        sources.push({
          text: title,
          url: `https://myanimelist.net/manga/${src.my_anime_list.id}`,
        });
      }
      if (src.kitsu && src.kitsu.id) {
        let title = 'Kitsu';
        if (src.kitsu.rating_normalized) {
          title += ` (${src.kitsu.rating_normalized})`;
        }
        sources.push({
          text: title,
          url: `https://kitsu.io/manga/${src.kitsu.id}`,
        });
      }
      if (src.manga_updates && src.manga_updates.id) {
        let title = 'MangaUpdates';
        if (src.manga_updates.rating_normalized) {
          title += ` (${src.manga_updates.rating_normalized})`;
        }
        sources.push({
          text: title,
          url: `https://www.mangaupdates.com/series.html?id=${src.manga_updates.id}`,
        });
      }
      if (src.shikimori && src.shikimori.id) {
        let title = 'Shikimori';
        if (src.shikimori.rating_normalized) {
          title += ` (${src.shikimori.rating_normalized})`;
        }
        sources.push({
          text: title,
          url: `https://shikimori.one/mangas/${src.shikimori.id}`,
        });
      }
      if (src.anime_news_network && src.anime_news_network.id) {
        let title = 'Anime News Network';
        if (src.anime_news_network.rating_normalized) {
          title += ` (${src.anime_news_network.rating_normalized})`;
        }
        sources.push({
          text: title,
          url: `https://www.animenewsnetwork.com/encyclopedia/manga.php?id=${src.anime_news_network.id}`,
        });
      }
      if (sources.length) {
        this.meta.info.push({
          title: 'Sources',
          body: sources,
        });
      }
    }
  }

  private related(data: RelatedSeries) {
    const links: any = {};

    if (data) {
      Object.keys(data).forEach(relationType => {
        const related = data[relationType];
        if (related && related.length) {
          if (typeof links[relationType] === 'undefined') {
            let title = relationType.replace('_', ' ');
            title = title.charAt(0).toUpperCase() + title.slice(1);
            links[relationType] = {
              type: title,
              links: [],
            };
          }

          related.forEach(series => {
            let { title } = series;
            if (['novel', 'other', 'oel'].includes(series.type)) {
              const type = series.type.charAt(0).toUpperCase() + series.type.slice(1);
              title += ` (${type})`;
            }

            links[relationType].links.push({
              url: `https://mangabaka.org/${series.id}`,
              title,
              type: 'manga',
              id: series.id,
            });
          });
        }
      });
    }

    this.meta.related = Object.keys(links).map(key => links[key]);
  }
}
