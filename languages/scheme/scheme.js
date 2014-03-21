/*
 * SCHEME PLUGIN
 *
 * Support for writing Scheme in Waterbear
 */

(function(wb,Event){
    'use strict';
    var bscheme = new BiwaScheme.Interpreter(function(e, state) {
        console.error(e.message);
    });
    wb.runScript = function(script){
        var run = function(){
            wb.script = script;
            bscheme.evaluate(script, function(result) {
                if (result !== undefined && result !== BewaScheme.undef) {
                    console.log(BiwaScheme.to_write(result));
                }
            });
        }
        run();
    }

    wb.writeScript = function(elements, view){
        var script = elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join('');
        view.innerHTML = '<pre class="language-scheme">' + script + '</pre>';
    };

    wb.runCurrentScripts = function(){ /* do nothing */ };
        
    wb.clearStage = function(){ /* do nothing */ };


    // NOTE: Taken directly from the JS file needs modification
    // expose these globally so the Block/Label methods can find them
    wb.choiceLists = {
        boolean: ['true', 'false'],
        keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
            .split('').concat(['up', 'down', 'left', 'right',
            'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
            'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
            'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
        blocktypes: ['step', 'expression', 'context', 'eventhandler', 'asset'],
        types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
        rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
    }})(wb, Event);

