
let mangaTrChapterCacheLoaded = false;

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
      const wrapper = document.createElement('div');
      wrapper.innerHTML = xhr.responseText;
      wrapper.querySelectorAll('script').forEach(script => script.remove());
      const results = wrapper.querySelector('#results');

      if (results && results.children.length) {
        const hidden = document.createElement('div');
        hidden.id = 'malsync-mangatr-chapters';
        hidden.style.display = 'none';
        hidden.append(...Array.from(results.children));
        document.body.appendChild(hidden);
        mangaTrChapterCacheLoaded = true;
      }
    }
  } catch (error) {
    // Ignore network errors; fallback to existing DOM
  }
};

import { PageInterface } from '../../pageInterface';

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
          $c.url().regex('id-\\d+-read-[\\w-]+-chapter-\\d+(?:\\.\\d+)?\\.html', 0).boolean().run(),
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
          $c.url().regex('id-\\d+-read-([\\w-]+)-chapter-\\d+(?:\\.\\d+)?\\.html', 1).run(),
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
              $c.url().regex('manga-([^.]+)\.html', 1).run(),
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
          $c.url().regex('chapter-(\\d+(?:\\.\\d+)?)\\.html', 1).number().run(),
          // Fallback for reader pattern
          $c.url().regex('reader/[^/]+/(\\d+(?:\\.\\d+)?)', 1).number().run(),
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
      return $c.url().regex('manga-[^.]+\\.html', 0).boolean().run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('[property="og:title"]').ifNotReturn().getAttribute('content').run(),
          $c.title().run(),
          $c.querySelector('h1.manga-title, h1.series-title, h1').ifNotReturn().text().run(),
        )
        .trim()
        .replaceRegex('[ \t\n\r\f\v]*[-|][ \t\n\r\f\v]*MangaTR.*$', '')
        .replaceRegex('[ \t\n\r\f\v]*Manga Oku.*$', '')
        .replaceRegex('[ \t\n\r\f\v]*-[ \t\n\r\f\v]*Çevrimiçi.*$', '')
        .replaceRegex('[ \t\n\r\f\v]*\([0-9]{4}\)[ \t\n\r\f\v]*$', '')
        .replaceRegex('^([^ :]+)[ \t\n\r\f\v]+(Two.*)$', '$1: $2')
        .trim()
        .run();
    },
    getIdentifier($c) {
      // Extract manga name from URL
      return $c.url().regex('manga-([^.]+)\\.html', 1).run();
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
        slug = String($c.this('overview.getIdentifier').run());
      } catch (error) {
        try {
          slug = String($c.this('sync.getIdentifier').run());
        } catch (syncError) {
      return $c
        .querySelectorAll('#results a[href*"id-"][href*"chapter-"], #malsync-mangatr-chapters a[href*"id-"][href*"chapter-"], .chapter-list a, .chapters li a, .chapter-item a')
        .run();
          const fallbackUrl = String($c.url().run());
          const directMatch = pageUrl.match(/manga-([^.]+)\.html/);
          if (directMatch && directMatch[1]) {
            slug = directMatch[1];
          } else {
            const chapterMatch = pageUrl.match(/id-\d+-read-([\w-]+)-chapter/);
            if (chapterMatch && chapterMatch[1]) {
              slug = chapterMatch[1];
            }
          }
          }
        }
      }

      if (slug) {
        ensureMangaTrChapters(slug);
      }
      return $c
        .querySelectorAll('#results a[href*"id-"][href*"chapter-"], #malsync-mangatr-chapters a[href*"id-"][href*"chapter-"], .chapter-list a, .chapters li a, .chapter-item a')
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .coalesce(
          $c.text().regex('Chapter\s*(\d+(?:\.\d+)?)', 1).number().run(),
          $c.text().regex('Bölüm\s*(\d+(?:\.\d+)?)', 1).number().run(),
          $c.text().regex('(?:^|\s)(\d+(?:\.\d+)?)$', 1).number().run(),
          $c.getAttribute('href').regex('chapter-(\d+(?:\.\d+)?)\.html', 1).number().run(),
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
