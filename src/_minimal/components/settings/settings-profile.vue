<template>
  <Section spacer="full">
    <ImageText :image="profileRequest.data?.picture" :href="profileRequest.data?.href">
      <template v-if="state === 'auth'">
        <Header>
          <MediaLink :href="profileRequest.data?.href">
            {{ profileRequest.data.username }}
          </MediaLink>
        </Header>
        <div>
          <Link :to="{ name: 'Settings', params: { path: ['tracking', 'syncMode'] } }">
            <TextIcon icon="keyboard_arrow_down" position="after" mode="flex">
              {{ lang('settings_profile_logged_via', [parameters.listObj.name]) }}
            </TextIcon>
          </Link>
        </div>
        <div class="link-hover" @click="deauth()">
          <TextIcon icon="eject" position="after" mode="flex">
            {{ lang('settings_profile_logout') }}
          </TextIcon>
        </div>
      </template>
      <template v-if="state === 'loading'">
        <Header> {{ lang('Loading') }} </Header>
        <div>
          <Link :to="{ name: 'Settings', params: { path: ['tracking', 'syncMode'] } }">
            <TextIcon icon="keyboard_arrow_down" position="after" mode="flex">
              {{ parameters.listObj.name }}
            </TextIcon>
          </Link>
        </div>
        <div>--</div>
      </template>
      <template v-if="state === 'noAuth'">
        <Header>{{ lang('settings_profile_no_login') }}</Header>
        <div>
          <Link :to="{ name: 'Settings', params: { path: ['tracking', 'syncMode'] } }">
            <TextIcon icon="keyboard_arrow_down" position="after" mode="flex">
              {{ parameters.listObj.name }}
            </TextIcon>
          </Link>
        </div>
        <div class="button-flex">
          <div class="link-hover" @click="profileRequest.execute()">
            <TextIcon icon="sync">{{ lang('settings_profile_check') }}</TextIcon>
          </div>
          <MediaLink :href="parameters.listObj.authenticationUrl">
            <TextIcon icon="login" class="link-hover">{{ lang('settings_Authenticate') }}</TextIcon>
          </MediaLink>
        </div>
      </template>
    </ImageText>
  </Section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import ImageText from '../image-text.vue';
import Header from '../header.vue';
import { createRequest } from '../../utils/reactive';
import { getListbyType } from '../../../_provider/listFactory';
import { NotAutenticatedError } from '../../../_provider/Errors';
import MediaLink from '../media-link.vue';
import TextIcon from '../text-icon.vue';
import Section from '../section.vue';
import Link from '../link.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

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

const deauth = () => {
  parameters.value.listObj
    .deauth()
    .then(() => {
      profileRequest.execute();
    })
    .catch(() => {
      alert('Failed');
    });
};

const state = computed(() => {
  if (profileRequest.loading) return 'loading';
  if (profileRequest.data && !profileRequest.data.username) return 'noAuth';
  return 'auth';
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.link-hover {
  .link();

  color: var(--cl-light-text);
}

.button-flex {
  display: flex;
  gap: 15px;
}
</style>
