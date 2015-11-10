(function(){
'use strict';
    var workspace = dom.find(document.body, 'wb-workspace');
    var BLOCK_BOX = document.querySelector('wb-blockbox');
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
    var sidebarBlocks = BLOCK_BOX.querySelectorAll('wb-expression');
    for(var i=0; i< sidebarBlocks.length; i++){
        sidebarBlocks[i].removeAttribute('filtered');
    }
    BLOCK_BOX.removeAttribute('filtered');
}

function setFilter(item){
    var i;
    var sidebarBlocks=[];

    //deselect menu item that is selected
    var menu = dom.find('wb-menu[open=true]');
    if(menu) {
        menu.deselect();
    }

    var selectedType = item.getAttribute('type');
    if (selectedType){
        var selectedTypeList = selectedType.split(',');
        for(i=0; i<selectedTypeList.length; i++){
            sidebarBlocks = sidebarBlocks.concat(Array.prototype.slice.call(BLOCK_BOX.querySelectorAll('wb-expression[type *= ' + selectedTypeList[i] + ']')));
        }
        for(i=0; i< sidebarBlocks.length; i++){
            sidebarBlocks[i].setAttribute('filtered', 'true');
        }
        BLOCK_BOX.setAttribute('filtered', 'true');
    }
}

// Documentation for modal dialogs: https://github.com/kylepaulsen/NanoModal

/*
 * Run/Stop
 */
Event.on(document.body, 'ui:click', '.do-run', startScript);
Event.on(document.body, 'ui:click','.do-stop', stopScript);

var options = {};
function startScript(evt, opts) {
    // Do any necessary cleanup (e.g., clear event handlers).
    stopScript(evt);
    runtime.resetStage();
    evt.target.blur();
    runtime.getStage().focus();
    document.getElementById('playgroundBox').style.width = '100%';

    /* Add emitter. */
    if (opts !== undefined) {
        options = opts;
    }
    /* Certain events DEMAND that the emitting be done asynchronously, so
     * use setImmediate to emulate this.
     */
    options.emitter = options.emitter || function emitGlobalEvent(name, data) {
        return setImmediate(function asynchronousEmit() {
            Event.trigger(window, name, data);
        });
    };
    // Now we wait for the playground to be ready. When animation triggered by setting the width above is finished it will call playgroundReady and start preloading.
}

function playgroundReady(){
    preload().whenLoaded(runScript.bind(null, options));
}

function stopScript(evt) {
    document.getElementById('playgroundBox').style.width = '0';
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
    runtime.startEventLoop();
    dom.findAll('wb-workspace > wb-contains > *').forEach(function(block){
        if (block.run){
            block.run();
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

function handleExample(text, filename){
    return {
        text: text,
        handler: function(modal){
            _gaq.push(['_trackEvent', 'Example', text.split(/\s+/).join('')]);
            stopAndClearScripts();
            File.loadScriptsFromExample(filename);
            modal.hide();
        }
    }
}

function handleExampleButton(evt){
    _gaq.push(['_trackEvent', 'Example', 'examples']);
    var fileModel = nanoModal("Load an example program.",
        {
            overlayClose: true, // Can't close the modal by clicking on the overlay.
            buttons: [
                handleExample('Space Bear', 'waterbear_in_space'),
                handleExample('Noise 3D', 'noise3d'),
                handleExample('Dance', 'dance'),
                handleExample('Simple Bounce', 'bounce'),
                handleExample('Simple Move', 'simple_move'),
                handleExample('Simple Pong', 'simple_pong')
            ]
        }
    );
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
    setFilter: setFilter,
    playgroundReady: playgroundReady
};
})();
