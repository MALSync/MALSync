<template>
  <div>
    <div :id="id" class="icon material-icons" style="font-size:16px; line-height: 0; color: #7f7f7f; padding-bottom: 20px; padding-left: 3px;" :style="tagStyle">
      {{iconText}}
    </div>
    <div class="mdl-tooltip mdl-tooltip--large" :class="directionClass" :for="id"><slot/></div>
  </div>
</template>

<script type="text/javascript">
  export default {
    data: function(){
      return{
        number: Math.floor((Math.random() * 1000) + 1)
      }
    },
    props: {
      direction: {
        type: String,
        default: 'top'
      },
      tagStyle: {
        type: String,
        default: ''
      },
      iconText: {
        type: String,
        default: 'contact_support'
      }
    },
    computed: {
      id: function(){
        return 'tt-'+this.number;
      },
      directionClass: function(){
        return 'mdl-tooltip--'+this.direction;
      }
    },
  }
</script>
