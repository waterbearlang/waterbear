/*
 *    NODE PLUGIN
 *
 *    Support for writing Javascript for NODE.js using Waterbear
 *    will include Minecraft and RPi-GPIO and othe RPi stuff
 */



wb.wrap = function(script){
    //return 'try{' + script + '}catch(e){console,log(e);}})()';
    return script;
};

function runCurrentScripts(event){
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        wb.runScript( wb.prettyScript(blocks) );        
}
Event.on('.run-scripts', 'click', null, runCurrentScripts);


wb.ajax = {
        jsonp: function(url, data, success, error){
            var callbackname = '_callback' + Math.round(Math.random() * 10000);
            window[callbackname] = function(result){
                delete window[callbackname];
                success(result);
            };
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4){
                    if (xhr.status === 200){
                        // this is particularly unsafe code
                        eval(xhr.responseText); // this should call window[callbackname]
                    }else{
                        delete window[callbackname];
                        error(xhr);
                    }
                }
            };
            xhr.open('GET', url + '?' + data + '&callback=' + callbackname, true);
            xhr.send();
        }
    };

wb.runScript = function(script){
  
    var params = {'code':script};
  
    var keys = Object.keys(params);
    var parts = [];
    keys.forEach(function(key){
      if (Array.isArray(params[key])){
        params[key].forEach(function(value){
          parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });
      }else{
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    });
    var query = parts.join('&');
    
    var messagebox = document.querySelector('#messagebox');
    if(messagebox === null || messagebox.length === 0)
    {
        messagebox = wb.elem('div', {"id":"messagebox"});
        document.querySelector('.tabbar').appendChild(messagebox);
        messagebox = document.querySelector('#messagebox');
        
    }
    messagebox.innerHTML = "Running Code on Raspberry Pi";
    
    
    
    wb.ajax.jsonp("../run", query, function(msg){
        
      console.log("run success msg =", msg);
      if(msg.status === "running")
      {
        messagebox.innerHTML = "Code running on RPi <span id=\"nodeprocessid\">"+ msg.pid+"</span>";
        
        //do status check call  
      }
      else if(msg.status === "recieved")
      {
        messagebox.innerHTML = "Code Recieved";
      }
      else if(msg.status === "success")
      {
        messagebox.innerHTML = "Code Completed";
        window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);
      }
      else if(msg.status === "error")
      {
        
        messagebox.innerHTML = "Code failed / server not running on RPi";
        window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);
      }
      
      
        
      //window.setTimeout(function(){messagebox.innerHTML="";}, 5000);
      console.log("success",msg);
    },
    
    function(msg){
      console.log("msg =", msg);
      messagebox.innerHTML = "Code failed / server not running on RPi";
      window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);
      console.log("error",msg);
    });
    
    //wb.ajax.jsonp("../run", query, function(msg){messagebox.innerHTML = "Code Complete"; window.setTimeout(function(){messagebox.innerHTML="";}, 5000);console.log("success",msg);}, function(){ messagebox.innerHTML = "Code failed / server not running on RPi"; window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);console.log("error",msg);});
    
    //var runtimeUrl = location.protocol + '//' + location.host + '/dist/javascript_runtime.min.js';
    //console.log('trying to load library %s', runtimeUrl);
    //document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'loadlibrary', library: //runtimeUrl, script: wb.wrap(script)}), '*');
};

function clearStage(event){
    document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
Event.on('.clear-stage', 'click', null, clearStage);
Event.on('.edit-script', 'click', null, clearStage);



wb.prettyScript = function(elements){
    var script = js_beautify(elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join(''));
    //script = "var Minecraft = require('./minecraft-pi/lib/minecraft.js');\nrequire('./waterbear/dist/minecraftjs_runtime.js');\nvar client = new Minecraft('localhost', 4711, function() {\nvar zeros={x:0, y:0, z:0};\n"+script+"\n});";
    return script;
};

wb.writeScript = function(elements, view){
    view.innerHTML = '<pre class="language-javascript">' + wb.prettyScript(elements) + '</pre>';
    hljs.highlightBlock(view.firstChild);
};

// End UI section

// expose these globally so the Block/Label methods can find them
wb.choiceLists = {
    boolean: ['true', 'false'],
    blocktypes: ['step', 'expression', 'context', 'eventhandler'],
    types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
    rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
};

// Hints for building blocks
//
//`
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


/* TODO : 
https://npmjs.org/package/omxcontrol
https://npmjs.org/package/omxdirector
https://npmjs.org/package/piglow
https://npmjs.org/package/raspicam


*/
