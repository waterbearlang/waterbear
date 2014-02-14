/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb, Event){

	var toggleState = {};
	if (localStorage.toggleState){
		toggleState = JSON.parse(localStorage.toggleState);
	}

	function handleToggle(evt){
		var button = evt.target;
		var name = button.dataset.target;
		var isOn = !getState(name);
		toggleState[name] = isOn;
		if (isOn){
			button.classList.remove('icon-unchecked');
			button.classList.add('icon-check');
		}else{
			button.classList.add('icon-unchecked');
			button.classList.remove('icon-check');
		}
		Event.trigger(document.body, 'wb-toggle', {name: name, state: isOn});
		localStorage.toggleState = JSON.stringify(toggleState);
	}

	Event.on(document.body, 'click', '.toggle', handleToggle);

	function getState(name){
		if (toggleState[name] === undefined){
			toggleState[name] = true;
		}
		return toggleState[name];
	}

	// initialize toggle states

	function initializeToggleStates(evt){
		wb.findAll(document.body, '.toggle').forEach(function(button){
			var name = button.dataset.target;
			var isOn = getState(name);
			if (isOn){
				button.classList.add('icon-check');
			}else{
				button.classList.add('icon-unchecked');
			}
			Event.trigger(document.body, 'wb-toggle', {name: name, state: isOn});
		});
	}

	Event.once(document.body, 'wb-workspace-initialized', null, initializeToggleStates);

	wb.toggleState = toggleState; // treat as read-only

})(wb, Event);