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
        id: '1cf8132a-4996-47db-b482-4e336200e3ca',
        label: 'when program runs',
        script: 'function _start(){[[1]]}_start();',
        help: 'this trigger will run its scripts once when the program starts'
    },
    {
        blocktype: 'eventhandler',
        id: 'f4a604cd-f0b5-4133-9f91-4e1abe48fb6a',
        label: 'when [choice:keys] key pressed',
        script: '$(document).bind("keydown", {{1}}, function(){[[1]]; return false;});',
        help: 'this trigger will run the attached blocks every time this key is pressed'
    },
    {
        blocktype: 'eventhandler',
        id: 'cfea9087-3d7c-46ad-aa41-579bba2f4709',
        label: 'repeat [number:30] times a second',
        locals: [
            {
                blocktype: 'expression',
                label: 'count##',
                script: 'local.count##',
                type: 'number'
            }
        ],
        script: 'local.count##=0;(function(){setInterval(function(){local.count##++;[[1]]},1000/{{1}})})();',
        help: 'this trigger will run the attached blocks periodically'
    },
    {
        blocktype: 'context',
        id: '66b33236-c9ce-4b6c-9b69-e8c4fdadbf52',
        label: 'wait [number:1] secs',
        script: 'setTimeout(function(){[[1]]},1000*{{1}});',
        help: 'pause before running the following blocks'
    },
    {
        blocktype: 'context',
        id: 'aa146082-9a9c-4ae7-a409-a89e84dc113a',
        label: 'repeat [number:10]',
        script: 'range({{1}}).forEach(function(idx, item){local.count## = idx;[[1]]});',
        help: 'repeat the contained blocks so many times',
        locals: [
            {
                blocktype: 'expression',
                label: 'count##',
                script: 'local.count##',
                type: 'number'
            }
        ]
    },
    {
        blocktype: 'step',
        id: 'b7079d91-f76d-41cc-a6aa-43fc2749429c',
        label: 'broadcast [string:ack] message',
        script: 'global.stage.dispatchEvent(new CustomEvent("wb_" + {{1}}));',
        help: 'send this message to any listeners'
    },
    {
        blocktype: 'step',
        id: 'd175bd7d-c7fd-4465-8b1f-c82687f35577',
        label: 'broadcast [string:ping] message with data [any]',
        script: 'global.stage.dispatchEvent(new CustomEvent("wb_" + {{1}}, {detail: {{2}}}));',
        help: 'send this message with an object argument to any listeners'
    },
    {
        blocktype: 'eventhandler',
        id: '3931a20c-f510-45e4-83d2-4005983d5cae',
        label: 'when I receive [string:ack] message',
        script: 'global.stage.addEventListener("wb_" + {{1}}, function(){[[1]]});',
        help: 'add a listener for the given message, run these blocks when it is received'
    },
    {
        blocktype: 'eventhandler',
        id: 'a0496339-c405-4d1c-8185-9bc211bf5a56',
        label: 'when I receive [string:ping] message with data',
        script: 'global.stage.addEventListener("wb_" + {{1}}, function(event){local.data##=event.detail;[[1]]});',
        locals: [
            {
                blocktype: 'expression',
                label: 'data##',
                script: 'local.data##',
                type: 'any'
            }
        ],
        help: 'add a listener for the given message which receives data, run these blocks when it is received'
    },
    {
        blocktype: 'context',
        id: 'b1e43170-800a-4e9b-af82-0ed5c62c47a0',
        label: 'forever if [boolean:false]',
        script: 'while({{1}}){[[1]]}',
        help: 'repeat until the condition is false'
    },
    {
        blocktype: 'context',
        id: '20ba3e08-74c0-428e-b612-53545de63ce0',
        label: 'if [boolean]',
        script: 'if({{1}}){[[1]]}',
        help: 'run the following blocks only if the condition is true'
    },
    {
        blocktype: 'context',
        id: '6dddaf61-caf0-4976-a3f1-9d9c3bbbf5a4',
        label: 'if not [boolean]',
        script: 'if( ! {{1}} ){ [[1]]} }',
        help: 'run the  blocks if the condition is not true'
    },
    {
        blocktype: 'context',
        id: '5a09e58a-4f45-4fa8-af98-84de735d0fc8',
        label: 'repeat until [boolean]',
        script: 'while(!({{1}})){[[1]]}',
        help: 'repeat forever until condition is true'
    }
], true);

wb.menu('Variables', [
    {
        blocktype: 'step',
        id: '8a95bbaf-a881-4771-973e-5c29582eb32c',
        label: 'variable string## [string]',
        script: 'local.string## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'string##',
            script: 'local.string##',
            type: 'string'
        },
        help: 'create a reference to re-use the string'
    },
    {
        blocktype: 'step',
        id: '2f5cde0f-da92-4ba5-946c-038a3d53f08a',
        label: 'set string variable [string] to [string]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal string'
    },
    {
        blocktype: 'step',
        id: 'd10b5b49-5273-4e5b-b433-ccaf0e29914c',
        label: 'variable number## [number]',
        script: 'local.number## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'number##',
            script: 'local.number##',
            type: 'number'
        },
        help: 'create a reference to re-use the number'
    },
    {
        blocktype: 'step',
        id: '7e31ba12-1953-48a8-891f-7cfbea8e817d',
        label: 'set variable [number] to [number]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal number'
    },
    {
        blocktype: 'step',
        id: 'abf69c86-540f-4fb8-98a6-8d12fe7fdd32',
        label: 'variable boolean## [boolean]',
        script: 'local.boolean## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'boolean##',
            script: 'local.boolean##',
            type: 'boolean'
        },
        help: 'create a reference to re-use the boolean'
    },
    {
        blocktype: 'step',
        id: 'c0626e6d-d765-4aea-aa59-a5c756f07462',
        label: 'set variable [boolean] to [boolean]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal boolean'
    },
    {
        blocktype: 'step',
        id: '5dc586d7-869f-4af1-894d-b890ee0cebe5',
        label: 'variable array## [array]',
        script: 'local.array## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'array##',
            script: 'local.array## = {{1}}',
            type: 'array'
        },
        help: 'create a reference to re-use the array'
    },
    {
        blocktype: 'step',
        id: '7c47b351-54f3-45fd-843f-c23a095f4df4',
        label: 'set variable [array] to [array]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal array'
    },
    {
        blocktype: 'step',
        id: '1a72fd0b-43e4-425e-950b-754d3e4373d2',
        label: 'variable object## [object]',
        script: 'local.object## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'object##',
            script: 'local.object##',
            type: 'object'
        },
        help: 'create a reference to re-use the object'
    },
    {
        blocktype: 'step',
        id: 'c89a22fc-a5e0-4d44-a283-716cf3702000',
        label: 'set variable [object] to [object]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal object'
    },
    {
        blocktype: 'step',
        id: '1237a4d3-c976-4e09-9245-3540b6b4acb2',
        label: 'variable color## [color]',
        script: 'local.color## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'color##',
            script: 'local.color##',
            type: 'color'
        },
        help: 'create a reference to re-use the color'
    },
    {
        blocktype: 'step',
        id: 'b614a285-0650-40f6-8e0f-2c105108e0bf',
        label: 'set variable [color] to [color]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal color'
    },
    {
        blocktype: 'step',
        id: 'b4e1e7d5-4ae6-4c8d-814e-2cc10562d1a5',
        label: 'variable image## [image]',
        script: 'local.image## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'image##',
            script: 'local.image##',
            type: 'image'
        },
        help: 'create a reference to re-use the image'
    },
    {
        blocktype: 'step',
        id: 'cc09b0b6-3cae-438b-9504-86eff4b04fed',
        label: 'set variable [image] to [image]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal image'
    },
    // 'shape', 'point', 'size', 'rect', 'gradient', 'pattern', 'imagedata', 'any'
    {
        blocktype: 'step',
        id: 'a5cc0f76-e038-41b5-9315-c64ac7390bbf',
        label: 'variable shape## [shape]',
        script: 'local.shape## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'shape##',
            script: 'local.shape##',
            type: 'shape'
        },
        help: 'create a reference to re-use the shape'
    },
    {
        blocktype: 'step',
        id: '9f0aff58-436b-4343-be0d-63b972852988',
        label: 'set variable [shape] to [shape]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal shape'
    },
    {
        blocktype: 'step',
        id: '2712a05f-ad94-4744-b148-54e40494fda2',
        label: 'variable point## [point]',
        script: 'local.point## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'point##',
            script: 'local.point##',
            type: 'point'
        },
        help: 'create a reference to re-use the point'
    },
    {
        blocktype: 'step',
        id: '675e87be-bda7-4e86-aff3-178bd1a190a7',
        label: 'set variable [point] to [point]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal point'
    },
    {
        blocktype: 'step',
        id: '62a7315f-8c85-4791-8577-0e3941ede18f',
        label: 'variable size## [size]',
        script: 'local.size## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'size##',
            script: 'local.size##',
            type: 'size'
        },
        help: 'create a reference to re-use the size'
    },
    {
        blocktype: 'step',
        id: '17be189f-d362-4094-a010-a4cc285476b7',
        label: 'set variable [size] to [size]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal size'
    },
    {
        blocktype: 'step',
        id: '0996b64c-bdbe-46c1-99ce-ac900fe198c7',
        label: 'variable rect## [rect]',
        script: 'local.rect## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'rect##',
            script: 'local.rect##',
            type: 'rect'
        },
        help: 'create a reference to re-use the rect'
    },
    {
        blocktype: 'step',
        id: '9d95d6c0-5804-4763-a18f-e4bb9002f07f',
        label: 'set variable [rect] to [rect]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal rect'
    },
    {
        blocktype: 'step',
        id: '03643740-69f0-4348-87a3-4c2f9a7262a6',
        label: 'variable gradient## [gradient]',
        script: 'local.gradient## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'gradient##',
            script: 'local.gradient##',
            type: 'gradient'
        },
        help: 'create a reference to re-use the gradient'
    },
    {
        blocktype: 'step',
        id: '12a09f20-39d4-4214-982f-99a062068bac',
        label: 'set variable [gradient] to [gradient]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal gradient'
    },
    {
        blocktype: 'step',
        id: '227a0249-ff0d-4bc9-a254-457a0861f105',
        label: 'variable pattern## [pattern]',
        script: 'local.pattern## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'pattern##',
            script: 'local.pattern##',
            type: 'pattern'
        },
        help: 'create a reference to re-use the pattern'
    },
    {
        blocktype: 'step',
        id: '6c978b64-8cff-4940-be2d-7c75b244b8c1',
        label: 'set variable [pattern] to [pattern]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal pattern'
    },
    {
        blocktype: 'step',
        id: '6098e4f7-8469-4002-92e3-1971806a4bea',
        label: 'variable imagedata## [imagedata]',
        script: 'local.imagedata## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'imagedata##',
            script: 'local.imagedata##',
            type: 'imagedata'
        },
        help: 'create a reference to re-use the imagedata'
    },
    {
        blocktype: 'step',
        id: 'cda09559-8a62-4b40-bf11-e0fb264a4041',
        label: 'set variable [imagedata] to [imagedata]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal imagedata'
    },
    {
        blocktype: 'step',
        id: '079b2b89-41c2-4d00-8e21-bcb86574bf80',
        label: 'variable any## [any]',
        script: 'local.any## = {{1}};',
        returns: {
            blocktype: 'expression',
            label: 'any##',
            script: 'local.any##',
            type: 'any'
        },
        help: 'create a reference to re-use the any'
    },
    {
        blocktype: 'step',
        id: 'b4036693-8645-4852-a4de-9e96565f9aec',
        label: 'set variable [any] to [any]',
        script: '{{1}} = {{2}};',
        help: 'first argument must be a variable, not a literal any (ha ha)'
    },
]);

// wb.menu('User Defined', [
//     {
//         blocktype: 'context',
//         id: '180ec0db-5723-4e74-8740-3488cfa9aa8e',
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
//         id: '3f44e23a-66f7-4acf-9b1a-1e498e842c06',
//         label: 'New [choice:blocktypes] with arg1 [choice:types]',
//         script: 'alert("implement me");',
//         help: 'Create a new block for re-use'
//     },
//     {
//         blocktype: 'context',
//         id: '870c6588-3a0b-4073-89c2-4726c3544658',
//         label: 'New [choice:blocktypes] with arg1 [choice:types] returns [choice:rettypes]',
//         script: '',
//         help: ''
//     }
// ]);

wb.menu('Arrays', [
    {
        blocktype: 'step',
        id: 'e6a297e9-1255-4701-91d8-80548489ee9a',
        label: 'new array##',
        script: 'local.array## = [];',
        help: 'Create an empty array',
        returns: {
            blocktype: 'expression',
            label: 'array##',
            script: 'local.array##',
            type: 'array'
        }
    },
    {
        blocktype: 'step',
        id: '83d67170-4ba7-45ac-95ae-bb2f314c3ae0',
        label: 'new array with array## [array]',
        script: 'local.array## = {{1}}.slice();',
        help: 'create a new array with the contents of another array',
        returns: {
            blocktype: 'expression',
            label: 'array##',
            script: 'local.array##',
            type: 'array'
        }
    },
    {
        blocktype: 'expression',
        id: '3e56f9c1-29b9-4d0c-99bd-05ccabfa29c2',
        label: 'array [array] item [number:0]',
        script: '{{1}}[{{2}}]',
        type: 'any',
        help: 'get an item from an index in the array'
    },
    {
        blocktype: 'expression',
        id: '5b1cc330-b9b1-4062-b8d4-e5032c7a5776',
        label: 'array [array] join with [string:, ]',
        script: '{{1}}.join({{2}})',
        type: 'string',
        help: 'join items of an array into a string, each item separated by given string'
    },
    {
        blocktype: 'step',
        id: '3fab2b88-430a-401e-88b2-2703d614780a',
        label: 'array [array] append [any]',
        script: '{{1}}.push({{2}});',
        help: 'add any object to an array'
    },
    {
        blocktype: 'expression',
        id: 'bf3ed213-4435-4152-bb2c-573ce1721036',
        label: 'array [array] length',
        script: '{{1}}.length',
        type: 'number',
        help: 'get the length of an array'
    },
    {
        blocktype: 'expression',
        id: 'f4870f0f-1dbb-4bc7-b8e3-3a00af613689',
        label: 'array [array] remove item [number:0]',
        script: '{{1}}.splice({{2}}, 1)[0]',
        type: 'any',
        help: 'remove item at index from an array'
    },
    {
        blocktype: 'expression',
        id: 'e137e1a3-fe66-4d15-ae2a-596050acb6a7',
        label: 'array [array] pop',
        script: '{{1}}.pop()',
        type: 'any',
        help: 'remove and return the last item from an array'
    },
    {
        blocktype: 'expression',
        id: '00685267-c279-4fc1-bdbd-a07742a76b1e',
        label: 'array [array] shift',
        script: '{{1}}.shift()',
        type: 'any',
        help: 'remove and return the first item from an array'
    },
    {
        blocktype: 'expression',
        id: 'b4f115d3-fc52-4d75-a363-5119de21e97c',
        label: 'array [array] reversed',
        script: '{{1}}.slice().reverse()',
        type: 'array',
        help: 'reverse a copy of array'
    },
    {
        blocktype: 'expression',
        id: '0931d219-707c-41dd-92e6-b1a7c2a0f6b3',
        label: 'array [array] concat [array]',
        script: '{{1}}.concat({{2}});',
        type: 'array',
        help: 'a new array formed by joining the arrays'
    },
    {
        blocktype: 'context',
        id: '9f6f4e21-7abf-4e6f-b9bf-4ce8a1086a21',
        label: 'array [array] for each',
        script: '{{1}}.forEach(function(item, idx){local.index = idx; local.item = item; [[1]] });',
        locals: [
            {
                blocktype: 'expression',
                label: 'index',
                script: 'local.index',
                help: 'index of current item in array',
                type: 'number'
            },
            {
                blocktype: 'expression',
                label: 'item',
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
        id: '26ee5e5c-5405-453f-8941-26ac6ea009ec',
        label: 'new object##',
        script: 'local.object## = {};',
        returns: {
            blocktype: 'expression',
            label: 'object##',
            script: 'local.object##',
            type: 'object'
        },
        help: 'create a new, empty object'
    },
    {
        blocktype: 'step',
        id: 'ee86bcd0-10e3-499f-9a81-6738374c0c1f',
        label: 'object [object] key [string] = value [any]',
        script: '{{1}}[{{2}}] = {{3}};',
        help: 'set the key/value of an object'
    },
    {
        blocktype: 'expression',
        id: '7ca6df56-7c25-4c8c-98ef-8dfef90eff36',
        label: 'object [object] value at key [string]',
        script: '{{1}}[{{2}}]',
        type: 'any',
        help: 'return the value of the key in an object'
    },
    {
        blocktype: 'context',
        id: '322da80d-d8e2-4261-bab7-6ff0ae89e5f4',
        label: 'for each item in [object] do',
        script: 'Object.keys({{1}}).forEach(function(key){local.key = key; local.item = {{1}}[key]; [[1]] });',
        locals: [
            {
                blocktype: 'expression',
                label: 'key',
                script: 'local.key',
                help: 'key of current item in object',
                type: 'string'
            },
            {
                blocktype: 'expression',
                label: 'item',
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
        id: 'cdf5fa88-0d87-45d1-bf02-9ee4ec4c5565',
        label: 'string [string] split on [string]',
        script: '{{1}}.split({{2}})',
        type: 'array',
        help: 'create an array by splitting the named string on the given string'
    },
    {
        blocktype: 'expression',
        id: 'e71d4b0b-f32e-4b02-aa9d-5cbe76a8abcb',
        label: 'string [string] character at [number:0]',
        script: '{{1}}[{{2}}]',
        type: 'string',
        help: 'get the single character string at the given index of named string'
    },
    {
        blocktype: 'expression',
        id: 'c1eda8ae-b77c-4f5f-9b9f-c11b65235765',
        label: 'string [string] length',
        script: '{{1}}.length',
        type: 'number',
        help: 'get the length of named string'
    },
    {
        blocktype: 'expression',
        id: 'cc005f19-e1b9-4f74-8fd0-91faccedd370',
        label: 'string [string] indexOf [string]',
        script: '{{1}}.indexOf({{2}})',
        type: 'number',
        help: 'get the index of the substring within the named string'
    },
    {
        blocktype: 'expression',
        id: '8b536c13-4c56-471e-83ac-cf8648602df4',
        label: 'string [string] replace [string] with [string]',
        script: '{{1}}.replace({{2}}, {{3}})',
        type: 'string',
        help: 'get a new string by replacing a substring with a new string'
    },
    {
        blocktype: 'expression',
        id: '8eaacf8a-18eb-4f21-a1ab-a356326f7eae',
        label: 'to string [any]',
        script: '{{1}}.toString()',
        type: 'string',
        help: 'convert any object to a string'
    },
    {
        blocktype: 'step',
        id: '48bb8639-0092-4384-b5a0-3a772699dea9',
        label: 'comment [string]',
        script: '// {{1}};\n',
        help: 'this is a comment and will not be run by the program'
    },
    {
        blocktype: 'step',
        id: '2f178d61-e619-47d0-b9cf-fcb52625c2a3',
        label: 'alert [string]',
        script: 'window.alert({{1}});',
        help: 'pop up an alert window with string'
    },
    {
        blocktype: 'step',
        id: '8496b7af-129f-48eb-b15b-8803b7617493',
        label: 'console log [any]',
        script: 'console.log({{1}});',
        help: 'Send any object as a message to the console'
    },
    {
        blocktype: 'step',
        id: '8bfaf131-d169-4cf4-afe4-1d7f02a55341',
        label: 'console log format [string] arguments [array]',
        script: 'var __a={{2}};__a.unshift({{1}});console.log.apply(console, __a);',
        help: 'send a message to the console with a format string and multiple objects'
    },
    {
        blocktype: 'expression',
        id: '06ddcfee-76b7-4be4-856d-44cda3fb109b',
        label: 'global keys object',
        script: 'global.keys',
        help: 'for debugging',
        type: 'object'
    }
], false);

wb.menu('Sensing', [
    {
        blocktype: 'step',
        id: '916c79df-40f1-4280-a093-6d9dfe54d87e',
        label: 'ask [string:What\'s your name?] and wait',
        script: 'local.answer## = prompt({{1}});',
        returns: {
            blocktype: 'expression',
            label: 'answer##',
            type: 'string',
            script: 'local.answer##'
        },
        help: 'Prompt the user for information'
    },
    {
        blocktype: 'expression',
        id: '2504cc6a-0053-4acc-8594-a00fa8a078cb',
        label: 'mouse x',
        type: 'number',
        script: 'global.mouse_x',
        help: 'The current horizontal mouse position'
    },
    {
        blocktype: 'expression',
        id: '80600e66-f99e-4270-8c32-a2bb8d1dafe0',
        label: 'mouse y',
        type: 'number',
        script: 'global.mouse_y',
        help: 'the current vertical mouse position'
    },
    {
        blocktype: 'expression',
        id: 'ce1026a0-9acf-4d8f-a7c0-0759115af1ca',
        label: 'mouse down',
        type: 'boolean',
        script: 'global.mouse_down',
        help: 'true if the mouse is down, false otherwise'
    },
    {
        blocktype: 'expression',
        id: '4321cef6-6365-4885-9a3c-1fd0db2b4eab',
        label: 'key [choice:keys] pressed?',
        type: 'boolean',
        script: 'global.isKeyDown({{1}})',
        help: 'is the given key down when this block is run?'
    },
    {
        blocktype: 'expression',
        id: '048218dd-0b8d-4bc9-b310-480e93232665',
        label: 'stage width',
        type: 'number',
        script: 'global.stage_width',
        help: 'width of the stage where scripts are run. This may change if the browser window changes'
    },
    {
        blocktype: 'expression',
        id: '6f9031c6-579b-4e24-b5d1-f648aab6e0aa',
        label: 'stage height',
        type: 'number',
        script: 'global.stage_height',
        help: 'height of the stage where scripts are run. This may change if the browser window changes.'
    },
    {
        blocktype: 'expression',
        id: 'f85d3bfd-b58c-458f-b4a9-68538302aa12',
        label: 'center x',
        type: 'number',
        script: 'global.stage_center_x',
        help: 'horizontal center of the stage'
    },
    {
        blocktype: 'expression',
        id: '083bee4f-ee36-4a35-98df-587ed586d623',
        label: 'center y',
        type: 'number',
        script: 'global.stage_center_y',
        help: 'vertical center of the stage'
    },
	{
		blocktype: 'expression',
        id: '76184edb-ac2c-4809-899d-7b105776ba12',
		label: 'random x',
		type: 'number',
		script: 'randint(0,global.stage_width)',
		help: 'return a number between 0 and the stage width'
	},
	{
		blocktype: 'expression',
        id: '8e749092-327d-4921-a50e-c87acefe7102',
		label: 'random y',
		type: 'number',
		script: 'randint(0, global.stage_height)',
		help: 'return a number between 0 and the stage height'
	},
    {
        blocktype: 'step',
        id: '6b924f28-9bba-4257-a80b-2f2a591128a5',
        label: 'reset timer',
        script: 'global.timer.reset();',
        help: 'set the global timer back to zero'
    },
    {
        blocktype: 'expression',
        id: 'f04b0e0a-b591-4eaf-954d-dea412cbfd61',
        label: 'timer',
        type: 'number',
        script: 'global.timer.value()',
        help: 'seconds since the script began running'
    }
]);

wb.menu('Operators', [
    {
        blocktype: 'expression',
        id: '406d4e12-7dbd-4f94-9b0e-e2a66d960b3c',
        label: '[number:0] + [number:0]',
        type: 'number',
        script: "({{1}} + {{2}})",
        help: 'sum of the two operands'
    },
    {
        blocktype: 'expression',
        id: 'd7082309-9f02-4cf9-bcd5-d0cac243bff9',
        label: '[number:0] - [number:0]',
        type: 'number',
        script: "({{1}} - {{2}})",
        help: 'difference of the two operands'
    },
    {
        blocktype: 'expression',
        id: 'bd3879e6-e440-49cb-b10b-52d744846341',
        label: '[number:0] * [number:0]',
        type: 'number',
        script: "({{1}} * {{2}})",
        help: 'product of the two operands'
    },
    {
        blocktype: 'expression',
        id: '7f51bf70-a48d-4fda-ab61-442a0766abc4',
        label: '[number:0] / [number:0]',
        type: 'number',
        script: "({{1}} / {{2}})",
        help: 'quotient of the two operands'
    },
    {
        blocktype: 'expression',
        id: 'a35fb291-e2fa-42bb-a5a6-2124bb33157d',
        label: 'pick random [number:1] to [number:10]',
        type: 'number',
        script: "randint({{1}}, {{2}})",
        help: 'random number between two numbers (inclusive)'
    },
    {
        blocktype: 'expression',
        id: 'd753757b-a7d4-4d84-99f1-cb9b8c7e62da',
        label: '[number:0] < [number:0]',
        type: 'boolean',
        script: "({{1}} < {{2}})",
        help: 'first operand is less than second operand'
    },
    {
        blocktype: 'expression',
        id: 'e3a5ea20-3ca9-42cf-ac02-77ff06836a7e',
        label: '[number:0] = [number:0]',
        type: 'boolean',
        script: "({{1}} === {{2}})",
        help: 'two operands are equal'
    },
    {
        blocktype: 'expression',
        id: '5a1f5f68-d74b-4154-b376-6a0200f585ed',
        label: '[number:0] > [number:0]',
        type: 'boolean',
        script: "({{1}} > {{2}})",
        help: 'first operand is greater than second operand'
    },
    {
        blocktype: 'expression',
        id: '770756e8-3a10-4993-b02e-3d1333c98958',
        label: '[boolean] and [boolean]',
        type: 'boolean',
        script: "({{1}} && {{2}})",
        help: 'both operands are true'
    },
    {
        blocktype: 'expression',
        id: 'a56c0d03-5c5c-4459-9aaf-cbbea6eb3abf',
        label: '[boolean] or [boolean]',
        type: 'boolean',
        script: "({{1}} || {{2}})",
        help: 'either or both operands are true'
    },
    {
        blocktype: 'expression',
        id: 'cb9ddee8-5ee1-423b-9559-6d2cbb379b80',
        label: '[boolean] xor [boolean]',
        type: 'boolean',
        script: "({{1}} ? !{{2}} : {{2}})",
        help: 'either, but not both, operands are true'
    },
    {
        blocktype: 'expression',
        id: '138a6840-37cc-4e2d-b44a-af32e673ba56',
        label: 'not [boolean]',
        type: 'boolean',
        script: "(! {{1}})",
        help: 'operand is false'
    },
    {
        blocktype: 'expression',
        id: 'e1951d04-dc2f-459e-9d7a-4796f29169ea',
        label: 'concatenate [string:hello] with [string:world]',
        type: 'string',
        script: "({{1}} + {{2}})",
        help: 'returns a string by joining together two strings'
    },
    {
        blocktype: 'expression',
        id: 'a2647515-2f14-4d0f-84b1-a6e288823630',
        label: '[number:0] mod [number:0]',
        type: 'number',
        script: "({{1}} % {{2}})",
        help: 'modulus of a number is the remainder after whole number division'
    },
    {
        blocktype: 'expression',
        id: '4f7803c0-24b1-4a0c-a461-d46acfe9ab25',
        label: 'round [number:0]',
        type: 'number',
        script: "Math.round({{1}})",
        help: 'rounds to the nearest whole number'
    },
    {
        blocktype: 'expression',
        id: 'c38383df-a765-422e-b215-7d1cfb7557a1',
        label: 'absolute of [number:10]',
        type: 'number',
        script: "Math.abs({{1}})",
        help: 'converts a negative number to positive, leaves positive alone'
    },
    {
        blocktype: 'expression',
        id: '9bf66bb0-c182-42e5-b3a7-cf10de26b08c',
        label: 'arccosine degrees of [number:10]',
        type: 'number',
        script: 'rad2deg(Math.acos({{1}}))',
        help: 'inverse of cosine'
    },
    {
        blocktype: 'expression',
        id: '92f79a75-e3f4-4fc7-8f17-bf586aef180b',
        label: 'arcsine degrees of [number:10]',
        type: 'number',
        script: 'rad2deg(Math.asin({{1}}))',
        help: 'inverse of sine'
    },
    {
        blocktype: 'expression',
        id: '1f5ee069-148e-4e4a-a514-5179af86be15',
        label: 'arctangent degrees of [number:10]',
        type: 'number',
        script: 'rad2deg(Math.atan({{1}}))',
        help: 'inverse of tangent'
    },
    {
        blocktype: 'expression',
        id: '46bcac2d-eb76-417c-81af-cb894a54a86c',
        label: 'ceiling of [number:10]',
        type: 'number',
        script: 'Math.ceil({{1}})',
        help: 'rounds up to nearest whole number'
    },
    {
        blocktype: 'expression',
        id: 'ce4bf2bc-a06a-47f4-ac05-df2213d087a5',
        label: 'cosine of [number:10] degrees',
        type: 'number',
        script: 'Math.cos(deg2rad({{1}}))',
        help: 'ratio of the length of the adjacent side to the length of the hypotenuse'
    },
    {
        blocktype: 'expression',
        id: '1a8f6a28-14e9-4400-8e80-31217309ebc9',
        label: 'sine of [number:10] degrees',
        type: 'number',
        script: 'Math.sin(deg2rad({{1}}))',
        help: 'ratio of the length of the opposite side to the length of the hypotenuse'
    },
    {
        blocktype: 'expression',
        id: 'fcecb61b-7fd9-4a92-b6cb-77d0a2fc8541',
        label: 'tangent of [number:10] degrees',
        type: 'number',
        script: 'Math.tan(deg2rad({{1}}))',
        help: 'ratio of the length of the opposite side to the length of the adjacent side'
    },
    {
        blocktype: 'expression',
        id: '8a4a81d8-de25-46f0-b610-97d4f6fffbff',
        label: '[number:10] to the power of [number:2]',
        type: 'number',
        script: 'Math.pow({{1}}, {{2}})',
        help: 'multiply a number by itself the given number of times'
    },
    {
        blocktype: 'expression',
        id: '668798a3-f15e-4839-b4b3-da5db380aa5a',
        label: 'square root of [number:10]',
        type: 'number',
        script: 'Math.sqrt({{1}})',
        help: 'the square root is the same as taking the to the power of 1/2'
    },
    {
        blocktype: 'expression',
        id: 'a34c51d9-bfa0-49ad-8e7d-b653611836d3',
        label: 'pi',
        script: 'Math.PI;',
        type: 'number',
        help: "pi is the ratio of a circle's circumference to its diameter"
    },
    {
        blocktype: 'expression',
        id: 'da2c8203-bf80-4617-a762-92dd4d7bfa27',
        label: 'tau',
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
