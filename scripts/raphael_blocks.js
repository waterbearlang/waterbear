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
$('.chrome_tab').live('click', tab_select);

function update_scripts_view(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    var view = $('.workspace:visible .scripts_text_view');
    blocks.each(function(){$(this).write_script(view);});
}

function run_scripts(event){
    $(document.body).scrollLeft(10000);
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrap_script() + '</script></div>');
}
$('.run_scripts').click(run_scripts);

function clear_scripts(event){
    if (confirm('Throw out the current script?')){
        $('.workspace:visible > *').empty();
        $('.stage').replaceWith('<div class="stage"></div>');
    }
}
$('.clear_scripts').click(clear_scripts);

$('.goto_script').click(function(){$(document.body).scrollLeft(0);});
$('.goto_stage').click(function(){$(document.body).scrollLeft(100000);});

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
    $(document.body).scrollLeft(0);
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
            script_li = $('<li>' + script_obj.title + '<button class="restore action">Restore</button><button class="delete action">Delete</button><button class="show_description action">Description</button><br /><span class="timestamp">Saved on ' + new Date(script_obj.date).toDateString() + '</span><p class="description hidden">' + script_obj.description + '<p></li>');
        }else{
            script_li = $('<li><span class="title">' + script_obj.title + '</span><button class="restore action">Restore</button><button class="delete action">Delete</button><br /><span class="timestamp">Saved on ' + new Date(script_obj.date).toDateString() + '</span></li>');
        }
        script_li.data('scripts', script_obj.scripts); // avoid re-parsing later
        list.append(script_li);
    }
    $('#restore_dialog').bPopup();
}

function restore_named_scripts(event){
    clear_scripts();
    load_scripts_from_object($(this).closest('li').data('scripts'));
    reset_and_close_restore_dialog();
}

function delete_named_scripts(event){
    if (confirm('Are you sure you want to delete this script?')){
        var title = $(this).siblings('.title').text();
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
    if (localStorage['__current_scripts']){
        var blocks = JSON.parse(localStorage['__current_scripts']);
        load_scripts_from_object(blocks);
    }else{
        'no scripts';
    }
}
$(document).ready(load_current_scripts);

// Build the Blocks menu

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

var DEGREE = Math.PI / 180;


var menus = {
    control: menu('Control', [
        {label: 'when program runs', trigger: true, script: 'function _start(){\n[[next]]\n}\n_start();\n'},
        {label: 'when [key] key pressed', trigger: true, script: '$(document).bind("keydown", "{{1}}", function(){\n[[next]]\n});'},
        {label: 'wait [number:1] secs', script: 'setTimeout(function(){\n[[next]]},\n1000*{{1}}\n);'},
        {label: 'forever', containers: 1, slot: false, script: 'while(true){\n[[1]]\n}'},
        {label: 'repeat [number:10]', containers: 1, script: 'range({{1}}).forEach(function(){\n[[1]]\n});'},
        {label: 'broadcast [string:ack] message', script: '$(".stage").trigger("{{1}}"'},
        {label: 'when I receive [string:ack] message', trigger: true, script: '$(".stage").bind("{{1}}", function(){\n[[next]]\n});'},
        {label: 'forever if [boolean]', containers: 1, slot: false, script: 'while({{1}}){\n[[1]]\n}'},
        {label: 'if [boolean]', containers: 1, script: 'if({{1}}{\n[[1]]\n}'},
        {label: 'if [boolean] else', containers: 2, script: 'if({{1}}{\n[[1]]\n}else{\n[[2]]\n}'},
        {label: 'repeat until [boolean]', script: 'while(!({{1}})){\n[[1]]\n}'}
    ], true),
    sensing: menu('Sensing', [
        {label: "ask [string:What's your name?] and wait", script: "local.answer = prompt({{1}});"},
        {label: 'answer', 'type': String, script: 'local.answer'},
        {label: 'mouse x', 'type': Number, script: 'global.mouse_x'},
        {label: 'mouse y', 'type': Number, script: 'global.mouse_y'},
        {label: 'mouse down', 'type': Boolean, script: 'global.mouse_down'},
        {label: 'key [key] pressed?', 'type': Boolean, script: '$(document).bind("keydown", {{1}}, function(){\n[[1]]\n});'},
        {label: 'reset timer', script: 'global.timer.reset()'},
        {label: 'timer', 'type': Number, script: 'global.timer.value()'}
    ]),
    operators: menu('Operators', [
        {label: '[number:0] + [number:0]', type: Number, script: "({{1}} + {{2}})"},
        {label: '[number:0] - [number:0]', type: Number, script: "({{1}} - {{2}})"},
        {label: '[number:0] * [number:0]', type: Number, script: "({{1]} * {{2}})"},
        {label: '[number:0] / [number:0]', type: Number, script: "({{1}} / {{2}})"},
        {label: 'pick random [number:1] to [number:10]', type: Number, script: "randint({{1}}, {{2}})"},
        {label: '[number:0] < [number:0]', type: Boolean, script: "({{1}} < {{2}})"},
        {label: '[number:0] = [number:0]', type: Boolean, script: "({{1}} == {{2}})"},
        {label: '[number:0] > [number:0]', type: Boolean, script: "({{1}} > {{2}})"},
        {label: '[boolean] and [boolean]', type: Boolean, script: "({{1}} && {{2}})"},
        {label: '[boolean] or [boolean]', type: Boolean, script: "({{1}} || {{2}})"},
        {label: 'not [boolean]', type: Boolean, script: "(! {{1}})"},
        {label: 'join [string:hello] with [string:world]', type: String, script: "({{1}} + {{2}})"},
        {label: 'letter [number:1] of [string:world]', type: String, script: "{{2}}[{{1}}"},
        {label: 'length of [string:world]', type: Number, script: "({{1}}.length)"},
        {label: '[number:0] mod [number:0]', type: Number, script: "({{1}} % {{2}})"},
        {label: 'round [number:0]', type: Number, script: "Math.round({{1}})"},
        {label: 'absolute of [number:10]', type: Number, script: "Math.abs({{2}})"},
        {label: 'arccosine degrees of [number:10]', type: Number, script: 'rad2deg(Math.acos({{1}}))'},
        {label: 'arcsine degrees of [number:10]', type: Number, script: 'rad2deg(Math.asin({{1}}))'},
        {label: 'arctangent degrees of [number:10]', type: Number, script: 'rad2deg(Math.atan({{1}}))'},
        {label: 'ceiling of [number:10]', type: Number, script: 'Math.ceil({{1}})'},
        {label: 'cosine of [number:10] degrees', type: Number, script: 'Math.cos(deg2rad({{1}}))'},
        {label: 'sine of [number:10] degrees', type: Number, script: 'Math.sin(deg2rad({{1}}))'},
        {label: 'tangent of [number:10] degrees', type: Number, script: 'Math.tan(deg2rad({{1}}))'},
        {label: '[number:10] to the power of [number:2]', type: Number, script: 'Math.pow({{1}}, {{2}})'},
        {label: 'round [number:10]', type: Number, script: 'Math.round({{1}})'},
        {label: 'square root of [number:10]', type: Number, script: 'Math.sqrt({{1}})'}
    ]),
    shapes: menu('Shapes', [
        {label: 'circle with radius [number:0]', script: 'local.shape = global.paper.circle(0, 0, {{1}});'},
        {label: 'rect with width [number:0] and height [number:0]', script: 'local.shape = global.paper.rect(0, 0, {{1}}, {{2}});'},
        {label: 'rounded rect with width [number:0] height [number:0] and radius [number:0]', script: 'local.shape = global.paper.rect(0, 0, {{1}}, {{2}}, {{3}});'},
        {label: 'ellipse x radius [number:0] y radius [number:0]', script: 'local.shape = global.paper.ellipse(0, 0, {{1}}, {{2}});'},
        {label: 'image src: [string:http://waterbearlang.com/images/waterbear.png]', script: 'local.shape = global.paper.image("{{1}}", {{0}}, {{0}});'},
        {label: 'name shape: [string:shape1]', script: 'local.shape_references["{{1}}"] = local.shape;'},
        {label: 'refer to shape [string:shape1]', script: 'local.shape = local.shape_references["{{1}}"];'},
        {label: 'with shape [string:shape1] do', containers: 1, script: 'local.oldshape = local.shape;\nlocal.shape = local.shape_references["{{1}}"];\n[[1]]\nlocal.shape = local.oldshape;'},
        {label: 'clip rect x [number:0] y [number:0] width [number:50] height [number:50]', script: 'local.shape.attr("clip-rect", "{{1}},{{2}},{{3}},{{4}}");'},
        {label: 'fill color [color:#FFFFFF]', script: 'local.shape.attr("fill", "{{1}}");'},
        {label: 'stroke color [color:#000000]', script: 'local.shape.attr("stroke", "{{1}}");'},
        {label: 'clone', script: 'local.shape = local.shape.clone()'},
        {label: 'fill opacity [number:100]%', script: 'local.shape.attr("fill-opacity", "{{1}}%")'},
        {label: 'href [string:http://waterbearlang.com]', script: 'local.shape.attr("href", "{{1}}")'}
    ]),
    text: menu('Path', [
        {label: 'text [string:Hello World] at x: [number:0] y: [number:0]', script: 'local.shape = global.paper.text("{{1}}", {{2}}, {{3}});' }
        // {label: 'font family: [string:Helvetica] weight: [number:0] style: [fontstyle]', script: 'FIXME'}
    ]),
    transform: menu('Transform', [
        {label: 'clear canvas', script: 'global.paper.clear();'},
        {label: 'hide', script: 'local.shape.hide();'},
        {label: 'show', script: 'local.shape.show();'},
        {label: 'rotate by [number:0]', script: 'local.shape.rotate({{1}}, false);'},
        {label: 'rotate to [number:0]', script: 'local.shape.rotate({{1}}, true);'},
        {label: 'rotate by [number:0] around x: [number:0] y: [number:0]', script: 'local.shape.rotate({{1}}, {{2}}, {{3}}, false);'},
        {label: 'rotate to [number:0] around x: [number:0] y: [number:0]', script: 'local.shape.rotate({{1}}, {{2}}, {{3}}, true);'},
        {label: 'translate by x: [number:0] y: [number:0]', script: 'local.shape.translate({{1}}, {{2}});'},
        {label: 'position at x [number:0] y [number:0]', script: 'local.shape.attr({x: {{1}}, y: {{2}}, cx:{{1}}, cy: {{2}}});'},
        {label: 'size width [number:100] height [number:100]', script: 'local.shape.attr({width: {{1}}, height: {{2}})'},
        {label: 'scale by [number:0]', script: 'local.shape.scale({{1}}, {{2}});'},
        {label: 'scaled by [number:0] centered at x: [number:0] y: [number:0]', script: 'local.shape.scale({{1}}, {{2}}, {{3}}, {{4}});'},
        {label: 'to front', script: 'local.shape.toFront();'},
        {label: 'to back', script: 'local.shape.toBack();'}
    ])
};

})(jQuery);