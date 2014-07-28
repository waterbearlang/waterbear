/*
 * SCHEME PLUGIN
 *
 * Support for writing Scheme in Waterbear
 */

(function(wb, Event){
 'use strict';
    var bscheme = new BiwaScheme.Interpreter(function(e, state) {
        document.querySelector('.stageframe').contentWindow.document.write(e.message);
    });
    wb.runScript = function(script){
        var run = function(){
            wb.script = script;
            var scriptArray = script.split(";;end");

            for(var i = 0; i < scriptArray.length; i++) {
                console.log('THIS IS IMPORTANT:' + scriptArray[i]);
                bscheme.evaluate(scriptArray[i], function(result) {
                    if (result !== undefined && result !== BiwaScheme.undef) {
                        console.log(BiwaScheme.to_write(result));
                        document.querySelector('.stageframe').contentWindow.document.write('==> ' + result + '<br>');
                    }
                });
            }
        }
        run();
    };

    wb.writeScript = function(elements, view){
        var script = elements.map(function(elem){
            return wb.block.code(elem);
        }).join('');
        view.innerHTML = '<pre class="language-scheme">' + script + '</pre>';
    };

    wb.wrap = function(script){ //doesn't do anything
        return "";
    };;

    function runCurrentScripts(force){
        // console.log('runCurrentScripts: %s', runCurrentScripts.caller.name);
        if (!(wb.state.autorun || force)){
            // false alarm, we were notified of a script change, but user hasn't asked us to restart script
            return;
        }
        document.body.classList.add('running');
        if (!wb.state.scriptLoaded){
            console.log('not ready to run script yet, waiting');
            Event.once(document.body, 'wb-script-loaded', null, function(event){
                Event.trigger(document.body, 'wb-initialize', {component: 'script'});
            });
            return;
        }else{
            console.log('ready to run script, let us proceed to the running of said script');
        }
        var blocks = wb.findAll(document.body, '.workspace .scripts-workspace');
        wb.runScript( wb.prettyScript(blocks) );
    }
    wb.runCurrentScripts = runCurrentScripts;

    function clearStage(event){
        wb.state.stageReady = false;
        document.querySelector('.stageframe').contentWindow.document.body.innerHTML = '';
    }
    wb.clearStage = clearStage;

    //TODO: add extra block types: In Scheme, everything is a value, and these need to be able to exist on their own
    // expose these globally so the Block/Label methods can find them
     wb.choiceLists = {
        boolean: ['#t', '#f'],
        keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
            .split('').concat(['up', 'down', 'left', 'right',
            'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
            'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
            'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
        blocktypes: ['step', 'expression', 'context', 'eventhandler', 'asset'],
        types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
        rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
    };

     wb.prettyScript = function(elements){
        return elements.map(function(elem){
            return wb.block.code(elem);
        }).join('');
    };
})(wb, Event);
