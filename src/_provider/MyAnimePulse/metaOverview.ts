import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { UrlNotSupportedError } from '../Errors';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('MyAnimePulse');
    // A MyAnimePulse id is the MAL id, so accept either host's /anime/{id} URL.
    const match = url.match(/(?:myanimepulse\.com|myanimelist\.net)\/anime\/(\d+)/i);
    if (match) {
      this.type = 'anime';
      this.malId = Number(match[1]);
      return;
    }
    throw new UrlNotSupportedError(url);
  }

  protected readonly type;

  private readonly malId: number;

  async _init() {
    let data;
    try {
      // Public endpoint, no auth token needed; returns Jikan-shaped anime data.
      const response = await api.request.xhr('GET', {
        url: `https://myanimepulse.com/api/anime/${this.malId}`,
      });
      data = JSON.parse(response.responseText);
    } catch (e) {
      this.logger.error('metadata fetch failed', e);
      return;
    }
    if (!data) return;

    this.meta.title = data.title || data.title_english || '';
    this.meta.alternativeTitle = [data.title_english, data.title_japanese].filter(Boolean);
    this.meta.description = data.synopsis || '';
    const img =
      data.images?.jpg?.large_image_url ||
      data.images?.jpg?.image_url ||
      data.image_url ||
      '';
    this.meta.image = img;
    this.meta.imageLarge = img;

    if (data.score) this.meta.statistics.push({ title: 'Score', body: String(data.score) });
    const infoBody: { text: string }[] = [];
    if (data.type) infoBody.push({ text: data.type });
    if (data.episodes) infoBody.push({ text: `${data.episodes} episodes` });
    if (infoBody.length) this.meta.info.push({ title: 'Info', body: infoBody });
  }
}
