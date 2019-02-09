<template>
  <div class="page-content malClear" id="malReviews">
    <div v-show="xhr == ''" id="loadOverview" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <span class="mdl-chip" v-show="xhr != '' && reviews == ''" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">Nothing Found</span></span>
    <div v-html="reviews" class="mdl-grid" v-if="xhr != ''">
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
      var minimal = j.$(this.$el);
      minimal.find('.js-toggle-review-button').addClass('nojs').click(function(){
        var revID = j.$(this).attr('data-id');
        minimal.find('#review'+revID).css('display','initial');
        minimal.find('#revhelp_output_'+revID).remove();
        j.$(this).remove();
      });
      minimal.find('.mb8 a').addClass('nojs').click(function(){
        var revID = j.$(this).attr('onclick').split("j.$('")[1].split("'")[0];
        minimal.find(revID).toggle();
      });
    },
    watch: {
      url: async function(url){
        this.xhr = '';
        if(this.state){
          api.request.xhr('GET', this.url+'/reviews').then((response) => {
            this.xhr = response.responseText;
          });
        }
      },
      state: async function(state){
        if(state && this.xhr == ''){
          api.request.xhr('GET', this.url+'/reviews').then((response) => {
            this.xhr = response.responseText;
          });
        }
      }
    },
    computed: {
      reviews: function(){
        var html = '';
        try{
          var reviews = this.xhr.split('Reviews</h2>')[1].split('<h2>')[0];
          var reviewsData = j.$.parseHTML( reviews );
          var reviewsHtml = '';
          j.$.each(j.$(reviewsData).filter('.borderDark'), ( index, value ) => {
            reviewsHtml += '<div class="mdl-cell mdl-cell--12-col mdl-shadow--4dp">';
              reviewsHtml += '<div class="mdl-card__supporting-text mdl-card--border" style="color: black;">';
                j.$(value).find('.spaceit > div').css('max-width','60%');
                reviewsHtml += j.$(value).find('.spaceit').first().html();
              reviewsHtml += '</div>';

              reviewsHtml += '<div class="mdl-card__supporting-text" style="color: black;">';
                j.$(value).find('.textReadability, .textReadability > span').contents().filter(function(){
                  // @ts-ignore
                  return this.nodeType == 3 && j.$.trim(this.nodeValue).length;
                }).wrap('<p style="margin:0;padding=0;"/>');
                j.$(value).find('br').css('line-height','10px');
                reviewsHtml += j.$(value).find('.textReadability').html();
              reviewsHtml += '</div>';
            reviewsHtml += '</div>';
          });
          reviewsHtml += '';

          html = reviewsHtml;
        }catch(e) {console.log('[iframeReview] Error:',e);}
        return html;
      },
    },
    methods: {
    }
  }
</script>
