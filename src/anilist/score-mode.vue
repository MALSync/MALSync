<template>
  <div v-if="scoreModeStrategy">
    <template v-if="scoreModeStrategy.ui.module === 'input'">
      <inputNumber
        :label="label"
        :value="modelValue"
        :pattern="scoreModeStrategy.ui.pattern"
        @update:value="modelValue = $event"
      />
    </template>
    <template v-else-if="scoreModeStrategy.ui.module === 'click'">
      <inputClicker
        :label="label"
        :options="scoreModeStrategy.getOptions()"
        :value="modelValue"
        :type="scoreModeStrategy.ui.type"
        @update:value="modelValue = $event"
      />
    </template>
    <template v-else>
      <inputDropdown
        :label="label"
        :options="scoreModeStrategy.getOptions()"
        :value="modelValue"
        @update:value="modelValue = $event"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import inputDropdown from './input-dropdown.vue';
import inputNumber from './input-number.vue';
import inputClicker from './input-clicker.vue';
import { ScoreModeStrategy } from '../_provider/ScoreMode/ScoreModeStrategy';

export default {
  components: {
    inputDropdown,
    inputNumber,
    inputClicker,
  },
  props: {
    value: {
      default: 0,
      type: Number,
    },
    scoreModeStrategy: {
      default: null,
      type: Object as PropType<ScoreModeStrategy | null>,
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
        if (this.modelValue !== newValue)
          this.modelValue = this.scoreModeStrategy.valueToOptionValue(newValue);
      },
      immediate: true,
    },
    modelValue: {
      handler(newValue) {
        this.$emit('update:value', this.scoreModeStrategy.optionValueToValue(newValue));
      },
    },
  },
};
</script>
