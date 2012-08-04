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

function scripts_as_object(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    if (blocks.length){
        return blocks.map(function(){return $(this).block_description();}).get();
    }else{
        return [];
    }   
}

function save_current_scripts(){
    showWorkspace();
    $('#block_menu')[0].scrollIntoView();
    localStorage['__current_scripts'] = JSON.stringify(scripts_as_object());
}
$(window).unload(save_current_scripts);


function saveNamedScripts(){
    var title = $('#script_name').val();
    var description = $('#script_description').val();
    var date = Date.now();
    if (title){
        if (localStorage[title]){
            if (!confirm('A script with that title exist. Overwrite?')){
                return;
            }
        }
        localStorage[title] = JSON.stringify({
            title: title,
            description: description,
            date: date,
            scripts: scripts_as_object()
        });
        resetAndCloseSaveDialog();
    }else   
        alert("You must enter a name");
}

function exportNamedScripts(){
    console.log("here");
    $('#exp h2').html('Exported Code');
    $('#exp small').html('Copy Exported Code below');   
    var title = $('#script_name').val();    
    var description = $('#script_description').val();
    var date = Date.now();
    if (title){
    var exp = JSON.stringify({
        title: title,
        description: description,
        date: date,
        scripts: scripts_as_object()
    });
    console.log("EXP: "+exp);
    resetAndCloseSaveDialog();
    $('#exp').bPopup();
    $('#exp textarea').html(exp);
    $('#exp .done').bind('click',function(){
        $('#exp').bPopup().close();
        $('#exp .done').unbind('click');
    });
    }
    else
    alert("You must enter a name");
}
    
function restore_from_export(){
    resetAndCloseRestoreDialog();
    $('#exp h2').html('Paste Exported Code below');
    $('#exp small').html('Paste Exported Code below');
    $('#exp').bPopup();

    $('#exp .done').click(function(){
    $('#exp .done').unbind('click');
    var script = $('#exp textarea').val();
    console.log(script);
    $('#exp').bPopup().close();
    clearScripts();

    var ps = JSON.parse(script);
    console.log(ps.scripts);

    loadScriptsFromObject(ps.scripts);   
    }); 
}


function resetAndCloseSaveDialog(){
    $('#script_name').val('');
    $('#script_description').val('');
    $('#save_dialog').bPopup().close();
}

function resetAndCloseRestoreDialog(){
    $('#script_list').empty();
    $('#restore_dialog').bPopup().close();
}

function populateAndShowRestoreDialog(){
    var list = $('#script_list');
    var script_obj;
    var idx, value, key, script_li;
    for (idx = 0; idx < localStorage.length; idx++){
        key = localStorage.key(idx);
        if (key === '__current_scripts') continue;
        value = localStorage[key];
        script_obj = JSON.parse(value);
        if (script_obj.description){
            script_li = $('<li><span class="title">' + script_obj.title + '</span><button class="restore action">Restore</button><button class="delete action">Delete</button><button class="show_description action">Description</button><br /><span class="timestamp">Saved on ' + new Date(script_obj.date).toDateString() + '</span><p class="description hidden">' + script_obj.description + '<p></li>');
        }else{
            script_li = $('<li><span class="title">' + script_obj.title + '</span><button class="restore action">Restore</button><button class="delete action">Delete</button><br /><span class="timestamp">Saved on ' + new Date(script_obj.date).toDateString() + '</span></li>');
        }
        script_li.data('scripts', script_obj.scripts); // avoid re-parsing later
        list.append(script_li);
    }
    $('#restore_dialog').bPopup();
}

function populateDemosDialog(demos){
    var list = $('#demo_list');
    var idx, value, key, script_li;
    $.each(demos, function(){
        if (this.description){
            script_li = $('<li><span class="title">' + this.title + '</span><button class="load action">Load</button><button class="show_description action">Description</button><p class="description hidden">' + this.description + '<p></li>');
        }else{
            script_li = $('<li><span class="title">' + this.title + '</span><button class="load action">Load</button></li>');
        }
        script_li.data('scripts', this.scripts); // avoid re-parsing later
        list.append(script_li);
    });
}
window.populateDemosDialog = populateDemosDialog; // expose this as a public method


function restoreNamedScripts(event){
    clearScripts();
    loadScriptsFromObject($(this).closest('li').data('scripts'));
    resetAndCloseRestoreDialog();
}

function restoreDemoScripts(event){
    clearScripts();
    loadScriptsFromObject($(this).closest('li').data('scripts'));
    $('#demos_dialog').bPopup().close();
}

function deleteNamedScripts(event){
    if (confirm('Are you sure you want to delete this script?')){
        var title = $(this).siblings('.title').text();
        $(this).parent().remove();
        console.log('remove %s', title);
        localStorage.removeItem(title);
    }
}

function toggleDescription(event){
    $(this).siblings('.description').toggleClass('hidden');
}

$('#save_dialog .save').click(saveNamedScripts);
$('#save_dialog .export').click(exportNamedScripts);
$('#save_dialog .cancel').click(resetAndCloseSaveDialog);
$('.save_scripts').click(function(){$('#save_dialog').bPopup();});

$('.restore_scripts').click( populateAndShowRestoreDialog );
$('#restore_dialog .cancel').click(resetAndCloseRestoreDialog);
$('#restore_dialog .exp').click(restore_from_export);
$('#restore_dialog').on('click', '.restore', restoreNamedScripts)
                    .on('click', '.show_description', toggleDescription)
                    .on('click', '.delete', deleteNamedScripts);
                    
$('#demos_dialog').on('click', '.load', restoreDemoScripts)
                  .on('click', '.show_description', toggleDescription);
$('#demos_dialog .cancel').click(function(){$('#demos_dialog').bPopup().close();});
$('.demo_scripts').click(function(){$('#demos_dialog').bPopup();});

function loadScriptsFromObject(blocks){
    var workspace = $('.workspace:visible .scripts_workspace');
    $.each(blocks, function(idx, value){
        console.log('restoring block %s', idx);
        var block = Block(value);
        var view = block.view();
        workspace.append(view);
        view.css({position: 'relative', left: 0, top: 0, display: 'block'});
        view.trigger('add_to_workspace');
        $('.scripts_workspace').trigger('add');

    });
}

window.loadCurrentScripts = function(){
    if (localStorage.__current_scripts){
        var blocks = JSON.parse(localStorage['__current_scripts']);
        if (blocks.length){
            console.log('restoring %s blocks', blocks.length);
            loadScriptsFromObject(blocks);
        }
    }
}
// $(document).ready(loadCurrentScripts);





})(jQuery);
