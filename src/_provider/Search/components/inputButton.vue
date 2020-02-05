<template>
  <div class="inputButton">
    <input v-model="inputString">
    <button v-if="inputString !== state" @click="click">Update</button>
  </div>
</template>

<script type="text/javascript">
  export default {
    data: function(){
      return {
        inputString: ''
      }
    },
    props: {
      state: {
        type: String,
        default: ''
      },
    },
    mounted: function(){
      this.inputString = this.state;
    },
    watch: {
      state: function(type){
        this.inputString = this.state;
      },
    },
    methods: {
      lang: api.storage.lang,
      click: function() {
        this.$emit('clicked', this.inputString);
      }
    }
  }
</script>
