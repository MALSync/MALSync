<template>
  <div>
    <template v-if="scoreModeStrategy.ui.module === 'input'">
      input
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

export default {
  components: {
    inputDropdown,
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
