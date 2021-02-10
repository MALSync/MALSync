[![img](https://img.shields.io/travis/com/MALSync/MALSync.svg?style=flat-square&logo=travis)](https://travis-ci.com/MALSync/MALSync)
[![img](https://img.shields.io/discord/358599430502481920.svg?style=flat-square&logo=discord&label=Chat%20%2F%20Support&colorB=7289DA)](https://discordapp.com/invite/cTH4yaw)
[![img](https://img.shields.io/github/issues/MALSync/MALSync.svg?style=flat-square&logo=github&logoColor=white)](https://github.com/MALSync/MALSync/issues)
[![CodeFactor](https://www.codefactor.io/repository/github/MALSync/MALSync/badge)](https://www.codefactor.io/repository/github/MALSync/MALSync)

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
                <td><a href="https://9anime.to"><img src="https://www.google.com/s2/favicons?domain=https://9anime.to"> 9anime</a></td>
                <td><a href="https://www.mangadex.org"><img src="https://www.google.com/s2/favicons?domain=https://www.mangadex.org"> Mangadex</a></td>
                <td><a href="http://app.emby.media"><img src="https://www.google.com/s2/favicons?domain=app.emby.media"></a> <a href="http://app.emby.media">Emby</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://www.crunchyroll.com"><img src="https://www.google.com/s2/favicons?domain=https://www.crunchyroll.com"> Crunchyroll</a></td>
                <td><a href="https://proxer.me"><img src="https://www.google.com/s2/favicons?domain=https://proxer.me"> Proxer</a></td>
                <td><a href="http://app.plex.tv"><img src="https://www.google.com/s2/favicons?domain=http://app.plex.tv"></a> <a href="http://app.plex.tv">Plex</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://vrv.co"><img src="https://www.google.com/s2/favicons?domain=https://vrv.co"> Vrv</a></td>
                <td><a href="https://manganelo.com"><img src="https://www.google.com/s2/favicons?domain=https://manganelo.com"> MangaNelo</a></td>
                <td><a href="https://jellyfin.org/"><img src="https://www.google.com/s2/favicons?domain=https://jellyfin.org/"></a> <a href="https://jellyfin.org/">Jellyfin</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://gogoanimes.co"><img src="https://www.google.com/s2/favicons?domain=https://gogoanimes.co"> Gogoanime</a></td>
                <td><a href="https://www.viz.com"><img src="https://www.google.com/s2/favicons?domain=https://www.viz.com"> VIZ</a></td>
                <td><a href="https://komga.org/"><img src="https://www.google.com/s2/favicons?domain=https://komga.org/"></a> <a href="https://komga.org/">Komga</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex">[Wiki]</a></td>
              </tr><tr>
                <td><a href="https://twist.moe"><img src="https://www.google.com/s2/favicons?domain=https://twist.moe"> Twistmoe</a></td>
                <td><a href="https://serimanga.com"><img src="https://www.google.com/s2/favicons?domain=https://serimanga.com"> serimanga</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.branitube.net"><img src="https://www.google.com/s2/favicons?domain=https://www.branitube.net"> Branitube</a></td>
                <td><a href="https://mangadenizi.com"><img src="https://www.google.com/s2/favicons?domain=https://mangadenizi.com"> mangadenizi</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.turkanime.net"><img src="https://www.google.com/s2/favicons?domain=https://www.turkanime.net"> Turkanime</a></td>
                <td><a href="https://mangalivre.net"><img src="https://www.google.com/s2/favicons?domain=https://mangalivre.net"> mangalivre</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animepahe.com"><img src="https://www.google.com/s2/favicons?domain=https://animepahe.com"> animepahe</a></td>
                <td><a href="https://lectortmo.com"><img src="https://www.google.com/s2/favicons?domain=https://lectortmo.com"> tmofans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.netflix.com"><img src="https://www.google.com/s2/favicons?domain=https://www.netflix.com"> Netflix</a></td>
                <td><a href="https://unionleitor.top"><img src="https://www.google.com/s2/favicons?domain=https://unionleitor.top"> unionmangas</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeflv.net"><img src="https://www.google.com/s2/favicons?domain=https://animeflv.net"> Animeflv</a></td>
                <td><a href="https://mangaplus.shueisha.co.jp"><img src="https://www.google.com/s2/favicons?domain=https://mangaplus.shueisha.co.jp"> MangaPlus</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://jkanime.net"><img src="https://www.google.com/s2/favicons?domain=https://jkanime.net"> Jkanime</a></td>
                <td><a href="https://www.japscan.se"><img src="https://www.google.com/s2/favicons?domain=https://www.japscan.se"> JapScan</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://proxer.me"><img src="https://www.google.com/s2/favicons?domain=https://proxer.me"> Proxer</a></td>
                <td><a href="https://manga.fascans.com"><img src="https://www.google.com/s2/favicons?domain=https://manga.fascans.com"> FallenAngels</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.wakanim.tv"><img src="https://www.google.com/s2/favicons?domain=https://www.wakanim.tv"> Wakanim</a></td>
                <td><a href="http://mangakatana.com"><img src="https://www.google.com/s2/favicons?domain=http://mangakatana.com"> MangaKatana</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://4anime.to"><img src="https://www.google.com/s2/favicons?domain=https://4anime.to"> 4Anime</a></td>
                <td><a href="https://manga4life.com"><img src="https://www.google.com/s2/favicons?domain=https://manga4life.com"> manga4life</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeultima.to"><img src="https://www.google.com/s2/favicons?domain=https://animeultima.to"> animeultima</a></td>
                <td><a href="https://bato.to"><img src="https://www.google.com/s2/favicons?domain=https://bato.to"> bato</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www1.aniflix.tv"><img src="https://www.google.com/s2/favicons?domain=https://www1.aniflix.tv"> Aniflix</a></td>
                <td><a href="https://mangapark.net"><img src="https://www.google.com/s2/favicons?domain=https://mangapark.net"> MangaPark</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animefreak.tv"><img src="https://www.google.com/s2/favicons?domain=https://www.animefreak.tv"> Animefreak</a></td>
                <td><a href="https://www.tsukimangas.com"><img src="https://www.google.com/s2/favicons?domain=https://www.tsukimangas.com"> Tsuki Mangás</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animelab.com"><img src="https://www.google.com/s2/favicons?domain=https://www.animelab.com"> AnimeLab</a></td>
                <td><a href="https://mangatx.com"><img src="https://www.google.com/s2/favicons?domain=https://mangatx.com"> mangatx</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.kickassanime.rs"><img src="https://www.google.com/s2/favicons?domain=https://www.kickassanime.rs"> KickAssAnime</a></td>
                <td><a href="https://scantrad.net"><img src="https://www.google.com/s2/favicons?domain=https://scantrad.net"> Scantrad</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animekisa.tv"><img src="https://www.google.com/s2/favicons?domain=https://animekisa.tv"> AnimeKisa</a></td>
                <td><a href="http://www.mangahere.cc"><img src="https://www.google.com/s2/favicons?domain=http://www.mangahere.cc"> MangaHere</a></td>
                <td></td>
              </tr><tr>
                <td><a href="http://animeindo.moe"><img src="https://www.google.com/s2/favicons?domain=http://animeindo.moe"> AnimeIndo</a></td>
                <td><a href="http://fanfox.net"><img src="https://www.google.com/s2/favicons?domain=http://fanfox.net"> MangaFox</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://shinden.pl"><img src="https://www.google.com/s2/favicons?domain=https://shinden.pl"> Shinden</a></td>
                <td><a href="https://wuxiaworld.site"><img src="https://www.google.com/s2/favicons?domain=https://wuxiaworld.site"> WuxiaWorld</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.funimation.com"><img src="https://www.google.com/s2/favicons?domain=https://www.funimation.com"> Funimation</a></td>
                <td><a href="https://edelgardescans.com"><img src="https://www.google.com/s2/favicons?domain=https://edelgardescans.com"> EdelgardeScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://voiranime.com"><img src="https://www.google.com/s2/favicons?domain=https://voiranime.com"> Voiranime</a></td>
                <td><a href="https://hatigarmscanz.net"><img src="https://www.google.com/s2/favicons?domain=https://hatigarmscanz.net"> HatigarmScanz</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://ww5.dubbedanime.net"><img src="https://www.google.com/s2/favicons?domain=https://ww5.dubbedanime.net"> DubbedAnime</a></td>
                <td><a href="https://kkjscans.co"><img src="https://www.google.com/s2/favicons?domain=https://kkjscans.co"> KKJScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.neko-sama.fr"><img src="https://www.google.com/s2/favicons?domain=https://www.neko-sama.fr"> NekoSama</a></td>
                <td><a href="https://leviatanscans.com"><img src="https://www.google.com/s2/favicons?domain=https://leviatanscans.com"> LeviatanScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anime-odcinki.pl"><img src="https://www.google.com/s2/favicons?domain=https://anime-odcinki.pl"> AnimeOdcinki</a></td>
                <td><a href="https://methodscans.com"><img src="https://www.google.com/s2/favicons?domain=https://methodscans.com"> MethodScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animezone.pl"><img src="https://www.google.com/s2/favicons?domain=https://www.animezone.pl"> AnimeZone</a></td>
                <td><a href="https://the-nonames.com"><img src="https://www.google.com/s2/favicons?domain=https://the-nonames.com"> NonamesScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeflix.io"><img src="https://www.google.com/s2/favicons?domain=https://animeflix.io"> Animeflix</a></td>
                <td><a href="https://reaperscans.com"><img src="https://www.google.com/s2/favicons?domain=https://reaperscans.com"> ReaperScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://moeclip.com"><img src="https://www.google.com/s2/favicons?domain=https://moeclip.com"> moeclip</a></td>
                <td><a href="https://secretscans.co"><img src="https://www.google.com/s2/favicons?domain=https://secretscans.co"> SecretScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://goyabu.com"><img src="https://www.google.com/s2/favicons?domain=https://goyabu.com"> Goyabu</a></td>
                <td><a href="https://skscans.com"><img src="https://www.google.com/s2/favicons?domain=https://skscans.com"> SKScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animesvision.biz"><img src="https://www.google.com/s2/favicons?domain=https://animesvision.biz"> AnimesVision</a></td>
                <td><a href="https://zeroscans.com"><img src="https://www.google.com/s2/favicons?domain=https://zeroscans.com"> ZeroScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.hulu.com"><img src="https://www.google.com/s2/favicons?domain=https://www.hulu.com"> Hulu</a></td>
                <td><a href="https://reader.deathtollscans.net"><img src="https://www.google.com/s2/favicons?domain=https://reader.deathtollscans.net"> DeathTollScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://aniwatch.me"><img src="https://www.google.com/s2/favicons?domain=https://aniwatch.me"> Aniwatch</a></td>
                <td><a href="https://helveticascans.com"><img src="https://www.google.com/s2/favicons?domain=https://helveticascans.com"> HelveticaScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.hidive.com"><img src="https://www.google.com/s2/favicons?domain=https://www.hidive.com"> Hidive</a></td>
                <td><a href="https://reader.kireicake.com"><img src="https://www.google.com/s2/favicons?domain=https://reader.kireicake.com"> KireiCake</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.primevideo.com"><img src="https://www.google.com/s2/favicons?domain=https://www.primevideo.com"> Amazon Prime Video</a></td>
                <td><a href="https://sensescans.com"><img src="https://www.google.com/s2/favicons?domain=https://sensescans.com"> SenseScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://dreamsub.cc"><img src="https://www.google.com/s2/favicons?domain=https://dreamsub.cc"> DreamSub</a></td>
                <td><a href="https://manhuaplus.com"><img src="https://www.google.com/s2/favicons?domain=https://manhuaplus.com"> ManhuaPlus</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeshouse.net"><img src="https://www.google.com/s2/favicons?domain=https://animeshouse.net"> AnimesHouse</a></td>
                <td><a href="https://readm.org"><img src="https://www.google.com/s2/favicons?domain=https://readm.org"> Readm</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animexin.xyz"><img src="https://www.google.com/s2/favicons?domain=https://animexin.xyz"> AnimeXin</a></td>
                <td><a href="https://mangasee123.com"><img src="https://www.google.com/s2/favicons?domain=https://mangasee123.com"> MangaSee</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://monoschinos2.com"><img src="https://www.google.com/s2/favicons?domain=https://monoschinos2.com"> MonosChinos</a></td>
                <td><a href="https://asurascans.com"><img src="https://www.google.com/s2/favicons?domain=https://asurascans.com"> AsuraScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animefire.net"><img src="https://www.google.com/s2/favicons?domain=https://animefire.net"> AnimeFire</a></td>
                <td><a href="https://naniscans.com"><img src="https://www.google.com/s2/favicons?domain=https://naniscans.com"> NaniScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://otakufr.co"><img src="https://www.google.com/s2/favicons?domain=https://otakufr.co"> OtakuFR</a></td>
                <td><a href="https://merakiscans.com"><img src="https://www.google.com/s2/favicons?domain=https://merakiscans.com"> MerakiScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://samehadaku.vip"><img src="https://www.google.com/s2/favicons?domain=https://samehadaku.vip"> Samehadaku</a></td>
                <td><a href="https://mangajar.com"><img src="https://www.google.com/s2/favicons?domain=https://mangajar.com"> MangaJar</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.tranimeizle.net/"><img src="https://www.google.com/s2/favicons?domain=https://www.tranimeizle.net/"> TRanimeizle</a></td>
                <td><a href="https://toonily.net"><img src="https://www.google.com/s2/favicons?domain=https://toonily.net"> Toonily</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://anihub.tv"><img src="https://www.google.com/s2/favicons?domain=https://anihub.tv"> Anihub</a></td>
                <td><a href="https://www.nonstopscans.com"><img src="https://www.google.com/s2/favicons?domain=https://www.nonstopscans.com"> NonstopScans</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animestreamingfr.fr"><img src="https://www.google.com/s2/favicons?domain=https://www.animestreamingfr.fr"> AnimeStreamingFR</a></td>
                <td><a href="https://guya.moe"><img src="https://www.google.com/s2/favicons?domain=https://guya.moe"> Guya</a></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.animeid.tv"><img src="https://www.google.com/s2/favicons?domain=https://www.animeid.tv"> AnimeId</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animixplay.to"><img src="https://www.google.com/s2/favicons?domain=https://animixplay.to"> AniMixPlay</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://myanimelist.net"><img src="https://www.google.com/s2/favicons?domain=https://myanimelist.net"> MyAnimeList</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://ww1.animesimple.com"><img src="https://www.google.com/s2/favicons?domain=https://ww1.animesimple.com"> AnimeSimple</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeunity.it"><img src="https://www.google.com/s2/favicons?domain=https://animeunity.it"> AnimeUnity</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://justanime.app"><img src="https://www.google.com/s2/favicons?domain=https://justanime.app"> JustAnime</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://yayanimes.net"><img src="https://www.google.com/s2/favicons?domain=https://yayanimes.net"> YayAnimes</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animedesu.pl"><img src="https://www.google.com/s2/favicons?domain=https://animedesu.pl"> AnimeDesu</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://simplyaweeb.com"><img src="https://www.google.com/s2/favicons?domain=https://simplyaweeb.com"> Simplyaweeb</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animevibe.wtf"><img src="https://www.google.com/s2/favicons?domain=https://animevibe.wtf"> Animevibe</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.anime-on-demand.de"><img src="https://www.google.com/s2/favicons?domain=https://www.anime-on-demand.de"> AnimeOnDemand</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://tioanime.com"><img src="https://www.google.com/s2/favicons?domain=https://tioanime.com"> tioanime</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://yugenani.me"><img src="https://www.google.com/s2/favicons?domain=https://yugenani.me"> YugenAnime</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animetribes.ru"><img src="https://www.google.com/s2/favicons?domain=https://animetribes.ru"> AnimeTribes</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://okanime.tv"><img src="https://www.google.com/s2/favicons?domain=https://okanime.tv"> Okanime</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://bs.to"><img src="https://www.google.com/s2/favicons?domain=https://bs.to"> bs.to</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://pantsubase.tv"><img src="https://www.google.com/s2/favicons?domain=https://pantsubase.tv"> Pantsubase</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://fastani.net"><img src="https://www.google.com/s2/favicons?domain=https://fastani.net"> Fastani</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeowl.net"><img src="https://www.google.com/s2/favicons?domain=https://animeowl.net"> AnimeOwl</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://an1me.nl"><img src="https://www.google.com/s2/favicons?domain=https://an1me.nl"> An1me</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animedao.to"><img src="https://www.google.com/s2/favicons?domain=https://animedao.to"> AnimeDao</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://www.otakustv.com"><img src="https://www.google.com/s2/favicons?domain=https://www.otakustv.com"> Otakustv</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animewho.com"><img src="https://www.google.com/s2/favicons?domain=https://animewho.com"> AnimeWho</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animesuge.io"><img src="https://www.google.com/s2/favicons?domain=https://animesuge.io"> AnimeSuge</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://fumetsu.pl"><img src="https://www.google.com/s2/favicons?domain=https://fumetsu.pl"> Fumetsu</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://frixysubs.pl"><img src="https://www.google.com/s2/favicons?domain=https://frixysubs.pl"> FrixySubs</a></td>
                <td></td>
                <td></td>
              </tr><tr>
                <td><a href="https://animeshd.org"><img src="https://www.google.com/s2/favicons?domain=https://animeshd.org"> AnimesHD</a></td>
                <td></td>
                <td></td>
              </tr>
    </tbody>
  </table>
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

How to build? [Wiki](https://github.com/MALSync/MALSync/wiki/Build)

You can't code, but want to help? [Donations](https://github.com/MALSync/MALSync/wiki/Donations)
