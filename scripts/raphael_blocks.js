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
        {label: 'forever', containers: 1, tab: false, script: 'while(true){\n[[next\n}'},
        {label: 'repeat [number:10]', containers: 1, script: 'range({{1}}).forEach(function(){\n[[next]]\n});'},
        {label: 'broadcast [message]', script: 'FIXME'},
        {label: 'broadcast [message] and wait', script: 'FIXME'},
        {label: 'when I receive [message]', trigger: true, script: 'FIXME'},
        {label: 'forever if [boolean]', containers: 1, tab: false, },
        {label: 'if [boolean]', containers: 1},
        {label: 'if [boolean] else', containers: 2},
        {label: 'wait until [boolean]'},
        {label: 'repeat until [boolean]'},
        {label: 'stop script'}
    ], true),
    sensing: menu('Sensing', [
        {label: "ask [string:What's your name?] and wait", script: ""},
        {label: 'answer', 'type': String},
        {label: 'mouse x', 'type': Number},
        {label: 'mouse y', 'type': Number},
        {label: 'mouse down', 'type': Boolean},
        {label: 'key [key] pressed?', 'type': Boolean},
        {label: 'reset timer'},
        {label: 'timer', 'type': Number}
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
        {label: 'circle x: [number] y: [number] radius: [number]'},
        {label: 'rect x: [number] y: [number] width: [number] height: [number]'},
        {label: 'rounded rect x: [number] y: [number] width: [number] height: [number] radius: [number]'},
        {label: 'ellipse x: [number] y: [number] x radius: [number] y radius: [number]'},
        {label: 'image src: [string] x: [number] y: [number] width: [number] height: [number]'},
        {label: 'name shape: [string]'},
        {label: 'refer to [shape]'}
    ]),
    text: menu('Path', [
        {label: 'text [string] at x: [number] y: [number]'},
        {label: 'font family: [string] weight: [number] style: [fontstyle]'}
    ]),
    transform: menu('Transform', [
        {label: 'clear canvas'},
        {label: 'hide'},
        {label: 'show'},
        {label: 'rotate by [number]'},
        {label: 'rotate to [number]'},
        {label: 'rotate by [number] around x: [number] y: [number]'},
        {label: 'rotate to [number] around x: [number] y: [number]'},
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