/* 
 *    HUMUS PLUGIN
 * 
 *    Support for writing Humus using Waterbear
 *
 */


// Pre-load dependencies
yepnope({
    load: 'plugins/humus.css',
	complete: setup
});
/*
yepnope({
    load: [ 'plugins/humus.css',
            'lib/beautify.js',
            'lib/highlight.js',
            'lib/highlight-javascript.js',
            'lib/highlight-github.css'
    ],
    complete: setup
});
*/
// Add some utilities
jQuery.fn.extend({
  extract_script: function(){
      if (this.length === 0) return '';
      if (this.is(':input')){
//          if (this.parent().is('.string') || this.parent().is('.color')){
//              return '"' + this.val() + '"';
//          }else{
              return this.val();
//          }
      }
      if (this.is('.empty')) return '# ...\n';
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
      var retval = '/*** \n' + script + ' ***/\n';
      //console.log(retval);
      return retval;
  },
  pretty_script: function(){
      return this.map(function(){ return $(this).extract_script();}).get().join('##');
  },
  write_script: function(view){
      view.html('<pre class="language-humus">' + this.pretty_script() + '</pre>');
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
    definition: menu('Definition', [
		/*
        {
            label: 'LET [pattern] = [pattern]',
            script: 'LET {{1}} = {{2}}\n',
            help: 'equate patterns'
        },
        {
            label: 'LET [string]([pattern]) = [expression]',
            script: 'LET {{1}}({{2}}) = {{3}}\n',
            help: 'define a function'
        },
        {
            label: 'LET [string] = [expression]',
            script: 'LET {{1}} = {{2}}\n',
            returns: {
                label: '{{1}}',
                script: '{{1}}',
                type: 'expression'
            },
            help: 'define a variable'
        },
		*/
        {
            label: 'define [pattern] as [expression]',
            script: 'LET {{1}} = $({{2}})\n',
            help: 'bind pattern to value'
        },
        {
            label: 'define variable## as [expression]',
            script: 'LET variable## = $({{1}})\n',
            returns: {
                label: 'variable##',
                script: 'variable##',
                type: 'expression'
            },
            help: 'define a new variable'
        },
        {
            label: 'define function##([pattern]) as [expression]',
            script: 'LET function##({{1}}) = ({{2}})\n',
            returns: {
                label: 'function##',
                script: 'function##',
                type: 'expression'
            },
            help: 'define a new function'
        },
        {
            label: 'define behavior## as',
            containers: 1,
            script: 'LET behavior## = [[1]]\n',
            returns: {
                label: 'behavior##',
                script: 'behavior##',
                type: 'expression'
            },
            help: 'define an actor behavior'
        },
        {
            label: 'define behavior##([pattern]) as',
            containers: 1,
            script: 'LET behavior##({{1}}) = [[1]]',
            returns: {
                label: 'behavior##',
                script: 'behavior##',
                type: 'expression'
            },
            help: 'define an actor behavior with parameters'
        }
    ], false),
    action: menu('Action', [
        {
            label: 'perform actions',
            trigger: true,
            locals: [
                {
                    label: 'console',
                    script: 'println',
                    type: 'expression',
					help: 'display message to the console'
                },
                {
                    label: 'random',
                    script: 'random',
                    type: 'expression',
					help: 'generate a random number'
                },
                {
                    label: 'sink',
                    script: 'sink',
                    type: 'expression',
					help: 'ignore message'
                }
            ],
            containers: 1,
            slot: false, 
            script: '# Humus Program\n\n[[1]]',
            help: 'perform actions when the program starts'
        },
        {
            label: 'send [expression] to [expression]',
            script: 'SEND {{1}} TO {{2}}\n',
            help: 'send a message to an actor'
        },
        {
            label: 'create actor## with [expression]',
            script: 'CREATE actor## WITH {{1}}\n',
            returns: {
                label: 'actor##',
                script: 'actor##',
                type: 'expression'
            },
            help: 'create an actor with an initial behavior'
        },
        {
            label: 'create actor## with behavior',
            containers: 1,
            script: 'CREATE actor## WITH [[1]]',
            returns: {
                label: 'actor##',
                script: 'actor##',
                type: 'expression'
            },
            help: 'create an actor with an initial behavior'
        },
        {
            label: 'react to [pattern] by performing',
            containers: 1,
            slot: false, 
            script: '\\({{1}}).[\n[[1]]]\n',
            help: 'actor behavior on message receipt'
        },
		/*
        {
            label: 'react to [pattern] with',
            script: '\\({{1}}).[\n[[next]]]\n',
            help: 'actor behavior on message receipt'
        },
		*/
        {
            label: 'when [expression] matches one of:',
            containers: 1,
            script: 'CASE ({{1}}) OF\n[[1]]END\n',
            help: 'match expression against patterns'
        },
        {
            label: 'case [pattern] then perform',
            containers: 1,
            script: '({{1}}) : [\n[[1]]]\n',
            help: 'perform actions if pattern matches'
        },
        {
            label: 'otherwise perform',
            containers: 1,
            slot: false, 
            script: '_ : [\n[[1]]]\n',
            help: 'perform actions if no other case matches'
        },
        {
            label: 'change behavior to [expression]',
            script: 'BECOME {{1}}\n',
            help: 'set behavior for subsequent messages'
        },
        {
            label: 'change behavior to',
            containers: 1,
            script: 'BECOME [[1]]',
            help: 'set behavior for subsequent messages'
        },
        {
            label: '[expression]([expression])',
            slot: false, 
            script: '{{1}}({{2}})',
            help: 'function call'
        },
		/*
        {
            label: 'perform',
            containers: 1,
            script: '[\n[[1]]]\n',
            help: 'perform a block of actions'
        },
        {
            label: 'perform [expression]',
            script: '{{1}}\n',
            help: 'evaluate an expression and perform the resulting actions'
        },
		*/
        {
            label: 'signal error [expression]',
            script: 'THROW {{1}}\n',
            help: 'throw an exception'
        }
    ], true),
    pattern: menu('Pattern', [
        {
            label: 'bind [string:name]',
            script: '{{1}}',
            type: 'pattern',
            help: 'bind variable to value'
        },
		/*
        {
            label: 'slot##',
            script: 'slot##',
            returns: {
                label: 'slot##',
                script: 'slot##',
                type: 'expression'
            },
            type: 'pattern',
            help: 'fill in a slot'
        },
		*/
        {
            label: 'Ignore',
            script: '_',
            type: 'pattern',
            help: 'match without binding'
        },
        {
            label: 'value of [expression]',
            script: '$({{1}})',
            type: 'pattern',
            help: 'match value of expression'
        },
		/*
        {
            label: 'bind parameter##',
            script: '',
            returns: {
                label: 'parameter##',
                script: 'parameter##',
                type: 'expression'
            },
            help: 'bind parameter to value'
        },
		*/
        {
			label: '[pattern], [pattern]', 
			type: 'pattern', 
			script: "{{1}}, {{2}}",
			help: 'match a pair'
        }
    ], false),
    expression: menu('Expression', [
        {
            label: 'lookup [string:name]',
            script: '{{1}}',
            type: 'expression',
            help: 'lookup value of variable'
        },
        {
            label: 'function [pattern] -> [expression]',
            script: '\\{{1}}.{{2}}',
            type: 'expression',
            help: 'anonymous function'
        },
		/*
        {
            label: 'function (arg##) -> [expression]',
            script: '\\(arg##).({{1}})\n',
            returns: {
                label: 'arg##',
                script: 'arg##',
                type: 'expression'
            },
            type: 'expression',
            help: 'a one-argument function'
        },
		*/
        {
            label: '[expression]([expression])',
            script: '{{1}}({{2}})',
            type: 'expression',
            help: 'function call'
        },
        {
            label: 'actions',
            script: '[\n[[1]]]\n',
            trigger: false,
            slot: false,
            containers: 1,
            type: 'expression',
            help: 'a block of statements'
        },
        {
            label: 'no action',
            script: '[]\n',
            type: 'expression',
            help: 'empty block'
        },
        {
			label: 'symbol [string:name]', 
			type: 'expression', 
			script: "#{{1}}",
			help: 'symbolic value'
        },
        {
			label: 'number [number:0]', 
			type: 'expression', 
			script: "({{1}})",
			help: 'numeric value'
        },
        {
            label: 'SELF',
            script: 'SELF',
            type: 'expression',
            help: 'identity of the current actor'
        },
        {
            label: 'Undefined',
            script: '?',
            type: 'expression',
            help: 'undefined value'
        },
        {
            label: 'TRUE',
            script: 'TRUE',
            type: 'expression',
            help: 'boolean true'
        },
        {
            label: 'FALSE',
            script: 'FALSE',
            type: 'expression',
            help: 'boolean false'
        },
        {
            label: 'NIL',
            script: 'NIL',
            type: 'expression',
            help: 'empty tuple'
        },
        {
			label: '[expression], [expression]', 
			type: 'expression', 
			script: "({{1}}, {{2}})",
			help: 'pair value'
        }
    ], false)
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
