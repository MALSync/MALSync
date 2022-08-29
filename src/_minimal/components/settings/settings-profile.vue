<template>
  <ImageText>
    <template v-if="state === 'auth'">
      <Header>
        {{ profileRequest.data.username }}
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

const parameters = computed(() => {
  return {
    listObj: getListbyType(api.settings.get('syncMode')),
  };
});

const profileRequest = createRequest(parameters, params => {
  const { listObj } = params.value;
  const res = { username: '', page: listObj.name, authUrl: listObj.authenticationUrl };
  return listObj
    .getUsername()
    .then(username => {
      res.username = username;
      return res;
    })
    .catch(e => {
      if (e instanceof NotAutenticatedError) {
        return res;
      }
      throw e;
    });
});

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
