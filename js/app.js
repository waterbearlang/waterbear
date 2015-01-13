(function(){
'use strict';

// FIXME: This feedback is important and useful, but using it this way violates
// our localization principle: All user-visible text should be in HTML text,
// not attributes, CSS, or JavaScript. Once the messages have stabilized, move them
// to hidden HTML elements and refer to them by name so they can be localized.
var feedbackElem = document.querySelector('.feedback');
function message(color, text){
    feedbackElem.style.color = color;
    feedbackElem.value = text;
}

function error(text){
    message('red', text);
}

function warn(text){
    message('orange', text);
}

function info(text){
    message('#333', text);
}

// Documentation for modal dialogs: https://github.com/kylepaulsen/NanoModal

Event.on(document.body, 'click', '.do-run', preload);

function preload(){
    var assets = dom.findAll('wb-workspace > wb-contains wb-expression[isAsset=true]').map(function(asset){
        return asset.gatherValues()[0];
    });
    if (assets.length){
        sounds.load(assets);
        sounds.whenLoaded = run;
    }else{
        run();
    }
}

function run(){
    dom.findAll('wb-workspace > wb-contains > *').forEach(function(block){
        if (block.run){
            block.run();
        }
    });
}

window.app = {
    message: message,
    error: error,
    warn: warn,
    info: info
};

})();
