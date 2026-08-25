<template>
  <div class="inputButton">
    <div class="group">
      <input v-model="inputString" :type="type" required />
      <span class="bar"></span>
      <label>{{ label }}</label>
    </div>

    <button v-if="inputString !== state || dirty" @click="click" :class="{disabled: inputString === state}">Update</button>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    state: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      inputString: '',
      dirty: false,
    };
  },
  watch: {
    state() {
      this.inputString = this.state;
      this.$emit('changed', this.inputString);
    },
    inputString() {
      if (this.inputString !== this.state) {
        this.dirty = true;
      }
    },
  },
  mounted() {
    this.inputString = this.state;
  },
  methods: {
    lang: api.storage.lang,
    click() {
      this.$emit('clicked', this.inputString);
    },
  },
};
</script>

<style lang="less" scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
