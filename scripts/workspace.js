(function(wb){

	var language = location.pathname.match(/\/(.*)\.html/)[1];
	wb.language = language;

	function clearScripts(event, force){
		if (event){
		    event.preventDefault();
		}
		if (force || confirm('Throw out the current script?')){
			var workspace = document.querySelector('.workspace > .scripts_workspace')
			workspace.parentElement.removeChild(workspace);
			createWorkspace('Workspace');
			document.querySelector('.workspace > .scripts_text_view').innerHTML = '';
		}
	}
	Event.on('.clear_scripts', 'click', null, clearScripts);
	Event.on('.edit-script', 'click', null, function(event){
	    event.preventDefault();
		wb.historySwitchState('editor');
	});

	var handleStateChange = function handleStateChange(evt){
		// hide loading spinner if needed
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
	    	wb.runCurrentScripts();
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
		// console.log('historySwitchState(%o, %s)', state, !!clearFiles);
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

	function saveCurrentScripts(){
		if (!wb.scriptModified){
			console.log('nothing to save');
			// nothing to save
			return;
		}
		wb.showWorkspace('block');
		document.querySelector('#block_menu').scrollIntoView();
		localStorage['__' + language + '_current_scripts'] = scriptsToString();
	}
	window.onunload = saveCurrentScripts;

	// Save script to gist;
	function saveCurrentScriptsToGist(event){
	    event.preventDefault();
		console.log("Saving to Gist");
		var title = prompt("Save to an anonymous Gist titled: ");

		ajax.post("https://api.github.com/gists", function(data){
	        //var raw_url = JSON.parse(data).files["script.json"].raw_url;
	        var gistID = JSON.parse(data).url.split("/").pop();
	        prompt("This is your Gist ID. Copy to clipboard: Ctrl+C, Enter", gistID);

	        //save gist id to local storage
	        var localGists = localStorage['__' + language + '_recent_gists'];
	        var gistArray = localGists == undefined ? [] : JSON.parse(localGists);
	        gistArray.push(gistID);
	        localStorage['__' + language + '_recent_gists'] = JSON.stringify(gistArray);

	    }, JSON.stringify({
	    	"description": title,
	    	"public": true,
	    	"files": {
	    		"script.json": {
	    			"content": scriptsToString()
	    		},
	    	}
	    }));
	}

	function loadRecentGists() {
		var localGists = localStorage['__' + language + '_recent_gists'];
		var gistArray = localGists == undefined ? [] : JSON.parse(localGists);
		var gistContainer = document.querySelector("#recent_gists");
		gistContainer.innerHTML = '';
		for (var i = 0; i < gistArray.length; i++) {
			var node = document.createElement("li");
			var a = document.createElement('a');
			var linkText = document.createTextNode(gistArray[i]);

			a.appendChild(linkText)
			//a.href = language + ".html?gist=" + gistArray[i];

			node.appendChild(a);
			gistContainer.appendChild(node);
			var gist = gistArray[i];
			console.log(gist);
			a.addEventListener('click', function () {
				loadScriptsFromGistId(parseInt(gist));
				return false;
			});
		};
	}
	window.addEventListener('load', loadRecentGists, false);


	function scriptsToString(title, description){
		if (!title){ title = ''; }
		if (!description){ description = ''; }
		var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
		return JSON.stringify({
			title: title,
			description: description,
			date: Date.now(),
			waterbearVersion: '2.0',
			blocks: blocks.map(wb.blockDesc)
		});
	}


	function createDownloadUrl(evt){
	    evt.preventDefault();
		var URL = window.webkitURL || window.URL;
		var file = new Blob([scriptsToString()], {type: 'application/json'});
		var reader = new FileReader();
		var a = document.createElement('a');
		reader.onloadend = function(){
			a.href = reader.result;
			a.download = 'script.json';
			a.target = '_blank';
			document.body.appendChild(a);
			a.click();
		};
		reader.readAsDataURL(file);
		evt.preventDefault();
	}

	Event.on('.save_scripts', 'click', null, saveCurrentScriptsToGist);
	Event.on('.download_scripts', 'click', null, createDownloadUrl);
	Event.on('.load_from_gist', 'click', null, loadScriptsFromGistId);
	Event.on('.restore_scripts', 'click', null, loadScriptsFromFilesystem);


	function loadScriptsFromGistId(event){
	    event.preventDefault();
		var gistID = prompt("What Gist would you like to load? Please enter the ID of the Gist: ");
		ajax.get("https://api.github.com/gists/"+gistID, function(data){
			loadScriptsFromGist({data:JSON.parse(data)});
		});
	}

	function loadScriptsFromFilesystem(event){
	    event.preventDefault();
		var input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'application/json');
		input.addEventListener('change', function(evt){
			var file = input.files[0];
			loadScriptsFromFile(file);
		});
		input.click();
	}

	function loadScriptsFromObject(fileObject){
	    // console.info('file format version: %s', fileObject.waterbearVersion);
	    // console.info('restoring to workspace %s', fileObject.workspace);
	    if (!fileObject) return createWorkspace();
	    var blocks = fileObject.blocks.map(wb.Block);
	    if (!blocks.length){
	    	return createWorkspace();
	    }
	    if (blocks.length > 1){
	    	console.log('not really expecting multiple blocks here right now');
	    	console.log(blocks);
	    }
	    blocks.forEach(function(block){
	    	wireUpWorkspace(block);
	    	Event.trigger(block, 'wb-add');
	    });
	    wb.loaded = true;
	    Event.trigger(document.body, 'wb-script-loaded');
	}

	function loadScriptsFromGist(gist){
		var keys = Object.keys(gist.data.files);
		var file;
		keys.forEach(function(key){
			if (/.*\.json/.test(key)){
				// it's a json file
				file = gist.data.files[key].content;
			}
		});
		if (!file){
			console.log('no json file found in gist: %o', gist);
			return;
		}
		loadScriptsFromObject(JSON.parse(file));
	}

	function loadScriptsFromExample(name){
		wb.ajax('examples/' + name + '.json', function(exampleJson){
			loadScriptsFromObject(JSON.parse(exampleJson));
		}, function(xhr, status){
			console.error('Error in wb.ajax: %s', status);
		});
	}


	wb.loaded = false;
	wb.loadCurrentScripts = function(queryParsed){
		// console.log('loadCurrentScripts(%o)', queryParsed);
		if (wb.loaded) return;
		if (queryParsed.gist){
			console.log("Loading gist %s", queryParsed.gist);
			ajax.get("https://api.github.com/gists/"+queryParsed.gist, function(data){
				loadScriptsFromGist({data:JSON.parse(data)});
			});
		}else if (queryParsed.example){
			console.log('loading example %s', queryParsed.example);
			loadScriptsFromExample(queryParsed.example);
		}else if (localStorage['__' + language + '_current_scripts']){
			console.log('loading current script from local storage');
			var fileObject = JSON.parse(localStorage['__' + language + '_current_scripts']);
			if (fileObject){
				loadScriptsFromObject(fileObject);
			}
		}else{
			console.log('no script to load, starting a new script');
			createWorkspace('Workspace');
		}
		wb.loaded = true;
		Event.trigger(document.body, 'wb-loaded');
	};


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
		wireUpWorkspace(workspace);
	}
	wb.createWorkspace = createWorkspace;

	function wireUpWorkspace(workspace){
		workspace.addEventListener('drop', getFiles, false);
		workspace.addEventListener('dragover', function(evt){evt.preventDefault();}, false);
		wb.findAll(document, '.scripts_workspace').forEach(function(ws){
	        ws.parentElement.removeChild(ws); // remove any pre-existing workspaces
	    });
		document.querySelector('.workspace').appendChild(workspace);
		workspace.querySelector('.contained').appendChild(wb.elem('div', {'class': 'dropCursor'}));
		wb.initializeDragHandlers();
	}

	function handleDragover(evt){
	    // Stop Firefox from grabbing the file prematurely
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy';
	}

	function loadScriptsFromFile(file){
		fileName = file.name;
		if (fileName.indexOf('.json', fileName.length - 5) === -1) {
			console.error("File not a JSON file");
			return;
		}
		var reader = new FileReader();
		reader.readAsText( file );
		reader.onload = function (evt){
			clearScripts(null, true);
			var saved = JSON.parse(evt.target.result);
			loadScriptsFromObject(saved);
			wb.scriptModified = true;	
		};
	}

	function getFiles(evt){
		evt.stopPropagation();
		evt.preventDefault();
		var files = evt.dataTransfer.files;
		if ( files.length > 0 ){
	        // we only support dropping one file for now
	        var file = files[0];
	        loadScriptsFromFile(file);
	    }
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
	Event.on(document.body, 'wb-loaded', null, function(evt){console.log('menu loaded');});
	Event.on(document.body, 'wb-script-loaded', null, function(evt){
		wb.scriptModified = false;
		if (wb.view === 'result'){
			// console.log('run script because we are awesome');
			window.addEventListener('load', function(){
				// console.log('in window load, starting script: %s', !!wb.runCurrentScripts);
				wb.runCurrentScripts();
			}, false);
		// }else{
		// 	console.log('do not run script for some odd reason: %s', wb.view);
		}
		// clear undo/redo stack
		wb.scriptLoaded = true;
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

	window.addEventListener('popstate', function(evt){
		Event.trigger(document.body, 'wb-state-change');
	}, false);

	// Kick off some initialization work
	Event.trigger(document.body, 'wb-state-change');
})(wb);
