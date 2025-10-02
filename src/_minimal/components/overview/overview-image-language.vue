<template>
  <div v-if="single && options.length > 2" class="progress">
    <FormDropdown v-model="state" :options="options" align-items="left">
      <template #select>
        <FormButton :tabindex="-1" :animation="false" padding="mini">
          <div class="btn" :title="single.getProgressKey()?.key">
            <template v-if="single.getProgressKey()">
              <span v-if="single.getType() !== 'manga'" class="material-icons icon-type">
                {{ single.getProgressKey()?.type === 'sub' ? 'subtitles' : 'record_voice_over' }}
              </span>
              <span class="text">
                {{ single.getProgressKey()?.lang.toUpperCase() }}
              </span>
            </template>
            <template v-else> {{ lang('settings_Interval_Off').toUpperCase() }} </template>
          </div>
        </FormButton>
      </template>
      <template #option="slotProps">
        <div v-if="slotProps.option.meta" class="entry" :title="slotProps.option.meta.key">
          <span v-if="single.getType() !== 'manga'" class="material-icons">
            {{ slotProps.option.meta.type === 'sub' ? 'subtitles' : 'record_voice_over' }}
          </span>
          <span class="episode">
            {{ single.getType() === 'manga' ? 'CH' : 'EP' }}
            {{ slotProps.option.meta.episode }}
          </span>
          <span>{{ slotProps.option.meta.label }}</span>
          <span v-if="slotProps.option.meta.dropped" class="material-icons" title="Dropped"
            >warning</span
          >
        </div>
        <div v-else>{{ slotProps.option.title }}</div>
      </template>
    </FormDropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import FormDropdown from '../form/form-dropdown.vue';
import FormButton from '../form/form-button.vue';

const props = defineProps({
  single: {
    type: Object as PropType<SingleAbstract | null>,
    default: null,
  },
});

const state = computed({
  get() {
    if (!props.single) return '';
    return props.single.getProgressMode();
  },
  set(value) {
    if (props.single) props.single.setProgressMode(value);
  },
});

const options = computed(() => {
  if (!props.single) return [];

  const optionsArray = [
    { title: api.storage.lang('settings_progress_default'), value: '' },
    ...props.single.getProgressOptions().map(option => ({
      title: option.label,
      value: option.key,
      meta: option,
    })),
    { title: api.storage.lang('settings_progress_disabled'), value: 'off' },
  ];

  return optionsArray;
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.episode {
  .border-radius-small();

  background-color: var(--cl-primary);
  color: var(--cl-primary-contrast);
  font-size: @small-text;
  padding: 2px 5px;
}

.entry {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  display: flex;
  gap: 5px;
}

.icon-type {
  line-height: 0;
  transform: translateY(50%);
}
</style>
