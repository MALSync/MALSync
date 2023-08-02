<template>
  <Section spacer="none" class="login-install">
    <Header style="width: 100%"> 🔒 {{ lang('settings_Authenticate') }} </Header>
    <template v-if="state === 'auth'">
      <div class="image-section">
        <div class="img">
          <ImageLazy :src="profileRequest.data?.picture" class="img-el" />
        </div>
        <div>
          <FormButton padding="mini" :animation="false">
            {{ lang('installPage_Login_Successful', [profileRequest.data.username]) }}
          </FormButton>
        </div>
      </div>
      <div class="button-section">
        <MediaLink href="https://malsync.moe/pwa/#/settings" class="button-next" target="">
          <FormButton color="secondary" class="button-next">
            <TextIcon icon="settings">{{ lang('minimalApp_Settings') }}</TextIcon>
          </FormButton>
        </MediaLink>
        <MediaLink href="https://malsync.moe/pwa/" class="button-next" target="">
          <FormButton color="primary" class="button-next">
            <TextIcon icon="play_arrow">{{ lang('start') }}</TextIcon>
          </FormButton>
        </MediaLink>
      </div>
    </template>
    <template v-if="state === 'loading'">
      <div class="image-section">
        <div class="img loading">
          <div class="img-center">
            <Spinner />
          </div>
        </div>
        <div style="visibility: hidden">
          <FormButton padding="mini" :animation="false">
            {{ lang('settings_profile_no_login') }}
          </FormButton>
        </div>
      </div>
      <div class="button-section" style="visibility: hidden">
        <FormButton color="default" @click="$emit('back')"> {{ lang('back') }} </FormButton>
        <MediaLink :href="parameters.listObj.authenticationUrl" class="button-next">
          <FormButton color="secondary" class="button-next">
            <TextIcon icon="login">{{ lang('settings_Authenticate') }}</TextIcon>
          </FormButton>
        </MediaLink>
      </div>
    </template>
    <template v-if="state === 'noAuth'">
      <div class="image-section">
        <div class="img noauth" @click="profileRequest.execute()">
          <div class="img-center">
            <span class="material-icons">sync</span>
          </div>
        </div>
        <div>
          <MediaLink :href="parameters.listObj.authenticationUrl">
            <FormButton padding="mini" color="secondary">
              <TextIcon icon="login">{{ lang('settings_Authenticate') }}</TextIcon>
            </FormButton>
          </MediaLink>
        </div>
      </div>
      <div class="button-section">
        <FormButton color="default" @click="$emit('back')"> Back </FormButton>
        <MediaLink :href="parameters.listObj.authenticationUrl" class="button-next">
          <FormButton color="secondary" class="button-next">
            <TextIcon icon="login">{{ lang('settings_Authenticate') }}</TextIcon>
          </FormButton>
        </MediaLink>
      </div>
    </template>
  </Section>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import Header from '../header.vue';
import { createRequest } from '../../utils/reactive';
import { getListbyType } from '../../../_provider/listFactory';
import { NotAutenticatedError } from '../../../_provider/Errors';
import MediaLink from '../media-link.vue';
import TextIcon from '../text-icon.vue';
import Section from '../section.vue';
import ImageLazy from '../image-lazy.vue';
import FormButton from '../form/form-button.vue';
import Spinner from '../spinner.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

defineEmits(['back']);

const parameters = computed(() => {
  return {
    listObj: getListbyType(api.settings.get('syncMode')),
  };
});

const profileRequest = createRequest(
  parameters,
  params => {
    const { listObj } = params.value;
    return listObj.getUserObject().catch(e => {
      if (e instanceof NotAutenticatedError) {
        return { username: '', picture: 'error', href: '' };
      }
      throw e;
    });
  },
  {
    cache: {
      prefix: 'settings-profile',
      ttl: 10 * 1000,
      refetchTtl: 60 * 60 * 1000,
      keyFn: params => {
        return params.value.listObj.name;
      },
    },
  },
);

const state = computed(() => {
  if (profileRequest.loading) return 'loading';
  if (profileRequest.data && !profileRequest.data.username) return 'noAuth';
  return 'auth';
});

function onFocus() {
  if (state.value !== 'noAuth') return;
  profileRequest.execute();
}

onMounted(() => {
  window.addEventListener('focus', onFocus);
});
onBeforeUnmount(() => {
  window.removeEventListener('focus', onFocus);
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.img {
  background-color: var(--cl-backdrop);
  width: calc(@normal-text * 7);
  height: calc(@normal-text * 7);
  min-width: calc(@normal-text * 7);
  font-size: calc(@normal-text * 4.5);
  border-radius: 50%;
  overflow: hidden;

  &.noauth {
    .click-move-down();
    .link();
    .block-select();

    background-color: var(--cl-secondary);
  }

  &.loading {
    background-color: var(--cl-primary);
  }

  &-el {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &-center {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .material-icons {
    font-size: inherit;
  }
}

.image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @spacer;
  font-weight: bold;
}

.login-install {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}
</style>
