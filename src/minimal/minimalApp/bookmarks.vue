<template>
  <div>
    <div class="mdl-grid" id="malList" style="justify-content: space-around;">
      <div v-for="item in items" :key="item.id">
        {{item.title}}
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
  }
</script>
