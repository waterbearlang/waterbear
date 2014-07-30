/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */
(function(wb,Event){
    // Add some utilities
    'use strict';


    /* Wrap a script for execution in an iframe */
    // Maybe this should all be moved to runtime?
    wb.wrap = function(script){
        return [
            '(function(){',
                    'var main = function(){',
                        script,
                    '}',
                    'runtime.preloadAssets(' + assetUrls() + ', main);',
                // '}catch(e){',
                    // 'alert(e);',
                // '}',
            '})()'
        ].join('\n');
    };

    // Where is this used? What is it for?
    function assetUrls(){
        return '[' + wb.findAll(document.body, '.workspace .block-menu .asset').map(function(asset){
            // tricky and a bit hacky, since asset URLs aren't defined on asset blocks
            var source = document.getElementById(asset.dataset.localSource);
            return wb.getSocketValue(wb.block.sockets(source)[0]);
        }).join(',') + ']';
    }

    // Try to run the current script.
    // Bail if there is no view to run it in (either preview pane or running full size)
    // Bail if it is already running and hasn't changed
    // Bail if
    function runCurrentScripts(force){
        force = force === true; // ignore stray values like event objects
        if (! (wb.getState('preview') ||  wb.getState('fullSize')) ){
            console.log('false alarm: preview: %s, fullSize: %s', wb.getState('preview'), wb.getState('fullSize'));
            // false alarm, we were notified of a script change, but user hasn't asked us to restart script
            return;
        }
        // if ((wb.getState('isRunning') && !force)){
        //     // we're good, but thanks for asking
        //     // mark scriptModified on resize events?
        //     console.log('thanks for asking: isRunning: %s, force: %s', wb.getState('isRunning'), force);
        //     // Problem: we're getting script cleared events on startup. Why?
        //     // return;
        // }
        var blocks = wb.findAll(document.body, '.scripts_workspace');

        for (var i=0; i < blocks.length; i++){
            if (!wb.block.validate(blocks[i])){
                console.warn('Not running script because of invalid block(s)');
                return;
            }
        }

        document.body.classList.add('running');
        if (wb.getState('scriptReady') && wb.getState('stageReady')){
            console.log('ready to run script, let us proceed to the running of said script');
        }else{
            console.log('not ready to run script yet, waiting: scriptReady: %s, stageReady: %s', wb.getState('scriptReady'), wb.getState('stageReady'));
            return;
        }
        // update size of frame
        wb.setState('isRunning', true);
        wb.setState('scriptModified', false);
        wb.runScript( wb.prettyScript(blocks) );
    }
    wb.runCurrentScripts = runCurrentScripts;


    if (!wb.getState('stageReady')){
        document.querySelector('.stageframe').addEventListener('load', function(event){
            // console.log('iframe ready, waiting: %s', !!wb.iframewaiting);
            if (wb.iframewaiting){
                wb.iframewaiting();
            }
            wb.iframewaiting = null;
        }, false);
    }

    wb.runScript = function(script){
        // console.log('script: %s', script);
        var run = function(){
            wb.script = script;
            document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadScript', script: wb.wrap(script)}), '*');
            document.querySelector('.stageframe').focus();
        };
        if (wb.getState('stageReady')){
            // console.log('sending run to the iframe');
            wb.setState('stageReady', false);
            run();
        }else{
            // console.log('waiting for the stage to be ready before we run');
            wb.iframewaiting = run;
        }
    };

    function clearStage(event){
        wb.setState('stageReady', false);
        document.body.classList.remove('running');
        wb.setState('isRunning', false);
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
    }
    wb.clearStage = clearStage;
    Event.on('.clear-stage', 'click', null, clearStage);
    Event.on('.edit-script', 'click', null, clearStage);



    wb.prettyScript = function(elements){
        return js_beautify(elements.map(function(elem){
            return wb.block.code(elem);
        }).join(''));
    };

    wb.writeScript = function(elements, view){
        view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
        hljs.highlightBlock(view.firstChild);
    };

    // End UI section

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
    };

    // Hints for building blocks
    //
    //
    // Expression blocks can nest, so don't end their scripts with semi-colons (i.e., if there is a "type" specified).
    //
    //

    // Temporarily disable these until I can get time to implement them properly
    // wb.menu('Recent Blocks', []);
    // wb.menu('Favourite Blocks', []);



    Event.on('.socket input', 'click', null, function(event){
        event.target.focus();
        event.target.select();
    });

})(wb, Event);

