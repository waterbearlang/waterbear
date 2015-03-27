(function(){
'use strict';

var process;

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

//For displaying the finished block
Event.on(document.body, 'ui:click', '.tutorial-complete', function(evt){
    var button = dom.closest(evt.target, 'button');
    var finished = button.parentElement.parentElement.parentElement.querySelector('wb-hbox[class="tutorial-finished"]');
    finished.setAttribute('completed', 'true');

});

//For switching to the next step
//at this point it just removes the finish block
Event.on(document.body, 'ui:click', '.nextTutorial', function(evt){
    var button = dom.closest(evt.target, 'button');
    var tut = button.parentElement.parentElement.parentElement.parentElement;
    tut.querySelector('wb-hbox[class="tutorial-finished"]').removeAttribute('completed');
    tut.querySelector('wb-hbox[class="tutorial-header"]').scrollIntoView();

});

// For switching between the tutorial and canvas
Event.on(document.body, 'ui:click', '.show-canvas', function(evt){
    var tab = dom.closest(evt.target, 'button');
    if(tab.getAttribute('pressed') !== 'true'){
        var existing = tab.parentElement.querySelector('button[pressed=true]');
        if(existing){existing.removeAttribute('pressed');}
        tab.setAttribute('pressed', 'true');
        existing = tab.parentElement.parentElement.querySelector('wb-displaybox[selected=true]');
        if(existing){existing.removeAttribute('selected');}
        var tabAssoc = tab.parentElement.parentElement.querySelector('wb-displaybox.canvas');
        tabAssoc.setAttribute('selected', 'true');
    }
});
Event.on(document.body, 'ui:click', '.show-tutorial', function(evt){
    var tab = dom.closest(evt.target, 'button');
    if(tab.getAttribute('pressed') !== 'true'){
        var existing = tab.parentElement.querySelector('button[pressed=true]');
        if(existing){existing.removeAttribute('pressed');}
        tab.setAttribute('pressed', 'true');
        existing = tab.parentElement.parentElement.querySelector('wb-displaybox[selected=true]');
        if(existing){existing.removeAttribute('selected');}
        var tabAssoc = tab.parentElement.parentElement.querySelector('wb-displaybox.tutorial');
        tabAssoc.setAttribute('selected', 'true');
    }
});
// Documentation for modal dialogs: https://github.com/kylepaulsen/NanoModal

Event.on('.do-run', 'ui:click', null, startScript);
Event.on('.do-stop', 'ui:click', null, stopScript);
Event.on('.do-pause', 'ui:click', null, function () {
    /* TODO */
});
Event.on('.do-step', 'ui:click', null, function () {
    /* TODO */
});

function startScript(evt){
    // Do any necessary cleanup (e.g., clear event handlers).
    stopScript(evt);
    runtime.resetStage();
    evt.target.blur();
    runtime.getStage().focus();
    preload().whenLoaded(runScript);
}

function stopScript(evt) {
    if (process) {
        process.terminate();
        /* Throw out the now-useless process. */
        process = null;
        runtime.stopEventLoop();
        runtime.clear();
    }
    evt.target.blur();
    runtime.getStage().focus();
}

function preload() {
    return assets.load({
        'wb-contains wb-expression[isAsset=true]': assets.loadMedia,
        'wb-contains wb-expression[script^="geolocation."]':
            assets.waitFor('locationchanged', util.geolocation.startTrackingLocation),
        'wb-contains wb-expression[script="motion.tiltDirection"]':
            assets.waitFor('motionchanged', util.motion.startTrackingMotion)
    });
}

function runScript(){
    runtime.startEventLoop();
    console.assert(!process, 'Tried to run, but Process instance already exists!');
    /* Create brand new Process instance (because each process can only be
     * started once). */
    process = new WaterbearProcess().start();
}

function handleFileButton(evt){
    var fileModel = nanoModal("Select an option or click away to exit.",
        {overlayClose: true, // Can't close the modal by clicking on the overlay.
        buttons: [{
            text: "Save Gist",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'saveGist']);
                File.saveCurrentScriptsToGist(evt);
                modal.hide();
            }
        }, {
            text: "Save File",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'saveFile']);
                File.createDownloadUrl(evt);
                modal.hide();
            }
        }, {
            text: "Open Gist",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'openGist']);
                File.loadScriptsFromGistId(evt);
                modal.hide();
            }
        }, {
            text: "Open File",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'openFile']);
                File.loadScriptsFromFilesystem(evt);
                modal.hide();
            }
        },{
            text: "New",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'new']);
                File.clearScripts();
                modal.hide();
            },
            primary: true
        }]
    });
    fileModel.show();
}

Event.on(document.body, 'ui:click', '.open-files', handleFileButton);

function handleExampleButton(evt){
    var fileModel = nanoModal("Load an example program.",
        {overlayClose: true, // Can't close the modal by clicking on the overlay.
        buttons: [{
            text: "Waterbear in Space",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'Tutorial', 'WaterbearInSpace']);
                File.getScriptFromGistId('e06514193419705e6224');
                modal.hide();
            }
        }]
    });
    fileModel.show();
}

Event.on(document.body, 'ui:click', '.open-example', handleExampleButton);

window.app = {
    message: message,
    error: error,
    warn: warn,
    info: info
};

})();
