// Still in this file
//
// * var textScriptNeedsUpdate
// * runUpdateForScriptView()
// * updateScriptsView()
// * changeSocket(event)
// * is_touch_device()
// * var defaultLangData
// * var localizationData
// * var l10nHalfDone
// menu(blockspec)
// populateMenu()
// edit_menu(title, sectionKey, specs, help, show)
// initLanguageFiles()
// handleShowButton(button, newView)
// showFiles(evt)
// showBlocks(evt)
// showScript(evt)
// showResult(evt)


(function(wb){
'use strict';
// UI Chrome Section

var textScriptNeedsUpdate = false;

function runUpdateForScriptsView(){
	if (!textScriptNeedsUpdate){
		return;
	}
    var blocks = wb.findAll(document.body, '.scripts_workspace');
    var view = wb.find(document.body, '.scripts_text_view');
    wb.writeScript(blocks, view);
    textScriptNeedsUpdate = false;
}

function updateScriptsView(){
	// debounce
	if (textScriptNeedsUpdate) return;
	textScriptNeedsUpdate = true;
	// async
	requestAnimationFrame(runUpdateForScriptsView);
}
wb.updateScriptsView = updateScriptsView;


function changeSocket(event) {
	// console.log("Changed a socket!");
	var oldValue = event.target.dataset.value;
	var newValue = event.target.value;
	if(oldValue === undefined) oldValue = event.target.defaultValue;
	// console.log("New value:", newValue);
	// console.log("Old value:", oldValue);
	event.target.dataset.value = newValue;
	var action = {
		undo: function() {
			event.target.value = oldValue;
			event.target.dataset.value = oldValue;
		},
		redo: function() {
			event.target.value = newValue;
			event.target.dataset.value = newValue;
		}
	};
	wb.history.add(action);
}




// Test drawn from modernizr
function is_touch_device() {
  return !!('ontouchstart' in window);
}


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
        submenu.appendChild(wb.block.create(spec));
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


// functions to show various mobile views

function handleShowButton(button, newView){
	// stop result
	// wb.clearStage();
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
	handleShowButton(evt.target, document.querySelector('.result'));
	Event.once(document.body, 'transitionend', null, wb.runCurrentScripts);
}


Event.on(document.body, 'change', 'input', changeSocket);
Event.on('#block_menu', 'click', '.accordion-header', wb.accordion);
// Event.on('.tabbar', 'click', '.chrome_tab', tabSelect);


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
