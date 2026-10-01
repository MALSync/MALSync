<template>
  <div v-if="obj && obj.getRules().length" class="rules">
    <div class="title">
      {{ lang('UI_Rules') }}
      <template v-if="ruleSet === 'absolute' && ruleEpisode !== undefined">E{{ episode }}</template>
      <template v-else-if="currentSeason !== undefined"
        >S{{ currentSeason }} E{{ episode }}</template
      >
      <select v-model="ruleSet" class="ruleSet" @change="$emit('ruleset', ruleSet)">
        <option v-for="set in ruleSets" :key="set" :value="set">
          {{ lang(`UI_RuleSet_${set}`) }}
        </option>
      </select>
    </div>
    <div v-for="(rule, index) in rules" :key="index" class="rule" :class="activeRule(rule)">
      <div class="header">
        <template v-if="rule.providerName">
          <span class="noHover">{{ rule.providerName }}</span>
          <span class="hover">{{ ruleUrl(rule) }}</span>
        </template>
        <template v-else>{{ ruleUrl(rule) }}</template>
      </div>

      <div class="content">
        <template v-if="ruleSet === 'absolute'">
          {{ lang('UI_Episode') }} {{ rule.absoluteStart }}
          <template v-if="rule.start !== rule.end">
            -
            {{ rule.end === null ? '∞' : rule.absoluteStart + rule.end - rule.start }}</template
          >
        </template>
        <template v-else>
          S{{ rule.season }} {{ lang('UI_Episode') }}
          {{ rule.start }}
          <template v-if="rule.start !== rule.end">
            - {{ rule.end === null ? '∞' : rule.end }}</template
          >
        </template>
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
import { PropType } from 'vue';
import { pageUrl } from '../../../utils/slugs';
import { DEFAULT_RULE_SET, RULE_SETS, RulesClass, RuleSetType } from '../rulesClass';

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
    // Rule set selected for the page
    initialRuleSet: {
      type: String as PropType<RuleSetType>,
      default: DEFAULT_RULE_SET,
    },
  },
  emits: ['ruleset'],
  data() {
    return {
      ruleSet: this.initialRuleSet as RuleSetType,
      ruleSets: RULE_SETS,
    };
  },
  computed: {
    ruleEpisode() {
      if (typeof this.episode !== 'number') return undefined;
      return this.episode + Number(this.offset || 0);
    },
    episodeRules() {
      if (!this.obj || this.ruleEpisode === undefined) return [];
      return this.obj
        .getEpisodeSeasonRules(this.ruleEpisode, this.season, this.ruleSet)
        .sort((a, b) => a.season - b.season || a.start - b.start);
    },
    currentSeason() {
      return this.episodeRules.length ? this.episodeRules[0].season : undefined;
    },
    rules() {
      if (!this.obj) return [];
      // Episode page: rules of the current season, empty if none apply
      if (this.ruleEpisode !== undefined) return this.episodeRules;
      return this.obj
        .getRuleSetRules(this.ruleSet)
        .sort((a, b) => a.season - b.season || a.start - b.start);
    },
    matchingKey() {
      if (!this.obj || this.ruleEpisode === undefined) return undefined;
      const [match] = this.obj.getMatches(this.ruleEpisode, this.season, this.ruleSet);
      return match ? match.key : undefined;
    },
  },
  methods: {
    lang: api.storage.lang,
    ruleUrl(rule) {
      return pageUrl(rule.provider, 'anime', rule.id);
    },
    activeRule(rule) {
      return {
        active: this.matchingKey !== undefined && RulesClass.ruleKey(rule) === this.matchingKey,
      };
    },
  },
};
</script>
