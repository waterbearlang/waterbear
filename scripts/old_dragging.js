$('.scripts_workspace .wrapper').live('dragstart', {handle: '.block'}, function(event, callback) {
    var drag = $(this);
    var pos;
    if(drag.parent().is('.scripts_workspace')){
        pos = drag.position();
    }else{
        pos = drag.relOffset();
    }
    if(drag.parent().is('.socket')){
        drag.siblings('input').show();
    }
    if(!drag.parent().is('.scripts_workspace')){
        console.log('unparenting drag node');
        $('.scripts_workspace')._append(this);
    }
    callback.offX = pos.left;
    callback.offY = pos.top;
    if(drag.parent().is('.socket')){
        drag.siblings('input').show();
    }
    drag.css('z-index', 100);
});


$('.scripts_workspace .wrapper').live('drag', {handle: '.block'}, function(event, callback){
  $(this).css({
    left: callback.offX + callback.deltaX,
    top: callback.offY + callback.deltaY
  });
});

$('.scripts_workspace .wrapper').live('dragend', {handle: '.block'}, function(event, callback){
    $(this).css('z-index', 0);
});

$('.scripts_workspace .tab').live('dropstart', function(event, callback){
    // return false for any tab which is an inappropriate target
  // console.log('tab dropstart for %s', $(this));
  var tab = $(this);
  var self = tab.closest('.wrapper');
  var container = tab.parent(); // either .contained or .next
  var drag = $(callback.drag);
  if (container.find('.wrapper').length) {
    // console.log('%s tab is filled');
    return false;
  }
  if($.contains(this.parentNode, callback.drag)){
      // console.log('drag target is already a child of parentNode');
      return false;
  }
  if($.contains(callback.drag, this)){
      // console.log('drag target is contained by this drag element');
      return false;
  }
  if(self.isSameNode(drag)){
      // console.log('drag target and dragged node are the same');
      return false;
  }
  if(drag.hasClass('value')){
      console.log('cannot attache a value block to a tab');
      return false;
  }
  // console.log('it appears to be OK to add %o to %s', callback.drag, $(this).info());
  $(this).css('border', '1px dashed red');
  $(event.drag).find('.slot').css('background-color', 'green');
  return true;
});

$('.scripts_workspace .tab').live('drop', function(event, callback) {
  // console.log('tab drop');
  try{
      $(this).parent()._append($(callback.drag).closest('.wrapper'));
      $(callback.drag).closest('.wrapper').css({position: 'relative', top: 0, left: 0});
  }catch(e){
      console.log('What just happened? I was trying to append %o to %o', $(callback.drag).closest('.wrapper').get(), $(this).parent().get());
  }
  $(this).css('border', '');
  $(event.drag).find('.slot').css('background-color', '');
  
});

$('.scripts_workspace .tab').live('dropend', function(event, callback) {
  // console.log('tab dropend');
  $(this).css('border', 0);
  $(callback.drag).find('.slot').css('background-color', '');
});

$('.scripts_workspace .socket').live('dropstart', function(event, callback) {
    // console.log('socket dropstart for %s', $(this));
    // console.log('drop targets: %o', event);
    var socket = $(this);
    var self = socket.closest('.wrapper');
    var drag = $(callback.drag);
    if(socket.find('.wrapper').length){
        // console.log('Cannot drop on a socket that is already filled');
        return false;
    }
    if(!drag.is('.value')){
        // console.log('Cannot drop a non-value block on a socket');
        return false;
    }
    if($.contains(this, callback.drag)){
        // console.log('drag target is already in this socket');
        return false;
    }
    if($.contains(callback.drag, this)){
        // console.log('socket is contained by this drag element');
        return false;
    }
    if(self.isSameNode(drag)){
        // console.log('Cannot drag to the same node');
        return false;
    }
    if(!socket.matchesClass(drag, 'boolean')){
        // console.log('Can only add a boolean block to a boolean socket');
        return false;
    }
    if (!socket.matchesClass(drag, 'number')){
        // console.log('Can only add a number block to a number socket');
        return false;
    }
    if (!socket.matchesClass(drag, 'string')){
        // console.log('Can only add a string block to a string socket');
        return false;
    }
    // console.log('dropping %s on %s looks acceptable', $(this).info(), $(callback.drag).info());
    socket.find('input').css('border', '1px dashed red');
    socket.css('border', '1px dashed green');
    return true;
});

$('.scripts_workspace .socket').live('drop', function(event, callback) {
    // console.log('socket drop');
    var socket = $(this);
    var drag = $(callback.drag);
    socket.find('input').css('border', '0px').hide();
    socket.css('border', '');
    socket._append(drag);
    drag.css({position: 'relative', top: 0, left: 0, border: ''});
});

$('.scripts_workspace .socket').live('dropend', function(event, callback) {
    // console.log('socket dropend');
    // $(callback.drag).css('border', '1px solid white');
});
