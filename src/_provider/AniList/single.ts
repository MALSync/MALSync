import { SingleAbstract } from '../singleAbstract';
import * as helper from './helper';
import { NotAutenticatedError, UrlNotSupportedError } from '../Errors';
import { point100 } from '../ScoreMode/point100';
import { point10 } from '../ScoreMode/point10';
import { smiley3 } from '../ScoreMode/smiley3';
import { stars5 } from '../ScoreMode/stars5';
import { point100decimal } from '../ScoreMode/point100decimal';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, '#3db4f2');
    return this;
  }

  private animeInfo: any;

  private displayUrl = '';

  shortName = 'AniList';

  authenticationUrl =
    'https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token';

  protected handleUrl(url) {
    if (url.match(/anilist\.co\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.ids.ani = Number(utils.urlPart(url, 4));
      return;
    }
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.ids.mal = Number(utils.urlPart(url, 4));
      return;
    }
    throw new UrlNotSupportedError(url);
  }

  getCacheKey() {
    return this.getKey(['ANILIST']);
  }

  getPageId() {
    return this.ids.ani;
  }

  _getStatus() {
    return parseInt(helper.statusTranslate[this.animeInfo.mediaListEntry.status]);
  }

  _setStatus(status) {
    this.animeInfo.mediaListEntry.status = helper.statusTranslate[status];
  }

  _getScore() {
    if (Number(this.animeInfo.mediaListEntry.score) === 0) return 0;
    const score = Math.round(Number(this.animeInfo.mediaListEntry.score) / 10);
    if (score === 0) return 1;
    return score;
  }

  _setScore(score) {
    this.animeInfo.mediaListEntry.score = score * 10;
  }

  _getAbsoluteScore() {
    return Number(this.animeInfo.mediaListEntry.score);
  }

  _setAbsoluteScore(score) {
    this.animeInfo.mediaListEntry.score = Number(score);
  }

  _getEpisode() {
    return this.animeInfo.mediaListEntry.progress;
  }

  _setEpisode(episode) {
    this.animeInfo.mediaListEntry.progress = parseInt(`${episode}`);
  }

  _getVolume() {
    return this.animeInfo.mediaListEntry.progressVolumes;
  }

  _setVolume(volume) {
    this.animeInfo.mediaListEntry.progressVolumes = volume;
  }

  _getTags() {
    let tags = this.animeInfo.mediaListEntry.notes;
    if (tags === null || tags === 'null') tags = '';
    return tags;
  }

  _setTags(tags) {
    this.animeInfo.mediaListEntry.notes = tags;
  }

  _getTitle() {
    return this.animeInfo.title.userPreferred;
  }

  _getTotalEpisodes() {
    const eps = this.animeInfo.episodes ? this.animeInfo.episodes : this.animeInfo.chapters;
    if (eps === null) return 0;
    return eps;
  }

  _getTotalVolumes() {
    const vol = this.animeInfo.volumes;
    if (!vol) return 0;
    return vol;
  }

  _getDisplayUrl() {
    return this.displayUrl !== '' && this.displayUrl !== null ? this.displayUrl : this.url;
  }

  _getImage() {
    return this.animeInfo.coverImage.large;
  }

  _getRating() {
    return Promise.resolve(this.animeInfo.averageScore);
  }

  async _update() {
    let selectId = this.ids.mal;
    let selectQuery = 'idMal';
    if (Number.isNaN(this.ids.mal)) {
      selectId = this.ids.ani;
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
        coverImage{
          large
        }
        title {
          userPreferred
        }
        mediaListEntry {
          id
          status
          progress
          progressVolumes
          score(format: POINT_100)
          repeat
          notes
        }
      }
    }
    `;
    const variables = {
      id: selectId,
      type: this.type!.toUpperCase(),
    };

    this._authenticated = true;

    return this.apiCall(query, variables)
      .catch(e => {
        if (e instanceof NotAutenticatedError) {
          this._authenticated = false;
          return this.apiCall(query, variables, false);
        }
        throw e;
      })
      .then(json => {
        this.logger.log('[SINGLE]', 'Data', json);

        this.animeInfo = json.data.Media;

        this.ids.ani = this.animeInfo.id;
        if (Number.isNaN(this.ids.mal) && this.animeInfo.idMal) {
          this.ids.mal = this.animeInfo.idMal;
        }

        this.displayUrl = this.animeInfo.siteUrl;
        this._onList = true;
        if (this.animeInfo.mediaListEntry === null) {
          this._onList = false;
          this.animeInfo.mediaListEntry = {
            notes: '',
            progress: 0,
            progressVolumes: 0,
            repeat: 0,
            score: 0,
            status: 'PLANNING',
          };
        }

        if (!this._authenticated) throw new NotAutenticatedError('Not Authenticated');
      });
  }

  async _sync() {
    let query = `
      mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int, $notes: String) {
        SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw, notes: $notes) {
          id
          status
          progress
        }
      }
    `;
    const variables = {
      mediaId: this.ids.ani,
      status: this.animeInfo.mediaListEntry.status,
      progress: this.animeInfo.mediaListEntry.progress,
      scoreRaw: this.animeInfo.mediaListEntry.score,
      notes: this.animeInfo.mediaListEntry.notes,
      volumes: null,
    };

    if (this.type === 'manga') {
      query = `
        mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int, $notes: String, $volumes: Int) {
          SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw, notes: $notes, progressVolumes: $volumes) {
            id
            status
            progress
            progressVolumes
          }
        }
      `;
      variables.volumes = this.animeInfo.mediaListEntry.progressVolumes;
    }

    return this.apiCall(query, variables).then(json => {
      if (json && json.data && json.data.SaveMediaListEntry && json.data.SaveMediaListEntry.id) {
        this.animeInfo.mediaListEntry.id = json.data.SaveMediaListEntry.id;
      }
      return json;
    });
  }

  protected apiCall(query, variables, authentication = true) {
    return helper.apiCall(query, variables, authentication);
  }

  public getScoreMode() {
    switch (api.settings.get('anilistOptions').scoreFormat) {
      case 'POINT_100':
        return point100;
      case 'POINT_3':
        return smiley3;
      case 'POINT_5':
        return stars5;
      case 'POINT_10_DECIMAL':
        return point100decimal;
      default:
        return point10;
    }
  }

  _delete() {
    const query = `
      mutation ($mediaId: Int) {
        DeleteMediaListEntry(id: $mediaId) {
          deleted
        }
      }
    `;
    const variables = {
      mediaId: this.animeInfo.mediaListEntry.id,
    };

    return this.apiCall(query, variables);
  }
}
