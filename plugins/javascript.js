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
      return 'var global = new Global();(function($){var stage = $(".stage");global.paper = Raphael(stage.get(0), stage.outerWidth(), stage.outerHeight());var local = new Local();try{' + script + '}catch(e){alert(e);}})(jQuery);';
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
            // console.log('getTweet error %s: %s', textStatus, errorThrown);
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
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'color', 'image', 'shape', 'any'],
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
                    label: 'count',
                    script: 'local.count',
                    type: 'number'
                }
            ],
            script: '(function(){var count = 0; setInterval(function(){count++; local.count = count;[[1]]},1000/{{1}})})();',
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
            slot: false,
            script: 'range({{1}}).forEach(function(idx, item){local.count = idx; local.last_var = item;[[1]]});',
            help: 'repeat the contained blocks so many times',
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
        }
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
            returns: {
                label: 'answer',
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
    shapes: menu('Shapes', [
        {
            label: 'circle## with radius [number:0] at position x [number:0] y [number:0]',
            script: 'local.shape## = global.paper.circle({{2}}, {{3}}, {{1}});',
            returns: {
                label: 'circle##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws a circle'
        },
        {
            label: 'rect## with width [number:0] and height [number:0] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.rect({{3}}, {{4}}, {{1}}, {{2}});',
            returns: {
                label: 'rect##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws a rectangle'
        },
        {
            label: 'rounded rect## with width [number:0] height [number:0] and radius [number:0] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.rect({{4}}, {{5}}, {{1}}, {{2}}, {{3}});',
            returns: {
                label: 'rounded rect##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws a rounded rectangle'
        },
        {
            label: 'ellipse## x radius [number:0] y radius [number:0] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.ellipse({{3}}, {{4}}, {{1}}, {{2}});',
            returns: {
                label: 'ellipse##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws an ellipse'
        },
        {
            label: 'arc## at radius [number:100] from [number:0] degrees to [number:30] degrees centered at x [number:0] y [number:0]',
            script: 'local.shape## = global.paper.arcslice({{1}}, {{2}}, {{3}});',
            returns: {
                label: 'arc##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws an arc around a circle at the given coordinates'
        },
        {
            label: 'image## src: [string:http://waterbearlang.com/images/waterbear.png]', 
            script: 'local.shape## = global.paper.imageWithNaturalHeight({{1}});',
            returns: {
                label: 'image##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draws an image at the origin'
        },
        {
            label: 'clip shape [shape] to rect x [number:0] y [number:0] width [number:50] height [number:50]', 
            script: '{{1}}.last_var.attr("clip-rect", "{{2}},{{3}},{{4}},{{5}}");',
            help: 'make a clipping rect that cuts off other drawing commands'
        },
        {
            label: 'shape [shape] fill color [color:#FFFFFF]', 
            script: '{{1}}.attr("fill", {{2}});',
            help: 'change the fill color for the shape'
        },
        {
            label: 'shape [shape] stroke color [color:#000000]', 
            script: '{{1}}.attr("stroke", {{2}});',
            help: 'change the stroke color for the shape'
        },
        {
            label: 'shape [shape] fill transparent', 
            script: '{{1}}.attr("fill", "transparent");',
            help: 'make the shape fill transparent'
        },
        {
            label: 'shape [shape] stroke transparent', 
            script: '{{1}}.attr("stroke", "transparent");',
            help: 'make the current shape stroke transparent'
        },
        {
            label: 'shape [shape] stroke linecap [choice:linecap]', 
            script: '{{1}}.attr("stroke-linecap", {{2}});',
            help: 'change the linecap style of the current shape'
        },
        {
            label: 'shape [shape] stroke linejoin [choice:linejoin]', 
            script: '{{1}}.attr("stroke-linejoin", {{2}});',
            help: 'change the linejoin style of the shape'
        },
        {
            label: 'shape [shape] stroke opacity [number:100]%', 
            script: '{{1}}.attr("stroke-opacity", {{2}}+"%");',
            help: 'change the opacity of the shape stroke'
        },
        {
            label: 'shape [shape] stroke width [number:1]', 
            script: '{{1}}.attr("stroke-width", {{2}});',
            help: 'change the line width of the shape stroke'
        },
        {
            label: 'shape [shape] rotate [number:5] degrees', 
            script: '{{1}}.rotate({{2}});',
            help: 'rotate the current shape around its origin by the given amount'
        },
        {
            label: 'shape [shape] rotate [number:5] degrees around x [number:0] y [number:0]', 
            script: '{{1}}.rotate({{2}}, {{3}}, {{4}});',
            help: 'rotate the shape around an arbitrary point by the given amount'
        },
        {
            label: 'shape [shape] clone shape##', 
            script: 'local.shape## = {{1}}.clone()',
            returns: {
                label: 'shape##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'create a copy of the shape'
        },
        {
            label: 'shape [shape] fill opacity [number:100]%', 
            script: '{{1}}.attr("fill-opacity", {{2}}+"%")',
            help: 'change the opacity of the shape fill'
        },
        {
            label: 'shape [shape] link to [string:http://waterbearlang.com]', 
            script: '{{1}}.attr("href", {{2}})',
            help: 'make the shape a link to the given URL'
        },
        {
            label: 'text## [string:Hello World] at x: [number:0] y: [number:0]', 
            script: 'local.shape## = global.paper.text({{2}}, {{3}}, {{1}});',
            returns: {
                label: 'text##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'write the string at the given coordinates'
        },
        {   label: 'shape [shape] font family [string:Helvetica]',
            script: '{{1}}.attr("font-family", {{2}});',
            help: 'change the font for the text object',
        },
        {
            label: 'shape [shape] font size [number:12]',
            script: '{{1}}.attr("font-size", {{2}});',
            help: 'change the font size for the text object'
        },
        {
            label: 'shape [shape] font weight [choice:fontweight]',
            script: '{[1}}.attr("font-weight", {{2}});',
            help: 'change the font weight for the text object'
        }
    ]),
    text: menu('Sketchy', [
        {
            label: 'sketchy rect## with width [number:50] and height [number:50] at position x [number:0] y [number:0]', 
            script: 'local.shape## = global.paper.sk_rect({{3}},{{4}}, {{1}},{{2}});',
            returns: {
                label: 'sketchy rect##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draw a sketchy rect'
        },
        {
            label: 'sketchy ellipse## with width [number:50] and height [number:50] at position x [number:0], y [number:0]', 
            script: 'local.shape## = global.paper.sk_ellipse({{3}},{{4}}, {{1}}, {{2}});',
            returns: {
                label: 'sketchy ellipse##',
                script: 'local.shape##',
                type: 'shape'
            },
            help: 'draw a sketchy ellipse'
        },
        {
            label: 'sketchy line## from x1 [number:10] y1 [number:10] to x2 [number:40] y2 [number:40]', 
            script: 'local.shape## = global.paper.sk_line({{1}}, {{2}}, {{3}}, {{4}});',
            returns: {
                label: 'sketchy line##',
                script: 'local.shape##',
                type: 'shape'
            },
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
            label: 'shape [shape] hide', 
            script: '{{1}}.hide();',
            help: 'hide the object'
        },
        {
            label: 'shape [shape] show', 
            script: '{{1}}.show();',
            help: 'show the object'
        },
        {
            label: 'shape [shape] rotate by [number:0] degrees', 
            script: '{{1}}.rotate({{2}}, false);',
            help: 'rotate the object'
        },
        {
            label: 'shape [shape] rotate to [number:0] degrees', 
            script: '{{1}.rotate({{2}}, true);',
            help: 'rotate the object to the given angle around its own center'
        },
        {
            label: 'shape [shape] rotate to [number:0] around x: [number:0] y: [number:0]', 
            script: '{{1}}.rotate({{2}}, {{3}}, {{4}}, true);',
            help: 'rotate the current object to the given angle around an arbitrary point'
        },
        {
            label: 'shape [shape] translate by x: [number:0] y: [number:0]', 
            script: '{{1}}.translate({{2}}, {{3}});',
            help: 'move the object by the given distances'
        },
        {
            label: 'shape [shape] position at x [number:0] y [number:0]', 
            script: '{{1}}.attr({x: {{2}}, y: {{3}}, cx: {{2}}, cy: {{3}} });',
            help: 'move the object to the given coordinates'
        },
        {
            label: 'shape [shape] size width [number:100] height [number:100]', 
            script: '{{1}}.attr({width: {{2}}, height: {{3}} })',
            help: 'change the object to the given size'
        },
        {
            label: 'shape [shape] scale by [number:0]', 
            script: '{{1}}.scale({{2}}, {{3}});',
            help: 'resize the object by the given scale'
        },
        {
            label: 'shape [shape] scaled by [number:0] centered at x: [number:0] y: [number:0]', 
            script: '{{1}}.scale({{2}}, {{3}}, {{4}}, {{5}});',
            help: 'resize the object with scaling centered at an arbitrary point'
        },
        {
            label: 'shape [shape] to front', 
            script: '{{1}}.toFront();',
            help: 'move the shape to the foreground'
        },
        {
            label: 'shape [shape] to back', 
            script: '{{1}}.toBack();',
            help: 'move the shape to the background'
        }
    ]),
    animation: menu('Animation', [
        {
            label: 'shape [shape] position x [number:10] y [number:10] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({translation: "{{2}}, {{3}}"}, {{4}}, {{5}});',
            help: 'change the position of the shape over time'
        },
        {
            label: 'shape [shape] opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({opacity: {{2}} }, {{3}}, {{4}});',
            help: 'change the opacity of the current shape over time'
        },
        {
            label: 'shape [shape] fill color [color:#00FF00] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({fill: {{2}}}, {{3}}, {{4}});',
            help: 'change the fill color of the shape over time'
        },
        {
            label: 'shape [shape] fill opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({"fill-opacity": {{2}} }, {{3}}, {{4}});',
            help: 'change the fill opacity of the shape over time'
        },
        {
            label: 'shape [shape] stroke color [color:#FF0000] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({stroke: {{2}}}, {{3}}, {{4}});',
            help: 'change the stroke color of the shape over time'
        },
        {
            label: 'shape [shape] stroke opacity [number:50]% over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({"stroke-opacity": {{2}} }, {{3}}, {{4}});',
            help: 'change the stroke opacity of the shape over time'
        },
        {
            label: 'shape [shape] width [number:10] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({width: {{2}} }, {{3}}, {{4}});',
            help: 'change the width of the shape over time'
        },
        {
            label: 'shape [shape] height [number:10] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({height: {{2}} }, {{3}}, {{4}});',
            help: 'change the height of the shape over time'
        },
        {
            label: 'shape [shape] radius [number:25] over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({r: {{2}} }, {{3}}, {{4}});',
            help: 'change the radius of the shape over time'
        },
        {
            label: 'shape [shape] rotation [number:15] degrees over [number:500] ms with [choice:easing]',
            script: '{{1}}.animate({rotation: {{2}} }, {{3}}, {{4}});',
            help: 'change the rotation of the shape over time'
        },
        {
            label: 'shape [shape] stop animations',
            script: '{{1}}.stop()',
            help: 'cancels all animations'
        }
    ]),
        animation: menu('Twitter', [
        {
            label: 'get tweet for [string]',
            containers: 1,
            script: 'local.getTweet({{1}}, function(tweet){local.tweet## = tweet;[[1]]});',
            returns: {
                label: 'last tweet##',
                script: 'local.tweet## || "waiting…"',
                type: 'string'
            },
            help: 'asynchronous call to get the last tweet of the named account'
        }
    ])
};

var demos = [
    {title: 'Rotating Squares',
     description: 'Just a simple animation test',
     scripts: [{"klass":"control","label":"when program runs","script":"function _start(){[[1]]}_start();","containers":1,"trigger":true,"locals":[],"sockets":[],"contained":[{"klass":"control","label":"repeat [number:10]","script":"range({{1}}).forEach(function(idx, item){local.count = idx; local.last_var = item;[[1]]});","containers":1,"locals":[{"label":"loop index","script":"local.index","type":"number","klass":"control"}],"sockets":["10"],"contained":[{"klass":"shapes","label":"rect_1 with width [number:0] and height [number:0] at position x [number:0] y [number:0]","script":"local.shape_1 = global.paper.rect({{3}}, {{4}}, {{1}}, {{2}});","containers":0,"locals":[],"returns":{"label":"rect_1","script":"local.shape_1","type":"shape","klass":"shapes"},"sockets":["40","40",{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","locals":[],"sockets":["1",{"klass":"sensing","label":"stage width","script":"global.stage_width","containers":0,"type":"number","locals":[],"sockets":[],"contained":[],"next":""}],"contained":[],"next":""},{"klass":"operators","label":"pick random [number:1] to [number:10]","script":"randint({{1}}, {{2}})","containers":0,"type":"number","locals":[],"sockets":["1",{"klass":"sensing","label":"stage height","script":"global.stage_height","containers":0,"type":"number","locals":[],"sockets":[],"contained":[],"next":""}],"contained":[],"next":""}],"contained":[],"next":{"klass":"animation","label":"shape [shape] rotation [number:15] degrees over [number:500] ms with [choice:easing]","script":"{{1}}.animate({rotation: {{2}} }, {{3}}, {{4}});","containers":0,"locals":[],"sockets":[{"klass":"shapes","label":"rect_1","script":"local.shape_1","containers":0,"type":"shape","locals":[],"sockets":[],"contained":[],"next":""},"360","2000",">"],"contained":[],"next":""}}],"next":""}],"next":""}]}    
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
