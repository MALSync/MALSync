<template>
  <div v-if="malId && elements && elements.length" class="mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp" style="padding: 8px;">

    <template v-if="completed && completed.length">
      <div>Complete</div>
      <span v-for="(item, index) in completed" :key="index">
        <span v-if="item.item.top" class="list-content">
          <country-flag :country='correctFlag(item.language)' :title="item.language.toUpperCase()+' '+item.index.toUpperCase()" :text="item.index.toUpperCase()"/>
        </span>
      </span>
    </template>

    <template v-if="ongoing && ongoing.length">
      <div>Ongoing</div>

      <div class="mdl-grid mdl-grid--no-spacing">
        <div v-for="(item, index) in ongoing" :key="index" v-if="item.item.top" class="list-content mdl-cell--6-col mdl-cell--8-col-tablet" style="display: flex; align-items: center;">
          <template v-if="item.item.top.state && item.item.top.state !== 'complete'">
            <country-flag :country='correctFlag(item.language)' :title="item.language.toUpperCase()+' '+item.index.toUpperCase()" :text="item.index.toUpperCase()"/>

            <template v-if="item.item.top.lastEp && item.item.top.lastEp.total">
              {{utils.episode(type)}} {{item.item.top.lastEp.total}}
              <template v-if="totalEps">/ {{totalEps}}</template>
              <template v-if="item.item.top.lastEp.timestamp">
                ({{releaseTime(item.item.top.lastEp.timestamp)}} ago)
              </template>
              <template v-if="item.item.top.predicition">
                [next in {{releaseTime(item.item.top.predicition.timestamp).trim()}}]
              </template>
            </template>

          </template>
        </div>

      </div>
    </template>


  </div>

</template>

<script type="text/javascript">
  import CountryFlag from './overviewProgressCountryFlag.vue'

  export default {
    components: {
      CountryFlag
    },
    props: {
      malId: {
        type: String
      },
      type: {
        type: String
      },
      totalEps: {
        type: Number
      }
    },
    data: function() {
      return {
        xhr: '',
        utils,
      };
    },
    watch: {
      malId: {
        immediate: true,
        handler(newVal, oldVal) {
          this.xhr = '';
          var cur = newVal+'s';
          return api.request.xhr('GET', 'https://api.malsync.moe/nc/mal/'+this.type+'/'+newVal+'/progress').then((response) => {
            if(cur === this.malId+'s') {
              this.xhr = JSON.parse(response.responseText);
            }
          });
        },
      },
    },
    computed: {
      elements: function() {
        var elements = [];
        if(this.xhr) {
          for(var language in this.xhr) {
            for(var i in this.xhr[language]) {
              elements.push({
                language: language,
                index: i,
                item: this.xhr[language][i]
              })
            }
          }
        }
        return elements;
      },
      completed: function() {
        return this.elements.filter(el => el.item && el.item.top && el.item.top.state && el.item.top.state == 'complete');
      },
      ongoing: function() {
        return this.elements.filter(el => el.item && el.item.top && el.item.top.state && el.item.top.state != 'complete');
      }
    },
    methods: {
      releaseTime(ms) {
        var diff = Date.now() - ms;
        return utils.timeDiffToText(Math.abs(diff));
      },
      correctFlag(flag) {
        switch(flag.toLowerCase()) {
          case 'en':
            return 'gb';
            break;
          case 'pt-br':
            return 'br';
          case 'zh-hans':
          case 'zh-hant':
          case 'zh':
            return 'cn';
          default:
            return flag
        }
      }
    }
  }
</script>
