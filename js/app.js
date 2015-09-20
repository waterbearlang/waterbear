(function(){
'use strict';
    var workspace = dom.find(document.body, 'wb-workspace');
    var BLOCK_MENU = document.querySelector('sidebar');
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

function warn(text, persist){
    if (persist){
        notifire({msg: text, types: 'warning', position: 'right', timeout: 5000})
    }else{
        message('orange', text);
    }
}

function tip(text){
    message('green', text);
}

function info(text){
    message('#333', text);
}

function clearFilter(){
    var sidebarBlocks = BLOCK_MENU.querySelectorAll('wb-expression');
    for(var i=0; i< sidebarBlocks.length; i++){
        sidebarBlocks[i].removeAttribute('filtered');
    }
    BLOCK_MENU.removeAttribute('filtered');
}

function setFilter(item){
    var i;
    var sidebarBlocks=[];

    var selectedType = item.getAttribute('type');
    if (selectedType){
        var selectedTypeList = selectedType.split(',');
        for(i=0; i<selectedTypeList.length; i++){
            sidebarBlocks = sidebarBlocks.concat(Array.prototype.slice.call(BLOCK_MENU.querySelectorAll('wb-expression[type *= ' + selectedTypeList[i] + ']')));
        }
        for(i=0; i< sidebarBlocks.length; i++){
            sidebarBlocks[i].setAttribute('filtered', 'true');
        }
        BLOCK_MENU.setAttribute('filtered', 'true');
    }
}

// Documentation for modal dialogs: https://github.com/kylepaulsen/NanoModal

/*
 * Run/Stop
 */
Event.on(document.body, 'ui:click', '.do-run', startScript);
Event.on(document.body, 'ui:click','.do-stop', stopScript);


function startScript(evt, options) {
    // Do any necessary cleanup (e.g., clear event handlers).
    stopScript(evt);
    runtime.resetStage();
    evt.target.blur();
    runtime.getStage().focus();

    /* Add emitter. */
    if (options === undefined) {
        options = {};
    }
    /* Certain events DEMAND that the emitting be done asynchronously, so
     * use setImmediate to emulate this.
     */
    options.emitter = options.emitter || function emitGlobalEvent(name, data) {
        return setImmediate(function asynchronousEmit() {
            Event.trigger(window, name, data);
        });
    };

    preload().whenLoaded(runScript.bind(null, options));
}

function stopScript(evt) {
    runtime.clear();
    evt.target.blur();
    runtime.getStage().focus();
}

function stopAndClearScripts(){
    runtime.clear();
    runtime.resetStage();
    File.clearScripts();
}

function preload() {
    /**
     * Asynchronously loads/initializes stuff needed by the script.
     */
    return assets.load({
        /* Selector for blocks that require loading  : function that begins the loading. */
        'wb-contains wb-expression[isasset=true]': assets.loadMedia,
        'wb-contains wb-expression[ns="geolocation"]':
        /* assets.waitFor waits for the given event to be triggered to signal
         * that the asset is loaded. */
            assets.waitFor('locationchanged', util.geolocation.startTrackingLocation),
        'wb-contains wb-expression[fn="tiltDirection"]':
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

function handleFileButton(evt){
    _gaq.push(['_trackEvent', 'File', 'file']);
    var fileModel = nanoModal("Select an option or click away to exit.",
        {overlayClose: true, // Can't close the modal by clicking on the overlay.
        buttons: [{
            text: "New",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'File', 'new']);
                stopAndClearScripts();
                modal.hide();
            },
            primary: true
        },{
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
        }]
    });
    fileModel.show();
}

Event.on(document.body, 'ui:click', '.open-files', handleFileButton);

function handleExampleButton(evt){
    _gaq.push(['_trackEvent', 'Example', 'examples']);
    var fileModel = nanoModal("Load an example program.",
        {overlayClose: true, // Can't close the modal by clicking on the overlay.
        buttons: [{
            text: "Space Bear",
            handler: function(modal) {
                _gaq.push(['_trackEvent', 'Example', 'WaterbearInSpace']);
                stopAndClearScripts();
                File.loadScriptsFromExample('waterbear_in_space');
                modal.hide();
            }
        },{
            text: "Noise 3D",
            handler: function(modal){
                _gaq.push(['_trackEvent', 'Example', 'Noise3D']);
                stopAndClearScripts();
                File.loadScriptsFromExample('noise3d');
                modal.hide();
            }
        },{
            text: "Dance",
            handler: function(modal){
                _gaq.push(['_trackEvent', 'Example', 'Dance']);
                stopAndClearScripts();
                File.loadScriptsFromExample('dance');
                modal.hide();
            }
        }]
    });
    fileModel.show();
}

Event.on(document.body, 'ui:click', '.open-example', handleExampleButton);

Event.on(document.body, 'dragging:touchstart', null, Event.initDrag);
Event.on(document.body, 'dragging:touchmove', null, Event.dragging);
Event.on(document.body, 'dragging:touchend', null, Event.endDrag);
Event.on(document.body, 'dragging:mousedown', null, Event.initDrag);
Event.on(document.body, 'dragging:mousemove', null, Event.dragging);
Event.on(window, 'dragging:mouseup', null, Event.endDrag);
Event.on(window, 'dragging:keyup', null, Event.cancelDrag);
Event.on(window, 'input:keydown', null, Event.handleKeyDown);
Event.on(window, 'input:keyup', null, Event.handleKeyUp);

Event.on(document.body, 'ui:click', '.undo', Undo.handleUndoButton);
Event.on(document.body, 'ui:click', '.redo', Undo.handleRedoButton);
Event.on(window, 'input:keydown', null, Undo.undoKeyCombo);
Event.on(window, 'input:keydown', null, Undo.redoKeyCombo);
//deselect all of the blocks and unfilter the sidebar if the 'Available Blocks' button is clicked
Event.on(document.body, 'ui:click', '.availableBlocks', clearFilter);

Undo.clearStacks();

window.app = {
    message: message,
    error: error,
    warn: warn,
    tip: tip,
    info: info,
    clearFilter: clearFilter,
    setFilter: setFilter
};
})();
