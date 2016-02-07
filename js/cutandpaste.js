(function(){
    // Depends on select.js, block.js, event.js (maybe others?)
    // FIXME: Manage scope
    // FIXME: Manage cut (vs. copy)

    var sekritSelection = document.createElement('div');
    var sekretValue = '';
    sekritSelection.id = 'sekritSelection';
    sekritSelection.className = 'hidden';
    document.body.appendChild(sekritSelection);

    function setupForCopyPaste(evt){
        // if ctrl or command key is not in event, return
        var key = Event.keyForEvent(evt);
        if (key !== 'ctrl' && key !== 'meta'){
            return;
        }
        // if DOM-selection is non-empty return
        if (!window.getSelection().isCollapsed){
            app.warn('non-block selected');
            return;
        }
        // get selected element (warn if multiple elements are selected)
        var blocks = Select.blocks();
        if (blocks.length < 1){
            app.warn('No blocks to copy');
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
        sekritValue = blocks[0].outerHTML;
        sekritSelection.innerHTML = sekritValue;
        // DOM-select contents of sekritSelection in case there is a copy command
        var sel = window.getSelection();
        sel.removeAllRanges();
        var rng = document.createRange();
        rng.selectNodeContents(sekritSelection);
        sel.addRange(rng);
        evt.preventDefault();
        evt.stopPropagation();
    }

    function cleanupFromCopyPaste(evt){
        // if ctrl or command key is not in event, return
        // FIXME: can get confused if both are pressed
        var key = Event.keyForEvent(evt);
        if (key !== 'ctrl' && key !== 'meta'){
            return;
        }
        // test to see if contents of sekritSelection have changed
        if (sekritSelection.innerHTML === sekritValue){
            app.warn('sekrit has not changed');
            console.log('sekrit: %o', sekritSelection.firstElementChild);
            return;
        }
        // if so, check to see if they are valid to paste into the script (parseable, valid blocks)
        var pasteBlock = dom.clone(secretSelection.firstElementChild);
        if (! dom.matches(block, 'wb-expression, wb-step, wb-context, wb-container')){
            app.warn('sekrit is not a block');
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
        // clear sekrits
        sekritSelection.innerHTML = sekritValue = '';
    }

    Event.on(window, 'editor:keydown', null, setupForCopyPaste);
    Event.on(window, 'editor:keyup', null, cleanupFromCopyPaste);

})();
