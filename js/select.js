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
            if (!valueBlock) {
                return;
            }
        }
        if (valueBlock) {
            valueBlock.classList.add('selected-value');
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
            })
        }
        if (block && block.parentElement.localName === 'wb-local') {
            block = dom.closest(block.parentElement, 'wb-context, wb-step, wb-expression');
        }
        if (block) {
            if (block.localName === 'wb-context' && added) {
                dom.find(block, 'wb-contains').classList.add('selected-block');
            } else {
                block.classList.add('selected-block');
            }
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

    function firstSocket(block) {
        var sockets = dom.findAll(block, 'wb-value');
        var socket;
        for (var i = 0; i < sockets.length; i++) {
            socket = sockets[i];
            // Don't return a socket from a child block
            if (socket.closest('wb-context, wb-step, wb-expression') !== block) {
                continue;
            }
            if (!isValueSelectable(socket)) {
                continue;
            }
            // otherwise, return the socket
            return socket;
        }
    }

    function unselectAllBlocks() {
        selectByBlock(null);
        selectByValue(null);
    }

    function manageSelections(evt) {
        var block = dom.closest(evt.target, 'wb-context, wb-step, wb-expression, wb-value, wb-contains');
        if (block && block.localName === 'wb-contains' && block.parentElement.localName === 'wb-workspace') {
            block = null;
        }
        var value = block;
        var retainSelection = evt.type === 'click' && (Event.keys['ctrl'] || Event.keys['meta']);
        if (!block) {
            // clicking away should deselect
            unselectAllBlocks(null);
            return;
        }
        if (block.localName === 'wb-value' || block.localName === "wb-contains") {
            selectByBlock(dom.closest(block, 'wb-context, wb-step, wb-expression'), retainSelection, evt.type === 'wb-added');
        } else {
            selectByBlock(dom.closest(block, 'wb-context, wb-step, wb-expression, wb-contains'), retainSelection, evt.type === 'wb-added');
        }
        if (block.localName !== 'wb-value') {
            value = firstSocket(block);
        } else if (!isValueSelectable(value)) {
            value = firstSocket(dom.closest(value, 'wb-context, wb-step, wb-expression'));
        }
        if (value) {
            selectByValue(value);
        }
    }

    /**************************************
    *
    * Click to insert at selection (if possible
    *
    **************************************/

    function insertBlockAtSelection(){
    }

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
})();
