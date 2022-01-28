<template>
  <div>
    <template v-if="scoreModeStrategy.ui.module === 'input'">
      <inputNumber
        :label="label"
        :value="modelValue"
        :pattern="scoreModeStrategy.ui.pattern"
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

<script type="text/javascript">
import inputDropdown from './input-dropdown.vue';
import inputNumber from './input-number.vue';

export default {
  components: {
    inputDropdown,
    inputNumber,
  },
  props: {
    value: {
      default: 0,
      type: Number,
    },
    scoreModeStrategy: {
      default: null,
      type: Object,
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
        if (this.modelValue !== newValue) this.modelValue = this.scoreModeStrategy.valueToOptionValue(newValue);
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
