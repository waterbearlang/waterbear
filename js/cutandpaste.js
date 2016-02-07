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
    document.body.appendChild(sekritSelection);

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
            console.log('selected blocks: %o', blocks);
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
        if (!window.getSelection().isCollapsed){
            app.warn('non-block selected: ' + window.getSelection());
            defaultSelection = true;
            return;
        }
        sekritSelection.select();
        console.log('selected: %s', window.getSelection().toString().slice(0,30));
        evt.preventDefault();
        evt.stopPropagation();
    }

    // check to see if pasteboard has changed and handle appropriately
    function cleanupFromCopyPaste(evt){
        // if ctrl or command key is not in event, return
        // FIXME: can get confused if both are pressed
        var key = Event.keyForEvent(evt);
        if (key !== 'ctrl' && key !== 'meta'){
            return;
        }
        if (defaultSelection){
            defaultSelection = false;
            return;
        }else{
            // Don't keep hidden selection for next time
            window.getSelection().collapseToStart();
        }
        // test to see if contents of sekritSelection have changed
        if (sekritSelection.value === sekritValue){
            app.warn('sekrit has not changed');
            return;
        }
        // If sekritSelection is empty, but sekritValue is not, the contents were cut, not copied or pasted
        // and we need to handle deleting the original.
        if (!sekritSelection.value && sekritValue){
            return handleCut();
        }
        // OK, we have a changed pasteboard and it's not a cut, must be a paste:
        return handlePaste();
    }

    function handleCut(){
        // Check to see if they are valid to paste into the script (parseable, valid blocks)
        parseBlock.innerHTML = sekritValue;
        if (!parseBlock.firstElementChild){
            app.warn('cut non-HTML content: %s', sekritValue);
            return;
        }
        var ids = [].slice.apply(parseBlock.children).map(function(elem){ console.log(elem); return elem.id; });
        console.log('ids: %o', ids);
        parseBlock.innerHTML = ''; // don't leave elements with duplicate IDs laying around
        ids.forEach(function(id){
            if (!id){
                console.warn('no id in handleCut()');
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
            dom.remove(block);
        });
    }

    function handlePaste(){
        // Check to see if they are valid to paste into the script (parseable, valid blocks)
        parseBlock.innerHTML = sekritSelection.value;
        if (!parseBlock.firstElementChild){
            app.warn('pasted non-HTML content: %s', sekritSelection.value);
            return;
        }
        var pasteBlock = dom.clone(parseBlock.firstElementChild);
        parseBlock.innerHTML = ''; // don't leave elements with duplicate IDs laying around
        if (! dom.matches(pasteBlock, 'wb-expression, wb-step, wb-context, wb-container')){
            app.warn('pasted HTML, but not a block: %s', pasteBlock.localName);
            return;
        }
        // if so, replace selected blocks with pasted content, cloned to get new IDs
        var blocks = Select.blocks();
        if (blocks.length < 1){
            app.warn('No blocks to copy');
            return;
        }
        if (blocks.length > 1){
            app.warn('Can only copy one block at a time');
            return;
        }
        var selectedBlock = blocks[0];
        var selectedParent = selectedBlock.parentElement;
        if (selectedBlock.localName === 'wb-step' || selectedBlock.localName === 'wb-context'){
            if (pasteBlock.localName === 'wb-step' || pasteBlock.localName === 'wb-context'){
                selectedParent.replaceChild(pasteBlock, selectedBlock);
            }else if (pasteBlock.localName === 'wb-contains'){
                while(pasteBlock.children.length){
                    selectedParent.insertBefore(pasteBlock.lastElementChild, selectedBlock.nextElementSibling);
                }
                selectedParent.removeChild(selectedBlock);
            }else{
                app.warn('You cannot paste a ' + pasteBlock.localName + ' in place of a ' + selectedBlock.localName + '.');
                return;
            }
        }else if (selectedBlock.localName === 'wb-contains'){
            if (pasteBlock.localName === 'wb-step' || selectedBlock.localName === 'wb-context'){
                selectedBlock.insertBefore(pasteBlock, selectedBlock.firstElementChild)
            }else if (pasteBlock.localName === 'wb-contains'){
                selectedParent.replaceChild(pasteBlock, selectedBlock);
            }else{
                app.warn('You cannot paste a ' + pasteBlock.localName + ' into a ' + selectedBlock.localName + '.');
                return;
            }
        }else if (selectedBlock.localName === 'wb-expression'){
            if (pasteBlock.localName === 'wb-expression'){
                // is pasteBlock compatible with the socket?
            }else{
                app.warn('You cannot paste a ' + pasteBlock.localName + ' in place of a ' + selectedBlock.localName + '.');
            }
        }else if (selectedBlock.localName === 'wb-value'){
            if (pasteBlock.localName === 'wb-expression'){
                // is pasteBlock compatible with this socket?
            }else{
                app.warn('You cannot paste a ' + pasteBlock.localName + ' into a ' + selectedBlock.localName + '.');
            }
        }
        // validate results
    }

    Event.on(window, 'editor:wb-selectionChanged', null, setupPasteboard);
    Event.on(window, 'editor:keydown', null, setupForCopyPaste);
    Event.on(window, 'editor:keyup', null, cleanupFromCopyPaste);

})();
