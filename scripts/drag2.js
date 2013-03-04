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
            if (Event.matches(target, '.step, .trigger')){
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
            dragTarget.addClass('dragIndication');
            cloned = true;
        }
        dragging = true;
        // Make sure the workspace is available to drag to
        showWorkspace();
        // get position and append target to .content, adjust offsets
        // set last offset
        // TODO: handle detach better (generalize restoring sockets, put in language file)
        // console.log('[1] model: %s', dragTarget.data('model'));
        wb.removeFromScriptEvent(dragTarget);
        // console.log('[2] model: %s', dragTarget.data('model'));
        dragTarget.css('position', 'absolute');
        if (dragTarget.is('.scripts_workspace .wrapper')){
            dragPlaceholder = $('<div class="dragPlaceholder"></div>');
            dragPlaceholder.height(dragTarget.outerHeight());
            dragTarget.before(dragPlaceholder);
        }
        $('.content.editor').append(dragTarget);
        // console.log('[3] model: %s', dragTarget.data('model'));
        dragTarget.offset(startPosition);
        potentialDropTargets = getPotentialDropTargets();
        dropRects = $.map(potentialDropTargets, function(elem, idx){
            return $(elem).rect();
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
        dragTarget.offset({left: currPos.left + dX, top: currPos.top + dY});
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
        dragTarget.removeClass('dragActive');
        dragTarget.removeClass("dragIndication");
        if (dropTarget && dropTarget.length){
            dropTarget.removeClass('dropActive');
            if (blockType(dragTarget) === 'step' || blockType(dragTarget) === 'context'){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                dragTarget.removeAttr('style');
                wb.addToScriptEvent(dropTarget, dragTarget);
            }else{
                // Insert a value block into a socket
                dropTarget.children('input, select').hide(); // FIXME: Move to block.js
                // dropTarget.append(dragTarget);
                dragTarget.removeAttr('style');
                wb.addToScriptEvent(dropTarget, dragTarget);
                // dragTarget.trigger('add_to_socket', {dropTarget: dropTarget, parentIndex: dropTarget.data('index')});
            }
        }else if ($('#block_menu').cursorOver()){
            // delete block if dragged back to menu
            console.log('triggering delete_block');
            dragTarget.trigger('delete_block');
            dragTarget.remove();
        }else if (dragTarget.overlap(targetCanvas)){
            dropCursor.before(dragTarget);
            dropCursor.remove();
            dropCursor = null;
            dragTarget.removeAttr('style');
            wb.addToScriptEvent(targetCanvas, dragTarget);
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.remove();
            }else{
                // Put blocks back where we got them from
                var startParent = dragTarget.data('startParent');
                if (startParent){
                    if (startParent.is('.socket')){
                        startParent.children('input').hide();
                    }
                    startParent.append(dragTarget); // FIXME: We'll need an index into the contained array
                    dragTarget.removeAttr('style');
                    dragTarget.removeData('startParent');
                }else{
                    targetCanvas.append(dragTarget); // FIXME: We'll need an index into the canvas array
                    dragTarget.offset(startPosition);
                }
            }
        }
        if (dragPlaceholder){
            dragPlaceholder.remove();
            dragPlaceholder = null;
        }
    }

    function positionDropCursor(){
        var self, top, middle, bottom, x = dragTarget.position().top;
        targetCanvas.prepend(dropCursor);
        dropCursor.show();
        targetCanvas.children('.wrapper').each(function(idx){
            self = $(this);
            top = self.position().top;
            bottom = top + self.outerHeight();
            middle = (bottom - top) / 2 + top;
            if (x < middle){
                self.before(dropCursor);
                return false;
            }else{
                self.after(dropCursor);
            }
        });
    }

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

