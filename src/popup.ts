import {minimal} from "./minimal/minimalClass";
api.settings.init()
  .then(()=>{
    var minimalObj = new minimal($('html'));
  })
