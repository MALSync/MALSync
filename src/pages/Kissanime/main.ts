import {pageInterface} from "./../pageInterface";

export const Kissanime: pageInterface = {
    domain: 'http://kissanime.ru',
    getIdentifier: function(){return $('.bigChar').first().text();}
};
