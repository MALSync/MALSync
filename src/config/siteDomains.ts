// Centralized Domain Registry
// This file manages the active domains and aliases for all supported sites.
// When a pirate site changes domain (e.g., .com -> .to), update it here.

export const SITE_DOMAINS = {
  animeflv: {
    main: 'https://animeflv.net',
    aliases: ['https://animeflv.to', 'https://animeflv.ru', 'https://m.animeflv.net'],
  },
  animeId: {
    main: 'https://www.animeid.tv',
    aliases: [],
  },
  animeUnity: {
    main: 'https://animeunity.it',
    aliases: [],
  },
  animeGo: {
    main: 'https://animego.me',
    aliases: [],
  },
  trAnimeizle: {
    main: 'https://www.tranimeizle.net',
    aliases: [],
  },
  turkAnime: {
    main: 'https://www.turkanime.co',
    aliases: ['https://www.turkanime.net'],
  },
  // Add other sites here as they are migrated to the new architecture
};

export type SiteDomainKey = keyof typeof SITE_DOMAINS;
