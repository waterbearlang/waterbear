/*
 *    JAVASCRIPT PLUGIN
 *
 *    Support for writing Javascript using Waterbear
 *
 */


// Add some utilities

wb.wrap = function(script){
    return 'var global = new Global();(function(){var local = new Local(); try{local.canvas = document.createElement("canvas"); local.canvas.setAttribute("width", global.stage_width); local.canvas.setAttribute("height", global.stage_height); global.stage.appendChild(local.canvas); local.ctx = local.canvas.getContext("2d");' + script + '}catch(e){alert(e);}})()';
}

function runCurrentScripts(event){
    if (document.body.className === 'result' && wb.script){
        wb.runScript(wb.script);
    }else{
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        document.body.className = 'result';
        wb.runScript( wb.prettyScript(blocks) );
    }
}
Event.on('.runScripts', 'click', null, runCurrentScripts);

wb.runScript = function(script){
    wb.script = script;
    var runtimeUrl = location.protocol + '//' + location.host + '/dist/javascript_runtime.min.js';
    console.log('trying to load library %s', runtimeUrl);
    document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: runtimeUrl, script: wb.wrap(script)}), '*');
}

function clearStage(event){
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

// End UI section

// expose these globally so the Block/Label methods can find them
wb.choiceLists = {
    boolean: ['true', 'false'],
    keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
    blocktypes: ['step', 'expression', 'context', 'eventhandler'],
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

