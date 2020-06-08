<template>
  <div v-if="obj" class="entry">
    <a class="result" :href="obj.getDisplayUrl()" target="_blank" style="cursor: pointer;">
      <div class="image"><img v-if="image" :src="image" /></div>
      <div class="right">
        <span class="title">{{ obj.getTitle() }}</span>
        <p v-if="obj.isOnList()">{{ lang('UI_Status') }} {{ statusText(status) }}</p>
        <p v-if="obj.isOnList()">{{ lang('UI_Score') }} {{ score }}</p>
        <p v-if="obj.isOnList()">
          {{ utilsepisode(obj.getType()) }} {{ episode
          }}<span v-if="obj.getTotalEpisodes()" id="curEps">/{{ obj.getTotalEpisodes() }}</span
          ><span v-else>/?</span>
        </p>
      </div>
    </a>
  </div>
</template>

<script type="text/javascript">
export default {
  props: {
    obj: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      image: '',
    };
  },
  computed: {
    status: {
      get() {
        if (this.obj && this.obj.isAuthenticated()) {
          return this.obj.getStatus();
        }
        return null;
      },
      set(value) {
        if (this.obj && this.obj.isAuthenticated()) {
          this.obj.setStatus(value);
        }
      },
    },
    episode: {
      get() {
        if (this.obj && this.obj.isAuthenticated()) {
          if (!this.obj.isOnList()) return null;
          return this.obj.getEpisode();
        }
        return null;
      },
      set(value) {
        if (this.obj && this.obj.isAuthenticated()) {
          this.obj.setEpisode(value);
        }
      },
    },
    volume: {
      get() {
        if (this.obj && this.obj.isAuthenticated()) {
          if (!this.obj.isOnList()) return null;
          return this.obj.getVolume();
        }
        return null;
      },
      set(value) {
        if (this.obj && this.obj.isAuthenticated()) {
          this.obj.setVolume(value);
        }
      },
    },
    score: {
      get() {
        if (this.obj && this.obj.isAuthenticated()) {
          return this.obj.getDisplayScoreCheckbox();
        }
        return null;
      },
      set(value) {
        if (this.obj && this.obj.isAuthenticated()) {
          this.obj.setScore(value);
        }
      },
    },
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler(val, oldVal) {
        if (!val) return;
        if (!oldVal || oldVal.getUrl() !== val.getUrl()) {
          const tempUrl = val.getUrl();
          val.getImage().then(img => {
            if (this.obj && this.obj.getUrl() === tempUrl) {
              this.image = img;
            }
          });
        }
      },
    },
  },
  methods: {
    lang: api.storage.lang,
    utilsepisode: utils.episode,
    statusText(state) {
      switch (state) {
        case 1:
          return api.storage.lang(`UI_Status_watching_${this.obj.getType()}`);
        case 2:
          return api.storage.lang('UI_Status_Completed');
        case 3:
          return api.storage.lang('UI_Status_OnHold');
        case 4:
          return api.storage.lang('UI_Status_Dropped');
        case 6:
          return api.storage.lang(`UI_Status_planTo_${this.obj.getType()}`);
        case 23:
          return api.storage.lang(`UI_Status_Rewatching_${this.obj.getType()}`);
        default:
          return '';
      }
    },
  },
};
</script>
