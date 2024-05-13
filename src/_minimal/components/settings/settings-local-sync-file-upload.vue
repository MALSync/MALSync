<template>
  <span>
    <FormButton v-if="button" color="primary" @click="buttonClick()">
      <slot />
    </FormButton>
    <template v-else>
      <Card>
        <input type="file" @change="handleFileUpload($event)" />
        <p v-if="type() == 'webextension'" class="info">
          {{ lang('settings_LocalSync_Help_Before') }}
          <a style="text-decoration: underline" href="#" @click="openWindow($event)">
            {{ lang('settings_LocalSync_Help_LinkText') }}
          </a>
          {{ lang('settings_LocalSync_Help_After') }}
        </p>
      </Card>
    </template>
  </span>
</template>

<style lang="less" scoped>
.info {
  padding: 0;
  margin: 0;
  margin-top: 10px;
  width: 250px;
}
</style>

<script lang="ts">
import FormButton from '../form/form-button.vue';
import Card from '../card.vue';

export default {
  components: { FormButton, Card },
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
        if (evt.target!.readyState !== 2) return;
        if (evt.target!.error) {
          alert('Error while reading file');
          return;
        }
        const filecontent = evt.target!.result;
        this.$emit('upload', filecontent);
      };
      reader.readAsText(event.target.files[0]);
    },
    openWindow(e) {
      e.preventDefault();
      e.stopPropagation();
      const win = window.open(chrome.runtime.getURL('window.html'), '_blank');
      if (win) {
        win.focus();
      } else {
        alert(api.storage.lang('minimalClass_Popup'));
      }
    },
  },
};
</script>
