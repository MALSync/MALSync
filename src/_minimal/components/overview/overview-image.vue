<template>
  <div class="overviewImage" :class="{ hov: src }" @click="imgModal = true">
    <ImageFit class="over" :src="src" :loading="loading" />
    <Modal v-if="src" v-model="imgModal">
      <img :src="src" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ImageFit from '../image-fit.vue';
import Modal from '../modal.vue';

defineProps({
  src: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const imgModal = ref(false);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.overviewImage {
  .border-radius();

  overflow: hidden;
  position: relative;
  .over {
    .fullSize();
  }

  &.hov {
    .click-move-down();
    .link();
  }
}
</style>
