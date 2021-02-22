<template>
  <div id="malReviews" class="page-content malClear">
    <div
      v-show="xhr == ''"
      id="loadOverview"
      class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
      style="width: 100%; position: absolute;"
    ></div>
    <span
      v-show="xhr != '' && reviews && reviews.length === 0"
      class="mdl-chip"
      style="margin: auto; margin-top: 16px; display: table;"
      ><span class="mdl-chip__text">{{ lang('NothingFound') }}</span></span
    >
    <div v-if="xhr != ''" class="mdl-grid">
      <div
        v-for="(review, index) in reviews"
        :key="review.username"
        class="mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp"
      >
        <div class="mdl-card__supporting-text mdl-card--border" style="color: black;">
          <div style="float: right; text-align: right; max-width: 60%;">
            <div>{{ review.rDate }}</div>
            <div>{{ review.rEpisodes }}</div>
            <div>Overall Rating: {{ review.rRating }}</div>
          </div>
          <div style="float: left; max-width: 60%;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tbody>
                <tr>
                  <td valign="top" width="60">
                    <div>
                      <a :href="review.userHref">
                        <img :src="review.userImage" width="48" />
                      </a>
                    </div>
                  </td>
                  <td valign="top">
                    <a :href="review.userHref">{{ review.username }}</a>
                    <small>(<a :href="review.userHref + '/reviews'">All reviews</a>)</small><br />
                    <div v-if="review.rPeople">
                      <strong>
                        <span>{{ review.rPeople }}</span>
                      </strong>
                      people found this review helpful
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="mdl-card__supporting-text" style="color: black;">
          <div>
            <p v-for="(line, index2) in review.rText" :key="index2">{{ line }}</p>
          </div>
          <div v-if="review.rReadmore">
            <a v-show="!activeReadMores.includes(index)" href="#" class="nojs" @click="activeReadMores.push(index)"
              >read more</a
            >
            <p v-for="(line, index3) in review.rReadmore" v-show="activeReadMores.includes(index)" :key="index3">
              {{ line }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
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
      activeReadMores: [],
    };
  },
  computed: {
    reviews() {
      const array = [];
      try {
        const reviews = this.xhr.split('Reviews</h2>')[1].split('<h2>')[0];
        const reviewsData = j.$.parseHTML(reviews);
        const reviewsData2 = reviewsData;

        j.$.each(j.$(reviewsData2).filter('.borderDark'), (index, value) => {
          const imageBlock = j.$(value).find('.picSurround');

          const userHref = imageBlock.find('a').attr('href');
          const userImage = imageBlock
            .find('a > img')
            .first()
            .attr('data-src');

          const username = j
            .$(value)
            .find('.spaceit > .mb8')
            .next()
            .find('td > a')
            .text()
            .trim();

          const rPeople = Number(
            j
              .$(value)
              .find('.spaceit > .mb8')
              .next()
              .find('td > div > strong > span')
              .text(),
          );

          const rDate = j
            .$(value)
            .find('.spaceit > .mb8 > div')
            .first()
            .text()
            .trim();

          const rEpisodes = j
            .$(value)
            .find('.spaceit > .mb8 > div.lightLink')
            .text()
            .trim();

          const rRating = Number(
            j
              .$(value)
              .find('.spaceit > .mb8 > div')
              .last()
              .text()
              .replace(/\D+/, ''),
          );

          const rText = j
            .$(value)
            .find('.textReadability')
            .contents()
            .filter(function() {
              return this.nodeType === 3 && j.$.trim(this.nodeValue).length;
            })
            .text()
            .trim()
            .split('\n');

          const rReadmore = j
            .$(value)
            .find('.textReadability > span')
            .contents()
            .filter(function() {
              // @ts-ignore
              return this.nodeType === 3 && j.$.trim(this.nodeValue).length;
            })
            .text()
            .trim()
            .split('\n');
          array.push({ userHref, userImage, username, rPeople, rDate, rEpisodes, rRating, rText, rReadmore });
        });

        console.log(array);
      } catch (e) {
        console.log('[iframeReview] Error:', e);
      }
      return array;
    },
  },
  watch: {
    async url() {
      this.xhr = '';
      if (this.state) {
        api.request.xhr('GET', `${this.url}/reviews`).then(response => {
          this.xhr = response.responseText;
        });
      }
    },
    async state(state) {
      if (state && this.xhr === '') {
        api.request.xhr('GET', `${this.url}/reviews`).then(response => {
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
