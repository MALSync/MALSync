<template>
  <div v-if="country" class="flagIcon mdl-shadow--2dp" :title="text">
    <div v-if="flagHtml" v-dompurify-html="flagHtml" class="flagflag"></div>
    <div v-else class="flagCountry">{{ country }}</div>
    <div v-if="text !== 'SUB'" class="flagText">{{ text }}</div>
  </div>
</template>

<script>
import { Cache } from '../../../utils/Cache';

export default {
  props: {
    country: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      flagHtml: '',
    };
  },
  watch: {
    country: {
      immediate: true,
      async handler(newVal) {
        const cache = new Cache(`flag/${newVal}`, 48 * 60 * 60 * 1000);
        if (await cache.hasValue()) {
          // eslint-disable-next-line no-return-assign
          cache.getValue().then(val => (this.flagHtml = val));
        } else {
          api.request
            .xhr('GET', `https://raw.githubusercontent.com/lipis/flag-icon-css/master/flags/4x3/${newVal}.svg`)
            .then(response => {
              if (response.responseText && response.status === 200) {
                this.flagHtml = response.responseText;
                cache.setValue(response.responseText);
              } else {
                cache.setValue(null);
              }
            });
        }
      },
    },
  },
};
</script>

<style lang="less" scoped></style>
