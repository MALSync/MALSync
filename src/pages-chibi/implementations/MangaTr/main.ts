import { PageInterface } from '../../pageInterface';

let mangaTrChapterCacheLoaded = false;

const CHAPTER_LINK_SELECTOR =
  '#results a[href*="id-"][href*="chapter-"], #malsync-mangatr-chapters a[href*="id-"][href*="chapter-"], .chapter-list a, .chapters li a, .chapter-item a';

const ensureMangaTrChapters = (slug: string) => {
  if (mangaTrChapterCacheLoaded || typeof window === 'undefined') return;
  if (document.querySelector('#malsync-mangatr-chapters a[href*="id-"][href*="chapter-"]')) {
    mangaTrChapterCacheLoaded = true;
    return;
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://manga-tr.com/cek/fetch_pages_manga.php?manga_cek=${slug}`, false);
    xhr.send();

    if (xhr.status >= 200 && xhr.status < 300) {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(xhr.responseText, 'text/html');
      const results = parsed.querySelector('#results');

      if (results && results.children.length) {
        const hidden = document.createElement('div');
        hidden.id = 'malsync-mangatr-chapters';
        hidden.style.display = 'none';
        Array.from(results.children).forEach(child => {
          hidden.appendChild(child.cloneNode(true));
        });
        document.body.appendChild(hidden);
        mangaTrChapterCacheLoaded = true;
      }
    }
  } catch (error) {
    // Ignore network errors; fallback to existing DOM
  }
};

export const MangaTr: PageInterface = {
  name: 'MangaTr',
  domain: ['https://manga-tr.com'],
  languages: ['Turkish'],
  type: 'manga',
  urls: {
    match: ['*://manga-tr.com/*'],
  },
  search: 'https://manga-tr.com/search?query={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      // Simplified pattern for sync page detection
      return $c
        .or(
          // Main URL structure
          $c
            .url()
            .regex(String.raw`id-\d+-read-[\w-]+-chapter-\d+(?:\.\d+)?\.html`, 0)
            .boolean()
            .run(),
          // Fallback patterns
          $c.url().regex('reader/[^/]+', 0).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      // Simplified title extraction
      return $c
        .coalesce(
          // Main pattern
          $c
            .url()
            .regex(String.raw`id-\d+-read-([\w-]+)-chapter-\d+(?:\.\d+)?\.html`, 1)
            .run(),
          // Fallback for reader pattern
          $c.url().regex('reader/([^/]+)', 1).run(),
        )
        .run();
    },
    getIdentifier($c) {
      // Use same pattern as title
      return $c.this('sync.getTitle').run();
    },
    getOverviewUrl($c) {
      return $c
        .string('https://manga-tr.com/manga-')
        .concat(
          $c
            .coalesce(
              $c.this('sync.getTitle').run(),
              $c.url().regex('reader/([^/]+)', 1).run(),
              $c
                .url()
                .regex(String.raw`manga-([^.]+)\.html`, 1)
                .run(),
            )
            .run(),
        )
        .concat('.html')
        .run();
    },
    getEpisode($c) {
      // Simplified chapter number extraction
      return $c
        .coalesce(
          // Main pattern
          $c
            .url()
            .regex(String.raw`chapter-(\d+(?:\.\d+)?)\.html`, 1)
            .number()
            .run(),
          // Fallback for reader pattern
          $c
            .url()
            .regex(String.raw`reader/[^/]+/(\d+(?:\.\d+)?)`, 1)
            .number()
            .run(),
        )
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      // Simplified next chapter URL detection
      return $c
        .querySelector('a.next-chapter, a.next-btn, a[title*="Next"], a[title*="Sonraki"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    readerConfig: [
      {
        current: {
          selector: '.chapter-container img, .reader img, .manga-reader img, .page-container img',
          mode: 'countAbove',
        },
        total: {
          selector: '.chapter-container img, .reader img, .manga-reader img, .page-container img',
          mode: 'count',
        },
      },
    ],
    uiInjection($c) {
      return $c
        .querySelector('.reader-controls, .chapter-info, .navigation, .reader-header')
        .ifNotReturn()
        .uiAfter()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      // Simplified pattern for overview page detection
      return $c
        .url()
        .regex(String.raw`manga-[^.]+\.html`, 0)
        .boolean()
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('[property="og:title"]').ifNotReturn().getAttribute('content').run(),
          $c.title().run(),
          $c.querySelector('h1.manga-title, h1.series-title, h1').ifNotReturn().text().run(),
        )
        .trim()
        .replaceRegex(String.raw`[ \t\n\r\f\v]*[-|][ \t\n\r\f\v]*MangaTR.*$`, '')
        .replaceRegex(String.raw`[ \t\n\r\f\v]*Manga Oku.*$`, '')
        .replaceRegex(String.raw`[ \t\n\r\f\v]*-[ \t\n\r\f\v]*Çevrimiçi.*$`, '')
        .replaceRegex(String.raw`[ \t\n\r\f\v]*\([0-9]{4}\)[ \t\n\r\f\v]*$`, '')
        .replaceRegex(String.raw`^([^ :]+)[ \t\n\r\f\v]+(Two.*)$`, '$1: $2')
        .trim()
        .run();
    },
    getIdentifier($c) {
      // Extract manga name from URL
      return $c
        .url()
        .regex(String.raw`manga-([^.]+)\.html`, 1)
        .run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    uiInjection($c) {
      return $c.querySelector('.manga-info, .series-info, h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      let slug: string | null = null;

      try {
        const identifier = $c.this('overview.getIdentifier').run();
        if (identifier) {
          slug = String(identifier);
        }
      } catch (_error) {
        // Ignore missing overview identifier
      }

      if (!slug) {
        try {
          const identifier = $c.this('sync.getIdentifier').run();
          if (identifier) {
            slug = String(identifier);
          }
        } catch (_error) {
          // Ignore missing sync identifier
        }
      }

      if (!slug) {
        const fallbackUrl = String($c.url().run());
        const directMatch = fallbackUrl.match(/manga-([^.]+)\.html/);
        if (directMatch && directMatch[1]) {
          slug = directMatch[1];
        } else {
          const chapterMatch = fallbackUrl.match(/id-\d+-read-([\w-]+)-chapter/);
          if (chapterMatch && chapterMatch[1]) {
            slug = chapterMatch[1];
          }
        }
      }

      if (slug) {
        ensureMangaTrChapters(slug);
      }

      return $c.querySelectorAll(CHAPTER_LINK_SELECTOR).run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .coalesce(
          $c
            .text()
            .regex(String.raw`Chapter\s*(\d+(?:\.\d+)?)`, 1)
            .number()
            .run(),
          $c
            .text()
            .regex(String.raw`Bölüm\s*(\d+(?:\.\d+)?)`, 1)
            .number()
            .run(),
          $c
            .text()
            .regex(String.raw`(?:^|\s)(\d+(?:\.\d+)?)$`, 1)
            .number()
            .run(),
          $c
            .getAttribute('href')
            .regex(String.raw`chapter-(\d+(?:\.\d+)?)\.html`, 1)
            .number()
            .run(),
        )
        .ifNotReturn()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .trigger()
        .detectChanges($c.url().urlStrip().run(), $c.trigger().run())
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('#results, .chapter-list, .chapters').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
