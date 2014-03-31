/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */
(function(wb,Event){
    // Add some utilities
    'use strict';
    wb.wrap = function(script){
        return [
            '(function(){', 
                    'var main = function(){',
                        script,
                    '}',
                    'global.preloadAssets(' + assetUrls() + ', main);',
                // '}catch(e){',
                    // 'alert(e);',
                // '}',
            '})()'
        ].join('\n');
    };

    function assetUrls(){
        return '[' + wb.findAll(document.body, '.workspace .block-menu .asset').map(function(asset){
            // tricky and a bit hacky, since asset URLs aren't defined on asset blocks
            var source = document.getElementById(asset.dataset.localSource);
            return wb.getSocketValue(wb.getSockets(source)[0]);
        }).join(',') + ']';
    }

    function runCurrentScripts(force){
        // console.log('runCurrentScripts: %s', runCurrentScripts.caller.name);
        if (!(wb.autorun || force)){
            // false alarm, we were notified of a script change, but user hasn't asked us to restart script
            return;
        }
        document.body.classList.add('running');
        if (!wb.scriptLoaded){
            console.log('not ready to run script yet, waiting');
            // Event.on(document.body, 'wb-script-loaded', null, wb.runCurrentScripts);
            return;
        }else{
            console.log('ready to run script, let us proceed to the running of said script');
        }
        var blocks = wb.findAll(document.body, '.scripts_workspace');
        // update size of frame
        var iframe = document.querySelector('.stageframe');
        iframe.style.width =  iframe.parentElement.clientWidth + 'px';
        iframe.style.height = iframe.parentElement.clientHeight + 'px';
        wb.runScript( wb.prettyScript(blocks) );
    }
    wb.runCurrentScripts = runCurrentScripts;


    if (!wb.iframeReady){
        document.querySelector('.stageframe').addEventListener('load', function(event){
            console.log('iframe ready, waiting: %s', !!wb.iframewaiting);
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
        if (wb.iframeReady){
            run();
        }else{
            wb.iframewaiting = run;
        }
    };

    function clearStage(event){
        wb.iframeReady = false;
        document.body.classList.remove('running');
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
    }
    wb.clearStage = clearStage;
    Event.on('.clear-stage', 'click', null, clearStage);
    Event.on('.edit-script', 'click', null, clearStage);



    wb.prettyScript = function(elements){
        return js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
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
        event.wbTarget.focus();
        event.wbTarget.select();
    });

})(wb, Event);

