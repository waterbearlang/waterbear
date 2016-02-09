// Undo and redo support

(function() {
    "use strict";

    /**UNDO and REDO events**/
    var undoStack = [];
    var redoStack = [];

    function removeFromEvent(evt) {
        evt.addedTo.removeChild(evt.addedBlock);
    }

    function insertFromEvent(evt) {
        evt.insertBefore(evt.deletedBlock, evt.nexBlock);
    }

    var undoFns = {
        'remove-block': insertFromEvent,
        'add-block': removeFromEvent
    }

    var redoFns = {
        'remove-block': removeFromEvent,
        'add-block': insertFromEvent
    }

    function undoEvent(toUndo) {
        if (undoStack.length !== 0) {
            var undoEvts = undoStack.pop();
            redoStack.push(undoEvts);
            setButtonStatus();
            for (var i = undoEvts.length; i > 0; i--){ // count backwards when undo-ing
                var evt = undoEvts[i-1];
                undoFns[evt.type](evt);
            }
        }
    }

    function redoEvent() {
        if (redoStack.length !== 0) {
            var redoEvts = redoStack.pop();
            undoStack.push(redoEvts);
            setButtonStatus();
            for (var i = 0; i < redoEvts.length; i++){
                var evt = redoEvts[i-1];
                redoFns[evt.type](evt);
            }
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
        redoStack = []; // clear redoStack when we add a new undo event
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
