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
    message('orange', text);F
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
    var scope = {};
    runtime.startEventLoop();
    dom.findAll('wb-workspace > wb-contains > *').forEach(function(block){
        if (block.run){
            block.run(scope);
        }
    });
}

function handleFileButton(evt){
    var fileModel = nanoModal("Select an option or click away to exit.", 
        {overlayClose: true, // Can't close the modal by clicking on the overlay.
        buttons: [{
            text: "Save Gist",
            handler: function(modal) {
                File.saveCurrentScriptsToGist(evt);
                modal.hide();
            }
        }, {
            text: "Save File",
            handler: function(modal) {
                File.createDownloadUrl(evt);
                modal.hide();
            }
        }, {
            text: "Open Gist",
            handler: function(modal) {
                File.loadScriptsFromGistId(evt);
                modal.hide();
            }
        }, {
            text: "Open File",
            handler: function(modal) {
                File.loadScriptsFromFilesystem(evt);
                modal.hide();
            }
        },{
            text: "New",
            handler: function(modal) {
                File.clearScripts();
                modal.hide();
            },
            primary: true
        }]
    });
    fileModel.show();
}

Event.on(document.body, 'click', '.open-files', handleFileButton);

function handleExampleButton(evt){
    window.alert('No current examples or templates available. Check back later!');
}

Event.on(document.body, 'click', '.open-example', handleExampleButton);

window.app = {
    message: message,
    error: error,
    warn: warn,
    info: info
};

})();
