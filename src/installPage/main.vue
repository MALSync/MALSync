<template>
  <div>
    <div class="test">{{lang("minimalClass_versionMsg_Text_1")}}</div>
    <div>{{hello}}</div>
    <div>{{options.syncMode}}</div>
  </div>
</template>

<style lang="less">
  .test{
    background-color: red;
  }
</style>

<script type="text/javascript">
  export default {
    components: {
    },
    data: () => ({
      hello: 'Hello World!',
      options: api.settings.options,
    }),
    watch: {
    },
    methods: {
      lang: api.storage.lang,
    }
  }
</script>
