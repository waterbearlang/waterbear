// Revised Block handling.
//
// Nearly all the block is defined in the HTML and DOM
// This file helps to initialize the block DOM, and provide
// support routines
//
// Block(obj) -> Block element
// scriptForId(scriptid) -> script template
// nextSeqNum() -> int
// registerSeqNum(int) make sure we don't re-use sequence numbers
// Socket(json) -> Socket element

(function(wb){

    var elem = wb.elem;


    var _nextSeqNum = 0;

    var newSeqNum = function(){
        _nextSeqNum++;
        return _nextSeqNum;
    };

    var registerSeqNum = function(seqNum){
        // When reifying saved blocks, call this for each block to make sure we start new blocks
        // that do not overlap with old ones.
        if (!seqNum) return;
        seqNum = Math.max(parseInt(seqNum, 10), _nextSeqNum);
    }

    var blockRegistry = {};

    var registerBlock = function(blockdesc){
        if (blockdesc.seqNum){
            registerSeqNum(blockdesc.seqNum);
        }else{
            blockdesc.seqNum = newSeqNum();
        }
        if (! blockdesc.id){
            blockdesc.id = uuid();
        }
        blockRegistry[blockdesc.id] = blockdesc;
    }

    var getHelp = function(id){
        return blockRegistry[id] ? blockRegistry[id].help : '';
    }

    var getScript = function(id){
        return blockRegistry[id].script;
    }

    var getSockets = function(obj){
        return blockRegistry[obj.scriptid || obj.id].sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj);
        });
    }

    var Block = function(obj){
        // FIXME:
        // Handle values coming from serialized (saved) blocks
        // Handle customized names (sockets)
        registerBlock(obj);
        var block = elem(
            'div',
            {
                'class': function(){
                    var names = ['block', obj.group, obj.blocktype];
                    if (obj.blocktype === 'context'){
                        names.push('step');
                    }else if (obj.blocktype === 'eventhandler'){
                        names.push('step');
                        names.push('context');
                    }
                    return names.join(' ');
                },
                'data-blocktype': obj.blocktype,
                'data-group': obj.group,
                'id': obj.id,
                'data-scopeid': obj.scopeid || 0,
                'data-scriptid': obj.scriptid || obj.id,
                'data-local-source': obj.localSource || null, // help trace locals back to their origin
                'data-seq-num': obj.seqNum,
                'data-sockets': JSON.stringify(obj.sockets),
                'data-locals': JSON.stringify(obj.locals),
                'title': obj.help || getHelp(obj.scriptid || obj.id)
            },
            elem('div', {'class': 'label'}, getSockets(obj))
        );
        if (obj.type){
            block.dataset.type = obj.type; // capture type of expression blocks
        }
        if (obj.blocktype === 'context' || obj.blocktype === 'eventhandler'){
            block.appendChild(elem('div', {'class': 'locals block-menu'}));
            block.appendChild(elem('div', {'class': 'contained'}, (obj.contained || []).map(Block)));
        }
        return block;
    }

    // Block Event Handlers

    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-remove', '.expression', removeExpression);
    Event.on(document.body, 'wb-add', '.step', addBlock);
    Event.on(document.body, 'wb-add', '.expression', addExpression);
    Event.on(document.body, 'wb-clone', '.block', onClone);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

    function removeBlock(event){
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
            }
        }
    }

    function removeExpression(event){
        // Remove an expression from an expression holder, say for dragging
        // Revert socket to default
        var block = event.wbTarget;
        // console.log('remove expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.removeAttribute('style');
        });
    }

    function addBlock(event){
        // Add a block to a block container
        var block = event.wbTarget;
        // console.log('add block %o', block);
        if (block.dataset.locals && block.dataset.locals.length){
            var parent = wb.closest(block, '.context');
            var locals = wb.findChild(parent, '.locals');
            JSON.parse(block.dataset.locals).forEach(
                function(spec){
                    spec.isTemplateBlock = true;
                    spec.isLocal = true;
                    spec.group = block.dataset.group;
                    spec.seqNum = block.dataset.seqNum;
                    // add scopeid to local blocks
                    spec.scopeid = parent.id;
                    // add localSource so we can trace a local back to its origin
                    spec.localSource = block.id;
                    locals.appendChild(Block(spec));
                }
            );
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
    }

    function onClone(event){
        // a block has been cloned. Praise The Loa!
        var block = event.wbTarget;
        // console.log('block cloned %o', block);
    }

    function blockDesc(block){
        var desc = {
            blocktype: block.dataset.blocktype,
            group: block.dataset.group,
            id: block.id,
            help: block.title,
            seqNum: block.dataset.seqNum,
            scopeId: block.dataset.scopeId,
            scriptId: block.dataset.scriptId,
            sockets: JSON.parse(block.dataset.sockets)
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
        if (block.dataset.type){
            desc.type = block.dataset.type;
        }
        if (block.dataset.locals){
            desc.locals = JSON.parse(block.dataset.locals);
        }
        return desc;
    }

    function cloneBlock(block){
        // Clone a template (or other) block
        var blockdesc = blockDesc(block);
        delete blockdesc.id;
        delete blockdesc.seqNum;
        delete blockdesc.isTemplateBlock;
        delete blockdesc.isLocal;
        blockdesc.scriptId = block.dataset.id;
        return Block(blockdesc);
    }

    function deleteBlock(event){
        // delete a block from the script entirely
        // remove from registry
        var block = event.wbTarget;
        // console.log('block deleted %o', block);
    }

    var Socket = function(obj, block){
        // obj is a socket descriptor object, block is the owner block descriptor
        // Sockets are described by text, type, and default value
        // type and default value are optional, but if you have one you must have the other
        // If the type is choice it must also have a choicename for the list of values
        // that can be found in the wb.choiceLists
        var socket = elem('div',
            {
                'class': 'socket',
                'data-name': obj.name,
                'data-id': block.id
            },
            elem('span', {'class': 'name'}, obj.name)
        );
        socket.firstElementChild.innerHTML = socket.firstElementChild.innerHTML.replace(/##/, ' <span class="seq-num">' + block.seqNum + '</span>');
        if (obj.type){
            socket.dataset.type = obj.type;
            socket.appendChild(elem('div', {'class': 'holder'}, [Default(obj)]))
        }
        return socket;
    }

    var Default = function(obj){
        // return an input for input types (number, string, color, date)
        // return a block for block types
        var value;
        var type = obj.type;
        if (type === 'int' || type === 'float'){
            type = 'number';
        }
        switch(type){
            case 'any':
                value = obj.value || ''; break;
            case 'number':
                value = obj.value || 0; break;
            case 'string':
                value = obj.value || ''; break;
            case 'color':
                value = obj.value || '#000000'; break;
            case 'date':
                value = obj.value || new Date().toISOString().split('T')[0]; break;
            case 'time':
                value = obj.value || new Date().toISOString().split('T')[1]; break;
            case 'datetime':
                value = obj.value || new Date().toISOString(); break;
            case 'url':
                value = obj.value || 'http://waterbearlang.com'; break;
            case 'image':
                value = obj.value || ''; break;
            case 'phone':
                value = obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.value || 'waterbear@waterbearlang.com'; break;
            case 'boolean':
                obj.options = 'boolean';
            case 'choice':
                var choice = elem('select');
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    if (obj.default && obj.default === opt){
                        option.setAttribute('selected', 'selected');
                    }
                    choice.appendChild(option);
                });
                return choice;
            default:
                if (obj.default){
                    return Block(obj.default);
                }else{
                    value = obj.value || '';
                }
        }
        return elem('input', {type: type, value: value});
    }


    // Export methods
    wb.Block = Block;
    wb.registerSeqNum = registerSeqNum;
    wb.cloneBlock = cloneBlock;

})(wb);

