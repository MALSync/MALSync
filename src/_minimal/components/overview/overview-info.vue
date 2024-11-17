<template>
  <div>
    <Header :spacer="true">{{ lang('overview_Information') }}</Header>
    <div class="flex">
      <div v-for="item in info" :key="item.title" class="item">
        <div class="type">{{ item.title }}</div>
        <div class="content">
          <template v-for="(link, index) in item.body" :key="link">
            <div v-if="'type' in link && link.type === 'weektime' && link.date">
              <template v-if="link.date instanceof Date || !isNaN(Date.parse(link.date))">
                <span dir="auto">{{ getTimezoneDate(link.date) }}</span>
                <br />
                <span>{{ getTimezoneDate(link.date, 'UTC') }}</span>
                <br />
                <span>{{ getTimezoneDate(link.date, 'Asia/Tokyo') }}</span>
              </template>
              <template v-else>{{ link.date }}</template>
            </div>
            <template v-else-if="!('type' in link)">
              <MediaLink v-if="link.url" dir="auto" color="secondary" :href="link.url">
                {{ link.text }}
              </MediaLink>
              <span v-else dir="auto">
                {{ link.text }}
              </span>
              <span v-if="link.subtext" class="subtext">({{ link.subtext }})</span>
              <span v-if="Number(index) + 1 < item.body.length" dir="auto">, </span>
            </template>
          </template>
        </div>
      </div>
      <div v-if="single && single.getProgressCompleted().length" class="item">
        <div class="type">{{ lang('prediction_complete') }}:</div>
        <div class="content">
          <template v-for="(link, index) in single.getProgressCompleted()" :key="link.key">
            <TextIcon
              v-if="single.getType() !== 'manga'"
              spacer="small"
              :icon="link.type === 'sub' ? 'subtitles' : 'record_voice_over'"
            >
              {{ link.label }}
            </TextIcon>
            <span v-else>{{ link.label }}</span>
            <span v-if="Number(index) + 1 < single.getProgressCompleted().length">, </span>
          </template>
        </div>
      </div>
      <div v-if="single && single.getProgressOptions().length" class="item ongoing">
        <div class="type">{{ lang('prediction_ongoing') }}:</div>
        <div class="content ongoing">
          <div
            v-for="link in single.getProgressOptions()"
            :key="link.key"
            class="ongoing-item"
            :title="getTitle(link)"
          >
            <span v-if="single.getType() !== 'manga'" class="material-icons">
              {{ link.type === 'sub' ? 'subtitles' : 'record_voice_over' }}
            </span>
            <span>{{ link.label }}</span>
            <span class="episode">
              {{ single.getType() === 'manga' ? 'CH' : 'EP' }}
              {{ link.episode }}
            </span>
            <span v-if="link.dropped" class="material-icons" title="Dropped">warning</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { Overview } from '../../../_provider/metaOverviewAbstract';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import Header from '../header.vue';
import MediaLink from '../media-link.vue';
import TextIcon from '../text-icon.vue';
import { getDateTimeInLocale, getProgressDateTimeInLocale } from '../../../utils/time';

defineProps({
  info: {
    type: Array as PropType<Overview['info']>,
    default: () => [],
  },
  single: {
    type: Object as PropType<SingleAbstract | null>,
    default: null,
  },
});

function getTitle(item) {
  if (item.lastEp && item.lastEp.timestamp) {
    return getProgressDateTimeInLocale(item.lastEp.timestamp);
  }
  if (item.predicition && item.predicition.timestamp) {
    return api.storage.lang('prediction_next', [
      getProgressDateTimeInLocale(item.predicition.timestamp),
    ]);
  }
  return '';
}

function getTimezoneDate(
  dateElement: Date | string,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
) {
  const userLang = api.storage.lang('locale');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: timezone === 'Asia/Tokyo' ? undefined : 'short',
    timeZone: timezone,
  };

  const date = typeof dateElement === 'string' ? new Date(dateElement) : dateElement;
  return `${getDateTimeInLocale(date, userLang, options)}${timezone === 'Asia/Tokyo' ? ' JST' : ''}`;
}
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.flex {
  grid-gap: @spacer-half;
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;

  .__breakpoint-desktop__({
    flex-direction: column;
    gap: 3px;
  });

  &.ongoing {
    flex-direction: column;
    gap: 3px;
  }

  .type {
    margin-inline-end: 10px;
    font-weight: 600;
    white-space: nowrap;
  }

  .content {
    flex-grow: 1;
    width: 100%;
    line-height: 1.3;

    &.ongoing {
      display: flex;
      flex-direction: column;
    }
  }
}

.episode {
  .border-radius-small();

  display: inline-block;
  border: 1px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);
  font-size: @small-text;
  padding: 2px 5px;
  margin: 5px 0;
}

.ongoing-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subtext {
  margin-left: 3px;
  font-size: @small-text;
}
</style>
