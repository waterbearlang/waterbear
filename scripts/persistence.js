(function(wb){
    'use strict';

    // Persist IDE state to localStorage

    var defaults = {
        autorun: false,
        scriptModified: true,
        isRunning: false,
        fullSize: false,
        ready: false,
        ideReady: false,
        stageReady: false,
        scriptReady: false,
        'tag-deprecated': false
    };

    // these are transient state we store here for convenience, but don't persist
    var volotile = ['scriptModified', 'stageReady', 'ideReady', 'scriptReady', 'isRunning', 'fullSize'];

    function getState(name){
        if (wb.state[name] === undefined){
            // console.log('defaulting state of %s to true');
            wb.state[name] = true; // default to on
        }
        return wb.state[name];
    }

    function setState(name, value){
        // console.log('setting state of %s to %s', name, value);
        wb.state[name] = value;
    }


    function loadState(){
        // console.log('load persistent state');
        wb.state = defaults;
        if (localStorage.ideState){
            var savedState = JSON.parse(localStorage.ideState);
            Object.keys(savedState).forEach(function(key){
                wb.state[key] = savedState[key];
            });
        }
        Event.trigger(document, 'wb-state-loaded', wb.state);
    }

    function saveState(){
        volotile.forEach(function(key){
            delete wb.state[key];
        });
        localStorage.ideState = JSON.stringify(wb.state);
    }

    Event.on(window, 'unload', null, saveState);
    loadState(); // trigger now so other modules have access to shared state

    wb.getState = getState;
    wb.setState = setState;

})(wb);