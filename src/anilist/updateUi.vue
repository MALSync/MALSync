<template>
  <div v-if="malObj" id="malsync-update-ui">
    <div class="ms-data">
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
  }),
  watch: {
    malObj: {
      handler(newValue) {
        if (newValue) {
          this.episode = newValue.getEpisode();
          this.score = newValue.getAbsoluteScore();
          this.volume = newValue.getVolume();
        }
      },
      immediate: true,
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
  methods: {},
};
</script>

<style lang="less">
#malsync-update-ui {
  .ms-data {
    position: relative;
    background: rgb(var(--color-foreground));
    border-radius: 3px;
    padding: 18px;
    margin-bottom: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
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
