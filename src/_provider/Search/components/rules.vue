<template>
  <div v-if="rules && rules.length" class="rules">
    <div class="title">
      {{ lang('UI_Rules') }}
      <template v-if="isEpisode">S{{ season }} E{{ episode }}</template>
    </div>
    <div v-for="(rule, index) in rules" :key="index" class="rule" :class="activeRule(rule)">
      <div class="header">
        {{ ruleUrl(rule) }}
      </div>

      <div class="content">
        S{{ rule.season }} {{ lang('UI_Episode') }}
        {{ rule.start }}
        <template v-if="rule.start !== rule.end">
          - {{ rule.end === null ? '∞' : rule.end }}</template
        >
        ➞
        {{ rule.episodeStart }}
        <template v-if="rule.start !== rule.end">
          - {{ rule.end === null ? '∞' : rule.episodeStart + rule.end - rule.start }}</template
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { pageUrl } from '../../../utils/slugs';

export default {
  props: {
    obj: {
      type: Object,
      default: undefined,
    },
    episode: {
      type: Number,
      default: undefined,
    },
    season: {
      type: Number,
      default: undefined,
    },
    offset: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {};
  },
  computed: {
    isEpisode() {
      return typeof this.episode === 'number' && typeof this.season === 'number';
    },
    rules() {
      if (!this.obj) return [];
      if (this.isEpisode) {
        return this.obj
          .getMatches(this.episode + Number(this.offset || 0), this.season)
          .map(match => match.rule);
      }
      return [...this.obj.getRules()].sort((a, b) => a.season - b.season || a.start - b.start);
    },
  },
  methods: {
    lang: api.storage.lang,
    ruleUrl(rule) {
      return pageUrl(rule.provider, 'anime', rule.id);
    },
    activeRule(rule) {
      return {
        active: this.obj ? rule === this.obj.activeRule : false,
      };
    },
  },
};
</script>
