<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
      <slot/>
      <div v-show="Object.keys(value).length === 1">
        <tooltip tagStyle="color: #8a1818; font-size: 20px; padding-bottom: 0;" iconText="info">{{lang("settings_shortcut_tooltip")}}</tooltip>
      </div>
    </span>
    <span class="mdl-list__item-secondary-action">
      <div class="icon material-icons close-icon" @click="value = {}" v-if="Object.keys(value).length">
        close
      </div>
      <div class="mdl-textfield mdl-js-textfield" >
        <input
          class="mdl-textfield__input"
          v-bind:class="{ rec: rec, tempRec: tempRec }"
          v-model="display"
          @keydown.prevent="keyDown($event)"
          @keyup="keyUp($event)"
          v-on:blur="focusLost()"
        >
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
  import tooltip from './tooltip.vue'
  import {keyboardMap} from './keyboardMap'

  var tempKeysTimeout;
  export default {
    components: {
      tooltip: tooltip,
    },
    data: function(){
      return{
        keys: {},
        tempKeys: {},
      }
    },
    props: {
      option: {
        type: String
      }
    },
    computed: {
      display() {
        if(this.tempRec) return Object.keys(this.tempKeys).map(val => keyboardMap[val]).join(' + ');
        if(this.rec) return Object.keys(this.keys).map(val => keyboardMap[val]).join(' + ');
        if(!this.value || !Object.keys(this.value).length) return this.lang('settings_Shortcuts_Click');
        return Object.keys(this.value).map(val => keyboardMap[val]).join(' + ');
      },
      rec() {
        return Object.keys(this.keys).length;
      },
      tempRec() {
        return Object.keys(this.tempKeys).length;
      },
      value: {
        get: function () {
          var temp = api.settings.get(this.option);
          if(!temp || !temp.length) return {};

          var rv = {};
          for (var i = 0; i < temp.length; ++i){
            rv[temp[i]] = temp[i];
          }
          return rv;
        },
        set: function (value) {
          api.settings.set(this.option, Object.keys(value));
        }
      },
    },
    methods: {
      lang: api.storage.lang,
      keyDown(event) {
        if(!this.keys[event.keyCode])con.log('down'+event.keyCode);
        this.$set(this.keys, event.keyCode, keyboardMap[event.keyCode]);
        this.tempKeys = {};
      },
      keyUp(event) {
        con.log('up'+event.keyCode);
        this.setTempState(this.keys);
        this.$delete(this.keys, event.keyCode);
      },
      focusLost() {
        this.keys = {};
      },
      setTempState(state) {
        if(!Object.keys(this.tempKeys).length) {
          var tempState = Object.assign({}, state);
          this.tempKeys = tempState;
          clearTimeout(tempKeysTimeout);
          tempKeysTimeout = setTimeout(() => {
            if(!Object.keys(this.keys).length) {
              this.value = tempState;
            }
            this.tempKeys = {};
          }, 500)
        }

      }
    }
  }

</script>
