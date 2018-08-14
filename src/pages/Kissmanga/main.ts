import {pageInterface} from "./../pageInterface";

export const Kissmanga: pageInterface = {
    domain: 'http://kissmanga.com',
    getIdentifier: function(){return $('.bigChar').first().text();}
};
