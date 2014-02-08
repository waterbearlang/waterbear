(function(wb){

	wb.language = location.pathname.match(/\/([^/.]*)\.html/)[1];

	wb.clearScripts = function clearScripts(event, force){
		if (force || confirm('Throw out the current script?')){
			var workspace = document.querySelector('.scripts_workspace')
			workspace.parentElement.removeChild(workspace);
			wb.scriptModified = false;
			wb.loaded = false;
			createWorkspace('Workspace');
			document.querySelector('.scripts_text_view').innerHTML = '';
			wb.history.clear();
			wb.resetSeqNum();
			delete localStorage['__' + wb.language + '_current_scripts'];
		}
	}
	
	Event.on('.clear_scripts', 'click', null, wb.clearScripts);
	Event.on('.edit-script', 'click', null, function(event){
		wb.historySwitchState('editor');
	});

	Event.on(document.body, 'click', '.load-example', function(evt){
		console.log('load example ' + evt.target.dataset.example);
		var path = location.href.split('?')[0];
		path += "?example=" + evt.target.dataset.example;
		if (wb.scriptModified){
			if (confirm('Throw out the current script?')){
				wb.scriptModified = false;
				wb.loaded = false;
				history.pushState(null, '', path);
				Event.trigger(document.body, 'wb-state-change');
			}
		}else{
			wb.scriptModified = false;
			wb.loaded = false;
			history.pushState(null, '', path);
			Event.trigger(document.body, 'wb-state-change');
		}
	});

	var handleStateChange = function handleStateChange(evt){
		// hide loading spinner if needed
		console.log('handleStateChange');
		hideLoader();
		wb.queryParams = wb.urlToQueryParams(location.href);
		if (wb.queryParams.view === 'result'){
			document.body.className = 'result';
			wb.view = 'result';
		}else{
			document.body.className = 'editor';
			wb.view = 'editor';
		}
		// handle loading example, gist, currentScript, etc. if needed
	    wb.loadCurrentScripts(wb.queryParams);
	    // If we go to the result and can run the result inline, do it
	    if (wb.view === 'result' && wb.runCurrentScripts){
	    	// This bothers me greatly: runs with the console.log, but not without it
	    	console.log('running current scripts');
	    	runFullSize();
	    }else{
	    	if (wb.view === 'result'){
		    	// console.log('we want to run current scripts, but cannot');
		    }else{
		    	runWithLayout();
		    	// console.log('we do not care about current scripts, so there');
		    }
	    }
	    if (wb.toggleState.scripts_text_view){
	    	wb.updateScriptsView();
	    }
	    if (wb.toggleState.stage){
	    	// console.log('run current scripts');
	    	wb.runCurrentScripts();
	    }else{
	    	wb.clearStage();
	    }
	}
	Event.on(document.body, 'wb-state-change', null, handleStateChange);

	var hideLoader = function hideLoader(){
	    var loader = document.querySelector('#block_menu_load');
	    if (loader){
	        loader.parentElement.removeChild(loader);
	    }		
	}


	// Load and Save Section

	wb.historySwitchState = function historySwitchState(state, clearFiles){
		//console.log('historySwitchState(%o, %s)', state, !!clearFiles);
		var params = wb.urlToQueryParams(location.href);
		if (state !== 'result'){
			delete params['view'];
		}else{
			params.view = state;
		}
		if (clearFiles){
			delete params['gist'];
			delete params['example'];
		}
		history.pushState(null, '', wb.queryParamsToUrl(params));
		Event.trigger(document.body, 'wb-state-change');
	}


	window.addEventListener('unload', wb.saveCurrentScripts, false);
	window.addEventListener('load', wb.loadRecentGists, false);

	Event.on('.save_scripts', 'click', null, wb.saveCurrentScriptsToGist);
	Event.on('.download_scripts', 'click', null, wb.createDownloadUrl);
	Event.on('.load_from_gist', 'click', null, wb.loadScriptsFromGistId);
	Event.on('.restore_scripts', 'click', null, wb.loadScriptsFromFilesystem);

	wb.loaded = false;


	// Allow saved scripts to be dropped in
	function createWorkspace(name){
	    console.log('createWorkspace');
		var id = uuid();
		var workspace = wb.Block({
			group: 'scripts_workspace',
			id: id,
			scriptId: id,
			scopeId: id,
			blocktype: 'context',
			sockets: [
			{
				name: name
			}
			],
			script: '[[1]]',
			isTemplateBlock: false,
			help: 'Drag your script blocks here'
		});
		wb.wireUpWorkspace(workspace);
	}
	wb.createWorkspace = createWorkspace;

	wb.wireUpWorkspace = function wireUpWorkspace(workspace){
		workspace.addEventListener('drop', wb.getFiles, false);
		workspace.addEventListener('dragover', function(evt){evt.preventDefault();}, false);
		wb.findAll(document, '.scripts_workspace').forEach(function(ws){
	        ws.parentElement.removeChild(ws); // remove any pre-existing workspaces
	    });
		document.querySelector('.workspace').appendChild(workspace);
		workspace.querySelector('.contained').appendChild(wb.elem('div', {'class': 'dropCursor'}));
		// wb.initializeDragHandlers();
		Event.trigger(document.body, 'wb-workspace-initialized');
	};

	Event.once(document.body, 'wb-workspace-initialized', null, wb.initializeDragHandlers);

	function handleDragover(evt){
	    // Stop Firefox from grabbing the file prematurely
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy';
	}

	Event.on('.workspace', 'click', '.disclosure', function(evt){
		var block = wb.closest(evt.wbTarget, '.block');
		if (block.dataset.closed){
			delete block.dataset.closed;
		}else{
			block.dataset.closed = true;
		}
	});

	Event.on('.workspace', 'dblclick', '.locals .name', wb.changeName);
	Event.on('.workspace', 'keypress', 'input', wb.resize);
	Event.on('.workspace', 'change', 'input, select', function(evt){
		Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'valueChanged'});

	});
	// Event.on(document.body, 'wb-loaded', null, function(evt){
	// 	console.log('menu loaded');
	// });
	Event.on(document.body, 'wb-script-loaded', null, function(evt){
		wb.scriptModified = false;
		wb.scriptLoaded = true;
		if (wb.view === 'result'){
			// console.log('run script because we are awesome');
			if (wb.windowLoaded){
				// console.log('run scripts directly');
				wb.runCurrentScripts();
			}else{
				// console.log('run scripts when the iframe is ready');
				window.addEventListener('load', function(){
				// 	// console.log('in window load, starting script: %s', !!wb.runCurrentScripts);
				 	wb.runCurrentScripts();
				 }, false);
			}
		// }else{
		// 	console.log('do not run script for some odd reason: %s', wb.view);
		}
		// clear undo/redo stack
		console.log('script loaded');
	});

	Event.on(document.body, 'wb-modified', null, function(evt){
		// still need modified events for changing input values
		if (!wb.scriptLoaded) return;
		if (!wb.scriptModified){
			wb.scriptModified = true;
			wb.historySwitchState(wb.view, true);
		}
	});

	function runFullSize(){
		['#block_menu', '.workspace', '.scripts_text_view'].forEach(function(sel){
			wb.hide(wb.find(document.body, sel));
		});
		wb.show(wb.find(document.body, '.stage'));
	}

	function runWithLayout(){
		['#block_menu', '.workspace'].forEach(function(sel){
			wb.show(wb.find(document.body, sel));
		});
		['stage', 'scripts_text_view', 'tutorial', 'scratchpad', 'scripts_workspace'].forEach(function(name){
			toggleComponent({detail: {name: name, state: wb.toggleState[name]}});
		});
	}

	function toggleComponent(evt){
		var component = wb.find(document.body, '.' + evt.detail.name);
		if (!component) return;
		evt.detail.state ? wb.show(component) : wb.hide(component);
		var results = wb.find(document.body, '.results');
		// Special cases
		switch(evt.detail.name){
			case 'stage':
				if (evt.detail.state){
					wb.show(results);
				}else{
					wb.clearStage();
					if (!wb.toggleState.scripts_text_view){
						wb.hide(results);
					}
				}
				break;
			case 'scripts_text_view':
				if (evt.detail.state){
					wb.show(results);
					wb.updateScriptsView();
				}else{
					if (!wb.toggleState.stage){
						wb.hide(results);
					}
				}
				break;
			case 'tutorial':
			case 'scratchpad':
			case 'scripts_workspace':
				if (! (wb.toggleState.tutorial || wb.toggleState.scratchpad || wb.toggleState.scripts_workspace)){
					wb.hide(wb.find(document.body, '.workspace'));
				}else{
					wb.show(wb.find(document.body, '.workspace'));
				}
			default:
				// do nothing
				break;
		}
		if (wb.toggleState.stage){
			// restart script on any toggle
			// so it runs at the new size
			wb.runCurrentScripts();
		}

	}

	Event.on(document.body, 'wb-toggle', null, toggleComponent);

	window.addEventListener('popstate', function(evt){
		console.log('popstate event');
		Event.trigger(document.body, 'wb-state-change');
	}, false);

	window.addEventListener('load', function(evt){
		console.log('load event');
		Event.trigger(document.body, 'wb-state-change');
	})

	// Kick off some initialization work
	Event.once(document.body, 'wb-workspace-initialized', null, function initHistory(){
		console.log('workspace ready');
		wb.windowLoaded = true;
		wb.workspaceInitialized = true;
		Event.trigger(document.body, 'wb-state-change');
	});
})(wb);
