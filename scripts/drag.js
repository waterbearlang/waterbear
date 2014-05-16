// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(runtime){
'use strict';
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
    var startParent;
    var startSibling;
    var timer;
    var dragTarget;
    var dropTarget;
    var dropRects;
    var isDragging;
    var currentPosition;
    var scope;
    var potentialDropTargets;
    var startPosition;
    var pointerDown;
    
    
    function reset(){
        // console.log('reset dragTarget to null');
        // Some of this is dragEnd, some is initialization and some belongs in wb-drag
        dragTarget = null;
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        isDragging = false;
        pointerDown = false;
        blockMenu = document.querySelector('#block_menu');
        startParent = null;
        startSibling = null;
        Event.trigger(document, 'drag-reset');
    }
    
    function initDrag(event){
        // console.log('initDrag(%o)', event);
        
        // Called on mousedown or touchstart, we haven't started dragging yet
        // Don't start drag on a text input or select 
        pointerDown = true;
        dragTarget = event.target;
        Event.forward(event.target, 'drag-init', event);
        return false;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {return undefined;}
        if (!pointerDown) {return undefined;}
        isDragging = true;
        // console.log('startDrag(%o)', event);
        // start timer for drag events
        timer = setTimeout(hitTest, dragTimeout);
        Event.forward(event.target, 'drag-start', event);
        return false;
    }

    function dragging(event){
        if (!dragTarget) {return undefined;}
        if (!isDragging) {startDrag(event);}
        // console.log('drag(%o)', event);
        event.preventDefault();
        // update the variables, distance, button pressed
        Event.forward(event.target, 'dragging', event);
        return false;
    }

    function endDrag(event){
        pointerDown = false;
        // console.log('endDrag(%o) dragging: %s', event, dragging);
        if (!isDragging) {return undefined;}
        clearTimeout(timer);
        timer = null;
        Event.forward(event.target, 'drag-end', event);
        event.preventDefault();
        return false;
    }

    function cancelDrag(event) {
        // Cancel if escape key pressed
        // console.log('cancel drag of %o', dragTarget);
        if(event.keyCode == 27) {
            clearTimeout(timer);
            timer = null;
            Event.forward(event.target, 'drag-cancel', event);
            reset();
            return false;
        }
    }

    window.drag = {
        init: initDrag,
        dragging: dragging,
        end: endDrag,
        cancel: cancelDrag,
        reset: reset
    };

})(this);

