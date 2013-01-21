(function($){
	


function clearScripts(event, force){
    if (force || confirm('Throw out the current script?')){
        $('.workspace:visible > .scripts_workspace').empty();
		$('.workspace:visible > .scripts_text_view').empty();
    }
}
$('.clearScripts').click(clearScripts);
$('.editScript').click(function(){
	document.body.className = 'editor';
	wb.buildDelayedMenus();
	wb.loadCurrentScripts(wb.queryParams);
});
	
$('.goto_stage').click(function(){
	document.body.className = 'result';
});

// Load and Save Section


function saveCurrentScripts(){
    showWorkspace();
    $('#block_menu')[0].scrollIntoView();
    localStorage.__current_scripts = Block.serialize();
}
$(window).unload(saveCurrentScripts);

function scriptsToString(title, description){
    if (!title){ title = ''; }
    if (!description){ description = ''; }
    return JSON.stringify({
        title: title,
        description: description,
        date: Date.now(),
        scripts: Block.scriptsToObject('.scripts_workspace')
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

$('.save_scripts').on('click', createDownloadUrl);
$('.restore_scripts').on('click', comingSoon);

function loadScriptsFromObject(fileObject){
    var workspace = $('.workspace .scripts_workspace');
    // console.info('file format version: %s', fileObject.waterbearVersion);
    // console.info('restoring to workspace %s', fileObject.workspace);
    // FIXME: Make sure we have the appropriate plugins loaded
	if (!fileObject) return;
    fileObject.blocks.forEach(function(spec){
        var block = Block(spec);
		assert.isObject(block, 'Blocks must be objects');
        var view = block.view();
		assert.isString(view.jquery, 'Views must be jQuery objects');
        workspace.append(view);
        addToScriptEvent(workspace, view);
    });
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
	loadScriptsFromObject(JSON.parse(file).scripts);
	$(document.body).trigger('scriptloaded');
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


wb.loadCurrentScripts = function(queryParsed){
	if (queryParsed.gist){
		$.ajax({
			url: 'https://api.github.com/gists/' + queryParsed.gist,
			type: 'GET',
			dataType: 'jsonp',
			success: loadScriptsFromGist
		});
	}else if (localStorage.__current_scripts){
        var fileObject = JSON.parse(localStorage.__current_scripts);
        if (fileObject){
            loadScriptsFromObject(fileObject);
        }
    }
};

wb.runCurrentScripts = function(queryParsed){
	if (queryParsed.gist){
		$.ajax({
			url: 'https://api.github.com/gists/' + queryParsed.gist,
			type: 'GET',
			dataType: 'jsonp',
			success: runScriptFromGist
		});
	}else if (localStorage.__current_scripts_js){
		var fileObject = localStorage.__current_scripts_js;
		if (fileObject){
			wb.runScript(fileObject);
		}
	}
}


// Allow saved scripts to be dropped in
var workspace = $('.scripts_workspace')[0];
workspace.addEventListener('drop', getFiles, false);
workspace.addEventListener('dragover', function(evt){evt.preventDefault();}, false);

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
            loadScriptsFromObject(saved.scripts);
        };
    }
}




})(jQuery);
