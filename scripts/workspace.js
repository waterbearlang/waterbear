(function($){


function clearScripts(event, force){
    if (force || confirm('Throw out the current script?')){
        $('.workspace:visible > *').empty();
        $('.stage').replaceWith('<div class="stage"></div>');
    }
}
$('.clearScripts').click(clearScripts);
$('.goto_script').click(function(){$('#block_menu')[0].scrollIntoView();});
$('.goto_stage').click(function(){$('.stage')[0].scrollIntoView();});

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
    var workspace = $('.workspace:visible .scripts_workspace');
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

window.loadCurrentScripts = function(){
    if (localStorage.__current_scripts){
        var fileObject = JSON.parse(localStorage.__current_scripts);
        if (fileObject){
            loadScriptsFromObject(fileObject);
        }
    }
};


// Allow saved scripts to be dropped in
var workspace = $('.scripts_workspace:visible')[0];
workspace.addEventListener('drop', getFiles, false);
workspace.addEventListener('dragover', function(evt){evt.preventDefault();}, false);

function handleDragover(evt){
    // Stop Mozilla from grabbing the file prematurely
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
