<template>
  <div>
    <Header :spacer="true" class="head">Streaming [TODO]</Header>
    <div v-if="streamRequest.loading" class="grid">
      <FormButton v-for="b in placeholder" :key="b.name" class="placeholder-link">
        <TextIcon icon="sync">{{ b.name }}</TextIcon>
      </FormButton>
    </div>
    <div v-else class="grid">
      <template v-for="b in streamRequest.data" :key="b.name">
        <MediaLink v-if="options(b).length === 1" :href="options(b)[0].value">
          <FormButton>
            <TextIcon :icon="groupIcon(b)" position="after">
              <TextIcon :src="favicon(b.domain)">{{ b.name }}</TextIcon>
            </TextIcon>
          </FormButton>
        </MediaLink>
        <FormDropdown v-else :options="options(b)" align-items="left">
          <template #select>
            <FormButton :animation="false">
              <TextIcon :icon="groupIcon(b)" position="after">
                <TextIcon :src="favicon(b.domain)">{{ b.name }}</TextIcon>
              </TextIcon>
            </FormButton>
          </template>
          <template #option="slotProps">
            <MediaLink
              :href="(slotProps.option.value as string)"
              class="dropdown-link"
              @mousedown.prevent=""
            >
              {{ slotProps.option.title }}
            </MediaLink>
          </template>
        </FormDropdown>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import Header from '../header.vue';
import FormButton from '../form/form-button.vue';
import TextIcon from '../text-icon.vue';
import FormDropdown from '../form/form-dropdown.vue';
import MediaLink from '../media-link.vue';
import { createRequest } from '../../utils/reactive';
import { activeLinks, Quicklink, combinedLinks } from '../../../utils/quicklinksBuilder';

const l = true;

const props = defineProps({
  type: {
    type: String as PropType<'anime' | 'manga'>,
    default: 'anime',
  },
  cacheKey: {
    type: [String, Number],
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  alternativeTitle: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const placeholder = computed(() => {
  return combinedLinks().filter(el => el.search && el.search[props.type]);
});

const parameters = computed(() => {
  if (props.cacheKey) {
    return {
      type: props.type,
      cacheKey: props.cacheKey,
      title: props.title,
    };
  }
  return null;
});

const streamRequest = createRequest(parameters, param => {
  if (!param || !param.value) {
    return Promise.resolve(null);
  }

  return activeLinks(param.value.type, param.value.cacheKey, param.value.title);
});

const favicon = (url: string) => {
  return utils.favicon(url.split('/')[2]);
};

const groupIcon = (el: Quicklink) => {
  switch (el.group) {
    case 'link': {
      const { length } = el.links;
      if (length < 2) {
        return '';
      }
      if (length > 9) {
        return 'filter_9_plus';
      }
      return `filter_${length}`;
    }
    case 'home':
      return 'home';
    case 'search':
      return 'search';
    default:
      throw new Error(`Unknown group: ${el.group}`);
  }
};

const options = (el: Quicklink) => {
  if (el.group === 'search') {
    if (!parameters.value || !el.links[0].fn) {
      return [
        {
          title: el.links[0].name,
          value: el.links[0].url,
        },
      ];
    }
    const searchFn = el.links[0].fn;
    const titles = [...new Set([parameters.value.title, ...props.alternativeTitle])];

    return titles.map(title => {
      return {
        title,
        value: searchFn(title),
      };
    });
  }

  return el.links.map(l => {
    return {
      value: l.url,
      title: l.name,
    };
  });
};
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.__breakpoint-desktop__( {
  .head {
    display: none;
  }
});

.grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.dropdown-link {
  display: block;
  margin: -7px -17px;
  padding: 7px 17px;
}

.placeholder-link {
  .skeleton-loading();

  background-color: var(--cl-backdrop) !important;

  & > span {
    visibility: hidden;
  }
}
</style>
