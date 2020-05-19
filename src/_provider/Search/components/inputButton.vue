<template>
  <div class="inputButton">
    <div class="group">
      <input v-model="inputString" :type="type" required />
      <span class="bar"></span>
      <label>{{ label }}</label>
    </div>

    <button v-if="inputString !== state" @click="click">Update</button>
  </div>
</template>

<script type="text/javascript">
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
  data: function() {
    return {
      inputString: '',
    };
  },
  watch: {
    state: function(type) {
      this.inputString = this.state;
    },
    inputString: function(val) {
      this.$emit('change', this.inputString);
    },
  },
  mounted: function() {
    this.inputString = this.state;
  },
  methods: {
    lang: api.storage.lang,
    click: function() {
      this.$emit('clicked', this.inputString);
    },
  },
};
</script>
