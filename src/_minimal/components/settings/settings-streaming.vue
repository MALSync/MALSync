<template>
  <div class="quicklinkedit">
    <Section spacer="half">
      <Card>
        <Section>
          <FormText
            v-model="search"
            icon="search"
            :clear-icon="true"
            class="search-field"
          ></FormText>
        </Section>
        <div class="grid">
          <div
            v-for="link in linksWithState"
            :key="link.name"
            class="mdl-chip quicklink"
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
      </Card>
    </Section>
    <Card>
      <Header :spacer="true">Custom search links</Header>
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
        <FormText v-model="customName" placeholder="Name" class="custom-field" />
      </Section>
      <Section spacer="half">
        <FormText v-model="customAnime" placeholder="Anime Search Url" class="custom-field" />
      </Section>
      <Section spacer="half">
        <FormText v-model="customManga" placeholder="Manga Search Url" class="custom-field" />
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
import { quicklinks, removeOptionKey } from '../../../utils/quicklinksBuilder';
import FormButton from '../form/form-button.vue';
import TextIcon from '../text-icon.vue';
import Card from '../card.vue';
import FormText from '../form/form-text.vue';
import Section from '../section.vue';
import Header from '../header.vue';
import CodeBlock from '../code-block.vue';
import HR from '../hr.vue';

function stateNumber(link) {
  if (link.custom) return 0;
  if (link.database) return 1;
  if (link.search && !(link.search.anime === 'home' || link.search.manga === 'home')) return 2;
  return 10;
}

const model = computed({
  get() {
    return api.settings.get('quicklinks');
  },
  set(value) {
    api.settings.set('quicklinks', value);
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
  gap: 15px;
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
</style>
