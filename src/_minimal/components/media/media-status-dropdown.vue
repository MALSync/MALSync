<template>
  <FormDropdown v-model="picked" :options="options" align-items="left">
    <template #select="slotProps">
      <FormButton :tabindex="-1" :animation="false" padding="pill">
        <StateDot :status="(slotProps.value as number)" /> {{ slotProps.currentTitle }}
      </FormButton>
    </template>
    <template #option="slotProps">
      <StateDot :status="(slotProps.option.value as number)" />
      {{ slotProps.option.title }}
    </template>
  </FormDropdown>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import FormDropdown from '../form/form-dropdown.vue';
import { status as state } from '../../../_provider/definitions';
import StateDot from '../state-dot.vue';
import FormButton from '../form/form-button.vue';

const states = [7, 1, 2, 3, 4, 6, 23];

const options = states.map(st => ({
  value: st,
  title: state[st] as string,
}));

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
