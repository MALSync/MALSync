<template>
  <div class="form progress">
    <div class="input-title">{{ label }}</div>
    <div class="ms-input-wrapper">
      <div class="el-input-number is-controls-right">
        <span
          role="button"
          class="el-input-number__decrease ms-button"
          @click="decrease()"
          v-show="value"
        >
          <i class="el-icon-arrow-down"></i>
        </span>
        <span
          role="button"
          class="el-input-number__increase ms-button"
          @click="increase()"
          v-show="!(total && value === total)"
        >
          <i class="el-icon-arrow-up"></i>
        </span>
        <div class="el-input">
          <input
            v-model="modelValue"
            type="text"
            autocomplete="off"
            class="el-input__inner"
            :pattern="pattern"
          />
        </div>
      </div>
      <div v-if="additionalSlot || total" class="ms-input-ep">
        <template v-if="total"> / <slot /> {{ total }} </template>
        <template v-else> <slot /> </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    value: {
      default: 0,
      type: Number,
    },
    total: {
      default: 0,
      type: Number,
    },
    label: {
      default: '',
      type: String,
    },
    pattern: {
      default: '^[0-9]*$',
      type: String,
    },
    additionalSlot: {
      default: false,
      type: Boolean,
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
      handler(newValue, oldValue) {
        if (!newValue || String(newValue).match(new RegExp(this.pattern))) {
          this.$emit('update:value', Number(newValue));
        } else {
          this.modelValue = oldValue;
        }
      },
    },
  },
  methods: {
    increase() {
      if (!this.total || this.modelValue < this.total)
        this.modelValue = Math.floor(this.modelValue + 1);
    },
    decrease() {
      if (this.modelValue > 0) this.modelValue = Math.ceil(this.modelValue - 1);
    },
  },
};
</script>

<style lang="less" scoped></style>
