<template>
  <div id="malsync-update-ui">
    <div class="ms-data">
      <div class="form score">
        <div class="input-title">{{lang('UI_Score')}}</div>
        <div class="ms-input-wrapper">
          <div class="el-input-number is-controls-right">
            <span role="button" class="el-input-number__decrease ms-button">
              <i class="el-icon-arrow-down"></i>
            </span>
            <span role="button" class="el-input-number__increase ms-button">
              <i class="el-icon-arrow-up"></i>
            </span>
            <div class="el-input">
              <input v-model="score" type="text" autocomplete="off" max="10" min="0" class="el-input__inner" />
            </div>
          </div>
        </div>
      </div>

      <inputNumber
        :label="utils.episode(malObj.getType())"
        :total="malObj.getTotalEpisodes()"
        v-bind:value="episode"
        v-on:update:value="episode = $event"
      />

      <inputNumber
        v-if="malObj && malObj.type === 'manga'"
        :label="lang('UI_Volume')"
        :total="malObj.getTotalVolumes()"
        v-bind:value="volume"
        v-on:update:value="volume = $event"
      />
    </div>
  </div>
</template>

<script type="text/javascript">
import inputNumber from './input-number.vue';

export default {
  components: {
    inputNumber,
  },
  data: () => ({
    lang: api.storage.lang,
    utils,
    malObj: {},
    episode: 2,
    score: 5,
    volume: 1,
  }),
  watch: {},
  created() {},
  methods: {},
};
</script>

<style lang="less">
#malsync-update-ui {
  .ms-data {
    background: rgb(var(--color-foreground));
    border-radius: 3px;
    padding: 18px;
    margin-bottom: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
  }
  .el-input__inner {
    background: rgb(var(--color-background)) !important;
    height: 27px;
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
