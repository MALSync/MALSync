<template>
  <Accordion :class="`state-${state}`">
    <template #header>
      <TextIcon :icon="icon(state)">{{ title }}</TextIcon>
    </template>
    <template #content>
      <template v-if="permission">
        <p v-for="perm in permission.match" :key="perm">
          <CodeBlock>{{ perm }}</CodeBlock>
        </p>
        <p v-for="perm in permission.api" :key="perm">
          <CodeBlock>{{ perm }}</CodeBlock>
        </p>
      </template>
      <template v-else>
        <div v-for="(page, index) in permissions" :key="index">
          <h3>
            <TextIcon :icon="icon(page.permission)">{{ page.name }}</TextIcon>
          </h3>
          <p v-for="perm in page.match" :key="perm">
            <CodeBlock>{{ perm }}</CodeBlock>
          </p>
          <p v-for="perm in page.api" :key="perm">
            <CodeBlock>{{ perm }}</CodeBlock>
          </p>
        </div>
      </template>
    </template>
  </Accordion>
</template>

<script lang="ts" setup>
import { ComputedRef, PropType, computed } from 'vue';
import TextIcon from '../text-icon.vue';
import CodeBlock from '../code-block.vue';
import Accordion from '../accordion.vue';

import { permissionElement, permissionType } from '../../../utils/permissions';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  permission: {
    type: Object as PropType<permissionElement>,
    required: false,
    default: null,
  },
  permissions: {
    type: Array as PropType<permissionElement[]>,
    required: false,
    default: null,
  },
});

const state: ComputedRef<permissionType> = computed(() => {
  if (props.permission) {
    return props.permission.permission;
  }

  if (props.permissions) {
    const states = props.permissions.map(perm => perm.permission);
    if (states.includes('unknown')) {
      return 'unknown';
    }
    if (states.includes('denied')) {
      return 'denied';
    }
  }
  return 'granted';
});

function icon(perm: permissionType) {
  if (perm === 'granted') {
    return 'done';
  }
  if (perm === 'denied') {
    return 'key_off';
  }
  return 'help';
}
</script>

<style lang="less" scoped>
.state- {
  &granted {
    border: 2px solid var(--cl-state-1) !important;
  }
  &denied {
    border: 2px solid var(--cl-state-4) !important;
  }
  &unknown {
    border: 2px solid var(--cl-state-3) !important;
  }
}
</style>
