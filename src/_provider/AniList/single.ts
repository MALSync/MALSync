import { SingleAbstract } from './../singleAbstract';
import * as helper from './helper';
import { errorCode } from './../definitions';

export class Single extends SingleAbstract {
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
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  getCacheKey() {
    return helper.getCacheKey(this.ids.mal, this.ids.ani);
  }

  _getStatus() {
    return parseInt(
      helper.statusTranslate[this.animeInfo.mediaListEntry.status],
    );
  }

  _setStatus(status) {
    this.animeInfo.mediaListEntry.status = helper.statusTranslate[status];
  }

  _getScore() {
    if (this.animeInfo.mediaListEntry.score === 0) return 0;
    const score = Math.round(this.animeInfo.mediaListEntry.score / 10);
    if (score === 0) return 1;
    return score;
  }

  _setScore(score) {
    this.animeInfo.mediaListEntry.score = score * 10;
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

  _getStreamingUrl() {
    const tags = this.animeInfo.mediaListEntry.notes;
    return utils.getUrlFromTags(tags);
  }

  _setStreamingUrl(url) {
    let tags = this.animeInfo.mediaListEntry.notes;
    if (tags == null || tags == 'null') tags = '';

    tags = utils.setUrlInTags(url, tags);

    this.animeInfo.mediaListEntry.notes = tags;
  }

  _getTitle() {
    return this.animeInfo.title.userPreferred;
  }

  _getTotalEpisodes() {
    const eps = this.animeInfo.episodes
      ? this.animeInfo.episodes
      : this.animeInfo.chapters;
    if (eps == null) return 0;
    return eps;
  }

  _getTotalVolumes() {
    const vol = this.animeInfo.volumes;
    if (!vol) return 0;
    return vol;
  }

  _getDisplayUrl() {
    return this.displayUrl !== '' && this.displayUrl != null
      ? this.displayUrl
      : this.url;
  }

  _getImage() {
    return Promise.resolve(this.animeInfo.coverImage.large);
  }

  _getRating() {
    return Promise.resolve(this.animeInfo.averageScore);
  }

  async _update() {
    let selectId = this.ids.mal;
    let selectQuery = 'idMal';
    if (isNaN(this.ids.mal)) {
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
        if (e.code === errorCode.NotAutenticated) {
          this._authenticated = false;
          return this.apiCall(query, variables, false);
        }
        throw e;
      })
      .then(json => {
        con.log('[SINGLE]', 'Data', json);

        this.animeInfo = json.data.Media;

        this.ids.ani = this.animeInfo.id;
        if (isNaN(this.ids.mal) && this.animeInfo.idMal) {
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

        if (!this._authenticated)
          throw this.errorObj(errorCode.NotAutenticated, 'Not Authenticated');
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
    };

    if (this.type == 'manga') {
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
      variables['volumes'] = this.animeInfo.mediaListEntry.progressVolumes;
    }

    return this.apiCall(query, variables);
  }

  protected apiCall(query, variables, authentication = true) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (authentication)
      headers['Authorization'] = `Bearer ${api.settings.get('anilistToken')}`;
    return api.request
      .xhr('POST', {
        url: 'https://graphql.anilist.co',
        headers,
        data: JSON.stringify({
          query,
          variables,
        }),
      })
      .then(response => {
        if (
          (response.status > 499 && response.status < 600) ||
          response.status === 0
        ) {
          throw this.errorObj(
            errorCode.ServerOffline,
            `Server Offline status: ${response.status}`,
          );
        }

        const res = JSON.parse(response.responseText);

        if (typeof res.errors !== 'undefined' && res.errors.length) {
          con.error('[SINGLE]', 'Error', res.errors);
          const error = res.errors[0];
          switch (error.status) {
            case 400:
              throw this.errorObj(errorCode.NotAutenticated, error.message);
              break;
            case 404:
              throw this.errorObj(errorCode.EntryNotFound, error.message);
              break;
            default:
              throw this.errorObj(error.status, error.message);
          }
        }

        return res;
      });
  }

  private getScoreMode() {
    return api.settings.get('anilistOptions').scoreFormat;
  }

  public getScoreCheckbox() {
    switch (this.getScoreMode()) {
      case 'POINT_3':
        return [
          { value: '0', label: api.storage.lang('UI_Score_Not_Rated') },
          { value: '85', label: '🙂' },
          { value: '60', label: '😐' },
          { value: '35', label: '🙁' },
        ];
        break;
      case 'POINT_5':
        return [
          { value: '0', label: api.storage.lang('UI_Score_Not_Rated') },
          { value: '90', label: '★★★★★' },
          { value: '70', label: '★★★★' },
          { value: '50', label: '★★★' },
          { value: '30', label: '★★' },
          { value: '10', label: '★' },
        ];
        break;
      case 'POINT_10_DECIMAL':
        var resArr = [
          { value: '0', label: api.storage.lang('UI_Score_Not_Rated') },
        ];
        for (var i = 1; i < 101; i++) {
          resArr.push({ value: i.toString(), label: (i / 10).toFixed(1) });
        }
        return resArr;
        break;
      case 'POINT_100':
        var resArr = [
          { value: '0', label: api.storage.lang('UI_Score_Not_Rated') },
        ];
        for (var i = 1; i < 101; i++) {
          resArr.push({ value: i.toString(), label: String(i) });
        }
        return resArr;
        break;
      default:
        return super.getScoreCheckbox();
    }
  }

  public getScoreCheckboxValue() {
    const curScore = this.animeInfo.mediaListEntry.score;
    switch (this.getScoreMode()) {
      case 'POINT_3':
        if (!curScore) return 0;
        if (curScore >= 73) return 85;
        if (curScore <= 47) return 35;
        return 60;
        break;
      case 'POINT_5':
        if (!curScore) return 0;
        if (curScore < 20) return 10;
        if (curScore < 40) return 30;
        if (curScore < 60) return 50;
        if (curScore < 80) return 70;
        return 90;
        break;
      case 'POINT_10_DECIMAL':
      case 'POINT_100':
        return curScore;
        break;
      default:
        return super.getScoreCheckboxValue();
    }
  }

  public handleScoreCheckbox(value) {
    switch (this.getScoreMode()) {
      case 'POINT_3':
      case 'POINT_5':
      case 'POINT_10_DECIMAL':
      case 'POINT_100':
        this.animeInfo.mediaListEntry.score = value;
        break;
      default:
        super.handleScoreCheckbox(value);
    }
  }
}
