<template>
  <Theming />
  <MediaModal />
  <NavBar />
  <div class="content">
    <router-view v-slot="{ Component, route }">
      <transition
        :name="route.meta.transition as string || 'fade'"
        :duration="route.meta.duration as number || 0"
      >
        <keep-alive max="5" :exclude="['overview']">
          <component
            :is="Component"
            v-bind="route.params"
            :key="route.meta.key ? route.path : undefined"
          />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import Theming from './components/theming.vue';
import NavBar from './components/nav/nav-bar.vue';
import MediaModal from './components/media/media-modal.vue';
</script>

<style lang="less">
@import './less/_main.less';
</style>

<style lang="less" scoped>
@import './less/_globals.less';
.content {
  padding: 0 @spacer;
  overflow: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

// temp

.transitionTest {
  width: 100px;
  height: 100px;
  background-color: red;
}
</style>
