// Revised Block handling.
//


(function(wb, Event){
'use strict';
    var elem = wb.elem;



    function getScript(id){
        // TODO
    }

    // Get socket elements from live block
    function getSockets(block){
        return wb.findChildren(wb.findChild(block, '.label'), '.socket');
    }

    function createBlock(args){
        // args: scriptname, keywords, tags, help, sockets, [type], [closed]
        var block = elem(
            'block',
            {
                'keywords': JSON.stringify(args.keywords), // do we need both keywords and tags?
                'tags': JSON.stringify(args.tags),
                'title': args.help
            },
            elem('blockhead', {}, wb.socket.mapCreate(args.sockets))
        );
        if (args.type){ // expressions only
            block.dataset.type = args.type; // capture type of expression blocks
        }
        if (args.closed){
            block.dataset.closed = true;
        }
        // context only
        block.appendChild(elem('div', {'class': 'locals block-menu'}));
        var contained = elem('div', {'class': 'contained'});
        block.appendChild(contained);
        if (args.contained){
            args.contained.map(function(childdesc){
                var child = createBlock(childdesc);
                contained.appendChild(child);
                addStep({target: child}); // simulate event
            });
            if (! wb.matches(block, '.scripts-workspace')){
                var label = wb.findChild(block, '.label');
                label.insertBefore(elem('div', {'class': 'disclosure'}), label.firstElementChild);
            }
        }
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
        Event.trigger(document.body, 'wb-modified', {block: block, type: 'removed'});
    }

    function addBlock(event){
        event.stopPropagation();
        if (wb.matches(event.target, '.expression')){
            addExpression(event);
        }else if(wb.matches(event.target, '.scripts-workspace')){
            addWorkspace(event);
        }else{
            addStep(event);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.target, type: 'added'});
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

    function removeExpression(block){
        // Remove an expression from an expression holder, say for dragging
        // Revert socket to default
        //  ('remove expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.removeAttribute('style');
        });
    }

    function addWorkspace(event){
    }

    function addStep(event){
        // Add a block to a block container
        var block = event.target;
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
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.style.display = 'none';
        });
        if (event.stopPropagation){
            event.stopPropagation();
        }
    }

    function addLocals(block, parent){
        var locals = wb.findChild(parent, '.locals');
        JSON.parse(block.dataset.locals).forEach(
            function(spec){
                locals.appendChild(createBlock(spec));
            }
        );
    }

    function addExpressionCodeMap(block){
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.style.display = 'none';
        });
    }

    function blockDesc(block){
        // get save format, also used for cloning
        var label = wb.findChild(block, '.label');
        var sockets = wb.findChildren(label, '.socket');
        var desc = {
            sockets: sockets.map(wb.socket.description)
        };

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
        return createBlock(blockdesc, cloneForCM);
    }

    function deleteBlock(event){
        // delete a block from the script entirely
        // var block = event.target;
    }



    function codeFromBlock(block){
        // TODO: get code from template's scriptId
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
        clone: cloneBlock,
        code: codeFromBlock,
        sockets: getSockets,
        getSocketDefinitions: getSocketDefinitions
    };

})(wb, Event);

