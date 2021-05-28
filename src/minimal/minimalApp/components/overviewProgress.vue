<template>
  <div
    v-if="apiCacheKey && elements && elements.length"
    class="mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp"
    style="padding: 8px;"
  >
    <template v-if="completed && completed.length">
      <div>{{ lang('prediction_complete') }}</div>
      <span v-for="(item, index) in completed" :key="index">
        <span v-if="item.item.top" class="list-content">
          <country-flag
            :country="correctFlag(item.language)"
            :title="item.language.toUpperCase() + ' ' + item.index.toUpperCase()"
            :text="item.index.toUpperCase()"
          />
        </span>
      </span>
    </template>

    <template v-if="ongoing && ongoing.length">
      <div>{{ lang('prediction_ongoing') }}</div>

      <div class="mdl-grid mdl-grid--no-spacing">
        <div
          v-for="(item, index) in ongoing"
          :key="index"
          class="list-content mdl-cell--6-col mdl-cell--8-col-tablet"
          style="display: flex; align-items: center;"
        >
          <country-flag
            :country="correctFlag(item.language)"
            :title="item.language.toUpperCase() + ' ' + item.index.toUpperCase()"
            :text="item.index.toUpperCase()"
          />

          <template v-if="item.item.top.state && item.item.top.state !== 'ongoing'">
            <span style="color: red; padding-right: 5px;">{{ lang('prediction_incomplete') }}</span>
          </template>

          <template v-if="item.item.top.lastEp && item.item.top.lastEp.total">
            <template v-if="item.item.top.state && item.item.top.state !== 'ongoing' && item.item.top.stateInfo">
              {{ item.item.top.stateInfo }}
            </template>
            <template v-else>
              {{ utils.episode(type) }} {{ item.item.top.lastEp.total }}
              <template v-if="totalEps">/ {{ totalEps }}</template>
            </template>

            <template v-if="item.item.top.lastEp.timestamp">
              ({{ releaseTime(item.item.top.lastEp.timestamp) }})
            </template>
            <template v-if="item.item.top.predicition">
              [{{ lang('prediction_next', [releaseTime(item.item.top.predicition.timestamp).trim()]) }}]
            </template>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script type="text/javascript">
import CountryFlag from './overviewProgressCountryFlag.vue';
import { timestampToShortTime } from '../../../utils/time';

export default {
  components: {
    CountryFlag,
  },
  props: {
    apiCacheKey: {
      type: Number,
    },
    type: {
      type: String,
    },
    totalEps: {
      type: Number,
    },
  },
  data() {
    return {
      xhr: '',
      utils,
    };
  },
  computed: {
    elements() {
      const elements = [];
      if (this.xhr) {
        for (const language in this.xhr) {
          for (const i in this.xhr[language]) {
            elements.push({
              language,
              index: i,
              item: this.xhr[language][i],
            });
          }
        }
      }
      return elements;
    },
    completed() {
      return this.elements.filter(
        el => el.item && el.item.top && el.item.top.state && el.item.top.state === 'complete',
      );
    },
    ongoing() {
      return this.elements.filter(
        el => el.item && el.item.top && el.item.top.state && el.item.top.state !== 'complete',
      );
    },
  },
  watch: {
    apiCacheKey: {
      immediate: true,
      handler(newVal) {
        this.xhr = '';
        const cur = `${newVal}s`;
        return api.request
          .xhr('GET', `https://api.malsync.moe/nc/mal/${this.type}/${newVal}/progress`)
          .then(response => {
            if (cur === `${this.apiCacheKey}s`) {
              try {
                this.xhr = JSON.parse(response.responseText);
              } catch (e) {
                con.error('No progress informations found');
              }
            }
          });
      },
    },
  },
  methods: {
    lang: api.storage.lang,
    releaseTime(ms) {
      return timestampToShortTime(ms);
    },
    correctFlag(flag) {
      switch (flag.toLowerCase()) {
        case 'pt-br':
          return 'br';
        case 'aa':
          return 'dj';
        case 'af':
          return 'za';
        case 'ak':
          return 'gh';
        case 'sq':
          return 'al';
        case 'am':
          return 'et';
        case 'hy':
          return 'am';
        case 'az':
          return 'az';
        case 'bm':
          return 'ml';
        case 'be':
          return 'by';
        case 'bn':
          return 'bd';
        case 'bi':
          return 'vu';
        case 'bs':
          return 'ba';
        case 'bg':
          return 'bg';
        case 'my':
          return 'mm';
        case 'ca':
          return 'ad';
        case 'zh':
        case 'zh-hans':
        case 'zh-hant':
        case 'zh-x-yue':
          return 'cn';
        case 'hr':
          return 'hr';
        case 'cs':
          return 'cz';
        case 'da':
          return 'dk';
        case 'dv':
          return 'mv';
        case 'nl':
          return 'nl';
        case 'dz':
          return 'bt';
        case 'en':
          return 'gb';
        case 'et':
          return 'ee';
        case 'fj':
          return 'fj';
        case 'fil':
          return 'ph';
        case 'fi':
          return 'fi';
        case 'fr':
          return 'fr';
        case 'gaa':
          return 'gh';
        case 'ka':
          return 'ge';
        case 'de':
          return 'de';
        case 'el':
          return 'gr';
        case 'gu':
          return 'in';
        case 'ht':
          return 'ht';
        case 'he':
          return 'il';
        case 'hi':
          return 'in';
        case 'ho':
          return 'pg';
        case 'hu':
          return 'hu';
        case 'is':
          return 'is';
        case 'ig':
          return 'ng';
        case 'id':
          return 'id';
        case 'ga':
          return 'ie';
        case 'it':
          return 'it';
        case 'ja':
          return 'jp';
        case 'kr':
          return 'ne';
        case 'kk':
          return 'kz';
        case 'km':
          return 'kh';
        case 'kmb':
          return 'ao';
        case 'rw':
          return 'rw';
        case 'kg':
          return 'cg';
        case 'ko':
          return 'kr';
        case 'kj':
          return 'ao';
        case 'ku':
          return 'iq';
        case 'ky':
          return 'kg';
        case 'lo':
          return 'la';
        case 'la':
          return 'va';
        case 'lv':
          return 'lv';
        case 'ln':
          return 'cg';
        case 'lt':
          return 'lt';
        case 'lu':
          return 'cd';
        case 'lb':
          return 'lu';
        case 'mk':
          return 'mk';
        case 'mg':
          return 'mg';
        case 'ms':
          return 'my';
        case 'mt':
          return 'mt';
        case 'mi':
          return 'nz';
        case 'mh':
          return 'mh';
        case 'mn':
          return 'mn';
        case 'mos':
          return 'bf';
        case 'ne':
          return 'np';
        case 'nd':
          return 'zw';
        case 'nso':
          return 'za';
        case 'no':
          return 'no';
        case 'nb':
          return 'no';
        case 'nn':
          return 'no';
        case 'ny':
          return 'mw';
        case 'pap':
          return 'aw';
        case 'ps':
          return 'af';
        case 'fa':
          return 'ir';
        case 'pl':
          return 'pl';
        case 'pt':
          return 'pt';
        case 'pa':
          return 'in';
        case 'qu':
          return 'wh';
        case 'ro':
          return 'ro';
        case 'rm':
          return 'ch';
        case 'rn':
          return 'bi';
        case 'ru':
          return 'ru';
        case 'sg':
          return 'cf';
        case 'sr':
          return 'rs';
        case 'srr':
          return 'sn';
        case 'sn':
          return 'zw';
        case 'si':
          return 'lk';
        case 'sk':
          return 'sk';
        case 'sl':
          return 'si';
        case 'so':
          return 'so';
        case 'snk':
          return 'sn';
        case 'nr':
          return 'za';
        case 'st':
          return 'ls';
        case 'es':
        case 'es-la':
          return 'es';
        case 'ss':
          return 'sz';
        case 'sv':
          return 'se';
        case 'tl':
          return 'ph';
        case 'tg':
          return 'tj';
        case 'ta':
          return 'lk';
        case 'te':
          return 'in';
        case 'tet':
          return 'tl';
        case 'th':
          return 'th';
        case 'ti':
          return 'er';
        case 'tpi':
          return 'pg';
        case 'ts':
          return 'za';
        case 'tn':
          return 'bw';
        case 'tr':
          return 'tr';
        case 'tk':
          return 'tm';
        case 'uk':
          return 'ua';
        case 'umb':
          return 'ao';
        case 'ur':
          return 'pk';
        case 'uz':
          return 'uz';
        case 've':
          return 'za';
        case 'vi':
          return 'vn';
        case 'cy':
          return 'gb';
        case 'wo':
          return 'sn';
        case 'xh':
          return 'za';
        case 'zu':
          return 'za';
        default:
          return flag;
      }
    },
  },
};
</script>
