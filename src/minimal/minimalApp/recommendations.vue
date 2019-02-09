<template>
  <div class="page-content malClear" id="malRecommendations">
    <div v-show="xhr == ''" id="loadOverview" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <span class="mdl-chip" v-show="xhr != '' && recommendations == ''" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">Nothing Found</span></span>
    <div v-html="recommendations" class="mdl-grid" v-if="xhr != ''">
    </div>
  </div>
</template>

<script type="text/javascript">
  import {entryClass} from "./../../provider/provider";
  export default {
    data: function(){
      return {
        xhr: '',
      }
    },
    props: {
      url: {
        type: String,
        default: ''
      },
      state: {
        type: Boolean,
        default: false
      },
    },
    updated: function(){
      j.$(this.$el).find('.js-similar-recommendations-button').addClass('nojs').click(function(){j.$(this).parent().find('.more').toggle();});
      j.$(this.$el).find('.js-toggle-recommendation-button').addClass('nojs').click(function(){
        var revID = j.$(this).attr('data-id');
        j.$(this.$el).find('#recommend'+revID).css('display','initial');

        j.$(this).remove();
      });
      j.$(this.$el).find('#malRecommendations .more .borderClass').addClass('mdl-shadow--2dp').css('padding','10px');

      j.$(this.$el).find('.lazyload').each(function() { j.$(this).attr('src', j.$(this).attr('data-src'));});//TODO: use lazyloading
    },
    watch: {
      url: async function(url){
        this.xhr = '';
        if(this.state){
          api.request.xhr('GET', this.url+'/userrecs').then((response) => {
            this.xhr = response.responseText;
          });
        }
      },
      state: async function(state){
        if(state && this.xhr == ''){
          api.request.xhr('GET', this.url+'/userrecs').then((response) => {
            this.xhr = response.responseText;
          });
        }
      }
    },
    computed: {
      recommendations: function(){
        var html = '';
        try{
          var recommendationsBlock = this.xhr.split('Make a recommendation</a>')[1].split('</h2>')[1].split('<div class="mauto')[0];
          var html = j.$.parseHTML( recommendationsBlock );
          var recommendationsHtml = '';
          j.$.each(j.$(html).filter('.borderClass'),( index, value ) => {
            recommendationsHtml += '<div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid">';
              recommendationsHtml += '<div class="mdl-card__media" style="background-color: transparent; margin: 8px;">';
                recommendationsHtml += j.$(value).find('.picSurround').html();
              recommendationsHtml += '</div>';
              recommendationsHtml += '<div class="mdl-cell" style="flex-grow: 100;">';
                recommendationsHtml += '<div class="">';
                  j.$(value).find('.button_edit, .button_add, td:eq(1) > div:eq(1) span').remove();
                  recommendationsHtml += j.$(value).find('td:eq(1) > div:eq(1)').html();
                recommendationsHtml += '</div>';
                recommendationsHtml += '<div class="">';
                  j.$(value).find('a[href^="/dbchanges.php?go=report"]').remove();
                  recommendationsHtml += j.$(value).find('.borderClass').html();
                recommendationsHtml += '</div>';
                recommendationsHtml += '<div class="">';
                  recommendationsHtml += (typeof j.$(value).find('.spaceit').html() != 'undefined') ? j.$(value).find('.spaceit').html() : '';
                  recommendationsHtml += '<div class="more" style="display: none;">';
                    recommendationsHtml += j.$(value).find('td:eq(1) > div').last().html();
                  recommendationsHtml += '</div>';
                recommendationsHtml += '</div>';
              recommendationsHtml += '</div>';
            recommendationsHtml += '</div>';
          });
          recommendationsHtml += '';

          if(recommendationsHtml == '<div class="mdl-grid"></div>'){
            recommendationsHtml = '<span class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">Nothing Found</span></span>';
          }

          html = recommendationsHtml;
        }catch(e) {console.log('[iframeRecommendations] Error:',e);}
        return recommendationsHtml;
      },
    },
    methods: {
    }
  }
</script>
