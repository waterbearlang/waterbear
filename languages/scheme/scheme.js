/*Implement wb.wrap(script)
*wb.runCurrentScripts(false)
*wb.clearStage()
*wb.choiceLists
*scheme_runtime.js
*/

(function(wb, Event){
 'use strict';
    wb.wrap = function(script){
        return "";
    }
    
    function runCurrentScripts(force){
        
    }
    wb.runCurrentScripts = runCurrentScripts;
 
    function clearStage(event){
        wb.iframeReady = false;
        document.body.classList.remove('running');
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
    }
    wb.clearStage = clearStage;
    
     wb.choiceLists = {
        boolean: ["#t", "#f"],
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
        return js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join(''));
    };
    
    wb.writeScript = function(elements, view){
        view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
        //hljs.highlightBlock(view.firstChild);
    }; 
 
})(wb, Event);