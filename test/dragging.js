$('.sprite').drag(function(evt, dd){
    $(this).css({left: dd.offsetX, top: dd.offsetY});
}, {handle: 'b',
    drop: 'i'});
   
// set options 
$.drop({
    mode: 'intersectHandle'
});

$('.sprite i').bind('dropstart', function(evt, dd){
    if (dd.drag == dd.drop) return false;
    var drag = $(dd.drag);
    drag.data('old_color', drag.css('background-color'));
    drag.css('background-color', $(this).css('background-color'));
});

$('.sprite i').bind('dropend', function(evt, dd){
    var drag = $(dd.drag);
    drag.css('background-color', drag.data('old_color'));
});
