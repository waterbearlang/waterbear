$('.sprite').drag(function(evt, dd){
    $(this).css({left: dd.offsetX, top: dd.offsetY});
}, {handle: 'b',
    drop: 'i'});
   
// set options 
$.drop({
    mode: 'intersectHandle'
});

$('.sprite i').bind('dropstart', function(evt, dd){
    console.log('drag: %o, available: %o', dd.drag, dd.available);
    if (dd.drag == dd.drop) return false;
    console.log('dropstart');
    console.log('available: %o', dd.available);
    var drag = $(dd.drag);
    drag.data('old_color', drag.css('background-color'));
    drag.css('background-color', $(this).css('background-color'));
});

$('.sprite i').bind('dropend', function(evt, dd){
    console.log('dropend');
    console.log('available: %o', dd.available);
    var drag = $(dd.drag);
    drag.css('background-color', drag.data('old_color'));
});
