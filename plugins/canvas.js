/* 
 *    JAVASCRIPT PLUGIN
 * 
 *    Support for writing Javascript using Waterbear
 *
 */


// Pre-load dependencies
yepnope({
    load: [ 'plugins/canvas.css',
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
              //console.log('before: %s', script);
              script = script.replace(/\{\{\d\}\}/g, exprf);
              //console.log('after: %s', script);
          }
          if (blks.length){
              function blksf(match, offset, s){
                  var idx = parseInt(match.slice(2,-2), 10) - 1;
                  return blks[idx];
              }
              // console.log('child before: %s', script);
              script = script.replace(/\[\[\d\]\]/g, blksf);
              // console.log('child after: %s', script);   
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
      //console.log(retval);
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
    console.log('Add a non-Raphael color picker');
}
//$('.workspace:visible .scripts_workspace').delegate('input[type=color]', 'click', showColorPicker);
$(document).ready(function(){
//     window.cw = Raphael.colorwheel($('#color_contents')[0], 300, 180);
});


window.update_scripts_view = function(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    //console.log('found %s scripts to view', blocks.length);
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
    unit: ['px', 'em', '%', 'pt'],
    align: ['start', 'end', 'left', 'right', 'center'],
    baseline: ['alphabetic', 'top', 'hanging', 'middle', 'ideographic', 'bottom'],
    linecap: ['round', 'butt', 'square'],
    linejoin: ['round', 'bevel', 'mitre'],
    arity: ['0', '1', '2', '3', 'array', 'object'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function','color', 'image', 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'color', 'image', 'shape', 'point', 'size', 'rect', 'image', 'gradient', 'pattern', 'imagedata','any'],
    easing: ['>', '<', '<>', 'backIn', 'backOut', 'bounce', 'elastic'],
    fontweight: ['normal', 'bold', 'inherit'],
    globalCompositeOperators: ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-atop', 'destination-in', 'destination-out', 'destination-over', 'lighter', 'copy', 'xor'],
    repetition: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']
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
            slot: false,
            containers: 1,
            script: 'function _start(){[[1]]}_start();',
            help: 'this trigger will run its scripts once when the program starts'
        },
        {
            label: 'when [choice:keys] key pressed', 
            trigger: true,
            slot: false,
            containers: 1,
            script: '$(document).bind("keydown", {{1}}, function(){[[1]]; return false;});',
            help: 'this trigger will run the attached blocks every time this key is pressed'
        },
        {
            label: 'repeat [number:30] times a second',
            trigger: true,
            slot: false,
            containers: 1,
            locals: [
                {
                    label: 'count##',
                    script: 'local.count##',
                    type: 'number'
                }
            ],
            script: '(function(){var count## = 0; setInterval(function(){count##++; local.count## = count##;[[1]]},1000/{{1}})})();',
            help: 'this trigger will run the attached blocks periodically'
        },
        {
            label: 'wait [number:1] secs',
            containers: 1,
            script: 'setTimeout(function(){[[1]]},1000*{{1}});',
            help: 'pause before running the following blocks'
        },
        {
            label: 'repeat [number:10]', 
            containers: 1, 
            script: 'for (local.index## = 0; local.index## < {{1}}; local.index##++){[[1]]};',
            help: 'repeat the contained blocks so many times',
            locals: [
                {
                    label: 'loop index##',
                    script: 'local.index##',
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
            slot: false,
            containers: 1,
            script: '$(".stage").bind({{1}}, function(){[[1]]});',
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
            label: 'variable string## [string]',
            script: 'local.string## = {{1}};',
            returns: {
                label: 'string##',
                script: 'local.string##',
                type: 'string'
            },
            help: 'create a reference to re-use the string'
        },
        {
            label: 'variable number## [number]',
            script: 'local.number## = {{1}};',
            returns: {
                label: 'number##',
                script: 'local.number##',
                type: 'number'
            },
            help: 'create a reference to re-use the number'
        },
        {
            label: 'variable boolean## [boolean]',
            script: 'local.boolean## = {{1}};',
            returns: {
                label: 'boolean##',
                script: 'local.boolean##',
                type: 'boolean'
            },
            help: 'create a reference to re-use the boolean'
        },
        {
            label: 'variable array## [array]',
            script: 'local.array## = {{1}};',
            returns: {
                label: 'array##',
                script: 'local.array## = {{1}}',
                type: 'array'
            },
            help: 'create a reference to re-use the array'
        },
        {
            label: 'variable object## [object]',
            script: 'local.object## = {{1}};',
            returns: {
                label: 'object##',
                script: 'local.object##',
                type: 'object'
            },
            help: 'create a reference to re-use the object'
        },
        {
            label: 'variable color## [color]',
            script: 'local.color## = {{1}};',
            returns: {
                label: 'color##',
                script: 'local.color##',
                type: 'color'
            },
            help: 'create a reference to re-use the color'
        },
        {
            label: 'variable image## [image]',
            script: 'local.image## = {{1}};',
            returns: {
                label: 'image##',
                script: 'local.image##',
                type: 'image'
            },
            help: 'create a reference to re-use the image'
        },
        // 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata', 'any'
        {
            label: 'variable shape## [shape]',
            script: 'local.shape## = {{1}};',
            returns: {
                label: 'shape##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'create a reference to re-use the shape'
        },
        {
            label: 'variable point## [point]',
            script: 'local.point## = {{1}};',
            returns: {
                label: 'point##',
                script: 'local.point##',
                type: 'point'
            },
            help: 'create a reference to re-use the point'
        },
        {
            label: 'variable size## [size]',
            script: 'local.size## = {{1}};',
            returns: {
                label: 'size##',
                script: 'local.size##',
                type: 'size'
            },
            help: 'create a reference to re-use the size'
        },
        {
            label: 'variable rect## [rect]',
            script: 'local.rect## = {{1}};',
            returns: {
                label: 'rect##',
                script: 'local.rect##',
                type: 'rect'
            },
            help: 'create a reference to re-use the rect'
        },
        {
            label: 'variable gradient## [gradient]',
            script: 'local.gradient## = {{1}};',
            returns: {
                label: 'gradient##',
                script: 'local.gradient##',
                type: 'gradient'
            },
            help: 'create a reference to re-use the gradient'
        },
        {
            label: 'variable pattern## [pattern]',
            script: 'local.pattern## = {{1}};',
            returns: {
                label: 'pattern##',
                script: 'local.pattern##',
                type: 'pattern'
            },
            help: 'create a reference to re-use the pattern'
        },
        {
            label: 'variable imagedata## [imagedata]',
            script: 'local.imagedata## = {{1}};',
            returns: {
                label: 'imagedata##',
                script: 'local.imagedata##',
                type: 'imagedata'
            },
            help: 'create a reference to re-use the imagedata'
        },
        {
            label: 'variable any## [any]',
            script: 'local.any## = {{1}};',
            returns: {
                label: 'any##',
                script: 'local.any##',
                type: 'any'
            },
            help: 'create a reference to re-use the any'
        },
    ], true),
    array: menu('Arrays', [
        {
            label: 'new array##',
            script: 'local.array## = [];',
            help: 'Create an empty array',
            returns: {
                label: 'array##',
                script: 'local.array##',
                type: 'array'
            }
        },
        {
            label: 'new array with array## [array]',
            script: 'local.array## = {{1}}.slice();',
            help: 'create a new array with the contents of another array',
            returns: {
                label: 'array##',
                script: 'local.array##',
                type: 'array'
            }
        },
        {
            label: 'array [array] item [number:0]',
            script: '{{1}}[{{2}}]',
            type: 'any',
            help: 'get an item from an index in the array'
        },
        {
            label: 'array [array] join with [string:, ]',
            script: '{{1}}.join({{2}})',
            type: 'string',
            help: 'join items of an array into a string, each item separated by given string'
        },
        {
            label: 'array [array] append [any]',
            script: '{{1}}.push({{2}});',
            help: 'add any object to an array'
        },
        {
            label: 'array [array] length',
            script: '{{1}}.length',
            type: 'number',
            help: 'get the length of an array'
        },
        {
            label: 'array [array] remove item [number:0]',
            script: '{{1}}.splice({{2}}, 1)[0]',
            type: 'any',
            help: 'remove item at index from an array'
        },
        {
            label: 'array [array] pop',
            script: '{{1}}.pop()',
            type: 'any',
            help: 'remove and return the last item from an array'
        },
        {
            label: 'array [array] shift',
            script: '{{1}}.shift()',
            type: 'any',
            help: 'remove and return the first item from an array'
        },
        {   
            label: 'array [array] reversed',
            script: '{{1}}.slice().reverse()',
            type: 'array',
            help: 'reverse a copy of array'
        },
        {
            label: 'array [array] concat [array]',
            script: '{{1}}.concat({{2}});',
            type: 'array',
            help: 'a new array formed by joining the arrays'
        },
        {
            label: 'array [array] for each',
            script: '$.each({{1}}, function(idx, item){local.index = idx; local.item = item; [[1]] });',
            containers: 1,
            locals: [
                {
                    label: 'index',
                    script: 'local.index',
                    help: 'index of current item in array',
                    type: 'number'
                },
                {
                    label: 'item',
                    script: 'local.item',
                    help: 'the current item in the iteration',
                    type: 'any'
                }
            ],
            help: 'run the blocks with each item of a named array'
        }
    ], false),
    objects: menu('Objects', [
        {
            label: 'new object##',
            script: 'local.object## = {};',
            returns: {
                label: 'object##',
                script: 'local.object##',
                type: 'object'
            },
            help: 'create a new, empty object'
        },
        {
            label: 'object [object] key [string] = value [any]',
            script: '{{1}}[{{2}}] = {{3}};',
            help: 'set the key/value of an object'
        },
        {
            label: 'object [object] value at key [string]',
            script: '{{1}}[{{2}}]',
            type: 'any',
            help: 'return the value of the key in an object'
        },
        {
            label: 'object [object] for each',
            script: '$.each({{1}}, function(key, item){local.key = key; local.item = item; [[1]] });',
            containers: 1,
            locals: [
                {
                    label: 'key',
                    script: 'local.key',
                    help: 'key of current item in object',
                    type: 'string'
                },
                {
                    label: 'item',
                    script: 'local.item',
                    help: 'the current item in the iteration',
                    type: 'any'
                }
            ],
            help: 'run the blocks with each item of a named array'
            
        }
    ], false),
    strings: menu('Strings', [
        {
            label: 'string [string] split on [string]',
            script: '{{1}}.split({{2}})',
            type: 'array',
            help: 'create an array by splitting the named string on the given string'
        },
        {
            label: 'string [string] character at [number:0]',
            script: '{{1}}[{{2}}]',
            type: 'string',
            help: 'get the single character string at the given index of named string'
        },
        {
            label: 'string [string] length',
            script: '{{1}}.length',
            type: 'number',
            help: 'get the length of named string'
        },
        {
            label: 'string [string] indexOf [string]',
            script: '{{1}}.indexOf({{2}})',
            type: 'number',
            help: 'get the index of the substring within the named string'
        },
        {
            label: 'string [string] replace [string] with [string]',
            script: '{{1}}.replace({{2}}, {{3}})',
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
            script: 'window.alert({{1}});',
            help: 'pop up an alert window with string'
        },
        {
            label: 'console log [any]',
            script: 'console.log({{1}});',
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
            script: 'local.answer## = prompt({{1}});',
            returns: {
                label: 'answer##',
                type: 'string',
                script: 'local.answer'
            },
            help: 'Prompt the user for information'
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
            script: 'global.timer.reset();',
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
            label: 'stroke',
            script: 'local.ctx.stroke();',
            help: 'stroke...'
        },
        {
            label: 'fill',
            script: 'local.ctx.fill();',
            help: 'fill...'
        },
        {
            label: 'clear rect [rect]', 
            script: 'local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'clear...'
        },
        {
            label: 'fill circle at point [point] with radius [number:10]',
            script: 'local.ctx.beginPath();local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);local.ctx.closePath();ctx.fill();',
            help: 'circle...'
        },
        {
            label: 'stroke circle at point [point] with radius [number:10]',
            script: 'local.ctx.beginPath();local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);local.ctx.closePath();ctx.stroke();',
            help: 'circle...'
        },
        {
            label: 'stroke and fill circle at point [point] with radius [number:10]',
            script: 'local.ctx.beginPath();local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);local.ctx.closePath();ctx.fill();ctx.stroke()',
            help: 'circle...'
        },
        {
            label: 'fill rect [rect]', 
            script: 'local.ctx.fillRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'fill...'
        },
        {
            label: 'stroke rect [rect]', 
            script: 'local.ctx.strokeRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'stroke...'
        },
        {
            label: 'fill and stroke rect x [number:0] y [number:0] width [number:10] height [number:10]',
            script: 'local.ctx.fillRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);local.ctx.strokeRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'fill and stroke...'
        },
        // Path API
        {
            label: 'with path',
            containers: 1,
            script: 'local.ctx.beginPath();[[1]];local.ctx.closePath();',
            help: 'create a path, run the contained steps, close the path'
        },
        {
            label: 'move to point [point]',
            script: 'local.ctx.moveTo({{1}}.x,{{1}}.y);',
            help: 'move to...'
        },
        {
            label: 'line to point [point]',
            script: 'local.ctx.lineTo({{1}}.x,{{1}}.y);',
            help: 'line to...'
        },
        {
            label: 'quadraditic curve to point [point] with control point [point]',
            script: 'local.ctx.quadraticCurveTo({{2}}.x, {{2}}.y, {{1}}.x, {{1}}.y);',
            help: 'quad curve to ...'
        },
        {
            label: 'bezier curve to point [point] with control points [point] and [point]',
            script: 'local.ctx.bezierCurveTo({{2}}.x,{{2}}.y,{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y);',
            help: 'bezier curve to...'
        },
        {
            label: 'arc to point1 [point] point1 [point] with radius [number:1.0]',
            script: 'local.ctx.arcTo({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y,{{3}});',
            help: 'I wish I understood this well enough to explain it better'
        },
        {
            label: 'arc with origin [point] radius [number:1] start angle [number:0] deg, end angle [number:45] deg [boolean:true]',
            script: 'local.ctx.arc({{1}}.x,{{1}}.y,{{2}},deg2rad({{3}}),deg2rad({{4}}),{{5}});',
            help: 'arc...'  
        },
        {
            label: 'rect [rect]',
            script: 'local.ctx.rect({{1}},{{1}},{{1}},{{1}});',
            help: 'rect...'
        },
        {
            label: 'circle at point [point] with radius [number:10]',
            script: 'local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);',
            help: 'circle...'
        },
        {
            label: 'clip',
            script: 'local.ctx.clip();',
            help: 'adds current path to the clip area'
        },
        {
            label: 'is point [point] in path?',
            script: 'local.ctx.isPointInPath({{1}}.x,{{1}}.y)',
            type: 'boolean',
            help: 'test a point against the current path'
        },
        // Colour and Styles
        {
            label: 'stroke color [color:#000]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'stroke color...'
        },
        {
            label: 'fill color [color:#000]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'fill color...'
        },
        {
            label: 'stroke gradient [gradient]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'replaces stroke color or stroke pattern with gradient'
        },
        {
            label: 'fill gradient [gradient]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'replaces fill color or fill pattern with gradient'
        },
        {
            label: 'stroke pattern [pattern]',
            script: 'local.ctx.strokeStyle = {{1}};',
            help: 'replaces stroke color or stroke gradient with pattern'
        },
        {
            label: 'fill pattern [pattern]',
            script: 'local.ctx.fillStyle = {{1}};',
            help: 'replaces fill color or fill gradient with pattern'
        },
        {
            label: 'create radial gradient from point1 [point] radius1 [number:0] to point2 [point] radius2 [number:0]',
            script: 'local.gradient## = local.ctx.createRadialGradient({{1}}.x,{{1}}.y,{{2}},{{3}}.x,{{3}}.y,{{4}});',
            help: 'create a radial gradient in the cone described by two circles',
            returns: {
                label: 'radial gradient##',
                script: 'local.gradient##',
                type: 'gradient'
            }
        },
        {
            label: 'create linear gradient from point1 [point] to point2 [point]',
            script: 'local.gradient## = local.ctx.createLinearGradient({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y);',
            help: 'create a linear gradient between two points',
            returns: {
                label: 'linear gradient##',
                script: 'local.linear.gradient##',
                type: 'gradient'
            }
        },
        {
            label: 'add color stop to gradient [gradient] at offset [number:0.5] with color [color:#F00]',
            script: '{{1}}.addColorStop({{2}}, {{3}}',
            help: 'creates an additional color stop, offset must be between 0.0 and 1.0',
        },
        {
            label: 'create pattern## from image [image] repeats [choice:repetition]',
            script: 'local.pattern## = local.ctx.createPattern({{1}}, {{2}});',
            help: 'create a pattern with the given html image',
            returns: {
                label: 'pattern##',
                script: 'local.pattern##',
                type: 'pattern'
            }
        },
//         {
//             label: 'create pattern## from canvas [canvas] repeats [choice:repetition]',
//             script: 'local.pattern## = local.ctx.createPattern({{1}}, {{2}});',
//             help: 'create a pattern with the given html canvas',
//             returns: {
//                 label: 'pattern##',
//                 script: 'local.pattern##',
//                 type: 'pattern'
//             }
//         },
//         {
//             label: 'create pattern## from video [video] repeats [choice:repetition]',
//             script: 'local.pattern## = local.ctx.createPattern({{1}}, {{2}});',
//             help: 'create a pattern with the given html video',
//             returns: {
//                 label: 'pattern##',
//                 script: 'local.pattern##',
//                 type: 'pattern'
//             }
//         },
        // Text
        {
            label: 'font [number:10] [choice:unit] [string:sans-serif]',
            script: 'local.ctx.font = {{1}}+{{2}}+" "+{{3}};',
            help: 'set the current font'
        },
        {
            label: 'text align [choice:align]',
            script: 'local.ctx.textAlign = {{1}};',
            help: 'how should the text align?'
        },
        {
            label: 'text baseline [choice:baseline]',
            script: 'local.ctx.textBaseline = {{1}};',
            help: 'set the text baseline'
        },
        {
            label: 'fill text [string] x [number:0] y [number:0]',
            script: 'local.ctx.fillText({{1}},{{2}},{{3}});',
            help: 'basic text operation'
        },
        {
            label: 'fill text [string] x [number:0] y [number:0] max width [number:10]',
            script: 'local.ctx.fillText({{1}},{{2}},{{3}},{{4}});',
            help: 'basic text operation with optional max width'
        },
        {
            label: 'stroke text [string] x [number:0] y [number:0]',
            script: 'local.ctx.strokeText({{1}},{{2}},{{3}});',
            help: 'outline the text'
        },
        {
            label: 'stroke text [string] x [number:0] y [number:0] max width [number:10]',
            script: 'local.ctx.strokeText({{1}},{{2}},{{3}},{{4}});',
            help: 'outline the text with optional max width'
        },
        {
            label: 'text [string] width',
            script: 'local.ctx.measureText({{1}}).width',
            type: 'number'
        },
        // Drawing Images
        {
            label: 'draw image [image] at point [point]',
            script: 'local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y',
            help: 'draw the HTML &lt;img&gt; into the canvas without resizing'
        },
        {
            label: 'draw image [image] in rect [rect]',
            script: 'local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y,{{2}}.w,{{2}}.h);',
            help: 'draw the HTML &lt;img&gt; into the canvas sized to the given dimension'
        },
        {
            label: 'draw a rect [rect] from image [image] to rect [rect]',
            script: 'local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);',
            help: 'draw a rect extracted from image into a rect specified on the canvas'
        },
//         {
//             label: 'draw canvas [canvas] x [number:0] y [number:0]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}}',
//             help: 'draw the HTML &lt;canvas&gt; into the canvas without resizing'
//         },
//         {
//             label: 'draw canvas [canvas] x [number:0] y [number:0] width [number:10] height [number:10]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}},{{4}},{{5}});',
//             help: 'draw the HTML &lt;canvas&gt; into the canvas sized to the given dimension'
//         },
//         {
//             label: 'draw a rect [rect] from canvas [canvas] to rect [rect]',
//             script: 'local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);',
//             help: 'draw a rect extracted from canvas into a rect specified on the canvas'
//         },
//         {
//             label: 'draw video [video] x [number:0] y [number:0]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}}',
//             help: 'draw the HTML &lt;video&gt; into the canvas without resizing'
//         },
//         {
//             label: 'draw video [video] x [number:0] y [number:0] width [number:10] height [number:10]',
//             script: 'local.ctx.drawImage({{1}},{{2}},{{3}},{{4}},{{5}});',
//             help: 'draw the HTML &lt;video&gt; into the canvas sized to the given dimension'
//         },
//         {
//             label: 'draw a rect [rect] from video [video] to rect [rect]',
//             script: 'local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);',
//             help: 'draw a rect extracted from video into a rect specified on the canvas'
//         },
        // Pixel Manipulation
        {
            label: 'create ImageData## with size [size]',
            script: 'local.imageData## = local.ctx.createImageData({{1}}.w,{{1}}.h);',
            returns: {
                label: 'imageData##',
                script: 'local.imageData##',
                type: 'imagedata'
            },
            help: 'initialize a new imageData with the specified dimensions'
        },
        {
            label: 'createImageData## from imageData [imageData]',
            script: 'local.imageData## = local.ctx.createImageData({{1}});',
            returns: {
                label: 'imageData##',
                script: 'local.imageData##',
                type: 'imagedata'
            },
            help: 'initialized a new imageData the same size as an existing imageData'
        },
        {
            label: 'get imageData## for rect [rect]',
            script: 'local.imageData## = local.ctx.getImageData({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            returns: {
                label: 'imageData##',
                script: 'local.imageData##',
                type: 'imagedata'
            },
            help: 'returns the image data from the specified rectangle'
        },
        {
            label: 'draw imageData [imagedata] at point [point]',
            script: 'local.ctx.putImageData({{1}},{{2}}.x,{{2}}.y);',
            help: 'draw the given image data into the canvas at the given coordinates'
        },
        {
            label: 'draw a rect [rect] from imageData [imagedata] at point [point]',
            script: 'local.ctx.putImageData({{2}},{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);',
            help: 'draw the given image data into the canvas from the given rect to the given position'
        },
        {
            label: 'imageData [imagedata] width',
            script: '{{1}}.width',
            type: 'number'
        },
        {
            label: 'imageData [imagedata] height',
            script: '{{1}}.height',
            type: 'number'
        },
        {
            label: 'imageData [imagedata] as array',
            script: '{{1}}.data',
            type: 'array'
        },
        // Compositing
        {
            label: 'global alpha [number:1.0]',
            script: 'local.ctx.globalAlpha = {{1}};',
            help: 'set the global alpha'
        },
        {
            label: 'global composite operator [choice:globalCompositeOperators]',
            script: 'local.ctx.globalCompositOperator = {{1}};',
            help: 'set the global composite operator'
        },
        // Transforms
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
            script: 'local.ctx.translate({{1}},{{2}});',
            help: 'translate...'
        },
        {
            label: 'transform by 6-matrix [array]',
            script: 'if ({{1}}.length !== 6){alert("Array must have 6 numbers"); return false;}local.ctx.transform.apply(local.ctx, {{1}});',
            help: 'transform by an arbitrary matrix [a,b,c,d,e,f]'
        },
        {
            label: 'set transform to 6-matrix [array]',
            script: 'if ({{1}}.length !== 6){alert("Array must have 6 numbers"); return false;}local.ctx.setTransform.apply(local.ctx, {{1}});',
            help: 'set transform to an arbitrary array [a,b,c,d,e,f]'
        },
        // Line caps/joins
        
        {
            label: 'line width [number:1]',
            script: 'local.ctx.lineWidth = {{1}};',
            help: 'set line width'
        },
        {
            label: 'line cap [choice:linecap]',
            script: 'local.ctx.lineCap = {{1}};',
            help: 'set line cap'
        },
        {
            label: 'line join [choice:linejoin]',
            script: 'local.ctx.lineJoin = {{1}};',
            help: 'set line join'
        },
        {
            label: 'mitre limit [number:10]',
            script: 'local.ctx.mitreLimit = {{1}};',
            help: 'set mitre limit'
        },
        // Shadows
        {
            label: 'shadow offset x [number:0] y [number:0]',
            script: 'local.ctx.shadowOffsetX = {{1}}; local.ctx.shadowOffsetY = {{2}}',
            help: 'set the offsets for shadow'
        },
        {
            label: 'shadow blur [number:0]',
            script: 'local.ctx.shadowBlur = {{1}}',
            help: 'set the shadow blur radius'
        },
        {
            label: 'shadow color [color]',
            script: 'local.ctx.shadowColor = {{1}}',
            help: 'set the shadow color'
        },
    ]),
    point: menu('Point', [
        {
            label: 'point at x [number:0] y [number:0]',
            script: '{x: {{1}}, y: {{2}}',
            type: 'point'
        },
        {
            label: 'point from array [array]',
            script: '{x: {{1}}[0], y: {{1}}[1]}',
            type: 'point'
        },
        {
            label: 'point [point] x',
            script: '{{1}}.x',
            type: 'number'
        },
        {
            label: 'point [point] y',
            script: '{{1}}.y',
            type: 'number'
        },
        {
            label: 'point [point] as array',
            script: '[{{1}}.x, {{1}}.y]',
            type: 'array'
        },
    ]),
    size: menu('Size', [
        {
            label: 'size with width [number:10] height [number:10]',
            script: '{w: {{1}}, h: {{1}}',
            type: 'size'
        },
        {
            label: 'size from array [array]',
            script: '{w: {{1}}[0], h: {{1}}[1]',
            type: 'size'
        },
        {
            label: 'size [size] width',
            script: '{{1}}.w',
            type: 'number'
        },
        {
            label: 'size [size] height',
            script: '{{1}}.h',
            type: 'number'
        },
        {
            label: 'size [size] as array',
            script: '[{{1}}.w, {{1}}.h]',
            type: 'array'
        },
    ]),
    rect: menu('Rect', [
        {
            label: 'rect at x [number:0] y [number:0] with width [number:10] height [number:10]',
            script: '{x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}} }',
            type: 'rect'
        },
        {
            label: 'rect at point [point] with size [size]',
            script: '{x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h}',
            type: 'rect'
        },
        {
            label: 'rect from array [array]',
            script: '{x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] };',
            type: 'rect'
        },
        {
            label: 'rect [rect] position',
            script: '{x: {{1}}.x, y: {{1}}.y}',
            type: 'point'
        },
        {
            label: 'rect [rect] size',
            script: '{w: {{1}}.w, h: {{1}}.h}',
            type: 'size'
        },
        {
            label: 'rect [rect] as array',
            script: '[{{1}}.x, {{1}}.y, {{1}}.w, {{1}}.h]',
            type: 'array'
        },
        {
            label: 'rect [rect] x',
            script: '{{1}}.x',
            type: 'number'
        },
        {
            label: 'rect [rect] y',
            script: '{{1}}.y',
            type: 'number'
        },
        {
            label: 'rect [rect] width',
            script: '{{1}}.w',
            type: 'number'
        },
        {
            label: 'rect [rect] height',
            script: '{{1}}.h',
            type: 'number'
        },
    ]),
    image: menu('Image', [
        // TODO: Change this to a container : when loaded, that fires on image load
        {
            label: 'image from url [string]',
            script: '(function(){var img = new Image(); img.src="{{1}}";return img;})()',
            type: 'image'
        },
        {
            label: 'image [image] width',
            script: '{{1}}.width',
            type: 'number'
        },
        {
            label: 'image [image] height',
            script: '{{1}}.height',
            type: 'number'
        },
        {
            label: 'image [image] url',
            script: '{{1}}.width',
            type: 'string'
        }
    ])
};

var demos = [
];
populate_demos_dialog(demos);
load_current_scripts();
$('.scripts_workspace').trigger('init');
$('#block_menu').accordion({ autoHeight: false });
console.log("Done");

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});
}
