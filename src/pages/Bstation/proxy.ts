/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
export function script() {
  const w = window as any;

  const meta: any = {
    title: undefined as string | undefined,
    episode: undefined as number | undefined,
    seriesId: undefined as string | undefined,
    episodeId: undefined as string | undefined,
  };

  try {
    const parts = (window.location.pathname || '/').split('/').filter(Boolean);
    // {lang}/play/{seriesId}/{episodeId} OR {lang}/media/{seriesId}
    const [, , sid, eid] = parts;
    meta.seriesId = sid;
    meta.episodeId = eid;

    const state = w.__initialState || w.__INITIAL_STATE__ || w.__INITIAL_STATE;

    const deepWalk = (obj: any, fn: (k: string, v: any, p: any) => void) => {
      const stack: Array<{ k: string; v: any; p: any }> = [{ k: 'root', v: obj, p: undefined }];
      const seen = new WeakSet();
      while (stack.length) {
        const { k, v, p } = stack.pop()!;
        try {
          fn(k, v, p);
        } catch (e) {
          /* ignore */
        }
        if (v && typeof v === 'object' && !seen.has(v)) {
          seen.add(v);
          if (Array.isArray(v)) {
            for (let i = 0; i < v.length; i++) stack.push({ k: String(i), v: v[i], p: v });
          } else {
            for (const key of Object.keys(v)) stack.push({ k: key, v: v[key], p: v });
          }
        }
      }
    };

    // Try to determine title from state
    const titleCandidates = new Set<string>();
    if (state) {
      deepWalk(state, (k, v) => {
        if (typeof v === 'string') {
          if (/\S/.test(v) && v.length >= 2 && v.length <= 200) {
            if (/Bstation/i.test(v)) return;
            if (/https?:\/\//i.test(v)) return;
            if (/\.m3u8|\.mp4|\.m4s/i.test(v)) return;
            if (/\bepisode\b|\b1080p\b|\b720p\b/i.test(v)) return;
            // common title-like keys
            if (/title|name|season/i.test(k)) titleCandidates.add(v.trim());
          }
        }
      });
    }

    // Use the longest plausible candidate
    if (titleCandidates.size) {
      meta.title = Array.from(titleCandidates).sort((a, b) => b.length - a.length)[0];
    }

    // Try JSON-LD BreadcrumbList as a strong fallback
    try {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of Array.from(scripts)) {
        const txt = s.textContent || '';
        if (!txt) continue;
        const data = JSON.parse(txt);
        const arr = Array.isArray(data) ? data : [data];
        for (const d of arr) {
          if (
            d &&
            d['@type'] === 'BreadcrumbList' &&
            d.itemListElement &&
            d.itemListElement.length
          ) {
            const it = d.itemListElement[1] || d.itemListElement[0];
            if (it && it.name) {
              meta.title = String(it.name)
                .replace(/\s*Detail\s*-\s*Bstation/i, '')
                .replace(/\s*-\s*Bstation/i, '')
                .trim();
            }
          }
        }
      }
    } catch (e) {
      /* ignore */
    }

    // Episode: try to map by episodeId within a list from state
    if (state && eid) {
      let foundEp: number | undefined;
      deepWalk(state, (k, v, p) => {
        if (!foundEp && v && typeof v === 'object') {
          const keys = Object.keys(v);
          const idKey = keys.find(x => /^(ep[_-]?id|episode[_-]?id|id)$/i.test(x));
          if (idKey && String(v[idKey]) === String(eid)) {
            // common episode index keys
            const epKeys = keys.filter(x =>
              /^(index|order|number|ep|episode|display[_-]?index)$/i.test(x),
            );
            for (const ek of epKeys) {
              const num = Number(v[ek]);
              if (Number.isFinite(num) && num > 0 && num < 10000) {
                foundEp = num;
                break;
              }
            }
            if (!foundEp && Array.isArray(p)) {
              const idx = p.findIndex((x: any) => x && String(x[idKey]) === String(eid));
              if (idx >= 0) foundEp = idx + 1;
            }
          }
        }
      });
      meta.episode = foundEp;
    }

    // Episode fallback: scan DOM text like "E12"
    if (meta.episode === undefined || meta.episode === null) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const s = (n.textContent || '').trim();
        if (s.length > 0 && s.length < 64) {
          const m = s.match(/\bE(\d{1,4})\b/i);
          if (m) {
            meta.episode = Number(m[1]);
            break;
          }
        }
      }
    }

    return meta;
  } catch (e) {
    try {
      return { error: String(e) };
    } catch (err) {
      return {};
    }
  }
}
