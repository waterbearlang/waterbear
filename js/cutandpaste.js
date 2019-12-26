(function(){
    // Depends on select.js, block.js, event.js (maybe others?)
    // FIXME: Manage scope
    // FIXME: Manage cut (vs. copy)

    var sekritSelection = document.createElement('textarea');
    var sekritValue = '';
    var parseBlock = document.createElement('div');
    sekritSelection.id = 'sekritSelection';
    sekritSelection.className = 'hidden';
    var defaultSelection = false;
    var pasteboardCanceled = false;
    
    
    document.body.appendChild(sekritSelection);

    function cancelPasteboard(){
        pasteboardCanceled = true; // some other event, like undo/redo has the command key
    }
    
    // Call this when the selection changes
    function setupPasteboard(evt){
        // get selected element (warn if multiple elements are selected)
        var blocks = Select.blocks();
        if (blocks.length < 1){
            app.warn('No blocks to copy');
            sekritSelection.value = sekritValue = '';
            return;
        }
        if (blocks.length > 1){
            app.warn('Can only copy one block at a time.');
            return;
        }
        // if wb-value is selected, only copy the inner wb-expression, if any
        var block = blocks[0];
        if (block.localName === 'wb-value'){
            block = dom.child(block, 'wb-expression');
            if (!block){
                app.warn('cannot copy empty socket');
                return;
            }
        }
        // copy their outerHTML into both sekritSelection and a variable.
        sekritSelection.value = sekritValue = blocks[0].outerHTML;
    }

    // Call this when the Ctrl / Meta key is pressed
    function setupForCopyPaste(evt){
        // if ctrl or command key is not in event, return
        var key = Event.keyForEvent(evt);
        if (key !== 'ctrl' && key !== 'meta'){
            return;
        }
        // if DOM-selection is non-empty return
        var sel = window.getSelection();
        if (!sel.isCollapsed || util.inList(sel.baseNode.localName, ['wb-value', 'input'])){
            defaultSelection = true;
            return;
        }
        sekritSelection.select();
    }

    // check to see if pasteboard has changed and handle appropriately
    function cleanupFromCopyPaste(evt){
        // if ctrl or command key is not in event, return
        // FIXME: can get confused if both are pressed
        var key = Event.keyForEvent(evt);
        if (key !== 'ctrl' && key !== 'meta'){
            return;
        }
        if (pasteboardCanceled){
            pasteboardCanceled = false;
            return;
        }
        if (defaultSelection){
            defaultSelection = false;
            return;
        }else{
            // Don't keep hidden selection for next time
            var sel = window.getSelection();
            if (!sel.isCollapsed){
                window.getSelection().collapseToStart();
            }
        }
        // test to see if contents of sekritSelection have changed
        if (sekritSelection.value === sekritValue){
            return;
        }
        // If sekritSelection is empty, but sekritValue is not, the contents were cut, not copied or pasted
        // and we need to handle deleting the original.
        if (!sekritSelection.value && sekritValue){
            console.log('looks like a cut to me');
            return handleCut();
        }
        // OK, we have a changed pasteboard and it's not a cut or copy, must be a paste:
        console.log('changed pasteboard, must be a paste');
        return handlePaste();
    }

    function handleCut(){
        // Check to see if they are valid to paste into the script (parseable, valid blocks)
        parseBlock.innerHTML = sekritValue;
        var undoEvent = [];
        if (!parseBlock.firstElementChild){
            console.warn('cut non-HTML content: %s', sekritValue);
            return;
        }
        var ids = [].slice.apply(parseBlock.children).map(function(elem){ return elem.id; });
        parseBlock.innerHTML = ''; // don't leave elements with duplicate IDs laying around
        ids.forEach(function(id){
            if (!id){
                return;
            }
            var block = document.getElementById(id);
            if (!block){
                console.warn('no block for id %s in handleCut()', id);
                return;
            }
            if (! dom.matches(block, 'wb-expression, wb-step, wb-context, wb-container')){
                console.warn('pasted HTML, but not a block: %s', block.localName);
                return;
            }
            undoEvent.push(block.undoableRemove());
        });
        Undo.addNewEvent(undoEvent);
    }

    function handlePaste(){
        // Check to see if they are valid to paste into the script (parseable, valid blocks)
        parseBlock.innerHTML = sekritSelection.value;
        if (!parseBlock.firstElementChild){
            app.warn('pasted non-HTML content: %s', sekritSelection.value);
            return;
        }
        // fixme: don't need to clone if this was a cut vs. copy?
        var block = dom.clone(parseBlock.firstElementChild);
        parseBlock.innerHTML = ''; // don't leave elements with duplicate IDs laying around
        if (! dom.matches(block, 'wb-expression, wb-step, wb-context, wb-container')){
            app.warn('pasted HTML, but not a block: %s', block.localName);
            return;
        }
        // if so, replace selected blocks with pasted content, cloned to get new IDs
        var selected = Select.blocks();
        if (selected.length < 1){
            app.warn('No target selected for paste');
            return;
        }
        if (selected.length > 1){
            app.warn('Can only paste to one block at a time');
            return;
        }
        var target = selected[0];
        var canInsert = Block.canInsertHere(block, target);
        if (canInsert.test){
            Undo.addNewEvent(Block.insertHere(block, target));
        }else{
            app.warn(canInsert.reason);
        }
    }
    
    function confirmCutCopyPaste(evt){
        if (!(evt.metaKey || evt.ctrlKey)){
            return;
        }
        var key = Event.keyForEvent(evt);
        switch(key){
            case 'c': Event.triggerAsync(window, 'wb-copy'); break;
            case 'v': Event.triggerAsync(window, 'wb-paste'); break;
            case 'x': Event.triggerAsync(window, 'wb-cut'); break;
            default: break;
        }
    }
    
    function doCut(){
        console.log('actual cut now (implemente me)');
    }
    
    function doCopy(){
        console.log('actual copy now (nothing to do)');
    }
    
    function doPaste(){
        console.log('actual paste now (implement me)');
    }
    
    function doClear(){
        console.log('actual clear now (implement me)');
    }

    Event.on(window, 'editor:wb-cut', null, doCut);
    Event.on(window, 'editor:wb-copy', null, doCopy);
    Event.on(window, 'editor:wb-paste', null, doPaste);
    Event.on(window, 'editor:wb-clear', null, doClear);
    
    Event.on(window, 'editor:wb-selectionChanged', null, setupPasteboard);
    Event.on(window, 'editor:keydown', null, setupForCopyPaste);
    Event.on(window, 'editor:keyup', null, cleanupFromCopyPaste);
    
    Event.on(document, 'editor:keydown', null, confirmCutCopyPaste);
    
    window.Pasteboard = {
        cancelPasteboard: cancelPasteboard
    };

})();
