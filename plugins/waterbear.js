/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */

(function(){

// Pre-load dependencies
yepnope({
    load: [
        'plugins/javascript.css'
    ]
});



// MENUS

wb.menu('Control', [
    {
        blocktype: 'eventhandler',
        labels: ['Waterbear'],
        script: 'function _start(){[[1]]}_start();',
        help: 'this trigger will run its scripts once when the program starts'
    }
], true);

wb.menu('Arrays', [
    {
        blocktype: 'step',
        labels: ['for the [string] of [boolean]'],
        script: '',
        help: ''
    }
], false);


wb.menu('Objects', [
    {
        blocktype: 'step',
        labels: ['programming'],
        script: 'local.object## = {};',
        help: 'create a new, empty object'
    }
], false);

wb.menu('Strings', [
    {
        blocktype: 'expression',
        labels: ['fun'],
        script: '{{1}}.split({{2}})',
        type: 'string',
        help: 'create an array by splitting the named string on the given string'
    }
], false);

wb.menu('Sensing', [
    {
        blocktype: 'expression',
        labels: ['it'],
        type: 'boolean',
        script: 'global.mouse_x',
        help: 'The current horizontal mouse position'
    }
]);

})();
