import { expect } from 'chai';
import { exportData, importData } from '../../../../src/_provider/Local/import';

setGlobals();
function setGlobals() {
  global.con = require('../../../../src/utils/console');
  global.con.log = function() {};
  global.con.error = function() {};
  global.con.info = function() {};

  const state = {};

  global.api = {
    settings: {
      get(key) {
        return true;
      },
    },
    storage: {
      get(key) {
        return Promise.resolve(state[key]);
      },
      set(key, value) {
        state[key] = JSON.parse(JSON.stringify(value));
        return Promise.resolve();
      },
      remove(key) {
        delete state[key];
        return Promise.resolve();
      },
      list() {
        return Promise.resolve(state);
      },
      assetUrl(key) {
        return 'image';
      },
    },
  };

  global.btoa = input => input;

  global.utils = utils;

  global.testData = {};
}

const singleTestData = {
  'local://AnimeXin/anime/martial-master': {
    name: 'Martial Master',
    tags: ',malSync::aHR0cHM6Ly9hbmltZXhpbi54eXovYW5pbWUvbWFydGlhbC1tYXN0ZXIv::',
    progress: 17,
    volumeprogress: 0,
    score: 0,
    status: 1,
  },
};

const testData = {
  "local://AnimeXin/anime/martial-master":{"name":"Martial Master","tags":",malSync::aHR0cHM6Ly9hbmltZXhpbi54eXovYW5pbWUvbWFydGlhbC1tYXN0ZXIv::","progress":17,"volumeprogress":0,"score":0,"status":1},
  "local://AnimeXin/anime/soul-land-s2":{"name":"Soul Land Season 2","tags":",malSync::aHR0cHM6Ly9hbmltZXhpbi54eXovYW5pbWUvc291bC1sYW5kLXMyLw==::","progress":101,"volumeprogress":0,"score":0,"status":1},
  "local://AnimeXin/anime/wan-jie-chun-qiu":{"name":"Wan Jie Chun Qiu","tags":",malSync::aHR0cHM6Ly9hbmltZXhpbi54eXovYW5pbWUvd2FuLWppZS1jaHVuLXFpdS8=::","progress":6,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/a_young_girls_dream":{"name":"Unknown","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2FfeW91bmdfZ2lybHNfZHJlYW0=::","progress":36,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/aj923145":{"name":"Sword Of Benevolence","tags":"","progress":50,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/aq920543":{"name":"Martial Arts Reigns","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2FxOTIwNTQz::","progress":147,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/bl919120":{"name":"Young Sorcerer Master","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2JsOTE5MTIw::","progress":42,"volumeprogress":"0","score":0,"status":"3"},
  "local://MangaNelo/manga/chasing_star_moon":{"name":"Chasing Star Moon","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2NoYXNpbmdfc3Rhcl9tb29u::","progress":27,"volumeprogress":"0","score":0,"status":"3"},
  "local://MangaNelo/manga/cn919550":{"name":"Did You Know That A Playboy Can Change His Job To A Sage? ~The Level 99 Jester Expelled From The Heroes' Party Will Become A 'great Sage'~","tags":"","progress":9,"volumeprogress":"0","score":0,"status":1},
  "local://MangaNelo/manga/dtdc220351567737255":{"name":"Star Martial God Technique","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2R0ZGMyMjAzNTE1Njc3MzcyNTU=::","progress":342,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/el920171":{"name":"The Best Female Fairy","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2VsOTIwMTcx::","progress":21,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/feng_ni_tian_xia":{"name":"Feng Ni Tian Xia","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2ZlbmdfbmlfdGlhbl94aWE=::","progress":345,"volumeprogress":"0","score":10,"status":"1"},
  "local://MangaNelo/manga/feng_qi_cang_lan":{"name":"Unknown","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2ZlbmdfcWlfY2FuZ19sYW4=::","progress":279,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/ff919711":{"name":"Peerless Battle Spirit","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2ZmOTE5NzEx::","progress":104,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/ft921974":{"name":"Neta Chara Kari Play No Tsumori Ga Isekai Shoukan ~Mayoibito Wa Josei No Teki Ni Ninteisaremashita~","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2Z0OTIxOTc0::","progress":6,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/gy921911":{"name":"High School Life Of An Exorcist","tags":"","sUrl":"https://manganelo.com/manga/gy921911","progress":85,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/holy_ancestor":{"name":"404 NOT FOUND","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2hvbHlfYW5jZXN0b3I=::","progress":258,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/hw921865":{"name":"Xianzun System In The City","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2h3OTIxODY1::","progress":70,"volumeprogress":"0","score":0,"status":"1"},
  "local://MangaNelo/manga/immortal_merchant":{"name":"Immortal Merchant","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2ltbW9ydGFsX21lcmNoYW50::","progress":8,"volumeprogress":"0","score":0,"status":"3"},
  "local://MangaNelo/manga/ix921032":{"name":"The Descent Of The Demonic Master","tags":",malSync::dW5kZWZpbmVk::","progress":48,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/jl922671":{"name":"Don’T Provoke The Crazy, Dumb And Villainous Consort","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2psOTIyNjcx::","progress":0,"volumeprogress":0,"score":0,"status":6},
  "local://MangaNelo/manga/kt922166":{"name":"Auto Hunting","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2t0OTIyMTY2::","progress":40,"volumeprogress":"0","score":0,"status":"1"},
  "local://MangaNelo/manga/lx921073":{"name":"As You Wish, Prince","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL2x4OTIxMDcz::","progress":70,"volumeprogress":"0","score":0,"status":"1"},
  "local://MangaNelo/manga/mg922249":{"name":"Ranker’S Return","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL21nOTIyMjQ5::","progress":2,"volumeprogress":"0","score":0,"status":"3"},
  "local://MangaNelo/manga/moshi_fanren":{"name":"Moshi Fanren","tags":"","progress":266,"volumeprogress":"0","score":0,"status":1,"sUrl":"https://manganelo.com/manga/moshi_fanren"},
  "local://MangaNelo/manga/ny917755":{"name":"Phoenix Nirvana","tags":"","sUrl":"https://manganelo.com/manga/ny917755","progress":78,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/pw921711":{"name":"The Supreme System","tags":"","progress":54,"volumeprogress":"0","score":0,"status":"1"},
  "local://MangaNelo/manga/read_the_gamer_manga_online_free":{"name":"The Gamer","tags":"","progress":348,"volumeprogress":0,"score":0,"status":1,"sUrl":"https://manganelo.com/manga/read_the_gamer_manga_online_free"},
  "local://MangaNelo/manga/rx919523":{"name":"I Am The Sorcerer King","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL3J4OTE5NTIz::","progress":114,"volumeprogress":0,"score":0,"status":1,"sUrl":"https://manganelo.com/manga/rx919523"},
  "local://MangaNelo/manga/sm917699":{"name":"Against The Gods","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL3NtOTE3Njk5::","progress":81,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/the_mythical_realm":{"name":"The Mythical Realm","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL3RoZV9teXRoaWNhbF9yZWFsbQ==::","progress":203,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/uo923026":{"name":"Tenshoku No Shinden O Hirakimashita","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL3VvOTIzMDI2::","progress":1,"volumeprogress":"0","score":0,"status":"3"},
  "local://MangaNelo/manga/vrin278571580265812":{"name":"Versatile Mage","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL3ZyaW4yNzg1NzE1ODAyNjU4MTI=::","progress":0,"volumeprogress":0,"score":0,"status":6},
  "local://MangaNelo/manga/x_epoch_of_dragon":{"name":"X Epoch Of Dragon","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL3hfZXBvY2hfb2ZfZHJhZ29u::","progress":13,"volumeprogress":"0","score":0,"status":"3"},
  "local://MangaNelo/manga/xc921213":{"name":"Immortal Nanny Dad","tags":",malSync::dW5kZWZpbmVk::","progress":102,"volumeprogress":"0","score":8,"status":"1"},
  "local://MangaNelo/manga/yong_heng_zhi_zun":{"name":"Yong Heng Zhi Zun","tags":",malSync::dW5kZWZpbmVk::","progress":104,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/zero_game":{"name":"Zero Game","tags":"","sUrl":"https://manganelo.com/manga/zero_game","progress":19,"volumeprogress":0,"score":0,"status":1},
  "local://MangaNelo/manga/zu917722":{"name":"A Returner's Magic Should Be Special","tags":",malSync::aHR0cHM6Ly9tYW5nYW5lbG8uY29tL21hbmdhL3p1OTE3NzIy::","progress":15,"volumeprogress":0,"score":0,"status":"1"},
  "local://MangaPark/manga/god-level-takeout-man":{"name":"God-Level Takeout Man","tags":",malSync::aHR0cHM6Ly9tYW5nYXBhcmsubmV0L21hbmdhL2dvZC1sZXZlbC10YWtlb3V0LW1hbg==::","progress":1,"volumeprogress":"0","score":0,"status":"1"},
  "local://Mangadex/manga/16069":{"name":"Tales of Demons and Gods","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzE2MDY5L3RhbGVzLW9mLWRlbW9ucy1hbmQtZ29kcw==::","progress":130,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/17859":{"name":"Life Howling","tags":"","progress":57,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/17968":{"name":"Ake no Tobari","tags":"","progress":2,"volumeprogress":"0","score":0,"status":3},
  "local://Mangadex/manga/20068":{"name":"Star Martial God Technique","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzIwMDY4L3N0YXItbWFydGlhbC1nb2QtdGVjaG5pcXVl::","progress":342,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/20540":{"name":"God of Martial Arts","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzIwNTQwL2dvZC1vZi1tYXJ0aWFsLWFydHM=::","progress":110,"volumeprogress":2,"score":0,"status":1},
  "local://Mangadex/manga/22648":{"name":"Goddess Creation System","tags":"","progress":11,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/23229":{"name":"The Scholar's Reincarnation","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzIzMjI5L3RoZS1zY2hvbGFyLXMtcmVpbmNhcm5hdGlvbg==::","progress":37,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/23368":{"name":"Hero? I Quit A Long Time Ago","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzIzMzY4L2hlcm8taS1xdWl0LWEtbG9uZy10aW1lLWFnbw==::","progress":229,"volumeprogress":"0","score":0,"status":1,"sUrl":"https://www.mangadex.org/title/23368/hero-i-quit-a-long-time-ago"},
  "local://Mangadex/manga/24163":{"name":"Chaotic Sword God","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzI0MTYzL2NoYW90aWMtc3dvcmQtZ29k::","progress":87,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/24667":{"name":"Tadashi Ore wa Heroine Toshite","tags":"","progress":2,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/26048":{"name":"After Transformation, Mine and Her Wild Fantasy","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzI2MDQ4L2FmdGVyLXRyYW5zZm9ybWF0aW9uLW1pbmUtYW5kLWhlci13aWxkLWZhbnRhc3k=::","progress":132,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/28717":{"name":"Logres of Swords and Sorcery: Goddess of Disaster","tags":"","sUrl":"https://www.mangadex.org/title/28717/logres-of-swords-and-sorcery-goddess-of-disaster","progress":2,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/29203":{"name":"My Phoenix Is on Top","tags":"","progress":6,"volumeprogress":"0","score":0,"status":1},
  "local://Mangadex/manga/29330":{"name":"Circle Zero's Otherworldly Hero Business","tags":"","progress":27,"volumeprogress":"0","score":0,"status":"2"},
  "local://Mangadex/manga/29474":{"name":"Doctor Elise: The Royal Lady with the Lamp","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzI5NDc0L2RvY3Rvci1lbGlzZS10aGUtcm95YWwtbGFkeS13aXRoLXRoZS1sYW1w::","progress":109,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/31196":{"name":"I Was Trash","tags":",malSync::aHR0cHM6Ly93d3cubWFuZ2FkZXgub3JnL3RpdGxlLzMxMTk2L2ktd2FzLXRyYXNo::","progress":144,"volumeprogress":0,"score":0,"status":1},
  "local://Mangadex/manga/31249":{"name":"Because I'm an Uncle Who Runs a Weapon Shop","tags":"","progress":67,"volumeprogress":0,"score":0,"status":1,"sUrl":"https://www.mangadex.org/title/31249/because-i-m-an-uncle-who-runs-a-weapon-shop"},
  "local://Mangadex/manga/31476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31479":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31415":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31423":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3x76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31dsa76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/ewq476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3d476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31asd76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314s6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31as76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31cb476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3cvf476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31a76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31e76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147vcb6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3dasdycy476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314a6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/a4asd76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147dsad6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314d6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/sads314a6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314q6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31426":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31376":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31276":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31576":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31v76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31x76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31d76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31xcve76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3dsaf1276":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314x76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314q76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314276":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31f476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314xdsafsd76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314b76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/312476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3142132176":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314y76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314d76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314576":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314s76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3142dfsafsdf76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31y4576":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314yfssdaf76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314xc76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147i6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147z6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314r76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314z76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147l6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147n6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147c6":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314rsdf76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314qfs76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3x1476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3c1476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3v1476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3g1476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3n1476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314vr76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314dsf76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314a76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314t76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314zds76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3146476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314ew4776":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3142r76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314w476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314676":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147126":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314aq76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31475436":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3146d76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3142as76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3144sfd76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3146sfd76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3142fsd76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3144fds76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3142576":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314176":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314376":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3145as76":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314sa676":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/311476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31das476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31342176":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/315476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3142276":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3144476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3141176":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31433376":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3147226":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314444476":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/314726":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31444276":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31411676":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/3143376":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31411176":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
  "local://Mangadex/manga/31454716":{"name":"Saikyou Shoku <Ryukishi> Kara Shokyu Shoku <Hakobiya> Ni Nattano Ni, Naze Ka Yushatachi Kara Tayoraretemasu","tags":"","progress":3,"volumeprogress":1,"score":0,"status":1},
};

setGlobals();
describe('Local Import/Export', function() {
  before(function() {
    setGlobals();
  });
  it(`import/export`, async function() {
    await importData(singleTestData);
    const res = await exportData();
    expect(res).to.deep.equal(singleTestData);
  });
  it(`mass import`, async function() {
    await importData(testData);
    const t = [
      'local://AnimeXin/anime/martial-master',
      'local://Mangadex/manga/22648',
      'local://MangaNelo/manga/zu917722',
      'local://MangaNelo/manga/lx921073',
    ];
    for (let i = 0; i < t.length; i++) {
      expect(await api.storage.get(t[i])).to.deep.equal(testData[t[i]]);
    }
  });
  it(`mass export`, async function() {
    await importData(testData);
    const res = await exportData();
    expect(res).to.deep.equal(testData);
  });
});
