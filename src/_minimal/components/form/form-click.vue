<template>
  <div class="form-click">
    <div v-if="type === 'star'" class="star-score-wrap">
      <div class="el-rate">
        <span
          v-for="i in options.slice().reverse()"
          v-show="i.value"
          :key="i.value"
          class="el-rate__item"
          :class="{ active: i.value <= picked, hoverActive: (i.value as number) <= hoverValue }"
          @click="Number(picked) !== Number(i.value) ? (picked = i.value) : (picked = 0)"
          @mouseover="hoverValue = Number(i.value)"
          @mouseout="hoverValue = 0"
        >
          {{ i.value <= picked || (i.value as number) <= hoverValue ? '★' : '☆' }}
        </span>
      </div>
    </div>

    <div v-else-if="type === 'smiley'" class="smile-score-wrap">
      <div class="el-rate">
        <span
          v-for="i in options.slice().reverse()"
          v-show="i.value"
          :key="i.value"
          class="el-rate__item"
          :class="{ active: i.value == picked && !hoverValue, hoverActive: i.value == hoverValue }"
          @click="Number(picked) !== Number(i.value) ? (picked = i.value) : (picked = 0)"
          @mouseover="hoverValue = Number(i.value)"
          @mouseout="hoverValue = 0"
        >
          {{ i.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';

interface Option {
  value: string | number;
  title?: string;
  label?: string;
  meta?: any;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  type: {
    type: String as PropType<'star' | 'smiley'>,
    default: 'star',
  },
  modelValue: {
    type: [String, Number],
    require: true,
    default: '',
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const picked = ref(props.modelValue);
const hoverValue = ref(0);

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

.form-click {
  .el-rate__item {
    .link();

    font-size: 20px;
    display: inline-block;
  }

  .star-score-wrap {
    margin-left: 5px;

    .el-rate__item {
      &.hoverActive {
        color: var(--cl-primary);
      }
    }
  }

  .smile-score-wrap {
    .el-rate__item {
      filter: grayscale(100%);
      transition: transform @fast-transition ease, filter @fast-transition ease;
      transform: scale(1);

      &.active,
      &.hoverActive {
        filter: grayscale(0%);
      }
      &:hover {
        transform: scale(1.2);
      }
    }
  }
}
</style>
