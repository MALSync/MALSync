<template>
  <div>
    <SettingsGeneral
      component="button"
      :title="parameters.listObj.name"
      :class="{ noAuth: state === 'noAuth' }"
    >
      <template #component>
        <div>
          <template v-if="profileRequest.error">
            <div class="link-hover" @click="deauth()">
              <TextIcon icon="eject" position="after" mode="flex" spacer="small">
                <strong>{{ profileRequest.error }}</strong>
              </TextIcon>
            </div>
          </template>
          <template v-else-if="state === 'auth'">
            <div class="link-hover" @click="deauth()">
              <TextIcon icon="eject" position="after" mode="flex" spacer="small">
                <strong>{{ profileRequest.data.username }}</strong>
              </TextIcon>
            </div>
          </template>
          <template v-if="state === 'loading'"> {{ lang('Loading') }} </template>
          <template v-if="state === 'noAuth'">
            <div class="fll">
              <div class="link-hover" @click="profileRequest.execute()">
                <TextIcon icon="sync">Recheck</TextIcon>
              </div>
              <MediaLink :href="parameters.listObj.authenticationUrl">
                <TextIcon icon="login">{{ lang('settings_Authenticate') }}</TextIcon>
              </MediaLink>
            </div>
          </template>
        </div>
      </template>
    </SettingsGeneral>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { createRequest } from '../../utils/reactive';
import { getListbyType } from '../../../_provider/listFactory';
import { NotAuthenticatedError } from '../../../_provider/Errors';
import MediaLink from '../media-link.vue';
import TextIcon from '../text-icon.vue';
import SettingsGeneral from './settings-general.vue';

const props = defineProps({
  option: {
    type: String,
    default: 'syncMode',
  },
  title: {
    type: String,
    required: true,
  },
});

const parameters = computed(() => {
  return {
    listObj: getListbyType(api.settings.get(props.option)),
  };
});

const profileRequest = createRequest(parameters, params => {
  const { listObj } = params.value;
  return listObj.getUserObject().catch(e => {
    if (e instanceof NotAuthenticatedError) {
      return { username: '', picture: 'error', href: '' };
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

<style lang="less" scoped>
@import '../../less/_globals.less';

.fll {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 5px 20px;
}

.noAuth {
  color: red;
}

.link-hover {
  .link();
}
</style>
