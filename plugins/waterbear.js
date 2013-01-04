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


// End UI section

// expose these globally so the Block/Label methods can find them
window.choiceLists = {
    keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt', 
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown', 
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
    arity: ['0', '1', '2', '3', 'array', 'object'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
};

// MENUS

wb.menu('Control', [
    {
        blocktype: 'eventhandler',
        contained: [{label: 'Waterbear'}],
        script: 'function _start(){[[1]]}_start();',
        help: 'this trigger will run its scripts once when the program starts'
    }
], true);

wb.menu('Arrays', [
    {
        blocktype: 'step',
        label: 'for the [string] of [boolean]',
        script: '',
        help: ''
    }
], false);


wb.menu('Objects', [
    {
        blocktype: 'step',
        label: 'programming',
        script: 'local.object## = {};',
        help: 'create a new, empty object'
    }
], false);

wb.menu('Strings', [
    {
        blocktype: 'expression',
        label: 'fun',
        script: '{{1}}.split({{2}})',
        type: 'string',
        help: 'create an array by splitting the named string on the given string'
    }
], false);

wb.menu('Sensing', [
    {
        blocktype: 'expression',
        label: 'it', 
        type: 'boolean',
        script: 'global.mouse_x',
        help: 'The current horizontal mouse position'
    }
]);

$('.scripts_workspace').trigger('init');

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});
})();
