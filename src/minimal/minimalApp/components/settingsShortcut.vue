<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
      <slot />
      <div v-show="Object.keys(value).length === 1">
        <tooltip tag-style="color: #8a1818; font-size: 20px; padding-bottom: 0;" icon-text="info">{{
          lang('settings_shortcut_tooltip')
        }}</tooltip>
      </div>
    </span>
    <span class="mdl-list__item-secondary-action">
      <div v-if="Object.keys(value).length" class="icon material-icons close-icon" @click="value = {}">
        close
      </div>
      <div class="mdl-textfield mdl-js-textfield">
        <input
          v-model="display"
          class="mdl-textfield__input"
          :class="{ rec: rec, tempRec: tempRec }"
          @keydown.prevent="keyDown($event)"
          @keyup="keyUp($event)"
          @blur="focusLost()"
        />
      </div>
    </span>
  </li>
</template>

<style lang="less" scoped>
.mdl-textfield__input {
  text-align: right;
  &:focus {
    border-bottom: 1px solid green;
  }
  &.rec {
    border-bottom: 1px solid red;
  }
  &.tempRec {
    border-bottom: 1px solid orange;
  }
}
.mdl-textfield {
  width: auto;
  padding: 0;
}
.close-icon {
  vertical-align: middle;
  margin-bottom: 3px;
  cursor: pointer;
}
.mdl-list__item-secondary-action {
  display: flex;
  align-items: center;
}
</style>

<script type="text/javascript">
import tooltip from './tooltip.vue';
import { keyboardMap } from './keyboardMap';

let tempKeysTimeout;
export default {
  components: {
    tooltip,
  },
  props: {
    option: {
      type: String,
    },
  },
  data() {
    return {
      keys: {},
      tempKeys: {},
    };
  },
  computed: {
    display() {
      if (this.tempRec)
        return Object.keys(this.tempKeys)
          .map(val => keyboardMap[val])
          .join(' + ');
      if (this.rec)
        return Object.keys(this.keys)
          .map(val => keyboardMap[val])
          .join(' + ');
      if (!this.value || !Object.keys(this.value).length) return this.lang('settings_Shortcuts_Click');
      return Object.keys(this.value)
        .map(val => keyboardMap[val])
        .join(' + ');
    },
    rec() {
      return Object.keys(this.keys).length;
    },
    tempRec() {
      return Object.keys(this.tempKeys).length;
    },
    value: {
      get() {
        const temp = api.settings.get(this.option);
        if (!temp || !temp.length) return {};

        const rv = {};
        for (let i = 0; i < temp.length; ++i) {
          rv[temp[i]] = temp[i];
        }
        return rv;
      },
      set(value) {
        api.settings.set(this.option, Object.keys(value));
      },
    },
  },
  methods: {
    lang: api.storage.lang,
    keyDown(event) {
      if (!this.keys[event.keyCode]) con.log(`down${event.keyCode}`);
      this.$set(this.keys, event.keyCode, keyboardMap[event.keyCode]);
      this.tempKeys = {};
    },
    keyUp(event) {
      con.log(`up${event.keyCode}`);
      this.setTempState(this.keys);
      this.$delete(this.keys, event.keyCode);
    },
    focusLost() {
      this.keys = {};
    },
    setTempState(state) {
      if (!Object.keys(this.tempKeys).length) {
        const tempState = { ...state };
        this.tempKeys = tempState;
        clearTimeout(tempKeysTimeout);
        tempKeysTimeout = setTimeout(() => {
          if (!Object.keys(this.keys).length) {
            this.value = tempState;
          }
          this.tempKeys = {};
        }, 500);
      }
    },
  },
};
</script>
