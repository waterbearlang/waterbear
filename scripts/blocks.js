$.fn.extend({
  long_name: function() {
    var names;
    names = [];
    this.each(function() {
      var e, parts;
      e = this;
      parts = [e.tagName.toLowerCase()];
      e.id ? parts.push('#' + e.id) : null;
      e.className ? parts.push('.' + e.className.split(/\s/).join('.')) : null;
      return names.push(parts.join(''));
    });
    return '[' + names.join(', ') + ']';
  },
  info: function(){
      return this.closest('.wrapper').long_name();
  },
  isSameNode: function(jqOrNode) {
    var _a, other, self;
    self = this.get(0);
    other = (typeof (_a = jqOrNode.TEXT_NODE) !== "undefined" && _a !== null) ? jqOrNode.TEXT_NODE : (jqOrNode = jqOrNode.get(0));
    return self.isSameNode(other);
  },
  matchesClass: function(jq, klass){
      return !(this.hasClass(klass) && !jq.hasClass(klass));
  },
  relOffset: function(){
      // this is horribly innefficient, I know
      var canvas_pos = $('.scripts_workspace').offset();
      var this_pos = this.offset();
      return {left: this_pos.left - canvas_pos.left, top: this_pos.top - canvas_pos.top};
  },
  center: function() {
    return this.each(function() {
      var dx, dy, p, ph, pw, t;
      t = $(this);
      dx = t.outerWidth() / 2;
      dy = t.outerHeight() / 2;
      p = t.offsetParent();
      pw = p.innerWidth() / 2;
      ph = p.innerHeight() / 2;
      return t.css({
        position: 'absolute',
        left: pw - dx,
        top: ph - dy
      });
    });
  }
});

function button(options){
    return $('<button>' + options.button + '</button>');
}

function block(options){
    if (options.button){
        return button(options);
    }
    opts = $.extend({
        klass: 'control',
        tab: true, // Something can come after
        trigger: false, // This is the start of a handler
        slot: true, // something can come before
        containers: 0,  // Something cannot be inside
        label: 'Step', // label is its own mini-language
        type: null
    }, options);
    if (opts.trigger){
        opts.slot = false; // can't have both slot and trigger
    }
    if (opts['type']){
        opts.tab = false; // values nest, but do not follow
        opts.slot = false;
    }
    var wrapper = $('<div class="wrapper ' + opts.klass + '"><div class="block"><p><label>' + label(opts.label) + '</label></p></div></div>');
    var block = wrapper.children();
    if (opts['type']){
        block.addClass(opts['type'].name.toLowerCase());
        wrapper.addClass('value').addClass(opts['type'].name.toLowerCase());
    }
    if (opts.trigger){
        block.append('<b class="trigger"></b>');
    }else if(opts.slot){
        block.append('<b class="slot"></b>');
    }
    for (var i = 0; i < opts.containers; i++){
        block.append('<b class="slot"></b><div class="contained"><i class="tab"></i></div>');
    }
    if (opts.tab){
        wrapper.append('<div class="next"><i class="tab"></i></div>');
    }
    return wrapper;
}

function label(value){
    // Recognize special values in the label string and replace them with 
    // appropriate markup. Some values are dynamic and based on the objects currently
    // in the environment
    //
    // values include:
    //
    // [flag] => the start flag image
    // [key] => any valid key on the keyboard
    // [sprite] => any currently defined sprite
    // [number] => an empty number socket
    // [number:default] => a number socket with a default value
    // [boolean] => an empty boolean socket
    // [boolean:default] => a boolean with a default value
    // [string] => an empty string socket
    // [string:default] => a string socket with a default value
    // [message] => a message combo box
    // [stop] => stop sign graphic  /\[number:(-?\d*\.\d+)\]/
    value = value.replace(/\[number:(-?\d*\.?\d+)\]/g, '<div class="number socket"><input type="number" value="$1"></div>');
    value = value.replace(/\[number\]/g, '<div class="number socket"><input type="number"></div>');
    value = value.replace(/\[boolean:(true|false)\]/g, '<div class="boolean socket"><input type="boolean" value="$1"></div>');
    value = value.replace(/\[boolean\]/g, '<div class="boolean socket"><input type="boolean"></div>');
    value = value.replace(/\[string:(.+)\]/g, '<div class="string socket"><input type="text" value="$1"></div>');
    value = value.replace(/\[string\]/g, '<div class="string socket"><input type="text"></div>');
    return value;
}


$('.content_wrap .wrapper').live('click', function(event) {
    var copy = $(this).clone();
    $('.scripts_workspace').append(copy);
    copy.center();
    $('#menu_overlay .close').click();
});

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
        $('.scripts_workspace').append(this);
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
      $(this).parent().append($(callback.drag).closest('.wrapper'));
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
    socket.append(drag);
    drag.css({position: 'relative', top: 0, left: 0, border: ''});
});

$('.scripts_workspace .socket').live('dropend', function(event, callback) {
    // console.log('socket dropend');
    // $(callback.drag).css('border', '1px solid white');
});
