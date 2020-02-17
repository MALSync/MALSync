<template>
  <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" :style="wrong? 'border: 1px solid red;': ''">
    <div class="mdl-cell" style="width: 100%;">
      The correction functionality was moved into a seperate popup for faster and better integeration. You can access it <template v-if="keys">with the shortcut '{{keys}}' or</template> by clicking <a @click.stop="openPopup">here</a>.
    </div>


  </div>
</template>

<script type="text/javascript">
  import {keyboardMap} from './components/keyboardMap'

  export default {
    props: {
      page: {
        type: Object,
        default: null
      },
    },
    data: function() {
      return {
      }
    },
    watch: {
    },
    mounted: function(){
    },
    computed: {
      keys: function(){
        var short = api.settings.get('correctionShort');
        return short.map(val => keyboardMap[val]).join(' + ');
      },
    },
    methods: {
      lang: api.storage.lang,
      openPopup: function() {
        this.page.openCorrectionUi();
        return false;
      }
    }
  }
</script>
