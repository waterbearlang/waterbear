/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */

(function(){


// Pre-load dependencies
yepnope({
    load: [ 'plugins/javascript.css',
            'lib/beautify.js',
            'lib/highlight.js',
            'lib/highlight-javascript.js',
            'lib/highlight-github.css'
    ]
});

// Add some utilities
jQuery.fn.extend({
    prettyScript: function(){
        return js_beautify(this.map(function(){
            return $(this).extract_script();
        }).get().join(''));
    },
    writeScript: function(view){
      view.html('<pre class="language-javascript">' + this.prettyScript() + '</pre>');
      hljs.highlightBlock(view.children()[0]);
    }
});

// End UI section

// expose these globally so the Block/Label methods can find them
window.choiceLists = {
    keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
    blocktypes: ['step', 'expression', 'context', 'eventhandler'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
};

// Hints for building blocks
//
//
// Expression blocks can nest, so don't end their scripts with semi-colons (i.e., if there is a "type" specified).
//
//

// MENUS

// Special menus used at runtime

wb.menu('Globals', []);
// Temporarily disable these until I can get time to implement them properly
// wb.menu('Recent Blocks', []);
// wb.menu('Favourite Blocks', []);

// Javascript core blocks

wb.menu('Control', [
    {
        blocktype: 'eventhandler',
        labels: ['when program runs'],
        script: 'function _start(){[[1]]}_start();',
        help: 'this trigger will run its scripts once when the program starts'
    },
    {
        blocktype: 'eventhandler',
        labels: ['when [choice:keys] key pressed'],
        script: '$(document).bind("keydown", {{1}}, function(){[[1]]; return false;});',
        help: 'this trigger will run the attached blocks every time this key is pressed'
    },
    {
        blocktype: 'eventhandler',
        labels: ['repeat [number:30] times a second'],
        locals: [
            {
                blocktype: 'expression',
                labels: ['count##'],
                script: 'local.count##',
                type: 'number'
            }
        ],
        script: 'local.count##=0;(function(){setInterval(function(){local.count##++;[[1]]},1000/{{1}})})();',
        help: 'this trigger will run the attached blocks periodically'
    },
    {
        blocktype: 'context',
        labels: ['wait [number:1] secs'],
        script: 'setTimeout(function(){[[1]]},1000*{{1}});',
        help: 'pause before running the following blocks'
    },
    {
        blocktype: 'context',
        labels: ['repeat [number:10]'],
        script: 'range({{1}}).forEach(function(idx, item){local.count## = idx;[[1]]});',
        help: 'repeat the contained blocks so many times',
        locals: [
            {
                blocktype: 'expression',
                labels: ['count##'],
                script: 'local.count##',
                type: 'number'
            }
        ]
    },
    {
        blocktype: 'step',
        labels: ['broadcast [string:ack] message'],
        script: 'global.stage.dispatchEvent(new CustomEvent("wb_" + {{1}}));',
        help: 'send this message to any listeners'
    },
    {
        blocktype: 'step',
        labels: ['broadcast [string:ping] message with data [any]'],
        script: 'global.stage.dispatchEvent(new CustomEvent("wb_" + {{1}}, {detail: {{2}}}));',
        help: 'send this message with an object argument to any listeners'
    },
    {
        blocktype: 'eventhandler',
        labels: ['when I receive [string:ack] message'],
        script: 'global.stage.addEventListener("wb_" + {{1}}, function(){[[1]]});',
        help: 'add a listener for the given message, run these blocks when it is received'
    },
    {
        blocktype: 'eventhandler',
        labels: ['when I receive [string:ping] message with data'],
        script: 'global.stage.addEventListener("wb_" + {{1}}, function(event){local.data##=event.detail;[[1]]});',
        locals: [
            {
                blocktype: 'expression',
                labels: ['data##'],
                script: 'local.data##',
                type: 'any'
            }
        ],
        help: 'add a listener for the given message which receives data, run these blocks when it is received'
    },
    {
        blocktype: 'context',
        labels: ['forever if [boolean:false]'],
        script: 'while({{1}}){[[1]]}',
        help: 'repeat until the condition is false'
    },
    {
        blocktype: 'context',
        labels: ['if [boolean]'],
        script: 'if({{1}}){[[1]]}',
        help: 'run the following blocks only if the condition is true'
    },
    {
        blocktype: 'context',
        labels: ['if [boolean]', 'else'],
        script: 'if({{1}}){[[1]]}else{[[2]]}',
        help: 'run the first set of blocks if the condition is true, otherwise run the second set'
    },
    {
        blocktype: 'context',
        labels: ['repeat until [boolean]'],
        script: 'while(!({{1}})){[[1]]}',
        help: 'repeat forever until condition is true'
    }
], true);

wb.menu('Variables', [
    {
        blocktype: 'step',
        labels: ['variable string## [string]'],
        script: 'local.string## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['string##'],
                script: 'local.string##',
                type: 'string'
            }
        ],
        help: 'create a reference to re-use the string'
    },
    {
        blocktype: 'step',
        labels: ['set string variable [string] to [string]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal string'
    },
    {
        blocktype: 'step',
        labels: ['variable number## [number]'],
        script: 'local.number## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['number##'],
                script: 'local.number##',
                type: 'number'
            }
        ],
        help: 'create a reference to re-use the number'
    },
    {
        blocktype: 'step',
        labels: ['set variable [number] to [number]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal number'
    },
    {
        blocktype: 'step',
        labels: ['variable boolean## [boolean]'],
        script: 'local.boolean## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['boolean##'],
                script: 'local.boolean##',
                type: 'boolean'
            }
        ],
        help: 'create a reference to re-use the boolean'
    },
    {
        blocktype: 'step',
        labels: ['set variable [boolean] to [boolean]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal boolean'
    },
    {
        blocktype: 'step',
        labels: ['variable array## [array]'],
        script: 'local.array## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['array##'],
                script: 'local.array## = {{1}}',
                type: 'array'
            }
        ],
        help: 'create a reference to re-use the array'
    },
    {
        blocktype: 'step',
        labels: ['set variable [array] to [array]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal array'
    },
    {
        blocktype: 'step',
        labels: ['variable object## [object]'],
        script: 'local.object## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['object##'],
                script: 'local.object##',
                type: 'object'
            }
        ],
        help: 'create a reference to re-use the object'
    },
    {
        blocktype: 'step',
        labels: ['set variable [object] to [object]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal object'
    },
    {
        blocktype: 'step',
        labels: ['variable color## [color]'],
        script: 'local.color## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['color##'],
                script: 'local.color##',
                type: 'color'
            }
        ],
        help: 'create a reference to re-use the color'
    },
    {
        blocktype: 'step',
        labels: ['set variable [color] to [color]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal color'
    },
    {
        blocktype: 'step',
        labels: ['variable image## [image]'],
        script: 'local.image## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['image##'],
                script: 'local.image##',
                type: 'image'
            }
        ],
        help: 'create a reference to re-use the image'
    },
    {
        blocktype: 'step',
        labels: ['set variable [image] to [image]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal image'
    },
    // 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata', 'any'
    {
        blocktype: 'step',
        labels: ['variable shape## [shape]'],
        script: 'local.shape## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['shape##'],
                script: 'local.shape##',
                type: 'shape'
            }
        ],
        help: 'create a reference to re-use the shape'
    },
    {
        blocktype: 'step',
        labels: ['set variable [shape] to [shape]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal shape'
    },
    {
        blocktype: 'step',
        labels: ['variable point## [point]'],
        script: 'local.point## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['point##'],
                script: 'local.point##',
                type: 'point'
            }
        ],
        help: 'create a reference to re-use the point'
    },
    {
        blocktype: 'step',
        labels: ['set variable [point] to [point]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal point'
    },
    {
        blocktype: 'step',
        labels: ['variable size## [size]'],
        script: 'local.size## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['size##'],
                script: 'local.size##',
                type: 'size'
            }
        ],
        help: 'create a reference to re-use the size'
    },
    {
        blocktype: 'step',
        labels: ['set variable [size] to [size]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal size'
    },
    {
        blocktype: 'step',
        labels: ['variable rect## [rect]'],
        script: 'local.rect## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['rect##'],
                script: 'local.rect##',
                type: 'rect'
            }
        ],
        help: 'create a reference to re-use the rect'
    },
    {
        blocktype: 'step',
        labels: ['set variable [rect] to [rect]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal rect'
    },
    {
        blocktype: 'step',
        labels: ['variable gradient## [gradient]'],
        script: 'local.gradient## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['gradient##'],
                script: 'local.gradient##',
                type: 'gradient'
            }
        ],
        help: 'create a reference to re-use the gradient'
    },
    {
        blocktype: 'step',
        labels: ['set variable [gradient] to [gradient]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal gradient'
    },
    {
        blocktype: 'step',
        labels: ['variable pattern## [pattern]'],
        script: 'local.pattern## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['pattern##'],
                script: 'local.pattern##',
                type: 'pattern'
            }
        ],
        help: 'create a reference to re-use the pattern'
    },
    {
        blocktype: 'step',
        labels: ['set variable [pattern] to [pattern]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal pattern'
    },
    {
        blocktype: 'step',
        labels: ['variable imagedata## [imagedata]'],
        script: 'local.imagedata## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['imagedata##'],
                script: 'local.imagedata##',
                type: 'imagedata'
            }
        ],
        help: 'create a reference to re-use the imagedata'
    },
    {
        blocktype: 'step',
        labels: ['set variable [imagedata] to [imagedata]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal imagedata'
    },
    {
        blocktype: 'step',
        labels: ['variable any## [any]'],
        script: 'local.any## = {{1}};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['any##'],
                script: 'local.any##',
                type: 'any'
            }
        ],
        help: 'create a reference to re-use the any'
    },
    {
        blocktype: 'step',
        labels: ['set variable [any] to [any]'],
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal any (ha ha)'
    },
]);

// wb.menu('User Defined', [
//     {
//         blocktype: 'context',
//         labels: [
//             'New [choice:blocktypes] with arguments:',
//             'And body returning [any]'
//         ],
//         script: 'var block## = newBlockHandler([{{1}}],[{{2}}])',
//         help: 'Create a new block for re-use',
//         returns: 'block'
//     },
//     {
//         blocktype: 'context',
//         labels: ['New [choice:blocktypes] with arg1 [choice:types]'],
//         script: 'alert("implement me");',
//         help: 'Create a new block for re-use'
//     },
//     {
//         blocktype: 'context',
//         labels: ['New [choice:blocktypes] with arg1 [choice:types] returns [choice:rettypes]'],
//         script: '',
//         help: ''
//     }
// ]);

wb.menu('Arrays', [
    {
        blocktype: 'step',
        labels: ['new array##'],
        script: 'local.array## = [];',
        help: 'Create an empty array',
        locals: [
            {
                blocktype: 'expression',
                labels: ['array##'],
                script: 'local.array##',
                type: 'array'
            }
        ]
    },
    {
        blocktype: 'step',
        labels: ['new array with array## [array]'],
        script: 'local.array## = {{1}}.slice();',
        help: 'create a new array with the contents of another array',
        locals: [
            {
                blocktype: 'expression',
                labels: ['array##'],
                script: 'local.array##',
                type: 'array'
            }
        ]
    },
    {
        blocktype: 'expression',
        labels: ['array [array] item [number:0]'],
        script: '{{1}}[{{2}}]',
        type: 'any',
        help: 'get an item from an index in the array'
    },
    {
        blocktype: 'expression',
        labels: ['array [array] join with [string:, ]'],
        script: '{{1}}.join({{2}})',
        type: 'string',
        help: 'join items of an array into a string, each item separated by given string'
    },
    {
        blocktype: 'step',
        labels: ['array [array] append [any]'],
        script: '{{1}}.push({{2}});',
        help: 'add any object to an array'
    },
    {
        blocktype: 'expression',
        labels: ['array [array] length'],
        script: '{{1}}.length',
        type: 'number',
        help: 'get the length of an array'
    },
    {
        blocktype: 'expression',
        labels: ['array [array] remove item [number:0]'],
        script: '{{1}}.splice({{2}}, 1)[0]',
        type: 'any',
        help: 'remove item at index from an array'
    },
    {
        blocktype: 'expression',
        labels: ['array [array] pop'],
        script: '{{1}}.pop()',
        type: 'any',
        help: 'remove and return the last item from an array'
    },
    {
        blocktype: 'expression',
        labels: ['array [array] shift'],
        script: '{{1}}.shift()',
        type: 'any',
        help: 'remove and return the first item from an array'
    },
    {
        blocktype: 'expression',
        labels: ['array [array] reversed'],
        script: '{{1}}.slice().reverse()',
        type: 'array',
        help: 'reverse a copy of array'
    },
    {
        blocktype: 'expression',
        labels: ['array [array] concat [array]'],
        script: '{{1}}.concat({{2}});',
        type: 'array',
        help: 'a new array formed by joining the arrays'
    },
    {
        blocktype: 'context',
        labels: ['array [array] for each'],
        script: '{{1}}.forEach(function(item, idx){local.index = idx; local.item = item; [[1]] });',
        locals: [
            {
                blocktype: 'expression',
                labels: ['index'],
                script: 'local.index',
                help: 'index of current item in array',
                type: 'number'
            },
            {
                blocktype: 'expression',
                labels: ['item'],
                script: 'local.item',
                help: 'the current item in the iteration',
                type: 'any'
            }
        ],
        help: 'run the blocks with each item of a named array'
    }
], false);

wb.menu('Objects', [
    {
        blocktype: 'step',
        labels: ['new object##'],
        script: 'local.object## = {};',
        locals: [
            {
                blocktype: 'expression',
                labels: ['object##'],
                script: 'local.object##',
                type: 'object'
            }
        ],
        help: 'create a new, empty object'
    },
    {
        blocktype: 'step',
        labels: ['object [object] key [string] = value [any]'],
        script: '{{1}}[{{2}}] = {{3}};',
        help: 'set the key/value of an object'
    },
    {
        blocktype: 'expression',
        labels: ['object [object] value at key [string]'],
        script: '{{1}}[{{2}}]',
        type: 'any',
        help: 'return the value of the key in an object'
    },
    {
        blocktype: 'context',
        labels: ['for each item in [object] do'],
        script: 'Object.keys({{1}}).forEach(function(key){local.key = key; local.item = {{1}}[key]; [[1]] });',
        locals: [
            {
                blocktype: 'expression',
                labels: ['key'],
                script: 'local.key',
                help: 'key of current item in object',
                type: 'string'
            },
            {
                blocktype: 'expression',
                labels: ['item'],
                script: 'local.item',
                help: 'the current item in the iteration',
                type: 'any'
            }
        ],
        help: 'run the blocks with each item of a object'

    }
], false);

wb.menu('Strings', [
    {
        blocktype: 'expression',
        labels: ['string [string] split on [string]'],
        script: '{{1}}.split({{2}})',
        type: 'array',
        help: 'create an array by splitting the named string on the given string'
    },
    {
        blocktype: 'expression',
        labels: ['string [string] character at [number:0]'],
        script: '{{1}}[{{2}}]',
        type: 'string',
        help: 'get the single character string at the given index of named string'
    },
    {
        blocktype: 'expression',
        labels: ['string [string] length'],
        script: '{{1}}.length',
        type: 'number',
        help: 'get the length of named string'
    },
    {
        blocktype: 'expression',
        labels: ['string [string] indexOf [string]'],
        script: '{{1}}.indexOf({{2}})',
        type: 'number',
        help: 'get the index of the substring within the named string'
    },
    {
        blocktype: 'expression',
        labels: ['string [string] replace [string] with [string]'],
        script: '{{1}}.replace({{2}}, {{3}})',
        type: 'string',
        help: 'get a new string by replacing a substring with a new string'
    },
    {
        blocktype: 'expression',
        labels: ['to string [any]'],
        script: '{{1}}.toString()',
        type: 'string',
        help: 'convert any object to a string'
    },
    {
        blocktype: 'step',
        labels: ['comment [string]'],
        script: '// {{1}};\n',
        help: 'this is a comment and will not be run by the program'
    },
    {
        blocktype: 'step',
        labels: ['alert [string]'],
        script: 'window.alert({{1}});',
        help: 'pop up an alert window with string'
    },
    {
        blocktype: 'step',
        labels: ['console log [any]'],
        script: 'console.log({{1}});',
        help: 'Send any object as a message to the console'
    },
    {
        blocktype: 'step',
        labels: ['console log format [string] arguments [array]'],
        script: 'var __a={{2}};__a.unshift({{1}});console.log.apply(console, __a);',
        help: 'send a message to the console with a format string and multiple objects'
    },
    {
        blocktype: 'expression',
        labels: ['global keys object'],
        script: 'global.keys',
        help: 'for debugging',
        type: 'object'
    }
], false);

wb.menu('Sensing', [
    {
        blocktype: 'step',
        labels: ['ask [string:What\'s your name?] and wait'],
        script: 'local.answer## = prompt({{1}});',
        locals: [
            {
                blocktype: 'expression',
                labels: ['answer##'],
                type: 'string',
                script: 'local.answer##'
            }
        ],
        help: 'Prompt the user for information'
    },
    {
        blocktype: 'expression',
        labels: ['mouse x'],
        type: 'number',
        script: 'global.mouse_x',
        help: 'The current horizontal mouse position'
    },
    {
        blocktype: 'expression',
        labels: ['mouse y'],
        type: 'number',
        script: 'global.mouse_y',
        help: 'the current vertical mouse position'
    },
    {
        blocktype: 'expression',
        labels: ['mouse down'],
        type: 'boolean',
        script: 'global.mouse_down',
        help: 'true if the mouse is down, false otherwise'
    },
    {
        blocktype: 'expression',
        labels: ['key [choice:keys] pressed?'],
        type: 'boolean',
        script: 'global.isKeyDown({{1}})',
        help: 'is the given key down when this block is run?'
    },
    {
        blocktype: 'expression',
        labels: ['stage width'],
        type: 'number',
        script: 'global.stage_width',
        help: 'width of the stage where scripts are run. This may change if the browser window changes'
    },
    {
        blocktype: 'expression',
        labels: ['stage height'],
        type: 'number',
        script: 'global.stage_height',
        help: 'height of the stage where scripts are run. This may change if the browser window changes.'
    },
    {
        blocktype: 'expression',
        labels: ['center x'],
        type: 'number',
        script: 'global.stage_center_x',
        help: 'horizontal center of the stage'
    },
    {
        blocktype: 'expression',
        labels: ['center y'],
        type: 'number',
        script: 'global.stage_center_y',
        help: 'vertical center of the stage'
    },
	{
		blocktype: 'expression',
		labels: ['random x'],
		type: 'number',
		script: 'randint(0,global.stage_width)',
		help: 'return a number between 0 and the stage width'
	},
	{
		blocktype: 'expression',
		labels: ['random y'],
		type: 'number',
		script: 'randint(0, global.stage_height)',
		help: 'return a number between 0 and the stage height'
	},
    {
        blocktype: 'step',
        labels: ['reset timer'],
        script: 'global.timer.reset();',
        help: 'set the global timer back to zero'
    },
    {
        blocktype: 'expression',
        labels: ['timer'],
        type: 'number',
        script: 'global.timer.value()',
        help: 'seconds since the script began running'
    }
]);

wb.menu('Operators', [
    {
        blocktype: 'expression',
        labels: ['[number:0] + [number:0]'],
        type: 'number',
        script: "({{1}} + {{2}})",
        help: 'sum of the two operands'
    },
    {
        blocktype: 'expression',
        labels: ['[number:0] - [number:0]'],
        type: 'number',
        script: "({{1}} - {{2}})",
        help: 'difference of the two operands'
    },
    {
        blocktype: 'expression',
        labels: ['[number:0] * [number:0]'],
        type: 'number',
        script: "({{1}} * {{2}})",
        help: 'product of the two operands'
    },
    {
        blocktype: 'expression',
        labels: ['[number:0] / [number:0]'],
        type: 'number',
        script: "({{1}} / {{2}})",
        help: 'quotient of the two operands'
    },
    {
        blocktype: 'expression',
        labels: ['pick random [number:1] to [number:10]'],
        type: 'number',
        script: "randint({{1}}, {{2}})",
        help: 'random number between two numbers (inclusive)'
    },
    {
        blocktype: 'expression',
        labels: ['[number:0] < [number:0]'],
        type: 'boolean',
        script: "({{1}} < {{2}})",
        help: 'first operand is less than second operand'
    },
    {
        blocktype: 'expression',
        labels: ['[number:0] = [number:0]'],
        type: 'boolean',
        script: "({{1}} === {{2}})",
        help: 'two operands are equal'
    },
    {
        blocktype: 'expression',
        labels: ['[number:0] > [number:0]'],
        type: 'boolean',
        script: "({{1}} > {{2}})",
        help: 'first operand is greater than second operand'
    },
    {
        blocktype: 'expression',
        labels: ['[boolean] and [boolean]'],
        type: 'boolean',
        script: "({{1}} && {{2}})",
        help: 'both operands are true'
    },
    {
        blocktype: 'expression',
        labels: ['[boolean] or [boolean]'],
        type: 'boolean',
        script: "({{1}} || {{2}})",
        help: 'either or both operands are true'
    },
    {
        blocktype: 'expression',
        labels: ['[boolean] xor [boolean]'],
        type: 'boolean',
        script: "({{1}} ? !{{2}} : {{2}})",
        help: 'either, but not both, operands are true'
    },
    {
        blocktype: 'expression',
        labels: ['not [boolean]'],
        type: 'boolean',
        script: "(! {{1}})",
        help: 'operand is false'
    },
    {
        blocktype: 'expression',
        labels: ['concatenate [string:hello] with [string:world]'],
        type: 'string',
        script: "({{1}} + {{2}})",
        help: 'returns a string by joining together two strings'
    },
    {
        blocktype: 'expression',
        labels: ['[number:0] mod [number:0]'],
        type: 'number',
        script: "({{1}} % {{2}})",
        help: 'modulus of a number is the remainder after whole number division'
    },
    {
        blocktype: 'expression',
        labels: ['round [number:0]'],
        type: 'number',
        script: "Math.round({{1}})",
        help: 'rounds to the nearest whole number'
    },
    {
        blocktype: 'expression',
        labels: ['absolute of [number:10]'],
        type: 'number',
        script: "Math.abs({{1}})",
        help: 'converts a negative number to positive, leaves positive alone'
    },
    {
        blocktype: 'expression',
        labels: ['arccosine degrees of [number:10]'],
        type: 'number',
        script: 'rad2deg(Math.acos({{1}}))',
        help: 'inverse of cosine'
    },
    {
        blocktype: 'expression',
        labels: ['arcsine degrees of [number:10]'],
        type: 'number',
        script: 'rad2deg(Math.asin({{1}}))',
        help: 'inverse of sine'
    },
    {
        blocktype: 'expression',
        labels: ['arctangent degrees of [number:10]'],
        type: 'number',
        script: 'rad2deg(Math.atan({{1}}))',
        help: 'inverse of tangent'
    },
    {
        blocktype: 'expression',
        labels: ['ceiling of [number:10]'],
        type: 'number',
        script: 'Math.ceil({{1}})',
        help: 'rounds up to nearest whole number'
    },
    {
        blocktype: 'expression',
        labels: ['cosine of [number:10] degrees'],
        type: 'number',
        script: 'Math.cos(deg2rad({{1}}))',
        help: 'ratio of the length of the adjacent side to the length of the hypotenuse'
    },
    {
        blocktype: 'expression',
        labels: ['sine of [number:10] degrees'],
        type: 'number',
        script: 'Math.sin(deg2rad({{1}}))',
        help: 'ratio of the length of the opposite side to the length of the hypotenuse'
    },
    {
        blocktype: 'expression',
        labels: ['tangent of [number:10] degrees'],
        type: 'number',
        script: 'Math.tan(deg2rad({{1}}))',
        help: 'ratio of the length of the opposite side to the length of the adjacent side'
    },
    {
        blocktype: 'expression',
        labels: ['[number:10] to the power of [number:2]'],
        type: 'number',
        script: 'Math.pow({{1}}, {{2}})',
        help: 'multiply a number by itself the given number of times'
    },
    {
        blocktype: 'expression',
        labels: ['square root of [number:10]'],
        type: 'number',
        script: 'Math.sqrt({{1}})',
        help: 'the square root is the same as taking the to the power of 1/2'
    },
    {
        blocktype: 'expression',
        labels: ['pi'],
        script: 'Math.PI;',
        type: 'number',
        help: "pi is the ratio of a circle's circumference to its diameter"
    },
    {
        blocktype: 'expression',
        labels: ['tau'],
        script: 'Math.PI * 2',
        type: 'number',
        help: 'tau is 2 times pi, a generally more useful number'
    }
]);

$('.scripts_workspace').trigger('init');

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});

})();
