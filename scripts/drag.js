(function(global){

    // After trying to find a decent drag-and-drop library which could handle
    // snapping tabs to slots *and* dropping expressions in sockets *and*
    // work on both touch devices and with mouse/trackpad *and* could prevent dragging
    // expressions to sockets of the wrong type, ended up writing a custom one for
    // Waterbear which does what we need. The last piece makes it waterbear-specific
    // but could potentially be factored out if another library supported all of the
    // rest (and didn't introduce new dependencies such as jQuery)

    // FIXME: Remove references to waterbear
    // FIXME: Include mousetouch in garden


// Goals:
//
// Drag any block from block menu to script canvas: clone and add to script canvas
// Drag any block from anywhere besides menu to menu: delete block and contained blocks
// Drag any attached block to canvas: detach and add to script canvas
// Drag any block (from block menu, canvas, or attached) to a matching, open attachment point: add to that script at that point
//    Triggers have no flap, so no attachment point
//    Steps can only be attached to flap -> slot
//    Values can only be attached to sockets of a compatible type
// Drag any block to anywhere that is not the block menu or on a canvas: undo the drag

// Drag Pseudocode
//
// Mouse Dragging:
//
// 1. On mousedown, test for potential drag target
// 2. On mousemove, if mousedown and target, start dragging
//     a) test for potential drop targets, remember them for hit testing
//     b) hit test periodically (not on mouse move)
//     c) clone element (if necessary)
//     d) if dragging out of a socket, replace with input of proper type
//     e) move drag target
// 3. On mouseup, if dragging, stop
//     a) test for drop, handle if necessary
//     b) clean up temporary elements, remove or move back if not dropping
//
//
// Touch dragging
//
// 1. On touchmove, test for potential drag target, start dragging
//     a..d as above
// 2. On touchend, if dragging, stop
//    a..b as above

// Key to touch is the timer function for handling movement and hit testing

    var dragTimeout = 20;
    var snapDist = 25; //In pixels
    var startParent;
    var startSibling;
    var timer;
    var dragTarget;
    var dropTarget;
    var dragging;
    var currentPosition;
    var scope;
    var workspace; // <- WB
    var blockMenu = document.querySelector('#block_menu'); // <- WB
    var potentialDropTargets;
    var selectedSocket; // <- WB
    var dragAction = {};
    var templateDrag, localDrag; // <- WB

    var _dropCursor; // <- WB

    // WB-specific
    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.dropCursor');
        }
        return _dropCursor;
    }

    function reset(){
        // console.log('reset dragTarget to null');
        dragTarget = null;
        dragAction = {undo: undoDrag, redo: redoDrag}; // <- WB
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        dragging = false;
        cloned = false; // <- WB
        scope = null; // <- WB
        templateDrag = false; // <- WB
        localDrag = false; // <- WB
        blockMenu = document.querySelector('#block_menu');
        workspace = null;
        selectedSocket = null;
        _dropCursor = null;
        startParent = null;
        startSibling = null;
    }
    reset();



    function initDrag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        var eT = event.wbTarget; // <- WB
        //Check whether the original target was an input ....
        // WB-specific
        if (wb.matches(event.target, 'input, select, option, .disclosure, .contained')  && !wb.matches(eT, '#block_menu *')) {
            // console.log('not a drag handle');
            return undefined;
        }
        var target = wb.closest(eT, '.block'); // <- WB
        if (target){
            // WB-Specific
            if (wb.matches(target, '.scripts_workspace')){
                // don't start drag on workspace block
                return undefined;
            }
            dragTarget = target;
            // WB-Specific
            if (target.parentElement.classList.contains('block-menu')){
                //console.log('target parent: %o', target.parentElement);
                target.dataset.isTemplateBlock = 'true';
                templateDrag = true;
            }
        	dragAction.target = target;
            // WB-Specific
            if (target.parentElement.classList.contains('locals')){
                //console.log('target parent: %o', target.parentElement);
                target.dataset.isLocal = 'true';
                localDrag = true;
            }
            //dragTarget.classList.add("dragIndication");
            startPosition = wb.rect(target); // <- WB
            // WB-Specific
            if (! wb.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            startSibling = target.nextElementSibling;
            // WB-Specific
            if(startSibling && !wb.matches(startSibling, '.block')) {
            	// Sometimes the "next sibling" ends up being the cursor
            	startSibling = startSibling.nextElementSibling;
            }
        }else{
            console.warn('not a valid drag target');
            dragTarget = null;
        }
        return false;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {return undefined;}
        dragTarget.classList.add("dragIndication");
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
		// Track source for undo/redo
		dragAction.target = dragTarget;
		dragAction.fromParent = startParent;
		dragAction.fromBefore = startSibling;
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
        // WB-Specific
        if (dragTarget.dataset.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            // console.log('set drag target to clone of old drag target');
            dragTarget = wb.cloneBlock(dragTarget); // clones dataset and children, yay
            dragAction.target = dragTarget;
			// If we're dragging from the menu, there's no source to track for undo/redo
			dragAction.fromParent = dragAction.fromBefore = null;
            // Event.trigger(dragTarget, 'wb-clone'); // not in document, won't bubble to document.body
            dragTarget.classList.add('dragIndication');
            if (localDrag){
                scope = wb.closest(parent, '.context');
            }else{
                scope = null;
            }
            cloned = true;
            // Make sure the workspace is available to drag to
            wb.showWorkspace('block');
        }else{
            // TODO: handle detach better (generalize restoring sockets, put in language file)
            // FIXME: Need to handle this somewhere
            // FIXME: Better name?
            // WB-Specific
            Event.trigger(dragTarget, 'wb-remove');
        }
        dragging = true;
        // get position and append target to .content, adjust offsets
        // set last offset
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
        // WB-Specific
        document.querySelector('.content.editor').appendChild(dragTarget);
        // WB-Specific
        if (cloned){
            // call this here so it can bubble to document.body
            Event.trigger(dragTarget, 'wb-clone');
        }
        // WB-Specific
        wb.reposition(dragTarget, startPosition);
        // WB-Specific ???
        potentialDropTargets = getPotentialDropTargets(dragTarget);
        // WB-Specific
        console.log(potentialDropTargets.length);
        dropRects = potentialDropTargets.map(function(elem, idx){
            elem.classList.add('dropTarget');
            return wb.rect(elem);
        });
        // start timer for drag events
        timer = setTimeout(hitTest, dragTimeout);
        return false;
    }

    function drag(event){
        if (!dragTarget) {return undefined;}
        if (!currentPosition) {startDrag(event);}
        event.preventDefault();
        // update the variables, distance, button pressed
        var nextPosition = {left: event.wbPageX, top: event.wbPageY}; // <- WB
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget); // <- WB
        // WB-Specific
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        // Scoll workspace as needed
        // WB-Specific
        if (workspace){
            // FIXME: is this why scroll-wheel doesn't work?
            // FIXME: is this why scrolling down works poorly?
            var container = workspace.parentElement;
            var offset = wb.rect(container);
            if (currPos.top < offset.top){
                container.scrollTop -= Math.min(container.scrollTop, offset.top - currPos.top);
            }else if (currPos.bottom > offset.bottom){
                var maxVerticalScroll = container.scrollHeight - offset.height - container.scrollTop;
                container.scrollTop += Math.min(maxVerticalScroll, currPos.bottom - offset.bottom);
            }
            if (currPos.left < offset.left){
                container.scrollLeft -= Math.min(container.scrollLeft, offset.left - currPos.left);
            }else if(currPos.right > offset.right){
                var maxHorizontalScroll = container.scrollWidth - offset.width - container.scrollLeft;
                container.scrollLeft += Math.min(maxHorizontalScroll, currPos.right - offset.right);
            }
        }
        currentPosition = nextPosition;
        return false;
    }

    function endDrag(end){
        clearTimeout(timer);
        timer = null;
        if (!dragging) {return undefined;}
        handleDrop(end.altKey || end.ctrlKey);
        reset();
        return false;
    }

    function handleDrop(copyBlock){
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        resetDragStyles(); // <- WB
        // WB-Specific
        if (wb.overlap(dragTarget, blockMenu)){
            // delete block if dragged back to menu
            Event.trigger(dragTarget, 'wb-delete');
            dragTarget.parentElement.removeChild(dragTarget);
            // Add history action if the source block was in the workspace
            if(!templateDrag) {
	        	// If we're dragging to the menu, there's no destination to track for undo/redo
    	    	dragAction.toParent = dragAction.toBefore = null;
        		wb.history.add(dragAction);
        	}
        }else if (dropTarget){
            dropTarget.classList.remove('dropActive');
            if (wb.matches(dragTarget, '.step')){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                if(copyBlock && !templateDrag) {
                    // FIXME: This results in two blocks if you copy-drag back to the starting socket
                	revertDrop();
                    // console.log('clone dragTarget block to dragTarget');
                	dragTarget = wb.cloneBlock(dragTarget);
                }
                dropTarget.insertBefore(dragTarget, dropCursor());
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }else{
                // Insert a value block into a socket
                if(copyBlock && !templateDrag) {
                	revertDrop();
                    // console.log('clone dragTarget value to dragTarget');
                	dragTarget = wb.cloneBlock(dragTarget);
                }
                dropTarget.appendChild(dragTarget);
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }
            dragAction.toParent = dragTarget.parentNode;
            dragAction.toBefore = dragTarget.nextElementSibling;

            //CLARIFY: What does this block do? dragAction.toBefore.nextElementSibling is always null
            // if(dragAction.toBefore && !wb.matches(dragAction.toBefore, '.block')) {
            // 	// Sometimes the "next sibling" ends up being the cursor
            // 	dragAction.toBefore = dragAction.toBefore.nextElementSibling;
            // }
            wb.history.add(dragAction);
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
            	revertDrop();
            }
        }
    }
    
    /* There's basically four types of drag actions
- Drag-in – dragging a block from the menu to the workspace
 	If fromParent is null, this is the type of drag that occurred.
 	- To undo: remove the block from the workspace
 	- To redo: re-insert the block into the workspace
- Drag-around - dragging a block from one position to another in the workspace
	Indicated by neither of fromParent and toParent being null.
	- To undo: remove the block from the old position and re-insert it at the new position.
	- To redo: remove the block from the old position and re-insert it at the new position.
- Drag-out - dragging a block from the workspace to the menu (thus deleting it)
	If toParent is null, this is the type of drag that occurred.
	- To undo: re-insert the block into the workspace.
	- To redo: remove the block from the workspace.
- Drag-copy - dragging a block from one position to another in the workspace and duplicating it
	At the undo/redo level, no distinction from drag-in is required.
	- To undo: remove the block from the new location.
	- To redo: re-insert the block at the new location.
	
	Note: If toBefore or fromBefore is null, that just means the location refers to the last
	possible position (ie, the block was added to or removed from the end of a sequence). Thus,
	we don't check those to determine what action to undo/redo.
 	*/
    
    function undoDrag() {
    	if(this.toParent != null) {
    		// Remove the inserted block
            // WB-Specific
    		Event.trigger(this.target, 'wb-remove');
    		this.target.remove();
    	}
    	if(this.fromParent != null) {
    		// Put back the removed block
    		this.target.removeAttribute('style');
            // WB-Specific
    		if(wb.matches(this.target,'.step')) {
    			this.fromParent.insertBefore(this.target, this.fromBefore);
    		} else {
    			this.fromParent.appendChild(this.target);
    		}
            // WB-Specific
			Event.trigger(this.target, 'wb-add');
    	}
    }
    
    function redoDrag() {
    	if(this.toParent != null) {
            // WB-Specific
    		if(wb.matches(this.target,'.step')) {
    			this.toParent.insertBefore(this.target, this.toBefore);
    		} else {
    			this.toParent.appendChild(this.target);
    		}
			Event.trigger(this.target, 'wb-add');
    	}
    	if(this.fromParent != null) {
            // WB-Specific
    		Event.trigger(this.target, 'wb-remove');
    		this.target.remove();
    	}
    }

    function resetDragStyles() {
        if (dragTarget){
            dragTarget.classList.remove('dragActive');
            dragTarget.classList.remove('dragIndication');
        }
        potentialDropTargets.forEach(function(elem){
            elem.classList.remove('dropTarget');
        });
    }
    
    function revertDrop() {
		// Put blocks back where we got them from
		if (startParent){
			if (wb.matches(startParent, '.socket')){
				// wb.findChildren(startParent, 'input').forEach(function(elem){
				//     elem.hide();
				// });
			}
			if(startSibling) {
				startParent.insertBefore(dragTarget, startSibling);
			} else {
				startParent.appendChild(dragTarget);
			}
			dragTarget.removeAttribute('style');
			startParent = null;
		}else{
			workspace.appendChild(dragTarget); // FIXME: We'll need an index into the canvas array
			wb.reposition(dragTarget, startPosition);
		}
        Event.trigger(dragTarget, 'wb-add');
    }

    function positionExpressionDropCursor(){
        if (!potentialDropTargets.length){
            console.log('no drop targets found');
            return;
        }
        var targets = potentialDropTargets.map(function(target){
            return [wb.overlap(dragTarget, target), target];
        });
        targets.sort().reverse();
        if(dropTarget){
            dropTarget.classList.remove('dropActive');
        }
        dropTarget = targets[0][1]; // should be the potential target with largest overlap
        dropTarget.classList.add('dropActive');
    }

    function positionDropCursor(){
        var dragRect = wb.rect(wb.findChild(dragTarget, '.label'));
        var cy = dragRect.top + dragRect.height / 2; // vertical centre of drag element
        // get only the .contains which cx is contained by
        var overlapping = potentialDropTargets.filter(function(item){
            var r = wb.rect(item);
            if (cy < r.top) return false;
            if (cy > r.bottom) return false;
            return true;
        });
        overlapping.sort(function(a, b){
            return wb.rect(b).left - wb.rect(a).left; // sort by depth, innermost first
        });
        if (!overlapping.length){
            workspace.appendChild(dropCursor());
            dropTarget = workspace;
            return;
        }
        dropTarget = overlapping[0];
        var position, middle;
        var siblings = wb.findChildren(dropTarget, '.step');
        if (siblings.length){
            for (var sIdx = 0; sIdx < siblings.length; sIdx++){
                var sibling = siblings[sIdx];
                position = wb.rect(sibling);
                if (cy < (position.top -4) || cy > (position.bottom + 4)) continue;
                middle = position.top + (position.height / 2);
                if (cy < middle){
                    dropTarget.insertBefore(dropCursor(), sibling);
                    return;
                }else{
                    dropTarget.insertBefore(dropCursor(), sibling.nextSibling);
                    return;
                }
            }
            dropTarget.appendChild(dropCursor()); // if we get here somehow, add it anyway
        }else{
            dropTarget.appendChild(dropCursor());
            return;
        }
    }

    function selectSocket(event){
        // FIXME: Add tests for type of socket, whether it is filled, etc.
        event.wbTarget.classList.add('selected');
        selectedSocket = event.wbTarget;
    }

    function hitTest(){
        // test the dragging rect(s) against the target rect(s)
        // test all of the left borders first, then the top, right, bottom
        // goal is to eliminate negatives as fast as possible
        if (!dragTarget) {return;}
        if (wb.matches(dragTarget, '.expression')){
            positionExpressionDropCursor();
        }else{
            positionDropCursor();
        }
        setTimeout(hitTest, dragTimeout);
    }

    function expressionDropTypes(expressionType){
        switch(expressionType){
            case 'number': return ['.number', '.int', '.float', '.any'];
            case 'int': return ['.number', '.int', '.float', '.any'];
            case 'float': return ['.number', '.float', '.any'];
            case 'any': return [];
            default: return ['.' + expressionType, '.any'];
        }
    }

    function hasChildBlock(elem){
        // FIXME, I don't know how to work around this if we allow default blocks
        return !wb.findChild(elem, '.block');
    }

    function getPotentialDropTargets(view){
        if (!workspace){
            workspace = document.querySelector('.scripts_workspace').querySelector('.contained');
        }
        var blocktype = view.dataset.blocktype;
        switch(blocktype){
            case 'step':
            case 'context':
                if (scope){
                    return wb.findAll(scope, '.contained');
                }else{
                    return wb.findAll(workspace, '.contained').concat([workspace]);
                }
            case 'asset':
            case 'expression':
                var selector = expressionDropTypes(view.dataset.type).map(dataSelector).join(',');
                if (!selector || !selector.length){
                    selector = '.socket > .holder'; // can drop an any anywhere
                }
                if (scope){
                    return wb.findAll(scope, selector).filter(hasChildBlock);
                }else{
                    return wb.findAll(workspace, selector).filter(hasChildBlock);
                }
            case 'eventhandler':
                return [workspace];
            default:
                throw new Error('Unrecognized blocktype: ' + blocktype);
        }
    };

    function dataSelector(name){
        if (name[0] === '.'){
            name = name.slice(1); // remove leading dot
        }
        return '.socket[data-type=' + name + '] > .holder';
    }
    
    function cancelDrag(event) {
    	// Cancel if escape key pressed
        // console.log('cancel drag of %o', dragTarget);
    	if(event.keyCode == 27) {
    		resetDragStyles();
	    	revertDrop();
			clearTimeout(timer);
			timer = null;
			reset();
			return false;
	    }
    }

    // Initialize event handlers
    wb.initializeDragHandlers = function(){
        // console.log('initializeDragHandlers');
        if (Event.isTouch){
            Event.on('.content', 'touchstart', '.block', initDrag);
            Event.on('.content', 'touchmove', null, drag);
            Event.on('.content', 'touchend', null, endDrag);
            // TODO: A way to cancel the drag?
            // Event.on('.scripts_workspace', 'tap', '.socket', selectSocket);
        }else{
            Event.on('.content', 'mousedown', '.block', initDrag);
            Event.on(document, 'mousemove', null, drag);
            Event.on('.content', 'mouseup', null, endDrag);
            Event.on(document.body, 'keyup', null, cancelDrag);
            // Event.on('.scripts_workspace', 'click', '.socket', selectSocket);
        }
    };
})(this);

