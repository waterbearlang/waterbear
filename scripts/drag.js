(function(runtime){
'use strict';
    var dragTarget = null;
    var isDragging = false;
    var pointerDown = false;

    function reset(){
        // called when we end a drag for any reason
        dragTarget = null;
        isDragging = false;
        pointerDown = false;
        Event.trigger(document, 'drag-reset');
    }

    function initDrag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // Don't start drag on a text input or select
        pointerDown = true;
        dragTarget = event.target;
        Event.forward(event.target, 'drag-init', event);
        return false;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) { return undefined; }
        if (!pointerDown) { return undefined; }
        isDragging = true;
        Event.forward(event.target, 'drag-start', event);
        return false;
    }

    function dragging(event){
        if (!dragTarget) { return undefined; }
        if (!isDragging) {
          if (startDrag(event) === undefined) {
            return undefined;
          }
        }
        event.preventDefault();
        // update the variables, distance, button pressed
        Event.forward(event.target, 'dragging', event);
        return false;
    }

    function endDrag(event){
        pointerDown = false;
        if (!isDragging) { return undefined; }
        Event.forward(event.target, 'drag-end', event);
        event.preventDefault();
        reset();
        return false;
    }

    function cancelDrag(event) {
        // Cancel if escape key pressed
        if(event.keyCode == 27) {
            Event.forward(event.target, 'drag-cancel', event);
            reset();
            return false;
        }
    }

    window.drag = {
        init: initDrag,
        dragging: dragging,
        end: endDrag,
        cancel: cancelDrag
    };

})(this);

