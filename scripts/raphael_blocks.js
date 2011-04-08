(function($){

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
    // FIXME
}
$('.run_scripts').live('click', run_scripts);

function menu(title, specs, show){
    var klass = title.toLowerCase();
    var body = $('<section class="submenu"></section>');
    var select = $('<h3 class="select">' + title + '</h3>').appendTo(body);
    var options = $('<div class="option"></div>').appendTo(body);
    var col = $('<table><tr><td></td><td></td></tr></table>').appendTo(options);
    var half = Math.round((specs.length + 1) / 2);
    var col1 = col.find('td').eq(0);
    var col2 = col.find('td').eq(1);
    specs.forEach(function(spec, idx){
        spec.klass = klass;
        if (idx < half){
            col1.append(block(spec));
        }else{
            col2.append(block(spec));
        }
    });
    $('.block_menu').append(body);
    if (show){
        select.addClass('selected');
    }else{
        options.hide();
    }
    return body;
}

var menus = {
    control: menu('Control', [
        {label: 'when [flag] clicked', trigger: true, script: '$(".run_scripts").click(function(){\n[[next]]\n})}'},
        {label: 'when [key] key pressed', trigger: true, script: 'FIXME'},
        {label: 'wait [number:1] secs', script: 'setTimeout(function(){\n[[next]]},\n1000*{{1}}\n);'},
        {label: 'forever', containers: 1, tab: false, script: 'while(true){\n[[1]]\n}'},
        {label: 'repeat [number:10]', containers: 1, script: 'range({{1}}).forEach(function(){\n[[next]]\n});'},
        {label: 'broadcast [message]', script: 'FIXME'},
        {label: 'broadcast [message] and wait', script: 'FIXME'},
        {label: 'when I receive [message]', trigger: true, script: 'FIXME'},
        {label: 'forever if [boolean]', containers: 1, tab: false, script: 'while({{1}}){\n[[1]]\n}'},
        {label: 'if [boolean]', containers: 1, script: 'if({{1}}{\n[[1]]\n}'},
        {label: 'if [boolean] else', containers: 2, script: 'if({{1}}{\n[[1]]\n}else{\n[[2]]\n}'},
        {label: 'wait until [boolean]', script: 'FIXME'},
        {label: 'repeat until [boolean]', script: 'while(!({{1}})){\n[[1]]\n}'},
        {label: 'stop script', script: 'FIXME'}
    ], true),
    sensing: menu('Sensing', [
        {label: "ask [string:What's your name?] and wait", script: "state.answer = prompt({{1}});"},
        {label: 'answer', 'type': String, script: 'state.answer'},
        {label: 'mouse x', 'type': Number, script: 'state.mouse_x'},
        {label: 'mouse y', 'type': Number, script: 'state.mouse_y'},
        {label: 'mouse down', 'type': Boolean, script: 'state.mouse_down'},
        {label: 'key [key] pressed?', 'type': Boolean, script: '$(document).bind("keydown", {{1}}, function(){\n[[1]]\n});'},
        {label: 'reset timer', script: 'FIXME', script: 'state.timer.reset()'},
        {label: 'timer', 'type': Number, script: 'state.timer.value()'}
    ]),
    operators: menu('Operators', [
        {label: '[number] + [number]', type: Number, script: "({{1}} + {{2}})"},
        {label: '[number] - [number]', type: Number, script: "({{1}} - {{2}})"},
        {label: '[number] * [number]', type: Number, script: "({{1]} * {{2}})"},
        {label: '[number] / [number]', type: Number, script: "({{1}} / {{2}})"},
        {label: 'pick random [number:1] to [number:10]', type: Number, script: "randint({{1}}, {{2}})"},
        {label: '[number] < [number]', type: Boolean, script: "({{1}} < {{2}})"},
        {label: '[number] = [number]', type: Boolean, script: "({{1}} == {{2}})"},
        {label: '[number] > [number]', type: Boolean, script: "({{1}} > {{2}})"},
        {label: '[boolean] and [boolean]', type: Boolean, script: "({{1}} && {{2}})"},
        {label: '[boolean] or [boolean]', type: Boolean, script: "({{1}} || {{2}})"},
        {label: 'not [boolean]', type: Boolean, script: "(! {{1}})"},
        {label: 'join [string:hello] [string:world]', type: String, script: "({{1}} + {{2}})"},
        {label: 'letter [number:1] of [string:world]', type: String, script: "{{2}}[{{1}}"},
        {label: 'length of [string:world]', type: Number, script: "({{1}}.length)"},
        {label: '[number] mod [number]', type: Number, script: "({{1}} % {{2}})"},
        {label: 'round [number]', type: Number, script: "Math.round({{1}})"},
        {label: '[function] of [number:10]', type: Number, script: "Math.{{1}}({{2}})"}
    ]),
    shapes: menu('Shapes', [
        {label: 'circle x: [number] y: [number] radius: [number]', script: 'state.shape = state.paper.circle({{1}}, {{2}}, {{3}});'},
        {label: 'rect x: [number] y: [number] width: [number] height: [number]', script: 'state.shape = state.paper.rect({{1}}, {{2}}, {{3}});'},
        {label: 'rounded rect x: [number] y: [number] width: [number] height: [number] radius: [number]', script: 'state.shape = state.paper.rect({{1}}, {{2}}, {{3}}, {{4}});'},
        {label: 'ellipse x: [number] y: [number] x radius: [number] y radius: [number]', script: 'state.shape = state.paper.ellipse({{1}}, {{2}}, {{3}}, {{4}});'},
        {label: 'image src: [string] x: [number] y: [number] width: [number] height: [number]', script: 'state.shape = state.paper.image("{{1}}", {{2}}, {{3}}, {{4}}, {{5}});'},
        {label: 'name shape: [string]', script: 'state.shape_references["{{1}}"] = state.shape;'},
        {label: 'refer to [shape]', script: 'state.shape = shape_references["{{1}}"];'}
    ]),
    text: menu('Path', [
        {label: 'text [string] at x: [number] y: [number]', script: 'state.shape = state.paper.image("{{1}}", {{2}}, {{3}});' },
        {label: 'font family: [string] weight: [number] style: [fontstyle]', script: 'FIXME'}
    ]),
    transform: menu('Transform', [
        {label: 'clear canvas', script: 'state.paper.clear();'},
        {label: 'hide', script: 'state.shape.hide();'},
        {label: 'show', script: 'state.shape.show();'},
        {label: 'rotate by [number]', script: 'state.shape.rotate({{1}}, false);'},
        {label: 'rotate to [number]', script: 'state.shape.rotate({{1}}, true);'},
        {label: 'rotate by [number] around x: [number] y: [number]', script: 'state.shape.rotate({{1}}, {{2}}, {{3}}, false);'},
        {label: 'rotate to [number] around x: [number] y: [number]', script: 'state.shape.rotate({{1}}, {{2}}, {{3}}, true);'},
        {label: 'translate by x: [number] y: [number]'},
        {label: 'scale by [number]'},
        {label: 'scaled by [number] centered at x: [number] y: [number]'},
        {label: 'scale by [number] [number]'},
        {label: 'scale by [number] [number] centered at x: [number] y: [number]'},
        {label: 'to front'},
        {label: 'to back'}
    ])
};

})(jQuery);