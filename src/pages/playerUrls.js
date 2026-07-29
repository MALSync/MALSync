module.exports = {
  openload: {
    match: ['*://*.openload.co/*', '*://*.openload.pw/*'],
  },
  streamango: {
    match: ['*://*.streamango.com/*'],
  },
  mp4upload: {
    match: ['*://*.mp4upload.com/*'],
  },
  crunchyroll: {
    match: ['*://*.static.crunchyroll.com/*'],
  },
  vidstreaming: {
    match: ['*://*.vidstreaming.io/*'],
  },
  xstreamcdn: {
    match: ['*://*.gcloud.live/*'],
  },
  oload: {
    match: ['*://*.oload.tv/*'],
  },
  mail: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout mail.ru,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://*.mail.ru/*'],
  },
  myvi: {
    match: ['*://*.myvi.ru/*', '*://*.myvi.tv/*'],
  },
  sibnet: {
    match: ['*://*.sibnet.ru/*'],
  },
  tune: {
    match: ['*://*.tune.pk/*'],
  },
  vimple: {
    match: ['*://*.vimple.ru/*'],
  },
  href: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout vk.com,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://*.href.li/*', '*://*.vk.com/*'],
  },
  cloudvideo: {
    match: ['*://*.cloudvideo.tv/*'],
  },
  // gogoanime.to (page retirée)
  fembed: {
    match: [
      '*://*.fembed.net/*',
      '*://*.fembed.com/*',
      '*://*.feurl.com/*',
      '*://*.embedsito.com/v/*',
      '*://*.fcdn.stream/v/*',
      '*://*.fcdn.stream/e/*',
      '*://*.vaplayer.xyz/v/*',
      '*://*.vaplayer.xyz/e/*',
      '*://*.femax20.com/v/*',
      '*://*.femax20.com/e/*',
      '*://*.fplayer.info/*',
      '*://*.dutrag.com/*',
      '*://*.diasfem.com/*',
      '*://*.fembed-hd.com/*',
      '*://*.fembed9hd.com/*',
      '*://suzihaza.com/v/*',
      '*://vanfem.com/v/*',
      // auto-gogofembed-replace-dont-remove
    ],
  },
  yourupload: {
    match: ['*://*.yourupload.com/*'],
  },
  vidlox: {
    match: ['*://*.vidlox.me/*'],
  },
  kwik: {
    match: ['*://*.kwik.cx/*', '*://*.kwik.si/*', '*://*.mewcdn.online/*'],
  },
  mega: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout mega.nz,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://*.mega.nz/*'],
  },
  animeflv: {
    match: ['*://*.animeflv.net/*', '*://*.jwplayerhls.com/*', '*://playnixes.com/*'],
  },
  netu: {
    match: ['*://*.hqq.tv/*', '*://waaw.tv/*'],
  },
  jkanime: {
    match: ['*://*.jkanime.net/*'],
  },
  ok: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout ok.ru,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://*.ok.ru/*'],
  },
  novelplanet: {
    match: ['*://*.novelplanet.me/*'],
  },
  proxer: {
    match: [
      '*://*.stream.proxer.me/*',
      '*://*.stream-service.proxer.me/*',
    ],
  },
  Verystream: {
    match: ['*://verystream.com/*'],
  },
  animeultima: {
    match: [
      '*://*.animeultima.eu/e/*',
      '*://*.animeultima.eu/faststream/*',
      '*://*.animeultima.to/e/*',
      '*://*.animeultima.to/faststream/*',
    ],
  },
  vidoza: {
    match: ['*://*.vidoza.net/*', '*://*.videzz.net/*'],
  },
  gounlimited: {
    match: ['*://gounlimited.to/*'],
  },
  anistream: {
    match: ['*://www.ani-stream.com/*'],
  },
  animedaisuki: {
    match: ['*://animedaisuki.moe/embed/*'],
  },
  dailymotion: {
    match: ['*://www.dailymotion.com/embed/*', '*://geo.dailymotion.com/*'],
  },
  // gogoanime (page retirée)
  theVideo: {
    match: ['*://vev.red/embed/*'],
  },
  // voiranime
  jwpstream: {
    match: ['*://jwpstream.com/jwps/yplayer.php*'],
  },
  // voiranime
  vaplayer: {
    match: ['*://www.vaplayer.xyz/v/*'],
  },
  // dubbedanime (page retirée)
  mp4sh: {
    match: ['*://mp4.sh/embed/*'],
  },
  // animeultima (page retirée)
  mystream: {
    match: ['*://embed.mystream.to/*'],
  },
  // animeultima (page retirée)
  bitchute: {
    match: ['*://*.bitchute.com/embed/*'],
  },
  // animeultima (page retirée)
  streamcherry: {
    match: ['*://*.streamcherry.com/embed/*'],
  },
  // anime-odcinki
  clipwatching: {
    match: ['*://*.clipwatching.com/*'],
  },
  // anime-odcinki
  flix555: {
    match: ['*://*.flix555.com/*'],
  },
  // anime-odcinki
  vshare: {
    // TODO(player): vshare.io ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "anime-odcinki" encore livrée : trouver le domaine de remplacement.
    match: ['*://*.vshare.io/v/*'],
  },
  // anime-odcinki shinden animezone
  cda: {
    match: ['*://ebd.cda.pl/*'],
  },
  // shinden animezone ogladajanime
  lycoris: {
    match: ['*://www.lycoris.cafe/*'],
  },
  // kissanime/9anime/gogoanime/animekisa (pages retirées)
  hydrax: {
    match: [
      '*://*.replay.watch/*',
      '*://*.playhydrax.com/*',
      '*://hydrax.net/*',
      '*://*.geoip.redirect-ads.com/*',
    ],
  },
  // animeflv
  streamium: {
    match: ['*://*.streamium.xyz/*'],
  },
  // AnimeGO AnimeLib
  kodik: {
    match: ['*://kodikplayer.com/*'],
  },
  // AnimeGO
  aniboom: {
    match: ['*://aniboom.one/*'],
  },
  // Anizium
  anizium: {
    match: ['*://x.anizium.co/*'],
  },
  // Anime365
  anime365: {
    match: [
      '*://smotret-anime.org/translations/embed/*',
      '*://anime365.ru/translations/embed/*',
      '*://anime-365.ru/translations/embed/*',
      '*://smotret-anime.online/translations/embed/*',
      '*://smotret-anime.com/translations/embed/*',
      '*://smotret-anime.ru/translations/embed/*',
      '*://smotretanime.ru/translations/embed/*',
      '*://smotret-anime.app/translations/embed/*',
    ],
  },
  // Neko-sama (page retirée)
  pstream: {
    match: ['*://*.pstream.net/e/*'],
  },
  // Neko-sama (page retirée)
  fusevideo: {
    match: ['*://fusevideo.net/e/*'],
  },
  // kickassanime
  haloani: {
    // TODO(player): haloani.ru ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "kickassanime" encore livrée : trouver le domaine de remplacement.
    match: ['*://*.haloani.ru/*'],
  },
  // moeclip
  moeclip: {
    match: ['*://*.moeclip.com/v/*', '*://*.moeclip.com/embed/*'],
  },
  // gogoanime (page retirée)
  mixdrop: {
    match: [
      '*://*.mixdrop.co/e/*',
      '*://*.mixdrop.to/e/*',
      '*://*.mdbekjwqa.pw/e/*',
      '*://*.mdfx9dc8n.net/e/*',
      '*://*.mdzsmutpcvykb.net/e/*',
      '*://*.mixdropjmk.pw/e/*',
      '*://*.mixdrop21.net/e/*',
      '*://*.mixdrop.si/e/*',
      '*://*.mixdrop.sx/e/*',
      '*://*.mixdrop.ps/e/*',
      '*://*.mixdrop.my/e/*',
      '*://*.mixdrop.sn/e/*',
      '*://*.mixdrop.cv/e/*',
      '*://*.md3b0j6hj.com/e/*',
      '*://*.m1xdrop.net/e/*',
      '*://*.m1xdrop.com/e/*',
      '*://*.m1xdrop.bz/e/*',
      '*://*.miixdrop.net/e/*',
      '*://*.miiiixdrop.net/e/*',
      // auto-mixdrop-replace-dont-remove
    ],
  },
  // animexin
  gdriveplayer: {
    match: ['*://gdriveplayer.me/embed*'],
  },
  // OtakuFR
  sendvid: {
    match: ['*://sendvid.net/v/*', '*://sendvid.com/embed/*'],
  },
  // OtakuFR
  streamz: {
    match: ['*://streamz.cc/*'],
  },
  // OtakuFR/animewho
  vidbm: {
    match: ['*://*.vidbem.com/embed-*'],
  },
  // OtakuFR
  cloudhost: {
    // TODO(player): cloudhost.to ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "OtakuFR" encore livrée : trouver le domaine de remplacement.
    match: ['*://*.cloudhost.to/*/mediaplayer/*/_embed.php?*'],
  },
  // OtakuFR
  letsupload: {
    match: ['*://*.letsupload.co/*/mediaplayer/*/_embed.php?*'],
  },
  // 9anime (page retirée)
  streamtape: {
    match: [
      '*://streamtape.com/*',
      '*://streamtape.net/*',
      '*://streamtape.xyz/*',
      '*://streamtape.to/*',
      '*://strcloud.in/*',
      '*://strcloud.link/*',
      '*://streamta.pe/*',
      '*://strtape.tech/*',
      '*://strtapeadblock.club/*',
      '*://strtapeadblock.me/*',
      '*://streamta.site/*',
      '*://scloud.online/*',
      '*://strtpe.link/*',
      '*://stape.me/*',
      '*://stape.fun/*',
      '*://streamtapeadblock.art/*',
    ],
  },
  // monoschinos
  monoschinos: {
    match: ['*://reproductor.monoschinos.com/*'],
  },
  // AnimeStreamingFR
  uptostream: {
    match: ['*://uptostream.com/iframe/*'],
  },
  // Gogoanime (page retirée)
  easyload: {
    match: ['*://easyload.io/e/*'],
  },
  // Kissanime (page retirée)
  googleusercontent: {
    match: ['*://*.googleusercontent.com/gadgets/*'],
  },
  // animedesu (page retirée)
  animedesu: {
    match: ['*://animedesu.pl/player/desu.php?v=*'],
  },
  // animevost
  animevost: {
    match: ['*://animevost.org/frame5.php?play=*'],
  },
  // okanime
  okanime: {
    match: ['*://*.okanime.com/cdn/*/embed/?*'],
  },
  // gogoanime (page retirée)
  gogostream: {
    match: [
      '*://*.gogo-stream.com/*',
      '*://*.gogo-play.net/*',
      '*://*.streamani.net/*',
      '*://*.goload.pro/*',
      '*://*.goload.io/*',
      '*://*.gogoplay1.com/*',
      '*://*.gogoplay.io/*',
      '*://*.gogohd.net/*',
      '*://*.playtaku.net/*',
      '*://*.playtaku.online/*',
      '*://*.goone.pro/*',
      '*://*.embtaku.pro/*',
      '*://*.embtaku.com/*',
      '*://*.s3taku.com/*',
      '*://*.s3embtaku.pro/*',
      // auto-gogostream-replace-dont-remove
    ],
  },
  // bs.to
  vivo: {
    match: ['*://vivo.sx/embed/*'],
  },
  // 9anime (page retirée)
  vidstream: {
    match: [
      '*://vidstream.pro/embed/*',
      '*://vidstream.pro/e/*',
      '*://vidstream.pro/embed/*',
      '*://vidstream.pro/e/*',
      '*://vizcloud.online/embed/*',
      '*://vizcloud.online/e/*',
      '*://vidplay.site/e/*',
      '*://vidplay.lol/e/*',
      '*://vidplay.online/e/*',
      '*://vid142.site/e/*',
      '*://vid1a52.site/e/*',
      '*://vid2a41.site/e/*',
    ],
  },
  // gogo (page retirée)
  streamsb: {
    match: [
      '*://streamsb.net/*',
      '*://streamsb.com/*',
      '*://sbembed.com/*',
      '*://sbembed1.com/*',
      '*://sbvideo.net/*',
      '*://sbplay.org/*',
      '*://sbplay.one/*',
      '*://sbplay1.com/*',
      '*://sbplay2.com/*',
      '*://embedsb.com/*',
      '*://watchsb.com/*',
      '*://sbfull.com/e/*',
      '*://ssbstream.net/*',
      '*://streamsss.net/*',
      '*://sbanh.com/e/*',
      '*://sblongvu.com/e/*',
      '*://sbchill.com/e/*',
      '*://sbone.pro/e/*',
      '*://sbani.pro/e/*',
      // auto-gogostreamsb-replace-dont-remove
    ],
  },
  // gogo (page retirée)
  dood: {
    match: [
      '*://dood.to/*',
      '*://dood.watch/*',
      '*://doodstream.com/*',
      '*://dood.la/*',
      '*://*.dood.video/*',
      '*://dood.ws/e/*',
      '*://dood.sh/e/*',
      '*://dood.so/e/*',
      '*://dood.pm/e/*',
      '*://dood.wf/e/*',
      '*://dood.re/e/*',
      '*://dooood.com/e/*',
      '*://dood.li/e/*',
      '*://playmogo.com/e/*',
      // auto-gogodood-replace-dont-remove
    ],
  },
  // otakustv.com
  youtubeEmbed: {
    match: ['*://youtube.googleapis.com/embed/*drive.google.com*'],
  },
  // animewho
  hdvid: {
    match: ['*://hdvid.tv/*'],
  },
  // animewho
  vidfast: {
    match: ['*://vidfast.co/*'],
  },
  // animewho
  supervideo: {
    match: ['*://supervideo.tv/*'],
  },
  // animewho
  jetload: {
    match: ['*://jetload.net/*'],
  },
  // animewho
  saruch: {
    match: ['*://saruch.co/*'],
  },
  // animewho voiranime animanosub
  vidmoly: {
    match: [
      '*://vidmoly.me/*',
      '*://vidmoly.to/*',
      '*://vidmoly.net/*',
      '*://vidmoly.biz/*',
      // auto-vidmoly-replace-dont-remove
    ],
  },
  // animewho
  upstream: {
    match: ['*://upstream.to/*'],
  },
  // animewho
  abcvideo: {
    match: ['*://abcvideo.cc/*'],
  },
  // animewho
  aparat: {
    match: ['*://aparat.cam/*', '*://www.aparat.com/video/video/embed/*'],
  },
  // animewho
  vudeo: {
    match: ['*://vudeo.net/*'],
  },
  // animewho
  voe: {
    match: [
      '*://voe.sx/e/*',
      '*://gamoneinterrupted.com/e/*',
      '*://crownmakermacaronicism.com/e/*',
      '*://cigarlessarefy.com/e/*',
      '*://strawberriesporail.com/e/*',
      '*://nonesnanking.com/e/*',
      '*://bradleyviewdoctor.com/e/*',
      '*://johntryopen.com/e/*',
      '*://brookethoughi.com/e/*',
      '*://ryanagoinvolve.com/e/*',
      '*://shannonpersonalcost.com/e/*',
      '*://brucevotewithin.com/e/*',
      '*://loriwithinfamily.com/e/*',
      '*://bethshouldercan.com/e/*',
      '*://sandratableother.com/e/*',
      '*://robertordercharacter.com/e/*',
      '*://maxfinishseveral.com/e/*',
      '*://alejandrocenturyoil.com/e/*',
      '*://heatherwholeinvolve.com/e/*',
      '*://richardsignfish.com/e/*',
      '*://diananatureforeign.com/e/*',
      '*://jilliandescribecompany.com/e/*',
      '*://lukesitturn.com/e/*',
      '*://mikaylaarealike.com/e/*',
      '*://christopheruntilpoint.com/e/*',
      '*://walterprettytheir.com/e/*',
      '*://crystaltreatmenteast.com/e/*',
      '*://myvidplay.com/e/*',
      '*://lauradaydo.com/e/*',
      '*://lancewhosedifficult.com/e/*',
      '*://dianaavoidthey.com/e/*',
      '*://jefferycontrolmodel.com/e/*',
      '*://jessicaclearout.com/e/*',
      '*://marissasharecareer.com/e/*',
      '*://charlestoughrace.com/e/*',
      '*://timmaybealready.com/e/*',
      '*://richardquestionbuilding.com/e/*',
      '*://charlessheimprove.com/e/*',
      '*://maryspecialwatch.com/e/*',
      '*://benjaminreducecommunity.com/e/*',
      '*://nicholasbreakplan.com/e/*',
      '*://rebeccasciencestreet.com/e/*',
      '*://ericeastweight.com/e/*',
      '*://kathyinformationwhether.com/e/*',
      '*://bryantenunder.com/e/*',
      '*://vickisaveworker.com/e/*',
      '*://rebeccacostthousand.com/e/*',
      '*://jessicayeahcatch.com/e/*',
      '*://jeanprofessorcentral.com/e/*',
      '*://juliewomanwish.com/e/*',
      '*://garylargeavailable.com/e/*',
      '*://jennifereconomicgive.com/e/*',
      '*://pamelachangemission.com/e/*',
      '*://matthewhotelscience.com/e/*',
      // auto-voe-replace-dont-remove
    ],
  },
  // animewho
  vidoo: {
    // TODO(player): vidoo.tv ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "animewho" encore livrée : trouver le domaine de remplacement.
    match: ['*://vidoo.tv/*'],
  },
  // animewho
  nxload: {
    match: ['*://nxload.com/*'],
  },
  // animewho
  videobin: {
    match: ['*://videobin.co/*'],
  },
  // animewho
  uqload: {
    match: ['*://uqload.com/*'],
  },
  // animewho
  evoload: {
    match: ['*://evoload.io/*'],
  },
  // kickassanime
  kaaplay: {
    match: [
      '*://vidnethub.net/*',
      '*://vidco.pro/*',
      '*://krussdomi.com/*',
    ],
  },
  // animeshouse (page retirée)
  animeshouse: {
    match: [
      '*://*.animeshouse.net/gcloud/*',
      '*://*.animeshouse.net/playerBlue/*',
      '*://*.animeshouse.net/mp4/*',
      '*://*.animeshouse.net/ah-clp-new/*',
    ],
  },
  // animixplay (page retirée)
  animato: {
    match: ['*://animato.me/embed/*'],
  },
  // animixplay (page retirée)
  kimanime: {
    match: ['*://kimanime.ru/AnimeIframe/*'],
  },
  // gogoanime (page retirée)
  streamhd: {
    match: ['*://*.streamhd.cc/*'],
  },
  // zoro (page retirée)
  rapidstream: {
    match: ['*://*.rapid-cloud.co/*'],
  },
  // 9anime (page retirée)
  videovard: {
    match: ['*://videovard.sx/*', '*://videovard.to/*'],
  },
  // Streamlare (page retirée)
  streamlare: {
    match: ['*://streamlare.com/e/*'],
  },
  BetterAnime: {
    match: ['*://betteranime.net/player*'],
  },
  // animixplay (page retirée)
  streamzz: {
    match: ['*://streamzz.to/*'],
  },
  // animixplay (page retirée)
  protonvideo: {
    match: ['*://protonvideo.to/iframe/*'],
  },
  // animixplay (page retirée)
  ninjastream: {
    match: ['*://ninjastream.to/watch/*'],
  },
  // anime-odcinki
  harajuku: {
    match: ['*://harajuku.pl/*'],
  },
  // anime-shitai (page retirée)
  vupload: {
    match: ['*://vupload.com/*'],
  },
  // turkanime
  turkanime: {
    match: [
      '*://*.turkanime.net/player/*',
      '*://*.turkanime.co/player/*',
      '*://*.turkanime.co/embed/*',
    ],
  },
  // turkanime
  cozyplayer: {
    // TODO(player): play.cozyplayer.com ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "turkanime" encore livrée : trouver le domaine de remplacement.
    match: ['*://play.cozyplayer.com/*'],
  },
  // turkanime
  odnoklassniki: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout odnoklassniki.ru,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://odnoklassniki.ru/*'],
  },
  // turkanime
  myalucard: {
    // TODO(player): myalucard.xyz ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "turkanime" encore livrée : trouver le domaine de remplacement.
    match: ['*://myalucard.xyz/*'],
  },
  // animexin
  mobi: {
    match: ['*://uploads.mobi/*'],
  },
  // anistream (page retirée)
  bunny: {
    match: ['*://iframe.mediadelivery.net/embed/*'],
  },
  // animixplay (page retirée)
  yfvf: {
    match: ['*://*.yfvf.com/*'],
  },
  // animetoast
  dydrox: {
    match: ['*://waaw.to/*'],
  },
  // turkanime
  suzihaza: {
    match: ['*://suzihaza.com/*'],
  },
  // monoschinos
  solidfiles: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout solidfiles.com,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://*.solidfiles.com/*'],
  },
  // animeworld
  animeworld: {
    match: [
      '*://www.animeworld.tv/api/episode/serverPlayerAnimeWorld?id=*',
      '*://www.animeworld.so/api/episode/serverPlayerAnimeWorld?id=*',
      '*://www.animeworld.ac/api/episode/serverPlayerAnimeWorld?id=*',
    ],
  },
  // 9anime animenosub
  filemoon: {
    match: [
      '*://filemoon.sx/e/*',
      '*://filemoon.sx/lol/*',
      '*://filemoon.top/e/*',
      '*://filemoon.top/lol/*',
      '*://fmoonembed.pro/e/*',
      '*://fmoonembed.pro/lol/*',
      '*://1azayf9w.xyz/e/*',
      '*://1azayf9w.xyz/lol/*',
      '*://z7ihwgqj.fun/*',
      '*://pqham.com/*',
    ],
  },
  // toonanime
  toonvip: {
    match: ['*://mb.toonanime.xyz/dist/*'],
  },
  // aniyan
  aniyan: {
    match: ['*://aniyan.net/jwplayer/*'],
  },
  // animelon
  animelon: {
    match: ['*://*.googlevideo.com/videoplayback?*'],
  },
  // animenosub
  animenosub: {
    match: ['*://animenosub.upn.one/#*', '*://nova.upn.one/*'],
  },
  // voiranime
  streamhide: {
    match: ['*://*.streamhide.to/e/*'],
  },
  // zoro (page retirée)
  megacloud: {
    match: ['*://megacloud.tv/*', '*://megacloud.club/*', '*://megacloud.blog/*'],
  },
  // animeunity
  vixcloud: {
    match: ['*://vixcloud.cc/*', '*://vixcloud.co/*'],
  },
  // WitAnime
  yonaplay: {
    // TODO(player): yonaplay.org ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "WitAnime" encore livrée : trouver le domaine de remplacement.
    match: ['*://yonaplay.org/*'],
  },
  // WitAnime
  fourshared: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout 4shared.com,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://*.4shared.com/*'],
  },
  // WitAnime
  videa: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout videa.hu,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://*.videa.hu/*'],
  },
  // WitAnime
  soraplay: {
    match: ['*://*.soraplay.xyz/*'],
  },
  // animeflv/gogo
  streamwish: {
    match: [
      '*://streamwish.to/e/*',
      '*://sfastwish.com/e/*',
      '*://awish.pro/e/*',
      '*://hlswish.com/e/*',
      '*://swishsrv.com/e/*',
      // auto-gogostreamwish-replace-dont-remove
    ],
  },
  // gogo (page retirée)
  filelions: {
    match: [
      '*://alions.pro/v/*',
      // auto-gogofilelions-replace-dont-remove
    ],
  },
  // 9anime (page retirée)
  megaf: {
    match: ['*://megaf.cc/e/*'],
  },
  // Q1N
  q1n: {
    match: [
      '*://rogeriobetin.com/*',
      '*://api.anivideo.net/*',
      '*://listeamed.net/*',
    ],
  },
  // animesama
  oneupload: {
    match: ['*://oneupload.to/*'],
  },
  // animexin
  vimeo: {
    match: ['*://player.vimeo.com/*'],
  },
  // animexin
  rumble: {
    match: ['*://rumble.com/embed/*'],
  },
  // aninexus
  aninexusPlayer: {
    match: ['*://dhtpre.com/*'],
  },
  // miruro
  bun: {
    match: ['*://*.bunniescdn.online/*'],
  },
  // hikari (page retirée)
  boosterx: {
    match: ['*://boosterx.stream/*'],
  },
  // animeav1
  animeav1: {
    match: ['*://player.zilla-networks.com/*'],
  },
  // Anizm
  anizmplayer: {
    match: ['*://*.anizmplayer.com/*'],
  },
  // aniworld
  loadx: {
    match: ['*://loadx.ws/*'],
  },
  // AnimeKhor
  odysee: {
    // TODO(player): pattern non restreint — iframe.js est injecté sur tout odysee.com,
    // pas seulement sur les pages d'embed. À restreindre au chemin d'embed après vérification.
    match: ['*://odysee.com/*'],
  },
  // AnimeKhor
  emturbovid: {
    match: ['*://emturbovid.com/*'],
  },
  // AnimeKhor
  upns: {
    match: ['*://*.upns.live/*'],
  },
  // AnimeKhor
  p2pstream: {
    match: ['*://*.p2pstream.vip/*'],
  },
  // Anoboye
  anoboye: {
    // TODO(player): player.anoboye.com ne résout plus (NXDOMAIN, 2026-07-29).
    // Page "Anoboye" encore livrée : trouver le domaine de remplacement.
    match: ['*://player.anoboye.com/watch/*'],
  },
  // kuudere
  zencloud: {
    match: ['*://zencloudz.cc/*'],
  },
  kumi: {
    match: ['*://*.playerp2p.live/*', '*://*.rpmvip.com/*'],
  },
  sHide: {
    match: ['*://callistanise.com/*'],
  },
  allManga: {
    match: ['*://allanime.day/*', '*://allanime.uns.bio/*'],
  },
};
