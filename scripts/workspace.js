(function($){

// UI Chrome Section

function accordion(event){
    // console.log('accordion');
    var self = $(this);
    if (self.hasClass('selected')){
        return;
    }
    $('.select.selected').removeClass('selected').siblings('.option').hide();
    self.addClass('selected').siblings('.option').show();
}
$('.block_menu').delegate('.select', 'click', accordion);

function tab_select(event){
    var self = $(this);
    $('.tab_bar .selected').removeClass('selected');
    self.addClass('selected');
    $('.workspace:visible > div:visible').hide();
    if (self.is('.scripts_workspace_tab')){
        $('.workspace:visible .scripts_workspace').show();
    }else if (self.is('.scripts_text_view_tab')){
        $('.workspace:visible .scripts_text_view').show();
        update_scripts_view();
    }
}
$('.tab_bar').delegate('.chrome_tab', 'click', tab_select);

function update_scripts_view(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    var view = $('.workspace:visible .scripts_text_view');
    blocks.write_script(view);
}

function run_scripts(event){
    $(document).scrollLeft(10000);
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrap_script() + '</script></div>');
}
$('.run_scripts').click(run_scripts);

function test_block(block){
    var name = block.data('klass') + ': ' + block.data('label');
    try{
        eval(block.wrap_script());
        // console.log('passed: %s', name);
        return true;
    }catch(e){
        if (e.name === 'SyntaxError'){
            console.error('failed: %s, %o', name, e);
            return false;
        }else{
            // console.warn('passed with error: %s, %o', name, e);
            return true;
        }
    }
}

function test(){
    var blocks = $('.block_menu .wrapper');
    var total = blocks.length;
    var success = 0;
    var fail = 0;
    console.log('running %d tests', total);
    blocks.each(function(idx, elem){
        setTimeout(function(){
            // console.log('running test %d', idx);
            test_block($(elem)) ? success++ : fail++;
            if( success + fail === total){
                console.log('Ran %d tests, %d successes, %s failures', total, success, fail);
            }
        }, 10);
    });
}
window.test = test;

function clear_scripts(event, force){
    if (force || confirm('Throw out the current script?')){
        $('.workspace:visible > *').empty();
        $('.stage').replaceWith('<div class="stage"></div>');
    }
}
$('.clear_scripts').click(clear_scripts);

$('.goto_script').click(function(){$(document).scrollLeft(0);});
$('.goto_stage').click(function(){$(document).scrollLeft(100000);});

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
    $(document).scrollLeft(0);
    localStorage['__current_scripts'] = JSON.stringify(scripts_as_object());
}
$(window).unload(save_current_scripts);


function save_named_scripts(){
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
        reset_and_close_save_dialog();
    }
}

function reset_and_close_save_dialog(){
    $('#script_name').val('');
    $('#script_description').val('');
    $('#save_dialog').bPopup().close();
}

function reset_and_close_restore_dialog(){
    $('#script_list').empty();
    $('#restore_dialog').bPopup().close();
}

function populate_and_show_restore_dialog(){
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

function populate_demos_dialog(demos){
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
window.populate_demos_dialog = populate_demos_dialog; // expose this as a public method


function restore_named_scripts(event){
    clear_scripts();
    load_scripts_from_object($(this).closest('li').data('scripts'));
    reset_and_close_restore_dialog();
}

function restore_demo_scripts(event){
    clear_scripts();
    load_scripts_from_object($(this).closest('li').data('scripts'));
    $('#demos_dialog').bPopup().close();
}

function delete_named_scripts(event){
    if (confirm('Are you sure you want to delete this script?')){
        var title = $(this).siblings('.title').text();
        $(this).parent().remove();
        console.log('remove %s', title);
        localStorage.removeItem(title);
    }
}

function toggle_description(event){
    $(this).siblings('.description').toggleClass('hidden');
}

$('#save_dialog .save').click(save_named_scripts);
$('#save_dialog .cancel').click(reset_and_close_save_dialog);
$('.save_scripts').click(function(){ $('#save_dialog').bPopup(); });

$('.restore_scripts').click( populate_and_show_restore_dialog );
$('#restore_dialog .cancel').click(reset_and_close_restore_dialog);
$('#restore_dialog').delegate('.restore', 'click', restore_named_scripts)
                    .delegate('.show_description', 'click', toggle_description)
                    .delegate('.delete', 'click', delete_named_scripts);
                    
$('#demos_dialog').delegate('.load', 'click', restore_demo_scripts)
                  .delegate('.show_description', 'click', toggle_description);
$('#demos_dialog .cancel').click(function(){$('#demos_dialog').bPopup().close();});
$('.demo_scripts').click(function(){$('#demos_dialog').bPopup(); });

function load_scripts_from_object(blocks){
    var workspace = $('.workspace:visible .scripts_workspace');
    $.each(blocks, function(idx, value){
        var block = Block(value);
        workspace.append(block);
        block.attr('position', 'absolute');
        block.offset(value.offset);
    });
}

function load_current_scripts(){
    if (localStorage.__current_scripts){
        var blocks = JSON.parse(localStorage['__current_scripts']);
        if (blocks.length){
            load_scripts_from_object(blocks);
        }
    }
}
$(document).ready(load_current_scripts);

// Build the Blocks menu, this is a public method

function menu(title, specs, show){
    var klass = title.toLowerCase();
    var body = $('<section class="submenu"></section>');
    var select = $('<h3 class="select">' + title + '</h3>').appendTo(body);
    var options = $('<div class="option"></div>').appendTo(body);
    specs.forEach(function(spec, idx){
        spec.klass = klass;
        options.append(Block(spec));
    });
    $('.block_menu').append(body);
    if (show){
        select.addClass('selected');
    }else{
        options.hide();
    }
    return body;
}
window.menu = menu;

})(jQuery);