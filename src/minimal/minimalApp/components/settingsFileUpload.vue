<template>
  <span>
    <button v-if="button" @click="buttonClick()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"><slot/></button>
    <template v-else>
      <input type="file" v-on:change="handleFileUpload($event)" />
      <p class="info" v-if="type() == 'webextension'">If you have problems please retry in <a @click="openWindow($event)" href="#">this window</a></p>
    </template>

  </span>
</template>

<style lang="less" scoped>
  .info {
    height: 0;
    padding: 0;
    margin: 0;
  }
</style>

<script type="text/javascript">
  export default {
    props: {
      button: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      type(){
        return api.type;
      },
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
      },
      openWindow(e){
        e.preventDefault();
        e.stopPropagation();
        var win = window.open(chrome.extension.getURL('window.html'), '_blank');
        if (win) {
            win.focus();
        } else {
            alert(api.storage.lang("minimalClass_Popup"));
        }
      }
    }
  }
</script>
