(function(){
'use strict';

var process;
var currentTutorialStep = 0;
var canvasRef;

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
    var finished = button.parentElement.parentElement.parentElement.querySelector(".tutorial-next");
    console.log(finished);
    finished.setAttribute('completed', 'true');

});
Event.on(document.body, 'ui:click', '.tutorial-see-solution', function(evt){
    var button = dom.closest(evt.target, 'button');
    var finished = button.parentElement.parentElement.parentElement.querySelector(".tutorial-solution");
    console.log(finished);
    finished.setAttribute('completed', 'true');

});

//For switching to the next step
//at this point it just removes the finish block
Event.on(document.body, 'ui:click', '.nextTutorial', function(evt){
    var button = dom.closest(evt.target, 'button');
    var tut = button.parentElement.parentElement.parentElement.parentElement;
    tut.querySelector('wb-hbox[class="tutorial-finished"]').removeAttribute('completed');
    tut.querySelector('wb-hbox[class="tutorial-header"]').scrollIntoView();

    showCurrentTutorialStep(currentTutorialStep);

});

// For switching between the tutorial and canvas
Event.on(document.body, 'ui:click', '.show-canvas', showCanvas);


function showCanvas(evt){
    if(evt){
        var tab = dom.closest(evt.target, 'button');
    }
    else{//because I am using this to jump out of tutorials w/o a click
        var tab = dom.find('button.show-canvas');
    }
    if(tab.getAttribute('pressed') !== 'true'){
        var existing = tab.parentElement.querySelector('button[pressed=true]');
        if(existing){existing.removeAttribute('pressed');}
        tab.setAttribute('pressed', 'true');
        existing = tab.parentElement.parentElement.querySelector('wb-displaybox[selected=true]');
        if(existing){existing.removeAttribute('selected');}
        var tabAssoc = tab.parentElement.parentElement.querySelector('wb-displaybox.canvas');
        tabAssoc.setAttribute('selected', 'true');
        var tutCanvas = dom.find('canvas');
        dom.find('wb-playground').appendChild( tutCanvas);
        tutCanvas.removeAttribute('style');
        runtime.handleResize();
    }
}

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
        var playCanvas = dom.find('canvas');
        dom.find('div.tutorial-current > wb-hbox.tutorial-output >div > div.canvas-holder').appendChild(playCanvas);
        playCanvas.style.width = '250px';
        playCanvas.style.height = '190px';

    }
});
// Documentation for modal dialogs: https://github.com/kylepaulsen/NanoModal

Event.on(document.body, 'ui:click', '.do-run', startScript);
Event.on(document.body, 'ui:click','.do-stop', stopScript);
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
        runtime.clear();
    }
    evt.target.blur();
    runtime.getStage().focus();
}

function stopAndClearScripts(){
    runtime.clear();
    runtime.resetStage();
    File.clearScripts();
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
                stopAndClearScripts();
                File.loadScriptsFromGistId(evt);
                modal.hide();
            }
        }, {
            text: "Open File",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'openFile']);
                stopAndClearScripts();
                File.loadScriptsFromFilesystem(evt);
                modal.hide();
            }
        },{
            text: "New",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'new']);
                stopAndClearScripts();
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
                stopAndClearScripts();
                File.loadScriptsFromExample('waterbear_in_space');
                modal.hide();
            }
        },{
            text: "Noise 3D",
            handler: function(modal){
                _gaq.push(['_trackEvent', 'Tutorial', 'Noise3D']);
                stopAndClearScripts();
                File.loadScriptsFromExample('noise3d');
                modal.hide();
            }
        }]
    });
    fileModel.show();
}

function handleTutorialButton(evt){
    var fileModel = nanoModal("Load a tutorial.",
        {overlayClose: true, // Can't close the modal by clicking on the overlay.
        buttons: [{
            text: "Waterbear in Space",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'Tutorial', 'WaterbearInSpace']);
                var tutButton = dom.find('button.show-tutorial');
                canvasRef = dom.find('canvas');
                File.loadTutorialFromName('wb_in_space');
                modal.hide();
                currentTutorialStep = 0;
                tutButton.removeAttribute('hidden');
            }
        },{
            text: "Waterbear Piano",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'Tutorial', 'WaterbearPiano']);
                var tutButton = dom.find('button.show-tutorial');
                canvasRef = dom.find('canvas');
                File.loadTutorialFromName('wb-piano');
                modal.hide();
                currentTutorialStep = 0;
                tutButton.removeAttribute('hidden');
            }
        }]
    });
    fileModel.show();
}

function switchTutorialCanvas(){
    var tutCanvas = dom.find('canvas');
        var target = dom.find('div.tutorial-current > wb-hbox.tutorial-output >div > div.canvas-holder');
        target.appendChild(tutCanvas);
}

function showCurrentTutorialStep() {
    var tutorialSteps = document.getElementsByClassName('tutorial-step');
    for(var i=0; i<tutorialSteps.length; i = i+1){
        tutorialSteps[i].classList.add('tutorial-hidden');
        tutorialSteps[i].classList.remove('tutorial-current');
    }
    tutorialSteps[currentTutorialStep].classList.remove('tutorial-hidden');
    tutorialSteps[currentTutorialStep].classList.add('tutorial-current');
    if(currentTutorialStep > 0)
        switchTutorialCanvas();
    else{
        dom.find('div.tutorial-current > wb-hbox.tutorial-output >div > div.canvas-holder').appendChild(canvasRef);
    }
    currentTutorialStep++;
}
Event.on(document.body, 'ui:click', '.load-solution', function(evt){
    var buttonPressed = dom.closest(evt.target, 'button');
    var gistId = buttonPressed.getAttribute('gistID');
    stopAndClearScripts();
    File.loadScriptsFromGistId(gistId);
    
});




Event.on(document.body, 'ui:click', '.open-example', handleExampleButton);
Event.on(document.body, 'ui:click', '.open-tutorial', handleTutorialButton);

Event.on(document.body, 'dragging:touchstart', null, Event.initDrag);
Event.on(document.body, 'dragging:touchmove', null, Event.dragging);
Event.on(document.body, 'dragging:touchend', null, Event.endDrag);
Event.on(document.body, 'dragging:mousedown', null, Event.initDrag);
Event.on(document.body, 'dragging:mousemove', null, Event.dragging);
Event.on(window, 'dragging:mouseup', null, Event.endDrag);
Event.on(window, 'dragging:keyup', null, Event.cancelDrag);
Event.on(window, 'input:keydown', null, Event.handleKeyDown);
Event.on(window, 'input:keyup', null, Event.handleKeyUp);
Event.on(window, 'ui:tutorial-load', null, showCurrentTutorialStep);

Event.on(document.body, 'ui:click', '.undo', Event.handleUndoButton);
Event.on(document.body, 'ui:click', '.redo', Event.handleRedoButton);
Event.on(window, 'input:keydown', null, Event.undoKeyCombo);
Event.on(window, 'input:keydown', null, Event.redoKeyCombo);
Event.clearStacks();

window.app = {
    message: message,
    error: error,
    warn: warn,
    info: info
};

})();
