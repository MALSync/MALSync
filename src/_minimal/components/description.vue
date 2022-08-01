<template>
  <div class="description" :class="{ close: !open && overflow, loading }">
    <template v-if="!loading">
      <div ref="inner" class="open-gradient">
        <slot></slot>
      </div>
      <FormButton
        v-if="!open && overflow"
        class="open-button"
        :animation="false"
        @click="open = true"
      >
        Read More
      </FormButton>
      <div v-if="open" class="close-button-box">
        <FormButton class="close-button" :animation="false" @click="open = false">
          Read Less
        </FormButton>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';

import FormButton from './form/form-button.vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

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

  &.loading {
    .skeleton-text-block();
  }
}
</style>
