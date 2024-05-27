<template>
  <SettingsGeneral
    :title="title"
    :option="option"
    component="dropdown"
    :props="{ options: options }"
  />
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { getProgressTypeList } from '../../../background/releaseProgressUtils';
import SettingsGeneral from './settings-general.vue';

const properties = defineProps({
  title: {
    type: [String, Function],
    required: true,
  },
  option: {
    type: String,
    required: false,
    default: null,
  },
  type: {
    type: String as PropType<'anime' | 'manga'>,
    default: 'anime',
  },
});

const options = ref([] as any[]);

getProgressTypeList(properties.type).then(el => {
  options.value = el.map(item => ({
    value: item.key,
    title: item.label,
  }));
});
</script>

<style lang="less" scoped></style>
