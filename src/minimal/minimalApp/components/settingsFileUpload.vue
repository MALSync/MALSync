<template>
  <span>
    <button v-if="button" @click="buttonClick()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"><slot/></button>
    <input v-else type="file" v-on:change="handleFileUpload($event)" />
  </span>
</template>

<script type="text/javascript">
  export default {
    props: {
      button: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      buttonClick(){
        this.button = false;
      },
      handleFileUpload(event){
        con.log('File Found', event);

        if(!window.FileReader) {
          alert('Browser is not compatible')
          return;
        }

        var reader = new FileReader();

        reader.onload = (evt) => {
          if(evt.target.readyState != 2) return;
          if(evt.target.error) {
              alert('Error while reading file');
              return;
          }

          var filecontent = evt.target.result;

          this.$emit('upload', filecontent);

        };

        reader.readAsText(event.target.files[0]);
      }
    }
  }
</script>
