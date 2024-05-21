<template>
  <div
    v-if="(neededPermissions && neededPermissions.length) || !hasAllPermissions"
    class="custom-missing"
  >
    <Card border="secondary">
      <Header :spacer="true">
        {{ lang('settings_custom_domains_missing_permissions_header') }}
      </Header>
      <Section v-if="neededPermissions && neededPermissions.length" spacer="half">
        <Description :height="150">
          <table>
            <tbody>
              <tr v-for="permission in neededPermissions" :key="permission.domain">
                <td>
                  <Section spacer="half">
                    <CodeBlock>{{ getPageName(permission.page) }}</CodeBlock>
                  </Section>
                </td>
                <td><Section spacer="half">⬌</Section></td>
                <td>
                  <Section spacer="half">
                    <CodeBlock>{{ permission.domain }}</CodeBlock>
                  </Section>
                </td>
              </tr>
            </tbody>
          </table>
        </Description>
      </Section>
      <Section v-if="!hasAllPermissions">
        {{ lang('settings_custom_domains_missing_permissions_long') }}
      </Section>
      <SessionSupportsPermissions>
        <FormButton color="secondary" padding="large" @click="add()">
          {{ lang('Add') }}
        </FormButton>
      </SessionSupportsPermissions>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import {
  checkPermissions,
  getPageOptions,
  MissingPermissions,
  requestPermissions,
} from '../../../utils/customDomains';
import Card from '../card.vue';
import Header from '../header.vue';
import CodeBlock from '../code-block.vue';
import Section from '../section.vue';
import FormButton from '../form/form-button.vue';
import { domainType } from '../../../background/customDomain';
import Description from '../description.vue';
import SessionSupportsPermissions from '../session-supports-permissions.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

const permissions = ref(null as null | MissingPermissions);
const temp = new MissingPermissions();
temp.init().then(() => {
  permissions.value = temp;
});

const options = getPageOptions();

const model = computed({
  get() {
    return api.settings.get('customDomains') as domainType[];
  },
  set(value) {
    api.settings.set('customDomains', value);
  },
});

const neededPermissions = computed(() => {
  if (!permissions.value) return [];
  return permissions.value.getMissingPermissions(model.value);
});

const hasAllPermissions = ref(true);

async function checkAllPermission() {
  hasAllPermissions.value = await checkPermissions(model.value);
}

function getPageName(key: string) {
  const page = options.find(pageEl => pageEl.key === key);
  return page ? page.title : key;
}

async function add() {
  con.log('Add missing Permissions', neededPermissions.value);
  model.value = JSON.parse(JSON.stringify(model.value.concat(neededPermissions.value)));
  await requestPermissions(model.value);
  checkAllPermission();
}

watch(
  model,
  () => {
    checkAllPermission();
  },
  { immediate: true, deep: true },
);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.custom-missing {
  padding: @spacer-half 0;
}
</style>
