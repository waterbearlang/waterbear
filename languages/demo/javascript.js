/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */


// Add some utilities
wb.wrap = function(script){
    return [
        'var global = new Global();',
        '(function(){', 
            'var local = new Local();', 
            // 'try{',
                'local.canvas = document.createElement("canvas");',
                'local.canvas.setAttribute("width", global.stage_width);',
                'local.canvas.setAttribute("height", global.stage_height);',
                'global.stage.appendChild(local.canvas);',
                'local.canvas.focus()',
                'local.ctx = local.canvas.getContext("2d");',
                'local.ctx.textAlign = "center";',
                'var main = function(){',
                    script,
                '}',
                'global.preloadAssets(' + assetUrls() + ', main);',
            // '}catch(e){',
                // 'alert(e);',
            // '}',
        '})()'
    ].join('\n');
}

function assetUrls(){
    return '[' + wb.findAll(document.body, '.workspace .block-menu .asset').map(function(asset){
        // tricky and a bit hacky, since asset URLs aren't defined on asset blocks
        var source = document.getElementById(asset.dataset.localSource);
        return wb.getSocketValue(wb.getSockets(source)[0]);
    }).join(',') + ']';
}

function runCurrentScripts(event){
    var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
    wb.runScript( wb.prettyScript(blocks) );
}
wb.runCurrentScripts = runCurrentScripts;

Event.on('.run-scripts', 'click', null, function(){
    document.body.className = 'result';
    wb.historySwitchState('result');
    runCurrentScripts();
});

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
        var path = location.pathname.slice(0,location.pathname.lastIndexOf('/'));
        var runtimeUrl = location.protocol + '//' + location.host + path + '/dist/javascript_runtime.js';
        // console.log('trying to load library %s', runtimeUrl);
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: runtimeUrl, script: wb.wrap(script)}), '*');
        document.querySelector('.stageframe').focus();
    };
    if (wb.iframeready){
        run();
    }else{
        wb.iframewaiting = run;
    }
}

function clearStage(event){
    document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
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

