(function(wb){
	'use strict';

	// Persist IDE state to localStorage

	var defaults = {
		autorun: false,
		scriptModified: true,
		scriptLoaded: false,
        iframeReady: false,
        tutorial: false,
        isRunning: false,
        'tag-deprecated': false
	};

    // these are transient state we store here for convenience, but don't persist
	var volotile = ['scriptModified', 'iframeReady', 'scriptLoaded', 'isRunning'];

	function loadState(){
		console.log('load persistent state');
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

})(wb);