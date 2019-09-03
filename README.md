[![img](https://img.shields.io/travis/com/lolamtisch/MALSync.svg?style=flat-square&logo=travis)](https://travis-ci.com/lolamtisch/MALSync)
[![img](https://img.shields.io/discord/358599430502481920.svg?style=flat-square&logo=discord&label=Chat%20%2F%20Support&colorB=7289DA)](https://discordapp.com/invite/cTH4yaw)
[![img](https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&logo=github&logoColor=white)](https://github.com/lolamtisch/MALSync/issues)
[![Codacy Badge](https://img.shields.io/codacy/grade/e07fabd76b97499788614bf48f8248db.svg?style=flat-square&logo=codacy&logoColor=white)](https://www.codacy.com/app/francisco.seipel/MALSync?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=lolamtisch/MALSync&amp;utm_campaign=Badge_Grade)

# MAL-Sync
**MAL-Sync** is a powerful extension and userscript, which enables automatic episode tracking between MyAnimeList/Anilist/Kitsu/Simkl and multiple anime streaming websites.  

Makes it possible to use your MyAnimeList/Anilist/Kitsu/Simkl anime/mangalist as a centralized bookmarks system for all supported pages.  

#### **Supported Pages** <a id="anchor-link"></a>

<!--pages-->
| Anime                                    | Manga                                    | Media Server                             |
| ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| [![KissAnime](https://www.google.com/s2/favicons?domain=kissanime.ru "KissAnime")](http://kissanime.ru) [kissanime.ru](http://kissanime.ru) | [![KissManga](https://www.google.com/s2/favicons?domain=kissmanga.com "KissManga")](http://kissmanga.com) [kissmanga.com](http://kissmanga.com) | [![Emby](https://www.google.com/s2/favicons?domain=app.emby.media "Emby")](http://app.emby.media) [Emby](http://app.emby.media) [[Wiki]](https://github.com/lolamtisch/MALSync/wiki/Emby-Plex) |
| [![9anime](https://www.google.com/s2/favicons?domain=9anime.to "9anime")](http://9anime.to)  [9anime.to](http://9anime.to) | [![mangadex](https://www.google.com/s2/favicons?domain=mangadex.org "mangadex")](https://mangadex.org) [mangadex.org](https://mangadex.org) | [![Plex](https://www.google.com/s2/favicons?domain=http://app.plex.tv "Plex")](http://app.plex.tv) [Plex](http://app.plex.tv) [[Wiki]](https://github.com/lolamtisch/MALSync/wiki/Emby-Plex) |
| [![otakustream](https://www.google.com/s2/favicons?domain=https://otakustream.tv "otakustream")](https://otakustream.tv) [otakustream.tv](https://otakustream.tv) | [![mangarock](https://www.google.com/s2/favicons?domain=mangarock.com "mangarock")](https://mangarock.com) [mangarock.com](https://mangarock.com) | |
| [![CrunchyRoll](https://www.google.com/s2/favicons?domain=crunchyroll.com "CrunchyRoll")](http://crunchyroll.com) [crunchyroll.com](http://crunchyroll.com) | [![novelplanet.com](https://www.google.com/s2/favicons?domain=https://novelplanet.com "Novelplanet.com")](novelplanet.com) [novelplanet.com](https://novelplanet.com) | |
| [![VRV](https://www.google.com/s2/favicons?domain=vrv.co "VRV")](https://vrv.co) [vrv.co](https://vrv.co) | [![proxer.me](https://www.google.com/s2/favicons?domain=http://proxer.me "Proxer")](http://proxer.me) [proxer.me](http://proxer.me) | |
| [![GoGoAnime](https://www.google.com/s2/favicons?domain=gogoanime.tv/io "GoGoAnime")](http://gogoanime.tv/io) [gogoanime.tv/io](http://gogoanime.tv/io) | [![mangakakalot.com](https://www.google.com/s2/favicons?domain=https://mangakakalot.com "mangakakalot.com")](mangakakalot.com) [mangakakalot.com](https://mangakakalot.com) | |
| [![twist.moe](https://www.google.com/s2/favicons?domain=twist.moe "twist.moe")](https://twist.moe) [twist.moe](https://twist.moe) | [![manganelo.com](https://www.google.com/s2/favicons?domain=https://manganelo.com "manganelo.com")](manganelo.com) [manganelo.com](https://manganelo.com) | |
| [![Anime4you](https://www.google.com/s2/favicons?domain=https://www.anime4you.one "Anime4you")](https://www.anime4you.one) [anime4you.one](https://www.anime4you.one) | [![viz.com](https://www.google.com/s2/favicons?domain=https://viz.com "viz.com")](viz.com) [viz.com](https://viz.com) | |
| [![Branitube](https://www.google.com/s2/favicons?domain=https://branitube.net "Branitube")](https://branitube.net) [branitube.net](https://branitube.net) | | |
| [![Turkanime](https://www.google.com/s2/favicons?domain=http://www.turkanime.tv "Turkanime")](http://www.turkanime.tv) [turkanime.tv](http://www.turkanime.tv) | | |
| [![animepahe](https://www.google.com/s2/favicons?domain=https://animepahe.com "animepahe")](https://animepahe.com) [animepahe.com](https://animepahe.com) | | |
| [![Netflix](https://www.google.com/s2/favicons?domain=https://www.netflix.com "Netflix")](https://www.netflix.com) [netflix.com](https://www.netflix.com) | | |
| [![animeflv](https://www.google.com/s2/favicons?domain=https://animeflv.net "animeflv")](https://animeflv.net) [animeflv.net](https://animeflv.net) | | |
| [![Jkanime](https://www.google.com/s2/favicons?domain=https://jkanime.net "Jkanime")](https://jkanime.net) [jkanime.net](https://jkanime.net) | | |
| [![proxer.me](https://www.google.com/s2/favicons?domain=http://proxer.me "Proxer")](http://proxer.me) [proxer.me](http://proxer.me) | | |
| [![wakanim.tv](https://www.google.com/s2/favicons?domain=https://wakanim.tv "wakanim.tv")](wakanim.tv) [wakanim.tv](http://wakanim.tv) | | |
| [![animevibe.tv](https://www.google.com/s2/favicons?domain=https://animevibe.tv "Animevibe.tv")](animevibe.tv) [animevibe.tv](https://animevibe.tv) | | |
| [![wonderfulsubs.com](https://www.google.com/s2/favicons?domain=https://wonderfulsubs.com "Wonderfulsubs.com")](wonderfulsubs.com) [wonderfulsubs.com](https://wonderfulsubs.com) | | |
| [![kawaiifu.com](https://www.google.com/s2/favicons?domain=https://kawaiifu.com "Kawaiifu.com")](kawaiifu.com) [kawaiifu.com](https://kawaiifu.com) | | |
| [![4Anime.to](https://www.google.com/s2/favicons?domain=https://4Anime.to "4Anime.to")](4Anime.to) [4Anime.to](https://4Anime.to) | | |
| [![dreamanimes.com.br](https://www.google.com/s2/favicons?domain=https://dreamanimes.com.br "dreamanimes.com.br")](dreamanimes.com.br) [dreamanimes.com.br](https://dreamanimes.com.br) | | |
| [![animeultima.eu](https://www.google.com/s2/favicons?domain=https://animeultima.eu "animeultima.eu")](animeultima.eu) [animeultima.eu](https://animeultima.eu) | | |
| [![aniflix.tv](https://www.google.com/s2/favicons?domain=https://aniflix.tv "aniflix.tv")](aniflix.tv) [aniflix.tv](https://aniflix.tv) | | |
| [![animefreak.tv](https://www.google.com/s2/favicons?domain=https://animefreak.tv "animefreak.tv")](animefreak.tv) [animefreak.tv](https://animefreak.tv) | | |
| [![animedaisuki.moe](https://www.google.com/s2/favicons?domain=https://animedaisuki.moe "animedaisuki.moe")](animedaisuki.moe) [animedaisuki.moe](https://animedaisuki.moe) | | |
| [![anime-planet.com](https://www.google.com/s2/favicons?domain=https://anime-planet.com "anime-planet.com")](anime-planet.com) [anime-planet.com](https://anime-planet.com) | | |
| [![kickassanime.io](https://www.google.com/s2/favicons?domain=https://kickassanime.io "kickassanime.io")](kickassanime.io) [kickassanime.io](https://kickassanime.io) | | |
| [![riie.net](https://www.google.com/s2/favicons?domain=https://riie.net "riie.net")](riie.net) [riie.net](https://riie.net) | | |
| [![animekisa.tv](https://www.google.com/s2/favicons?domain=https://animekisa.tv "animekisa.tv")](animekisa.tv) [animekisa.tv](https://animekisa.tv) | | |
| [![animeindo.moe](https://www.google.com/s2/favicons?domain=https://animeindo.moe "animeindo.moe")](animeindo.moe) [animeindo.moe](https://animeindo.moe) | | |
| [![shinden.pl](https://www.google.com/s2/favicons?domain=https://shinden.pl "shinden.pl")](shinden.pl) [shinden.pl](https://shinden.pl) | | |
| [![funimation.com](https://www.google.com/s2/favicons?domain=https://funimation.com "funimation.com")](funimation.com) [funimation.com](https://funimation.com) | | |
| [![voiranime.com](https://www.google.com/s2/favicons?domain=http://voiranime.com "voiranime.com")](voiranime.com) [voiranime.com](http://voiranime.com) | | |  
| [![dubbedanime.net](https://www.google.com/s2/favicons?domain=https://dubbedanime.net "dubbedanime.net")](dubbedanime.net) [dubbedanime.net](https://dubbedanime.net) | | | 
| [![neko-sama.fr](https://www.google.com/s2/favicons?domain=https://neko-sama.fr "neko-sama.fr")](neko-sama.fr) [neko-sama.fr](https://neko-sama.fr) | | | 
| [![anime-odcinki.pl](https://www.google.com/s2/favicons?domain=https://anime-odcinki.pl "anime-odcinki.pl")](anime-odcinki.pl) [anime-odcinki.pl](https://anime-odcinki.pl) | | | 
| [![animezone.pl](https://www.google.com/s2/favicons?domain=https://animezone.pl "animezone.pl")](animezone.pl) [animezone.pl](https://animezone.pl) | | | 
| [![animeflix.io](https://www.google.com/s2/favicons?domain=https://animeflix.io "animeflix.io")](animeflix.io) [animeflix.io](https://animeflix.io) | | | 
<!--/pages-->

[List of supported features by page](pages.md)

#### **Download**  
[![Chrome](https://img.shields.io/chrome-web-store/users/kekjfbackdeiabghhcdklcdoekaanoel.svg?style=flat-square&label=Chrome&logo=google%20chrome&logoColor=white)](https://chrome.google.com/webstore/detail/mal-sync/kekjfbackdeiabghhcdklcdoekaanoel?hl=en)  
[![Firefox](https://img.shields.io/amo/users/mal-sync.svg?style=flat-square&label=Firefox&logo=mozilla%20firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/mal-sync)  
[![Userscript](https://img.shields.io/badge/Userscript-Download-brightgreen.svg?style=flat-square&label=Userscript&logo=javascript&logoColor=white)](https://greasyfork.org/de/scripts/372847-mal-sync)
#### **Complementary Adult Userscript**
[Here](src/pages-adult/README.md)

## What more can it do?

MyAnimeList
  - Direct links to the supported websites
  - Links to the next episode
  - Enlarge thumbnails in many places
  - Adds missing watching status tags like in the related anime section
  - Estimated time to next episode and estimated current episode number (JP release time)

miniMAL (Extension Popup)
  - Allows to browse, search and edit MyAnimeList anime/manga everywhere
  - Access MAL Bookmarks everywhere
  - MAL-Sync's Settings

Update Check [BETA]
  - Checks for new episodes/chapter in the background and sends out a notification
  - Updates the links to the next episode
  - Makes current episode estimation more accurate  
!This feature is disabled by default. You will need to enable it in the miniMAL popup!

## Want to Contribute?
Then let me know on [Discord](https://discordapp.com/invite/cTH4yaw).  

How to build? [Wiki](https://github.com/lolamtisch/MALSync/wiki/Build)

You can't code, but want to help? [Donations](https://github.com/lolamtisch/MALSync/wiki/Donations)
