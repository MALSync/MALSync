<template>
  <div class="description" :class="{ close: !open && overflow }">
    <div ref="inner" class="open-gradient">
      <slot></slot>
    </div>
    <FormButton v-show="!open && overflow" class="open-button" @click="open = true"
      >Read More</FormButton
    >
    <div v-show="open" class="close-button-box">
      <FormButton class="close-button" @click="open = false">Read Less</FormButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';

import FormButton from './form/form-button.vue';

const open = ref(false);
const overflow = ref(true);

const inner = ref(null) as Ref<HTMLElement | null>;

onMounted(() => {
  if (inner.value) {
    const { scrollHeight, clientHeight } = inner.value;
    overflow.value = Boolean(scrollHeight > clientHeight);
  }
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.description {
  position: relative;

  .open-button {
    position: absolute;
    bottom: 1px;
    left: 50%;
    transform: translateX(-50%);
  }

  .close-button-box {
    display: flex;
    justify-content: center;
    margin-top: @spacer-half;
  }

  &.close {
    overflow: hidden;

    .open-gradient {
      max-height: 240px;
      mask-image: linear-gradient(180deg, #000 60%, transparent);
      /* stylelint-disable-next-line property-no-vendor-prefix */
      -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
    }
  }
}
</style>
