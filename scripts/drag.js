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

(function($){
    var drag_target, potential_drop_targets, drop_target, drop_rects, start_position, timer, cloned, dragging, current_position, distance, start_parent;
    window.is_touch = window.hasOwnProperty('ontouchstart') && true;
    var drag_timeout = 20;
    // TODO: update this whenever we switch to a new workspace
    var target_canvas = $('.workspace:visible .scripts_workspace');
    
    function reset(){
        drag_target = null;
        potential_drop_targets = $();
        drop_rects = [];
        drop_target = $();
        start_position = null;
        start_parent = null;
        current_position = null;
        timer = null;
        dragging = false;
        cloned = false;
    }
    
    reset();
    
    function blend(event){
        if (is_touch){
            if (event.originalEvent.touches.length > 1){
                // console.log('blend fails, too many touches');
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
    
    function get_potential_drop_targets(){
        switch(drag_target.block_type()){
            case 'step': return step_targets();
            case 'number': return socket_targets('number');
            case 'boolean': return socket_targets('boolean');
            case 'string': return socket_targets('string');
            default: return $();
        }
    }
    
    function step_targets(){
        return target_canvas.find('.slot:only-child');
    }
    
    function socket_targets(type){
        return target_canvas.find('.socket.' + type + ':not(:has(.value))');
    }
        
    function init_drag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // TODO: Don't start drag on a text input
        if (!blend(event)) return undefined;
        var eT = $(event.target);
        if (eT.is(':input') && ! eT.contained_by($('.block_menu'))) return undefined;
        // console.log('init_drag');
        var target = eT.closest('.wrapper');
        if (target.length){
            drag_target = target;
            start_position = target.offset();
            if (! target.parent().is('.scripts_workspace')){
                start_parent = target.parent();
            }
        }else{
            console.log('no target in init_drag');
            drag_target = null;
        }
        return false;
    }
    
    function start_drag(event){
        // console.log('trying to start drag');
        // called on mousemove or touchmove if not already dragging
        if (!blend(event)) return undefined;
        if (!drag_target) return undefined;
        // console.log('start_drag');
        current_position = {left: event.pageX, top: event.pageY};
        // target = clone target if in menu
        if (drag_target.is('.block_menu .wrapper')){
            drag_target = drag_target.clone(true);
            cloned = true;
        }
        dragging = true;
        // get position and append target to .content, adjust offsets
        // set last offset
        // TODO: handle detach better
        if (drag_target.parent().is('.socket')){
            drag_target.parent().append('<input />');
        }
        drag_target.css('position', 'absolute');
        $('.content').append(drag_target);
        drag_target.offset(start_position);
        potential_drop_targets = get_potential_drop_targets();
        // console.log('%s potential drop targets', potential_drop_targets.length);
        // console.log('drop targets: [%s]', $.map(potential_drop_targets, function(elem, idx){
        //     return $(elem).long_name();
        // }).join(', '));
        drop_rects = $.map(potential_drop_targets, function(elem, idx){
            return $(elem).rect();
        });
        // console.log('%s drop_rects', drop_rects.length);
        // console.log('drop rects: %o', drop_rects);

        // start timer for drag events
        timer = setTimeout(hit_test, drag_timeout);
        return false;
    }
    
    function drag(event){
        // console.log('trying to drag, honestly');
        if (!blend(event)) return undefined;
        if (!drag_target) return undefined;
        if (!current_position) start_drag(event);
        event.preventDefault();
        // update the variables, distance, button pressed
        var next_position = {left: event.pageX, top: event.pageY};
        var dX = next_position.left - current_position.left;
        var dY = next_position.top - current_position.top;
        var curr_pos = drag_target.offset();
        drag_target.offset({left: curr_pos.left + dX, top: curr_pos.top + dY});
        current_position = next_position;
        return false;
    }
    
    function end_drag(end){
        // console.log('end_drag');
        clearTimeout(timer);
        timer = null;
        if (!dragging) return undefined;
        handle_drop();
        reset();
        return false;
    }
    
    function handle_drop(){
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        drag_target.removeClass('drag_active');
        if (drop_target && drop_target.length){
            drop_target.removeClass('drop_active');
            if (drag_target.block_type() === 'step'){
                drop_target.parent().append(drag_target);
                drag_target.css({
                    position: 'relative',
                    left: 0,
                    top: 0
                });
            }else{
                // console.log('trying to drop: into %s', drop_target.long_name());
                drop_target.find('input').remove();
                drop_target.append(drag_target);
                drag_target.css({
                    position: 'relative',
                    left: 0,
                    top: 0
                });
            }
        }else if (drag_target.overlap(target_canvas)){
            // console.log('Drop onto canvas');
            var curr_pos = drag_target.offset();
            target_canvas.append(drag_target);
            drag_target.offset(curr_pos);
        }else if (drag_target.contained_by($('.block_menu'))){
            // console.log('remove drag target');
            drag_target.remove();
        }else{
            if (cloned){
                // console.log('remove cloned block');
                drag_target.remove();
            }else{
                // console.log('put block back where we found it');
                if (start_parent){
                    if (start_parent.is('.socket')){
                        start_parent.children('input').remove();
                    }
                    start_parent.append(drag_target);
                    drag_target.css({
                        position: 'relative',
                        top: 0,
                        left: 0
                    });
                }else{
                    target_canvas.append(drag_target);
                    drag_target.offset(start_position);
                }
            }
        }
    }
        
    function hit_test(){
        // test the dragging rect(s) against the target rect(s)
        // test all of the left borders first, then the top, right, bottom
        // goal is to eliminate negatives as fast as possible
        if (!drag_target) return;
        var drop_idx = -1;
        var drop_area = 0;
        var drag_type = drag_target.block_type();
        var drag_target_flap = drag_target.children('.block');
        switch(drag_type){
            case 'trigger': return; // no flap
            case 'step': drag_target_flap = drag_target_flap.children('.flap');
        }
        var drag_rect = drag_target_flap.rect();
        // console.log('drag_rect: %s', rect_str(drag_rect));
        var area = 0;
        $.each(drop_rects, function(idx, elem){
            area = overlap(drag_rect, elem);
            // console.log('match vs. %s: %s', rect_str(elem), area);
            if (area > drop_area){
                drop_idx = idx;
                drop_area = area;
                // console.log('found potential match');
            }
        });
        if (drop_target && drop_target.length){
            drop_target.removeClass('drop_active');
        }
        if (drop_idx > -1){
            drop_target = potential_drop_targets.eq(drop_idx).addClass('drop_active');
            drag_target.addClass('drag_active');
        }else{
            drag_target.removeClass('drag_active');
            drop_target = null;
        }
        timer = setTimeout(hit_test, drag_timeout);
    }
    
    // Initialize event handlers
    if (is_touch){
        $('.scripts_workspace, .block_menu').delegate('.block', 'touchstart', init_drag);
        $('.content').live('touchmove', drag);
        $('.content').live('touchend', end_drag);
    }else{
        $('.scripts_workspace, .block_menu').delegate('.block', 'mousedown', init_drag);
        $('.content').live('mousemove', drag);
        $('.content').live('mouseup', end_drag);
    }
    
    // Utility methods
    function mag(p1, p2){
        return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
    }
    
    function rect_str(r){
        return '<rect left: ' + r.left + ', top: ' + r.top + ', width: ' + r.width + ', height: ' + r.height + ', right: ' + r.right + ', bottom: ' + r.bottom + ', center_x = ' + r.center_x + ', center_y = ' + r.center_y + '>'; 
    }
    
    function overlap(r1, r2){ // determine area of overlap between two rects
        if (r1.left > r2.right){ return 0; }
        if (r1.right < r2.left){ return 0; }
        if (r1.top > r2.bottom){ return 0; }
        if (r1.bottom < r2.top){ return 0; }
        var max = Math.max, min = Math.min;
        return (max(r1.left, r2.left) - min(r1.right, r2.right)) * (max(r1.top, r2.top) - min(r1.bottom, r2.bottom));
    }
    
    // jQuery extensions
    $.fn.extend({
        rect_str: function(){
            return rect_str(this.rect());
        },
        rect: function(){
            var pos = this.offset();
            var width = this.outerWidth();
            var height = this.outerHeight();
            return {left: pos.left,
                    top: pos.top,
                    width: width,
                    height: height,
                    right: pos.left + width,
                    bottom: pos.top + height,
                    center_x: pos.left + width/2,
                    center_y: pos.top + height/2
            };
        },
        overlap: function(target){
            return overlap(this.rect(), target.rect());
        },
        area: function(){
            return this.outerWidth() * this.outerHeight();
        },
        contained_by: function(target){
            return this.overlap(target) === this.area();
        }
    });
    
})(jQuery);
