<template>
  <ErrorSingle v-if="single && single.getLastError()" :error="single.getLastErrorMessage()" />
  <div v-else class="update-ui" :class="{ loading, singleLoading }">
    <div class="form-section" :class="{ notOnList: !single?.isOnList() || false }">
      <div class="list-select">
        <div v-if="single" class="label-row">
          <span class="label">{{ lang('UI_Status') }}</span>
          <FormDropdown
            v-model="status"
            :options="single.getStatusCheckbox() as any"
            align-items="left"
          >
            <template #select="slotProps">
              <FormButton :tabindex="-1" :animation="false" padding="mini" class="dots">
                <StateDot :status="Number(slotProps.value)" :relative-height="true" />
                {{ slotProps.currentTitle }}
              </FormButton>
            </template>
            <template #option="slotProps">
              <div class="dots">
                <StateDot :status="Number(slotProps.option.value)" />
                {{ slotProps.option.label }}
              </div>
            </template>
          </FormDropdown>
        </div>
      </div>
      <div class="progress-select">
        <template v-if="single">
          <div class="label-row">
            <span class="label">{{ episodeLang(type) }}</span>
            <FormText
              v-model="episode"
              type="mini"
              :suffix="`/${single.getTotalEpisodes() || '? '}`"
            >
              <template #placeholder="{ picked, suffix }">
                <div class="progress-picked">
                  {{ picked }}{{ picked ? suffix : '' }}
                  <MediaProgressPill
                    v-if="progress"
                    :watched-ep="Number(episode)"
                    :episode="progress.getCurrentEpisode()"
                    :text="progress.getPredictionText()"
                  />
                </div>
              </template>
            </FormText>
            <OverviewImageLanguage :single="single" />
            <span
              v-show="!(single.getTotalEpisodes() && Number(episode) === single.getTotalEpisodes())"
              class="label increase"
              @click="episode = String(Number(episode) + 1)"
            >
              +
            </span>
          </div>
          <FormSlider
            v-model="episode"
            :disabled="!single.getTotalEpisodes()"
            :min="0"
            :max="single.getTotalEpisodes()"
            color="blue"
          />
        </template>
      </div>
      <div v-if="type === 'manga'" class="volume-select">
        <template v-if="single">
          <div class="label-row">
            <span class="label">{{ lang('UI_Volume') }}</span>
            <FormText
              v-model="volume"
              type="mini"
              :suffix="`/${single.getTotalVolumes() || '?'}`"
            />
            <span
              v-show="!(single.getTotalVolumes() && Number(volume) === single.getTotalVolumes())"
              class="label increase"
              @click="volume = String(Number(volume) + 1)"
            >
              +
            </span>
          </div>
          <FormSlider
            v-model="volume"
            :disabled="!single.getTotalVolumes()"
            :min="0"
            :max="single.getTotalVolumes()"
          />
        </template>
      </div>
      <div class="score-select">
        <template v-if="single && scoreModeStrategy">
          <div class="label-row">
            <span class="label">{{ lang('UI_Score') }}</span>
            <template v-if="scoreModeStrategy.ui.module === 'input'">
              <FormText
                v-model="scoreTextField"
                type="mini"
                :simple-placeholder="true"
                :strict-validation="true"
                :validation="
                  value => {
                    return Boolean(
                      String(value).match(new RegExp((scoreModeStrategy!.ui as any).pattern)),
                    );
                  }
                "
                :placeholder="lang('UI_Score_Not_Rated')"
              />
            </template>
            <template v-else-if="scoreModeStrategy.ui.module === 'click'">
              <FormClick
                v-model="score"
                :options="scoreModeStrategy.getOptions() as any"
                :type="scoreModeStrategy.ui.type"
              />
            </template>
            <template v-else>
              <FormDropdown
                v-model="score"
                align-items="left"
                :options="scoreModeStrategy.getOptions() as any"
              >
                <template #select="slotProps">
                  <FormButton :tabindex="-1" :animation="false" padding="mini">
                    {{ slotProps.currentTitle }}
                  </FormButton>
                </template>
              </FormDropdown>
            </template>
          </div>
          <FormSlider
            v-model="score"
            color="violet"
            :options="sortedOptions(single.getScoreCheckbox()) as any"
          />
        </template>
      </div>
    </div>
    <div class="update-buttons">
      <div
        v-if="!single?.isOnList() || false"
        class="update-button add"
        tabindex="0"
        @keydown.enter="sync()"
        @click="sync()"
      >
        <span class="material-icons">bookmark_add</span>
        {{ lang('Add') }}
      </div>
      <template v-else>
        <div
          v-if="single.isDirty()"
          class="update-button"
          tabindex="0"
          @keydown.enter="sync()"
          @click="sync()"
        >
          <span class="material-icons">cloud_upload</span>
          {{ lang('Update') }}
        </div>
        <div v-else class="update-button" tabindex="0" @keydown.enter="update()" @click="update()">
          <span class="material-icons">cloud_download</span>
          {{ lang('Synchronize') }}
        </div>
        <div class="update-button" tabindex="0" @keydown.enter="remove()" @click="remove()">
          <span class="material-icons">remove_circle_outline</span>
          {{ lang('Remove') }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import FormText from '../form/form-text.vue';
import FormDropdown from '../form/form-dropdown.vue';
import FormSlider from '../form/form-slider.vue';
import StateDot from '../state-dot.vue';
import FormButton from '../form/form-button.vue';
import { ScoreOption } from '../../../_provider/ScoreMode/ScoreModeStrategy';
import OverviewImageLanguage from './overview-image-language.vue';
import FormClick from '../form/form-click.vue';
import ErrorSingle from '../error/error-single.vue';
import MediaProgressPill from '../media/media-progress-pill.vue';

const singleLoading = ref(false);

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

const scoreModeStrategy = computed(() => {
  if (props.single) {
    return props.single.getScoreMode();
  }
  return null;
});

const score = computed({
  get() {
    if (props.single && props.single.isAuthenticated() && scoreModeStrategy.value) {
      return scoreModeStrategy.value.valueToOptionValue(props.single.getAbsoluteScore()).toString();
    }
    return '';
  },
  set(value) {
    if (props.single && props.single.isAuthenticated() && scoreModeStrategy.value) {
      props.single.setAbsoluteScore(scoreModeStrategy.value.optionValueToValue(Number(value) || 0));
    }
  },
});

const scoreTextField = computed({
  get() {
    return !Number(score.value) ? '' : score.value;
  },
  set(value) {
    score.value = value || '0';
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

const progress = computed(() => {
  if (!props.single) return false;
  const progressEl = props.single.getProgress();
  if (!progressEl) return false;
  if (!progressEl.isAiring() || !progressEl.getCurrentEpisode()) return false;
  return progressEl;
});

async function update() {
  if (props.single) {
    singleLoading.value = true;
    await props.single.update();
    singleLoading.value = false;
  }
}

async function sync() {
  if (props.single) {
    singleLoading.value = true;
    await props.single.sync();
    await props.single.update();
    singleLoading.value = false;
  }
}

async function remove() {
  if (props.single) {
    singleLoading.value = true;
    await props.single.delete();
    singleLoading.value = false;
  }
}

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
    padding-bottom: 3px;
    min-height: 36px;
  }
  .progress-select {
    margin-bottom: @spacer-half;
    min-height: 60px;
  }
  .score-select {
    min-height: 60px;
  }
  .volume-select {
    margin-bottom: @spacer-half;
    min-height: 60px;
  }

  .form-section {
    margin-bottom: @spacer-half;
  }

  .update-buttons {
    display: flex;
    justify-content: space-around;
    text-align: center;
    align-items: center;

    .__breakpoint-desktop__({
      min-height: 48px;
    });

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
        color: var(--cl-primary-contrast);
        border: 2px solid var(--cl-primary);
        &:hover {
          border-color: var(--cl-primary-contrast);
        }
      }

      &:hover {
        background-color: var(--cl-primary);
        color: var(--cl-primary-contrast);
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
    padding-bottom: 5px;
  }

  .notOnList {
    opacity: 0.5;
    transition: opacity @fast-transition ease-in-out;
  }

  &:hover .notOnList {
    opacity: 1;
  }

  &.loading {
    .form-section,
    .update-buttons {
      .skeleton-text-block();
      * {
        visibility: hidden;
      }
    }
  }

  &.singleLoading {
    .form-section {
      pointer-events: none;
    }
    .update-buttons {
      .skeleton-text-block();
      * {
        visibility: hidden;
      }
    }
  }
}

.progress-picked {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
}

.increase {
  .click-move-down();
  .link();
  .block-select();
}
</style>
