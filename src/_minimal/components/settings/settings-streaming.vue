<template>
  <div class="quicklinkedit">
    <Section spacer="half">
      <Card>
        <Section class="ui-row">
          <FormButton color="secondary" padding="slim" @click="orderMode = !orderMode">
            <span class="material-icons">{{ orderMode ? 'edit_attributes' : 'low_priority' }}</span>
          </FormButton>
          <FormText
            v-model="search"
            v-visible="!orderMode"
            icon="search"
            :clear-icon="true"
            class="search-field"
          />
        </Section>
        <div v-if="!orderMode" class="grid">
          <div
            v-for="link in linksWithState"
            :key="link.name"
            class="quicklink"
            :class="{
              active: link.active,
            }"
            @click="toggleLink(link)"
          >
            <FormButton :animation="false" :icon="groupIcon(link)" class="btn">
              <TextIcon :src="favicon(link.domain)">{{ link.name }}</TextIcon>
            </FormButton>
          </div>
        </div>
        <div v-else>
          <draggable
            v-model="model"
            class="forSorting"
            group="people"
            :item-key="link => optionToCombined(link).name"
          >
            <template #item="{ element }">
              <FormButton :animation="false" class="grab">
                <TextIcon icon="drag_handle">
                  <TextIcon :src="favicon(optionToCombined(element).domain)">
                    {{ optionToCombined(element).name }}
                  </TextIcon>
                </TextIcon>
              </FormButton>
            </template>
          </draggable>
        </div>
      </Card>
    </Section>
    <Card>
      <Header :spacer="true">{{ lang('settings_StreamingSite_custom') }}</Header>
      <Section>
        <table>
          <tr class="row">
            <td><CodeBlock>{searchterm}</CodeBlock></td>
            <td>=> <CodeBlock>no%20game%20no%20life</CodeBlock></td>
          </tr>
          <tr class="row">
            <td><CodeBlock>{searchtermPlus}</CodeBlock></td>
            <td>=> <CodeBlock>no+game+no+life</CodeBlock></td>
          </tr>
          <tr class="row">
            <td><CodeBlock>{searchtermMinus}</CodeBlock></td>
            <td>=> <CodeBlock>no-game-no-life</CodeBlock></td>
          </tr>
          <tr class="row">
            <td><CodeBlock>{searchtermUnderscore}</CodeBlock></td>
            <td>=> <CodeBlock>no_game_no_life</CodeBlock></td>
          </tr>
          <tr>
            <td><CodeBlock>{searchtermRaw}</CodeBlock></td>
            <td>=> <CodeBlock>no game no life</CodeBlock></td>
          </tr>
        </table>
      </Section>

      <HR />

      <Section spacer="half">
        <FormText
          v-model="customName"
          :placeholder="lang('settings_StreamingSite_custom_url_name')"
          class="custom-field"
        />
      </Section>
      <Section spacer="half">
        <FormText
          v-model="customAnime"
          :placeholder="lang('settings_StreamingSite_custom_url_anime')"
          class="custom-field"
        />
      </Section>
      <Section spacer="half">
        <FormText
          v-model="customManga"
          :placeholder="lang('settings_StreamingSite_custom_url_manga')"
          class="custom-field"
        />
      </Section>

      <FormButton
        color="secondary"
        :disabled="!customName || (!customAnime && !customManga)"
        @click="!customName || (!customAnime && !customManga) ? '' : addCustom()"
      >
        {{ lang('Add') }}
      </FormButton>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { optionToCombined, quicklinks, removeOptionKey } from '../../../utils/quicklinksBuilder';
import FormButton from '../form/form-button.vue';
import TextIcon from '../text-icon.vue';
import Card from '../card.vue';
import FormText from '../form/form-text.vue';
import Section from '../section.vue';
import Header from '../header.vue';
import CodeBlock from '../code-block.vue';
import HR from '../hr.vue';
import { localStore } from '../../../utils/localStore';

defineProps({
  title: {
    type: String,
    default: '',
  },
});

function stateNumber(link) {
  if (link.custom) return 0;
  if (link.database) return 1;
  if (link.search && !(link.search.anime === 'home' || link.search.manga === 'home')) return 2;
  return 10;
}

const model = computed({
  get() {
    return api.settings.get('quicklinks').filter(el => optionToCombined(el));
  },
  set(value) {
    api.settings.set('quicklinks', value);
    if (api.type === 'webextension') localStore.clear();
  },
});

const search = ref('');
const customName = ref('');
const customAnime = ref('');
const customManga = ref('');

const linksWithState = computed(() => {
  return [...quicklinks, ...model.value.filter(el => typeof el === 'object' && el)]
    .filter(el => {
      if (!search.value) return true;
      return el.name.toLowerCase().includes(search.value.toLowerCase());
    })
    .map(el => {
      el.active = model.value.includes(el.name) || el.custom;
      return el;
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => {
      return stateNumber(a) - stateNumber(b);
    });
});

const favicon = (url: string) => {
  return utils.favicon(url.split('/')[2]);
};

const groupIcon = el => {
  if (el.custom) return 'tune';
  if (el.database) return 'link';
  if (el.search && !(el.search.anime === 'home' || el.search.manga === 'home')) return 'search';
  return 'home';
};

const toggleLink = link => {
  if (link.active) {
    if (link.custom) {
      customName.value = link.name;
      customAnime.value = link.search.anime;
      customManga.value = link.search.manga;
    }
    model.value = removeOptionKey(model.value, link.name);
  } else {
    model.value.push(link.name);
  }
  model.value = [...model.value];
};

const addCustom = () => {
  let domain = '';
  if (customAnime.value || customManga.value) {
    let domainParts;
    if (customAnime.value) {
      domainParts = customAnime.value.split('?')[0].split('#')[0].split('/');
    } else {
      domainParts = customManga.value.split('?')[0].split('#')[0].split('/');
    }
    if (domainParts.length > 2) {
      domain = `${domainParts[0]}//${domainParts[2]}/`;
    }
  }

  if (!domain) {
    utils.flashm('Something is wrong', { error: true });
    return;
  }

  const res = {
    name: customName.value,
    custom: true,
    domain,
    search: {
      anime: customAnime.value ? customAnime.value : null,
      manga: customManga.value ? customManga.value : null,
    },
  };

  model.value = [...model.value, res];
  customName.value = '';
  customAnime.value = '';
  customManga.value = '';
};

// Order

const orderMode = ref(false);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.quicklinkedit {
  padding: @spacer-half 0;
}

.grid {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: @spacer-half;

  .__breakpoint-popup__({
    justify-content: flex-start;
  });
}

.row > td {
  padding-bottom: 15px;
}

.quicklink {
  opacity: 0.5;
  filter: grayscale(1);
  &.active {
    opacity: 1;
    filter: none;
  }
}

.search-field {
  width: 100%;
}

.custom-field {
  min-width: 250px;
}

.ui-row {
  display: flex;
  gap: @spacer-half;
  align-items: stretch;
}

.forSorting {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grab {
  cursor: row-resize;
}
</style>
