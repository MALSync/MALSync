<template>
  <div>
    <div class="mdl-grid" id="malList" style="justify-content: space-around;">

      <div v-for="item in items" :key="item.id">
        <div class="mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid bookEntry" style="position: relative; height: 250px; padding: 0; width: 210px; height: 293px;">
          <div class="data title lazyBack init" :data-src="imageHi(item)" style="background-image: url(); background-color: grey; background-size: cover; background-position: center center; background-repeat: no-repeat; width: 100%; position: relative; padding-top: 5px;">
            <a :href="item.url" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></a>
            <span class="mdl-shadow--2dp" style="position: absolute; bottom: 0; display: block; background-color: rgba(255, 255, 255, 0.9); padding-top: 5px; display: inline-flex; align-items: center; justify-content: space-between; left: 0; right: 0; padding-right: 8px; padding-left: 8px; padding-bottom: 8px;">
              <a :href="item.url" style="color: black; text-decoration: none;">
                {{item.title}}
              </a>
              <div id="p1" class="mdl-progress" style="position: absolute; top: -4px; left: 0;">
                <div class="progressbar bar bar1" :style="progress(item)"></div>
                <div class="bufferbar bar bar2" style="width: calc(100% + 1px);"></div>
                <div class="auxbar bar bar3" style="width: 0%;"></div>
              </div>
              <div class="data progress mdl-chip mdl-chip--contact mdl-color--indigo-100" style="float: right; line-height: 20px; height: 20px; padding-right: 4px; margin-left: 5px;">
                <div class="link mdl-chip__contact mdl-color--primary mdl-color-text--white" style="line-height: 20px; height: 20px; margin-right: 0;">{{item.watchedEp}}</div>
                <a class="mal-sync-stream" v-if="streamUrl(item)" :title="streamUrl(item).split('/')[2]" target="_blank" style="margin: 0 5px;" :href="streamUrl(item)">
                  <img :src="favicon(streamUrl(item).split('/')[2])">
                </a>
              </div>
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../provider/provider.ts";
  export default {
    data: function(){
      return {
        items: [],
      }
    },
    props: {
      listType: {
        type: String,
        default: 'anime'
      },
      state: {
        type: Number,
        default: 1
      },
    },
    mounted: function(){
      provider.userList(this.state, this.listType, {
        fullListCallback: (list) => {
          this.items = list;
        }
      });
    },
    updated: function(){
      utils.lazyload(j.$(this.$el));
    },
    methods: {
      imageHi: function(item){
        var imageHi = item.image;
        var regexDimensions = /\/r\/\d*x\d*/g;
        if ( regexDimensions.test(imageHi) ) {
          imageHi = imageHi.replace(/v.jpg$/g, '.jpg').replace(regexDimensions, '');
        }
        return imageHi;
      },
      progress: function(item){
        var width = ( item.watchedEp / item.totalEp ) * 100;
        return 'width: '+width+'%;'
      },
      streamUrl: function(item){
        return utils.getUrlFromTags(item.tags);
      },
      favicon: function(domain){
        return utils.favicon(domain);
      }
    }
  }
</script>
