<template>
  <span>
    <button
      v-if="button"
      class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
      @click="buttonClick()"
    >
      <slot />
    </button>
    <template v-else>
      <input type="file" @change="handleFileUpload($event)" />
      <p v-if="type() == 'webextension'" class="info">
        If you have problems please retry in
        <a href="#" @click="openWindow($event)">this window</a>
      </p>
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
  data() {
    return {
      button: true,
    };
  },
  methods: {
    type() {
      return api.type;
    },
    buttonClick() {
      this.button = false;
    },
    handleFileUpload(event) {
      con.log('File Found', event);

      if (!window.FileReader) {
        alert('Browser is not compatible');
        return;
      }

      const reader = new FileReader();

      reader.onload = evt => {
        if (evt.target.readyState !== 2) return;
        if (evt.target.error) {
          alert('Error while reading file');
          return;
        }

        const filecontent = evt.target.result;

        this.$emit('upload', filecontent);
      };

      reader.readAsText(event.target.files[0]);
    },
    openWindow(e) {
      e.preventDefault();
      e.stopPropagation();
      const win = window.open(chrome.extension.getURL('window.html'), '_blank');
      if (win) {
        win.focus();
      } else {
        alert(api.storage.lang('minimalClass_Popup'));
      }
    },
  },
};
</script>
