<template>
  <div v-if="rules && rules.length" class="rules">
    <div class="title">{{ lang('UI_Rules') }}</div>
    <div v-for="(rule, index) in rules" :key="index" class="rule" :class="activeRule(rule)">
      <div class="header">
        <template v-if="rule.to.title">
          <span class="noHover">
            {{ rule.to.title }}
          </span>
          <span class="hover">
            {{ rule.to.url }}
          </span>
        </template>
        <template v-else>
          {{ rule.to.url }}
        </template>
      </div>

      <div class="content">
        {{ lang('UI_Episode') }}
        {{ rule.from.start }}
        <template v-if="rule.from.start !== rule.from.end">
          - {{ Number.MAX_SAFE_INTEGER === rule.from.end ? '∞' : rule.from.end }}</template
        >
        ➞
        {{ Number.MAX_SAFE_INTEGER === rule.to.start ? '∞' : rule.to.start }}
        <template v-if="rule.to.start !== rule.to.end">
          - {{ Number.MAX_SAFE_INTEGER === rule.to.end ? '∞' : rule.to.end }}</template
        >
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  props: {
    obj: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {};
  },
  computed: {
    rules() {
      if (this.obj && this.obj.getRules()) {
        return this.obj.getRules().sort((a, b) => a.from.start - b.from.start);
      }
      return [];
    },
  },
  methods: {
    lang: api.storage.lang,
    activeRule(rule) {
      return {
        active: this.obj ? rule === this.obj.activeRule : false,
      };
    },
  },
};
</script>
