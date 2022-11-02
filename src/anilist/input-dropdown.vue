<template>
  <div class="form progress">
    <div class="input-title">{{ label }}</div>
    <div class="ms-input-wrapper">
      <div class="el-select">
        <div class="el-input el-input--suffix">
          <select v-model="modelValue" autocomplete="off" class="el-input__inner">
            <option v-for="i in options" :key="i.value" :value="i.value">{{ i.label }}</option>
          </select>

          <span class="el-input__suffix">
            <span class="el-input__suffix-inner">
              <i class="el-select__caret el-input__icon el-icon-arrow-up"> </i>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { ScoreOption } from '../_provider/ScoreMode/ScoreModeStrategy';

export default {
  props: {
    value: {
      default: 0,
      type: Number,
    },
    options: {
      default() {
        return [];
      },
      type: Array as PropType<ScoreOption[]>,
    },
    label: {
      default: '',
      type: String,
    },
  },
  emits: ['update:value'],
  data: () => ({
    modelValue: 0,
  }),
  watch: {
    value: {
      handler(newValue) {
        if (this.modelValue !== newValue) this.modelValue = newValue;
      },
      immediate: true,
    },
    modelValue: {
      handler(newValue) {
        this.$emit('update:value', Number(newValue));
      },
    },
  },
};
</script>

<style lang="less" scoped></style>
