/*
 *    NODE PLUGIN
 *
 *    Support for writing Javascript for NODE.js using Waterbear
 *    will include Minecraft and RPi-GPIO and othe RPi stuff
 */

// Remove stage menu item until menus get templatized
var stageMenu = document.querySelector('[data-target=stage]').parentElement;
stageMenu.parentElement.removeChild(stageMenu);

// A couple of do-nothing scripts for compatibility
wb.runCurrentScripts = function(){ /* do nothing */ };
wb.clearStage = function(){ /* do nothing */ };


wb.wrap = function(script){
    return script;
};

wb.requiredjs={"before":{}, "after":{}};


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


    
wb.resetrun = function(message){
    messagebox.innerHTML = message;
    window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);
    document.querySelector('.run-scripts').style.display = 'inline-block';
    document.querySelector('.stop-scripts').style.display = 'none';
    //Event.remove('.stop-scripts', 'click');

};
    
wb.runScript = function(script){

    // TODO : workout the ws address from the page address
    var aHost = window.location.host.split(":");
    var oSocket = new WebSocket("ws://"+aHost[0]+":8080/");
    
    //var oSocket = new WebSocket("ws://192.168.1.101:8080/");
    
    var messagebox = document.querySelector('#messagebox');
    if(messagebox === null || messagebox.length === 0)
    {
        messagebox = wb.elem('div', {"id":"messagebox"});
        document.querySelector('.tabbar').appendChild(messagebox);
        messagebox = document.querySelector('#messagebox');
        
    }
    
    messagebox.innerHTML = "Connecting to Raspberry Pi";
    oSocket.onerror = function(event) {
        messagebox.innerHTML = "Error Communicating with RPi";
        window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);
        oSocket.close();
    };
    
    oSocket.onopen = function (event) {
        oSocket.send(JSON.stringify({"command":"run","code":script})); 
    };
    
    oSocket.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        switch(msg.type) {
            case "recieved":
                messagebox.innerHTML = "Code recieved on RPi";
                break;
            case "running":
                messagebox.innerHTML = "Code running on RPi "+ msg.pid;
                document.querySelector('.run-scripts').style.display = 'none';
                document.querySelector('.stop-scripts').style.display = 'inline-block';
                
                Event.once('.stop-scripts', 'click', null, function(){
                      oSocket.send(JSON.stringify({"command":"kill","pid":msg.pid}));
                });

                break;
            case "completed":
                wb.resetrun("Code Completed Successfully");
                oSocket.close();
                break;
            case "exit":
                wb.resetrun("Code Exited");
                oSocket.close();
                break;
            case "error":
                wb.resetrun("Code Failed " + msg.data.toString());
                oSocket.close();
                break;
            case "sterr":
                messagebox.innerHTML = "Error Recieved " + msg.data;
                break;    
            case "stdout":
                messagebox.innerHTML = "Data Recieved ";// + msg.data;
                console.log("msg.data =", msg.data.toString());
                break;    
        }
  
    };
};

function clearStage(event){
    document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
Event.on('.clear-stage', 'click', null, clearStage);
Event.on('.edit-script', 'click', null, clearStage);


    
    wb.groupsFromBlock = function(block){
        var group = block.dataset.group;
        var values = [];
        var childValues = [];
        if(typeof group !== "undefined")
        {
            values.push(group);
        }

        if (wb.matches(block, '.context')){
            var children = wb.findChildren(wb.findChild(block, '.contained'), '.block');            
            childValues = children.map(wb.groupsFromBlock);
            childValues.forEach(function(ar){
                values = values.concat(ar);
            });
        }
        return values;
    };
    
    wb.getGroupsFromElements = function(elements)
    {
        var blockgroups = elements.map(function(elem){
                return wb.groupsFromBlock(elem);
            });
      
        var groups = [];
        blockgroups.forEach(function(ar){
                    groups = groups.concat(ar);             
            });
        
        var uniquegroups = [];
        var usedgroups = {};
        groups.forEach(function(group){
            if(typeof usedgroups[group] === "undefined")
            {
                usedgroups[group] = group;
                uniquegroups.push(group);             
            }
        });
        return uniquegroups;
    
    };

wb.prettyScript = function(elements){
    
    var groups = wb.getGroupsFromElements(elements);    
    var before = groups.map(function(group){
        var req = wb.requiredjs.before[group];
        if(typeof req !== "undefined")
        {
            return req;
        }
        return "";
    }).join(" ")+ "\n// Your code starts here\n";
    
    var after = "\n//Your code ends here\n"+groups.map(function(group){
        var req = wb.requiredjs.after[group];
        if(typeof req !== "undefined")
        {
            return req;
        }
        return "";
    }).join(" ");
    
    var script = elements.map(function(elem){
        return wb.codeFromBlock(elem);
    }).join('');
    
    var pretty = js_beautify(before+script+after);
    
    //script = "var Minecraft = require('./minecraft-pi/lib/minecraft.js');\nrequire('./waterbear/dist/minecraftjs_runtime.js');\nvar client = new Minecraft('localhost', 4711, function() {\nvar zeros={x:0, y:0, z:0};\n"+script+"\n});";
    return pretty;
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
