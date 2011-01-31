$('.sprite').drag(function(evt, dd){
    console.log('draggin');
    $(this).css({left: dd.offsetX, top: dd.offsetY});
});




