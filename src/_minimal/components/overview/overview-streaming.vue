<template>
  <div>
    <Header :spacer="true" class="head">Streaming [TODO]</Header>
    <div v-if="!streamRequest.loading" class="grid">
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
import { SingleAbstract } from '../../../_provider/singleAbstract';
import { activeLinks, Quicklink } from '../../../utils/quicklinksBuilder';

const props = defineProps({
  single: {
    type: Object as PropType<SingleAbstract | null>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  alternativeTitle: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const parameters = computed(() => {
  if (props.single && !props.loading) {
    return {
      type: props.single.getType(),
      cacheKey: props.single.getApiCacheKey(),
      title: props.single.getTitle(),
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
  margin: -7px -17px;
  padding: 7px 17px;
}
</style>
