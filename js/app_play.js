(function(){
'use strict';

// FIXME: This feedback is important and useful, but using it this way violates
// our localization principle: All user-visible text should be in HTML text,
// not attributes, CSS, or JavaScript. Once the messages have stabilized, move them
// to hidden HTML elements and refer to them by name so they can be localized.
var feedbackElem = document.querySelector('.feedback');
function message(color, text){
    if (feebackElem){
        feedbackElem.style.color = color;
        feedbackElem.value = text;
    }
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

Event.on('.do-run', 'ui:click', null, startScript);
Event.on('.do-stop', 'ui:click', null, stopScript);

function startScript(evt){
    // Do any necessary cleanup (e.g., clear event handlers).
    stopScript(evt);
    runtime.resetStage();
    evt.target.blur();
    runtime.getStage().focus();
    preload().whenLoaded(runScript);
}

function stopScript(evt){
    runtime.stopEventLoop();
    evt.target.blur();
    runtime.getStage().focus()
    runtime.clear();
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
    var globalScope = {};
    runtime.startEventLoop();
    dom.findAll('wb-workspace > wb-contains > *').forEach(function(block){
        if (block.run){
            block.run(globalScope);
        }
    });
}

Event.on(document.body, 'dragging:touchstart', null, Event.trackPointerDown);
Event.on(document.body, 'dragging:touchmove', null, Event.trackPointerPosition);
Event.on(document.body, 'dragging:touchend', null, Event.trackPointerUp);
Event.on(document.body, 'dragging:mousedown', null, Event.trackPointerDown);
Event.on(document.body, 'dragging:mousemove', null, Event.trackPointerPosition);
Event.on(window, 'input:keydown', null, Event.handleKeyDown);
Event.on(window, 'input:keyup', null, Event.handleKeyUp);

Event.on(window, 'ui:load', null, preload);
Event.on(window, 'ui:script-load', null, preload);
Event.on(window, 'ui:asset-load', null, runScript);

window.app = {
    message: message,
    error: error,
    warn: warn,
    info: info
};

})();
