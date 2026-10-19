import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { NotFoundError, UrlNotSupportedError } from '../Errors';
import { urlToSlug } from '../../utils/slugs';
import { OshiAnime, oshimeterScore, publicCall, titleFromSlug, urls } from './helper';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('AnimeOshi');

    const { path } = urlToSlug(url);
    if (path?.provider === 'ANIMEOSHI') {
      this.oshiId = path.id;
      return this;
    }
    if (path?.provider === 'MAL' || path?.provider === 'ANILIST') {
      if (path.type !== 'anime') throw new UrlNotSupportedError('AnimeOshi has no manga support');
      if (path.provider === 'MAL') {
        this.malId = Number(path.id);
      } else {
        this.aniId = Number(path.id);
      }
      return this;
    }

    throw new UrlNotSupportedError(url);
  }

  protected readonly type = 'anime';

  private oshiId = '';

  private malId = NaN;

  private aniId = NaN;

  async _init() {
    let data: OshiAnime | null;
    if (this.oshiId) {
      data = await publicCall(urls.animeByIdentifier(this.oshiId));
    } else if (this.malId) {
      data = await publicCall(urls.animeByExternalId({ mal: this.malId }));
    } else {
      data = await publicCall(urls.animeByExternalId({ anilist: this.aniId }));
    }
    if (!data) throw new NotFoundError('Anime not found');

    this.logger.log('Data', data);

    this.meta.title = titleFromSlug(data.slug);
    this.meta.image = data.image;
    this.meta.imageLarge = data.image;

    const score = oshimeterScore(data);
    if (score) {
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Score'),
        body: score,
      });
    }
    if (data.oshimeter?.rater_count) {
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Votes'),
        body: String(data.oshimeter.rater_count),
      });
    }

    if (data.episode_count) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Episodes'),
        body: [{ text: String(data.episode_count) }],
      });
    }
    if (data.status) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Status'),
        body: [{ text: data.status }],
      });
    }
    if (data.season) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Season'),
        body: [{ text: data.season }],
      });
    }
    if (data.release_date) {
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Aired'),
        body: [{ text: data.release_date }],
      });
    }
  }
}
