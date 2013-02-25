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
        id: '58f4f2c1-e9ea-4e81-b3fd-07917c4154f8',
        label: 'Waterbear',
        script: 'function _start(){[[1]]}_start();',
        help: 'this trigger will run its scripts once when the program starts'
    }
], true);

wb.menu('Arrays', [
    {
        blocktype: 'step',
        id: '834031f5-7a11-4b3d-a271-9624243e98a2',
        label: 'for the [string] of [boolean]',
        script: '',
        help: ''
    }
], false);


wb.menu('Objects', [
    {
        blocktype: 'step',
        id: '658f03ac-e4d2-43ff-932c-15bcb70f0286',
        label: 'programming',
        script: 'local.object## = {};',
        help: 'create a new, empty object'
    }
], false);

wb.menu('Strings', [
    {
        blocktype: 'expression',
        id: '0de9fced-ecae-4517-88e1-e2254c23c5fa',
        label: 'fun',
        script: '{{1}}.split({{2}})',
        type: 'string',
        help: 'create an array by splitting the named string on the given string'
    }
], false);

wb.menu('Sensing', [
    {
        blocktype: 'expression',
        id: '885a6f5a-ddd9-4de1-b0cf-169f208aade9',
        label: 'it',
        type: 'boolean',
        script: 'global.mouse_x',
        help: 'The current horizontal mouse position'
    }
]);

})();
