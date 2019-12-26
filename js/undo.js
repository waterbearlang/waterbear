// Undo and redo support

(function() {
    "use strict";

    /**UNDO and REDO events**/
    var undoStack = [];
    var redoStack = [];

    function removeFromEvent(evt) {
        evt.parent.removeChild(evt.block);
    }

    function insertFromEvent(evt) {
        evt.parent.insertBefore(evt.block, evt.nextSibling);
    }

    var undoFns = {
        'remove-block': insertFromEvent,
        'add-block': removeFromEvent
    };

    var redoFns = {
        'remove-block': removeFromEvent,
        'add-block': insertFromEvent
    };

    function undoNextEvent() {
        if (undoStack.length !== 0) {
            var undoEvts = undoStack.pop();
            redoStack.push(undoEvts);
            setButtonStatus();
            undoEvent(undoEvts);
        }
    }
    
    function undoEvent(undoEvts){
        if (Array.isArray(undoEvts)){
            for (var i = undoEvts.length; i > 0; i--){
                undoSingleEvent(undoEvts[i-1]);
            }
        }else if(undoEvts.type){
            undoSingleEvent(undoEvts);
        }else{
            throw new Exception('Unexpected undoEvent: ' + undoEvts.toString());
        }
    }
    
    function undoSingleEvent(evt){
        undoFns[evt.type](evt);
        if (evt.subEvents){
            undoEvent(evt.subEvents);
        }
    }
    
    function redoSingleEvent(evt){
        redoFns[evt.type](evt);
        if (evt.subEvents){
            redoEvent(evt.subEvents);
        }
    }
    
    function redoEvent(redoEvts){
        if (Array.isArray(redoEvts)){
            for (var i = 0; i < redoEvts.length; i++){
                redoSingleEvent(redoEvts[i]);
            }
        }else if (redoEvts.type){
            redoSingleEvent(redoEvts);
        }else{
            throw new Exception('Unexpected redoEvent: ' + redoEvts.toString());
        }
    }

    function redoNextEvent() {
        if (redoStack.length !== 0) {
            var redoEvts = redoStack.pop();
            undoStack.push(redoEvts);
            setButtonStatus();
            redoEvent(redoEvts);
        }
    }


    function undoKeyCombo(evt) {
        if ((Event.keyForEvent(evt) == 'z' && Event.keys.ctrl) ||
            (Event.keyForEvent(evt) == 'z' && Event.keys.meta)) {
            evt.preventDefault();
            Pasteboard.cancelPasteboard();
            undoNextEvent();
        }
    }

    function redoKeyCombo(evt) {
        if ((Event.keyForEvent(evt) === 'y' && Event.keys.ctrl) ||
            (Event.keyForEvent(evt) === 'z' && Event.keys.meta && Event.keys.shift)) {
            evt.preventDefault();
            Pasteboard.cancelPasteboard();
            redoNextEvent();
        }
    }

    function handleUndoButton(evt) {
        evt.preventDefault();
        undoNextEvent();
    }

    function handleRedoButton(evt) {
        evt.preventDefault();
        redoNextEvent();
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
        clearStacks: clearStacks,
        partialUndo: undoEvent,
        getStacks: function(){
            return {undoStack: undoStack, redoStack: redoStack}; // for debugging
        }
    };

})();
