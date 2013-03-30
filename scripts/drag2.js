(function(global){

    // FIXME: Remove references to waterbear or jquery (jquery done!)
    // FIXME: Include mousetouch in garden
    // FIXME: Refactor utilities for testing rectangles to its own library (done)


// Goals:
//
// Drag any block from block menu to canvas: clone and add to canvas
// Drag any block from anywhere besides menu to menu: delete block and attached blocks
// Drag any attached block to canvas: detach and add to canvas
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

// Key to jquery.event.touch is the timer function for handling movement and hit testing

    var dragTimeout = 20;
    var snapDist = 25; //In pixels
    var startParent;
    var startIndex;
    var timer;
    var dragTarget;
    var dropTarget;
    var dragging;
    var currentPosition;
    var scope;
    var workspace = document.querySelector('.scripts_workspace');
    var blockMenu = document.querySelector('#block_menu');
    var potentialDropTargets;
    var selectedSocket;

    var dropCursor = document.querySelector('.dropCursor');

    function reset(){
        dragTarget = null;
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        dragging = false;
        cloned = false;
        scope = null;
    }
    reset();



    function initDrag(event){
        //console.log('initdrag %o', event.target);
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        var eT = event.wbTarget;
        if (wb.matches(eT, 'input, select, option, .disclosure')  && !wb.matches(eT, '#block_menu *')) {
            console.log('not a drag handle');
            return undefined;
        }
        var target = wb.closest(eT, '.wrapper');
        if (target){
            dragTarget = target;
            //dragTarget.classList.add("dragIndication");
            startPosition = wb.rect(target);
            if (! wb.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            // Need index too, if it is a step
            if (wb.matches(target, '.step')){
                startIndex = wb.indexOf(target);
            }
        }else{
            console.log('not a valid drag target');
            dragTarget = null;
        }
        return true;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {return undefined;}
        if (wb.matches(dragTarget, '.value')){
            wb.hide(dropCursor);
        }
        dragTarget.classList.add("dragIndication");
        var model = wb.Block.model(dragTarget);
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
        // target = clone target if in menu
        if (model.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            model = model.cloneScript();
            dragTarget = model.view()[0];
            dragTarget.classList.add('dragIndication');
            if (model.isLocal){
                scope = wb.closest(parent, '.context');
            }else{
                scope = null;
            }
            cloned = true;
            // Make sure the workspace is available to drag to
            showWorkspace();
        }else{
            // TODO: handle detach better (generalize restoring sockets, put in language file)
            wb.removeFromScriptEvent(dragTarget);
        }
        dragging = true;
        // get position and append target to .content, adjust offsets
        // set last offset
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
//        if (wb.matches(dragTarget, '.scripts_workspace .step')){
//            dragPlaceholder.style.height = dragTarget.clientHeight + 'px';
//            dragTarget.parentElement.insertBefore(dragPlaceholder, dragTarget);
//        }
        document.querySelector('.content.editor').appendChild(dragTarget);
        wb.reposition(dragTarget, startPosition);
        potentialDropTargets = getPotentialDropTargets(dragTarget, model);
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
        var nextPosition = {left: event.wbPageX, top: event.wbPageY};
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget);
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        currentPosition = nextPosition;
        return false;
    }

    function endDrag(end){
        clearTimeout(timer);
        timer = null;
        if (!dragging) {return undefined;}
        handleDrop();
        reset();
        return false;
    }

    function handleDrop(){
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        dragTarget.classList.remove('dragActive');
        dragTarget.classList.remove('dragIndication');
        potentialDropTargets.forEach(function(elem){
            elem.classList.remove('dropTarget');
        });
        if (wb.overlap(dragTarget, blockMenu)){
            // delete block if dragged back to menu
            console.log('triggering delete_block');
            Event.trigger(dragTarget, 'delete_block');
            dragTarget.parentElement.removeChild(dragTarget);
        }else if (wb.overlap(dragTarget, workspace)){
            dropTarget.classList.remove('dropActive');
            if (wb.matches(dragTarget, '.step')){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                dropTarget.insertBefore(dragTarget, dropCursor);
                dragTarget.removeAttribute('style');
                wb.addToScriptEvent(dropTarget, dragTarget);
            }else{
                console.log('inserting a value in a socket');
                // Insert a value block into a socket
                wb.findChildren(dropTarget, 'input, select').forEach(function(elem){
                    wb.hide(elem); // FIXME: Move to block.js
                });
                dropTarget.appendChild(dragTarget);
                dragTarget.removeAttribute('style');
                wb.addToScriptEvent(dropTarget, dragTarget);
                Event.trigger(dragTarget, 'add_to_socket', {dropTarget: dropTarget, parentIndex: wb.indexOf(dropTarget)});
            }
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                // Put blocks back where we got them from
                if (startParent){
                    if (wb.matches(startParent, '.socket')){
                        wb.findChildren(startParent, 'input').forEach(function(elem){
                            elem.hide();
                        });
                    }
                    startParent.appendChild(dragTarget); // FIXME: We'll need an index into the contained array
                    dragTarget.removeAttribute('style');
                    startParent = null;
                }else{
                    workspace.appendChild(dragTarget); // FIXME: We'll need an index into the canvas array
                    wb.reposition(dragTarget, startPosition);
                }
            }
        }
    }

    function positionExpressionDropCursor(){
        if (!potentialDropTargets.length) return;
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
        var position, middle, y = wb.rect(dragTarget).top;
        for (var tIdx = 0; tIdx < potentialDropTargets.length; tIdx++){
            dropTarget = potentialDropTargets[tIdx];
            if (wb.overlap(dragTarget, dropTarget)){
                var siblings = wb.findChildren(dropTarget, '.step');
                if (siblings.length){
                    for (sIdx = 0; sIdx < siblings.length; sIdx++){
                        var sibling = siblings[sIdx];
                        position = wb.rect(sibling);
                        if (y < position.top || y > position.bottom) continue;
                        middle = position.top + (position.height / 2);
                        if (y < middle){
                            dropTarget.insertBefore(dropCursor, sibling);
                            return;
                        }else{
                            dropTarget.insertBefore(dropCursor, sibling.nextSibling);
                            return;
                        }
                    }
                }else{
                    dropTarget.appendChild(dropCursor);
                    return;
                }
            }
        }
        wb.findAll(workspace, '.step').forEach(function(elem){
            // FIXME: Convert to for() iteration to avoid going over every element
            position = wb.rect(elem);
            if (y < position.top || y > position.bottom) return;
            middle = position.top + (position.height / 2);
            if (y < middle){
                elem.parentElement.insertBefore(dropCursor, elem);
            }else{
                elem.parentElement.insertBefore(dropCursor, elem.nextSibling);
            }
        });
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
        if (wb.matches(dragTarget, '.value')){
            positionExpressionDropCursor();
        }else{
            positionDropCursor();
        }
        setTimeout(hitTest, dragTimeout);
    }

    // Initialize event handlers
    if (Event.isTouch){
        Event.on('.scripts_workspace, .block_menu', 'touchstart', '.block', initDrag);
        Event.on('.content', 'touchmove', null, drag);
        Event.on('.content', 'touchend', null, endDrag);
        Event.on('.scripts_workspace', 'tap', '.socket', selectSocket);
    }else{
        Event.on('.scripts_workspace, .block_menu', 'mousedown', '.block', initDrag);
        Event.on('.content', 'mousemove', null, drag);
        Event.on('.content', 'mouseup', null, endDrag);
        Event.on('.scripts_workspace', 'click', '.socket', selectSocket);
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
        return !elem.querySelector('.wrapper');
    }

    function getPotentialDropTargets(view, model){
        switch(model.blocktype){
            case 'step':
            case 'context':
                if (scope){
                    return wb.findAll(scope, '.contained');
                }else{
                    return wb.findAll(workspace, '.contained').concat([workspace]);
                }
            case 'expression':
                var selector = '.socket' + expressionDropTypes(model.type).join(',.socket');
                if (scope){
                    return wb.findAll(scope, selector).filter(hasChildBlock);
                }else{
                    return wb.findAll(workspace, selector).filter(hasChildBlock);
                }
            case 'eventhandler':
                return [workspace];
            default:
                throw new Error('Unrecognized blocktype: ' + model.blocktype);
        }
    };



})(this);

