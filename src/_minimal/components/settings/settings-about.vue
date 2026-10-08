<template>
  <div class="about">
    <!-- ── Version ──────────────────────────────────────────────────────────── -->
    <div class="group">
      <div class="group-title">Version</div>

      <div class="row">
        <span class="row-label">Installed</span>
        <span class="row-value mono">
          {{ installedVersion }}
          <span v-if="installedCommit" class="dim">@ {{ installedCommit }}</span>
        </span>
      </div>

      <div class="row">
        <span class="row-label">Latest</span>
        <span class="row-value">
          <template v-if="latestLoading">
            <span class="dim">Loading…</span>
          </template>
          <template v-else-if="latestError">
            <span class="dim">Unavailable</span>
          </template>
          <template v-else>
            <span class="mono">
              {{ latestVersion }}
              <span v-if="latestCommit" class="dim">@ {{ latestCommit }}</span>
            </span>
            <MediaLink :href="latestUrl" class="tag tag-link">
              Changelog
              <span class="material-icons tag-icon">open_in_new</span>
            </MediaLink>
          </template>
        </span>
      </div>

      <div class="row">
        <span class="row-label">Status</span>
        <span class="row-value">
          <span v-if="latestLoading" class="dim">Checking…</span>
          <span v-else-if="latestError" class="dim">Unknown</span>
          <span v-else-if="isUpToDate" class="tag tag-ok">Up to date</span>
          <MediaLink v-else :href="installLinks.chrome" class="tag tag-warn">
            Update available
            <span class="material-icons tag-icon">open_in_new</span>
          </MediaLink>
        </span>
      </div>

      <div class="row">
        <span class="row-label">Released</span>
        <span class="row-value dim">{{ releasedDate }}</span>
      </div>
    </div>

    <!-- ── Install links ───────────────────────────────────────────────────── -->
    <div class="group">
      <div class="group-title">Install</div>
      <div class="link-row">
        <MediaLink :href="installLinks.chrome" class="install-link">
          <span class="material-icons">web</span>
          Chrome
        </MediaLink>
        <MediaLink :href="installLinks.firefox" class="install-link">
          <span class="material-icons">web</span>
          Firefox
        </MediaLink>
        <MediaLink :href="installLinks.userscript" class="install-link">
          <span class="material-icons">code</span>
          Userscript
        </MediaLink>
        <MediaLink :href="installLinks.pwa" class="install-link">
          <span class="material-icons">open_in_browser</span>
          PWA
        </MediaLink>
      </div>
    </div>

    <!-- ── Backup status ───────────────────────────────────────────────────── -->
    <div class="group">
      <div class="group-title">Backup</div>

      <div class="row">
        <span class="row-label">Local export</span>
        <span class="row-value">
          <span v-if="backup.lastLocal" class="dim">{{ backup.lastLocal }}</span>
          <span v-else class="dim">Never run</span>
        </span>
      </div>

      <div class="row">
        <span class="row-label">Google Drive</span>
        <span class="row-value">
          <span v-if="!backup.driveAvailable" class="dim">Not available</span>
          <span v-else-if="backup.lastDrive" class="dim">{{ backup.lastDrive }}</span>
          <span v-else class="dim">Never run</span>
        </span>
      </div>

      <div class="row">
        <span class="row-label">WebDAV</span>
        <span class="row-value">
          <span v-if="backup.webdavConfigured" class="tag tag-ok">Configured</span>
          <span v-else class="dim">Not configured</span>
          <span v-if="backup.lastWebdav" class="dim row-sub">{{ backup.lastWebdav }}</span>
        </span>
      </div>

      <div class="row">
        <span class="row-label">Backblaze B2</span>
        <span class="row-value">
          <span v-if="backup.b2Configured" class="tag tag-ok">Configured</span>
          <span v-else class="dim">Not configured</span>
          <span v-if="backup.lastB2" class="dim row-sub">{{ backup.lastB2 }}</span>
        </span>
      </div>
    </div>

    <!-- ── Repository ──────────────────────────────────────────────────────── -->
    <div class="group">
      <div class="group-title">Repository</div>

      <div class="link-row">
        <MediaLink href="https://github.com/MALSync/MALSync" class="install-link">
          <span class="material-icons">code</span>
          GitHub
        </MediaLink>
        <MediaLink href="https://discord.com/invite/cTH4yaw" class="install-link">
          <span class="material-icons">forum</span>
          Discord
        </MediaLink>
        <MediaLink href="https://malsync.moe/donate" class="install-link">
          <span class="material-icons">favorite</span>
          Donate
        </MediaLink>
        <MediaLink href="https://github.com/MALSync/MALSync/wiki" class="install-link">
          <span class="material-icons">menu_book</span>
          Wiki
        </MediaLink>
      </div>

      <div class="row">
        <span class="row-label">Stars</span>
        <span class="row-value dim">{{ repoStats.stars ?? '…' }}</span>
      </div>
      <div class="row">
        <span class="row-label">Forks</span>
        <span class="row-value dim">{{ repoStats.forks ?? '…' }}</span>
      </div>
      <div class="row">
        <span class="row-label">Open issues</span>
        <span class="row-value dim">{{ repoStats.issues ?? '…' }}</span>
      </div>
      <div class="row">
        <span class="row-label">License</span>
        <span class="row-value dim">GPL-3.0-only</span>
      </div>
    </div>

    <!-- ── Creator ─────────────────────────────────────────────────────────── -->
    <div class="group">
      <div class="group-title">Creator</div>
      <MediaLink href="https://github.com/lolamtisch" class="contributor creator">
        <img
          src="https://avatars.githubusercontent.com/u/12820146?v=4"
          class="avatar"
          alt="lolamtisch"
          loading="lazy"
        />
        <div class="contributor-info">
          <span class="contributor-name">lolamtisch</span>
          <span class="dim contributor-role">Author &amp; maintainer</span>
        </div>
      </MediaLink>
    </div>

    <!-- ── Contributors ────────────────────────────────────────────────────── -->
    <div class="group">
      <div class="group-title">
        Contributors
        <MediaLink
          href="https://github.com/MALSync/MALSync/graphs/contributors"
          class="group-title-link"
        >
          View all
          <span class="material-icons tag-icon">open_in_new</span>
        </MediaLink>
      </div>

      <div v-if="contributorsLoading" class="dim small-text">Loading…</div>
      <div v-else class="contributors-grid">
        <MediaLink
          v-for="c in contributors"
          :key="c.login"
          :href="c.html_url"
          class="contributor"
          :title="`${c.login} — ${c.contributions} contribution${c.contributions === 1 ? '' : 's'}`"
        >
          <img :src="c.avatar_url" class="avatar" :alt="c.login" loading="lazy" />
          <span class="contributor-name small-text">{{ c.login }}</span>
        </MediaLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import MediaLink from '../media-link.vue';

defineProps({
  title: { type: String, default: '' },
});

// ── Install links (static) ────────────────────────────────────────────────────

const installLinks = {
  chrome: 'https://chrome.google.com/webstore/detail/mal-sync/kekjfbackdeiabghhcdklcdoekaanoel',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/mal-sync',
  userscript: 'https://github.com/MALSync/MALSync/releases/latest/download/malsync.user.js',
  pwa: 'https://malsync.moe',
};

// ── Installed version (from manifest) ────────────────────────────────────────

const installedVersion = api.storage.version();

// Commit hash: not injected at build time yet — shows version only
const installedCommit = null;

// ── Latest release (GitHub API) ───────────────────────────────────────────────

const latestLoading = ref(true);
const latestError = ref(false);
const latestVersion = ref('');
const latestCommit = ref<string | null>(null);
const latestUrl = ref('https://github.com/MALSync/MALSync/releases');
const releasedDate = ref('');
const isUpToDate = ref(false);

interface GhRelease {
  tag_name: string;
  html_url: string;
  published_at: string;
  target_commitish: string;
}

async function fetchLatestRelease() {
  try {
    const res = await fetch('https://api.github.com/repos/MALSync/MALSync/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: GhRelease = await res.json();

    latestVersion.value = data.tag_name.replace(/^v/, '');
    latestUrl.value = data.html_url;
    latestCommit.value = data.target_commitish?.slice(0, 7) ?? null;
    releasedDate.value = data.published_at
      ? new Date(data.published_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
    isUpToDate.value = installedVersion === latestVersion.value;
  } catch {
    latestError.value = true;
  } finally {
    latestLoading.value = false;
  }
}

// ── Repo stats (GitHub API) ───────────────────────────────────────────────────

const repoStats = ref<{ stars?: number; forks?: number; issues?: number }>({});

interface GhRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

async function fetchRepoStats() {
  try {
    const res = await fetch('https://api.github.com/repos/MALSync/MALSync', {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return;
    const data: GhRepo = await res.json();
    repoStats.value = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      issues: data.open_issues_count,
    };
  } catch {
    /* non-fatal */
  }
}

// ── Contributors (GitHub API) ─────────────────────────────────────────────────

interface GhContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

const contributorsLoading = ref(true);
const contributors = ref<GhContributor[]>([]);

async function fetchContributors() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/MALSync/MALSync/contributors?per_page=30',
      { headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: GhContributor[] = await res.json();
    // Exclude bots
    contributors.value = data.filter(c => !c.login.includes('[bot]'));
  } catch {
    /* non-fatal */
  } finally {
    contributorsLoading.value = false;
  }
}

// ── Backup status (storage) ───────────────────────────────────────────────────

const backup = ref({
  lastLocal: '',
  driveAvailable: false,
  lastDrive: '',
  webdavConfigured: false,
  lastWebdav: '',
  b2Configured: false,
  lastB2: '',
});

function formatTs(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return '';
  try {
    return new Date(raw).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

async function loadBackupStatus() {
  // Backup system is webextension-only
  if (api.type !== 'webextension') return;

  const [lastLocal, lastDrive, webdavUrl, lastWebdav, b2KeyId, lastB2] = await Promise.all([
    api.storage.get('backup/lastRun_local'),
    api.storage.get('backup/lastRun_googleDrive'),
    api.storage.get('settings/backup_webdav_url'),
    api.storage.get('backup/lastRun_webdav'),
    api.storage.get('settings/backup_b2_keyId'),
    api.storage.get('backup/lastRun_b2'),
  ]);

  backup.value = {
    lastLocal: formatTs(lastLocal),
    driveAvailable: typeof chrome?.identity?.getAuthToken === 'function',
    lastDrive: formatTs(lastDrive),
    webdavConfigured: !!webdavUrl,
    lastWebdav: formatTs(lastWebdav),
    b2Configured: !!b2KeyId,
    lastB2: formatTs(lastB2),
  };
}

// ── Init ──────────────────────────────────────────────────────────────────────

onMounted(() => {
  fetchLatestRelease();
  fetchRepoStats();
  fetchContributors();
  loadBackupStatus();
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.about {
  display: flex;
  flex-direction: column;
  gap: @spacer;
}

// ── Group ─────────────────────────────────────────────────────────────────────

.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  font-size: @tiny-text;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--cl-light-text);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--cl-backdrop);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-title-link {
  .link();

  margin-inline-start: auto;
  font-size: @tiny-text;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--cl-light-text);
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}

// ── Row ───────────────────────────────────────────────────────────────────────

.row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 3px 0;
  font-size: @small-text;
}

.row-label {
  color: var(--cl-light-text);
  flex-shrink: 0;
  width: 110px;
}

.row-value {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.row-sub {
  display: block;
  font-size: @tiny-text;
}

.mono {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.85em;
}

.dim {
  color: var(--cl-light-text);
}

.small-text {
  font-size: @tiny-text;
}

// ── Tags ──────────────────────────────────────────────────────────────────────

.tag {
  .border-radius-small();

  font-size: @tiny-text;
  padding: 2px 7px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;

  &.tag-ok {
    background-color: rgb(39 174 96 / 15%);
    color: #27ae60;
  }

  &.tag-warn {
    .link();

    background-color: rgb(235 87 87 / 12%);
    color: var(--cl-secondary-text);
  }

  &.tag-link {
    .link();

    background-color: var(--cl-foreground);
    color: var(--cl-light-text);

    &:hover {
      border-color: var(--cl-border-hover);
    }
  }
}

.tag-icon {
  font-size: 11px;
}

// ── Link row ──────────────────────────────────────────────────────────────────

.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0;
}

.install-link {
  .link();
  .border-radius-small();

  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: @small-text;
  background-color: var(--cl-foreground);
  border: 1px solid var(--cl-backdrop);
  transition: border-color @fast-transition;

  &:hover {
    border-color: var(--cl-border-hover);
  }

  .material-icons {
    font-size: 15px;
  }
}

// ── Contributors ──────────────────────────────────────────────────────────────

.contributors-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
}

.contributor {
  .link();

  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 4px;
  border-radius: 20px;
  background-color: var(--cl-foreground);
  border: 1px solid var(--cl-backdrop);
  transition: border-color @fast-transition;

  &:hover {
    border-color: var(--cl-border-hover);
  }

  &.creator {
    padding: 6px 12px 6px 6px;
  }
}

.contributor-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.contributor-name {
  font-size: @small-text;
  color: var(--cl-text);
}

.contributor-role {
  font-size: @tiny-text;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;

  .creator & {
    width: 36px;
    height: 36px;
  }
}
</style>
