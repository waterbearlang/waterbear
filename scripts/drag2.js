(function(global){

    // FIXME: Remove references to waterbear or jquery
    // FIXME: Include mousetouch in garden
    // FIXME: Refactor utilities for testing rectangles to its own library


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

    var dropCursor = document.querySelector('.dropCursor');


    function initDrag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        if (!Event.blend(event)) {return undefined;}
        var eT = event.target;
        if (Event.matches(eT, 'input, select, option, .disclosure')  && !Event.matches(eT, '#block_menu *')) {return undefined;}
        var target = Event.closest(eT, '.wrapper');
        if (target){
            dragTarget = target;
            //dragTarget.addClass("dragIndication");
            startPosition = rect(target);
            if (! Event.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            // Need index too, if it is a step
            if (Event.matches(target, '.step')){
                startIndex = Event.indexOf(target);
            }
        }else{
            dragTarget = null;
        }
        return true;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!Event.blend(event)) {return undefined;}
        if (!dragTarget) {return undefined;}
        dragTarget.addClass("dragIndication");
        var model = Block.model(dragTarget);
        currentPosition = {left: event.pageX, top: event.pageY};
        // target = clone target if in menu
        if (model.isTemplateBlock){
            dragTarget.removeClass('dragIndication');
            dragTarget = model.cloneScript().view();
            dragTarget.classList.add('dragIndication');
            cloned = true;
        }
        dragging = true;
        // Make sure the workspace is available to drag to
        showWorkspace();
        // get position and append target to .content, adjust offsets
        // set last offset
        // TODO: handle detach better (generalize restoring sockets, put in language file)
        wb.removeFromScriptEvent(dragTarget);
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
        if (Event.match(dragTarget, '.scripts_workspace .step')){
            dragPlaceholder.style.height = dragTarget.clientHeight; // WTF?
            dragTarget.parentElement.insertBefore(dragPlaceholder, dragTarget);
        }
        document.querySelector('.content.editor').appendChild(dragTarget);
        reposition(dragTarget, startPosition);
        potentialDropTargets = getPotentialDropTargets();
        dropRects = potentialDropTargets.map(function(elem, idx){
            return rect(elem);
        });

        // start timer for drag events
        timer = setTimeout(hitTest, dragTimeout);
        return false;
    }

    function drag(event){
        if (!Event.blend(event)) {return undefined;}
        if (!dragTarget) {return undefined;}
        if (!currentPosition) {startDrag(event);}
        event.preventDefault();
        // update the variables, distance, button pressed
        var nextPosition = {left: event.pageX, top: event.pageY};
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = rect(dragTarget);
        reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
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
        if (dropTarget){
            dropTarget.classList.remove('dropActive');
            if (blockType(dragTarget) === 'step' || blockType(dragTarget) === 'context'){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                dragTarget.removeAttribute('style');
                wb.addToScriptEvent(dropTarget, dragTarget);
            }else{
                // Insert a value block into a socket
                makeArray(dropTarget.querySelectorAll('> input, > select')).forEach(function(elem){
                    elem.hide(); // FIXME: Move to block.js
                });
                // dropTarget.append(dragTarget);
                dragTarget.removeAttribute('style');
                wb.addToScriptEvent(dropTarget, dragTarget);
                // dragTarget.trigger('add_to_socket', {dropTarget: dropTarget, parentIndex: dropTarget.data('index')});
            }
        }else if (cursorOver(document.querySelector('#block_menu'))){
            // delete block if dragged back to menu
            console.log('triggering delete_block');
            Event.trigger(dragTarget, 'delete_block');
            dragTarget.parentElement.removeChild(dragTarget);
        }else if (overlap(dragTarget, targetCanvas)){
            dragTarget.parentElement.insertBefore(dragTarget, dropCursor);
            dragTarget.removeAttribute('style');
            wb.addToScriptEvent(targetCanvas, dragTarget);
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                // Put blocks back where we got them from
                if (startParent){
                    if (Event.match(startParent, '.socket')){
                        makeArray(startParent.querySelectorAll('> input')).forEach(function(elem){
                            elem.hide();
                        });
                    }
                    startParent.appendChild(dragTarget); // FIXME: We'll need an index into the contained array
                    dragTarget.removeAttribute('style');
                    startParent = null;
                }else{
                    targetCanvas.appendChild(dragTarget); // FIXME: We'll need an index into the canvas array
                    reposition(dragTarget, startPosition);
                }
            }
        }
    }

    function positionDropCursor(){
        var position, middle, y = rect(dragTarget).top;
        makeArray(targetCanvas.querySelectorAll('.step')).forEach(function(elem){
            // FIXME: Convert to for() iteration to avoid going over every element
            position = rect(elem);
            if (y < position.top || y > position.bottom) return;
            middle = position.top + (position.height / 2);
            if (y < middle){
                elem.parentElement.insertBefore(dropCursor, elem);
            }else{
                elem.parentElement.insertBefore(dropCursor, elem.nextSibling);
            }
        });
    }

//
//
// LEFT OFF HERE, Pick up and continue
//
//


    function hitTest(){
        // test the dragging rect(s) against the target rect(s)
        // test all of the left borders first, then the top, right, bottom
        // goal is to eliminate negatives as fast as possible
        if (!dragTarget) {return;}
        var dropIndex = -1;
        var dropArea = 0;
        var dragType = blockType(dragTarget);
        var dragTargetFlap = dragTarget.children('.block');
        switch(dragType){
            case 'eventhandler':
                setTimeout(hitTest, dragTimeout);
                return positionDropCursor(); // no flap
            case 'step': dragTargetFlap = dragTargetFlap.children('.flap');
        }
        var dragRect = dragTargetFlap.rect();
        var area = 0;
        $.each(dropRects, function(idx, elem){
            area = overlap(dragRect, elem);
            if (area > dropArea){
                dropIndex = idx;
                dropArea = area;
            }
        else if(dragRect && elem){
        val = dist(dragRect.left, dragRect.top, elem.left, elem.top);
        if(val < snapDist){
            dropIndex = idx;
            dropArea = area;
        }
        }
        });
        if (dropTarget && dropTarget.length){
            dropTarget.removeClass('dropActive');
        }
        if (dropIndex > -1){
            dropTarget = potentialDropTargets.eq(dropIndex).addClass('dropActive');
            dragTarget.addClass('dragActive');
            dropCursor.hide();
        }else{
            dragTarget.removeClass('dragActive');
            positionDropCursor();
            dropTarget = null;
        }
        timer = setTimeout(hitTest, dragTimeout);
    }

    // Initialize event handlers
    if (Event.isTouch){
        $('.scripts_workspace, .block_menu').on('touchstart', '.block', initDrag);
        $('.content').live('touchmove', drag);
        $('.content').live('touchend', endDrag);
    }else{
        $('.scripts_workspace, .block_menu').on('mousedown', '.block', initDrag);
        $('.content').live('mousemove', drag);
        $('.content').live('mouseup', endDrag);
    }

    //
    //
    // UTILITY FUNCTIONS
    //
    //

    function makeArray(arrayLike){
        return Array.prototype.slice.call(arrayLike);
    }

    function reposition(elem, position){
        // put an absolutely positioned element in the right place
        // May need to take into account offsets of container
        elem.style.top = position.top;
        elem.style.bottom = position.bottom;
        console.log('if element looks wrong, fix it in reposition()');
    }

    function mag(p1, p2){
        return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
    }

    function dist(p1, p2, m1, m2){
        return Math.sqrt(Math.pow(p1 - m1, 2) + Math.pow(p2 - m2, 2));
    }


    function overlapRect(r1, r2){ // determine area of overlap between two rects
        if (r1.left > r2.right){ return 0; }
        if (r1.right < r2.left){ return 0; }
        if (r1.top > r2.bottom){ return 0; }
        if (r1.bottom < r2.top){ return 0; }
        var max = Math.max, min = Math.min;
        return (max(r1.left, r2.left) - min(r1.right, r2.right)) * (max(r1.top, r2.top) - min(r1.bottom, r2.bottom));
    }

    function rect(elem){
        return elem.getBoundingClientRect();
    }

    function overlap(elem1, elem2){
        return overlapRect(rect(elem1), rect(elem2));
    }


    function area(elem){
        return elem.clientWidth * elem.clientHeight;
    }

    function containedBy(target, container){
        var targetArea = Math.min(area(target), area(container) * 0.90);
        return target.overlap(container) >= targetArea;
    }

    function cursorOver(elem){
        var rect = elem.getBoundingClientRect();
        return currentPosition.left >= rect.left && currentPosition.left <= rect.right &&
           currentPosition.top >= rect.top && currentPosition.top <= rect.bottom;
    }



})(this);

