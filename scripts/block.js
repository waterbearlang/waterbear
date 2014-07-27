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

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(wb, Event){
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

    // Get socket templates from block definition
    function getSocketDefinitions(block){
        return blockRegistry[block.id].sockets;
    }

    // Get socket elements from live block
    function getSockets(block){
        return wb.findChildren(wb.findChild(block, '.label'), '.socket');
    }


    function createBlock(obj, cloneForCM){
        if (cloneForCM){
            obj.id = obj.id + '-d';
        }
        registerBlock(obj);
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
                // 'data-sockets': JSON.stringify(obj.sockets),
                'data-locals': JSON.stringify(obj.locals),
                'data-keywords': JSON.stringify(obj.keywords),
                'data-tags': JSON.stringify(obj.tags),
                'title': obj.help || getHelp(obj.scriptId || obj.id)
            },
            elem('div', {'class': 'label'}, wb.socket.mapCreate(obj, cloneForCM))
        );
        if (obj.seqNum){
            block.dataset.seqNum = obj.seqNum;
        }
        if (obj.type){
            block.dataset.type = obj.type; // capture type of expression blocks
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
                    var child = createBlock(childdesc, cloneForCM);
                    contained.appendChild(child);
                    // Event.trigger(child, 'wb-add');
                    addStep({target: child}); // simulate event
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
        var block = event.target;
        if (wb.matches(block, '.expression')){
            removeExpression(block);
        }else{
            removeStep(block);
        }
        if (!block.dataset.isLocal){
            removeBlockCodeMap(block);
        }
        Event.trigger(document.body, 'wb-modified', {block: block, type: 'removed'});
    }

    function removeBlockCodeMap(block){
        var dup_block = document.getElementById(block.id + "-d");
        if(dup_block){ // if not, we're removing from the scratch space
            if (wb.matches(block, '.expression')){
                removeExpression(dup_block);
            }else if(!(wb.matches(dup_block.parentNode, ".code_map"))){
                removeStepCodeMap(dup_block);
            }
            recently_removed = dup_block;
            dup_block.parentNode.removeChild(dup_block);
        }
    }

    function addBlock(event){
        event.stopPropagation();
        if (wb.matches(event.target, '.expression')){
            addExpression(event);
        }else if(wb.matches(event.target, '.scripts_workspace')){
            addWorkspace(event);
        }else{
            addStep(event);
        }
        if((recently_removed !== null) && (event.target.id + '-d' == recently_removed.id)){
            addBlocksCodeMap(event, true);
        }else{
            addBlocksCodeMap(event, false);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.target, type: 'added'});
    }

    function addBlocksCodeMap(event, isRestored){
        var target = event.target;
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
        // var targetIndex = wb.indexOf(event.target);
        var dup_next_sibling = null;
        // var dup_sibling_id;
        if (next_sibling){
            dup_next_sibling = document.getElementById(next_sibling.id + '-d');
        }
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
            // console.log('target.id: %s', target.id);
            // console.log(target.parentNode.className);
            parent_id = wb.closest(target.parentNode, '.block').id + "-d";
            // console.log('parent_id: %s', parent_id);
            parent = document.getElementById(parent_id).querySelector('.contained');
            parent.insertBefore(dup_target,dup_next_sibling);
            addStepCodeMap(dup_target);
        }
        cloneForCM = false;
    }

    function removeStep(block){
        // About to remove a block from a block container, but it still exists and can be re-added
        removeLocals(block);
    }

    function removeLocals(block){
        // Remove instances of locals
        if (block.classList.contains('step') && !block.classList.contains('context')){
            var parent = wb.closest(block, '.context');
            if (parent){
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
        return block;
    }

    function removeStepCodeMap(block){
        // About to remove a block from a block container, but it still exists and can be re-added
        removeLocals(block);
    }

    function removeExpression(block){
        // Remove an expression from an expression holder, say for dragging
        // Revert socket to default
        //  ('remove expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.removeAttribute('style');
        });
    }

    function addWorkspace(event){
        // Add a workspace, which has no block parent
        // var block = event.target;
    }

    function addStep(event){
        // Add a block to a block container
        var block = event.target;
        // console.log('add block %o', block);
        if (block.dataset.locals && block.dataset.locals.length && !block.dataset.localsAdded){
            var parent = wb.closest(block, '.context');
            if (!parent){
                // We're putting a block into the Scratchpad, ignore locals
                return;
            }
            var parsedLocals = addLocals(block, parent);
            block.dataset.locals = JSON.stringify(parsedLocals);
        }
    }

    function addExpression(event){
        // add an expression to an expression holder
        // hide or remove default block
        var block = event.target;
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
                locals.appendChild(createBlock(spec));
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
            sockets: sockets.map(wb.socket.description)
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
        if (block.dataset.localSource){
            desc.localSource = block.dataset.localSource;
        }
        if (block.dataset.locals){
            desc.locals = JSON.parse(block.dataset.locals);
        }
        if (block.dataset.closed){
            // maintain open/closed widgets, might be better in a parallele IDE local state?
            desc.closed = true;
        }
        var contained = wb.findChild(block, '.contained');
        if (contained && contained.children.length){
            desc.contained = wb.findChildren(contained, '.block').map(blockDesc);
        }
        return desc;
    }

    function blockValidate(block){
        var valid = true;
        block.classList.remove('invalid');
        // Are the block's sockets valid?
        var sockets = socketsForBlock(block);
        for (var i = 0; i < sockets.length; i++){
            if (!wb.socket.validate(sockets[i])){
                valid = false;
            }
        }
        // If a container, does it contain anything?
        // If it contains anything, are those blocks valid?
        if (wb.matches(block, '.context')){
            var containers = containedForBlock(block);
            containers.forEach(function(children){
                if (!children.length){
                    valid = false;
                    console.warn('Empty context block: %s', block);
                    block.classList.add('invalid');
                }
                for (var j = 0; j < children.length; j++){
                    if (!blockValidate(children[j])){
                        valid = false;
                    }
                }
            });
        }
        return valid;
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
        return createBlock(blockdesc, cloneForCM);
    }

    function deleteBlock(event){
        // delete a block from the script entirely
        // remove from registry
        var block = event.target;
        // console.log('block deleted %o', block);
    }



    function codeFromBlock(block){
        if (block.classList.contains('cloned')){
            return null;
        }
        var scriptTemplate = getScript(block.dataset.scriptId);
        if (!scriptTemplate){
            // If there is no scriptTemplate, things have gone horribly wrong, probably from
            // a block being removed from the language rather than hidden
            if (block.classList.contains('scripts_workspace')){
                scriptTemplate = '[[1]]';
            }else{
                wb.findAll('.block[data-script-id="' + block.dataset.scriptId + '"]').forEach(function(elem){
                    elem.style.backgroundColor = 'red';
                });
                return;
            }
        }
        // support optional multiline templates
        if (Array.isArray(scriptTemplate)){
            scriptTemplate = scriptTemplate.join('\n');
        }else if (typeof scriptTemplate === 'function'){
            return scriptTemplate.call(block, gatherArgs(block), gatherContained(block));
        }
        // fixup sequence numbers in template
        scriptTemplate = scriptTemplate.replace(/##/g, '_' + block.dataset.seqNum);
        var childValues = gatherContained(block);
        var expressionValues = gatherArgs(block);
        // Now intertwingle the values with the template and return the result
        function replace_values(match, offset, s){
            var idx = parseInt(match.slice(2, -2), 10) - 1;
            if (match[0] === '{'){
                return expressionValues[idx] || 'null';
            }else{
                return childValues[idx] || '/* do nothing */';
            }
        }
        var _code = scriptTemplate.replace(/\{\{\d\}\}/g, replace_values);
        var _code2 = _code.replace(/\[\[\d\]\]/g, replace_values);
        return _code2;
    }

    function containedForBlock(block){
        // returns an array with one item for each .contained block
        // Each item is an array of blocks held by that container
        if (wb.matches(block, '.context')){
            return wb.findChildren(block, '.contained').map(function(container){
                return wb.findChildren(container, '.block');
            });
        }else{
            return [];
        }
    }

    function gatherContained(block){
        if (wb.matches(block, '.context')){
            return wb.findChildren(block, '.contained').map(function(container){
                return wb.findChildren(container, '.block').map(codeFromBlock).join('');
            });
        }else{
            return [];
        }
    }


    function socketsForBlock(block){
        var label = wb.findChild(block, '.label');
        return wb.findChildren(label, '.socket');
    }

    function gatherArgs(block){
        return socketsForBlock(block)
            .map(function(socket){ return wb.findChild(socket, '.holder'); }) // get holders, if any
            .filter(function(holder){ return holder; }) // remove undefineds
            .map(wb.socket.holderValue); // get value
    }



    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-add', '.block', addBlock);
    Event.on('.workspace', 'wb-add', null, addBlock);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

    // Export methods
    wb.block = {
        create: createBlock,
        addExpression: addExpression,
        description: blockDesc,
        validate: blockValidate,
        resetSeqNum: resetSeqNum,
        clone: cloneBlock,
        code: codeFromBlock,
        sockets: getSockets,
        getSocketDefinitions: getSocketDefinitions
    };

})(wb, Event);

