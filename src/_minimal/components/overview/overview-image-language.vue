<template>
  <div v-if="progress" class="progress">
    <FormDropdown v-model="state" :options="options" align-items="left">
      <template #select>
        <FormButton :tabindex="-1" :animation="false" padding="mini">
          <div class="btn">
            <span v-if="single?.getType() !== 'manga'" class="material-icons icon-type">
              subtitles
            </span>
            <span class="text"> EN </span>
          </div>
        </FormButton>
      </template>
      <template #option="slotProps">
        <div class="entry">
          <span v-if="single?.getType() !== 'manga'" class="material-icons">
            {{ slotProps.option.meta.type === 'sub' ? 'subtitles' : 'record_voice_over' }}
          </span>
          <span class="episode">
            {{ single?.getType() === 'manga' ? 'CH' : 'EP' }}
            {{ slotProps.option.meta.episode }}
          </span>
          <span>{{ slotProps.option.meta.label }}</span>
          <span v-if="slotProps.option.meta.dropped" class="material-icons" title="Dropped"
            >warning</span
          >
        </div>
      </template>
    </FormDropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import FormDropdown from '../form/form-dropdown.vue';
import FormButton from '../form/form-button.vue';

const props = defineProps({
  single: {
    type: Object as PropType<SingleAbstract | null>,
    default: null,
  },
});

const state = ref(0);

const progress = computed(() => {
  if (!props.single) return false;
  const progressEl = props.single.getProgress();
  if (!progressEl) return false;
  if (!progressEl.isAiring() || !progressEl.getCurrentEpisode()) return false;
  return progressEl;
});

const options = computed(() => {
  if (!props.single) return [];
  return props.single.getProgressOptions().map(option => ({
    title: option.label,
    value: option.key,
    meta: option,
  }));
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.episode {
  .border-radius-small();

  background-color: var(--cl-primary);
  color: white;
  font-size: 14px;
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
