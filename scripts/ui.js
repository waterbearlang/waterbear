// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
// UI Chrome Section


function accordion(event){
    event.preventDefault();
    var open = document.querySelector('#block_menu .open');
    if (open){
        open.classList.remove('open');
    }
    if (open && open === event.wbTarget.nextSibling) return;
    event.wbTarget.nextSibling.classList.add('open');
}


function updateScriptsView(){
    var blocks = wb.findAll(document.body, '.scripts_workspace');
    var view = wb.find(document.body, '.scripts_text_view');
    wb.writeScript(blocks, view);
}
wb.updateScriptsView = updateScriptsView; 


function changeSocket(event) {
	// console.log("Changed a socket!");
	var oldValue = event.target.getAttribute('data-oldvalue');
	var newValue = event.target.value;
	if(oldValue === undefined) oldValue = event.target.defaultValue;
	// console.log("New value:", newValue);
	// console.log("Old value:", oldValue);
	event.target.setAttribute('data-oldvalue', newValue);
	var action = {
		undo: function() {
			event.target.value = oldValue;
			event.target.setAttribute('data-oldvalue', oldValue);
		},
		redo: function() {
			event.target.value = newValue;
			event.target.setAttribute('data-oldvalue', newValue);
		}
	};
	wb.history.add(action);
}


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
		pasted: wb.cloneBlock(pasteboard),
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
	if(!wb.matches(evt.wbTarget, '#context_menu *')) {
		contextDiv.style.display = 'none';
	}
}

function handleContextMenu(evt) {
	var block = wb.closest(evt.wbTarget, '.block');
	var cm_cont = document.getElementById('cm_container');
	// console.log('handling context menu');
	stackTrace();
	//if(!showContext) return;
	// console.log(evt.clientX, evt.clientY);
	// console.log(evt.wbTarget);
	if(cmenuDisabled || wb.matches(evt.wbTarget, '#block_menu_wrapper *')) return;
	else if(false);
	else if(wb.overlap(evt.wbTarget, cm_cont)){
		setContextMenuTarget(evt.wbTarget);
		if(cmenuTarget == null)return;
		if( wb.matches(cmenuTarget, '.cloned') || wb.matches(cmenuTarget, '.holder')){
			buildContextMenu(cm_cmenu);
		}else return;
	}
	else if(wb.matches(evt.wbTarget, '.block:not(.scripts_workspace) *')) {
		setContextMenuTarget(evt.wbTarget);
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

// context menu for code map
var cm_cmenu = {
	thrity: {name: '30%', callback: thirtyPercent},
	fifty: {name: '50%', callback: fiftyPercent},
	seventy: {name: '70%', callback: seventyPercent},
    hundred: {name: '100%', callback: hundredPercent},
};

//call back function for code map
function thirtyPercent(evt) {
	var element = document.querySelector('.code_map');
	var transfromString = ("scale(0.3, 0.3)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}

//call back function for code map
function fiftyPercent(evt) {
	var element = document.querySelector('.code_map');
	var transfromString = ("scale(0.5, 0.5)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}
//call back function for code map
function seventyPercent(evt) {
	var element = document.querySelector('.code_map');
	var transfromString = ("scale(0.7, 0.7)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}
//call back function for code map
function hundredPercent(evt) {
	var element = document.querySelector('.code_map');
	var transfromString = ("scale(1, 1)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}

// Test drawn from modernizr
function is_touch_device() {
  return !!('ontouchstart' in window);
}

initContextMenus();

var defaultLangData  = {};
var localizationData = {};

var l10nHalfDone = false;
wb.l10nHalfDone = l10nHalfDone;

/* will be set true by either code in l10n.js or initLanguageFiles() */
initLanguageFiles();

// Build the Blocks menu, this is a public method
function menu(blockspec){
    var id_blocks = {};
    var blocks = blockspec.blocks;

    // put blocks in data structure with block.id as key 
    for (var key in blocks) {
        var block = blocks[key];
        id_blocks[block.id] = block;
    }

    // store blocks temporarily in defaultLangData
    blockspec.blocks = id_blocks;
    defaultLangData[blockspec.sectionkey] = blockspec;

}

function populateMenu() {
	for (var key in defaultLangData) {

        //default data
        var blockspec = defaultLangData[key];

        //read in from localized file
        var l10nData = localizationData[blockspec.sectionkey];
 
        //overwrite attributes in blockspec
        wb.overwriteAttributes(blockspec, l10nData);

		var title = blockspec.name;
        var sectionKey = blockspec.sectionkey.replace(/\W/g, '');
        var specs = blockspec.blocks;
        var help = blockspec.help !== undefined ? blockspec.help : '';
        edit_menu(title, sectionKey, specs, help);
	}
}

function edit_menu(title, sectionKey, specs, help, show){
    var group = title.toLowerCase().split(/\s+/).join('');
    var submenu = document.querySelector('.' + sectionKey + '+ .submenu');
    if (!submenu){
        var header = wb.elem('h3', {'class': sectionKey + ' accordion-header', 'id': 'group_'+sectionKey}, title);
        submenu = wb.elem('div', {'class': 'submenu block-menu accordion-body'});
        var description = wb.elem('p', {'class': 'accordion-description'}, help);
        var blockmenu = document.querySelector('#block_menu');
        blockmenu.appendChild(header);
        blockmenu.appendChild(submenu);
        submenu.appendChild(description);
    }
    for (var key in specs) {
        var spec = specs[key];
        spec.group = sectionKey;
        spec.isTemplateBlock = true;
        submenu.appendChild(wb.Block(spec));
    }
}

function initLanguageFiles(){
    // pulled from workspace.js, one file below in the dist/javascript.js
    var language = location.pathname.split('/')[2];

    //gets language locale code. en, es, de, etc.
    var locale = (navigator.userLanguage || navigator.language || "en-US").substring(0,2);

    // get list of paths of localized language files for language
    var listFiles;

    if ( (typeof(l10nFiles) != "undefined") && (typeof(l10nFiles[language]) != "undefined") )
        listFiles = l10nFiles[language][locale];

    // if no localized files exist 
    if (!listFiles) {
        if (l10nHalfDone) {
            populateMenu();
        } else {
            l10nHalfDone = true;
        }

        return;
    }

    // open all relevent localized files for language 
    listFiles.forEach(function(name, idx){
        ajax.get('languages/' + language + '/' + 'localizations' + '/' + locale + '/' + name +'.json', function(json){
            var lang = JSON.parse(json);

            var id_blocks = {};
            var blocks = lang.blocks;

            // put blocks into proper structure. resembles blockRegistry 
            for (var key in blocks) {
                var block = blocks[key];
                id_blocks[block.id] = block;
            }

            lang.blocks = id_blocks;
            localizationData[lang.sectionkey] = lang;

            // if this is the last file that needs to be retrieved (this step is done)
            if ( idx === (listFiles.length - 1 )) {
                if (wb.l10nHalfDone) {
                    populateMenu();
                } else {
                    wb.l10nHalfDone = true;
                }
            }

        }, function(xhr, status){
            console.error('Error in ajax.get:', status);
        });

    });
}

function initContextMenus() {
	Event.on(document.body, 'contextmenu', null, handleContextMenu);
	Event.on(document.body, 'mouseup', null, closeContextMenu);
	Event.on('.cmenuEnable', 'click', null, enableContextMenu);
	document.querySelector('.cmenuEnable').style.display = 'none';
}

// functions to show various mobile views

function handleShowButton(button, newView){
	// stop result
	wb.clearStage();
	// enable previous button, disable current button
	var currentButton = document.querySelector('.current-button');
	if (currentButton){
		currentButton.classList.remove('current-button');
	}
	button.classList.add('current-button');
	//slide old view out, slide new view in
	var oldView = document.querySelector('.current-view');
	oldView.classList.remove('current-view');
	oldView.style.transitionDuration = '0.5s';
	oldView.style.left = '-100%';
	newView.classList.add('current-view');
	newView.style.transitionDuration = '0.5s';
	newView.style.left = '0';
	Event.once(document.body, 'transitionend', null, function(){
		// console.log('transitionend: %o', oldView);
		oldView.style.transitionDuration = '0s';
		oldView.style.left = '100%';
	});
}

function showFiles(evt){
	handleShowButton(evt.target, document.querySelector('.files'));
}

function showBlocks(evt){
	handleShowButton(evt.target, document.querySelector('.block_menu_wrapper'));
}

function showScript(evt){
	handleShowButton(evt.target, document.querySelector('.workspace'));
}

function showResult(evt){
	handleShowButton(evt.target, document.querySelector('.results'));
	Event.once(document.body, 'transitionend', null, wb.runCurrentScripts);
}

/* Search filter */

function highlightSearch(event) {
	var form = document.querySelector('#search > form');
	form.style.border = "1px solid #FFA500";
}

function unhighlightSearch(event) {
	var form = document.querySelector('#search > form');
	form.style.border = "1px solid #CCC";
}

Event.on(document.body, 'change', 'input', changeSocket);
Event.on('#block_menu', 'click', '.accordion-header', accordion);
// Event.on('.tabbar', 'click', '.chrome_tab', tabSelect);

Event.on('#search_text', 'focus', null, highlightSearch);
Event.on('#search_text', 'blur', null, unhighlightSearch);

if (document.body.clientWidth < 361){
	// console.log('mobile view');
	Event.on('.show-files', 'click', null, showFiles);
	Event.on('.show-blocks', 'click', null, showBlocks);
	Event.on('.show-script', 'click', null, showScript);
	Event.on('.show-result', 'click', null, showResult);
	document.querySelector('.show-script').classList.add('current-button');
	document.querySelector('.workspace').classList.add('current-view');
}
if (document.body.clientWidth > 360){
	// console.log('desktop view');
	Event.on(document.body, 'change', 'input', updateScriptsView);
	Event.on(document.body, 'wb-modified', null, updateScriptsView);
}

wb.menu = menu;
wb.populateMenu = populateMenu;
wb.l10nHalfDone = l10nHalfDone;

})(wb);
