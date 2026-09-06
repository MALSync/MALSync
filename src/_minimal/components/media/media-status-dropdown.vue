<template>
  <FormDropdown v-model="picked" :options="options" align-items="left">
    <template #select="slotProps">
      <FormButton :tabindex="-1" :animation="false" padding="pill">
        <StateDot :status="slotProps.value as number" :relative-height="true" />
        <span class="progress-text">{{ slotProps.currentTitle }}</span>
      </FormButton>
    </template>
    <template #option="slotProps">
      <StateDot :status="slotProps.option.value as number" />
      {{ slotProps.option.title }}
    </template>
  </FormDropdown>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, watch } from 'vue';
import FormDropdown from '../form/form-dropdown.vue';
import StateDot from '../state-dot.vue';
import FormButton from '../form/form-button.vue';
import { status } from '../../../_provider/definitions';

const props = defineProps({
  modelValue: {
    type: Number,
    require: true,
    default: null,
  },
  color: {
    type: String as PropType<'blue' | 'violet'>,
    default: 'blue',
  },
  rewatching: {
    type: Boolean,
    default: true,
  },
  considering: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'anime' | 'manga'>,
    default: 'anime',
  },
});

const options = computed(() => {
  const states = [
    status.All,
    status.Watching,
    status.Completed,
    status.Onhold,
    status.Dropped,
    status.PlanToWatch,
  ];
  if (props.considering) states.push(status.Considering);
  if (props.rewatching) states.push(status.Rewatching);
  return states.map(st => ({
    value: st,
    title: utils.getStatusText(props.type, st),
  }));
});

const emit = defineEmits(['update:modelValue']);

const picked = ref(props.modelValue);
watch(picked, value => {
  emit('update:modelValue', value);
});
watch(
  () => props.modelValue,
  value => {
    picked.value = value;
  },
);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

button {
  border-radius: 15px;
}

.__breakpoint-small__( {
  .progress-text {
    display: none;
  }
});
</style>
