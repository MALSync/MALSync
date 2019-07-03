import Vue from 'vue';
import main from './../installPage/main.vue';

declare var componentHandler: any;

document.getElementsByTagName('head')[0].onclick = function(e){
  try{
    componentHandler.upgradeDom();
  }catch(e){
    console.log(e);
    setTimeout(function(){
      componentHandler.upgradeDom();
    },500);
  }
}

api.settings.init()
  .then(()=>{
    var minimalVue = new Vue({
      render: h => h(main)
    }).$mount('#app')
  })


