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
    var drag_target, target_canvas, drop_targets, start_position, timer, dragging;
    var is_touch = window.ontouchstart && true;
    var drag_timeout = 20;

    function reset(){
        drag_target = null;
        target_canvas = null;
        drop_targets = [];
        start_position = null;
        timer = null;
        dragging = false;
        on_drag = start_drag; // prime trampoline
    }
    
    reset();
    
    function blend(event){
        if (is_touch){
            if (event.originalEvent.touches.length > 1){
                return false;
            }
            var touch = event.originalEvent.touches[0];
            event.target = touch.target;
            event.pageX = touch.pageX;
            event.pageY = touch.pageY;
        }else{
            if (event.which !== 1){ // left mouse button 
                return false;
            }
        }
        // fix target?
        return event;
    }
        
    function init_drag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // TODO: Don't start drag on a text input
        if (!blend(event)) return;
        var target = $(event.target).closest('.wrapper');
        if (target.length){
            drag_target = target;
            start_position = target.offset();
            target_canvas = $('.workspace:visible .scripts_workspace');
        }else{
            drag_target = null;
        }
    }
    
    function start_drag(event){
        // called on mousemove or touchmove if not already dragging
        if (!blend(event)) return;
        // if no target, return
        // target = clone target if in menu
        // get position and append target to .content, adjust offsets
        // set last offset
        // start timer for drag events
        timer = setTimeout(hit_test, drag_timeout);
        continue_drag(event);
    }
    
    function continue_drag(event){
        if (!blend(event)) return;
        // update the variables, distance, button pressed
    }
    
    function end_drag(end){
        clearTimeout(timer);
        // TODO:
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        reset();
    }
    
    function hit_test(){
        // test the dragging rect(s) against the target rect(s)
        // test all of the left borders first, then the top, right, bottom
        // goal is to eliminate negatives as fast as possible
        timer = setTimeout(hit_test, drag_timeout);
    }
    
    if (is_touch){
        $('.scripts_workspace, .block_menu')
            .delegate('.block', 'mousedown', init_drag)
            .delegate('.block', 'mousemove', on_drag)
            .delegate('.block', 'mouseup', end_drag);
    }else{
        $('.scripts_workspace, .block_menu')
            .delegate('.block', 'touchstart', init_drag)
            .delegate('.block', 'touchmove', on_drag)
            .delegate('.block', 'touchend', end_drag);
    }
    
})(jQuery);
