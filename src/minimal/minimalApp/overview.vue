<template>
  <div class="page-content">
    <div
      v-show="!metaObj && !error"
      id="loadOverview"
      class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
      style="width: 100%; position: absolute; top: 0;"
    ></div>

    <span v-if="error" class="mdl-chip mdl-chip--deletable" style="margin: auto; margin-top: 16px; display: table;">
      <span class="mdl-chip__text">Error</span>
      <button type="button" class="mdl-chip__action" @click="clickRender()">
        <i class="material-icons">refresh</i>
      </button>
    </span>

    <span v-if="objError" class="mdl-chip mdl-chip--deletable" style="margin: auto; margin-top: 16px; display: table;">
      <span class="mdl-chip__text" v-html="objError"></span>
      <button type="button" class="mdl-chip__action" @click="reload()">
        <i class="material-icons">refresh</i>
      </button>
    </span>

    <div v-if="metaObj" class="mdl-grid">
      <div
        v-show="statistics.length"
        class="mdl-cell bg-cell mdl-cell--1-col mdl-cell--8-col-tablet mdl-cell--6-col-phone mdl-shadow--4dp stats-block malClear"
        style="min-width: 120px;"
      >
        <ul
          class="mdl-list mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col"
          style="display: flex; justify-content: space-around;"
        >
          <li
            v-for="stat in statistics"
            :key="stat.title"
            class="mdl-list__item mdl-list__item--two-line"
            style="padding: 0; padding-left: 10px; padding-right: 3px; min-width: 18%;"
          >
            <span class="mdl-list__item-primary-content">
              <span>
                {{ stat.title }}
              </span>
              <span class="mdl-list__item-sub-title" v-html="stat.body"> </span>
            </span>
          </li>
        </ul>
      </div>
      <div
        class="mdl-grid mdl-cell bg-cell mdl-shadow--4dp coverinfo malClear"
        style="display:block; flex-grow: 100; min-width: 70%;"
      >
        <div
          class="mdl-card__media mdl-cell mdl-cell--2-col"
          style="background-color: transparent; float:left; padding-right: 16px;"
        >
          <clazy-load :src="image" class="malImage malClear" style="width: 100%; height: auto;">
            <img :src="image" style="height: auto; width: 100%;" />
          </clazy-load>
        </div>
        <div class="mdl-cell mdl-cell--12-col">
          <a
            class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect malClear malLink"
            :href="displayUrl"
            style="float: right;"
            target="_blank"
            ><i class="material-icons">open_in_new</i></a
          >
          <h1
            class="malTitle mdl-card__title-text malClear"
            style="padding-left: 0; overflow:visible;"
            v-html="title"
          ></h1>
          <div class="malAltTitle mdl-card__supporting-text malClear" style="padding: 10px 0 0 0; overflow:visible;">
            <div v-for="altTitl in altTitle" :key="altTitl" class="mdl-chip" style="margin-right: 5px;">
              <span class="mdl-chip__text">{{ altTitl }}</span>
            </div>
          </div>
        </div>
        <div class="malDescription malClear mdl-cell mdl-cell--10-col" style="overflow: hidden;">
          <p style="color: black;" v-html="description"></p>
          <div
            v-show="streaming"
            class="mdl-card__actions mdl-card--border"
            style="padding-left: 0;"
            v-html="streaming"
          ></div>
        </div>
      </div>
      <div
        class="mdl-cell bg-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp data-block mdl-grid mdl-grid--no-spacing malClear"
      >
        <li v-if="prediction && prediction.prediction.airing" class="mdl-list__item" style="width: 100%;">
          {{ prediction.text }}
        </li>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tbody>
            <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
              <span class="mdl-list__item-primary-content">
                <span>{{ lang('UI_Status') }} </span>
                <span class="mdl-list__item-text-body">
                  <select
                    id="myinfo_status"
                    v-model="malStatus"
                    :disabled="!this.renderObj || !this.renderObj.isAuthenticated()"
                    name="myinfo_status"
                    class="inputtext js-anime-status-dropdown mdl-textfield__input"
                    style="outline: none;"
                  >
                    <option v-for="el in renderObj.getStatusCheckbox()" :key="el.value" :value="el.value">{{
                      el.label
                    }}</option>
                  </select>
                </span>
              </span>
            </li>
            <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
              <span class="mdl-list__item-primary-content">
                <span>{{ utils.episode(renderObj.getType()) }}</span>
                <span class="mdl-list__item-text-body">
                  <input
                    id="myinfo_watchedeps"
                    v-model="malEpisode"
                    :disabled="!this.renderObj || !this.renderObj.isAuthenticated()"
                    type="text"
                    name="myinfo_watchedeps"
                    size="3"
                    class="inputtext mdl-textfield__input"
                    value="6"
                    style="width: 35px; display: inline-block;"
                  />
                  / <span v-if="prediction" v-html="prediction.tag" />
                  <span v-if="renderObj && renderObj.getTotalEpisodes()" id="curEps">{{
                    renderObj.getTotalEpisodes()
                  }}</span
                  ><span v-else>?</span>
                  <a href="javascript:void(0)" class="js-anime-increment-episode-button" target="_blank">
                    <i class="fa fa-plus-circle ml4"> </i>
                  </a>
                </span>
              </span>
            </li>
            <li
              v-show="renderObj.getType() == 'manga'"
              class="mdl-list__item mdl-list__item--three-line"
              style="width: 100%;"
            >
              <span class="mdl-list__item-primary-content">
                <span>{{ lang('UI_Volume') }}</span>
                <span class="mdl-list__item-text-body">
                  <input
                    id="myinfo_volumes"
                    v-model="malVolume"
                    :disabled="!this.renderObj || !this.renderObj.isAuthenticated()"
                    type="text"
                    name="myinfo_volumes"
                    size="3"
                    class="inputtext mdl-textfield__input"
                    value="6"
                    style="width: 35px; display: inline-block;"
                  />
                  /
                  <span v-if="renderObj && renderObj.getTotalVolumes()" id="curVolumes">{{
                    renderObj.getTotalVolumes()
                  }}</span
                  ><span v-else>?</span>
                  <a href="javascript:void(0)" class="js-anime-increment-episode-button" target="_blank">
                    <i class="fa fa-plus-circle ml4"> </i>
                  </a>
                </span>
              </span>
            </li>
            <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
              <span class="mdl-list__item-primary-content">
                <span>{{ lang('UI_Score') }} </span>
                <span class="mdl-list__item-text-body">
                  <select
                    id="myinfo_score"
                    v-model="malScore"
                    :disabled="!this.renderObj || !this.renderObj.isAuthenticated()"
                    name="myinfo_score"
                    class="inputtext mdl-textfield__input"
                    style="outline: none;"
                  >
                    <option v-for="el in renderObj.getScoreCheckbox()" :key="el.value" :value="el.value">{{
                      el.label
                    }}</option>
                  </select>
                </span>
              </span>
            </li>
            <li class="mdl-list__item" style="width: 100%;">
              <input
                v-if="renderObj && !renderObj.isOnList()"
                type="button"
                name="myinfo_submit"
                value="Add"
                class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--accent"
                style="margin-right: 5px;"
                data-upgraded=",MaterialButton"
                :disabled="!renderObj || !renderObj.isAuthenticated()"
                @click="malSync()"
              />
              <input
                v-else
                type="button"
                name="myinfo_submit"
                :value="lang('Update')"
                class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                style="margin-right: 5px;"
                data-upgraded=",MaterialButton"
                :disabled="!renderObj || !renderObj.isAuthenticated()"
                @click="malSync()"
              />
              <small v-if="editUrl && renderObj">
                <a :href="editUrl" target="_blank">{{ lang('overview_EditDetails') }}</a>
              </small>
              <input
                v-if="!(renderObj && !renderObj.isOnList()) && typeof renderObj.delete !== 'undefined'"
                type="button"
                class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent"
                style="margin-left: 5px; margin-left: auto;"
                :value="lang('Remove')"
                @click="remove()"
              />

              <i class="material-icons" style="margin-right: 0; margin-left: auto; cursor: pointer;" @click="reload()"
                >autorenew</i
              >
            </li>
          </tbody>
        </table>
      </div>
      <div
        v-show="related.length"
        class="mdl-grid mdl-grid--no-spacing mdl-cell bg-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp related-block alternative-list mdl-grid malClear"
      >
        <ul class="mdl-list">
          <li v-for="relatedType in related" :key="relatedType.url" class="mdl-list__item mdl-list__item--two-line">
            <span class="mdl-list__item-primary-content">
              <span>
                {{ relatedType.type }}
              </span>
              <span class="mdl-list__item-sub-title">
                <div v-for="link in relatedType.links" :key="link.title">
                  <a :href="link.url">{{ link.title }}</a>
                  <span v-html="link.statusTag"></span>
                </div>
              </span>
            </span>
          </li>
        </ul>
      </div>
      <div
        v-show="kiss2mal && Object.keys(kiss2mal).length"
        class="mdl-grid mdl-grid--no-spacing bg-cell mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid alternative-list stream-block malClear"
      >
        <ul class="mdl-list stream-block-inner">
          <li v-for="(streams, page) in kiss2mal" :key="page" class="mdl-list__item mdl-list__item--three-line">
            <span class="mdl-list__item-primary-content">
              <span>
                <img style="padding-bottom: 3px;" :src="getMal2KissFavicon(streams)" />
                {{ page }}
              </span>
              <span id="KissAnimeLinks" class="mdl-list__item-text-body">
                <div v-for="stream in streams" :key="stream.url" class="mal_links">
                  <a target="_blank" :href="stream.url">{{ stream.title }}</a>
                </div>
              </span>
            </span>
          </li>
        </ul>
      </div>
      <div
        v-show="characters.length > 0"
        class="mdl-grid mdl-grid--no-spacing mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp characters-block mdl-grid malClear"
      >
        <div class="mdl-card__actions clicker">
          <h1 class="mdl-card__title-text" style="float: left;">
            {{ lang('overview_Characters') }}
          </h1>
        </div>
        <div
          id="characterList"
          class="mdl-grid mdl-card__actions mdl-card--border"
          style="justify-content: space-between; "
        >
          <div v-for="character in characters" :key="character.html">
            <div class="mdl-grid" style="width: 126px;">
              <clazy-load
                :src="character.img"
                margin="200px 0px"
                :threshold="0.1"
                :ratio="0.1"
                style="width: 100%; height: auto;"
              >
                <img :src="character.img" style="height: auto; width: 100%;" />
              </clazy-load>
              <div class="" v-html="character.html"></div>
            </div>
          </div>
          <div v-for="n in 10" :key="n" class="listPlaceholder" style="height: 0;">
            <div class="mdl-grid" style="width: 126px;"></div>
          </div>
        </div>
      </div>

      <div
        v-if="openingSongs.length || endingSongs.length"
        class="mdl-grid mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear"
      >
        <li
          v-if="openingSongs.length"
          class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--6-col mdl-cell--12-col-tablet"
          style="padding: 0; height: auto;"
        >
          <span class="mdl-list__item-primary-content" style="height: auto;">
            <span>{{ lang('overview_OpeningTheme') }}</span>
            <span class="mdl-list__item-text-body" style="height: auto;">
              <span
                v-for="openingSong in openingSongs"
                :key="openingSong"
                style="display: block; color: rgb(255,64,129);"
              >
                {{ openingSong }}
              </span>
            </span>
          </span>
        </li>
        <li
          v-if="endingSongs.length"
          class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--6-col mdl-cell--12-col-tablet"
          style="padding: 0; height: auto;"
        >
          <span class="mdl-list__item-primary-content" style="height: auto;">
            <span>{{ lang('overview_EndingTheme') }}</span>
            <span class="mdl-list__item-text-body" style="height: auto;">
              <span v-for="endingSong in endingSongs" :key="endingSong" style="display: block; color: rgb(255,64,129);">
                {{ endingSong }}
              </span>
            </span>
          </span>
        </li>
      </div>

      <div
        v-show="info.length"
        class="mdl-grid mdl-grid--no-spacing mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear"
      >
        <div
          class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear"
        >
          <ul class="mdl-grid mdl-grid--no-spacing mdl-list mdl-cell mdl-cell--12-col">
            <li
              v-for="inf in info"
              :key="inf.title"
              class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet"
              style="height: auto;"
            >
              <span class="mdl-list__item-primary-content" style="height: auto;">
                <span>
                  {{ inf.title }}
                </span>
                <span class="mdl-list__item-text-body" v-html="inf.body"> </span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <progressP :mal-id="renderObj.getMalId()" :type="renderObj.type" :total-eps="renderObj.getTotalEpisodes()" />
    </div>
  </div>
</template>

<script type="text/javascript">
import { getSingle } from '../../_provider/singleFactory';
import { metadata as malMeta } from '../../provider/MyAnimeList/metadata';
import { metadata as aniMeta } from '../../provider/AniList/metadata';
import { metadata as kitsuMeta } from '../../provider/Kitsu/metadata';
import { metadata as simklMeta } from '../../provider/Simkl/metadata';

import progressP from './components/overviewProgress.vue';

export default {
  components: {
    progressP,
  },
  props: {
    renderObj: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      metaObj: null,
      error: null,
      imageTemp: null,
      mal: {
        resumeUrl: null,
        continueUrl: null,
      },
      kiss2mal: {},
      related: [],
      prediction: null,
      utils,
    };
  },
  computed: {
    objError() {
      if (this.renderObj && this.renderObj.getLastError()) return this.renderObj.getLastErrorMessage();
      return null;
    },
    editUrl() {
      if (typeof this.renderObj.getDetailUrl !== 'undefined') return this.renderObj.getDetailUrl();
      return null;
    },
    malStatus: {
      get() {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          return this.renderObj.getStatusCheckboxValue();
        }
        return null;
      },
      set(value) {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          this.renderObj.handleStatusCheckbox(value);
        }
      },
    },
    malEpisode: {
      get() {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          if (this.renderObj.addAnime) return null;
          return this.renderObj.getEpisode();
        }
        return null;
      },
      set(value) {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          this.renderObj.setEpisode(value);
        }
      },
    },
    malVolume: {
      get() {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          if (this.renderObj.addAnime) return null;
          return this.renderObj.getVolume();
        }
        return null;
      },
      set(value) {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          this.renderObj.setVolume(value);
        }
      },
    },
    malScore: {
      get() {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          return this.renderObj.getScoreCheckboxValue();
        }
        return null;
      },
      set(value) {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          this.renderObj.handleScoreCheckbox(value);
        }
      },
    },
    statistics() {
      let stats = {};
      try {
        stats = this.metaObj.getStatistics();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return stats;
    },
    displayUrl() {
      if (this.renderObj !== null) {
        return this.renderObj.getDisplayUrl();
      }
      return this.renderObj.url;
    },
    image() {
      let image = '';
      try {
        image = this.metaObj.getImage();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      try {
        if (this.imageTemp !== null && this.imageTemp !== '') {
          image = this.imageTemp;
        }
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return image;
    },
    title() {
      let title = '';
      try {
        title = this.metaObj.getTitle();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      try {
        title = this.renderObj.getTitle();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return title;
    },
    description() {
      let description = '';
      try {
        description = this.metaObj.getDescription();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return description;
    },
    altTitle() {
      let altTitle = {};
      try {
        altTitle = this.metaObj.getAltTitle();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return altTitle;
    },
    streaming() {
      let streamhtml = null;
      const malObj = this.renderObj;
      if (malObj === null || !malObj.isAuthenticated()) return null;
      const streamUrl = malObj.getStreamingUrl();
      if (typeof streamUrl !== 'undefined') {
        streamhtml = `
            <div class="data title progress" style="display: inline-block; position: relative; top: 2px; margin-left: -2px;">
              <a class="stream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${
                streamUrl.split('/')[2]
              }" target="_blank" style="margin: 0px 5px; color: white;" href="${streamUrl}">
                <img src="${utils.favicon(
                  streamUrl.split('/')[2],
                )}" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">${api.storage.lang(
          `overview_Continue_${malObj.getType()}`,
        )}
              </a>`;

        con.log('Resume', this.mal.resumeUrl, 'Continue', this.mal.continueUrl);
        if (this.mal.continueUrl && this.mal.continueUrl.ep === malObj.getEpisode() + 1) {
          streamhtml += `<a class="nextStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${api.storage.lang(
            `overview_Next_Episode_${malObj.getType()}`,
          )}" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${this.mal.continueUrl.url}">
                <img src="${api.storage.assetUrl(
                  'double-arrow-16px.png',
                )}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">${api.storage.lang(
            `overview_Next_Episode_${malObj.getType()}`,
          )}
              </a>`;
        } else if (this.mal.resumeUrl && this.mal.resumeUrl.ep === malObj.getEpisode()) {
          streamhtml += `<a class="resumeStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${api.storage.lang(
            `overview_Resume_Episode_${malObj.getType()}`,
          )}" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${this.mal.resumeUrl.url}">
                <img src="${api.storage.assetUrl(
                  'arrow-16px.png',
                )}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">${api.storage.lang(
            `overview_Resume_Episode_${malObj.getType()}`,
          )}
              </a>`;
        }

        streamhtml += `</div>
          `;
      }
      return streamhtml;
    },
    characters() {
      let char = {};
      try {
        char = this.metaObj.getCharacters();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return char;
    },
    info() {
      let info = {};
      try {
        info = this.metaObj.getInfo();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return info;
    },
    openingSongs() {
      let opening = {};
      try {
        opening = this.metaObj.getOpeningSongs();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return opening;
    },
    endingSongs() {
      let ending = {};
      try {
        ending = this.metaObj.getEndingSongs();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return ending;
    },
  },
  watch: {
    async renderObj(renderObj) {
      this.render(renderObj);
    },
  },
  methods: {
    lang: api.storage.lang,
    async render(renderObj) {
      this.metaObj = null;
      this.error = null;

      this.mal.resumeUrl = null;
      this.mal.continueUrl = null;
      this.kiss2mal = {};
      this.related = [];
      this.prediction = null;
      this.imageTemp = null;

      if (renderObj === null) return;

      let syncMode = api.settings.get('syncMode');
      //
      if (syncMode === 'SIMKL' && renderObj.type === 'manga') {
        syncMode = api.settings.get('syncModeSimkl');
      }
      //

      try {
        if (/^local:\/\//i.test(renderObj.url)) {
          this.metaObj = {};
        } else if (syncMode === 'ANILIST') {
          this.metaObj = await new aniMeta(renderObj.url).init();
        } else if (syncMode === 'KITSU') {
          this.metaObj = await new kitsuMeta(renderObj.url).init();
        } else if (syncMode === 'SIMKL') {
          this.metaObj = await new simklMeta(renderObj.url).init();
        } else if (renderObj.getMalUrl() !== null) {
          this.metaObj = await new malMeta(renderObj.getMalUrl()).init();
        } else {
          // placeholder
        }
      } catch (e) {
        con.error('Could not retrive metadata', e);
        this.error = e;
        return;
      }

      if (this.metaObj !== null) {
        this.related = this.getRelated();
      }

      if (renderObj.getMalUrl() !== null) {
        if (renderObj.isAuthenticated()) {
          this.updateStatusTags();
        }

        if (renderObj.getMalUrl().split('').length > 3) {
          utils.getMalToKissArray(renderObj.getType(), renderObj.getMalId()).then(links => {
            this.kiss2mal = links;
          });
        }
      }

      if (this.renderObj.shortName !== 'MAL') {
        this.imageTemp = await this.renderObj.getImage();
      }

      this.mal.resumeUrl = renderObj.getResumeWatching();
      this.mal.continueUrl = renderObj.getContinueWatching();

      utils.epPredictionUI(renderObj.id, renderObj.getCacheKey(), renderObj.type, prediction => {
        this.prediction = prediction;
      });
    },
    clickRender() {
      this.render(this.renderObj);
    },
    malSync() {
      this.renderObj.sync().then(
        function() {
          utils.flashm('Updated');
        },
        e => {
          this.renderObj.flashmError(e);
          throw e;
        },
      );
    },
    remove() {
      this.renderObj.delete().then(
        () => {
          utils.flashm('Removed');
          this.renderObj.update();
        },
        e => {
          this.renderObj.flashmError(e);
          this.renderObj.update();
          throw e;
        },
      );
    },
    reload() {
      utils.flashm('Loading');
      this.renderObj.update();
    },
    getMal2KissFavicon(streams) {
      try {
        return utils.favicon(streams[Object.keys(streams)[0]].url.split('/')[2]);
      } catch (e) {
        con.error(e);
        return '';
      }
    },
    getRelated() {
      let related = {};
      try {
        related = this.metaObj.getRelated();
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return related;
    },
    async updateStatusTags() {
      for (const relatedKey in this.related) {
        const relate = this.related[relatedKey];
        for (const linkKey in relate.links) {
          const link = relate.links[linkKey];
          const url = utils.absoluteLink(link.url, 'https://myanimelist.net');
          if (typeof url !== 'undefined') {
            const tag = await utils.timeCache(
              `MALTAG/${url}`,
              async function() {
                const malObj = getSingle(url);
                await malObj.update();
                await new Promise((resolve, reject) => {
                  setTimeout(resolve, 2000);
                });
                return utils.statusTag(malObj.getStatus(), malObj.type, malObj.id);
              },
              2 * 24 * 60 * 60 * 1000,
            );

            if (tag) {
              this.related[relatedKey].links[linkKey].statusTag = tag;
            }
          }
        }
      }
    },
  },
};
</script>
