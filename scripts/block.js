// Revised Block handling.
//
// Nearly all the block is defined in the HTML and DOM
// This file helps to initialize the block DOM, and provide
// support routines
//
// The idea here is that rather than try to maintain a separate "model" to capture
// the block state, which mirrors the DOM and has to be kept in sync with it,
// just keep that state in the DOM itself using attributes (and data- attributes)
//
// Block(obj) -> Block element
// scriptForId(scriptid) -> script template
// nextSeqNum() -> int
// registerSeqNum(int) make sure we don't re-use sequence numbers
// Socket(json) -> Socket element

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(wb){
'use strict';
    var elem = wb.elem;

    var nextSeqNum = 0;
    var blockRegistry = {};/* populated in function "registerBlock", which is
                               called by the Block() function below*/
    // variables for code map
    var codeMap_view = document.querySelector('.code_map');
    var recently_removed = null;
                            

    function newSeqNum(){
        nextSeqNum++;
        return nextSeqNum;
    }

    function registerSeqNum(seqNum){
        // When reifying saved blocks, call this for each block to make sure we start new blocks
        // that do not overlap with old ones.
        if (!seqNum){
            return;
        }
        nextSeqNum = Math.max(parseInt(seqNum, 10), nextSeqNum);
    }

    function resetSeqNum(){
        console.log('resetSeqNum (and also block registry)');
        nextSeqNum = 0;
        // the lines below were breaking loading from files, and probably any load after the menus were built
        // blockRegistry = {};
        // wb.blockRegistry = blockRegistry;
    }

    function registerBlock(blockdesc){
        if (blockdesc.seqNum){
            registerSeqNum(blockdesc.seqNum);
        }else if (!blockdesc.isTemplateBlock){
            blockdesc.seqNum = newSeqNum();
        }
        if (! blockdesc.id){
            blockdesc.id = uuid();
        }
        blockRegistry[blockdesc.id] = blockdesc;
    }

    function getHelp(id){
        return blockRegistry[id] ? blockRegistry[id].help : '';
    }

    function getScript(id){
        try{
            return blockRegistry[id].script;
        }catch(e){
            console.error('Error: could not get script for %o', id);
            console.error('Hey look: %o', document.getElementById(id));
            return '';
        }
    }

    function getSockets(block){
        return wb.findChildren(wb.findChild(block, '.label'), '.socket');
    }

    function getSocketValue (socket){
        return socketValue(wb.findChild(socket, '.holder'));
    }

    function createSockets(obj, cloneForCM){
        return obj.sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj, cloneForCM);
        });
    }

    var Block = function(obj, cloneForCM){
        if (cloneForCM){
            obj.id = obj.id + '-d';
        }
        registerBlock(obj);
        // if (!obj.isTemplateBlock){
        //     console.log('block seq num: %s', obj.seqNum);
        // }
        if (!obj.isTemplateBlock){
            updateFromTemplateBlock(obj);
        }
        var block = elem(
            'div',
            {
                'class': function(){
                    var names = ['block', obj.group, obj.blocktype];
                    if(obj.blocktype === "expression"){
                        names.push(obj.type);
                        names.push(obj.type+'s'); // FIXME, this is a horrible hack for CSS
                    }else if (obj.blocktype === 'context'){
                        names.push('step');
                    }else if (obj.blocktype === 'eventhandler'){
                        names.push('step');
                        names.push('context');
                    }else if (obj.blocktype === 'asset'){
                        names.push('expression');
                    }
                    if (cloneForCM){
                        names.push('cloned');
                    }
                    return names.join(' ');
                },
                'data-blocktype': obj.blocktype,
                'data-group': obj.group,
                'id': obj.id,
                'data-scope-id': obj.scopeId || 0,
                'data-script-id': obj.scriptId || obj.id,
                'data-local-source': obj.localSource || null, // help trace locals back to their origin
                'data-sockets': JSON.stringify(obj.sockets),
                'data-locals': JSON.stringify(obj.locals),
                'data-keywords': JSON.stringify(obj.keywords),
                'title': obj.help || getHelp(obj.scriptId || obj.id)
            },
            elem('div', {'class': 'label'}, createSockets(obj, cloneForCM))
        );
        if (obj.seqNum){
            block.dataset.seqNum = obj.seqNum;
        }
        if (obj.type){
            block.dataset.type = obj.type; // capture type of expression blocks
        }
        if (obj.script){
            block.dataset.script = obj.script;
        }
        if (obj.isLocal){
            block.dataset.isLocal = obj.isLocal;
        }
        if (obj.isTemplateBlock){
            block.dataset.isTemplateBlock = obj.isTemplateBlock;
        }
        if (obj.closed){
            block.dataset.closed = true;
        }
        if (obj.blocktype === 'context' || obj.blocktype === 'eventhandler'){
            block.appendChild(elem('div', {'class': 'locals block-menu'}));
            var contained = elem('div', {'class': 'contained'});
            block.appendChild(contained);
            if (obj.contained){
                obj.contained.map(function(childdesc){
                    var child = Block(childdesc, cloneForCM);
                    contained.appendChild(child);
                    // Event.trigger(child, 'wb-add');
                    addStep({wbTarget: child}); // simulate event
                });
            }
            if (! wb.matches(block, '.scripts_workspace')){
                var label = wb.findChild(block, '.label');
                label.insertBefore(elem('div', {'class': 'disclosure'}), label.firstElementChild);
            }
        }
        //if (!obj.isTemplateBlock){
        //     console.log('instantiated block %o from description %o', block, obj);
        //}
        return block;
    };

    // Block Event Handlers

    function removeBlock(event){
        event.stopPropagation();
        var block = event.wbTarget;
        console.log('removeBlock %o', block.className);
        if (wb.matches(block, '.expression')){
            removeExpression(event);
        }else{
            removeStep(event);
        }
        if (!block.dataset.isLocal){
            removeBlockCodeMap(block);
        }
        Event.trigger(document.body, 'wb-modified', {block: block, type: 'removed'});
    }

    function removeBlockCodeMap(block){
        var dup_block = document.getElementById(block.id + "-d");
        if(dup_block){
            if (wb.matches(event.wbTarget, '.expression')){
                removeExpressionCodeMap(dup_block);
            }else if(!(wb.matches(dup_block.parentNode, ".code_map"))){
                removeStepCodeMap(dup_block);
            }
            recently_removed = dup_block;
            dup_block.parentNode.removeChild(dup_block);
        }else{
            console.log('why is there no block for %s', block.id + '-d');
        }
    }

    function addBlock(event){
        console.log('add block: %o', event.wbTarget.className);
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            addExpression(event);
        }else if(wb.matches(event.wbTarget, '.scripts_workspace')){
            addWorkspace(event);
        }else{
            addStep(event);
        }
        if((recently_removed !== null) && (event.wbTarget.id + '-d' == recently_removed.id)){
            addBlocksCodeMap(event, true);
        }else{
            addBlocksCodeMap(event, false);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'added'});
    }
    
    function addBlocksCodeMap(event, isRestored){
        var target = event.wbTarget;
        if (wb.matches(target.parentNode, '.scratchpad')){
            // don't mirror scratchpad in code map
            return;
        }
        var cloneForCM = true;
        var parent = null;
        var next_sibling = target.nextElementSibling;
        if(next_sibling !== null && next_sibling.className === "drop-cursor"){
            next_sibling = next_sibling.nextElementSibling;
        }
        var dup_target, parent_id; 
        if(isRestored){
            dup_target = recently_removed;
        }else{
            dup_target = cloneBlock(target, cloneForCM);
        }

        dup_target.id = target.id + "-d";
        // var siblings = target.parentNode.childNodes;
        // var targetIndex = wb.indexOf(event.wbTarget);
        var dup_next_sibling = null;
        // var dup_sibling_id;
        if (next_sibling){
            dup_next_sibling = document.getElementById(next_sibling.id + '-d');
        }
        // while(targetIndex < siblings.length -1){
        //  dup_sibling_id = siblings[targetIndex+1].id;
        //  if(dup_sibling_id === ''){
        //      targetIndex += 1;
        //  }else{
        //      dup_next_sibling = document.getElementById(siblings[targetIndex+1].id + "-d");
        //      break;
        //  }
        // }
        // console.log('target: %s, parent: %s, grandparent: %s', target.className, target.parentNode.className, target.parentNode.parentNode.className);
        if(wb.matches(target, ".scripts_workspace")){
            //recursively add it to the code_map
            parent = codeMap_view;
            parent.insertBefore(dup_target, dup_next_sibling);
        }else if(wb.matches(target, '.expression')){
            parent_id = target.parentNode.parentNode.parentNode.parentNode.id + "-d";
            parent = document.getElementById(parent_id).querySelector('.holder');
            parent.appendChild(dup_target);
            addExpressionCodeMap(dup_target);
        }else{
            console.log('target.id: %s', target.id);
            console.log(target.parentNode.className);
            parent_id = wb.closest(target.parentNode, '.block').id + "-d";
            console.log('parent_id: %s', parent_id);
            parent = document.getElementById(parent_id).querySelector('.contained');
            parent.insertBefore(dup_target,dup_next_sibling);
            addStepCodeMap(dup_target);
        }
        cloneForCM = false;
    }

    function removeStep(event){
        // About to remove a block from a block container, but it still exists and can be re-added
        // Remove instances of locals
        var block = event.wbTarget;
        var parent;
        // console.log('remove block: %o', block);
        if (block.classList.contains('step') && !block.classList.contains('context')){
            try{
                parent = wb.closest(block, '.context'); // valid since we haven't actually removed the block from the DOM yet
            }catch(e){
                /* We are likely in the scratch space, which has no context */
                return;
            }
            if (block.dataset.locals && block.dataset.locals.length){
                // remove locals
                var locals = wb.findAll(parent, '[data-local-source="' + block.id + '"]');
                locals.forEach(function(local){
                    if (!local.isTemplateBlock){
                        Event.trigger(local, 'wb-remove');
                    }
                    local.parentElement.removeChild(local);
                });
                delete block.dataset.localsAdded;
            }
        }
    }
    
    function removeStepCodeMap(block){
        // About to remove a block from a block container, but it still exists and can be re-added
        // Remove instances of locals

        // console.log('remove block: %o', block);
        if (block.classList.contains('step') && !block.classList.contains('context')){
            var parent = wb.closest(block, '.context'); // valid since we haven't actually removed the block from the DOM yet
            if (block.dataset.locals && block.dataset.locals.length){
                // remove locals
                var locals = wb.findAll(parent, '[data-local-source="' + block.id + '"]');
                locals.forEach(function(local){
                    if (!local.isTemplateBlock){
                        Event.trigger(local, 'wb-remove');
                    }
                    local.parentElement.removeChild(local);
                });
                delete block.dataset.localsAdded;
            }
        }
    }

    function removeExpression(event){
        // Remove an expression from an expression holder, say for dragging
        // Revert socket to default
        var block = event.wbTarget;
        //  ('remove expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.removeAttribute('style');
        });
    }
    
    function removeExpressionCodeMap(block){
        // Remove an expression from an expression holder, say for dragging
        // Revert socket to default
        console.log("came here");
        //  ('remove expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.removeAttribute('style');
        });
    }

    function addWorkspace(event){
        // Add a workspace, which has no block parent
        // var block = event.wbTarget;
    }

    function addStep(event){
        // Add a block to a block container
        var block = event.wbTarget;
        // console.log('add block %o', block);
        if (block.dataset.locals && block.dataset.locals.length && !block.dataset.localsAdded){
            var parent;
            try{
                parent = wb.closest(block, '.context');
            }catch(e){
                // This *should* mean we're putting a block into the Scratchpad, so ignore locals
                return;
            }
            var parsedLocals = addLocals(block, parent);
            block.dataset.locals = JSON.stringify(parsedLocals);
        }
    }

    function addExpression(event){
        // add an expression to an expression holder
        // hide or remove default block
        var block = event.wbTarget;
        // console.log('add expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.style.display = 'none';
        });
        if (event.stopPropagation){
            event.stopPropagation();
        }
    }

    function addLocals(block, parent, cloneForCM){
        var parsedLocals = [];
        var locals = wb.findChild(parent, '.locals');
        JSON.parse(block.dataset.locals).forEach(
            function(spec){
                spec.isTemplateBlock = true;
                spec.isLocal = true;
                spec.group = block.dataset.group;
                // if (!spec.seqNum){
                    spec.seqNum = block.dataset.seqNum;
                // }
                // add scopeid to local blocks
                spec.scopeId = parent.id;
                if(!spec.id){
                    spec.id = spec.scriptId = uuid();
                }
                // add localSource so we can trace a local back to its origin
                spec.localSource = block.id;
                block.dataset.localsAdded = true;
                locals.appendChild(Block(spec));
                parsedLocals.push(spec);
            }
        );
        return parsedLocals;
    }
    
    function addStepCodeMap(block){
        if (block.dataset.locals && block.dataset.locals.length && !block.dataset.localsAdded){
            var parent = wb.closest(block, '.context');
            var locals = wb.findChild(parent, '.locals');
            var parsedLocals = addLocals(block, parent);
            block.dataset.locals = JSON.stringify(parsedLocals);
        }
    }
    
    function addExpressionCodeMap(block){
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.style.display = 'none';
        });
    }

    var Socket = function(desc, blockdesc, cloneForCM){
        // desc is a socket descriptor object, block is the owner block descriptor
        // Sockets are described by text, type, and (default) value
        // type and value are optional, but if you have one you must have the other
        // If the type is choice it must also have a options for the list of values
        // that can be found in the wb.choiceLists
        // A socket may also have a suffix, text after the value
        // A socket may also have a block, the id of a default block
        // A socket may also have a uValue, if it has been set by the user, over-rides value
        // A socket may also have a uName if it has been set by the user, over-rides name
        // A socket may also have a uBlock descriptor, if it has been set by the user, this over-rides the block
        var holder;
        var socket = elem('div',
            {
                'class': 'socket',
                'data-name': desc.name,
                'data-id': blockdesc.id
            },
            elem('span', {'class': 'name'}, desc.uName || desc.name)
        );
        // Optional settings
        if (desc.value){
            socket.dataset.value = desc.value;
        }
        if (desc.options){
            socket.dataset.options = desc.options;
        }
        // if (!blockdesc.isTemplateBlock){
        //      console.log('socket seq num: %s', blockdesc.seqNum);
        // }
        socket.firstElementChild.innerHTML = socket.firstElementChild.innerHTML.replace(/##/, ' <span class="seq-num">' + (blockdesc.seqNum || '##') + '</span>');
        if (desc.type){
            socket.dataset.type = desc.type;
            holder = elem('div', {'class': 'holder'}, [Default(desc)]);
            socket.appendChild(holder);
        }
        if (desc.block){
            socket.dataset.block = desc.block;
        }
        socket.dataset.seqNum = blockdesc.seqNum;
        if (!blockdesc.isTemplateBlock){
            //console.log('socket seq num: %s', blockdesc.seqNum);
            var newBlock = null;
            if (desc.uBlock){
                // console.log('trying to instantiate %o', desc.uBlock);
                delete desc.uValue;
                newBlock = Block(desc.uBlock, cloneForCM);
                //console.log('created instance: %o', newBlock);
            } else if (desc.block && ! desc.uValue){
                //console.log('desc.block');
                newBlock = cloneBlock(document.getElementById(desc.block), cloneForCM);
            }else if (desc.block && desc.uValue){
                // for debugging only
                // console.log('block: %s, uValue: %s', desc.block, desc.uValue);                
            }
            if (newBlock){
                //console.log('appending new block');
                holder.appendChild(newBlock);
                // Event.trigger(newBlock, 'wb-add');
                addExpression({'wbTarget': newBlock});
            }
        }
        if (desc.suffix){
            socket.dataset.suffix = desc.suffix;
            socket.appendChild(elem('span', {'class': 'suffix'}, desc.suffix));
        }
        return socket;
    };


    function socketDesc(socket){
        var parentBlock = wb.closest(socket, '.block');
        var isTemplate = !!parentBlock.dataset.isTemplateBlock;
        var desc = {
            name: socket.dataset.name
        };
        // optional defined settings
        if (socket.dataset.type){
            desc.type = socket.dataset.type;
        }
        if (socket.dataset.value){
            desc.value = socket.dataset.value;
        }
        if (socket.dataset.options){
            desc.options = socket.dataset.options;
        }
        if (socket.dataset.block){
            desc.block = socket.dataset.block;
        }
        if (socket.dataset.suffix){
            desc.suffix = socket.dataset.suffix;
        }
        // User-specified settings
        if (isTemplate) 
        {
            return desc;
        }
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name');
        
        if (desc.name && desc.name.replace(/##/, ' ' + socket.dataset.seqNum) !== uName){
            desc.uName = uName;
        }
        var holder = wb.findChild(socket, '.holder');
        if (holder){
            var input = wb.findChild(holder, 'input, select');
            // var block = wb.findChild(holder, '.block');
            if (wb.matches(holder.lastElementChild, '.block')){
                desc.uBlock = blockDesc(holder.lastElementChild);
            }else{
                desc.uValue = input.value;
            }
        }
        return desc;
    }

    function updateFromTemplateBlock(obj){
        // Retrieve the things we don't need to duplicate in every instance block description
        var tB = blockRegistry[obj.scriptId];
        if (!tB){
            if (!obj.localSource){
                console.error('Error: could not get template block for  for %o', obj);
            }
            return obj;
        }
        obj.blocktype = tB.blocktype;
        obj.group = tB.group;
        obj.help = tB.help;
        obj.type = tB.type;
    }

    function blockDesc(block){
        var label = wb.findChild(block, '.label');
        var sockets = wb.findChildren(label, '.socket');
        var desc = {
            id: block.id,
            scopeId: block.dataset.scopeId,
            scriptId: block.dataset.scriptId,
            sockets: sockets.map(socketDesc)
        };

        if (block.dataset.group === 'scripts_workspace'){
            desc.blocktype = block.dataset.blocktype;
            desc.group = block.dataset.group;
            desc.help = block.dataset.help;
            desc.type = block.dataset.type;            
        }

        if (block.dataset.seqNum){
            desc.seqNum  = block.dataset.seqNum;
        }
        if (block.dataset.script){
            desc.script = block.dataset.script;
        }
        if (block.dataset.isTemplateBlock){
            desc.isTemplateBlock = true;
        }
        if (block.dataset.isLocal){
            desc.isLocal = true;
        }
        if (block.dataset.localSource){
            desc.localSource = block.dataset.localSource;
        }
        if (block.dataset.locals){
            desc.locals = JSON.parse(block.dataset.locals);
        }
        if (block.dataset.closed){
            desc.closed = true;
        }
        var contained = wb.findChild(block, '.contained');
        if (contained && contained.children.length){
            desc.contained = wb.findChildren(contained, '.block').map(blockDesc);
        }
        return desc;
    }

    function cloneBlock(block, cloneForCM){
        // Clone a template (or other) block
        var blockdesc = blockDesc(block);
        if (!cloneForCM){
            delete blockdesc.id;
        }
        ////////////////////
        // Why were we deleting seqNum here?
        // I think it was from back when menu template blocks had sequence numbers
        // UPDATE:
        // No, it was because we want cloned blocks (and the locals they create) to get 
        // new sequence numbers. But, if the block being cloned is an instance of a local then we
        // don't want to get a new sequence number.
        //
        // And all of that is before we started cloning for the code map.
        // /////////////////
         if (!block.dataset.localSource && !cloneForCM){
            delete blockdesc.seqNum;
        }
        if (blockdesc.isTemplateBlock){
            blockdesc.scriptId = block.id;            
        }
        delete blockdesc.isTemplateBlock;
        delete blockdesc.isLocal;
        return Block(blockdesc, cloneForCM);
    }

    function deleteBlock(event){
        // delete a block from the script entirely
        // remove from registry
        var block = event.wbTarget;
        // console.log('block deleted %o', block);
    }

    var Default = function(obj){
        // return an input for input types (number, string, color, date)
        // return a block for block types
        var value, input;
        var type = obj.type;
        
        if(type === 'boolean')
        {
            obj.options = 'boolean';
        }
        
        if(typeof obj.options !== 'undefined')
        {
            // DONE : #24
            // DONE : #227
            var choice = elem('select');
            var list = wb.choiceLists[obj.options];
            
            if(Array.isArray(list))
            {
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    var value = obj.uValue || obj.value;
                    
                    if (value !== undefined && value !== null && value == opt){
                        option.setAttribute('selected', 'selected');
                    }
                    
                    choice.appendChild(option);
                });
            }
            else
            {
                var values = Object.keys(list);
                
                values.forEach(function(val){
                    var option = elem('option', {"value":val}, list[val]);
                    var value = obj.uValue || obj.value;
                    
                    if (value !== undefined && value !== null && value == val){
                        option.setAttribute('selected', 'selected');
                    }
                    
                    choice.appendChild(option);
                });
            }
            
            return choice;
        
        }
        //Known issue: width manually set to 160, need to programmatically get
        //(size of "Browse" button) + (size of file input field). 
        if (type === 'file') {
            value = obj.uValue || obj.value || '';
            //not sure if 'data-oldvalue' is needed in the below line
            input = elem('input', {type: "file", value: value, 'data-oldvalue': value}); 
            input.addEventListener('change', function(evt){
                var file = input.files[0];
                var reader = new FileReader();
        reader.onload = function (evt){
                    localStorage['__' + file.name]= evt.target.result;
        };
                reader.readAsText( file );
            });
            wb.resize(input); //not sure if this is necessary
            input.style.width= "160px"; //known issue stated above
            return input;
        }
        if (type === 'int' || type === 'float'){
            type = 'number';
        }
        if (type === 'image'){
            type = '_image'; // avoid getting input type="image"
        }
        switch(type){
            case 'any':
                value = obj.uValue || obj.value || ''; break;
            case 'number':
                value = obj.uValue || obj.value || 0; break;
            case 'string':
                value = obj.uValue || obj.value || ''; break;
            case 'regex':
                value = obj.uValue || obj.value || /.*/; break;
            case 'color':
                value = obj.uValue || obj.value || '#000000'; break;
            case 'date':
                value = obj.uValue || obj.value || new Date().toISOString().split('T')[0]; break;
            case 'time':
                value = obj.uValue || obj.value || new Date().toISOString().split('T')[1]; break;
            case 'datetime':
                value = obj.uValue || obj.value || new Date().toISOString(); break;
            case 'url':
                value = obj.uValue || obj.value || 'http://waterbearlang.com/'; break;
            case 'phone':
                value = obj.uValue || obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.uValue || obj.value || 'waterbear@waterbearlang.com'; break;
            default:
                value = obj.uValue || obj.value || '';
        }
        input = elem('input', {type: type, value: value, 'data-oldvalue': value});

        //Only enable editing for the appropriate types
        if (!(type === "string" || type === "any" || type === 'regex' ||
              type === "url"    || type === "phone" ||
              type === "number" || type === "color")) {
            input.readOnly = true;
        }

        wb.resize(input);
        return input;
    };

    function socketValue(holder){
        if (holder.children.length > 1){
            return codeFromBlock(wb.findChild(holder, '.block'));
        }else{
            var value = wb.findChild(holder, 'input, select').value;
            var type = holder.parentElement.dataset.type;

            // DONE : #227
            if (type === 'string' || type === 'color' || type === 'url'){
                if (value[0] === '"'){value = value.slice(1);}
                if (value[value.length-1] === '"'){value = value.slice(0,-1);}
                value = value.replace(/"/g, '\\"');
                value = '"' + value + '"';
            } else if (type === 'regex'){
                if (value[0] === '/'){value = value.slice(1);}
                if (value[value.length-1] === '/'){value = value.slice(0,-1);}
                value = value.replace(/\//g, '\\/');
                value = '/' + value + '/';
            }
            return value;
        }
    }

    function codeFromBlock(block){
        // console.log(getScript(block.dataset.scriptId));
        if (block.classList.contains('cloned')){
            return ''
        }
        var scriptTemplate = getScript(block.dataset.scriptId);
        if (!scriptTemplate){
            // If there is no scriptTemplate, things have gone horribly wrong, probably from 
            // a block being removed from the language rather than hidden
            wb.findAll('.block[data-script-id="' + block.dataset.scriptId + '"]').forEach(function(elem){
                elem.style.backgroundColor = 'red';
            });
        }
        // support optional multiline templates
        if (Array.isArray(scriptTemplate)){
            scriptTemplate = scriptTemplate.join('\n');
        }
        // fixup sequence numbers in template
        scriptTemplate = scriptTemplate.replace(/##/g, '_' + block.dataset.seqNum);
        var childValues = [];
        var label = wb.findChild(block, '.label');
        var expressionValues = wb.findChildren(label, '.socket')
            .map(function(socket){ return wb.findChild(socket, '.holder'); }) // get holders, if any
            .filter(function(holder){ return holder; }) // remove undefineds
            .map(socketValue); // get value
        if (wb.matches(block, '.context')){
            childValues = wb.findChildren(wb.findChild(block, '.contained'), '.block').map(codeFromBlock).join('');
        }
        // Now intertwingle the values with the template and return the result
        function replace_values(match, offset, s){
            var idx = parseInt(match.slice(2, -2), 10) - 1;
            if (match[0] === '{'){
                return expressionValues[idx] || 'null';
            }else{
                return childValues || '/* do nothing */';
            }
        }
        var _code = scriptTemplate.replace(/\{\{\d\}\}/g, replace_values);
        var _code2 = _code.replace(/\[\[\d\]\]/g, replace_values);
        return _code2;
    }

    function changeName(event){
        var nameSpan = event.wbTarget;
        var input = elem('input', {value: nameSpan.textContent});
        nameSpan.parentNode.appendChild(input);
        nameSpan.style.display = 'none';
        input.focus();
        input.select();
        wb.resize(input);
        Event.on(input, 'blur', null, updateName);
        Event.on(input, 'keydown', null, maybeUpdateName);
    }

    function updateName(event){
        // console.log('updateName on %o', event);
        var input = event.wbTarget;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        var nameSpan = input.previousSibling;
        var newName = input.value;
        var oldName = input.parentElement.textContent;
        // if (!input.parentElement) return; // already removed it, not sure why we're getting multiple blurs
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
        function propagateChange(newName) {
            // console.log('now update all instances too');
            var source = wb.closest(nameSpan, '.block');
            var instances = wb.findAll(wb.closest(source, '.context'), '[data-local-source="' + source.dataset.localSource + '"]');
            instances.forEach(function(elem){
                wb.find(elem, '.name').textContent = newName;
                wb.find(elem, '.socket').dataset.name = newName;
            });

            //Change name of parent
            var parent = document.getElementById(source.dataset.localSource);
            var nameTemplate = JSON.parse(parent.dataset.sockets)[0].name;
            nameTemplate = nameTemplate.replace(/[^' ']*##/g, newName);

            //Change locals name of parent
            var parentLocals = JSON.parse(parent.dataset.locals);
            var localSocket = parentLocals[0].sockets[0];
            localSocket.name = newName;
            parent.dataset.locals = JSON.stringify(parentLocals);

            wb.find(parent, '.name').textContent = nameTemplate;
            Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'nameChanged'});
        }
        var action = {
            undo: function() {
                propagateChange(oldName);
            },
            redo: function() {
                propagateChange(newName);
            }
        };
        wb.history.add(action);
        action.redo();
    }

    function cancelUpdateName(event){
        var input = event.wbTarget;
        var nameSpan = input.previousSibling;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
    }

    function maybeUpdateName(event){
        var input = event.wbTarget;
        if (event.keyCode === 0x1B /* escape */ ){
            event.preventDefault();
            input.value = input.previousSibling.textContent;
            input.blur();
        }else if(event.keyCode === 0x0D /* return or enter */ || event.keyCode === 0x09 /* tab */){
            event.preventDefault();
            input.blur();
        }
    }

    /** Search filter */

    var oldQuery = '';

    function searchBlock(event) {
        // Clear input if the clear button is pressed
        var searchTextNode = document.getElementById('search_text');

        if (event.target.id == 'search_clear') {
            searchTextNode.value = '';
        }

        // Proceed if the query is changed
        var query = searchTextNode.value.trim().toLowerCase();

        if (oldQuery == query) {
            return;
        } else {
            oldQuery = query;
        }

        var searchResultsNode = document.getElementById('search_results');
        var blockMenuNode = document.getElementById('block_menu');

        // For non-empty query, show all blocks; otherwise, hide all blocks
        if (query) {
            wb.show(searchResultsNode);
            wb.hide(blockMenuNode);

            while (searchResultsNode.firstChild) {
                searchResultsNode.removeChild(searchResultsNode.firstChild);
            }
        } else {
            wb.hide(searchResultsNode);
            wb.show(blockMenuNode);
            return;
        }

        // Clear suggestions
        var suggestions = [];
        var suggestionsNode = document.getElementById('search_suggestions');
        while (suggestionsNode.firstChild) {
            suggestionsNode.removeChild(suggestionsNode.firstChild);
        }

        var groups = document.querySelectorAll('.block-menu');
     
        for (var i = 0; i < groups.length; i++) {
            var blocks = groups[i].getElementsByClassName('block');

            for (var j = 0; j < blocks.length; j++) {
                // Construct an array of keywords
                var keywords = [];

                var group = blocks[j].getAttribute('data-group');
                if (group) {
                    keywords.push(group);
                }

                var keywordsAttr = blocks[j].getAttribute('data-keywords');
                if (keywordsAttr) {
                    keywords = keywords.concat(JSON.parse(keywordsAttr));
                }

                // Find a match
                var matchingKeywords = [];

                for (var k = 0; k < keywords.length; k++) {
                    if (keywords[k].indexOf(query) === 0) {
                        matchingKeywords.push(keywords[k]);

                        if (suggestions.indexOf(keywords[k]) == -1) {
                            suggestions.push(keywords[k]);

                            var suggestionNode = document.createElement('option');
                            suggestionNode.value = keywords[k];
                            suggestionsNode.appendChild(suggestionNode);
                        }
                    }
                }

                // Show/hide blocks
                if (matchingKeywords.length > 0) {
                    var resultNode = document.createElement('div');
                    resultNode.classList.add('search_result');
                    resultNode.classList.add(group);
                    resultNode.style.backgroundColor = 'transparent';

                    // Block
                    resultNode.appendChild(blocks[j].cloneNode(true));

                    // Fix result height
                    var clearNode = document.createElement('div');
                    clearNode.style.clear = 'both';
                    resultNode.appendChild(clearNode);

                    // Keyword name
                    var keywordNode = document.createElement('span');
                    keywordNode.classList.add('keyword');
                    var keywordNodeContent = '<span class="keyword">';
                    keywordNodeContent += '<span class="match">';
                    keywordNodeContent += matchingKeywords[0].substr(0, query.length);
                    keywordNodeContent += '</span>';
                    keywordNodeContent += matchingKeywords[0].substr(query.length);

                    for (var l = 1; l < matchingKeywords.length; l++) {
                        keywordNodeContent += ', <span class="match">';
                        keywordNodeContent += matchingKeywords[l].substr(0, query.length);
                        keywordNodeContent += '</span>';
                        keywordNodeContent += matchingKeywords[l].substr(query.length);
                    }

                    keywordNodeContent += '</span>';
                    keywordNode.innerHTML = keywordNodeContent;
                    resultNode.appendChild(keywordNode);

                    searchResultsNode.appendChild(resultNode);
                }
            }
        }
    }

    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-add', '.block', addBlock);
    Event.on('.workspace', 'wb-add', null, addBlock);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

    Event.on('#search_text', 'keyup', null, searchBlock);
    Event.on('#search_text', 'input', null, searchBlock);
    Event.on('#search_clear', 'click', null, searchBlock);

    wb.blockRegistry = blockRegistry;

    // Export methods
    wb.Block = Block;
    wb.blockDesc = blockDesc;
    wb.socketDesc = socketDesc;
    wb.registerSeqNum = registerSeqNum;
    wb.resetSeqNum = resetSeqNum;
    wb.cloneBlock = cloneBlock;
    wb.codeFromBlock = codeFromBlock;
    wb.changeName = changeName;
    wb.getSockets = getSockets;
    wb.getSocketValue = getSocketValue;
})(wb);

