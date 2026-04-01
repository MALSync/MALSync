import { SingleAbstract } from '../singleAbstract';
import { NotFoundError } from '../Errors';
import * as helper from './helper';

export class Single extends SingleAbstract {
  constructor(url: string) {
    super(url);
    this.logger = this.logger.m('AnimePulse');
  }

  shortName = 'AnimePulse';

  authenticationUrl = 'https://myanimepulse.com/settings#extensions';

  protected handleUrl(url: string) {
    if (url.match(/myanimepulse\.com\/anime\/\d+/i)) {
      this.type = 'anime';
      const match = url.match(/\/anime\/(\d+)/);
      if (match) {
        this.ids.mal = Number(match[1]);
      }
      return;
    }
    throw new NotFoundError(url);
  }

  getCacheKey() {
    return helper.getCacheKey(this.ids.mal);
  }

  getPageId() {
    return this.ids.mal;
  }

  _getStatus() {
    return helper.translateList(this.animeInfo.status) as number;
  }

  _setStatus(status: number) {
    this.animeInfo.status = helper.translateList('', status) as string;
  }

  _getScore() {
    return this.animeInfo.score || 0;
  }

  _setScore(score: number) {
    this.animeInfo.score = score;
  }

  _getAbsoluteScore() {
    return this.animeInfo.score ? this.animeInfo.score * 10 : 0;
  }

  _setAbsoluteScore(score: number) {
    this.animeInfo.score = Math.round(score / 10);
  }

  _getEpisode() {
    return this.animeInfo.episode || 0;
  }

  _setEpisode(episode: number) {
    this.animeInfo.episode = episode;
  }

  _getVolume() {
    return 0;
  }

  _setVolume(_volume: number) {
    // AnimePulse doesn't track volumes (anime only)
  }

  _getTitle() {
    return this.animeInfo.title || '';
  }

  _getTotalEpisodes() {
    return this.animeInfo.totalEpisodes || 0;
  }

  _getTotalVolumes() {
    return 0;
  }

  _getImage() {
    return this.animeInfo.image || '';
  }

  _getRating() {
    return this.animeInfo.communityScore || '';
  }

  _getStartDate() {
    return undefined;
  }

  _setStartDate(_date: any) {
    // Not implemented yet
  }

  _getFinishDate() {
    return undefined;
  }

  _setFinishDate(_date: any) {
    // Not implemented yet
  }

  _getRewatchCount() {
    return this.animeInfo.rewatchCount || 0;
  }

  _setRewatchCount(count: number) {
    this.animeInfo.rewatchCount = count;
  }

  _getTags() {
    return '';
  }

  _setTags(_tags: string) {
    // Not implemented
  }

  async _update(): Promise<void> {
    this.logger.log('Update', this.ids.mal);

    try {
      // Fetch the user's list entry for this anime
      const data = await helper.apiCall(`/anime-list?animeId=${this.ids.mal}`);

      if (data && data.entry) {
        this.animeInfo.status = data.entry.status;
        this.animeInfo.score = data.entry.rating || 0;
        this.animeInfo.episode = data.entry.episodesWatched || 0;
        this.animeInfo.rewatchCount = data.entry.rewatchCount || 0;
      }

      // Fetch anime details
      const animeData = await helper.apiCall(`/anime/${this.ids.mal}`);
      if (animeData && animeData.data) {
        const anime = animeData.data;
        this.animeInfo.title = anime.title || anime.title_english || '';
        this.animeInfo.totalEpisodes = anime.episodes || 0;
        this.animeInfo.image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
        this.animeInfo.communityScore = anime.score || 0;
      }
    } catch (e) {
      this.logger.error('Update failed', e);
      throw e;
    }
  }

  async _sync(): Promise<void> {
    this.logger.log('Sync', this.ids.mal, this.animeInfo);

    const body: Record<string, any> = {
      status: this.animeInfo.status,
      episodesWatched: this.animeInfo.episode,
    };

    if (this.animeInfo.score) {
      body.rating = this.animeInfo.score;
    }

    try {
      // Try to update existing entry
      await helper.apiCall(`/anime-list/${this.ids.mal}`, body, 'PATCH');
    } catch (e: any) {
      if (e.status === 404) {
        // Entry doesn't exist, create it
        await helper.apiCall('/anime-list', {
          animeId: this.ids.mal,
          ...body,
        }, 'POST');
      } else {
        throw e;
      }
    }
  }

  async _delete(): Promise<void> {
    await helper.apiCall(`/anime-list/${this.ids.mal}`, {}, 'DELETE');
  }

  getScoreMode() {
    return 'point10';
  }
}
