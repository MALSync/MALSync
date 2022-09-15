<template>
  <Card class="custom">
    <Section v-if="permissions.length" class="grid" spacer="half">
      <template v-for="(perm, index) in permissions" :key="index">
        <FormButton class="close-item" @click="removePermission(index)">
          <div class="material-icons">close</div>
        </FormButton>
        <FormDropdown
          v-model="perm.page"
          :options="options"
          :disabled="perm.auto"
          align-items="left"
          placeholder="Select Page"
          class="page-select select-items"
        />
        <FormText
          v-model="perm.domain"
          :validation="validDomain"
          :disabled="perm.auto"
          placeholder="Domain"
          class="select-items"
        />
      </template>
    </Section>
    <Section>
      <FormButton @click="addPermission()"><div class="material-icons">add</div></FormButton>
    </Section>
    <div v-if="!verifyEverything">
      <FormButton color="secondary">Configuration is not correct!</FormButton>
    </div>
    <div v-else-if="!hasAllPermissions || JSON.stringify(model) !== JSON.stringify(permissions)">
      <FormButton color="primary" @click="savePermissions()">{{ lang('Update') }}</FormButton>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { checkPermissions, getPageOptions, requestPermissions } from '../../../utils/customDomains';
import Card from '../card.vue';
import FormDropdown from '../form/form-dropdown.vue';
import FormText from '../form/form-text.vue';
import FormButton from '../form/form-button.vue';
import Section from '../section.vue';
import { domainType } from '../../../background/customDomain';

const options = getPageOptions().map(el => ({ title: el.title, value: el.key }));

const permissions = ref([] as domainType[]);

const model = computed({
  get() {
    return api.settings.get('customDomains') as domainType[];
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

async function checkAllPermission() {
  hasAllPermissions.value = await checkPermissions(permissions.value);
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

const savePermissions = async () => {
  model.value = JSON.parse(JSON.stringify(permissions.value));
  await requestPermissions(model.value);
  checkAllPermission();
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
  grid-template-columns: [col-start] auto [col-end] auto [col-end] auto;
  justify-content: start;
  gap: @spacer-half;
  align-items: center;
}

.__breakpoint-small__( {
  .select-items {
    grid-column-start: col-end 1;
    grid-column-end: col-end 3;
  }

  .close-item {
    grid-row-start: span 2;
    height: 100%;
    display: flex;
    align-items: center;
  }
});

.page-select {
  min-width: 220px;
}
</style>
