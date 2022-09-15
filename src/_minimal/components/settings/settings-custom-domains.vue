<template>
  <Card class="custom">
    <Section v-if="permissions.length" class="grid" spacer="half">
      <template v-for="(perm, index) in permissions" :key="index">
        <FormButton @click="removePermission(index)">
          <div class="material-icons">close</div>
        </FormButton>
        <FormDropdown
          v-model="perm.page"
          :options="options"
          align-items="left"
          placeholder="Select Page"
          class="page-select"
        />
        <FormText v-model="perm.domain" :validation="validDomain" placeholder="Domain" />
      </template>
    </Section>
    <Section>
      <FormButton @click="addPermission()"><div class="material-icons">add</div></FormButton>
    </Section>
    <div v-if="!verifyEverything">
      <FormButton color="secondary">Configuration is not correct!</FormButton>
    </div>
    <div v-else-if="JSON.stringify(model) !== JSON.stringify(permissions)">
      <FormButton color="primary" @click="savePermissions()">{{ lang('Update') }}</FormButton>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { getPageOptions } from '../../../utils/customDomains';
import Card from '../card.vue';
import FormDropdown from '../form/form-dropdown.vue';
import FormText from '../form/form-text.vue';
import FormButton from '../form/form-button.vue';
import Section from '../section.vue';

type Permission = {
  domain: string;
  page: string;
};

const options = getPageOptions().map(el => ({ title: el.title, value: el.key }));

const permissions = ref([] as Permission[]);

const model = computed({
  get() {
    return api.settings.get('customDomains') as Permission[];
  },
  set(value) {
    api.settings.set('customDomains', value);
  },
});

watch(
  model,
  value => {
    permissions.value = JSON.parse(JSON.stringify(value));
  },
  { immediate: true },
);

function addPermission() {
  permissions.value.push({ domain: '', page: '' });
}

function validDomain(domain) {
  let origin;
  try {
    origin = new URL(domain).origin;
  } catch (e) {
    return false;
  }

  return (
    /^https?:\/\/(localhost|(?:www?\d?\.)?((?:(?!www\.|\.).)+\.[a-zA-Z0-9.]+))/.test(domain) &&
    origin
  );
}

const hasAllPermissions = ref(false);

function getOrigins() {
  return permissions.value
    .filter(perm => {
      try {
        const url = new URL(perm.domain);
        return Boolean(url.origin);
      } catch (_) {
        return false;
      }
    })
    .map(perm => `${new URL(perm.domain).origin}/`);
}

function checkAllPermission() {
  chrome.permissions.contains(
    {
      permissions: ['webNavigation'],
      origins: getOrigins(),
    },
    result => {
      hasAllPermissions.value = result;
    },
  );
}

watch(
  permissions,
  () => {
    checkAllPermission();
  },
  { immediate: true, deep: true },
);

const verifyEverything = computed(() => {
  return permissions.value.every(perm => {
    return validDomain(perm.domain) && perm.page;
  });
});

const savePermissions = () => {
  model.value = JSON.parse(JSON.stringify(permissions.value));
  con.m('Request Permissions').log(getOrigins());
  chrome.permissions.request(
    {
      permissions: ['webNavigation'],
      origins: getOrigins(),
    },
    granted => {
      if (!granted) utils.flashm('Requesting the permissions failed', { error: true });
      checkAllPermission();
    },
  );
};

const removePermission = index => {
  permissions.value.splice(index, 1);
};
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.custom {
  margin: @spacer-half 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: start;
  gap: @spacer-half;
  align-items: center;
}

.page-select {
  min-width: 220px;
}
</style>
