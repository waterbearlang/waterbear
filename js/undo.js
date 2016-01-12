// Undo and redo support

(function() {
    "use strict";

    /**UNDO and REDO events**/
    var undoStack = [];
    var redoStack = [];

    function undoEvent(toUndo) {
        if (undoStack.length !== 0) {
            var toUndo = undoStack.pop();
            redoStack.push(toUndo);
            setButtonStatus();
            if (toUndo.type === 'delete-block') {
                undoDelete(toUndo);
            } else if (toUndo.type === 'add-block') {
                undoAdd(toUndo);
            } else {
                undoMove(toUndo);
            }
        }
    }

    function undoAdd(toUndo) {
        var addedBlock = toUndo.addedBlock;
        var addedTo = toUndo.addedTo;
        addedTo.removeChild(addedBlock);
    }

    function undoDelete(toUndo) {
        var deletedBlock = toUndo.deletedBlock;
        var deletedFrom = toUndo.deletedFrom;
        var nextBlock = toUndo.nextBlock;
        if (nextBlock) {
            deletedFrom.insertBefore(deletedBlock, nextBlock);
        } else {
            deletedFrom.appendChild(deletedBlock);
        }
    }

    function undoMove(toUndo) {
        var addedBlock = toUndo.addedBlock;
        var addedTo = toUndo.addedTo;
        var origParent = toUndo.originalParent;
        var origNextEl = toUndo.originalNextEl;
        //remove from parent expression
        addedTo.removeChild(addedBlock);

        if (toUndo.type === 'add-var-block') {
            addedBlock = toUndo.insideBlock;
        }

        //add back to original parent expression
        if (origNextEl) {
            origParent.insertBefore(addedBlock, origNextEl);
        } else {
            origParent.appendChild(addedBlock);
        }
    }

    function redoEvent() {
        if (redoStack.length !== 0) {
            var toRedo = redoStack.pop();
            undoStack.push(toRedo);
            setButtonStatus();
            if (toRedo.type === 'delete-block') {
                redoDelete(toRedo);
            } else if (toRedo.type === 'add-block') {
                redoAdd(toRedo);
            } else {
                redoMove(toRedo);
            }
        }
    }

    function redoAdd(toRedo) {
        var addedBlock = toRedo.addedBlock;
        var addedTo = toRedo.addedTo;
        var nextBlock = toRedo.nextBlock;
        if (nextBlock) {
            addedTo.insertBefore(addedBlock, nextBlock);
        } else {
            addedTo.appendChild(addedBlock);
        }
    }

    function redoDelete(toRedo) {
        var deletedBlock = toRedo.deletedBlock;
        var deletedFrom = toRedo.deletedFrom;
        deletedFrom.removeChild(deletedBlock);
    }

    function redoMove(toRedo) {
        var addedBlock = toRedo.addedBlock;
        var addedTo = toRedo.addedTo;
        var origParent = toRedo.originalParent;
        var nextBlock = toRedo.nextBlock;

        //remove the block from it's original parent again
        if (toRedo.type === 'move-block') {
            origParent.removeChild(addedBlock);
        } else { //type is add-var-block; must add back into setVariable block too
            origParent.removeChild(toRedo.insideBlock);
            addedBlock
                .querySelector('wb-value[type="any"]')
                .appendChild(toRedo.insideBlock);
        }

        //add block back to where it was before the undo
        if (nextBlock) {
            addedTo.insertBefore(addedBlock, nextBlock);
        } else {
            addedTo.appendChild(addedBlock);
        }
    }

    function undoKeyCombo(evt) {
        if ((Event.keyForEvent(evt) == 'z' && Event.keys['ctrl']) ||
            (Event.keyForEvent(evt) == 'z' && Event.keys['meta'])) {
            evt.preventDefault();
            undoEvent();
        }
    }

    function redoKeyCombo(evt) {
        if ((Event.keyForEvent(evt) === 'y' && Event.keys['ctrl']) ||
            (Event.keyForEvent(evt) === 'z' && Event.keys['meta'] && Event.keys['shift'])) {
            evt.preventDefault();
            redoEvent();
        }
    }

    function handleUndoButton(evt) {
        evt.preventDefault();
        _gaq.push(['_trackEvent', 'Undo', 'undo']);
        undoEvent();
    }

    function handleRedoButton(evt) {
        evt.preventDefault();
        _gaq.push(['_trackEvent', 'Redo', 'redo']);
        redoEvent();
    }

    function setButtonStatus() {
        if (undoStack.length === 0) {
            document.getElementById('undoButton').disabled = true;
        } else {
            document.getElementById('undoButton').disabled = false;
        }
        if (redoStack.length === 0) {
            document.getElementById('redoButton').disabled = true;
        } else {
            document.getElementById('redoButton').disabled = false;
        }
    }

    function clearStacks() {
        undoStack = [];
        redoStack = [];
        setButtonStatus();
    }

    //add a new event to the undo stack
    function addNewEvent(evt) {
        redoStack = [];
        undoStack.push(evt);
        setButtonStatus();
    }

    window.Undo = {
        undoKeyCombo: undoKeyCombo,
        redoKeyCombo: redoKeyCombo,
        handleUndoButton: handleUndoButton,
        handleRedoButton: handleRedoButton,
        addNewEvent: addNewEvent,
        clearStacks: clearStacks
    };

})();