<template>
  <div class="designed-wrapper">
    <div class="designed">
      <MediaLink href="https://geor.gy/">
        Designed by
        <div class="logotype">geor<span class="logotype_dot">.</span>gy</div>
      </MediaLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MediaLink from '../media-link.vue';

defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.logotype {
  color: var(--cl-text);
  display: inline-block;
  font-family: Montserrat, sans-serif;
  font-size: 1.46em;
  line-height: 1.2;
  font-weight: 700;
}

.logotype_dot {
  color: rgb(231 29 54);
}

.designed-wrapper {
  position: absolute;
  inset-inline-end: 0;
  bottom: 0;
}

.designed {
  //position: fixed;
  //bottom: 0;
  padding: 5px;
}
</style>
