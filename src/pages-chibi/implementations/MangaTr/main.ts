import { PageInterface } from '../../pageInterface';

let mangaTrChapterCacheLoaded = false;

const CHAPTER_LINK_SELECTOR =
  '#results a[href*="id-"][href*="chapter-"], #malsync-mangatr-chapters a[href*="id-"][href*="chapter-"], .chapter-list a, .chapters li a, .chapter-item a, .chapter-table a, .chapter-grid a';

const ensureMangaTrChapters = (slug: string) => {
  if (mangaTrChapterCacheLoaded || typeof window === 'undefined') return;
  
  if (document.querySelector('#malsync-mangatr-chapters a[href*="id-"][href*="chapter-"]')) {
    mangaTrChapterCacheLoaded = true;
    return;
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://manga-tr.com/cek/fetch_pages_manga.php?manga_cek=${slug}`, false);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
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
    console.error('Error fetching MangaTr chapters:', error);
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
      return $c
        .or(
          $c.url().regex(String.raw`id-\d+-read-[\w-]+-chapter-\d+(?:\.\d+)?\.html`, 0).boolean().run(),
          $c.url().regex('reader/[^/]+', 0).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.url().regex(String.raw`id-\d+-read-([\w-]+)-chapter-\d+(?:\.\d+)?\.html`, 1).run(),
          $c.url().regex('reader/([^/]+)', 1).run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getTitle').run();
    },
    getOverviewUrl($c) {
      return $c
        .string('https://manga-tr.com/manga-')
        .concat($c.this('sync.getTitle').run())
        .concat('.html')
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.url().regex(String.raw`chapter-(\d+(?:\.\d+)?)\.html`, 1).number().run(),
          $c.url().regex(String.raw`reader/[^/]+/(\d+(?:\.\d+)?)`, 1).number().run(),
        )
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
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
      return $c.url().regex(String.raw`manga-[^.]+\.html`, 0).boolean().run();
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
        .replaceRegex(
          String.raw`[ \t\n\r\f\v]*-(?:[\u00C7C]evrimi[\u00E7c]i\s+T(?:\u00FC|u)rk(?:\u00E7|c)e\s+Manga|T(?:\u00FC|u)rk(?:\u00E7|c)e\s+Manga|.*[Cc]evrimi[cç]i.*T[uü]rk[cç]e.*Manga|.*[Çç]evrimi[cç]i.*T[uü]rk[cç]e.*Manga|.*[Çç]evrimi[cç]i.*T[uü]rk[cç]e.*Manga.*).*`,
          '',
        )
        .replaceRegex(String.raw`[ \t\n\r\f\v]*\([0-9]{4}\)[ \t\n\r\f\v]*$`, '')
        .replaceRegex(String.raw`^([^ :]+)[ \t\n\r\f\v]+(Two.*)$`, '$1: $2')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().regex(String.raw`manga-([^.]+)\.html`, 1).run();
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

      // Extract slug
      try {
        slug = String($c.this('overview.getIdentifier').run());
      } catch (_error) {
        try {
          slug = String($c.this('sync.getIdentifier').run());
        } catch (_error2) {
          const url = String($c.url().run());
          const match = url.match(/manga-([^.]+)\.html/) || url.match(/id-\d+-read-([\w-]+)-chapter/);
          if (match && match[1]) {
            slug = match[1];
          }
        }
      }

      // Ensure chapters are loaded
      if (slug) {
        ensureMangaTrChapters(slug);
      }

      // Wait briefly for async loading
      let nodes = $c.querySelectorAll(CHAPTER_LINK_SELECTOR).run();
      
      // Fallback to window cache if needed
      if ((!nodes || !nodes.length) && typeof window !== 'undefined') {
        const cache = (window as any).__MangaTrChapterCache as { href: string; html: string }[] | undefined;
        if (Array.isArray(cache) && cache.length) {
          let hidden = document.getElementById('malsync-mangatr-chapters');
          if (!hidden) {
            hidden = document.createElement('div');
            hidden.id = 'malsync-mangatr-chapters';
            hidden.style.display = 'none';
            cache.forEach(chapter => {
              const anchor = document.createElement('a');
              anchor.setAttribute('href', chapter.href);
              anchor.textContent = chapter.html;
              hidden!.appendChild(anchor);
            });
            document.body.appendChild(hidden);
          }
          nodes = $c.querySelectorAll(CHAPTER_LINK_SELECTOR).run();
        }
      }

      return nodes;
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .coalesce(
          $c.text().regex(String.raw`Chapter\s*(\d+(?:\.\d+)?)`, 1).number().run(),
          $c.text().regex(String.raw`Blm\s*(\d+(?:\.\d+)?)`, 1).number().run(),
          $c.text().regex(String.raw`(?:^|\s)(\d+(?:\.\d+)?)$`, 1).number().run(),
          $c.getAttribute('href').regex(String.raw`chapter-(\d+(?:\.\d+)?)\.html`, 1).number().run(),
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
          $c.querySelector('#results, .chapter-list, .chapters, #malsync-mangatr-chapters').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
