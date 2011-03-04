// Goals:
//
// Drag any block from block menu to canvas: clone and add to canvas
// Drag any block from anywhere besides menu to menu: delete block and attached blocks
// Drag any attached block to canvas: detach and add to canvas
// Drag any block (from block menu, canvas, or attached) to a matching, open attachment point: add to that script at that point
//    Triggers have no slot, so no attachment point
//    Steps can only be attached to slot -> tab
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
//     d) move drag target
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

(function($){
    var drag_target = null;
    var target_canvas = null;
    var drop_targets = [];
    var start_position = null;
    var is_touch = window.ontouchstart && true;
    var drag_timeout = 20;
    
    function init_mouse_drag(event){
        // Called on mousedown, we haven't started dragging yet
        // TODO: if anything but mouse button 1, return
        var target = $(event.target).closest('.wrapper');
        if (target.length){
            drag_target = target;
            start_position = target.offset();
            target_canvas = $('.workspace:visible .scripts_workspace');
        }else{
            drag_target = null;
        }
    }
    
    function start_mouse_drag(event){
        // if no target, return
        // target = clone target if in menu
        // get position and append target to .content, adjust offsets
        // set last offset
        // start timer for drag events
    }
        
}

    
})(jQuery);
