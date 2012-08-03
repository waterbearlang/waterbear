/* 
 *    JAVASCRIPT PLUGIN
 * 
 *    Support for writing Javascript using Waterbear
 *
 */


// Pre-load dependencies
yepnope({
    load: [ 'plugins/javascript.css',
            'lib/beautify.js',
            'lib/highlight.js',
            'lib/highlight-javascript.js',
            'lib/highlight-github.css'
    ],
    complete: javascript_setup
});

// Add some utilities
jQuery.fn.extend({
  prettyScript: function(){
      return js_beautify(this.map(function(){ return $(this).extract_script();}).get().join(''));
  },
  writeScript: function(view){
      view.html('<pre class="language-javascript">' + this.prettyScript() + '</pre>');
      hljs.highlightBlock(view.children()[0]);
  }
});

function javascript_setup(){
    // This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global


window.updateScriptsView = function(){
    var blocks = $('.workspace:visible .scripts_workspace > .wrapper');
    //console.log('found %s scripts to view', blocks.length);
    var view = $('.workspace:visible .scripts_text_view');
    blocks.writeScript(view);
}

function runScripts(event){
    $('.stage')[0].scrollIntoView();
    var blocks = $('.workspace:visible .scripts_workspace > .trigger');
    $('.stage').replaceWith('<div class="stage"><script>' + blocks.wrapScript() + '</script></div>');
}
$('.runScripts').click(runScripts);

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

// Hints for building blocks
//
//
// Value blocks can nest, so don't end them with semi-colons (i.e., if there is a "type" specified).
//
//

// MENUS

menu('Control', [
    {
        blocktype: 'eventhandler',
        contained: [{label: 'Waterbear'}],
        script: 'function _start(){[[1]]}_start();',
        help: 'this trigger will run its scripts once when the program starts'
    }
], true);

menu('Arrays', [
    {
        blocktype: 'step',
        label: 'for the [string] of [boolean]',
        script: '',
        help: ''
    }
], false);


menu('Objects', [
    {
        blocktype: 'step',
        label: 'programming',
        script: 'local.object## = {};',
        help: 'create a new, empty object'
    }
], false);

menu('Strings', [
    {
        blocktype: 'expression',
        label: 'fun',
        script: '{{1}}.split({{2}})',
        type: 'string',
        help: 'create an array by splitting the named string on the given string'
    }
], false);

menu('Sensing', [
    {
        blocktype: 'expression',
        label: 'it', 
        type: 'boolean',
        script: 'global.mouse_x',
        help: 'The current horizontal mouse position'
    }
]);

var demos = [];
populateDemosDialog(demos);
loadCurrentScripts();
$('.scripts_workspace').trigger('init');

$('.socket input').live('click',function(){
    $(this).focus();
    $(this).select();
});
}
