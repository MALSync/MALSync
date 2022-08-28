<template>
  <div v-if="!loading && single" class="update-ui">
    <div :class="{ notOnList: !single.isOnList() }">
      <div class="list-select">
        <div class="label-row">
          <span class="label">{{ lang('UI_Status') }}</span>
          <FormDropdown
            v-model="status"
            :options="(single.getStatusCheckbox() as any)"
            align-items="left"
          >
            <template #select="slotProps">
              <FormButton :tabindex="-1" :animation="false" padding="mini" class="dots">
                <StateDot :status="(slotProps.value as number)" /> {{ slotProps.currentTitle }}
              </FormButton>
            </template>
            <template #option="slotProps">
              <div class="dots">
                <StateDot :status="(slotProps.option.value as number)" />
                {{ slotProps.option.label }}
              </div>
            </template>
          </FormDropdown>
        </div>
      </div>
      <div class="progress-select">
        <div class="label-row">
          <span class="label">{{ episodeLang(type) }}</span>
          <FormText
            v-model="episode"
            type="mini"
            :suffix="`/${single.getTotalEpisodes() || '?'}`"
          />
          <span class="label">+</span>
        </div>
        <FormSlider
          v-model="episode"
          :disabled="!single.getTotalEpisodes()"
          :min="0"
          :max="single.getTotalEpisodes()"
          color="blue"
        />
      </div>
      <div v-if="type === 'manga'" class="volume-select">
        <div class="label-row">
          <span class="label">{{ lang('UI_Volume') }}</span>
          <FormText v-model="volume" type="mini" :suffix="`/${single.getTotalVolumes() || '?'}`" />
          <span class="label">+</span>
        </div>
        <FormSlider
          v-model="volume"
          :disabled="!single.getTotalVolumes()"
          :min="0"
          :max="single.getTotalVolumes()"
        />
      </div>
      <div class="score-select">
        <div class="label-row">
          <span class="label">{{ lang('UI_Score') }}</span>
          <FormDropdown v-model="score" :options="(single.getScoreCheckbox() as any)">
            <template #select="slotProps">
              <FormButton :tabindex="-1" :animation="false" padding="mini">
                {{ slotProps.currentTitle }}
              </FormButton>
            </template>
          </FormDropdown>
        </div>
        <FormSlider
          v-model="score"
          color="violet"
          :options="(sortedOptions(single.getScoreCheckbox()) as any)"
        />
      </div>
    </div>
    <div class="update-buttons">
      <div v-if="!single.isOnList()" class="update-button add">
        <span class="material-icons">bookmark_add</span>
        Add
      </div>
      <template v-else>
        <div class="update-button">
          <span class="material-icons">cloud_upload</span>
          Update
        </div>
        <div class="update-button">
          <span class="material-icons">remove_circle_outline</span>
          Remove
        </div>
        <div class="update-button">
          <span class="material-icons">cloud_download</span>
          Synchronize
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import FormText from '../form/form-text.vue';
import FormDropdown from '../form/form-dropdown.vue';
import FormSlider from '../form/form-slider.vue';
import StateDot from '../state-dot.vue';
import FormButton from '../form/form-button.vue';
import { ScoreOption } from '../../../_provider/ScoreMode/ScoreModeStrategy';

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
      return props.single.getStatusCheckboxValue() || 6;
    }
    return 6;
  },
  set(value) {
    if (props.single && props.single.isAuthenticated()) {
      props.single.handleStatusCheckbox(value);
    }
  },
});

const sortedOptions = (options: ScoreOption[]) => {
  return options.sort((a, b) => a.value - b.value);
};

const episodeLang = utils.episode;
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.update-buttons,
.label {
  color: var(--cl-light-text);
}

.update-ui {
  .list-select {
    margin-bottom: @spacer-half;
    padding-bottom: 8px;
  }
  .progress-select {
    margin-bottom: @spacer-half;
  }
  .score-select {
    margin-bottom: @spacer-half;
  }
  .volume-select {
    margin-bottom: @spacer-half;
  }

  .update-buttons {
    display: flex;
    justify-content: space-around;
    text-align: center;
    .update-button {
      .click-move-down();
      .link();
      .border-radius();
      .block-select();

      vertical-align: middle;
      padding: 10px 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;

      &.add {
        width: 100%;
        background-color: var(--cl-primary);
        color: white;
        border: 2px solid var(--cl-primary);
        &:hover {
          border-color: white;
        }
      }

      &:hover {
        background-color: var(--cl-primary);
        color: white;
      }
    }
  }

  .dots {
    display: flex;
    align-items: center;
  }

  .label-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .notOnList {
    opacity: 0.5;
    transition: opacity @fast-transition ease-in-out;
  }

  &:hover .notOnList {
    opacity: 1;
  }
}
</style>
