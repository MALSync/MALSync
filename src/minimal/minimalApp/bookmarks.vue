<template>
  <div>
    <div class="mdl-grid" id="malList" style="justify-content: space-around;">

      <div v-for="item in items" :key="item.id">
        <bookmarksItem :item="item"/>
      </div>

    </div>
  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../provider/provider.ts";
  import bookmarksItem from './bookmarksItem.vue';
  export default {
    components: {
      bookmarksItem,
    },
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
        fullListCallback: async (list) => {
          this.items = list;
        }
      });
    },
    updated: function(){
      utils.lazyload(j.$(this.$el));
    },
    methods: {
    }
  }
</script>
