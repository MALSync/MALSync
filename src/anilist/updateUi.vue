<template>
  <div v-if="malObj" id="malsync-update-ui" :class="{ 'malsync-loading': loading }">
    <div class="ms-data">
      <div class="ms-data-inner">
        <scoreMode
          :label="lang('UI_Score')"
          :value="score"
          :score-mode-strategy="malObj ? malObj.getScoreMode() : null"
          @update:value="score = $event"
        ></scoreMode>

        <inputNumber
          :label="utils.episode(malObj.getType())"
          :total="malObj.getTotalEpisodes()"
          :value="episode"
          @update:value="episode = $event"
        />

        <inputNumber
          v-if="malObj && malObj.type === 'manga'"
          :label="lang('UI_Volume')"
          :total="malObj.getTotalVolumes()"
          :value="volume"
          @update:value="volume = $event"
        />

        <span class="powered-malsync">Provided by MAL-Sync</span>
      </div>

      <div v-if="malObj.isDirty() && !loading" class="malsync-save" @click="update()">{{ lang('Update') }}</div>
    </div>
  </div>
</template>

<script type="text/javascript">
import inputNumber from './input-number.vue';
import scoreMode from './score-mode.vue';

export default {
  components: {
    inputNumber,
    scoreMode,
  },
  data: () => ({
    lang: api.storage.lang,
    utils,
    malObj: null,
    episode: null,
    score: null,
    volume: null,
    loading: false,
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
  },
  watch: {
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
      handler(newValue) {
        if (this.malObj) this.malObj.setEpisode(newValue);
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
  created() {},
  methods: {
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
      }
    },
  },
};
</script>

<style lang="less">
#malsync-update-ui {
  &.malsync-loading {
    pointer-events: none;
    .ms-data-inner {
      opacity: 0.4 !important;
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

    .malsync-save {
      text-align: center;
      background: rgb(var(--color-blue));;
      height: 28px;
      vertical-align: middle;
      line-height: 28px;
      color: rgb(var(--color-white));
      text-transform: uppercase;
      font-size: 14px;
      cursor: pointer;
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
      right: 0px;
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
}
</style>
