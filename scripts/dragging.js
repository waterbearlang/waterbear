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

(function($){
    var drag_target = null;
    var drop_targets = [];
    
})(jQuery);

$('.block_menu .wrapper').drag('init', function(event){
    var self = $(this);
    var block = self.clone();
    var offset = self.offset();
    block.appendTo(document.body);
    block.css('position', 'absolute');
    block.offset(offset);
    return block;
});

$('.wrapper').drag(
    function(evt, dd){
        var self = $(this);
        self.css({left: dd.offsetX, top: dd.offsetY});
    }, 
    {   
        handle: '.block',
        drop: '.block'
    }
);


// set options 
$.drop({
    mode: 'intersectBlock'
});

$('.block i').bind('dropstart', function(evt, dd){
    if (dd.drag == dd.drop) return false;
    var drag = $(dd.drag);
    drag.data('old_color', drag.css('background-color'));
    drag.css('background-color', $(this).css('background-color'));
});

$('.block i').bind('dropend', function(evt, dd){
    var drag = $(dd.drag);
    drag.css('background-color', drag.data('old_color'));
});
