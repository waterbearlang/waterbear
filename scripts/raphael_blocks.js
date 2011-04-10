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
    $(document.body).scrollLeft(10000);
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrap_script() + '</script></div>');
}
$('.run_scripts').live('click', run_scripts);

function menu(title, specs, show){
    var klass = title.toLowerCase();
    var body = $('<section class="submenu"></section>');
    var select = $('<h3 class="select">' + title + '</h3>').appendTo(body);
    var options = $('<div class="option"></div>').appendTo(body);
    specs.forEach(function(spec, idx){
        spec.klass = klass;
        options.append(block(spec));
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

function rad2deg(rad){
    return rad / DEGREE;
}

function deg2rad(deg){
    return deg * DEGREE;
}

var menus = {
    control: menu('Control', [
        {label: 'when program runs', trigger: true, script: 'function _start(){\n[[next]]\n}\n_start();\n'},
        {label: 'when [key] key pressed', trigger: true, script: '$(document).bind("keydown", "{{1}}", function(){\n[[next]]\n});'},
        {label: 'wait [number:1] secs', script: 'setTimeout(function(){\n[[next]]},\n1000*{{1}}\n);'},
        {label: 'forever', containers: 1, tab: false, script: 'while(true){\n[[1]]\n}'},
        {label: 'repeat [number:10]', containers: 1, script: 'range({{1}}).forEach(function(){\n[[next]]\n});'},
        {label: 'broadcast [string:ack] message', script: '$(".stage").trigger("{{1}}"'},
        // {label: 'broadcast [string:ack] message and wait', script: 'FIXME'},
        {label: 'when I receive [string:ack] message', trigger: true, script: '$(".stage").bind("{{1}}", function(){\n[[next]]\n});'},
        {label: 'forever if [boolean]', containers: 1, tab: false, script: 'while({{1}}){\n[[1]]\n}'},
        {label: 'if [boolean]', containers: 1, script: 'if({{1}}{\n[[1]]\n}'},
        {label: 'if [boolean] else', containers: 2, script: 'if({{1}}{\n[[1]]\n}else{\n[[2]]\n}'},
        {label: 'wait until [boolean]', script: 'FIXME'},
        {label: 'repeat until [boolean]', script: 'while(!({{1}})){\n[[1]]\n}'},
        {label: 'stop script', script: 'FIXME'}
    ], true),
    sensing: menu('Sensing', [
        {label: "ask [string:What's your name?] and wait", script: "local.answer = prompt({{1}});"},
        {label: 'answer', 'type': String, script: 'local.answer'},
        {label: 'mouse x', 'type': Number, script: 'global.mouse_x'},
        {label: 'mouse y', 'type': Number, script: 'global.mouse_y'},
        {label: 'mouse down', 'type': Boolean, script: 'global.mouse_down'},
        {label: 'key [key] pressed?', 'type': Boolean, script: '$(document).bind("keydown", {{1}}, function(){\n[[1]]\n});'},
        {label: 'reset timer', script: 'FIXME', script: 'global.timer.reset()'},
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
        {label: 'round [Number:10]', type: Number, script: 'Math.round({{1}})'},
        {label: 'square root of [Number:10]', type: Number, script: 'Math.sqrt({{1}})'}
    ]),
    shapes: menu('Shapes', [
        {label: 'circle x: [number:0] y: [number:0] radius: [number:0]', script: 'local.shape = global.paper.circle({{1}}, {{2}}, {{3}});'},
        {label: 'rect x: [number:0] y: [number:0] width: [number:0] height: [number:0]', script: 'local.shape = global.paper.rect({{1}}, {{2}}, {{3}});'},
        {label: 'rounded rect x: [number:0] y: [number:0] width: [number:0] height: [number:0] radius: [number:0]', script: 'local.shape = global.paper.rect({{1}}, {{2}}, {{3}}, {{4}});'},
        {label: 'ellipse x: [number:0] y: [number:0] x radius: [number:0] y radius: [number:0]', script: 'local.shape = global.paper.ellipse({{1}}, {{2}}, {{3}}, {{4}});'},
        {label: 'image src: [string:http://waterbearlang.com/images/waterbear.png] x: [number:0] y: [number:0] width: [number:0] height: [number:0]', script: 'local.shape = global.paper.image("{{1}}", {{2}}, {{3}}, {{4}}, {{5}});'},
        {label: 'name shape: [string:shape1]', script: 'local.shape_references["{{1}}"] = local.shape;'},
        {label: 'refer to shape [string:shape1]', script: 'local.shape = local.shape_references["{{1}}"];'},
        {label: 'with shape [string:shape1] do', containers: 1, script: 'local.oldshape = local.shape;\nlocal.shape = local.shape_references["{{1}}"];\n[[1]]\nlocal.shape = local.oldshape;'},
        {label: 'clip rect x [number:0] y [number:0] width [number:50] height [number:50]', script: 'local.shape.attr("clip-rect", "{{1}},{{2}},{{3}},{{4}}");'},
        {label: 'fill red [number:100]% green [number:100]% blue [number:100]%', script: 'local.shape.attr("color", "rgb({{1}}%,{{2}}%,{{3}}%)");'},
        {label: 'fill red [number:100]% green [number:100]% blue [number:100]% alpha [number:100]%', script: 'local.shape.attr("color", "rgba({{1}}%,{{2}}%,{{3}}%,{{4}}/100)");'},
        {label: 'fill hue [number:240]degrees saturation [number:100]% brightness [number:100]%', script: 'local.shape.attr("color", "hsb({{1}}deg,{{2}}%,{{3}}%)");'},
        {label: 'fill hue [number:240]degrees saturation [number:100]% brightness [number:100]% alpha [number:100]%', script: 'local.shape.attr("color", "hsba({{1}}deg,{{2}}%,{{3}}%,{{4}}/100)");'},
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
        {label: 'scale by [number:0]', script: 'local.shape.scale({{1}}, {{2}});'},
        {label: 'scaled by [number:0] centered at x: [number:0] y: [number:0]', script: 'local.shape.scale({{1}}, {{2}}, {{3}}, {{4}});'},
        {label: 'to front', script: 'local.shape.toFront();'},
        {label: 'to back', script: 'local.shape.toBack();'}
    ])
};

})(jQuery);