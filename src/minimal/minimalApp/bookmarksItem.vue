<template>
  <div
    v-if="!listView"
    :title="item.fn.progress && item.fn.progress.getAutoText()"
    class="mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid bookEntry"
    style="position: relative; padding: 0; width: 210px; height: 293px;"
  >
    <div class="data title" style=" background-color: #cdcdcd; width: 100%; position: relative; padding-top: 5px;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden;">
        <clazy-load
          :src="imageHi"
          margin="200px 0px"
          :threshold="0.1"
          :ratio="0.1"
          style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden;"
          @error="setQuestionmark"
        >
          <img :src="imageHi" width="100%" @error="setQuestionmark" />
        </clazy-load>
      </div>

      <div
        v-if="item.fn.progress && item.fn.progress.isAiring()"
        class="mdl-shadow--2dp"
        style=" position: absolute; top: 0; right: 0; background-color: rgba(255, 255, 255, 0.9); padding: 0 5px; margin: 5px 0; text-align: center;"
      >
        {{ item.fn.progress.getAuto() }}
      </div>

      <div
        v-if="item.score"
        style=" position: absolute; top: 0; left: 0; padding: 0 5px; margin: 5px 0; text-align: center;"
      >
        <div style="width: 38px; height: 38px; position: relative;">
          <i class="material-icons" style="color: #3f51b5; position: absolute; left: 0; top: 0; font-size: 38px;"
            >star</i
          >
          <div
            style="color: white; position: absolute; left: 0; top: 0; right: 0; bottom: 0; text-align: center; line-height: 38px;padding-top: 1px;"
          >
            {{ item.score }}
          </div>
        </div>
      </div>

      <a :href="item.url" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></a>
      <span
        class="mdl-shadow--2dp"
        style="position: absolute; bottom: 0; display: block; background-color: rgba(255, 255, 255, 0.9); padding-top: 5px; align-items: center; justify-content: space-between; left: 0; right: 0; padding-right: 8px; padding-left: 8px; padding-bottom: 8px;"
      >
        <a :href="item.url" style="color: black; text-decoration: none;">
          {{ item.title }}
        </a>
        <div id="p1" class="mdl-progress pr-bar" style="position: absolute; top: -4px; left: 0;">
          <div class="progressbar bar bar1" :style="progress"></div>
          <div v-if="hasTotalEp" class="bufferbar bar bar2" style="width: calc(100% + 1px);"></div>
          <div
            v-if="item.fn.progress && item.fn.progress.isAiring()"
            class="predictionbar bar kal-ep-pre"
            :style="predictionBar"
          >
            <div
              v-if="barData.predWidth && barData.predWidth !== 100 && barData.predWidth <= barData.epWidth"
              class="bar-tab"
            >
              <i class="material-icons">arrow_drop_up</i>
            </div>
          </div>
          <div class="auxbar bar bar3" style="width: 0%;"></div>
        </div>
        <div
          class="data progress mdl-chip mdl-chip--contact mdl-color--indigo-100"
          style="float: right; line-height: 20px; height: 20px; padding-right: 4px; margin-left: 5px;"
        >
          <div
            class="link mdl-chip__contact mdl-color--primary mdl-color-text--white"
            style="line-height: 20px; height: 20px; margin-right: 0;"
            :title="'[' + item.watchedEp + '/' + item.totalEp + ']'"
          >
            {{ item.watchedEp }}
          </div>
          <a
            v-if="streamUrl"
            class="mal-sync-stream"
            :title="streamUrl.split('/')[2]"
            target="_blank"
            style="margin: 0 5px;"
            :href="streamUrl"
          >
            <img :src="favicon(streamUrl.split('/')[2])" />
          </a>
          <a
            v-if="continueUrl"
            class="nextStream"
            :title="lang('overview_Continue_' + item.type)"
            target="_blank"
            style="margin: 0 5px 0 0; color: #BABABA;"
            :href="continueUrl"
          >
            <img :src="assetUrl('double-arrow-16px.png')" width="16" height="16" />
          </a>
          <a
            v-if="resumeUrl"
            class="resumeStream"
            :title="lang('overview_Resume_Episode_' + item.type)"
            target="_blank"
            style="margin: 0 5px 0 0; color: #BABABA;"
            :href="resumeUrl"
          >
            <img :src="assetUrl('arrow-16px.png')" width="16" height="16" />
          </a>
        </div>
      </span>
    </div>
  </div>
  <tr v-else style="cursor: pointer;" @click="openLink(item.url)">
    <td style="width: 64px;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: -1px; overflow: hidden;" class="imageTd">
        <clazy-load :src="imageHi" margin="200px 0px" :threshold="0.1" :ratio="0.1" @error="setQuestionmark">
          <img :src="imageHi" width="100%" @error="setQuestionmark" />
        </clazy-load>
      </div>
    </td>
    <td
      class="mdl-data-table__cell--non-numeric"
      style="white-space: normal; position: relative; padding-left: 10px; padding-right: 28px;"
    >
      <div
        v-if="item.fn.progress && item.fn.progress.isAiring()"
        style="position: absolute; top: 0; left: 0; padding: 0 11px; margin: 0 0; text-align: center;     font-size: 10px;"
      >
        {{ item.fn.progress.getAuto() }}
      </div>
      <span style="font-weight: bold;">{{ item.title }}</span>

      <a
        v-if="streamUrl"
        class="mal-sync-stream"
        :title="streamUrl.split('/')[2]"
        target="_blank"
        style="margin: 0 5px; position: absolute; right: 0; top: 0;"
        :href="streamUrl"
      >
        <img :src="favicon(streamUrl.split('/')[2])" />
      </a>
      <a
        v-if="continueUrl"
        class="nextStream"
        :title="lang('overview_Continue_' + item.type)"
        target="_blank"
        style="margin: 0 5px 0 0; color: #BABABA;position: absolute; right: 0; top: 20px;"
        :href="continueUrl"
      >
        <img :src="assetUrl('double-arrow-16px.png')" width="16" height="16" />
      </a>
      <a
        v-if="resumeUrl"
        class="resumeStream"
        :title="lang('overview_Resume_Episode_' + item.type)"
        target="_blank"
        style="margin: 0 5px 0 0; color: #BABABA; position: absolute; right: 0; top: 20px;"
        :href="resumeUrl"
      >
        <img :src="assetUrl('arrow-16px.png')" width="16" height="16" />
      </a>

      <div
        id="p1"
        class="mdl-progress pr-bar"
        style="position: absolute; bottom: 0; left: 0; right: 0; width: auto; opacity: 0.5;"
      >
        <div class="progressbar bar bar1" :style="progress"></div>
        <div v-if="hasTotalEp" class="bufferbar bar bar2" style="width: calc(100% + 1px);"></div>
        <div
          v-if="item.fn.progress && item.fn.progress.isAiring()"
          class="predictionbar bar kal-ep-pre"
          :style="predictionBar"
        >
          <div
            v-if="barData.predWidth && barData.predWidth !== '100' && barData.predWidth <= barData.epWidth"
            class="bar-tab"
          >
            <i class="material-icons">arrow_drop_up</i>
          </div>
        </div>
        <div class="auxbar bar bar3" style="width: 0%;"></div>
      </div>
    </td>
    <td style="width: 70px;">
      {{ item.watchedEp }}/<template v-if="item.totalEp">{{ item.totalEp }}</template>
      <template v-else>?</template>
    </td>
    <td style="width: 57px;">
      <template v-if="item.score">{{ item.score }}</template>
      <template v-else>-</template>
    </td>
  </tr>
</template>

<script type="text/javascript">
export default {
  props: {
    item: {
      type: Object,
    },
    listView: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resumeUrl: null,
      continueUrl: null,
    };
  },
  computed: {
    curEP() {
      return parseInt(this.item.watchedEp.toString());
    },
    imageHi() {
      let imageHi = this.item.image;
      const regexDimensions = /\/r\/\d*x\d*/g;
      if (regexDimensions.test(imageHi)) {
        imageHi = imageHi.replace(/v.jpg$/g, '.jpg').replace(regexDimensions, '');
      }
      return imageHi;
    },
    hasTotalEp() {
      return this.barData.totalWidth;
    },
    barData() {
      if (!this.item.fn.progress) return {};
      return this.item.fn.progress.getBars(this.item.watchedEp, this.item.totalEp);
    },
    progress() {
      return `width: ${this.barData.epWidth}%; max-width: 100%;`;
    },
    predictionBar() {
      const color = this.item.fn.progress.getColor();
      return `width: ${this.barData.predWidth}%; background-color: ${color}; color: ${color};`;
    },
    streamUrl() {
      return this.item.options.u;
    },
  },
  watch: {
    curEP: {
      immediate: true,
      async handler(ep) {
        if (typeof this.item.resume === 'undefined') {
          this.resumeUrl = '';
          this.continueUrl = '';
          let resumeUrl = null;
          let continueUrl = null;
          const resumeUrlObj = this.item.options.r;
          const continueUrlObj = this.item.options.c;

          if (continueUrlObj && continueUrlObj.ep === ep + 1) {
            continueUrl = continueUrlObj.url;
          } else if (resumeUrlObj && resumeUrlObj.ep === ep) {
            resumeUrl = resumeUrlObj.url;
          }
          this.resumeUrl = resumeUrl;
          this.continueUrl = continueUrl;
        }
      },
    },
  },
  methods: {
    lang: api.storage.lang,
    favicon(domain) {
      return utils.favicon(domain);
    },
    assetUrl(asset) {
      return api.storage.assetUrl(asset);
    },
    openLink(url) {
      const link = document.createElement('a');
      link.href = url;
      document.getElementById('malList').appendChild(link);
      link.click();
    },
    setQuestionmark(e) {
      e.target.src = api.storage.assetUrl('questionmark.gif');
    },
  },
};
</script>
