/***************************************
 *
 * Handle selecting blocks and sockets
 *
 * This should be moved to select.js
 *
 ***************************************/

(function() {
    'use strict';

    var workspace = dom.find(document.body, 'wb-workspace');
    var BLOCK_MENU = document.querySelector('sidebar');


    function handleEnter(evt) {
        var code = evt.keyCode ? evt.keyCode : evt.which;
        if (code === 13) {
            var selectedElem = dom.closest(evt.target, 'wb-value');
            selectedElem.deselect();
            // clear selections
            unselectAllBlocks();
            app.clearFilter();
            dom.find(selectedElem, 'input').blur();
        }
        return false;
    }
    
    Block.proto.makeSelected = function(){
        if (!isBlockSelectable(this)){
            return;
        }
        unselectAllBlocks();
        this.classList.add('selected');
    };
    
    Block.valueProto.makeSelected = Block.proto.makeSelected;
    Block.containedProto.makeSelected = Block.proto.makeSelected;


    // Manage block selections

    function isBlockSelectable(block) {
        // Don't select literals, we don't want you adding blocks there
        if (block.getAttribute('allow') === 'literal') {
            return false;
        }
        // don't select locals
        if (block.parentElement.localName === 'wb-local') {
            return false;
        }
        if (block.localName === 'wb-value'){
            // don't select values which contain a block already
            if (dom.find(block, 'wb-expression')) {
                return false;
            }
            // don't select values which don't have a socket (i.e., an <input>)
            if (!dom.find(block, 'input')) {
                return false;
            }
        }
        return true;
    }

    function unselectAllBlocks() {
        dom.findAll(workspace, '.selected').forEach(function(block){
            block.classList.remove('selected');
        });
    }

    function manageSelections(evt) {
        var block = dom.closest(evt.target, 'wb-value, wb-contains, wb-context, wb-step, wb-expression');
        if (block){
            block.makeSelected();
        }else{
            unselectAllBlocks();
        }
    }

    /**************************************
    *
    * Click/Tap to insert at selection (if possible
    *
    **************************************/

    function insertBlockAtSelection(evt){
        // we clone because we assume this is coming from a block catalog
        var block = dom.clone(dom.closest(evt.target, 'wb-context, wb-step, wb-expression'));
        var selected = getSelectedBlocks();
        if (selected.length > 1){
            app.warn('Can only insert at one position, multiple blocks are selected');
            return;
        }
        if (selected.length < 1){
            app.warn('Cannot insert unless you select a block to insert at');
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

    function getSelectedBlocks(){
        return dom.findAll(workspace, '.selected-value, .selected-block');
    }
    
    function clearSelection(evt){
        var ts = getSelection();
        if (ts.baseNode && util.inList(ts.baseNode.localName, ['wb-value', 'input'])){
            return;
        }
        var selected = getSelectedBlocks();
        if (selected.length){
            Undo.addNewEvent(selected
                .filter(function(block){
                    // filter to only actual blocks, not wb-contains or wb-value, which are also selectable
                    return util.inList(block.localName, ['wb-context', 'wb-step', 'wb-expression']);
                }).map(function(block){
                    return block.undoableRemove(); 
                })
            );
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    /**************************************
    *
    * Public API
    *
    ***************************************/

    window.Select = {
        blocks: getSelectedBlocks
    };

    /**************************************
    *
    * Event handlers
    *
    ***************************************/

    /* Some helpers for selections */
    Event.on(workspace, 'editor:click', '*', manageSelections);
    Event.on(workspace, 'editor:wb-added', null, manageSelections);

    // Hit enter to deselect
    Event.on(workspace, 'editor:keydown', 'wb-value input', handleEnter);

    // Blocks get selected automatically as they're added, but we don't want to start with a selection after loading a script
    Event.on(window, 'editor:wb-scriptLoaded', null, unselectAllBlocks);

    // Insert block
    Event.on(BLOCK_MENU, 'editor:click', 'wb-context, wb-step, wb-expression', insertBlockAtSelection);
    Event.on(workspace, 'editor:click', 'wb-local > wb-context, wb-local > wb-step, wb-local > wb-expression', insertBlockAtSelection);
    
    // Clear (delete) selected elements on backspace or delete
    Event.onKeyDown('delete', clearSelection);
    Event.onKeyDown('backspace', clearSelection);
})();
