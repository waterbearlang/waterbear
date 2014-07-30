(function(wb){

/* TODO list of undoable actions:
 -  Moving a step from position A to position B
 -  Adding a new block at position X
 -  Moving an expression from slot A to slot B
 -  Adding a new expression to slot X
 -  Editing the value in slot X (eg, using the colour picker, typing in a string, etc)
 -  Renaming a local expression/variable
 -  Deleting a step from position X
 -  Deleting an expression from slot X
 Break them down:
1. Replacing the block in the clipboard with a new block
2. Editing the literal value in slot X
3. Inserting a step at position X
4. Removing a step at position X
5. Inserting an expression into slot X
6. Removing an expression from slot X
 More detail:
 - Copy is 1
 - Cut is 1 and 4 or 1 and 6
 - Paste is 3 or 5
 - Drag-in is 3 or 5
 - Drag-around is 4 and 3 or 6 and 5
 - Drag-out is 4 or 6
 - Drag-copy is 3 or 5
*/

// Context Menu
//
// 'this' is the object matching the selector
// key is the key in the items object
// opt is the context menu object itself

function cloneCommand(key, opt){
    console.info('cloneCommand(%s, %o)', key, opt);
}

function editCommand(key, opt){
    console.info('editCommand(%s, %o)', key, opt);
}

function expandCommand(key, opt){
    console.info('expandCommand(%s, %o)', key, opt);
}

function collapseCommand(key, opt){
    console.info('collapseCommand(%s, %o)', key, opt);
}

function copyCommand(evt) {
	// console.log("Copying a block in ui.js!");
	// console.log(this);
	var action = {
		copied: this,
		oldPasteboard: pasteboard,
		undo: function() {
			pasteboard = this.oldPasteboard;
		},
		redo: function() {
			pasteboard = this.copied;
		},
	};
	wb.history.add(action);
	action.redo();
}

function deleteCommand(evt) {
	// console.log("Deleting a block!");
	var action = {
		removed: this,
		// Storing parent and next sibling in case removing the node from the DOM clears them
		parent: this.parentNode,
		before: this.nextSibling,
		undo: function() {
			// console.log(this);
			if(wb.matches(this.removed,'.step')) {
				this.parent.insertBefore(this.removed, this.before);
			} else {
				this.parent.appendChild(this.removed);
			}
			Event.trigger(this.removed, 'wb-add');
		},
		redo: function() {
			Event.trigger(this.removed, 'wb-remove');
			this.removed.remove();
		},
	};
	wb.history.add(action);
	action.redo();
}

function cutCommand(evt) {
	// console.log("Cutting a block!");
	var action = {
		removed: this,
		// Storing parent and next sibling in case removing the node from the DOM clears them
		parent: this.parentNode,
		before: this.nextSibling,
		oldPasteboard: pasteboard,
		undo: function() {
			// console.log(this);
			if(wb.matches(this.removed,'.step')) {
				this.parent.insertBefore(this.removed, this.before);
			} else {
				this.parent.appendChild(this.removed);
			}
			Event.trigger(this.removed, 'wb-add');
			pasteboard = this.oldPasteboard;
		},
		redo: function() {
			Event.trigger(this.removed, 'wb-remove');
			this.removed.remove();
			pasteboard = this.removed;
		},
	};
	wb.history.add(action);
	action.redo();
}

function pasteCommand(evt) {
	// console.log(pasteboard);
	var action = {
		pasted: wb.block.clone(pasteboard),
		into: cmenuTarget.parentNode,
		before: cmenuTarget.nextSibling,
		undo: function() {
			Event.trigger(this.pasted, 'wb-remove');
			this.pasted.remove();
		},
		redo: function() {
			if(wb.matches(pasteboard,'.step')) {
				// console.log("Pasting a step!");
				this.into.insertBefore(this.pasted,this.before);
			} else {
				// console.log("Pasting an expression!");
				cmenuTarget.appendChild(this.pasted);
			}
			Event.trigger(this.pasted, 'wb-add');
		},
	};
	wb.history.add(action);
	action.redo();
}

function canPaste() {
	if(!pasteboard) return false;
	if(wb.matches(pasteboard,'.step') && !wb.matches(cmenuTarget,'.holder')) {
		return true;
	}
	if(wb.matches(pasteboard,'.expression') && wb.matches(cmenuTarget,'.holder')) {
		return true;
	}
	return false;
}

var pasteboard = null;
var cmenuCurrent = null;
var showContext = false;
var cmenuDisabled = false;
var cmenuTarget = null;

function cmenuitem_enabled(menuitem) {
	if(menuitem.enabled) {
		if(typeof(menuitem.enabled) == 'function') {
			return menuitem.enabled();
		} else return menuitem.enabled;
	}
	return true;
}


function buildContextMenu(options) {
	// console.log('building context menu');
	// console.log(options);
	var contextDiv = document.getElementById('context_menu');
	contextDiv.innerHTML = '';
	var menu = document.createElement('ul');
	var item;
	menu.classList.add('cmenu');
	for(var key in options) {
		if(options.hasOwnProperty(key) && options[key]) {
			item = document.createElement('li');
			if(cmenuitem_enabled(options[key])) {
				Event.on(item, "click", null, cmenuCallback(options[key].callback));
			} else {
				item.classList.add('disabled');
			}
			if(options[key].startGroup) {
				item.classList.add('topSep');
			}
			item.innerHTML = options[key].name;
			menu.appendChild(item);
		}
	}
	item = document.createElement('li');
	item.onclick = function(evt) {};
	item.innerHTML = 'Disable this menu';
	item.classList.add('topSep');
	Event.on(item, 'click', null, disableContextMenu);
	menu.appendChild(item);
	contextDiv.appendChild(menu);
}

function stackTrace() {
	var e = new Error('stack trace');
	var stack = e.stack.replace(/@.*\//gm, '@')
		.split('\n');
	// console.log(stack);
}

function closeContextMenu(evt) {
	var contextDiv = document.getElementById('context_menu');
	if(!wb.matches(evt.target, '#context_menu *')) {
		contextDiv.style.display = 'none';
	}
}

function handleContextMenu(evt) {
	var block = wb.closest(evt.target, '.block');
	if (!block){ return; }
	var cm_cont = document.getElementById('cm_container');
	// console.log('handling context menu');
	stackTrace();
	//if(!showContext) return;
	// console.log(evt.clientX, evt.clientY);
	// console.log(evt.target);
	if(cmenuDisabled || wb.matches(evt.target, '#block_menu_wrapper *')) return;
	else if(false);
	else if(wb.overlap(evt.target, cm_cont)){
		setContextMenuTarget(evt.target);
		if(cmenuTarget == null){ return };
		if( wb.matches(cmenuTarget, '.cloned') || wb.matches(cmenuTarget, '.holder')){
			buildContextMenu(cm_cmenu);
		}else return;
	}
	else if(wb.matches(evt.target, '.block:not(.scripts_workspace) *')) {
		setContextMenuTarget(evt.target);
		buildContextMenu(block_cmenu);
		}
	else return;
	showContextMenu(evt.clientX, evt.clientY);
	evt.preventDefault();
}

function setContextMenuTarget(target) {
	cmenuTarget = target;
	while(!wb.matches(cmenuTarget, '.block') && !wb.matches(cmenuTarget, '.holder')) {
		// console.log(cmenuTarget);
		cmenuTarget = cmenuTarget.parentNode;
		if(cmenuTarget.tagName == 'BODY') {
			console.error("Something went wrong with determining the context menu target!");
			cmenuTarget = null;
			contextDiv.style.display = 'none';
		}
	}
}

function showContextMenu(atX, atY) {
	// console.log('showing context menu');
	var contextDiv = document.getElementById('context_menu');
	contextDiv.style.display = 'block';
	contextDiv.style.left = atX + 'px';
	contextDiv.style.top = atY + 'px';
}

function cmenuCallback(fcn) {
	return function(evt) {
		// console.log(cmenuTarget);
		fcn.call(cmenuTarget,evt);
		var contextDiv = document.getElementById('context_menu');
		contextDiv.style.display = 'none';
		evt.preventDefault();
	};
}

function disableContextMenu(evt) {
	cmenuDisabled = true;
	var enableBtn = document.querySelector('.cmenuEnable');
	enableBtn.style.display = '';
	var contextDiv = document.getElementById('context_menu');
	contextDiv.style.display = 'none';
}

function enableContextMenu(evt) {
	cmenuDisabled = false;
	var enableBtn = document.querySelector('.cmenuEnable');
	enableBtn.style.display = 'none';
}

var block_cmenu = {
	//expand: {name: 'Expand All', callback: dummyCallback},
	//collapse: {name: 'Collapse All', callback: dummyCallback},
	cut: {name: 'Cut', callback: cutCommand},
	copy: {name: 'Copy', callback: copyCommand},
	//copySubscript: {name: 'Copy Subscript', callback: dummyCallback},
	paste: {name: 'Paste', callback: pasteCommand, enabled: canPaste},
	//cancel: {name: 'Cancel', callback: dummyCallback},
        delete: {name: 'Delete', callback: deleteCommand},
};

wb.cm_percent = 0.3;

// context menu for code map
var cm_cmenu = {
	thirty: {name: '30%', callback: wb.thirtyPercent},
	fifty: {name: '50%', callback: wb.fiftyPercent},
	seventy: {name: '70%', callback: wb.seventyPercent},
    hundred: {name: '100%', callback: wb.hundredPercent},
};

function initContextMenus() {
	Event.on(document.body, 'contextmenu', null, handleContextMenu);
	Event.on(document.body, 'mouseup', null, closeContextMenu);
	Event.on('.cmenuEnable', 'click', null, enableContextMenu);
	document.querySelector('.cmenuEnable').style.display = 'none';
}


initContextMenus();


})(wb);