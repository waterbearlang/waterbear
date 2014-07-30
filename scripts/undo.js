// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
	'use strict';
// Undo list

// Undo actions must support two methods:
// - undo() which reverses the effect of the action
// - redo() which reapplies the effect of the action, assuming it has been redone.
// These methods may safely assume that no other actions have been performed.

// This is the maximum number of actions that will be stored in the undo list.
// There's no reason why it needs to be constant; there could be an interface to alter it.
// (Of course, that'd require making it public first.)
var MAX_UNDO = 30;
var undoActions = [];
// When currentAction == undoActions.length, there are no actions available to redo
var currentAction = 0;

function clearUndoStack(){
	undoActions.length = 0;
	currentAction = 0;
	try{
		document.querySelector('.undoAction').classList.add('disabled');
		document.querySelector('.redoAction').classList.add('disabled');
	}catch(e){
		// don't worry if undo ui is not available yet
	}
}

function undoLastAction() {
	if(currentAction <= 0) return; // No action to undo!
	currentAction--;
	undoActions[currentAction].undo();
	if(currentAction <= 0) {
		document.querySelector('.undoAction').classList.add('disabled');
	}
	document.querySelector('.redoAction').classList.remove('disabled');
}

try{
	document.querySelector('.undoAction').classList.add('disabled');
}catch(e){
	return; // some languages do not yet support undo/redo
}

function redoLastAction() {
	if(currentAction >= undoActions.length) return; // No action to redo!
	undoActions[currentAction].redo();
	currentAction++;
	if(currentAction >= undoActions.length) {
		document.querySelector('.redoAction').classList.add('disabled');
	}
	document.querySelector('.undoAction').classList.remove('disabled');
}

try{
	document.querySelector('.redoAction').classList.add('disabled');
}catch(e){
	return; // some languages do not yet support undo/redo
}

function addUndoAction(action) {
	if(!action.hasOwnProperty('redo') || !action.hasOwnProperty('undo')) {
		console.error("Tried to add invalid action!");
		return;
	}
	if(currentAction < undoActions.length) {
		// Truncate any actions available to be redone
		undoActions.length = currentAction;
	} else if(currentAction >= MAX_UNDO) {
		// Drop the oldest action
		currentAction--;
		undoActions.shift();
	}
	undoActions[currentAction] = action;
	currentAction++;
	document.querySelector('.undoAction').classList.remove('disabled');
	document.querySelector('.redoAction').classList.add('disabled');
	// console.log('undo stack: %s', undoActions.length);
}

wb.history = {
	add: addUndoAction,
	undo: undoLastAction,
	redo: redoLastAction,
	clear: clearUndoStack
}

Event.on('.undoAction', 'click', ':not(.disabled)', undoLastAction);
Event.on('.redoAction', 'click', ':not(.disabled)', redoLastAction);
//begin short-cut implementation for redo and undo
Events.bind(document, 'keystroke.Ctrl+Z', undoLastAction);
Events.bind(document, 'keystroke.Ctrl+Y', redoLastAction);
//for mac user, cmd added 
Events.bind(document, 'keystroke.meta+Z', undoLastAction);
Events.bind(document, 'keystroke.meta+Y', redoLastAction);
//end short cut 
Event.on(document.body, 'wb-initialize', null, function(evt){
    if (evt.detail.component === 'script'){
        clearUndoStack();
    }
});

})(wb);
