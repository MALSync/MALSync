<template>
  <Card
    v-if="neededPermissions && neededPermissions.length"
    border="secondary"
    class="custom-missing"
  >
    <Header :spacer="true">
      {{ lang('settings_custom_domains_missing_permissions_header') }}
    </Header>
    <Section spacer="half">
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
    </Section>
    <FormButton color="secondary" padding="large" @click="add()">
      {{ lang('Add') }}
    </FormButton>
  </Card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { getPageOptions, MissingPermissions, requestPermissions } from '../../../utils/customDomains';
import Card from '../card.vue';
import Header from '../header.vue';
import CodeBlock from '../code-block.vue';
import Section from '../section.vue';
import FormButton from '../form/form-button.vue';
import { domainType } from '../../../background/customDomain';

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

function getPageName(key: string) {
  const page = options.find(pageEl => pageEl.key === key);
  return page ? page.title : key;
}

async function add() {
  con.log('Add missing Permissions', neededPermissions.value);
  model.value = JSON.parse(JSON.stringify(model.value.concat(neededPermissions.value)));
  await requestPermissions(model.value);
}
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.custom-missing {
  margin: @spacer-half 0;
}
</style>
