<template>
  <div id="malRecommendations" class="page-content malClear">
    <div
      v-show="xhr == ''"
      id="loadOverview"
      class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
      style="width: 100%; position: absolute;"
    ></div>
    <span
      v-show="xhr != '' && recommendations == ''"
      class="mdl-chip"
      style="margin: auto; margin-top: 16px; display: table;"
      ><span class="mdl-chip__text">{{ lang('NothingFound') }}</span></span
    >
    <div v-if="xhr != ''" class="mdl-grid" v-html="recommendations"></div>
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
    };
  },
  computed: {
    recommendations() {
      let recommendationsHtml = '';
      try {
        const recommendationsBlock = this.xhr
          .split('Make a recommendation</a>')[1]
          .split('</h2>')[1]
          .split('<div class="mauto')[0];
        const htmlT = j.$.parseHTML(recommendationsBlock);

        j.$.each(j.$(htmlT).filter('.borderClass'), (index, value) => {
          recommendationsHtml +=
            '<div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid">';
          recommendationsHtml += '<div class="mdl-card__media" style="background-color: transparent; margin: 8px;">';
          recommendationsHtml += j
            .$(value)
            .find('.picSurround')
            .html();
          recommendationsHtml += '</div>';
          recommendationsHtml += '<div class="mdl-cell" style="flex-grow: 100;">';
          recommendationsHtml += '<div class="">';
          j.$(value)
            .find('.button_edit, .button_add, td:eq(1) > div:eq(1) span')
            .remove();
          recommendationsHtml += j
            .$(value)
            .find('td:eq(1) > div:eq(1)')
            .html();
          recommendationsHtml += '</div>';
          recommendationsHtml += '<div class="">';
          j.$(value)
            .find('a[href^="/dbchanges.php?go=report"]')
            .remove();
          recommendationsHtml += j
            .$(value)
            .find('.borderClass')
            .html();
          recommendationsHtml += '</div>';
          recommendationsHtml += '<div class="">';
          recommendationsHtml +=
            typeof j
              .$(value)
              .find('.spaceit')
              .html() !== 'undefined'
              ? j
                  .$(value)
                  .find('.spaceit')
                  .html()
              : '';
          recommendationsHtml += '<div class="more" style="display: none;">';
          recommendationsHtml += j
            .$(value)
            .find('td:eq(1) > div')
            .last()
            .html();
          recommendationsHtml += '</div>';
          recommendationsHtml += '</div>';
          recommendationsHtml += '</div>';
          recommendationsHtml += '</div>';
        });
        recommendationsHtml += '';
      } catch (e) {
        console.log('[iframeRecommendations] Error:', e);
      }
      return recommendationsHtml;
    },
  },
  watch: {
    async url(url) {
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
  updated() {
    const minimal = j.$(this.$el);
    minimal
      .find('.js-similar-recommendations-button')
      .addClass('nojs')
      .click(function() {
        j.$(this)
          .parent()
          .find('.more')
          .toggle();
      });
    minimal
      .find('.js-toggle-recommendation-button')
      .addClass('nojs')
      .click(function() {
        const revID = j.$(this).attr('data-id');
        minimal.find(`#recommend${revID}`).css('display', 'initial');

        j.$(this).remove();
      });
    minimal
      .find('#malRecommendations .more .borderClass')
      .addClass('mdl-shadow--2dp')
      .css('padding', '10px');

    minimal.find('.lazyload').each(function() {
      j.$(this).attr('src', j.$(this).attr('data-src'));
    }); // TODO: use lazyloading
  },
  methods: {
    lang: api.storage.lang,
  },
};
</script>
