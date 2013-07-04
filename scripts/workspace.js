(function(wb){

var language = location.pathname.match(/\/(.*)\.html/)[1];

function clearScripts(event, force){
    if (force || confirm('Throw out the current script?')){
        document.querySelector('.workspace > .scripts_workspace').remove();
        createWorkspace('Workspace');
		document.querySelector('.workspace > .scripts_text_view').innerHTML = '';
    }
}
Event.on('.clearScripts', 'click', null, clearScripts);
Event.on('.editScript', 'click', null, function(){
	document.body.className = 'editor';
	wb.loadCurrentScripts(wb.queryParams);
});

Event.on('.goto_stage', 'click', null, function(){
	document.body.className = 'result';
});

// Load and Save Section

function saveCurrentScripts(){
    wb.showWorkspace('block');
    document.querySelector('#block_menu').scrollIntoView();
    localStorage['__' + language + '_current_scripts'] = scriptsToString();
}
window.onunload = saveCurrentScripts;

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

function comingSoon(evt){
    alert('Restore will be working again soon. You can drag saved json files to the script workspace now.');
}

Event.on('.save_scripts', 'click', null, createDownloadUrl);
Event.on('.restore_scripts', 'click', null, comingSoon);

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

function runScriptFromGist(gist){
	console.log('running script from gist');
	var keys = Object.keys(gist.data.files);
	var file;
	keys.forEach(function(key){
		if (/.*\.js$/.test(key)){
			// it's a javascript file
			console.log('found javascript file: %s', key);
			file = gist.data.files[key].content;
		}
	});
	if (!file){
		console.log('no javascript file found in gist: %o', gist);
		return;
	}
	wb.runScript(file);
}


wb.loaded = false;
wb.loadCurrentScripts = function(queryParsed){
    if (!wb.loaded){
    	if (queryParsed.gist){
    		wb.jsonp(
    			'https://api.github.com/gists/' + queryParsed.gist,
    			loadScriptsFromGist
    		);
    	}else if (localStorage['__' + language + '_current_scripts']){
            var fileObject = JSON.parse(localStorage['__' + language + '_current_scripts']);
            if (fileObject){
                loadScriptsFromObject(fileObject);
            }
        }else{
            createWorkspace('Workspace');
        }
        wb.loaded = true;
    }
    Event.trigger(document.body, 'wb-loaded');
};

wb.runCurrentScripts = function(queryParsed){
	if (queryParsed.gist){
		wp.json(
			'https://api.github.com/gists/' + queryParsed.gist,
			runScriptFromGist
		);
	}else if (localStorage['__' + language + '_current_scripts']){
		var fileObject = localStorage['__' + language + '_current_scripts'];
		if (fileObject){
			wb.runScript(fileObject);
		}
	}
}


// Allow saved scripts to be dropped in
function createWorkspace(name){
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

function getFiles(evt){
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    if ( files.length > 0 ){
        // we only support dropping one file for now
        var file = files[0];
        if ( file.type.indexOf( 'json' ) === -1 ) { return; }
        var reader = new FileReader();
        reader.readAsText( file );
        reader.onload = function (evt){
            clearScripts(null, true);
            var saved = JSON.parse(evt.target.result);
            loadScriptsFromObject(saved);
        };
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
})(wb);
