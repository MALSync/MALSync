<template>
  <div
    v-if="malObj"
    id="malsync-update-ui"
    :class="{
      'malsync-loading': loading,
      'malsync-error': errorMessage,
      'malsync-not-list': !onList,
    }"
  >
    <div class="ms-data">
      <div v-show="loading" class="ms-loading"></div>
      <div class="ms-data-inner">
        <span class="remove-update-mal-sync" @click="hide()">x</span>
        <scoreMode
          :label="lang('UI_Score')"
          :value="score!"
          :score-mode-strategy="malObj ? malObj.getScoreMode() : null"
          @update:value="score = $event"
        ></scoreMode>

        <inputNumber
          :label="utils.episode(malObj.getType() as 'anime' | 'manga')"
          :total="malObj.getTotalEpisodes()"
          :value="episode!"
          :additional-slot="Boolean(progress)"
          @update:value="episode = $event"
        >
          <span v-if="progress" class="mal-sync-ep" :title="progress.getAutoText()">
            [<span :style="`border-bottom: 1px dotted ${progress.getColor()};`">{{
              progress.getCurrentEpisode()
            }}</span
            >]
          </span>
        </inputNumber>

        <inputNumber
          v-if="malObj && malObj.getType() === 'manga' && onList"
          :label="lang('UI_Volume')"
          :total="malObj.getTotalVolumes()"
          :value="volume!"
          @update:value="volume = $event"
        />

        <span v-if="errorMessage" v-dompurify-html="errorMessage" class="errorMessageText"></span>

        <span class="powered-malsync">Provided by MAL-Sync</span>
      </div>

      <div
        v-if="!onList"
        class="malsync-add"
        :class="{ 'ms-load': loading || errorMessage }"
        @click="addUpdate()"
      >
        {{ lang('Add') }}
      </div>
      <div
        v-else-if="malObj.isDirty() && !loading && !errorMessage"
        class="malsync-save"
        @click="update()"
      >
        {{ lang('Update') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import inputNumber from './input-number.vue';
import scoreMode from './score-mode.vue';
import { status } from '../_provider/definitions';
import { SingleAbstract } from '../_provider/singleAbstract';

export default {
  components: {
    inputNumber,
    scoreMode,
  },
  data: () => ({
    lang: api.storage.lang,
    utils,
    malObj: null as null | SingleAbstract,
    episode: null,
    score: null,
    volume: null,
    loading: false,
    forceUpdateState: false,
  }),
  computed: {
    malObjEpisode() {
      return this.malObj ? this.malObj.getEpisode() : null;
    },
    malObjScore() {
      return this.malObj ? this.malObj.getAbsoluteScore() : null;
    },
    malObjVolume() {
      return this.malObj ? this.malObj.getVolume() : null;
    },
    progress() {
      if (
        this.malObj &&
        this.malObj.getProgress() &&
        this.malObj.getProgress().isAiring() &&
        this.malObj.getProgress().getCurrentEpisode()
      ) {
        return this.malObj.getProgress();
      }
      return '';
    },
    errorMessage() {
      return this.malObj && this.malObj.getLastError() ? this.malObj.getLastErrorMessage() : '';
    },
    onList() {
      return this.malObj && this.malObj.isOnList() ? this.malObj.isOnList() : null;
    },
  },
  watch: {
    malObj: {
      handler(newVal) {
        if (newVal) newVal.initProgress();
      },
      immediate: true,
    },
    malObjEpisode: {
      immediate: true,
      handler(newVal) {
        this.episode = newVal;
      },
    },
    malObjScore: {
      immediate: true,
      handler(newVal) {
        this.score = newVal;
      },
    },
    malObjVolume: {
      immediate: true,
      handler(newVal) {
        this.volume = newVal;
      },
    },
    episode: {
      handler(newValue, oldValue) {
        if (this.malObj) {
          this.malObj.setEpisode(newValue);

          // Auto-update to Completed
          if (
            this.malObj.getTotalEpisodes() &&
            this.malObj.getEpisode() === this.malObj.getTotalEpisodes() &&
            (this.malObj.getStatus() === status.Watching ||
              this.malObj.getStatus() === status.PlanToWatch ||
              this.malObj.getStatus() === status.NoState)
          ) {
            this.malObj.setStatus(status.Completed);
            this.forceUpdateState = true;
          }
          // Auto-update to Watching from completed
          else if (
            this.malObj.getStatus() === status.Completed &&
            this.malObj.getTotalEpisodes() &&
            this.malObj.getEpisode() < this.malObj.getTotalEpisodes()
          ) {
            this.malObj.setStatus(status.Watching);
            this.forceUpdateState = true;
          }
          // Auto-update to Watching
          else if (
            !oldValue &&
            newValue &&
            (this.malObj.getStatus() === status.PlanToWatch ||
              this.malObj.getStatus() === status.NoState)
          ) {
            this.malObj.setStatus(status.Watching);
            this.forceUpdateState = true;
          }
        }
      },
    },
    score: {
      handler(newValue) {
        if (this.malObj) this.malObj.setAbsoluteScore(newValue);
      },
    },
    volume: {
      handler(newValue) {
        if (this.malObj) this.malObj.setVolume(newValue);
      },
    },
  },
  methods: {
    async reload() {
      if (this.malObj) {
        this.loading = true;
        try {
          await this.malObj.update();
        } catch (e) {
          con.error(e);
        }
        this.loading = false;
      }
    },
    async update() {
      if (this.malObj) {
        this.loading = true;
        try {
          await this.malObj.sync();
          await this.malObj.update();
        } catch (e) {
          con.error(e);
        }
        this.loading = false;
        if (this.forceUpdateState) {
          this.forceUpdateState = false;
          j.$('.cover-wrap-inner .list .add').click();
          utils.waitUntilTrue(
            () => j.$('.list-editor .el-icon-close').length,
            () => j.$('.list-editor .el-icon-close').click(),
          );
        }
      }
    },
    async addUpdate() {
      this.forceUpdateState = true;
      await this.update();
    },
    hide() {
      this.$el.remove();
      api.settings.set('anilistUpdateUi', false);
    },
  },
};
</script>

<style lang="less">
#malsync-update-ui {
  &.malsync-loading,
  &.malsync-error {
    pointer-events: none;
    .ms-data-inner {
      opacity: 0.4 !important;
    }
  }

  &.malsync-not-list {
    .ms-data-inner {
      opacity: 0.4 !important;
    }

    &:hover .ms-data-inner {
      opacity: 1 !important;
    }
  }

  &.malsync-error {
    pointer-events: none;
    .ms-data {
      outline: solid 1px red;
    }
    .ms-data-inner {
      opacity: 1 !important;
    }
    .powered-malsync {
      opacity: 1 !important;
      color: red !important;
    }
    .ms-data-inner .progress {
      opacity: 0.4 !important;
    }
    .errorMessageText {
      color: red;
      margin-bottom: 15px;
      text-align: center;
    }
  }

  .ms-data {
    position: relative;
    background: rgb(var(--color-foreground));
    border-radius: 3px;
    margin-bottom: 16px;
    overflow: hidden;

    .ms-data-inner {
      opacity: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 18px;
      gap: 15px;
      transition: opacity 0.1s ease-in-out;
    }

    .malsync-save,
    .malsync-add {
      text-align: center;
      background: rgb(var(--color-blue));
      height: 28px;
      vertical-align: middle;
      line-height: 28px;
      color: rgb(var(--color-white));
      text-transform: uppercase;
      font-size: 14px;
      cursor: pointer;
      &.ms-load {
        pointer-events: none;
        opacity: 0.4;
      }
    }

    .malsync-add {
      background: rgb(var(--color-green));
    }

    &:hover .powered-malsync {
      opacity: 0.3;
    }
    .powered-malsync {
      transition: opacity 0.2s ease-in-out;
      opacity: 0.1;
      position: absolute;
      bottom: 5px;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: rgb(var(--color-text-secondary));
    }
  }
  .progress {
    max-width: 229px;
    margin-left: auto;
    margin-right: auto;
  }
  .el-input__inner,
  .star-score-wrap,
  .smile-score-wrap {
    background: rgb(var(--color-background)) !important;
    height: 27px;
  }
  .star-score-wrap {
    margin-top: 5px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .el-rate__item {
      cursor: pointer;
    }
  }
  .smile-score-wrap {
    margin-top: 5px;
    width: 100%;
    .el-rate {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      height: 100%;
    }
  }
  .ms-button {
    width: 20px;
    height: 18px;
    &.el-input-number__increase {
      line-height: 20px;
    }
    &.el-input-number__decrease {
      line-height: 16px;
    }
  }
  .el-input-number {
    width: auto;
  }

  .el-select {
    width: 100%;
    .el-input__inner {
      line-height: normal;
    }
    .el-input__suffix {
      pointer-events: none;
      right: 0;
      top: 6px;

      * {
        pointer-events: none !important;
      }
    }
  }

  .ms-input-wrapper {
    display: flex;
    align-items: center;

    .ms-input-ep {
      white-space: nowrap;
      margin-left: 10px;
    }
  }

  .ms-loading {
    position: absolute;
    height: 4px;
    width: 100%;
    overflow: hidden;

    &::before {
      display: block;
      position: absolute;
      content: '';
      left: -200px;
      width: 200px;
      height: 4px;
      background: rgb(var(--color-blue));
      animation: loading-mal 2s linear infinite;
    }

    @keyframes loading-mal {
      0% {
        left: -200px;
        width: 30%;
      }
      50% {
        width: 30%;
      }
      70% {
        width: 70%;
      }
      80% {
        left: 50%;
      }
      95% {
        left: 120%;
      }
      100% {
        left: 100%;
      }
    }
  }

  .remove-update-mal-sync {
    cursor: pointer;
    position: absolute;
    opacity: 0.4;
    right: 5px;
    top: 2px;
    font-size: 12px;
  }
}
</style>
