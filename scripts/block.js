// Revised Block handling.
//
// Nearly all the block is defined in the HTML and DOM
// This file helps to initialize the block DOM, and provide
// support routines
//
// The idea here is that rather than try to maintain a separate "model" to capture
// the block state, which mirros the DOM and has to be kept in sync with it,
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

    var elem = wb.elem;

    var nextSeqNum = 0;
    var blockRegistry = {}; /* populated in function "registerBlock", which is
                               called by the Block() function below*/

    function newSeqNum(){
        nextSeqNum++;
        return nextSeqNum;
    };

    function registerSeqNum(seqNum){
        // When reifying saved blocks, call this for each block to make sure we start new blocks
        // that do not overlap with old ones.
        if (!seqNum) return;
        nextSeqNum = Math.max(parseInt(seqNum, 10), nextSeqNum);
    }

    function resetSeqNum(){
        nextSeqNum = 0;
        blockRegistry = {};
        wb.blockRegistry = blockRegistry;
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

    function createSockets(obj){
        return obj.sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj);
        });
    }

    var Block = function(obj){
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
                'title': obj.help || getHelp(obj.scriptId || obj.id)
            },
            elem('div', {'class': 'label'}, createSockets(obj))
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
                    var child = Block(childdesc);
                    contained.appendChild(child);
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
    }

    // Block Event Handlers

    function removeBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            removeExpression(event);
        }else{
            removeStep(event);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'removed'});
    }

    function addBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            addExpression(event);
        }else{
            addStep(event);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'added'});
    }

    function removeStep(event){
        // About to remove a block from a block container, but it still exists and can be re-added
        // Remove instances of locals
        var block = event.wbTarget;
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

    function addStep(event){
        // Add a block to a block container
        var block = event.wbTarget;
        // console.log('add block %o', block);
        if (block.dataset.locals && block.dataset.locals.length && !block.dataset.localsAdded){
            var parent = wb.closest(block, '.context');
            var locals = wb.findChild(parent, '.locals');
            var parsedLocals = [];
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

    var Socket = function(desc, blockdesc){
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
            var holder = elem('div', {'class': 'holder'}, [Default(desc)]);
            socket.appendChild(holder)
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
                newBlock = Block(desc.uBlock);
                //console.log('created instance: %o', newBlock);
            } else if (desc.block && ! desc.uValue){
                //console.log('desc.block');
                newBlock = cloneBlock(document.getElementById(desc.block));
            }else if (desc.block && desc.uValue){
                // for debugging only
                // console.log('block: %s, uValue: %s', desc.block, desc.uValue);                
            }
            if (newBlock){
                //console.log('appending new block');
                holder.appendChild(newBlock);
                addExpression({'wbTarget': newBlock});
            }
        }
        if (desc.suffix){
            socket.dataset.suffix = desc.suffix;
            socket.appendChild(elem('span', {'class': 'suffix'}, desc.suffix));
        }
        return socket;
    }


    function socketDesc(socket){
        var parentBlock = wb.closest(socket, '.block');
        var isTemplate = !!parentBlock.dataset.isTemplateBlock;
        var desc = {
            name: socket.dataset.name,
        }
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
        if (isTemplate) return desc;
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name')
        
        if (desc.name.replace(/##/, ' ' + socket.dataset.seqNum) !== uName){
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
            console.error('Error: could not get template block for  for %o', obj);
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
        }
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

    function cloneBlock(block){
        // Clone a template (or other) block
        var blockdesc = blockDesc(block);
        delete blockdesc.id;
        ////////////////////
        // Why were we deleting seqNum here?
        // I think it was from back when menu template blocks had sequence numbers
        // UPDATE:
        // No, it was because we want cloned blocks (and the locals they create) to get 
        // new sequence numbers. But, if the block being clones is an instance of a local then we
        // don't want to get a new sequence number.
        // /////////////////
        if (!block.dataset.localSource){
            delete blockdesc.seqNum;
        }
        if (blockdesc.isTemplateBlock){
            blockdesc.scriptId = block.id;            
        }
        delete blockdesc.isTemplateBlock;
        delete blockdesc.isLocal;        
        return Block(blockdesc);
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
        var value;
        var type = obj.type;
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
            case 'boolean':
                obj.options = 'boolean';
            case 'choice':
                var choice = elem('select');
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    var value = obj.uValue || obj.value;
                    if (value && value === opt){
                        option.setAttribute('selected', 'selected');
                    }
                    choice.appendChild(option);
                });
                return choice;
            default:
                value = obj.uValue || obj.value || '';
        }
        var input = elem('input', {type: type, value: value, 'data-oldvalue': value});

        //Only enable editing for the appropriate types
        if (!(type === "string" || type === "any" || type === 'regex' ||
              type === "url"    || type === "phone" ||
              type === "number" || type === "color")) {
            input.readOnly = true;
        }

        wb.resize(input);
        return input;
    }

    function socketValue(holder){
        if (holder.children.length > 1){
            return codeFromBlock(wb.findChild(holder, '.block'));
        }else{
            var value = wb.findChild(holder, 'input, select').value;
            var type = holder.parentElement.dataset.type;
            if (type === 'string' || type === 'choice' || type === 'color' || type === 'url'){
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
        var scriptTemplate = getScript(block.dataset.scriptId).replace(/##/g, '_' + block.dataset.seqNum);
        if (!scriptTemplate){
            // If there is no scriptTemplate, things have gone horribly wrong, probably from 
            // a block being removed from the language rather than hidden
            wb.findAll('.block[data-script-id="' + block.dataset.scriptId + '"]').forEach(function(elem){
                elem.style.backgroundColor = 'red';
            });
        }
        var childValues = [];
        var label = wb.findChild(block, '.label');
        var expressionValues = wb.findChildren(label, '.socket')
            .map(function(socket){ return wb.findChild(socket, '.holder'); }) // get holders, if any
            .filter(function(holder){ return holder; }) // remove undefineds
            .map(socketValue); // get value
        if (wb.matches(block, '.context')){
            var childValues = wb.findChildren(wb.findChild(block, '.contained'), '.block').map(codeFromBlock).join('');
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
    };

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
			},
		}
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
            input.blur()
        }else if(event.keyCode === 0x0D /* return or enter */ || event.keyCode === 0x09 /* tab */){
            event.preventDefault();
            input.blur();
        }
    }

    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-add', '.block', addBlock);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

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

