<template>
  <Section spacer="half" direction="both">
    <ImageText :image="profileRequest.data?.picture" :href="profileRequest.data?.href">
      <template v-if="state === 'auth'">
        <Header>
          <MediaLink :href="profileRequest.data?.href">
            {{ profileRequest.data.username }}
          </MediaLink>
        </Header>
        <div>Logged in via {{ parameters.listObj.name }}</div>
        <div @click="deauth()">
          <TextIcon icon="eject" position="after" mode="flex"> Deauthenticate </TextIcon>
        </div>
      </template>
      <template v-if="state === 'loading'">
        <Header> Loading </Header>
        <div>{{ parameters.listObj.name }}</div>
        <div>--</div>
      </template>
      <template v-if="state === 'noAuth'">
        <Header>No Login</Header>
        <div @click="profileRequest.execute()"><TextIcon icon="sync">Recheck</TextIcon></div>
        <MediaLink :href="parameters.listObj.authenticationUrl">
          <TextIcon icon="login">{{ lang('settings_Authenticate') }}</TextIcon>
        </MediaLink>
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
