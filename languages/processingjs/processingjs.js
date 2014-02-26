/*
 *    PROCESSINGJS PLUGIN
 *
 *    Support for writing ProcessingJS using Waterbear
 *
 */

(function(wb, Event){


    // Remove stage menu item until menus get templatized
    var stageMenu = document.querySelector('[data-target=stage]').parentElement;
    stageMenu.parentElement.removeChild(stageMenu);

    // A couple of do-nothing scripts for compatibility
    wb.runCurrentScripts = function(){ /* do nothing */ };
    wb.clearStage = function(){ /* do nothing */ };

    // Add some utilities
    wb.wrap = function(script){
        return [
            'var canvas = document.createElement("canvas");',
            'document.querySelector(".stage").appendChild(canvas);',
            'var processing = new Processing(canvas,',
                Processing.compile(script).sourceCode,
            ');'
        ].join('\n');
    }

    function runCurrentScripts(){
        // console.log('runCurrentScripts');
        if (!(wb.autorun || force)){
            // false alarm, we were notified of a script change, but user hasn't asked us to restart script
            return;
        }
        document.body.classList.add('running');
                
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        wb.runScript( wb.prettyScript(blocks) );
    }
    wb.runCurrentScripts = runCurrentScripts;

    window.addEventListener('load', function(event){
        console.log('iframe ready');
        wb.iframeready = true;
        if (wb.iframewaiting){
            wb.iframewaiting();
        }
        wb.iframewaiting = null;
    }, false);

    wb.runScript = function(script){
        var run = function(){
            wb.script = script;
            // console.log(wb.wrap(script));
            var path = location.pathname.slice(0,location.pathname.lastIndexOf('/'));
            var runtimeUrl = location.protocol + '//' + location.host + path + '/dist/processingjs_runtime.js';
            // console.log('trying to load library %s from outer window', runtimeUrl);
            document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: runtimeUrl, script: wb.wrap(script)}), '*');
            document.querySelector('.stageframe').focus();
        };
        if (wb.iframeready){
            run();
        }else{
            wb.iframewaiting = run;
        }
    }

    Event.on('.run-scripts', 'click', null, function(){
        wb.historySwitchState('result');
    });



    function clearStage(event){
        document.body.classList.remove('running');
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
    }
    Event.on('.clear_canvas', 'click', null, clearStage);
    Event.on('.editScript', 'click', null, clearStage);


    wb.prettyScript = function(elements){
        return js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join(''));
    };

    wb.writeScript = function(elements, view){
        view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
        hljs.highlightBlock(view.firstChild);
    };

    //<script type="text/processing" data-processing-target="processing-canvas">
    //void setup() {
    //  size(200, 200);
    //  background(100);
    //  stroke(255);
    //  ellipse(50, 50, 25, 25);
    //  println('hello web!');
    //}
    //</script>
    //<canvas id="processing-canvas"> </canvas>

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

    Event.on('.socket input', 'click', null, function(event){
        event.wbTarget.focus();
        event.wbTarget.select();
    });

})(wb, Event);