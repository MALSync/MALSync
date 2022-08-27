<template>
  <div v-if="!loading && single" class="update-ui">
    <div class="list-select">
      {{ lang('UI_Status') }}
      <FormDropdown v-model="status" :options="(single.getStatusCheckbox() as any)" />
    </div>
    <div class="progress-select">
      Your progress
      <FormText v-model="episode" :suffix="`/${single.getTotalEpisodes() || '?'}`" />
      +
      <FormSlider
        v-model="episode"
        :disabled="!single.getTotalEpisodes()"
        :min="0"
        :max="single.getTotalEpisodes()"
      />
    </div>
    <div v-if="type === 'manga'" class="volume-select">
      {{ lang('UI_Volume') }}
      <FormText v-model="volume" :suffix="`/${single.getTotalVolumes() || '?'}`" />
      +
      <FormSlider
        v-model="volume"
        :disabled="!single.getTotalVolumes()"
        :min="0"
        :max="single.getTotalVolumes()"
      />
    </div>
    <div class="score-select">
      {{ lang('UI_Score') }}
      <FormDropdown v-model="score" :options="(single.getScoreCheckbox() as any)" />
      <FormSlider v-model="score" :options="(single.getScoreCheckbox() as any)" />
    </div>
    <div class="update-buttons">
      <div><span class="material-icons">cloud_upload</span>Update</div>
      <div><span class="material-icons">remove_circle_outline</span>Remove</div>
      <div><span class="material-icons">cloud_download</span>Synchronize</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import FormText from '../form/form-text.vue';
import FormDropdown from '../form/form-dropdown.vue';
import FormSlider from '../form/form-slider.vue';

const props = defineProps({
  single: {
    type: Object as PropType<SingleAbstract | null>,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'anime' | 'manga'>,
    default: 'anime',
  },
});

const volume = computed({
  get() {
    if (props.single && props.single.isAuthenticated()) {
      if (!props.single.isOnList()) return '';
      if (Number.isNaN(props.single.getVolume())) return '';
      return props.single.getVolume().toString();
    }
    return '';
  },
  set(value) {
    if (props.single && props.single.isAuthenticated()) {
      props.single.setVolume(Number(value));
    }
  },
});

const episode = computed({
  get() {
    if (props.single && props.single.isAuthenticated()) {
      if (!props.single.isOnList()) return '';
      if (Number.isNaN(props.single.getEpisode())) return '';
      return props.single.getEpisode().toString();
    }
    return '';
  },
  set(value) {
    if (props.single && props.single.isAuthenticated()) {
      props.single.setEpisode(Number(value));
    }
  },
});

const score = computed({
  get() {
    if (props.single && props.single.isAuthenticated()) {
      return props.single.getScoreCheckboxValue().toString();
    }
    return 0;
  },
  set(value) {
    if (props.single && props.single.isAuthenticated()) {
      props.single.handleScoreCheckbox(value);
    }
  },
});

const status = computed({
  get() {
    if (props.single && props.single.isAuthenticated()) {
      return props.single.getStatusCheckboxValue();
    }
    return 0;
  },
  set(value) {
    if (props.single && props.single.isAuthenticated()) {
      props.single.handleStatusCheckbox(value);
    }
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.update-ui {
  color: var(--cl-light-text);
  .list-select {
    margin-bottom: @spacer-half;
  }
  .progress-select {
    margin-bottom: @spacer-half;
  }
  .score-select {
    margin-bottom: @spacer-half;
  }

  .update-buttons {
    display: flex;
    justify-content: space-around;
    text-align: center;
    .material-icons {
      margin-right: @spacer-half;
      margin-left: @spacer-half;
      vertical-align: middle;
    }
  }
}
</style>
