/* 
 *    JAVASCRIPT PLUGIN
 * 
 *    Support for writing Javascript using Waterbear
 *
 */


// Pre-load dependencies
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

// Add some utilities
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
      if (this.is('.empty')) return '/* do nothing */';
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
      return 'var global = new Global();(function($){var local = new Local();try{' + script + '}catch(e){alert(e);}})(jQuery);';
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
    arity: ['0', '1', '2', '3', 'array', 'object'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function','color', 'image', 'shape', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'color', 'image', 'shape', 'any', 'this'],
    easing: ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'],
    fontweight: ['normal', 'bold', 'inherit']
};

// Hints for building blocks
//
//
// Value blocks can nest, so don't end them with semi-colons (i.e., if there is a "type" specified).
//
//
var menus = {
    control: menu('Control', [
        {
            label: 'when program runs',
            trigger: true, 
            script: 'function _start(){[[next]]}_start();',
            help: 'this trigger will run its scripts once when the program starts'
        },
        {
            label: 'when [choice:keys] key pressed', 
            trigger: true, 
            script: '$(document).bind("keydown", {{1}}, function(){[[next]]; return false;});',
            help: 'this trigger will run the attached blocks every time this key is pressed'
        },
        {
            label: 'repeat [number:30] times a second',
            trigger: true,
            slot: false,
            containers: 1,
            locals: [
                {
                    label: 'count',
                    script: 'local.count',
                    type: 'number'
                }
            ],
            script: '(function(){var count = 0; setInterval(function(){count++; local.count = count;[[next]]},1000/{{1}})})();',
            help: 'this trigger will run the attached blocks periodically'
        },
        {
            label: 'wait [number:1] secs', 
            script: 'setTimeout(function(){[[next]]},1000*{{1}});',
            help: 'pause before running the following blocks'
        },
        {
            label: 'repeat [number:10]', 
            containers: 1, 
            slot: false,
            script: 'range({{1}}).forEach(function(idx, item){local.count = idx; local.last_var = item;[[1]]});',
            help: 'repeat the contained blocks so many times'
            locals: [
                {
                    label: 'loop index',
                    script: 'local.index',
                    type: 'number'
                }
            ]
        },
        {
            label: 'broadcast [string:ack] message', 
            script: '$(".stage").trigger({{1}});',
            help: 'send this message to any listeners'
        },
        {
            label: 'when I receive [string:ack] message', 
            trigger: true, 
            script: '$(".stage").bind({{1}}, function(){[[next]]});',
            help: 'add a listener for the given message, run these blocks when it is received'
        },
        {
            label: 'forever if [boolean:false]', 
            containers: 1,  
            script: 'while({{1}}){[[1]]}',
            help: 'repeat until the condition is false'
        },
        {
            label: 'if [boolean]', 
            containers: 1, 
            script: 'if({{1}}){[[1]]}',
            help: 'run the following blocks only if the condition is true'
        },
        {
            label: 'if [boolean]', 
            containers: 2,
            subContainerLabels: ['else'],
            script: 'if({{1}}){[[1]]}else{[[2]]}',
            help: 'run the first set of blocks if the condition is true, otherwise run the second set'
        },
        {
            label: 'repeat until [boolean]', 
            containers: 1, 
            script: 'while(!({{1}})){[[1]]}',
            help: 'repeat forever until condition is true'
        }
    ], true),
    array: menu('Arrays', [
        {
            label: 'new array',
            script: 'local.array = [];',
            help: 'Create an empty array',
            returns: {
                label: 'array',
                script: 'local.array',
                type: 'array'
            }
        },
        {
            label: 'new array named [string]',
            script: 'local.set("array", {{1}}, []);',
            help: 'create an empty array accessed by name'
        },
        {
            label: 'new array named [string] with array [array]',
            script: 'local.set("array", {{1}}, {{2}});',
            help: 'create a new array with the contents of another array'
        },
        {
            label: 'array named [string]',
            script: 'local.get("array", {{1}})',
            type: 'array',
            help: 'retrieve a named array'
        },
        {
            label: 'array [string] item [number:0]',
            script: 'local.get("array", {{1}})[{{2}}]',
            type: 'any',
            help: 'get an item from an index in a named array'
        },
        {
            label: 'array [string] join with [string:, ]',
            script: 'local.get("array", {{1}}).join({{2}})',
            type: 'string',
            help: 'join items of a named array into a string, each item separated by given string'
        },
        {
            label: 'array [string] append [any]',
            script: 'local.get("array", {{1}}).push({{2}});',
            help: 'add any object to a named array'
        },
        {
            label: 'array append [any]',
            script: 'local.last_var.push({{1}});',
            help: 'add any object to the current array'
        },
        {
            label: 'array [string] length',
            script: 'local.get({{1}}).length',
            type: 'number',
            help: 'get the length of a named array'
        },
        {
            label: 'array [string] remove item [number:0]',
            script: 'local.get("array", {{1}}).splice({{1}}, 1)[0]',
            type: 'any',
            help: 'remove item at index from named array'
        },
        {
            label: 'array [string] pop',
            script: 'local.get("array", {{1}}).pop()',
            type: 'any',
            help: 'remove and return the last item from a named array'
        },
        {
            label: 'array [string] shift',
            script: 'local.get("array", {{1}}).shift()',
            type: 'any',
            help: 'remove and return the first item from a named array'
        },
        {   
            label: 'array [string] reverse',
            script: 'local.get("array", {{1}}).reverse()',
            type: 'array',
            help: 'reverse a named array in place'
        },
        {
            label: 'array [string] concat [array]',
            script: 'local.get("array", {{1}}).concat({{2}});',
            type: 'array',
            help: 'add all the items from one array to a named array'
        },
        {
            label: 'array [string] for each',
            script: '$.each(local.get("array", {{1}}), function(idx, item){local.index = idx; local.last_var = item; [[1]] });',
            containers: 1,
            help: 'run the blocks with each item of a named array'
        }
    ], false),
    objects: menu('Objects', [
        {
            label: 'new object',
            script: 'local.last_var = {};',
            help: 'create a new, empty object'
        },
        {
            label: 'new object named [string]',
            script: 'local.set("object", {{1}}, {});',
            help: 'create a new, empty, named object'
        },
        {
            label: 'object key [string] = value [any]',
            script: 'local.last_var[{{1}}] = {{2}};',
            help: 'set the key/value of the current object'
        },
        {
            label: 'object named [string] key [string] = value [any]',
            script: 'local.get("object", {{1}})[{{2}}] = {{3}};',
            help: 'set the key/value of a named object'
        },
        {
            label: 'object value at key [string]',
            script: 'local.last_var[{{1}}]',
            type: 'any',
            help: 'return the value of the key in the current object'
        },
        {
            label: 'object [string] value at key [string]',
            script: 'local.get("object", {{1}})[{{2}}]',
            type: 'any',
            help: 'return the value of the key in the named object'
        }
    ], false),
    strings: menu('Strings', [
        {
            label: 'string named [string] = [string]',
            script: 'local.set("string", {{1}}, {{2}});',
            help: 'A named string with the given value'
        },
        {
            label: 'string [string] split on [string]',
            script: '{{1}}.split({{2}})',
            type: 'array',
            help: 'create an array by splitting the named string on the given string'
        },
        {
            label: 'string [string] character at [number:0]',
            script: 'local.get("string", {{1}}[{{2}}]',
            type: 'string',
            help: 'get the single character string at the given index of named string'
        },
        {
            label: 'string [string] length',
            script: 'local.get("string", {{1}}.length',
            type: 'number',
            help: 'get the length of named string'
        },
        {
            label: 'string [string] indexOf [string]',
            script: 'local.get("string", {{1}}.indexOf({{2}})',
            type: 'number',
            help: 'get the index of the substring within the named string'
        },
        {
            label: 'string [string] replace [string] with [string]',
            script: 'local.get("string", {{1}}.replace({{2}}, {{3}})',
            type: 'string',
            help: 'get a new string by replacing a substring with a new string'
        },
        {
            label: 'to string [any]',
            script: '{{1}}.toString()',
            type: 'string',
            help: 'convert any object to a string'
        },
        {
            label: 'comment [string]',
            script: '// {{1}};\n',
            help: 'this is a comment and will not be run by the program'
        },
        {
            label: 'alert [string]',
            script: 'window.alert({{1}})',
            help: 'pop up an alert window with string'
        },
        {
            label: 'console log [any]',
            script: 'console.log({{1}})',
            help: 'Send any object as a message to the console'
        },
        {
            label: 'console log format [string] arguments [array]',
            script: 'var __a={{2}};__a.unshift({{1}});console.log.apply(console, __a);',
            help: 'send a message to the console with a format string and multiple objects'
        }
    ], false),
    sensing: menu('Sensing', [
        {
            label: 'ask [string:What\'s your name?] and wait',
            script: 'local.answer = prompt({{1}});',
            help: 'Prompt the user for information'
        },
        {
            label: 'answer', 
            'type': 'string', 
            script: 'local.answer',
            help: 'A block that is only valid after prompting the user for information'
        },
        {
            label: 'mouse x', 
            'type': 'number', 
            script: 'global.mouse_x',
            help: 'The current horizontal mouse position'
        },
        {
            label: 'mouse y', 
            'type': 'number', 
            script: 'global.mouse_y',
            help: 'the current vertical mouse position'
        },
        {
            label: 'mouse down', 
            'type': 'boolean', 
            script: 'global.mouse_down',
            help: 'true if the mouse is down, false otherwise'
        },
        {
            label: 'key [choice:keys] pressed?', 
            'type': 'boolean', 
            script: '$(document).bind("keydown", {{1}}, function(){[[1]]});',
            help: 'is the given key down when this block is run?'
        },
        {
            label: 'stage width', 
            'type': 'number', 
            script: 'global.stage_width',
            help: 'width of the stage where scripts are run. This may change if the browser window changes'
        },
        {
            label: 'stage height', 
            'type': 'number', 
            script: 'global.stage_height',
            help: 'height of the stage where scripts are run. This may change if the browser window changes.'
        },
        {
            label: 'center x', 
            'type': 'number', 
            script: 'global.stage_center_x',
            help: 'horizontal center of the stage'
        },
        {
            label: 'center y', 
            'type': 'number', 
            script: 'global.stage_center_y',
            help: 'vertical center of the stage'
        },
        {
            label: 'reset timer', 
            script: 'global.timer.reset()',
            help: 'set the global timer back to zero'
        },
        {
            label: 'timer', 
            'type': 'number', 
            script: 'global.timer.value()',
            help: 'seconds since the script began running'
        }
    ]),
    operators: menu('Operators', [
        {
            label: '[number:0] ➕ [number:0]', 
            'type': 'number', 
            script: "({{1}} + {{2}})",
            help: 'sum of the two operands'
        },
        {
            label: '[number:0] ➖ [number:0]', 
            'type': 'number', 
            script: "({{1}} - {{2}})",
            help: 'difference of the two operands'
        },
        {
            label: '[number:0] ✖ [number:0]', 
            'type': 'number', 
            script: "({{1}} * {{2}})",
            help: 'product of the two operands'
        },
        {
            label: '[number:0] ➗ [number:0]',
            'type': 'number', 
            script: "({{1}} / {{2}})",
            help: 'quotient of the two operands'
        },
        {
            label: 'pick random [number:1] to [number:10]', 
            'type': 'number', 
            script: "randint({{1}}, {{2}})",
            help: 'random number between two numbers (inclusive)'
        },
        {
            label: '[number:0] ❮ [number:0]', 
            'type': 'boolean', 
            script: "({{1}} < {{2}})",
            help: 'first operand is less than second operand'
        },
        {
            label: '[number:0] = [number:0]', 
            'type': 'boolean', 
            script: "({{1}} === {{2}})",
            help: 'two operands are equal'
        },
        {
            label: '[number:0] ❯ [number:0]', 
            'type': 'boolean', 
            script: "({{1}} > {{2}})",
            help: 'first operand is greater than second operand'
        },
        {
            label: '[boolean] and [boolean]', 
            'type': 'boolean', 
            script: "({{1}} && {{2}})",
            help: 'both operands are true'
        },
        {
            label: '[boolean] or [boolean]', 
            'type': 'boolean', 
            script: "({{1}} || {{2}})",
            help: 'either or both operands are true'
        },
        {
            label: '[boolean] xor [boolean]',
            'type': 'boolean',
            script: "({{1}} ? !{{2}} : {{2}})",
            help: 'either, but not both, operands are true'
        },
        {
            label: 'not [boolean]', 
            'type': 'boolean', 
            script: "(! {{1}})",
            help: 'operand is false',
        },
        {
            label: 'concatenate [string:hello] with [string:world]', 
            'type': 'string', 
            script: "({{1}} + {{2}})",
            help: 'returns a string by joining together two strings'
        },
        {
            label: '[number:0] mod [number:0]', 
            'type': 'number', 
            script: "({{1}} % {{2}})",
            help: 'modulus of a number is the remainder after whole number division'
        },
        {
            label: 'round [number:0]', 
            'type': 'number', 
            script: "Math.round({{1}})",
            help: 'rounds to the nearest whole number'
        },
        {
            label: 'absolute of [number:10]', 
            'type': 'number', 
            script: "Math.abs({{2}})",
            help: 'converts a negative number to positive, leaves positive alone'
        },
        {
            label: 'arccosine degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.acos({{1}}))',
            help: 'inverse of cosine'
        },
        {
            label: 'arcsine degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.asin({{1}}))',
            help: 'inverse of sine'
        },
        {
            label: 'arctangent degrees of [number:10]', 
            'type': 'number', 
            script: 'rad2deg(Math.atan({{1}}))',
            help: 'inverse of tangent'
        },
        {
            label: 'ceiling of [number:10]', 
            'type': 'number', 
            script: 'Math.ceil({{1}})',
            help: 'rounds up to nearest whole number'
        },
        {
            label: 'cosine of [number:10] degrees', 
            'type': 'number', 
            script: 'Math.cos(deg2rad({{1}}))',
            help: 'ratio of the length of the adjacent side to the length of the hypotenuse'
        },
        {
            label: 'sine of [number:10] degrees', 
            'type': 'number', 
            script: 'Math.sin(deg2rad({{1}}))',
            help: 'ratio of the length of the opposite side to the length of the hypotenuse'
        },
        {
            label: 'tangent of [number:10] degrees', 
            'type': 'number', 
            script: 'Math.tan(deg2rad({{1}}))',
            help: 'ratio of the length of the opposite side to the length of the adjacent side'
        },
        {
            label: '[number:10] to the power of [number:2]', 
            'type': 'number', 
            script: 'Math.pow({{1}}, {{2}})',
            help: 'multiply a number by itself the given number of times'
        },
        {
            label: 'square root of [number:10]', 
            'type': 'number', 
            script: 'Math.sqrt({{1}})',
            help: 'the square root is the same as taking the to the power of 1/2'
        },
        {
            label: 'pi',
            script: 'Math.PI;',
            type: 'number',
            help: "pi is the ratio of a circle's circumference to its diameter"
        },
        {
            label: 'tau',
            script: 'Math.PI * 2',
            type: 'number',
            help: 'tau is 2 times pi, a generally more useful number'
        }
    ]),
    shapes: menu('Shapes', [
        {
            label: 'circle with radius [number:0]', 
            script: 'local.last_var = global.paper.circle(0, 0, {{1}});',
            help: 'draws a circle, you will need to move it into the desired position'
        },
        {
            label: 'rect with width [number:0] and height [number:0]', 
            script: 'local.last_var = global.paper.rect(0, 0, {{1}}, {{2}});',
            help: 'draws a rectangle at the origin'
        },
        {
            label: 'rounded rect with width [number:0] height [number:0] and radius [number:0]', 
            script: 'local.last_var = global.paper.rect(0, 0, {{1}}, {{2}}, {{3}});',
            help: 'draws a rounded rectangle at the origin'
        },
        {
            label: 'ellipse x radius [number:0] y radius [number:0]', 
            script: 'local.last_var = global.paper.ellipse(0, 0, {{1}}, {{2}});',
            help: 'draws an ellipse at the origin'
        },
        {
            label: 'arc at radius [number:100] from [number:0] degrees to [number:30] degrees',
            script: 'local.last_var = global.paper.arcslice({{1}}, {{2}}, {{3}});',
            help: 'draws an arc at the origin'
        },
        {
            label: 'image src: [string:http://waterbearlang.com/images/waterbear.png]', 
            script: 'local.last_var = global.paper.imageWithNaturalHeight({{1}});',
            help: 'draws an image at the origin'
        },
        {
            label: 'name shape: [string:shape1]', 
            script: 'local.last_var_references[{{1}}] = local.last_var;',
            help: 'names the current shape to retrieve later'
        },
        {
            label: 'refer to shape [string:shape1]', 
            script: 'local.last_var = local.last_var_references[{{1}}];',
            help: 'makes a named shape the current shape'
        },
        {
            label: 'with shape [string:shape1] do', 
            containers: 1, 
            script: 'local.oldshape = local.last_var;local.last_var = local.last_var_references[{{1}}];[[1]]local.last_var = local.oldshape;',
            help: 'makes a named shape the current shape for the contained blocks'
        },
        {
            label: 'clip rect x [number:0] y [number:0] width [number:50] height [number:50]', 
            script: 'local.last_var.attr("clip-rect", "{{1}},{{2}},{{3}},{{4}}");',
            help: 'make a clipping rect that cuts off other drawing commands'
        },
        {
            label: 'fill color [color:#FFFFFF]', 
            script: 'local.last_var.attr("fill", {{1}});',
            help: 'change the fill color for the current shape'
        },
        {
            label: 'stroke color [color:#000000]', 
            script: 'local.last_var.attr("stroke", {{1}});',
            help: 'change the stroke color for the current shape'
        },
        {
            label: 'fill transparent', 
            script: 'local.last_var.attr("fill", "transparent");',
            help: 'make the current shape fill transparent'
        },
        {
            label: 'stroke transparent', 
            script: 'local.last_var.attr("stroke", "transparent");',
            help: 'make the current shape stroke transparent'
        },
        {
            label: 'stroke linecap [choice:linecap]', 
            script: 'local.last_var.attr("stroke-linecap", {{1}});',
            help: 'change the linecap style of the current shape'
        },
        {
            label: 'stroke linejoin [choice:linejoin]', 
            script: 'local.last_var.attr("stroke-linejoin", {{1}});',
            help: 'change the linejoin style of the current shape'
        },
        {
            label: 'stroke opacity [number:100]%', 
            script: 'local.last_var.attr("stroke-opacity", {{1}}+"%");',
            help: 'change the opacity of the current shape stroke'
        },
        {
            label: 'stroke width [number:1]', 
            script: 'local.last_var.attr("stroke-width", {{1}});',
            help: 'change the line width of the current shape stroke'
        },
        {
            label: 'rotate [number:5] degrees', 
            script: 'local.last_var.attr("rotate", local.last_var.attr("rotate") + {{1}});',
            help: 'rotate the current shape around its origin by the given amount'
        },
        {
            label: 'rotate [number:5] degrees around x [number:0] y [number:0]', 
            script: 'local.last_var.rotate(angle(local.last_var) + {{1}}, {{2}}, {{3}});',
            help: 'rotate the current shape around an aribtrary point by the given amount'
        },
        {
            label: 'clone', 
            script: 'local.last_var = local.last_var.clone()',
            help: 'create a copy of the current shape, which becomes the new current shape'
        },
        {
            label: 'fill opacity [number:100]%', 
            script: 'local.last_var.attr("fill-opacity", {{1}}+"%")',
            help: 'change the opacity of the current shape fill'
        },
        {
            label: 'link to [string:http://waterbearlang.com]', 
            script: 'local.last_var.attr("href", {{1}})',
            help: 'make the current shape a link to the given URL'
        },
        {
            label: 'text [string:Hello World] at x: [number:0] y: [number:0]', 
            script: 'local.last_var = global.paper.text({{2}}, {{3}}, {{1}});',
            help: 'write the string at the given coordinates'
        },
        {   label: 'font family [string:Helvetica]',
            script: 'local.last_var.attr("font-family", {{1}});',
            help: 'change the font for the current text object',
        },
        {
            label: 'font size [number:12]',
            script: 'local.last_var.attr("font-size", {{1}});',
            help: 'change the font size for the current text object'
        },
        {
            label: 'font weight [choice:fontweight]',
            script: 'local.last_var.attr("font-weight", {{1}});',
            help: 'change the font weight for the current text object'
        }
    ]),
    text: menu('Sketchy', [
        {
            label: 'sketchy rect with width [number:50] and height [number:50]', 
            script: 'local.last_var = global.paper.sk_rect(0,0, {{1}},{{2}});',
            help: 'draw a sketchy rect at the origin'
        },
        {
            label: 'sketchy ellipse with width [number:50] and height [number:50]', 
            script: 'local.last_var = global.paper.sk_ellipse(0,0, {{1}}, {{2}});',
            help: 'draw a sketchy ellipse at the origin'
        },
        {
            label: 'sketchy line from x1 [number:10] y1 [number:10] to x2 [number:40] y2 [number:40]', 
            script: 'local.last_var = global.paper.sk_line({{1}}, {{2}}, {{3}}, {{4}});',
            help: 'draw a sketchy line between two points'
        }
    ]),
    transform: menu('Transform', [
        {
            label: 'clear canvas', 
            script: 'global.paper.clear();',
            help: 'clear the canvas of all drawing'
        },
        {
            label: 'hide', 
            script: 'local.last_var.hide();',
            help: 'hide the current object'
        },
        {
            label: 'show', 
            script: 'local.last_var.show();',
            help: 'show the current object'
        },
        {
            label: 'rotate by [number:0]', 
            script: 'local.last_var.rotate({{1}}, false);',
            help: 'rotate the current object'
        },
        {
            label: 'rotate to [number:0]', 
            script: 'local.last_var.rotate({{1}}, true);',
            help: 'rotate the current object to the given angle around its own center'
        },
        {
            label: 'rotate to [number:0] around x: [number:0] y: [number:0]', 
            script: 'local.last_var.rotate({{1}}, {{2}}, {{3}}, true);',
            help: 'rotate the current object to the given angle around an arbitrary point'
        },
        {
            label: 'translate by x: [number:0] y: [number:0]', 
            script: 'local.last_var.translate({{1}}, {{2}});',
            help: 'move the current object by the given distances'
        },
        {
            label: 'position at x [number:0] y [number:0]', 
            script: 'local.last_var.attr({x: {{1}}, y: {{2}}, cx: {{1}}, cy: {{2}} });',
            help: 'move the current object to the given coordinates'
        },
        {
            label: 'size width [number:100] height [number:100]', 
            script: 'local.last_var.attr({width: {{1}}, height: {{2}} })',
            help: 'change the current object to the given size'
        },
        {
            label: 'scale by [number:0]', 
            script: 'local.last_var.scale({{1}}, {{2}});',
            help: 'resize the current object by the given scale'
        },
        {
            label: 'scaled by [number:0] centered at x: [number:0] y: [number:0]', 
            script: 'local.last_var.scale({{1}}, {{2}}, {{3}}, {{4}});',
            help: 'resize the current object with scaling centered at an arbitrary point'
        },
        {
            label: 'to front', 
            script: 'local.last_var.toFront();',
            help: 'move the current shape to the foreground'
        },
        {
            label: 'to back', 
            script: 'local.last_var.toBack();',
            help: 'move the current shape to the background'
        }
    ]),
    animation: menu('Animation', [
        {
            label: 'position x [number:10] y [number:10] over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({translation: "{{1}}, {{2}}"}, {{3}}, {{4}});',
            help: 'change the position of the current shape over time'
        },
        {
            label: 'opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({opacity: {{1}} }, {{2}}, {{3}});',
            help: 'change the opacity of the current shape over time'
        },
        {
            label: 'fill color [color:#00FF00] over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({fill: {{1}}}, {{2}}, {{3}});',
            help: 'change the fill color of the current shape over time'
        },
        {
            label: 'fill opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({"fill-opacity": {{1}} }, {{2}}, {{3}});',
            help: 'change the fill opacity of the current shape over time'
        },
        {
            label: 'stroke color [color:#FF0000] over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({stroke: {{1}}}, {{2}}, {{3}});',
            help: 'change the stroke color of the current shape over time'
        },
        {
            label: 'stroke opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({"stroke-opacity": {{1}} }, {{2}}, {{3}});',
            help: 'change the stroke opacity of the current shape over time'
        },
        {
            label: 'width [number:10] over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({width: {{1}} }, {{2}}, {{3}});',
            help: 'change the width of the current shape over time'
        },
        {
            label: 'height [number:10] over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({height: {{1}} }, {{2}}, {{3}});',
            help: 'change the height of the current shape over time'
        },
        {
            label: 'radius [number:25] over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({r: {{1}} }, {{2}}, {{3}});',
            help: 'change the radius of the current shape over time'
        },
        {
            label: 'rotation [number:15] degrees over [number:500] ms with [choice:easing]',
            script: 'local.last_var.animate({rotation: {{1}} }, {{2}}, {{3}});',
            help: 'change the rotation of the current shape over time'
        },
        {
            label: 'stop animations',
            script: 'local.last_var.stop()',
            help: 'cancels all animations'
        }
    ]),
        animation: menu('Twitter', [
        {
            label: 'get tweet for [string]',
            containers: 1,
            script: 'local.getTweet({{1}}, function(tweet){local.lastTweet = tweet;[[1]]});',
            help: 'asynchronous call to get the last tweet of the named account'
        },
        {
            label: 'last tweet',
            type: 'string',
            script: '+local.lastTweet+',
            help: 'last tweet which came back from asynch get tweet call'
        }
    ])
};

var demos = [
    {title: 'Rotating Squares',
     description: 'Just a simple animation test',
     scripts: [{"klass":"control","label":"when program runs","script":"function _start(){[[next]]}_start();","containers":0,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"control","label":"repeat [number:10]","script":"range({{1}}).forEach(function(){[[1]]});","containers":1,"sockets":["10"],"contained":[{"klass":"shapes","label":"rect with width [number:0] and height [number:0]","script":"local.last_var = global.paper.rect(0, 0, {{1}}, {{2}});","containers":0,"sockets":["25","25"],"contained":[],"next":{"klass":"transform","label":"position at x [number:0] y [number:0]","script":"local.last_var.attr(\"translation\", \"\"+{{1}} +\",\" + {{2}});","containers":0,"sockets":[{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","sockets":["1",{"klass":"sensing","label":"stage width","script":"global.stage_width","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""},{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","sockets":["1",{"klass":"sensing","label":"stage height","script":"global.stage_height","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"animation","label":"rotation [number:15] degrees over [number:500] ms with [choice:easing]","script":"local.last_var.animate({rotation: {{1}} }, {{2}}, \"{{3}}\");","containers":0,"sockets":["360","5000",">"],"contained":[],"next":""}}}],"next":""}}]},
    {title: 'Solipong',
    description: 'Pong Solitaire, work in progress',
    scripts: [{"klass":"control","label":"when program runs","script":"function _start(){[[next]]}_start();","containers":0,"trigger":true,"sockets":[],"contained":[],"next":{"klass":"shapes","label":"arc at radius [number:100] from [number:0] degrees to [number:30] degrees","script":"local.last_var = global.paper.arcslice({{1}}, {{2}}, {{3}});","containers":0,"sockets":["100","0","30"],"contained":[],"next":{"klass":"shapes","label":"stroke linecap [choice:linecap]","script":"local.last_var.attr(\"stroke-linecap\", \"{{1}}\");","containers":0,"sockets":["round"],"contained":[],"next":{"klass":"shapes","label":"stroke width [number:1]","script":"local.last_var.attr(\"stroke-width\", {{1}});","containers":0,"sockets":["5"],"contained":[],"next":{"klass":"transform","label":"position at x [number:0] y [number:0]","script":"local.last_var.attr(\"translation\", \"\"+{{1}} +\",\" + {{2}});","containers":0,"sockets":[{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":{"klass":"shapes","label":"name shape: [string:shape1]","script":"local.last_var_references[\"{{1}}\"] = local.last_var;","containers":0,"sockets":["paddle"],"contained":[],"next":{"klass":"shapes","label":"circle with radius [number:0]","script":"local.last_var = global.paper.circle(0, 0, {{1}});","containers":0,"sockets":["5"],"contained":[],"next":{"klass":"shapes","label":"fill color [color:#FFFFFF]","script":"local.last_var.attr(\"fill\", \"{{1}}\");","containers":0,"sockets":["#545ca5"],"contained":[],"next":{"klass":"shapes","label":"stroke transparent","script":"local.last_var.attr(\"stroke\", \"transparent\");","containers":0,"sockets":[],"contained":[],"next":{"klass":"transform","label":"position at x [number:0] y [number:0]","script":"local.last_var.attr(\"translation\", \"\"+{{1}} +\",\" + {{2}});","containers":0,"sockets":[{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":{"klass":"shapes","label":"name shape: [string:shape1]","script":"local.last_var_references[\"{{1}}\"] = local.last_var;","containers":0,"sockets":["ball"],"contained":[],"next":""}}}}}}}}}}},{"klass":"control","label":"when [choice:keys] key pressed","script":"$(document).bind(\"keydown\", \"{{1}}\", function(){[[next]]return false;});","containers":0,"trigger":true,"sockets":["right"],"contained":[],"next":{"klass":"shapes","label":"refer to shape [string:shape1]","script":"local.last_var = local.last_var_references[\"{{1}}\"];","containers":0,"sockets":["paddle"],"contained":[],"next":{"klass":"shapes","label":"rotate [number:5] degrees around x [number:0] y [number:0]","script":"local.last_var.rotate(angle(local.last_var) + {{1}}, {{2}}, {{3}});","containers":0,"sockets":["5",{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""}}},{"klass":"control","label":"when [choice:keys] key pressed","script":"$(document).bind(\"keydown\", \"{{1}}\", function(){[[next]]return false;});","containers":0,"trigger":true,"sockets":["left"],"contained":[],"next":{"klass":"shapes","label":"refer to shape [string:shape1]","script":"local.last_var = local.last_var_references[\"{{1}}\"];","containers":0,"sockets":["paddle"],"contained":[],"next":{"klass":"shapes","label":"rotate [number:5] degrees around x [number:0] y [number:0]","script":"local.last_var.rotate(angle(local.last_var) + {{1}}, {{2}}, {{3}});","containers":0,"sockets":["-5",{"klass":"sensing","label":"center x","script":"global.stage_center_x","containers":0,"type":"number","sockets":[],"contained":[],"next":""},{"klass":"sensing","label":"center y","script":"global.stage_center_y","containers":0,"type":"number","sockets":[],"contained":[],"next":""}],"contained":[],"next":""}}}]
    }
];
populate_demos_dialog(demos);
load_current_scripts();
$('.scripts_workspace').trigger('init');
console.log("Done");
}
