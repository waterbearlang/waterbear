/*
 *    PROCESSINGJS PLUGIN
 *
 *    Support for writing ProcessingJS using Waterbear
 *
 */

 var load = function (pjs_code) {
   var previewFrame = document.getElementById('preview_iframe');
   var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;

    var preamble = "<script src=\"http://processingjs.org/js/processing.min.js\"><\/script><canvas id=\"processing-canvas\"><\/canvas><script type=\"text/processing\" data-processing-target=\"processing-canvas\">";
    var postamble = "<\/script>";
 
 preview.open();
    preview.write(preamble + pjs_code + postamble);
 preview.close();
 
};

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
    document.body.className = 'result';
    wb.runScript( wb.prettyScript(blocks) );
    load( wb.prettyScript(blocks) );
}
Event.on('.runScripts', 'click', null, runCurrentScripts);

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
        var runtimeUrl = location.protocol + '//' + location.host + path + '/dist/processingjs_runtime.js';
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

