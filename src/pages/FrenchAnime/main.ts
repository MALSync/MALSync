import { pageInterface } from '../pageInterface';

// Déclare les variables globales fournies par l'environnement MALSync pour que TypeScript les reconnaisse.
declare const j: any;
declare const utils: any;
declare const api: any;

export const FrenchAnime: pageInterface = {
  name: 'French Anime',
  domain: 'french-anime.com',
  languages: ['French'],
  type: 'anime',

  isSyncPage(url: string): boolean {
    return Boolean(j.$('#epselect').length);
  },

  isOverviewPage(url: string): boolean {
    return Boolean(j.$('#epselect').length);
  },

  sync: {
    // ==========================================================
    // MODIFIÉ : Utilisation de votre méthode plus fiable pour le titre
    // ==========================================================
    getTitle(url: string): string {
      // On cherche le label "TITRE ORIGINAL:" et on prend l'élément .mov-desc juste après
      const originalTitle = j.$('.mov-label:contains("TITRE ORIGINAL:")').next('.mov-desc').text().trim();
      
      // Si on ne trouve pas de titre original, on se rabat sur le H1 par sécurité
      if (originalTitle) {
        return originalTitle;
      }
      return j.$('h1[itemprop="name"]').text().trim();
    },
    
    getIdentifier(url: string): string {
      const path = new URL(url).pathname;
      const filename = path.split('/').pop() || '';
      return filename.split('-')[0];
    },
    
    getOverviewUrl(url: string): string {
      return url;
    },
    
    getEpisode(url: string): number {
      const selectedValue = j.$('#epselect').val();
      if (typeof selectedValue !== 'string') {
        return 0;
      }
      const match = selectedValue.match(/button_(\d+)/);
      return match ? Number(match[1]) : 0;
    },
  },

  overview: {
    // ==========================================================
    // MODIFIÉ : Utilisation de votre méthode plus fiable pour le titre
    // ==========================================================
    getTitle(url: string): string {
      // On utilise la même logique que pour la page sync
      return FrenchAnime.sync.getTitle(url);
    },
    
    getIdentifier(url: string): string {
      return FrenchAnime.sync.getIdentifier(url);
    },
    
    uiSelector(selector: string): void {
      j.$('.tabsbox.filmlinks').before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      
      elementsSelector(): JQuery<HTMLElement> {
        return j.$('#epselect option');
      },
      
      elementUrl(selector: JQuery<HTMLElement>): string {
        return window.location.href;
      },
      
      elementEp(selector: JQuery<HTMLElement>): number {
        const episodeText = selector.text();
        const match = episodeText.match(/Episode (\d+)/);
        return match ? Number(match[1]) : 0;
      },
    },
  },

  init(page) {
    const handlePage = () => {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
      utils.urlChangeDetect(() => {
        page.reset();
        page.handlePage();
      });
    };

    utils.waitUntilTrue(
      () =>
        Boolean(j.$('h1[itemprop="name"]').length) &&
        Boolean(j.$('#epselect').length),
      handlePage,
      1000,
    );
  },
};