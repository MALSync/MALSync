import { SingleAbstract } from '../singleAbstract';
import * as helper from './helper';
import { errorCode } from '../definitions';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, '#d65e43');
    return this;
  }

  private animeInfo: any;

  listI() {
    return this.animeInfo.data[0];
  }

  animeI() {
    return this.animeInfo.included[0];
  }

  shortName = 'Kitsu';

  authenticationUrl = 'https://kitsu.io/404?mal-sync=authentication';

  protected handleUrl(url) {
    if (url.match(/kitsu\.io\/(anime|manga)\/.*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.ids.kitsu.slug = utils.urlPart(url, 4);
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
    return helper.getCacheKey(this.ids.mal, this.ids.kitsu.id);
  }

  _getStatus() {
    if (this.listI().attributes.reconsuming && this.listI().attributes.status === 'current') return 23;
    return parseInt(helper.translateList(this.listI().attributes.status));
  }

  _setStatus(status) {
    if (status === 23) {
      status = 1;
      this.listI().attributes.reconsuming = true;
    } else {
      this.listI().attributes.reconsuming = false;
    }
    this.listI().attributes.status = helper.translateList(status, parseInt(status.toString()));
  }

  _getScore() {
    if (!this.listI().attributes.ratingTwenty) return 0;
    const score = Math.round(this.listI().attributes.ratingTwenty / 2);
    return score;
  }

  _setScore(score) {
    if (score === 0) {
      this.listI().attributes.ratingTwenty = null;
      return;
    }
    this.listI().attributes.ratingTwenty = score * 2;
  }

  _getEpisode() {
    return this.listI().attributes.progress;
  }

  _setEpisode(episode) {
    this.listI().attributes.progress = parseInt(`${episode}`);
  }

  _getVolume() {
    return this.listI().attributes.volumesOwned;
  }

  _setVolume(volume) {
    this.listI().attributes.volumesOwned = volume;
  }

  _getTags() {
    let tags = this.listI().attributes.notes;
    if (tags === null || tags === 'null') tags = '';
    return tags;
  }

  _setTags(tags) {
    this.listI().attributes.notes = tags;
  }

  _getTitle() {
    try {
      return helper.getTitle(this.animeI().attributes.titles, this.animeI().attributes.canonicalTitle);
    } catch (e) {
      console.error('title', e);
      return 'Failed';
    }
  }

  _getTotalEpisodes() {
    const eps = this.animeI().attributes.episodeCount
      ? this.animeI().attributes.episodeCount
      : this.animeI().attributes.chapterCount;
    if (eps === null) return 0;
    return eps;
  }

  _getTotalVolumes() {
    const vol = this.animeI().attributes.volumeCount;
    if (!vol) return 0;
    return vol;
  }

  _getDisplayUrl() {
    return `https://kitsu.io/${this.getType()}/${this.animeI().attributes.slug}`;
  }

  _getImage() {
    return Promise.resolve(this.animeI().attributes.posterImage.large);
  }

  _getRating() {
    if (this.animeI().attributes.averageRating === null) return Promise.resolve('');
    return Promise.resolve(`${this.animeI().attributes.averageRating}%`);
  }

  async _update() {
    if (Number.isNaN(this.ids.mal)) {
      /* eslint-disable-next-line no-var */
      var kitsuSlugRes = await this.kitsuSlugtoKitsu(this.ids.kitsu.slug, this.getType());
      try {
        this.ids.kitsu.id = kitsuSlugRes.res.data[0].id;
        this.ids.mal = kitsuSlugRes.malId;
      } catch (e) {
        this._authenticated = true;
        throw this.errorObj(errorCode.EntryNotFound, 'Not found');
      }
    }
    if (Number.isNaN(this.ids.kitsu.id)) {
      /* eslint-disable-next-line no-var */
      var kitsuRes = await this.malToKitsu(this.ids.mal, this.getType());
      try {
        this.ids.kitsu.id = kitsuRes.data[0].relationships.item.data.id;
      } catch (e) {
        this._authenticated = true;
        throw this.errorObj(errorCode.EntryNotFound, 'Not found');
      }
    }

    this._authenticated = true;
    return this.userId()
      .then(userId => {
        return this.apiCall(
          'GET',
          `https://kitsu.io/api/edge/library-entries?filter[user_id]=${userId}&filter[kind]=${this.getType()}&filter[${this.getType()}_id]=${
            this.ids.kitsu.id
          }&page[limit]=1&page[limit]=1&include=${this.getType()}&fields[${this.getType()}]=slug,titles,canonicalTitle,averageRating,posterImage,${
            this.getType() === 'anime' ? 'episodeCount' : 'chapterCount,volumeCount'
          }`,
        );
      })
      .catch(e => {
        if (e.code === errorCode.NotAutenticated) {
          this._authenticated = false;
          return { data: [], included: [] };
        }
        throw e;
      })
      .then(async res => {
        const tempAnimeInfo = res;

        this._onList = true;

        if (!res.data.length) {
          this._onList = false;
          tempAnimeInfo.data[0] = {
            attributes: {
              notes: '',
              progress: 0,
              volumesOwned: 0,
              reconsuming: false,
              reconsumeCount: false,
              ratingTwenty: null,
              status: 'planned',
            },
          };
          if (typeof kitsuRes !== 'undefined') {
            tempAnimeInfo.included = kitsuRes.included;
          } else if (kitsuSlugRes) {
            tempAnimeInfo.included = kitsuSlugRes.res.data;
          } else {
            kitsuRes = await this.malToKitsu(this.ids.mal, this.getType());
            tempAnimeInfo.included = kitsuRes.included;
          }
        }

        this.animeInfo = tempAnimeInfo;

        try {
          this.animeI();
        } catch (e) {
          this.logger.error(e);
          throw this.errorObj(errorCode.EntryNotFound, 'Not found');
        }

        if (!this._authenticated) throw this.errorObj(errorCode.NotAutenticated, 'Not Authenticated');
      });
  }

  async _sync() {
    if (this.listI().attributes.ratingTwenty < 2) this.listI().attributes.ratingTwenty = null;
    const variables: any = {
      data: {
        attributes: {
          notes: this.listI().attributes.notes,
          progress: this.listI().attributes.progress,
          volumesOwned: this.listI().attributes.volumesOwned,
          reconsuming: this.listI().attributes.reconsuming,
          reconsumeCount: this.listI().attributes.reconsumeCount,
          ratingTwenty: this.listI().attributes.ratingTwenty ? this.listI().attributes.ratingTwenty : null,
          status: this.listI().attributes.status,
        },
        type: 'library-entries',
      },
    };
    const tType = this.getType();
    if (!tType) return Promise.resolve();
    let updateUrl;
    let post;
    if (this.isOnList()) {
      updateUrl = `https://kitsu.io/api/edge/library-entries/${this.listI().id}`;
      variables.data.id = this.listI().id;
      post = 'PATCH';
    } else {
      updateUrl = 'https://kitsu.io/api/edge/library-entries/';
      variables.data.relationships = {
        [tType]: {
          data: {
            type: tType,
            id: this.ids.kitsu.id,
          },
        },
        user: {
          data: {
            type: 'users',
            id: await this.userId(),
          },
        },
      };
      post = 'POST';
    }

    this.logger.log(post, variables);

    return this.apiCall(post, updateUrl, variables).then(res => {
      if (res && res.data && res.data.id) {
        this.listI().id = res.data.id;
      }
      return res;
    });
  }

  protected apiCall = helper.apiCall;

  protected kitsuSlugtoKitsu(kitsuSlug: string, type: any) {
    return this.apiCall(
      'Get',
      `https://kitsu.io/api/edge/${type}?filter[slug]=${kitsuSlug}&page[limit]=1&include=mappings`,
      {},
    )
      .catch(e => {
        if (e.code === errorCode.NotAutenticated) {
          this._authenticated = false;
          return this.apiCall(
            'Get',
            `https://kitsu.io/api/edge/${type}?filter[slug]=${kitsuSlug}&page[limit]=1&include=mappings`,
            {},
            false,
          );
        }
        throw e;
      })
      .then(res => {
        let malId = NaN;
        if (typeof res !== 'undefined' && typeof res.included !== 'undefined') {
          for (let k = 0; k < res.included.length; k++) {
            const mapping = res.included[k];
            if (mapping.type === 'mappings') {
              if (mapping.attributes.externalSite === `myanimelist/${type}`) {
                malId = mapping.attributes.externalId;
                res.included.splice(k, 1);
                break;
              } else if (mapping.attributes.externalSite === `anilist/${type}`) {
                this.ids.ani = mapping.attributes.externalId;
              }
            }
          }
        }
        return { res, malId };
      });
  }

  protected malToKitsu(malid: number, type: any) {
    return this.apiCall(
      'Get',
      `https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/${type}&filter[externalId]=${malid}&include=item&fields[item]=id`,
      {},
    )
      .catch(e => {
        if (e.code === errorCode.NotAutenticated) {
          this._authenticated = false;
          return this.apiCall(
            'Get',
            `https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/${type}&filter[externalId]=${malid}&include=item&fields[item]=id`,
            {},
            false,
          );
        }
        throw e;
      })
      .then(res => {
        return res;
      });
  }

  protected async userId() {
    const userId = await api.storage.get('kitsuUserId');
    if (typeof userId !== 'undefined') {
      return userId;
    }
    return this.apiCall('Get', 'https://kitsu.io/api/edge/users?filter[self]=true').then(res => {
      if (typeof res.data === 'undefined' || !res.data.length || typeof res.data[0] === 'undefined') {
        throw this.errorObj(errorCode.NotAutenticated, 'Not Authenticated');
      }
      api.storage.set('kitsuUserId', res.data[0].id);
      return res.data[0].id;
    });
  }

  private getScoreMode() {
    return api.settings.get('kitsuOptions').ratingSystem;
  }

  public getScoreCheckbox() {
    switch (this.getScoreMode()) {
      case 'simple':
        return [
          { value: '0', label: api.storage.lang('UI_Score_Not_Rated') },
          { value: '20', label: '😀' },
          { value: '14', label: '🙂' },
          { value: '8', label: '😐' },
          { value: '2', label: '🙁' },
        ];
        break;
      case 'regular': {
        const regArr = [{ value: '0', label: api.storage.lang('UI_Score_Not_Rated') }];
        for (let i = 1; i < 11; i++) {
          regArr.push({
            value: (i * 2).toString(),
            label: (i / 2).toFixed(1).toString(),
          });
        }
        return regArr;
        break;
      }
      case 'advanced': {
        const resArr = [{ value: '0', label: api.storage.lang('UI_Score_Not_Rated') }];
        for (let i = 1; i < 21; i++) {
          resArr.push({
            value: i.toString(),
            label: (i / 2).toFixed(1).toString(),
          });
        }
        return resArr;
        break;
      }
      default:
        return super.getScoreCheckbox();
    }
  }

  public getScoreCheckboxValue() {
    let curScore = this.listI().attributes.ratingTwenty;
    if (!curScore) curScore = 0;
    switch (this.getScoreMode()) {
      case 'simple':
        if (!curScore) return 0;
        if (curScore < 6) return 2;
        if (curScore < 12) return 8;
        if (curScore < 18) return 14;
        return 20;
        break;
      case 'regular':
        return Math.round(curScore / 2) * 2;
      case 'advanced':
        return curScore;
        break;
      default:
        return super.getScoreCheckboxValue();
    }
  }

  public handleScoreCheckbox(value) {
    switch (this.getScoreMode()) {
      case 'simple':
      case 'regular':
      case 'advanced':
        if (value === 0) {
          this.listI().attributes.ratingTwenty = null;
          return;
        }
        this.listI().attributes.ratingTwenty = value;
        break;
      default:
        super.handleScoreCheckbox(value);
    }
  }

  delete() {
    return this.apiCall('DELETE', `https://kitsu.io/api/edge/library-entries/${this.listI().id}`);
  }
}
