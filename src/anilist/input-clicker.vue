<template>
  <div class="form progress">
    <div class="input-title">{{ label }}</div>
    <div class="ms-input-wrapper">
      <div class="el-select">
        <div v-if="type === 'star'" class="star-score-wrap" :class="'stars-' + fillNumber">
          <div class="el-rate">
            <span
              v-for="i in options.slice().reverse()"
              v-show="i.value"
              :key="i.value"
              class="el-rate__item"
              @click="updateValue(i.value)"
              @mouseover="hover(i.value)"
              @mouseout="hover(null)"
            >
              <i
                class="el-rate__icon"
                :data-value="i.value"
                :class="{
                  'el-icon-star-on': i.value <= fillNumber,
                  'el-icon-star-off': i.value > fillNumber,
                  hover: i.value === hoverValue,
                }"
              ></i>
            </span>
          </div>
        </div>

        <div v-else-if="type === 'smiley'" class="smile-score-wrap">
          <div class="el-rate">
            <span
              v-for="i in options.slice().reverse()"
              v-show="i.value"
              :key="i.value"
              class="el-rate__items"
              @click="updateValue(i.value)"
              @mouseover="hover(i.value)"
              @mouseout="hover(null)"
            >
              <div
                class="el-rate__icon"
                :data-value="i.value"
                :class="{
                  'smiley-off': i.value != fillNumber,
                  hover: i.value === hoverValue,
                }"
              >
                {{ i.label }}
              </div>
            </span>
          </div>
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
    type: {
      default: 'star',
      type: String,
    },
  },
  emits: ['update:value'],
  data: () => ({
    modelValue: 0,
    hoverValue: null,
  }),
  computed: {
    fillNumber() {
      if (this.hoverValue) return this.hoverValue;
      return this.modelValue;
    },
  },
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
  methods: {
    updateValue(value) {
      if (value === this.modelValue) {
        this.modelValue = 0;
        return;
      }
      this.modelValue = value;
    },
    hover(item) {
      this.hoverValue = item;
    },
  },
};
</script>

<style lang="less" scoped>
.el-rate__icon {
  &:hover {
    cursor: pointer;
  }
}
.stars-50 .el-rate__icon {
  color: rgb(247 186 42);
}

.stars-70 .el-rate__icon,
.stars-90 .el-rate__icon {
  color: rgb(255 153 0);
}

.smiley-off {
  filter: grayscale(100%);
}
</style>
