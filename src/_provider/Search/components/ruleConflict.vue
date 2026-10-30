<template>
  <div class="ruleConflict">
    <div class="title">{{ lang('correction_RuleConflict') }}</div>
    <div class="results">
      <a
        v-for="option in options"
        :key="option.ruleSet"
        class="result"
        :href="option.url"
        :title="option.url"
        @click="select($event, option.ruleSet)"
      >
        <div class="image"><img v-if="option.image" :src="option.image" /></div>
        <div class="right">
          <span class="title">{{ option.title || option.url }}</span>
          <p v-if="option.season !== undefined">
            {{ lang('correction_RuleEpisode', [String(option.season), String(option.episode)]) }}
          </p>
          <p v-else>{{ lang('UI_Episode') }} {{ option.episode }}</p>
          <p class="ruleSetChange">{{ option.ruleSetChange }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import type { RuleConflict } from '../ruleConflictClass';
import type { RuleSetType } from '../rulesClass';

export default {
  props: {
    conflict: {
      type: Object as PropType<RuleConflict>,
      required: true,
    },
    single: {
      type: Object,
      default: undefined,
    },
    currentUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['select'],
  computed: {
    options(): {
      ruleSet: RuleSetType;
      ruleSetChange: string;
      url: string;
      title: string;
      image: string;
      season?: number;
      episode: number;
    }[] {
      return this.conflict.options.map(option => {
        const isCurrent = Boolean(this.single) && option.url === this.currentUrl;
        return {
          ruleSet: option.ruleSets[0],
          ruleSetChange: this.lang('correction_RuleConflictSwitch', [
            this.lang(`UI_RuleSet_${option.ruleSets[0]}`),
          ]),
          url: option.url || '',
          title: option.title || (isCurrent ? this.single.getTitle() : ''),
          image: isCurrent ? this.single.getImage() : '',
          season: option.season,
          episode: option.episode,
        };
      });
    },
  },
  methods: {
    lang: api.storage.lang,
    select(e, ruleSet: RuleSetType) {
      e.preventDefault();
      this.$emit('select', ruleSet);
    },
  },
};
</script>
