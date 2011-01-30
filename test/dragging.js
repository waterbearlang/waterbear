// document.ontouchstart = null;
// $('html').get(0).ontouchmove = function(event){
//     console.log('Preventing the drag');
//      event.preventDefault();
// };


$('.sprite').drag(function(evt, dd){
    console.log('draggin');
    $(this).css({left: dd.offsetX, top: dd.offsetY});
});




