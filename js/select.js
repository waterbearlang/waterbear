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

    function selectByValue(valueBlock) {
        // Todo:
        // * make sure this is a valid block to select
        // * move selection to next block as needed
        var oldValue = dom.find(workspace, '.selected-value');
        if (oldValue) {
            // clicking an item for a second time is not deselecting
            if (oldValue === valueBlock) {
                /* nothing to do */
                return;
            }
            oldValue.classList.remove('selected-value');
        }
        if (valueBlock) {
            selectByBlock(null);
            valueBlock.classList.add('selected-value');
        }
        if (oldValue || valueBlock){
            Event.trigger(window, 'wb-changedSelection');
        }
    }

    function selectByBlock(block, retainSelection, added) {
        // Todo:
        // * make sure this is a valid block to select
        // * move selection to next block as needed
        var oldBlocks = dom.findAll(workspace, '.selected-block');
        if (oldBlocks.length && !retainSelection) {
            if (oldBlocks.length === 1 && oldBlocks[0] === block) {
                /* nothing to do */
                return;
            }
            selectByValue(null);
            oldBlocks.forEach(function(e) {
                e.classList.remove('selected-block');
            });
        }
        if (block && block.parentElement.localName === 'wb-local') {
            block = dom.closest(block.parentElement, 'wb-context, wb-step, wb-expression');
        }
        if (block) {
            selectByValue(null);
            if (block.localName === 'wb-context' && added) {
                dom.find(block, 'wb-contains').classList.add('selected-block');
            } else {
                block.classList.add('selected-block');
            }
        }
        if (oldBlocks.length || block){
            Event.trigger(window, 'wb-selectionChanged');
        }
    }

    // Manage block selections

    function isValueSelectable(value) {
        // Don't select literals, we don't want you adding blocks there
        if (value.getAttribute('allow') === 'literal') {
            return false;
        }
        // don't select locals
        if (value.parentElement.localName === 'wb-local') {
            return false;
        }
        // don't select values which contain a block already
        if (dom.find(value, 'wb-expression')) {
            return false;
        }
        // don't select values which don't have a socket (i.e., an <input>)
        if (!dom.find(value, 'input')) {
            return false;
        }
        return true;
    }

    function unselectAllBlocks() {
        selectByBlock(null);
        selectByValue(null);
    }

    function manageSelections(evt) {
        var value, block;
        if (dom.matches(evt.target, 'wb-value > input')){
            value = dom.closest(evt.target, 'wb-value');
        }
        if (!value){
            block = dom.closest(evt.target, 'wb-context, wb-step, wb-expression, wb-contains');
        }
        if (!block && !value){
            // clicking away should deselect
            unselectAllBlocks(null);
            return;
        }
        var retainSelection = evt.type === 'click' && (Event.keys.ctrl || Event.keys.meta);
        if (block){
            selectByBlock(block, retainSelection, evt.type === 'wb-added');
        }else if (value){
            selectByValue(value);
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
