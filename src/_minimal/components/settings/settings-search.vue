<template>
  <div class="settings-search" :class="{ active: open }">
    <div class="search-bar" @click="handleBarClick">
      <span class="material-icons search-icon">manage_search</span>
      <input
        v-show="open"
        ref="inputEl"
        v-model="query"
        class="search-input"
        type="search"
        placeholder="Search settings…"
        autocomplete="off"
        spellcheck="false"
        @keydown.escape="close"
        @keydown.down.prevent="moveFocus(1)"
        @keydown.up.prevent="moveFocus(-1)"
        @keydown.enter.prevent="selectFocused"
        @blur="onBlur"
      />
      <span v-if="open && query" class="result-count">{{ results.length || 'none' }}</span>
    </div>

    <div v-if="open && results.length" class="results">
      <div
        v-for="(result, i) in results"
        :key="result.navPath.join('/')"
        class="result-item"
        :class="{ focused: focusIndex === i }"
        @mousedown.prevent="navigate(result)"
      >
        <span class="result-section">{{ result.sectionTitle }}</span>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="result-title" v-html="result.highlighted" />
      </div>
    </div>

    <div v-if="open && query && !results.length" class="no-results">No results</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { structure } from './settings-structure';
import type { ConfObj } from '../../../_provider/definitions';

const router = useRouter();

const open = ref(false);
const query = ref('');
const focusIndex = ref(-1);
const inputEl = ref<HTMLInputElement | null>(null);
let allItems: FlatItem[] = [];

// ── Types ─────────────────────────────────────────────────────────────────────

interface FlatItem {
  title: string;
  sectionTitle: string;
  navPath: string[];
  highlighted: string;
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function escHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

function getTitle(item: ConfObj): string {
  try {
    return typeof item.title === 'function' ? item.title() : item.title;
  } catch {
    return '';
  }
}

function flatten(items: ConfObj[], path: string[] = [], sectionTitle = ''): FlatItem[] {
  return items.reduce<FlatItem[]>((out, item) => {
    if (item.condition && !item.condition()) return out;
    if (item.system && item.system !== api.type) return out;
    const title = getTitle(item);
    if (!title) return out;
    if (item.children?.length) {
      return out.concat(flatten(item.children, [...path, item.key], title));
    }
    return out.concat({
      title,
      sectionTitle: sectionTitle || title,
      navPath: [...path, item.key],
      highlighted: '',
    });
  }, []);
}

function matchAndHighlight(haystack: string, needle: string): { match: boolean; html: string } {
  const lo = haystack.toLowerCase();
  const ln = needle.toLowerCase();
  const idx = lo.indexOf(ln);
  if (idx !== -1) {
    return {
      match: true,
      html: `${escHtml(haystack.slice(0, idx))}<mark>${escHtml(haystack.slice(idx, idx + needle.length))}</mark>${escHtml(haystack.slice(idx + needle.length))}`,
    };
  }
  // character-order fuzzy fallback
  let hi = 0;
  let ni = 0;
  const pos: number[] = [];
  while (hi < lo.length && ni < ln.length) {
    if (lo[hi] === ln[ni]) {
      pos.push(hi);
      ni++;
    }
    hi++;
  }
  if (ni < ln.length) return { match: false, html: escHtml(haystack) };
  let html = '';
  let prev = 0;
  pos.forEach(p => {
    html += `${escHtml(haystack.slice(prev, p))}<mark>${escHtml(haystack[p])}</mark>`;
    prev = p + 1;
  });
  html += escHtml(haystack.slice(prev));
  return { match: true, html };
}

// ── Navigation ────────────────────────────────────────────────────────────────

function close() {
  open.value = false;
  query.value = '';
  focusIndex.value = -1;
}

function navigate(item: FlatItem) {
  close();
  router.push({ name: 'Settings', params: { path: item.navPath } });
}

async function openSearch() {
  open.value = true;
  await nextTick();
  inputEl.value?.focus();
}

function handleBarClick() {
  if (!open.value) openSearch();
}

function onBlur() {
  // delay so mousedown on a result item fires first
  setTimeout(() => {
    if (!query.value) close();
  }, 200);
}

// ── Global keyboard shortcut ──────────────────────────────────────────────────

function onGlobalKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    openSearch();
  }
}

// ── Keyboard nav in results ───────────────────────────────────────────────────

function moveFocus(delta: number) {
  if (!results.value.length) return;
  focusIndex.value = Math.max(0, Math.min(results.value.length - 1, focusIndex.value + delta));
}

function selectFocused() {
  const idx = focusIndex.value >= 0 ? focusIndex.value : 0;
  const item = results.value[idx];
  if (item) navigate(item);
}

// ── Results ───────────────────────────────────────────────────────────────────

const results = computed<FlatItem[]>(() => {
  const q = query.value.trim();
  if (!q) return [];
  return allItems
    .reduce<FlatItem[]>((out, item) => {
      const { match, html } = matchAndHighlight(item.title, q);
      if (match) out.push({ ...item, highlighted: html });
      return out;
    }, [])
    .slice(0, 15);
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  allItems = flatten(structure);
  window.addEventListener('keydown', onGlobalKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKey);
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.settings-search {
  position: relative;
  margin-bottom: @spacer-half;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    border-color @fast-transition,
    background-color @fast-transition;

  &:hover {
    border-color: var(--cl-backdrop);
    background-color: var(--cl-foreground);
  }

  .settings-search.active & {
    border-color: var(--cl-backdrop);
    background-color: var(--cl-foreground);
  }
}

.search-icon {
  font-size: 18px;
  color: var(--cl-light-text);
  flex-shrink: 0;
  user-select: none;

  .settings-search.active & {
    color: var(--cl-primary);
  }
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: @small-text;
  color: var(--cl-text);
  min-width: 0;
  width: 100%;
  font-family: inherit;

  &::placeholder {
    color: var(--cl-light-text);
  }

  /* stylelint-disable-next-line property-no-vendor-prefix */
  &::-webkit-search-cancel-button {
    display: none;
  }

  // stylelint-disable-next-line plugin/no-unsupported-browser-features
  .__breakpoint-popup__({
    font-size: @tiny-text;
  });
}

.result-count {
  font-size: @tiny-text;
  color: var(--cl-light-text);
  white-space: nowrap;
  flex-shrink: 0;
}

// ── Dropdown ──────────────────────────────────────────────────────────────────

.results {
  .border-radius();
  .big-shadow();

  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--cl-foreground-solid);
  border: 1px solid var(--cl-backdrop);
  overflow: hidden;
  z-index: 50;
  max-height: 280px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--cl-backdrop);
  transition: background-color @fast-transition;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.focused {
    background-color: var(--cl-foreground-active);
  }
}

.result-section {
  font-size: @tiny-text;
  color: var(--cl-light-text);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 60px;
}

.result-title {
  font-size: @small-text;
  color: var(--cl-text);

  :deep(mark) {
    background-color: rgb(255 213 0 / 30%);
    color: inherit;
    border-radius: 2px;
  }
}

.no-results {
  .border-radius();
  .big-shadow();

  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  padding: 10px 12px;
  font-size: @small-text;
  color: var(--cl-light-text);
  text-align: center;
  background-color: var(--cl-foreground-solid);
  border: 1px solid var(--cl-backdrop);
}
</style>
