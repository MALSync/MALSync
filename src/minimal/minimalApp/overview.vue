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
      <span v-dompurify-html="objError" class="mdl-chip__text"></span>
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
              <span class="mdl-list__item-sub-title">{{ stat.body }}</span>
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
          <clazy-load :src="image" class="malImage malClear" style="width: 100%;height: auto;" @error="setQuestionmark">
            <img :src="image" style="height: auto; width: 100%;" @error="setQuestionmark" />
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
          <h1 class="malTitle mdl-card__title-text malClear" style="padding-left: 0; overflow:visible;">{{ title }}</h1>
          <div class="malAltTitle mdl-card__supporting-text malClear" style="padding: 10px 0 0 0; overflow:visible;">
            <div v-for="altTitl in altTitle" :key="altTitl" class="mdl-chip" style="margin-right: 5px;">
              <span class="mdl-chip__text">{{ altTitl }}</span>
            </div>
          </div>
        </div>
        <div class="malDescription malClear mdl-cell mdl-cell--10-col" style="overflow: hidden;">
          <p v-dompurify-html="description" style="color: black;"></p>
          <div
            v-if="renderObj && renderObj.isAuthenticated()"
            class="mdl-card__actions mdl-card--border"
            style="padding-left: 0;"
          >
            <div
              v-if="renderObj.getStreamingUrl()"
              class="data title progress"
              style="display: inline-block; position: relative; top: 2px; margin-left: -2px;"
            >
              <a
                class="stream mdl-button mdl-button--colored mdl-js-button mdl-button--raised"
                :title="renderObj.getStreamingUrl().split('/')[2]"
                target="_blank"
                style="margin: 10px 5px 0 0; color: white;"
                :href="renderObj.getStreamingUrl()"
              >
                <img
                  :src="utils.favicon(renderObj.getStreamingUrl().split('/')[2])"
                  style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;"
                />
                {{ lang(`overview_Continue_${renderObj.getType()}`) }}
              </a>

              <a
                v-if="mal.continueUrl && mal.continueUrl.ep === renderObj.getEpisode() + 1"
                class="nextStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised"
                :title="lang(`overview_Next_Episode_${renderObj.getType()}`)"
                target="_blank"
                style="margin: 10px 5px 0 0; color: white;"
                :href="mal.continueUrl.url"
              >
                <img
                  :src="assetUrl('double-arrow-16px.png')"
                  width="16"
                  height="16"
                  style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;"
                />{{ lang(`overview_Next_Episode_${renderObj.getType()}`) }}
              </a>

              <a
                v-else-if="mal.resumeUrl && mal.resumeUrl.ep === renderObj.getEpisode()"
                class="resumeStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised"
                :title="lang(`overview_Resume_Episode_${renderObj.getType()}`)"
                target="_blank"
                style="margin: 10px 5px 0 0; color: white;"
                :href="mal.resumeUrl.url"
              >
                <img
                  :src="assetUrl('arrow-16px.png')"
                  width="16"
                  height="16"
                  style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;"
                />{{ lang(`overview_Resume_Episode_${renderObj.getType()}`) }}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="
          renderObj.getProgress() && renderObj.getProgress().isAiring() && renderObj.getProgress().getPredictionText()
        "
        class="mdl-grid mdl-cell bg-cell mdl-shadow--4dp malClear"
        style="width: 100%;"
      >
        <div class="mdl-cell" style="width: 100%;">
          {{ renderObj.getProgress().getPredictionText() }}
        </div>
      </div>
      <div
        class="mdl-cell bg-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp data-block mdl-grid mdl-grid--no-spacing malClear"
      >
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
                  /
                  <span
                    v-if="
                      renderObj.getProgress() &&
                        renderObj.getProgress().isAiring() &&
                        renderObj.getProgress().getCurrentEpisode()
                    "
                    :title="renderObj.getProgress().getAutoText()"
                  >
                    [{{ renderObj.getProgress().getCurrentEpisode() }}]
                  </span>
                  <span v-if="renderObj && renderObj.getTotalEpisodes()" id="curEps">{{
                    renderObj.getTotalEpisodes()
                  }}</span
                  ><span v-else>?</span>
                  <span
                    v-if="
                      !renderObj.getTotalEpisodes() ||
                        !renderObj.getEpisode() ||
                        renderObj.getEpisode() < renderObj.getTotalEpisodes()
                    "
                    class="material-icons ep-increment"
                    @click="increaseEP('episode')"
                    >add</span
                  >
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
                  <span
                    v-if="
                      !renderObj.getTotalVolumes() ||
                        !renderObj.getVolume() ||
                        renderObj.getVolume() < renderObj.getTotalVolumes()
                    "
                    class="material-icons ep-increment"
                    @click="increaseEP('volume')"
                    >add</span
                  >
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
            <li
              v-if="
                renderObj &&
                  renderObj.isAuthenticated() &&
                  renderObj.isOnList() &&
                  renderObj.getProgressOptions() &&
                  renderObj.getProgressOptions().length
              "
              class="mdl-list__item mdl-list__item--three-line"
              style="width: 100%;"
            >
              <span class="mdl-list__item-primary-content">
                <span>{{ lang('settings_progress_dropdown') }}</span>
                <span class="mdl-list__item-text-body">
                  <select
                    id="myinfo_progressmode"
                    v-model="malProgressMode"
                    name="myinfo_progressmode"
                    class="inputtext mdl-textfield__input"
                    style="outline: none;"
                  >
                    <option value="">
                      {{ lang('settings_progress_default') }}
                    </option>
                    <option v-for="o in renderObj.getProgressOptions()" :key="o.key" :value="o.key">{{
                      o.value
                    }}</option>
                    <option value="off">
                      {{ lang('settings_progress_disabled') }}
                    </option>
                  </select>
                </span>
              </span>
            </li>
            <li class="mdl-list__item" style="width: 100%;">
              <input
                v-if="renderObj && !renderObj.isOnList()"
                type="button"
                name="myinfo_submit"
                :value="lang('Add')"
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
                  <span v-dompurify-html="link.statusTag"></span>
                </div>
              </span>
            </span>
          </li>
        </ul>
      </div>
      <div
        v-show="kiss2mal && kiss2mal.length"
        class="mdl-grid mdl-grid--no-spacing bg-cell mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid alternative-list stream-block malClear"
      >
        <ul class="mdl-list stream-block-inner">
          <li v-for="page in kiss2mal" :key="page.name" class="mdl-list__item mdl-list__item--three-line">
            <span class="mdl-list__item-primary-content">
              <span>
                <img style="padding-bottom: 3px;" :src="getMal2KissFavicon(page.domain)" />
                {{ page.name }}
              </span>
              <span id="KissAnimeLinks" class="mdl-list__item-text-body">
                <div v-for="stream in page.links" :key="stream.url" class="mal_links">
                  <a target="_blank" :href="stream.url">{{ stream.name }}</a>
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
              <div>
                <a :href="character.url">
                  {{ character.name }}
                </a>
                <div class="spaceit_pad">
                  <small>{{ character.subtext }}</small>
                </div>
              </div>
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
                <span class="mdl-list__item-text-body">
                  <span v-for="(b, ind) in inf.body" :key="b.title"
                    ><template v-if="ind > 0">, </template
                    ><template v-if="b.url"
                      ><a :href="b.url">{{ b.text }}</a></template
                    ><template v-else>{{ b.text }}</template
                    ><small v-if="b.subtext && b.subtext"> {{ b.subtext }}</small></span
                  >
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <progressP
        :api-cache-key="renderObj.getApiCacheKey()"
        :type="renderObj.type"
        :total-eps="renderObj.getTotalEpisodes()"
      />
    </div>
  </div>
</template>

<script type="text/javascript">
import { getSingle } from '../../_provider/singleFactory';
import { getOverview } from '../../_provider/metaDataFactory';
import { activeLinks } from '../../utils/quicklinksBuilder';

import progressP from './components/overviewProgress.vue';

let nextEpBounce;

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
      kiss2mal: [],
      related: [],
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
    malProgressMode: {
      get() {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          return this.renderObj.getProgressMode();
        }
        return null;
      },
      set(value) {
        if (this.renderObj && this.renderObj.isAuthenticated()) {
          this.renderObj.setProgressMode(value);
        }
      },
    },
    statistics() {
      let stats = {};
      try {
        stats = this.metaObj.statistics;
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
        image = this.metaObj.image;
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
        title = this.metaObj.title;
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
        description = this.metaObj.description;
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return description;
    },
    altTitle() {
      let altTitle = {};
      try {
        altTitle = this.metaObj.alternativeTitle;
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return altTitle;
    },
    characters() {
      let char = {};
      try {
        char = this.metaObj.characters;
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return char;
    },
    info() {
      let info = {};
      try {
        info = this.metaObj.info;
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return info;
    },
    openingSongs() {
      let opening = {};
      try {
        opening = this.metaObj.openingSongs;
      } catch (e) {
        console.log('[iframeOverview] Error:', e);
      }
      return opening;
    },
    endingSongs() {
      let ending = {};
      try {
        ending = this.metaObj.endingSongs;
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
    assetUrl: api.storage.assetUrl,
    async render(renderObj) {
      this.metaObj = null;
      this.error = null;

      this.mal.resumeUrl = null;
      this.mal.continueUrl = null;
      this.kiss2mal = [];
      this.related = [];
      this.imageTemp = null;

      if (renderObj === null) return;

      const stateTest = renderObj.url;

      let syncMode = api.settings.get('syncMode');
      //
      if (syncMode === 'SIMKL' && renderObj.type === 'manga') {
        syncMode = api.settings.get('syncModeSimkl');
      }
      //

      try {
        const ov = await getOverview(renderObj.url, renderObj.getType()).init();
        if (!this.renderObj || stateTest !== this.renderObj.url) return;
        this.metaObj = ov.getMeta();
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
      }

      activeLinks(renderObj.getType(), renderObj.getApiCacheKey(), renderObj.getTitle()).then(links => {
        if (!this.renderObj || stateTest !== this.renderObj.url) return;
        this.kiss2mal = links;
      });

      if (this.renderObj.shortName !== 'MAL') {
        const tempi = await this.renderObj.getImage();
        if (!this.renderObj || stateTest !== this.renderObj.url) return;
        this.imageTemp = tempi;
      }

      this.mal.resumeUrl = renderObj.getResumeWatching();
      this.mal.continueUrl = renderObj.getContinueWatching();
    },
    clickRender() {
      this.render(this.renderObj);
    },
    malSync() {
      this.renderObj.sync().then(
        () => {
          utils.flashm(api.storage.lang('updated'));
          if (!this.renderObj.isOnList()) this.renderObj.update();
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
          utils.flashm(api.storage.lang('removed'));
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
      utils.flashm(api.storage.lang('Loading'));
      this.renderObj.update();
    },
    increaseEP(type) {
      let nextEp = 1;
      if (type === 'episode') {
        if (this.renderObj.getEpisode()) nextEp = this.renderObj.getEpisode() + 1;
        if (this.renderObj.getTotalEpisodes() && nextEp > this.renderObj.getTotalEpisodes())
          nextEp = this.renderObj.getTotalEpisodes();

        this.renderObj.setEpisode(nextEp);
      } else {
        if (this.renderObj.getVolume()) nextEp = this.renderObj.getVolume() + 1;
        if (this.renderObj.getTotalVolumes() && nextEp > this.renderObj.getTotalVolumes())
          nextEp = this.renderObj.getTotalVolumes();

        this.renderObj.setVolume(nextEp);
      }

      clearTimeout(nextEpBounce);
      nextEpBounce = setTimeout(() => {
        this.malSync();
      }, 1000);
    },
    getMal2KissFavicon(url) {
      try {
        return utils.favicon(url);
      } catch (e) {
        con.error(e);
        return '';
      }
    },
    getRelated() {
      let related = {};
      try {
        related = this.metaObj.related;
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
                await utils.wait(2000);
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
    setQuestionmark(e) {
      e.target.src = api.storage.assetUrl('questionmark.gif');
    },
  },
};
</script>
