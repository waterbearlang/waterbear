/*
 *    NODE PLUGIN
 *
 *    Support for writing Javascript for NODE.js using Waterbear
 *    will include Minecraft and RPi-GPIO and othe RPi stuff
 */

// Remove stage menu item until menus get templatized
var stageMenu = document.querySelector('[data-target=stage]').parentElement;
stageMenu.parentElement.removeChild(stageMenu);

var menu = document.querySelector('.menu');
console.log("menu =", menu);

var newLi = document.createElement("li");
var newBtn = document.createElement("button");
newBtn.classList.add("run-remote");
newBtn.textContent = "Run";
newLi.appendChild(newBtn);
menu.appendChild(newLi);

var newLi2 = document.createElement("li");
var newBtn2 = document.createElement("button");
newBtn2.classList.add("stop-remote");
newBtn2.textContent = "Stop";
newLi2.appendChild(newBtn2);
menu.appendChild(newLi2);

//document.querySelector('.stop-remote').style.display = 'none';
//var stop = document.querySelector('.stop-remote');
//console.log("stop =", stop);
//wb.hide(stop);

wb.hide(document.querySelector('.stop-remote'));


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
Event.on('.run-remote', 'click', null, runCurrentScripts);


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
    var messagebox = document.querySelector('.messagebox');
    messagebox.innerHTML = message;
    window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);
    //document.querySelector('.run-remote').style.display = 'inline-block';
    //document.querySelector('.stop-remote').style.display = 'none';
    wb.hide(document.querySelector('.stop-remote'));
    wb.show(document.querySelector('.run-remote'));
    
    //Event.remove('.stop-remote', 'click');

};
    
wb.runScript = function(script){

    var aHost = window.location.host.split(":");
    var oSocket = new WebSocket("ws://"+aHost[0]+":8080/");
    
    var messagebox = document.querySelector('.messagebox');
    messagebox.innerHTML = "Connecting to Raspberry Pi";
    
    oSocket.onerror = function(event) {
        messagebox.innerHTML = "Error Communicating with RPi";
        window.setTimeout(function(){messagebox.innerHTML = "";}, 5000);
        oSocket.close();
    };
    
    oSocket.onopen = function (event) {
        messagebox.innerHTML = "Sending Code to RPi";
        oSocket.send(JSON.stringify({"command":"run","code":script})); 
    };
    
    
    oSocket.onclose = function (event) {
        wb.resetrun("Communication Ended");
    };
    
    oSocket.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        switch(msg.type) {
            case "recieved":
                messagebox.innerHTML = "Code recieved on RPi";
                break;
            case "running":
                messagebox.innerHTML = "Code running on RPi "+ msg.pid;
                var runbutton= document.querySelector('.run-remote')
                console.log("runbutton =", runbutton);
                wb.hide(runbutton);
                //document.querySelector('.stop-remote').style.display = 'inline-block';
                wb.show(document.querySelector('.stop-remote'));
                
                Event.once('.stop-remote', 'click', null, function(){
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
    }).join(" ")+"\n process.on('SIGINT', process.exit);";
    
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
