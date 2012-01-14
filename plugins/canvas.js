/* 
 *    JAVASCRIPT PLUGIN
 * 
 *    Support for writing Javascript using Waterbear
 *
 */

yepnope({
    load: [ 'plugins/canvas.css',
            'lib/raphael-1.3.1-min.js',
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
      var retval = 'var global = new Global();(function($){var local = new Local();try{local.canvas = $("<canvas width=\\"" + global.stage_width + "\\" height=\\"" + global.stage_height + "\\"></canvas>").appendTo(".stage");local.ctx = local.canvas[0].getContext("2d");' + script + '}catch(e){alert(e);}})(jQuery);';
      console.log(retval);
      return retval;
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

});


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
            script: '(function(){var count = 0; setInterval(function(){count++; local.count = count;[[next]]},1000/{{1}})})();',
            help: 'this trigger will run the attached blocks periodically'
        },
        {
            label: 'count',
            script: 'local.count',
            type: 'number',
            help: 'this block can only be used within a repeat block to get the number of iterations'
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
            script: 'range({{1}}).forEach(function(idx, item){local.idx = idx; local.last_var = item;[[1]]});',
            help: 'repeat the contained blocks so many times'
        },
        {
            label: 'for index in range [number:0]',
            script: 'for (var i = 0; i < {{1}}; i++){ local.idx = i; [[1]]; }',
            containers: 1
        },
        {
            label: 'index',
            script: 'local.idx',
            type: 'number'
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
        },
        {
            label: 'current object',
            script: 'local.last_var',
            type: 'any',
            help: 'use the last object created by another block'
        }
    ], false),
    array: menu('Arrays', [
        {
            label: 'new array',
            script: 'local.last_var = [];',
            help: 'Create an empty array'
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
            label: '[number:0] + [number:0]', 
            'type': 'number', 
            script: "({{1}} + {{2}})",
            help: 'sum of the two operands'
        },
        {
            label: '[number:0] - [number:0]', 
            'type': 'number', 
            script: "({{1}} - {{2}})",
            help: 'difference of the two operands'
        },
        {
            label: '[number:0] * [number:0]', 
            'type': 'number', 
            script: "({{1}} * {{2}})",
            help: 'product of the two operands'
        },
        {
            label: '[number:0] / [number:0]',
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
            label: '[number:0] < [number:0]', 
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
            label: '[number:0] > [number:0]', 
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
    canvas: menu('Canvas', [
        {
            label: 'with local state', 
            containers: 1, 
            script: 'local.ctx.save();[[1]];local.ctx.restore();',
            help: 'save the current state, run the contained steps, then restore the saved state'
        },
        {
            label: 'with path',
            containers: 1,
            script: 'local.ctx.beginPath();[[1]];local.ctx.closePath()',
            help: 'create a path, run the contained steps, close the path'
        },
        {
            label: 'stroke',
            script: 'local.ctx.stroke()',
            help: 'stroke...'
        },
        {
            label: 'fill',
            script: 'local.ctx.fill()',
            help: 'fill...'
        },
        {
            label: 'clear rect x [number:0] y [number:0] width [number:10] height [number:10]', 
            script: 'local.ctx.clearRect({{1}},{{2}},{{3}},{{4}})',
            help: 'clear...'
        },
        {
            label: 'fill rect x [number:0] y [number:0] width [number:10] height [number:10]', 
            script: 'local.ctx.fillRect({{1}},{{2}},{{3}},{{4}})',
            help: 'fill...'
        },
        {
            label: 'stroke rect x [number:0] y [number:0] width [number:10] height [number:10]', 
            script: 'local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}}',
            help: 'stroke...'
        },
        {
            label: 'fill and stroke rect x [number:0] y [number:0] width [number:10] height [number:10]',
            script: 'local.ctx.fillRect({{1}},{{2}},{{3}},{{4}});local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}})',
            help: 'fill and stroke...'
        },
        {
            label: 'move to x [number:0] y [number:0]',
            script: 'local.ctx.moveTo({{1}},{{2}})',
            help: 'move to...'
        },
        {
            label: 'line to x [number:0] y [number:0]',
            script: 'local.ctx.lineTo({{1}},{{2}})',
            help: 'line to...'
        },
        {
            label: 'rect x [number:0] y [number:0] width [number:10] height [number:10]',
            script: 'local.ctx.rect({{1}},{{2}},{{3}},{{4}})',
            help: 'rect...'
        },
        {
            label: 'fill color [color:#000]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'fill color...'
        },
        {
            label: 'stroke color [color:#000]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'stroke color...'
        }
    ]),
    transform: menu('Transform', [
        {
            label: 'scale x [number:1.0] y [number:1.0]', 
            script: 'local.ctx.scale({{1}},{{2}});',
            help: 'change the scale of subsequent drawing'
        },
        {
            label: 'rotate by [number:0] degrees', 
            script: 'local.ctx.rotate(deg2rad({{1}}));',
            help: 'rotate...'
        },
        {
            label: 'translate by x [number:0] y [number:0]', 
            script: 'local.ctx.translate({{1}},{{2}})',
            help: 'translate...'
        }
    ])
};

var demos = [
];
populate_demos_dialog(demos);
load_current_scripts();
$('.scripts_workspace').trigger('init');
console.log("Done");

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});
}
