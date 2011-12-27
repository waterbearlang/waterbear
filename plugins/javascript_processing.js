/* 
 *    JAVASCRIPT PLUGIN
 * 
 *    Support for writing Javascript using Waterbear
 *
 */

yepnope({
    load: [ 'plugins/javascript.css',
            'lib/raphael-1.3.1-min.js',
            'lib/raphael-path.js',
            'lib/sketchy.js',
            'lib/colorwheel.js',
            'lib/beautify.js',
            'lib/highlight.js',
            'lib/highlight-javascript.js',
            'lib/highlight-github.css'
    ],
    complete: setup
});

jQuery.fn.extend({
  extract_script: function(){
      if (this.length === 0) return '';
      if (this.is(':input')){
          if (this.parent().is('.string') || this.parent().is('.color')){
              return '"' + this.val() + '"';
          }else{
              return this.val();
          }
      }
      if (this.is('.empty')) return '// do nothing';
      return this.map(function(){
          var self = $(this);
          var script = self.data('script');
          if (!script) return null;
          var exprs = $.map(self.socket_blocks(), function(elem, idx){return $(elem).extract_script();});
          var blks = $.map(self.child_blocks(), function(elem, idx){return $(elem).extract_script();});
          if (exprs.length){
              // console.log('expressions: %o', exprs);
              function exprf(match, offset, s){
                  // console.log('%d args: <%s>, <%s>, <%s>', arguments.length, match, offset, s);
                  var idx = parseInt(match.slice(2,-2), 10) - 1;
                  // console.log('index: %d, expression: %s', idx, exprs[idx]);
                  return exprs[idx];
              };
              script = script.replace(/\{\{\d\}\}/g, exprf);
          }
          if (blks.length){
              function blksf(match, offset, s){
                  var idx = parseInt(match.slice(2,-2), 10) - 1;
                  return blks[idx];
              }
              script = script.replace(/\[\[\d\]\]/g, blksf);
          }
          next = self.next_block().extract_script();
          if (script.indexOf('[[next]]') > -1){
              script = script.replace('[[next]]', next);
          }else{
              if (self.is('.step, .trigger')){
                  script = script + next;
              }
          }
          return script;
      }).get().join('');
  },
  wrap_script: function(){
      // wrap the top-level script to prevent leaking into globals
      var script = this.pretty_script();
      return 'var global = new Global();(function($){var local = new Local();' + script + '})(jQuery);';
  },
  pretty_script: function(){
      return js_beautify(this.map(function(){ return $(this).extract_script();}).get().join(''));
  },
  write_script: function(view){
      view.html('<pre class="language-javascript">' + this.pretty_script() + '</pre>');
      hljs.highlightBlock(view.children()[0]);
  }
});

function setup(){
    // This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global
    
function showColorPicker(){
    var self = $(this);
    cw.input(this);
    cw.onchange(function(){
        var color = self.val();
        self.css({color: color, 'background-color': color});
    });
    $('#color_popup').bPopup({modalColor: 'transparent'});
}
$('.workspace:visible .scripts_workspace').delegate('input[type=color]', 'click', showColorPicker);
$(document).ready(function(){
    window.cw = Raphael.colorwheel($('#color_contents')[0], 300, 180);
});

    
// Raphael Extensions (making life easier on our script templates)

// Provide the arc of a circle, given the radius and the angles to start and stop at
Raphael.fn.arcslice = function(radius, fromangle, toangle){
       var x1 = Math.cos(deg2rad(fromangle)) * radius, 
           y1 = Math.sin(deg2rad(fromangle)) * radius,
           x2 = Math.cos(deg2rad(toangle)) * radius, 
           y2 = Math.sin(deg2rad(toangle)) * radius;
        var arc = this.path();
        arc.moveTo(x1, y1).arcTo(radius, radius, 0, 1, x2,y2, rad2deg(toangle - fromangle));
        return arc;
};

Raphael.fn.regularPolygon = function(cx,cy,radius, sides, pointsOnly){
    var angle = 0;
    var theta = Math.PI * 2 / sides;
    var x = Math.cos(0) * radius + cx;
    var y = Math.sin(0) * radius + cy;
    if (pointsOnly){
        var points = [[x,y]];
    }else{
        var path = this.path();
        path.moveTo(x,y);
    }
    for (var i = 1; i < sides; i++){
        x = Math.cos(theta * i) * radius + cx;
        y = Math.sin(theta * i) * radius + cy;
        if (pointsOnly){
            points.push([x,y]);
        }else{
            path.lineTo(x,y);
        }
    }
    if (pointsOnly){
        return points;
    }else{
        path.andClose();
        return path;
    }
};

Raphael.fn.imageWithNaturalHeight = function(url){
    var img = this.image(url, 0, 0, 0, 0);
    function getWidthAndHeight() {
        img.attr({width: this.width, height: this.height});
        return true;
    }
    function loadFailure() {
        console.log("'" + this.name + "' failed to load.");
        return true;
    }
    var myImage = new Image();
    myImage.name = url;
    myImage.onload = getWidthAndHeight;
    myImage.onerror = loadFailure;
    myImage.src = "http://waterbearlang.com/images/waterbear.png";
    return img;
};


window.update_scripts_view = function(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    var view = $('.workspace:visible .scripts_text_view');
    blocks.write_script(view);
}

function run_scripts(event){
    $('.stage')[0].scrollIntoView();
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrap_script() + '</script></div>');
}
$('.run_scripts').click(run_scripts);

// End UI section



Local.prototype.getTweet = function(name, callback){
    var jsonTwitterFeed = "https://twitter.com/statuses/user_timeline/" + name + ".json";
    $.ajax({
        url: jsonTwitterFeed,
        dataType: 'jsonp',
        data: 'count=1',
        success: function(data, textStatus, jqXHR){
            $.each(data, function(idx,value){
                callback(value.text);                
            });            
        },
        error: function(XHR, textStatus, errorThrown){
            callback(textStatus);
            console.log('getTweet error %s: %s', textStatus, errorThrown);
        }
    });
};

window.getTweet = Local.prototype.getTweet;


// expose these globally so the Block/Label methods can find them
window.choice_lists = {
    keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt', 
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown', 
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
    linecap: ['round', 'butt', 'square'],
    linejoin: ['round', 'bevel', 'mitre'],
    easing: ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'],
    fontweight: ['normal', 'bold', 'inherit']
};


var menus = {
    control: menu('Control', [
        {
            label: 'when program runs', 
            trigger: true, 
            script: 'function _start(){[[next]]}_start();'
            },
        {
            label: 'when [choice:keys] key pressed', 
            trigger: true, 
            script: '$(document).bind("keydown", {{1}}, function(){console.log("{{1}}");[[next]]return false;});'
        },
        {
            label: 'every 1/[number:30] of a second', 
            trigger: true, 
            script: 'setInterval(function(){[[next]]},1000/{{1}});'
        },
        {
            label: 'wait [number:1] secs', 
            script: 'setTimeout(function(){[[next]]},1000*{{1}});'
        },
        {
            label: 'repeat [number:10]', 
            containers: 1, 
            script: 'range({{1}}).forEach(function(){[[1]]});'
        },
        {
            label: 'broadcast [string:ack] message', 
            script: '$(".stage").trigger({{1}});'
        },
        {
            label: 'when I receive [string:ack] message', 
            trigger: true, 
            script: '$(".stage").bind({{1}}, function(){[[next]]});'
        },
        {
            label: 'forever if [boolean:false]', 
            containers: 1, 
            slot: false, 
            script: 'while({{1}}){[[1]]}'
        },
        {
            label: 'if [boolean]', 
            containers: 1, 
            script: 'if({{1}}){[[1]]}'
        },
        {
            label: 'if [boolean] else', 
            containers: 2, 
            script: 'if({{1}}){[[1]]}else{[[2]]}'
        },
        {
            label: 'repeat until [boolean]', 
            script: 'while(!({{1}})){[[1]]}'
        }
    ], false),
    array: menu('Arrays', [
        {
            label: 'new array',
            script: 'local.last_var = [];'
        },
        {
            label: 'new array named [string]',
            script: 'local.last_var = local.variables[{{1}}] = [];'
        },
        {
            label: 'array append [any]',
            script: 'local.last_var.push({{1}});'
        } 
    ], false),
    sensing: menu('Sensing', [
        {
            label: 'ask [string:What\'s your name?] and wait',
            script: 'local.answer = prompt({{1}});'
        },
        {
            label: 'answer', 
            'type': 'string', 
            script: '+local.answer+'
        },
        {
            label: 'mouse x', 
            'type': 'number', 
            script: 'global.mouse_x'
        },
        {
            label: 'mouse y', 
            'type': 'number', 
            script: 'global.mouse_y'
        },
        {
            label: 'mouse down', 
            'type': 'boolean', 
            script: 'global.mouse_down'
        },
        {
            label: 'key [choice:keys] pressed?', 
            'type': 'boolean', 
            script: '$(document).bind("keydown", {{1}}, function(){[[1]]});'
        },
        {
            label: 'stage width', 
            'type': 'number', 
            script: 'global.stage_width'
        },
        {
            label: 'stage height', 
            'type': 'number', 
            script: 'global.stage_height'
        },
        {
            label: 'center x', 
            'type': 'number', 
            script: 'global.stage_center_x'
        },
        {
            label: 'center y', 
            'type': 'number', 
            script: 'global.stage_center_y'
        },
        {
            label: 'reset timer', 
            script: 'global.timer.reset()'
        },
        {
            label: 'timer', 
            'type': 'number', 
            script: 'global.timer.value()'
        }
    ]),
    operators: menu('Operators', [
        {
            label: '[number:0] + [number:0]', 
            'type': 'number', 
            script: "({{1}} + {{2}})"
        },
        {
            label: '[number:0] - [number:0]', 
            'type': 'number', 
            script: "({{1}} - {{2}})"
        },
        {
            label: '[number:0] * [number:0]', 
            'type': 'number', 
            script: "({{1}} * {{2}})"
        },
        {
            label: '[number:0] / [number:0]',
            'type': 'number', 
            script: "({{1}} / {{2}})"
        },
        {
            label: 'pick random [number:1] to [number:10]', 
            'type': 'number', 
            script: "randint({{1}}, {{2}})"
        },
        {
            label: '[number:0] < [number:0]', 
            'type': 'boolean', 
            script: "({{1}} < {{2}})"
        },
        {
            label: '[number:0] = [number:0]', 
            'type': 'boolean', 
            script: "({{1}} == {{2}})"
        },
        {
            label: '[number:0] > [number:0]', 
            'type': 'boolean', 
            script: "({{1}} > {{2}})"
        },
        {
            label: '[boolean] and [boolean]', 
            'type': 'boolean', 
            script: "({{1}} && {{2}})"
        },
        {
            label: '[boolean] or [boolean]', 
            'type': 'boolean', 
            script: "({{1}} || {{2}})"
        },
        {
            label: 'not [boolean]', 
            'type': 'boolean', 
            script: "(! {{1}})"
        },
        {
            label: 'join [string:hello] with [string:world]', 
            'type': 'string', script: "({{1}} + {{2}})"},
        {
            label: 'letter [number:1] of [string:world]', 
            'type': 'string', 
            script: "{{2}}[{{1}}]"
        },
        {
            label: 'length of [string:world]', 
            'type': 'number', 
            script: "({{1}}.length)"
        },
        {
            label: '[number:0] mod [number:0]', 
            'type': 'number', 
            script: "({{1}} % {{2}})"
        },
        {
            label: 'round [number:0]', 
            'type': 'number', 
            script: "Math.round({{1}})"
        },
        {
            label: 'absolute of [number:10]', 
            'type': 'number', 
            script: "Math.abs({{2}})"
        },
        {
            label: 'arccosine degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.acos({{1}}))'
        },
        {
            label: 'arcsine degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.asin({{1}}))'
        },
        {
            label: 'arctangent degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.atan({{1}}))'
        },
        {
            label: 'ceiling of [number:10]', 
            'type': 'number', 
            script: 'Math.ceil({{1}})'
        },
        {
            label: 'cosine of [number:10] degrees', 
            'type': 'number', 
            script: 'Math.cos(deg2rad({{1}}))'
        },
        {
            label: 'sine of [number:10] degrees', 
            'type': 'number', 
            script: 'Math.sin(deg2rad({{1}}))'
        },
        {
            label: 'tangent of [number:10] degrees', 
            'type': 'number', 
            script: 'Math.tan(deg2rad({{1}}))'
        },
        {
            label: '[number:10] to the power of [number:2]', 
            'type': 'number', 
            script: 'Math.pow({{1}}, {{2}})'
        },
        {
            label: 'round [number:10]', 
            'type': 'number', 
            script: 'Math.round({{1}})'
        },
        {
            label: 'square root of [number:10]', 
            'type': 'number', 
            script: 'Math.sqrt({{1}})'
        }
    ]),
    shapes: menu('Shapes', [
        {
            label: 'circle with radius [number:0]', 
            script: 'local.shape = global.paper.circle(0, 0, {{1}});'
        },
        {
            label: 'rect with width [number:0] and height [number:0]', 
            script: 'local.shape = global.paper.rect(0, 0, {{1}}, {{2}});'
        },
        {
            label: 'rounded rect with width [number:0] height [number:0] and radius [number:0]', 
            script: 'local.shape = global.paper.rect(0, 0, {{1}}, {{2}}, {{3}});'
        },
        {
            label: 'ellipse x radius [number:0] y radius [number:0]', 
            script: 'local.shape = global.paper.ellipse(0, 0, {{1}}, {{2}});'
        },
        {
            label: 'arc at radius [number:100] from [number:0] degrees to [number:30] degrees',
            script: 'local.shape = global.paper.arcslice({{1}}, {{2}}, {{3}});'
        },
        {
            label: 'image src: [string:http://waterbearlang.com/images/waterbear.png]', 
            script: 'local.shape = global.paper.imageWithNaturalHeight({{1}});'
        },
        {
            label: 'name shape: [string:shape1]', 
            script: 'local.shape_references[{{1}}] = local.shape;'
        },
        {
            label: 'refer to shape [string:shape1]', 
            script: 'local.shape = local.shape_references[{{1}}];'
        },
        {
            label: 'with shape [string:shape1] do', 
            containers: 1, 
            script: 'local.oldshape = local.shape;local.shape = local.shape_references[{{1}}];[[1]]local.shape = local.oldshape;'
        },
        {
            label: 'clip rect x [number:0] y [number:0] width [number:50] height [number:50]', 
            script: 'local.shape.attr("clip-rect", "{{1}},{{2}},{{3}},{{4}}");'
        },
        {
            label: 'fill color [color:#FFFFFF]', 
            script: 'local.shape.attr("fill", {{1}});'
        },
        {
            label: 'stroke color [color:#000000]', 
            script: 'local.shape.attr("stroke", {{1}});'
        },
        {
            label: 'fill transparent', 
            script: 'local.shape.attr("fill", "transparent");'
        },
        {
            label: 'stroke transparent', 
            script: 'local.shape.attr("stroke", "transparent");'
        },
        {
            label: 'stroke linecap [choice:linecap]', 
            script: 'local.shape.attr("stroke-linecap", {{1}});'
        },
        {
            label: 'stroke linejoin [choice:linejoin]', 
            script: 'local.shape.attr("stroke-linejoin", {{1}});'
        },
        {
            label: 'stroke opacity [number:100]%', 
            script: 'local.shape.attr("stroke-opacity", {{1}}+"%");'
        },
        {
            label: 'stroke width [number:1]', 
            script: 'local.shape.attr("stroke-width", {{1}});'
        },
        {
            label: 'rotate [number:5] degrees', 
            script: 'local.shape.attr("rotate", local.shape.attr("rotate") + {{1}});'
        },
        {
            label: 'rotate [number:5] degrees around x [number:0] y [number:0]', 
            script: 'local.shape.rotate(angle(local.shape) + {{1}}, {{2}}, {{3}});'
        },
        {
            label: 'clone', 
            script: 'local.shape = local.shape.clone()'
        },
        {
            label: 'fill opacity [number:100]%', 
            script: 'local.shape.attr("fill-opacity", {{1}}+"%")'
        },
        {
            label: 'href [string:http://waterbearlang.com]', 
            script: 'local.shape.attr("href", {{1}})'
        },
        {
            label: 'text [string:Hello World] at x: [number:0] y: [number:0]', 
            script: 'local.shape = global.paper.text({{2}}, {{3}}, {{1}});' 
        },
        {   label: 'font family [string:Helvetica]',
            script: 'local.shape.attr("font-family", {{1}});'
        },
        {
            label: 'font size [number:12]',
            script: 'local.shape.attr("font-size", {{1}});'
        },
        {
            label: 'font weight [choice:fontweight]',
            script: 'local.shape.attr("font-weight", {{1}});'
        }
    ]),
    text: menu('Sketchy', [
        {
            label: 'sketchy rect with width [number:50] and height [number:50]', 
            script: 'local.shape = global.paper.sk_rect(0,0, {{1}},{{2}});'
        },
        {
            label: 'sketchy ellipse with width [number:50] and height [number:50]', 
            script: 'local.shape = global.paper.sk_ellipse(0,0, {{1}}, {{2}});'
        },
        {
            label: 'sketchy line from x1 [number:10] y1 [number:10] to x2 [number:40] y2 [number:40]', 
            script: 'local.shape = global.paper.sk_line({{1}}, {{2}}, {{3}}, {{4}});'
        }
    ]),
    transform: menu('Transform', [
        {
            label: 'clear canvas', 
            script: 'global.paper.clear();'
        },
        {
            label: 'hide', 
            script: 'local.shape.hide();'
        },
        {
            label: 'show', 
            script: 'local.shape.show();'
        },
        {
            label: 'rotate by [number:0]', 
            script: 'local.shape.rotate({{1}}, false);'
        },
        {
            label: 'rotate to [number:0]', 
            script: 'local.shape.rotate({{1}}, true);'
        },
        {
            label: 'rotate to [number:0] around x: [number:0] y: [number:0]', 
            script: 'local.shape.rotate({{1}}, {{2}}, {{3}}, true);'
        },
        {
            label: 'translate by x: [number:0] y: [number:0]', 
            script: 'local.shape.translate({{1}}, {{2}});'
        },
        {
            label: 'position at x [number:0] y [number:0]', 
            script: 'local.shape.attr("translation", {{1}} + "," + {{2}});'
        },
        {
            label: 'size width [number:100] height [number:100]', 
            script: 'local.shape.attr({width: {{1}}, height: {{2}} })'
        },
        {
            label: 'scale by [number:0]', 
            script: 'local.shape.scale({{1}}, {{2}});'
        },
        {
            label: 'scaled by [number:0] centered at x: [number:0] y: [number:0]', 
            script: 'local.shape.scale({{1}}, {{2}}, {{3}}, {{4}});'
        },
        {
            label: 'to front', 
            script: 'local.shape.toFront();'
        },
        {
            label: 'to back', 
            script: 'local.shape.toBack();'
        }
    ]),
    animation: menu('Animation', [
        {
            label: 'position x [number:10] y [number:10] over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({translation: "{{1}}, {{2}}"}, {{3}}, {{4}});'
        },
        {
            label: 'opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({opacity: {{1}} }, {{2}}, {{3}});'
        },
        {
            label: 'fill color [color:#00FF00] over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({fill: {{1}}}, {{2}}, {{3}});'
        },
        {
            label: 'fill opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({"fill-opacity": {{1}} }, {{2}}, {{3}});'
        },
        {
            label: 'stroke color [color:#FF0000] over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({stroke: {{1}}}, {{2}}, {{3}});'
        },
        {
            label: 'stroke opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({"stroke-opacity": {{1}} }, {{2}}, {{3}});'
        },
        {
            label: 'width [number:10] over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({width: {{1}} }, {{2}}, {{3}});'
        },
        {
            label: 'height [number:10] over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({height: {{1}} }, {{2}}, {{3}});'
        },
        {
            label: 'radius [number:25] over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({r: {{1}} }, {{2}}, {{3}});'
        },
        {
            label: 'rotation [number:15] degrees over [number:500] ms with [choice:easing]',
            script: 'local.shape.animate({rotation: {{1}} }, {{2}}, {{3}});'
        },
        {
            label: 'stop animations',
            script: 'local.shape.stop()'
        }
    ]),
        animation: menu('Twitter', [
        {
            label: 'get tweet for [string]',
            containers: 1,
            script: 'local.getTweet({{1}}, function(tweet){local.lastTweet = tweet;[[1]]});'
        },
        {
            label: 'last tweet',
            type: 'string',
            script: '+local.lastTweet+'
        }
    ])
};

var demos = [
    {title: 'Rotating Squares',
     description: 'Just a simple animation test',
     scripts: [{"klass":"control","label":"when program runs","script":"function _start(){[[next]]}_start();","containers":0,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"control","label":"repeat [number:10]","script":"range({{1}}).forEach(function(){[[1]]});","containers":1,"sockets":["10"],"contained":[{"klass":"shapes","label":"rect with width [number:0] and height [number:0]","script":"local.shape = global.paper.rect(0, 0, {{1}}, {{2}});","containers":0,"sockets":["25","25"],"contained":[],"next":{"klass":"transform","label":"position at x [number:0] y [number:0]","script":"local.shape.attr(\"translation\", \"\"+{{1}} +\",\" + {{2}});","containers":0,"sockets":[{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","sockets":["1",{"klass":"sensing","label":"stage width","script":"global.stage_width","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""},{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","sockets":["1",{"klass":"sensing","label":"stage height","script":"global.stage_height","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"animation","label":"rotation [number:15] degrees over [number:500] ms with [choice:easing]","script":"local.shape.animate({rotation: {{1}} }, {{2}}, \"{{3}}\");","containers":0,"sockets":["360","5000",">"],"contained":[],"next":""}}}],"next":""}}]},
    {title: 'Solipong',
    description: 'Pong Solitaire, work in progress',
    scripts: [{"klass":"control","label":"when program runs","script":"function _start(){[[next]]}_start();","containers":0,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"shapes","label":"arc at radius [number:100] from [number:0] degrees to [number:30] degrees","script":"local.shape = global.paper.arcslice({{1}}, {{2}}, {{3}});","containers":0,"sockets":["100","0","30"],"contained":[],"next":{"klass":"shapes","label":"stroke linecap [choice:linecap]","script":"local.shape.attr(\"stroke-linecap\", \"{{1}}\");","containers":0,"sockets":["round"],"contained":[],"next":{"klass":"shapes","label":"stroke width [number:1]","script":"local.shape.attr(\"stroke-width\", {{1}});","containers":0,"sockets":["5"],"contained":[],"next":{"klass":"transform","label":"position at x [number:0] y [number:0]","script":"local.shape.attr(\"translation\", \"\"+{{1}} +\",\" + {{2}});","containers":0,"sockets":[{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":{"klass":"shapes","label":"name shape: [string:shape1]","script":"local.shape_references[\"{{1}}\"] = local.shape;","containers":0,"sockets":["paddle"],"contained":[],"next":{"klass":"shapes","label":"circle with radius [number:0]","script":"local.shape = global.paper.circle(0, 0, {{1}});","containers":0,"sockets":["5"],"contained":[],"next":{"klass":"shapes","label":"fill color [color:#FFFFFF]","script":"local.shape.attr(\"fill\", \"{{1}}\");","containers":0,"sockets":["#545ca5"],"contained":[],"next":{"klass":"shapes","label":"stroke transparent","script":"local.shape.attr(\"stroke\", \"transparent\");","containers":0,"sockets":[],"contained":[],"next":{"klass":"transform","label":"position at x [number:0] y [number:0]","script":"local.shape.attr(\"translation\", \"\"+{{1}} +\",\" + {{2}});","containers":0,"sockets":[{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":{"klass":"shapes","label":"name shape: [string:shape1]","script":"local.shape_references[\"{{1}}\"] = local.shape;","containers":0,"sockets":["ball"],"contained":[],"next":""}}}}}}}}}}},{"klass":"control","label":"when [choice:keys] key pressed","script":"$(document).bind(\"keydown\", \"{{1}}\", function(){[[next]]return false;});","containers":0,"trigger":true,"sockets":["right"],"contained":[],"next":{"klass":"shapes","label":"refer to shape [string:shape1]","script":"local.shape = local.shape_references[\"{{1}}\"];","containers":0,"sockets":["paddle"],"contained":[],"next":{"klass":"shapes","label":"rotate [number:5] degrees around x [number:0] y [number:0]","script":"local.shape.rotate(angle(local.shape) + {{1}}, {{2}}, {{3}});","containers":0,"sockets":["5",{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""}}},{"klass":"control","label":"when [choice:keys] key pressed","script":"$(document).bind(\"keydown\", \"{{1}}\", function(){[[next]]return false;});","containers":0,"trigger":true,"sockets":["left"],"contained":[],"next":{"klass":"shapes","label":"refer to shape [string:shape1]","script":"local.shape = local.shape_references[\"{{1}}\"];","containers":0,"sockets":["paddle"],"contained":[],"next":{"klass":"shapes","label":"rotate [number:5] degrees around x [number:0] y [number:0]","script":"local.shape.rotate(angle(local.shape) + {{1}}, {{2}}, {{3}});","containers":0,"sockets":["-5",{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""}}}]
    }
];
populate_demos_dialog(demos);

}
