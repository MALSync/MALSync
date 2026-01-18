[![Discord](https://img.shields.io/discord/358599430502481920.svg?style=flat-square&logo=discord&label=Chat%20%2F%20Support&colorB=7289DA)](https://discord.com/invite/cTH4yaw)
[![Issues](https://img.shields.io/github/issues/MALSync/MALSync.svg?style=flat-square&logo=github&logoColor=white)](https://github.com/MALSync/MALSync/issues)
[![CodeFactor](https://www.codefactor.io/repository/github/MALSync/MALSync/badge)](https://www.codefactor.io/repository/github/MALSync/MALSync)
[![Translation status](https://translate.malsync.moe/widgets/mal-sync/-/extension/svg-badge.svg)](https://translate.malsync.moe/engage/mal-sync/)

# MAL-Sync

**MAL-Sync** is a powerful extension and userscript, which enables automatic episode tracking between MyAnimeList/Anilist/Kitsu/Simkl and multiple anime streaming websites.

Makes it possible to use your MyAnimeList/Anilist/Kitsu/Simkl anime/mangalist as a centralized bookmarks system for all supported pages.

#### **Supported Pages** <a id="anchor-link"></a>

<!--pages-->
  <table>
    <thead>
      <tr>
        <th>Anime</th>
        <th>Manga</th>
        <th>Media Server</th>
      </tr>
    </thead>
    <tbody>
      <tr>
                <td><a href="https://www.adkami.com/"><img src="https://favicon.malsync.moe/?domain=https://www.adkami.com/"> ADKami</a></td>
                <td><a href="https://armageddontl.com"><img src="https://favicon.malsync.moe/?domain=https://armageddontl.com"> Armageddon</a></td>
                <td><a href="http://app.emby.media"><img src="https://favicon.malsync.moe/?domain=app.emby.media"></a> <a href="http://app.emby.media">Emby</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex#emby">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://animationdigitalnetwork.com"><img src="https://favicon.malsync.moe/?domain=https://animationdigitalnetwork.com"> ADN</a></td>
                <td><a href="https://arvencomics.com"><img src="https://favicon.malsync.moe/?domain=https://arvencomics.com"> ArvenComics</a></td>
                <td><a href="http://app.plex.tv"><img src="https://favicon.malsync.moe/?domain=http://app.plex.tv"></a> <a href="http://app.plex.tv">Plex</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex#plex">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://an1me.to"><img src="https://favicon.malsync.moe/?domain=https://an1me.to"> An1me</a></td>
                <td><a href="https://asmotoon.com"><img src="https://favicon.malsync.moe/?domain=https://asmotoon.com"> AsmodeusScans</a></td>
                <td><a href="https://jellyfin.org/"><img src="https://favicon.malsync.moe/?domain=https://jellyfin.org/"></a> <a href="https://jellyfin.org/">Jellyfin</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex#jellyfin">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://anicrush.to"><img src="https://favicon.malsync.moe/?domain=https://anicrush.to"> Anicrush</a></td>
                <td><a href="https://asuracomic.net/"><img src="https://favicon.malsync.moe/?domain=https://asuracomic.net/"> AsuraScans</a></td>
                <td><a href="https://komga.org/"><img src="https://favicon.malsync.moe/?domain=https://komga.org/"></a> <a href="https://komga.org/">Komga</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex#komga">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://anidream.cc"><img src="https://favicon.malsync.moe/?domain=https://anidream.cc"> AniDream</a></td>
                <td><a href="https://atsu.moe/"><img src="https://favicon.malsync.moe/?domain=https://atsu.moe/"> Atsumaru</a></td>
                <td><a href="https://suwayomi.org/"><img src="https://favicon.malsync.moe/?domain=https://suwayomi-webui-preview.github.io/"></a> <a href="https://suwayomi.org/">Suwayomi</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex#suwayomi">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://aniflix.cc"><img src="https://favicon.malsync.moe/?domain=https://aniflix.cc"> Aniflix</a></td>
                <td><a href="https://aurorascans.com"><img src="https://favicon.malsync.moe/?domain=https://aurorascans.com"> AuroraScans</a></td>
                <td><a href="https://www.kavitareader.com/"><img src="https://favicon.malsync.moe/?domain=https://www.kavitareader.com/"></a> <a href="https://www.kavitareader.com/">Kavita</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex#kavita">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://anigo.to"><img src="https://favicon.malsync.moe/?domain=https://anigo.to"> AniGo</a></td>
                <td><a href="https://bato.to"><img src="https://favicon.malsync.moe/?domain=https://bato.to"> bato</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://smotret-anime.org"><img src="https://favicon.malsync.moe/?domain=https://smotret-anime.org"> Anime365</a></td>
                <td><a href="https://bentomanga.com"><img src="https://favicon.malsync.moe/?domain=https://bentomanga.com"> Bentomanga</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeav1.com"><img src="https://favicon.malsync.moe/?domain=https://animeav1.com"> Animeav1</a></td>
                <td><a href="https://manga.bilibili.com"><img src="https://favicon.malsync.moe/?domain=https://manga.bilibili.com"> BilibiliComics</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animebuff.ru"><img src="https://favicon.malsync.moe/?domain=https://animebuff.ru"> AnimeBuff</a></td>
                <td><a href="https://www.bluesolo.org"><img src="https://favicon.malsync.moe/?domain=https://www.bluesolo.org"> BlueSolo</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animefire.net"><img src="https://favicon.malsync.moe/?domain=https://animefire.net"> AnimeFire</a></td>
                <td><a href="https://comic-days.com"><img src="https://favicon.malsync.moe/?domain=https://comic-days.com"> ComicDays</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeflv.net"><img src="https://favicon.malsync.moe/?domain=https://animeflv.net"> Animeflv</a></td>
                <td><a href="https://comic-top.com/"><img src="https://favicon.malsync.moe/?domain=https://comic-top.com/"> ComicTop</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animego.me"><img src="https://favicon.malsync.moe/?domain=https://animego.me"> AnimeGO</a></td>
                <td><a href="https://comic-walker.com/"><img src="https://favicon.malsync.moe/?domain=https://comic-walker.com/"> ComicWalker</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeheaven.me"><img src="https://favicon.malsync.moe/?domain=https://animeheaven.me"> AnimeHeaven</a></td>
                <td><a href="https://comikey.com/"><img src="https://favicon.malsync.moe/?domain=https://comikey.com/"> Comikey</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animeid.tv"><img src="https://favicon.malsync.moe/?domain=https://www.animeid.tv"> AnimeId</a></td>
                <td><a href="https://comix.to"><img src="https://favicon.malsync.moe/?domain=https://comix.to"> Comix</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animekai.to"><img src="https://favicon.malsync.moe/?domain=https://animekai.to"> AnimeKAI</a></td>
                <td><a href="https://danke.moe/"><img src="https://favicon.malsync.moe/?domain=https://danke.moe/"> DankefürsLesen</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animekhor.org"><img src="https://favicon.malsync.moe/?domain=https://animekhor.org"> AnimeKhor</a></td>
                <td><a href="https://reader.deathtollscans.net"><img src="https://favicon.malsync.moe/?domain=https://reader.deathtollscans.net"> DeathTollScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeko.co"><img src="https://favicon.malsync.moe/?domain=https://animeko.co"> AnimeKO</a></td>
                <td><a href="https://disasterscans.com"><img src="https://favicon.malsync.moe/?domain=https://disasterscans.com"> DisasterScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://v3.animelib.org"><img src="https://favicon.malsync.moe/?domain=https://v3.animelib.org"> AnimeLib</a></td>
                <td><a href="https://drakecomic.org"><img src="https://favicon.malsync.moe/?domain=https://drakecomic.org"> DrakeScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animelon.com"><img src="https://favicon.malsync.moe/?domain=https://www.animelon.com"> Animelon</a></td>
                <td><a href="https://dynasty-scans.com"><img src="https://favicon.malsync.moe/?domain=https://dynasty-scans.com"> DynastyScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animenosub.to"><img src="https://favicon.malsync.moe/?domain=https://animenosub.to"> AnimeNoSub</a></td>
                <td><a href="https://falconscans.com/"><img src="https://favicon.malsync.moe/?domain=https://falconscans.com/"> FalconScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anime-odcinki.pl"><img src="https://favicon.malsync.moe/?domain=https://anime-odcinki.pl"> AnimeOdcinki</a></td>
                <td><a href="https://flamecomics.xyz"><img src="https://favicon.malsync.moe/?domain=https://flamecomics.xyz"> FlameScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animeonegai.com"><img src="https://favicon.malsync.moe/?domain=https://www.animeonegai.com"> AnimeOnegai</a></td>
                <td><a href="https://fmteam.fr"><img src="https://favicon.malsync.moe/?domain=https://fmteam.fr"> FMTeam</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeonsen.xyz"><img src="https://favicon.malsync.moe/?domain=https://animeonsen.xyz"> AnimeOnsen</a></td>
                <td><a href="https://furyosociety.com/"><img src="https://favicon.malsync.moe/?domain=https://furyosociety.com/"> Furyosociety</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animepahe.com"><img src="https://favicon.malsync.moe/?domain=https://animepahe.com"> animepahe</a></td>
                <td><a href="https://gdscans.com"><img src="https://favicon.malsync.moe/?domain=https://gdscans.com"> GalaxyDegenScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animesonline.in"><img src="https://favicon.malsync.moe/?domain=https://animesonline.in"> Animes Online</a></td>
                <td><a href="https://genzupdates.com/"><img src="https://favicon.malsync.moe/?domain=https://genzupdates.com/"> GenzToon</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anime-sama.tv"><img src="https://favicon.malsync.moe/?domain=https://anime-sama.tv"> AnimeSama</a></td>
                <td><a href="https://guya.moe"><img src="https://favicon.malsync.moe/?domain=https://guya.moe"> Guya & Cubari</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animetoast.cc"><img src="https://favicon.malsync.moe/?domain=https://www.animetoast.cc"> Animetoast</a></td>
                <td><a href="https://hachi.moe"><img src="https://favicon.malsync.moe/?domain=https://hachi.moe"> hachi</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeunity.it"><img src="https://favicon.malsync.moe/?domain=https://animeunity.it"> AnimeUnity</a></td>
                <td><a href="https://immortalupdates.com"><img src="https://favicon.malsync.moe/?domain=https://immortalupdates.com"> ImmortalUpdates</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animevost.org"><img src="https://favicon.malsync.moe/?domain=https://animevost.org"> AnimeVost</a></td>
                <td><a href="https://www.japscan.ws"><img src="https://favicon.malsync.moe/?domain=https://www.japscan.ws"> JapScan</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animewho.com"><img src="https://favicon.malsync.moe/?domain=https://animewho.com"> AnimeWho</a></td>
                <td><a href="https://jestful.net/"><img src="https://favicon.malsync.moe/?domain=https://jestful.net/"> Jestful</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animeworld.tv"><img src="https://favicon.malsync.moe/?domain=https://www.animeworld.tv"> Animeworld</a></td>
                <td><a href="https://kagane.org"><img src="https://favicon.malsync.moe/?domain=https://kagane.org"> Kagane</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animexin.vip"><img src="https://favicon.malsync.moe/?domain=https://animexin.vip"> AnimeXin</a></td>
                <td><a href="https://kakuseiproject.com"><img src="https://favicon.malsync.moe/?domain=https://kakuseiproject.com"> KakuseiProject</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animezone.pl"><img src="https://favicon.malsync.moe/?domain=https://www.animezone.pl"> AnimeZone</a></td>
                <td><a href="https://kappabeast.com"><img src="https://favicon.malsync.moe/?domain=https://kappabeast.com"> KappaBeast</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://aninexus.to"><img src="https://favicon.malsync.moe/?domain=https://aninexus.to"> Aninexus</a></td>
                <td><a href="https://kaynscan.com"><img src="https://favicon.malsync.moe/?domain=https://kaynscan.com"> KaynScan</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://aniworld.to"><img src="https://favicon.malsync.moe/?domain=https://aniworld.to"> Aniworld</a></td>
                <td><a href="https://lagoonscans.com/"><img src="https://favicon.malsync.moe/?domain=https://lagoonscans.com/"> LagoonScan</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anixl.to"><img src="https://favicon.malsync.moe/?domain=https://anixl.to"> AniXL</a></td>
                <td><a href="https://lhtranslation.net"><img src="https://favicon.malsync.moe/?domain=https://lhtranslation.net"> LHTranslation</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://aniyan.net"><img src="https://favicon.malsync.moe/?domain=https://aniyan.net"> Aniyan</a></td>
                <td><a href="https://luacomic.org"><img src="https://favicon.malsync.moe/?domain=https://luacomic.org"> LuaScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anizium.co"><img src="https://favicon.malsync.moe/?domain=https://anizium.co"> Anizium</a></td>
                <td><a href="https://lynxscans.com"><img src="https://favicon.malsync.moe/?domain=https://lynxscans.com"> LynxScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anizm.net"><img src="https://favicon.malsync.moe/?domain=https://anizm.net"> Anizm</a></td>
                <td><a href="https://madarascans.com"><img src="https://favicon.malsync.moe/?domain=https://madarascans.com"> Madarascans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anoboye.com"><img src="https://favicon.malsync.moe/?domain=https://anoboye.com"> Anoboye</a></td>
                <td><a href="https://manga4life.com"><img src="https://favicon.malsync.moe/?domain=https://manga4life.com"> manga4life</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://betteranime.net"><img src="https://favicon.malsync.moe/?domain=https://betteranime.net"> BetterAnime</a></td>
                <td><a href="https://mangaball.net"><img src="https://favicon.malsync.moe/?domain=https://mangaball.net"> MangaBall</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://bs.to"><img src="https://favicon.malsync.moe/?domain=https://bs.to"> bs.to</a></td>
                <td><a href="https://mangabuddy.com"><img src="https://favicon.malsync.moe/?domain=https://mangabuddy.com"> MangaBuddy</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.bilibili.tv"><img src="https://favicon.malsync.moe/?domain=https://www.bilibili.tv"> BStation</a></td>
                <td><a href="https://demonicscans.org"><img src="https://favicon.malsync.moe/?domain=https://demonicscans.org"> MangaDemon</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.crunchyroll.com"><img src="https://favicon.malsync.moe/?domain=https://www.crunchyroll.com"> Crunchyroll</a></td>
                <td><a href="https://www.mangadenizi.net"><img src="https://favicon.malsync.moe/?domain=https://www.mangadenizi.net"> mangadenizi</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://desu-online.pl"><img src="https://favicon.malsync.moe/?domain=https://desu-online.pl"> DesuOnline</a></td>
                <td><a href="https://www.mangadex.org"><img src="https://favicon.malsync.moe/?domain=https://www.mangadex.org"> Mangadex</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://docchi.pl"><img src="https://favicon.malsync.moe/?domain=https://docchi.pl"> Docchi</a></td>
                <td><a href="https://mangafire.to"><img src="https://favicon.malsync.moe/?domain=https://mangafire.to"> MangaFire</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://franime.fr"><img src="https://favicon.malsync.moe/?domain=https://franime.fr"> FRAnime</a></td>
                <td><a href="https://fanfox.net"><img src="https://favicon.malsync.moe/?domain=https://fanfox.net"> MangaFox</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://french-anime.com"><img src="https://favicon.malsync.moe/?domain=https://french-anime.com"> French Anime</a></td>
                <td><a href="http://www.mangahere.cc"><img src="https://favicon.malsync.moe/?domain=http://www.mangahere.cc"> MangaHere</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://frixysubs.pl"><img src="https://favicon.malsync.moe/?domain=https://frixysubs.pl"> FrixySubs</a></td>
                <td><a href="https://mangahub.io"><img src="https://favicon.malsync.moe/?domain=https://mangahub.io"> MangaHub</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://fumetsu.pl"><img src="https://favicon.malsync.moe/?domain=https://fumetsu.pl"> Fumetsu</a></td>
                <td><a href="https://mangajar.pro"><img src="https://favicon.malsync.moe/?domain=https://mangajar.pro"> MangaJar</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animetsu.net"><img src="https://favicon.malsync.moe/?domain=https://animetsu.net"> Gojo</a></td>
                <td><a href="http://mangakatana.com"><img src="https://favicon.malsync.moe/?domain=http://mangakatana.com"> MangaKatana</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://hdrezka.ag"><img src="https://favicon.malsync.moe/?domain=https://hdrezka.ag"> Hdrezka</a></td>
                <td><a href="https://mangalib.me"><img src="https://favicon.malsync.moe/?domain=https://mangalib.me"> MangaLib</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://hianime.to"><img src="https://favicon.malsync.moe/?domain=https://hianime.to"> HiAnime</a></td>
                <td><a href="https://mangalivre.tv"><img src="https://favicon.malsync.moe/?domain=https://mangalivre.tv"> MangaLivreTV</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.hidive.com"><img src="https://favicon.malsync.moe/?domain=https://www.hidive.com"> Hidive</a></td>
                <td><a href="https://proxer.me"><img src="https://favicon.malsync.moe/?domain=https://proxer.me"> Proxer</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://hinatasoul.com"><img src="https://favicon.malsync.moe/?domain=https://hinatasoul.com"> HinataSoul</a></td>
                <td><a href="https://manganato.gg"><img src="https://favicon.malsync.moe/?domain=https://manganato.gg"> MangaNato</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.hulu.com"><img src="https://favicon.malsync.moe/?domain=https://www.hulu.com"> Hulu</a></td>
                <td><a href="https://mangapark.to"><img src="https://favicon.malsync.moe/?domain=https://mangapark.to"> MangaPark</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://jkanime.net"><img src="https://favicon.malsync.moe/?domain=https://jkanime.net"> Jkanime</a></td>
                <td><a href="https://mangapill.com"><img src="https://favicon.malsync.moe/?domain=https://mangapill.com"> Mangapill</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://kaguya.app"><img src="https://favicon.malsync.moe/?domain=https://kaguya.app"> Kaguya</a></td>
                <td><a href="https://mangaplus.shueisha.co.jp"><img src="https://favicon.malsync.moe/?domain=https://mangaplus.shueisha.co.jp"> MangaPlus</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://kickassanime.am"><img src="https://favicon.malsync.moe/?domain=https://kickassanime.am"> KickAssAnime</a></td>
                <td><a href="https://www.mangaread.org"><img src="https://favicon.malsync.moe/?domain=https://www.mangaread.org"> MangaRead</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://Kuudere.to"><img src="https://favicon.malsync.moe/?domain=https://Kuudere.to"> Kuudere</a></td>
                <td><a href="https://mangareader.to"><img src="https://favicon.malsync.moe/?domain=https://mangareader.to"> MangaReader</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://latanime.org"><img src="https://favicon.malsync.moe/?domain=https://latanime.org"> Latanime</a></td>
                <td><a href="https://mangasee123.com"><img src="https://favicon.malsync.moe/?domain=https://mangasee123.com"> MangaSee</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://luciferdonghua.in"><img src="https://favicon.malsync.moe/?domain=https://luciferdonghua.in"> Lucifer Donghua</a></td>
                <td><a href="https://mangas-origines.fr/"><img src="https://favicon.malsync.moe/?domain=https://mangas-origines.fr/"> MangasOrigines</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.miruro.to"><img src="https://favicon.malsync.moe/?domain=https://www.miruro.to"> Miruro</a></td>
                <td><a href="https://mangasushi.org"><img src="https://favicon.malsync.moe/?domain=https://mangasushi.org"> MangaSushi</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://moeclip.com"><img src="https://favicon.malsync.moe/?domain=https://moeclip.com"> moeclip</a></td>
                <td><a href="https://mangataro.org"><img src="https://favicon.malsync.moe/?domain=https://mangataro.org"> MangaTaro</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://monoschinos2.com"><img src="https://favicon.malsync.moe/?domain=https://monoschinos2.com"> MonosChinos</a></td>
                <td><a href="https://mangatx.com"><img src="https://favicon.malsync.moe/?domain=https://mangatx.com"> mangatx</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://myanimelist.net"><img src="https://favicon.malsync.moe/?domain=https://myanimelist.net"> MyAnimeList</a></td>
                <td><a href="https://mangtto.com"><img src="https://favicon.malsync.moe/?domain=https://mangtto.com"> Mangitto</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.netflix.com"><img src="https://favicon.malsync.moe/?domain=https://www.netflix.com"> Netflix</a></td>
                <td><a href="https://manhuafast.com"><img src="https://favicon.malsync.moe/?domain=https://manhuafast.com"> manhuafast</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://ogladajanime.pl"><img src="https://favicon.malsync.moe/?domain=https://ogladajanime.pl"> OgladajAnime</a></td>
                <td><a href="https://manhuaplus.com"><img src="https://favicon.malsync.moe/?domain=https://manhuaplus.com"> ManhuaPlus</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://okanime.tv"><img src="https://favicon.malsync.moe/?domain=https://okanime.tv"> Okanime</a></td>
                <td><a href="https://manhuaus.com"><img src="https://favicon.malsync.moe/?domain=https://manhuaus.com"> ManhuaUS</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://otakufr.cc"><img src="https://favicon.malsync.moe/?domain=https://otakufr.cc"> OtakuFR</a></td>
                <td><a href="https://www.mgeko.cc"><img src="https://favicon.malsync.moe/?domain=https://www.mgeko.cc"> Mgeko</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.otakustv.com"><img src="https://favicon.malsync.moe/?domain=https://www.otakustv.com"> Otakustv</a></td>
                <td><a href="https://neoxscans.com/"><img src="https://favicon.malsync.moe/?domain=https://neoxscans.com/"> NeoxScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://proxer.me"><img src="https://favicon.malsync.moe/?domain=https://proxer.me"> Proxer</a></td>
                <td><a href="https://novelfire.net"><img src="https://favicon.malsync.moe/?domain=https://novelfire.net"> Novelfire</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://shinden.pl"><img src="https://favicon.malsync.moe/?domain=https://shinden.pl"> Shinden</a></td>
                <td><a href="https://philiascans.org/"><img src="https://favicon.malsync.moe/?domain=https://philiascans.org/"> PhiliaScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://sovetromantica.com"><img src="https://favicon.malsync.moe/?domain=https://sovetromantica.com"> SovetRomantica</a></td>
                <td><a href="https://projectsuki.com"><img src="https://favicon.malsync.moe/?domain=https://projectsuki.com"> projectsuki</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://tioanime.com"><img src="https://favicon.malsync.moe/?domain=https://tioanime.com"> tioanime</a></td>
                <td><a href="https://qiscans.org"><img src="https://favicon.malsync.moe/?domain=https://qiscans.org"> QiScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://vvww.toonanime.cc"><img src="https://favicon.malsync.moe/?domain=https://vvww.toonanime.cc"> ToonAnime</a></td>
                <td><a href="https://ragescans.com"><img src="https://favicon.malsync.moe/?domain=https://ragescans.com"> RageScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://topanimes.net"><img src="https://favicon.malsync.moe/?domain=https://topanimes.net"> Topanimes</a></td>
                <td><a href="https://ranobelib.me"><img src="https://favicon.malsync.moe/?domain=https://ranobelib.me"> RanobeLib</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.tranimeizle.net/"><img src="https://favicon.malsync.moe/?domain=https://www.tranimeizle.net/"> TRanimeizle</a></td>
                <td><a href="https://rawkuma.net"><img src="https://favicon.malsync.moe/?domain=https://rawkuma.net"> Rawkuma</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.turkanime.co"><img src="https://favicon.malsync.moe/?domain=https://www.turkanime.co"> TurkAnime</a></td>
                <td><a href="https://readm.today"><img src="https://favicon.malsync.moe/?domain=https://readm.today"> Readm</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://voiranime.com"><img src="https://favicon.malsync.moe/?domain=https://voiranime.com"> Voiranime</a></td>
                <td><a href="https://readmanhua.net"><img src="https://favicon.malsync.moe/?domain=https://readmanhua.net"> ReadManhua</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://witanime.pics"><img src="https://favicon.malsync.moe/?domain=https://witanime.pics"> WitAnime</a></td>
                <td><a href="https://reaperscans.com"><img src="https://favicon.malsync.moe/?domain=https://reaperscans.com"> ReaperScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://reset-scans.org"><img src="https://favicon.malsync.moe/?domain=https://reset-scans.org"> ResetScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://rezoscan.org"><img src="https://favicon.malsync.moe/?domain=https://rezoscan.org"> RezoScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://ritharscans.com"><img src="https://favicon.malsync.moe/?domain=https://ritharscans.com"> Ritharscans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://rokaricomics.com"><img src="https://favicon.malsync.moe/?domain=https://rokaricomics.com"> RokariComics</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://roliascan.com"><img src="https://favicon.malsync.moe/?domain=https://roliascan.com"> RoliaScan</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://sadscans.com"><img src="https://favicon.malsync.moe/?domain=https://sadscans.com"> Sadscans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://sakuramangas.org"><img src="https://favicon.malsync.moe/?domain=https://sakuramangas.org"> SakuraMangas</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://sanascan.com"><img src="https://favicon.malsync.moe/?domain=https://sanascan.com"> SanaScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://scyllacomics.xyz"><img src="https://favicon.malsync.moe/?domain=https://scyllacomics.xyz"> ScyllaScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://serimanga.com"><img src="https://favicon.malsync.moe/?domain=https://serimanga.com"> serimanga</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://setsuscans.com"><img src="https://favicon.malsync.moe/?domain=https://setsuscans.com"> SetsuScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://www.silentquill.net"><img src="https://favicon.malsync.moe/?domain=https://www.silentquill.net"> Silentquill</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://stonescape.xyz"><img src="https://favicon.malsync.moe/?domain=https://stonescape.xyz"> StoneScape</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://taiyo.moe"><img src="https://favicon.malsync.moe/?domain=https://taiyo.moe"> Taiyo</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://tcbonepiecechapters.com"><img src="https://favicon.malsync.moe/?domain=https://tcbonepiecechapters.com"> TCBScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://templescan.net"><img src="https://favicon.malsync.moe/?domain=https://templescan.net"> TempleScan</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://en-thunderscans.com"><img src="https://favicon.malsync.moe/?domain=https://en-thunderscans.com"> Thunderscans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://zonatmo.com"><img src="https://favicon.malsync.moe/?domain=https://zonatmo.com"> tmofans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://toonily.com"><img src="https://favicon.malsync.moe/?domain=https://toonily.com"> Toonily</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://tritinia.org"><img src="https://favicon.malsync.moe/?domain=https://tritinia.org"> TritiniaScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://utoon.net"><img src="https://favicon.malsync.moe/?domain=https://utoon.net"> Utoon</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://violetscans.org"><img src="https://favicon.malsync.moe/?domain=https://violetscans.org"> VioletScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://www.viz.com"><img src="https://favicon.malsync.moe/?domain=https://www.viz.com"> VIZ</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://hivetoons.org"><img src="https://favicon.malsync.moe/?domain=https://hivetoons.org"> VoidScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://vortexscans.org"><img src="https://favicon.malsync.moe/?domain=https://vortexscans.org"> VortexScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://weebcentral.com"><img src="https://favicon.malsync.moe/?domain=https://weebcentral.com"> WeebCentral</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://weebdex.org/"><img src="https://favicon.malsync.moe/?domain=https://weebdex.org/"> WeebDex</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://witchscans.com"><img src="https://favicon.malsync.moe/?domain=https://witchscans.com"> WitchScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://writerscans.com"><img src="https://favicon.malsync.moe/?domain=https://writerscans.com"> WritersScans</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://wuxiaworld.site"><img src="https://favicon.malsync.moe/?domain=https://wuxiaworld.site"> WuxiaWorld</a></td>
                <td></td>
              </tr><tr>
                <td></td>
                <td><a href="https://zscans.com/"><img src="https://favicon.malsync.moe/?domain=https://zscans.com/"> ZeroScans</a></td>
                <td></td>
              </tr>
    </tbody>
  </table>
  <!--/pages-->

[List of supported features by page](pages.md)

#### **Download**

[![Chrome](https://img.shields.io/chrome-web-store/users/kekjfbackdeiabghhcdklcdoekaanoel.svg?style=flat-square&label=Chrome&logo=google%20chrome&logoColor=white)](https://chrome.google.com/webstore/detail/mal-sync/kekjfbackdeiabghhcdklcdoekaanoel?hl=en)
[![Firefox](https://img.shields.io/amo/users/mal-sync.svg?style=flat-square&label=Firefox&logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/mal-sync)
[![Userscript](https://img.shields.io/badge/Userscript-Download-brightgreen.svg?style=flat-square&label=Userscript&logo=javascript&logoColor=white)](https://github.com/MALSync/MALSync/releases/latest/download/malsync.user.js)

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

## Want to Contribute?

Then let me know on [Discord](https://discord.com/invite/cTH4yaw).

How to add a new page? How to build? [Wiki](https://github.com/MALSync/MALSync/wiki/Build)

You can't code, but want to help? [Donations](https://github.com/MALSync/MALSync/wiki/Donations)
