<template>
  <div>
    <div v-if="components.path.length" class="back-button">
      <router-link :to="{ name: 'Settings', params: { path: [components.path.slice(0, -1)] } }">
        <Header>
          <TextIcon icon="arrow_back" mode="flex" background="round">
            {{ components.parent ? components.parent.title : 'Back' }}
          </TextIcon>
        </Header>
      </router-link>
    </div>
    <component
      :is="comp.component"
      v-for="comp in components.structure"
      :key="comp.key"
      :path="[...components.path, comp.key]"
      :title="comp.title"
      v-bind="comp.props"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { structure, ConfObj } from '../components/settings/settings-structure';
import Header from '../components/header.vue';
import TextIcon from '../components/text-icon.vue';

const route = useRoute();

const followPath = (
  paths: string[],
  struct: ConfObj[],
  currentPath: string[] = [],
  parent: ConfObj | null = null,
) => {
  if (!paths)
    return {
      structure: struct,
      path: currentPath,
      parent,
    };
  const path = paths.shift();
  if (!path)
    return {
      structure: struct,
      path: currentPath,
      parent,
    };
  const tempStruct = struct.find(s => s.key === path);
  if (!tempStruct || !tempStruct.children)
    return {
      structure: struct,
      path: currentPath,
      parent,
    };
  currentPath.push(path);
  return followPath(paths, tempStruct.children, currentPath, tempStruct);
};
const components = computed(() => {
  return followPath(route.params.path as string[], structure);
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.back-button {
  .click-move-down();

  padding: @spacer-half 0;
}
</style>
