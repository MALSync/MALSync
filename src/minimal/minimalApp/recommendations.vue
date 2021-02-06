<template>
  <div id="malRecommendations" class="page-content malClear">
    <div
      v-show="xhr == ''"
      id="loadOverview"
      class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
      style="width: 100%; position: absolute;"
    ></div>
    <span
      v-show="xhr != '' && recommendations && recommendations.length === 0"
      class="mdl-chip"
      style="margin: auto; margin-top: 16px; display: table;"
      ><span class="mdl-chip__text">{{ lang('NothingFound') }}</span></span
    >
    <div v-if="xhr != ''" class="mdl-grid">
      <div
        v-for="rec in recommendations"
        :key="rec.titleName"
        class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid"
      >
        <div class="mdl-card__media" style="background-color: transparent; margin: 8px;">
          <a :href="rec.titleHref">
            <img :src="rec.imageUrl" width="50" />
          </a>
        </div>
        <div class="mdl-cell" style="flex-grow: 100;">
          <div>
            <a :href="rec.titleHref"
              ><strong>{{ rec.titleName }}</strong></a
            >
          </div>
          <div>
            <div style="white-space: pre-wrap">{{ rec.user.text }}</div>
            <div>
              Recommended by <a :href="rec.user.userHref">{{ rec.user.username }}</a>
            </div>
          </div>
          <div v-if="rec.children.length">
            <a class="nojs" href="#" @click="activeItems.push(rec.titleName)"
              >Read recommendations by {{ rec.children.length }} more user</a
            >
            <div v-show="activeItems.includes(rec.titleName)" class="more">
              <div v-for="(child, index) in rec.children" :key="child.username" style="padding: 3px; margin: 4px 0;">
                <div style="white-space: pre-wrap">
                  <span>{{ child.text }}</span
                  ><span v-if="child.readmore">
                    <!-- prettier-ignore -->
                    <a
                      v-show="!activeReadMores.includes(index)"
                      href="#"
                      class="nojs"
                      @click="activeReadMores.push(index)"
                      > read more</a
                    >
                    <span v-show="activeReadMores.includes(index)">{{ child.readmore }}</span>
                  </span>
                </div>
                <div>
                  Recommended by <a :href="child.userHref">{{ child.username }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
function getBaseText(element) {
  let text = element.text();
  element.children().each(function() {
    text = text.replace(j.$(this).text(), '');
  });
  return text;
}

function getUserRec(value) {
  const text = getBaseText(
    j
      .$(value)
      .find('.detail-user-recs-text')
      .first(),
  ).trim();

  const username = j
    .$(value)
    .find('.detail-user-recs-text')
    .next()
    .find('a')
    .last()
    .text();

  const userHref = `https://myanimelist.net${j
    .$(value)
    .find('.detail-user-recs-text')
    .next()
    .find('a')
    .last()
    .attr('href')}`;

  let readmore = '';
  if (j.$(value).find('.detail-user-recs-text > span[id^=recommend]').length) {
    readmore = j
      .$(value)
      .find('.detail-user-recs-text > span[id^=recommend]')
      .text()
      .trim();
  }

  return { text, username, userHref, readmore };
}

export default {
  props: {
    url: {
      type: String,
      default: '',
    },
    state: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      xhr: '',
      activeItems: [],
      activeReadMores: [],
    };
  },
  computed: {
    recommendations() {
      const array = [];
      try {
        const recommendationsBlock = this.xhr
          .split('Make a recommendation</a>')[1]
          .split('</h2>')[1]
          .split('<div class="mauto')[0];
        const htmlT = j.$.parseHTML(recommendationsBlock);

        j.$.each(j.$(htmlT).filter('.borderClass'), (index, value) => {
          const imageBlock = j.$(value).find('.picSurround');

          const titleHref = imageBlock.find('a').attr('href');

          const titleName = imageBlock
            .find('a > img')
            .first()
            .attr('alt');

          const imageUrl = imageBlock
            .find('a > img')
            .first()
            .attr('data-src');

          const user = getUserRec(value);

          const children = [];
          j.$(value)
            .find('td:eq(1) > div')
            .last()
            .find('div.borderClass')
            .each((index2, value2) => {
              children.push(getUserRec(value2));
            });

          array.push({ titleHref, titleName, imageUrl, user, children });
        });

        console.log(array);
      } catch (e) {
        console.log('[iframeRecommendations] Error:', e);
      }
      return array;
    },
  },
  watch: {
    async url() {
      this.xhr = '';
      if (this.state) {
        api.request.xhr('GET', `${this.url}/userrecs`).then(response => {
          this.xhr = response.responseText;
        });
      }
    },
    async state(state) {
      if (state && this.xhr === '') {
        api.request.xhr('GET', `${this.url}/userrecs`).then(response => {
          this.xhr = response.responseText;
        });
      }
    },
  },
  methods: {
    lang: api.storage.lang,
  },
};
</script>
