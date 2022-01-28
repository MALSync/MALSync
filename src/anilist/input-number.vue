<template>

  <div class="form progress">
    <div class="input-title">{{ label }}</div>
    <div class="ms-input-wrapper">
      <div class="el-input-number is-controls-right">
        <span role="button" class="el-input-number__decrease ms-button" @click="decrease()" v-show="value">
          <i class="el-icon-arrow-down"></i>
        </span>
        <span role="button" class="el-input-number__increase ms-button" @click="increase()" v-show="!(total && value === total)">
          <i class="el-icon-arrow-up"></i>
        </span>
        <div class="el-input">
          <input v-model="modelValue" type="text" autocomplete="off" class="el-input__inner" />
        </div>
      </div>
      <div v-if="total" class="ms-input-ep">/ {{ total }}</div>
    </div>
  </div>

</template>

<script type="text/javascript">
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
  methods: {
    increase() {
      if (!this.total || this.modelValue < this.total) this.modelValue++;
    },
    decrease() {
      if (this.modelValue > 0) this.modelValue--;
    },
  },
};
</script>

<style lang="less" scoped>
</style>
