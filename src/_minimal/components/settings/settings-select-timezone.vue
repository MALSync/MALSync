<template>
  <div class="edit-timezone">
    <Section>
      <Card>
        <Section class="ui-row">
          <FormText v-model="search" icon="search" :clear-icon="true" class="search-field" />
        </Section>
        <div class="list">
          <div
            v-for="link in timezones"
            :key="link.name"
            class="timezone"
            :class="{
              active: link.active,
            }"
            @click="selectTimezone(link)"
          >
            <FormButton :animation="false" class="timezone-btn">
              <TextIcon>{{ link.name }}</TextIcon>
            </FormButton>
          </div>
        </div>
      </Card>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import moment from 'moment-timezone';
import FormButton from '../form/form-button.vue';
import TextIcon from '../text-icon.vue';
import Card from '../card.vue';
import FormText from '../form/form-text.vue';
import Section from '../section.vue';

const model = computed({
  get() {
    return api.settings.get('timezone');
  },
  set(value) {
    api.settings.set('timezone', value);
  },
});

const search = ref('');

const zoneNames = moment.tz.names();
const timezones = computed(() => {
  return zoneNames
    .map(tz => {
      const parts = tz.split('/');
      return {
        name: parts.length > 1 ? `${parts[1].replace('_', ' ')}, ${parts[0]}` : parts[0],
        originalName: tz,
        active: model.value === tz,
      };
    })
    .filter(tz => {
      if (!search.value) return true;
      return tz.name.toLowerCase().includes(search.value.toLowerCase());
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

const selectTimezone = timezone => {
  model.value = timezone.originalName;
};
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.edit-timezone {
  padding: @spacer-half 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: @spacer-half;
}

.row > td {
  padding-bottom: 15px;
}

.timezone {
  opacity: 0.5;
  filter: grayscale(1);
  &.active {
    opacity: 1;
    filter: none;
  }
}

.timezone-btn {
  width: 100%;
}

.search-field {
  width: 100%;
}

.ui-row {
  display: flex;
  gap: @spacer-half;
  align-items: stretch;
}
</style>
