var userAgent = navigator.userAgent.toLowerCase();
var isiPhone = (userAgent.indexOf('iphone') != -1 || userAgent.indexOf('ipod') != -1) ? true : false;
clickEvent = isiPhone ? 'tap' : 'click';

$.selectedBlock = function(){
    return $('.scripts_workspace .selected');
};

$.extend($.fn,{
  long_name: function() {
    var names;
    names = [];
    this.dom.forEach(function(e) {
      var parts = [e.tagName.toLowerCase()];
      e.id ? parts.push('#' + e.id) : null;
      e.className ? parts.push('.' + e.className.split(/\s/).join('.')) : null;
      return names.push(parts.join(''));
    });
    return '[' + names.join(', ') + ']';
  },
  info: function(){
      return this.closest('.wrapper').long_name();
  },
  center: function() {
    return this.dom.forEach(function(elem) {
      var dx, dy, p, ph, pw, t;
      t = $(elem);
      dx = t.width() / 2;
      dy = t.height() / 2;
      p = $(elem.offsetParent);
      pw = p.width() / 2;
      ph = p.height() / 2;
      return t.css({
        position: 'absolute',
        left: pw - dx + 'px',
        top: ph - dy + 'px'
      });
    });
  },
  blockType: function(){
      console.log('block type of %o', this.dom[0]);
      if (this.is('.trigger')) return 'trigger';
      if (this.is('.step')) return 'step';
      if (this.is('.number')) return 'number';
      if (this.is('.boolean')) return 'boolean';
      if (this.is('.string')) return 'string';
      console.log('unknown value for block: %o', this);
      return 'unknown';
  },
  parentBlock: function(){
      var p = this.closest('.wrapper').parent();
      if (p.is('.next')){
          return p.closest('.wrapper');
      }
      return null;
  },
  nextNiche: function(){
      return this.children('.next');
  },
  nextBlock: function(){
      return this.nextNiche().children('.wrapper');
  },
  containerNiches: function(){
      return this.children('.block').children('.contained');
  },
  stepNiches: function(){
      var cn = this.containerNiches();
      var nn = this.nextNiche();
      if (nn.dom.length){
          cn.dom.push(nn.get(0));
      }
      return cn;
  },
  socketNiches: function(ntype){
      return this.children('block').children('p').find('.socket.' + ntype);
  },
  selectBlock: function(){
    $('.scripts_workspace .selected').removeClass('selected');
    return this.addClass('selected');
  },
  unselectBlock: function(){
      return this.removeClass('selected');
  },
  moveTo: function(x,y){
      return this.css({left: x + 'px', top: y + 'px'});
  },
  niches: function(ntype){
      // return an ordered list of open niches
      // types are step (tab or container), and socket types number, boolean, string 
      if (ntype === 'step'){
          return this.stepNiches().noChildren();
      }else{
          return this.socketNiches(ntype).noChildren();
      }
  },
  appendToBlock: function(block){
      // if this block has an open slot, and the block being appended also has an open slot, put it in the first available slot
      // if the block being appended is already a child of this block, and there is another available slot, move to the next available slot
      // if the block being appended is the wrong type, return false
      console.log('appendToBlock');
      var type = block.blockType();
      // FIXME: Make sure we cannot add a parent to a child
      if (type == 'trigger'){
          console.log('cannot add a trigger to another block');
          return false;
      }
      var niches = this.niches(type);
      if (!niches.dom.length){
          console.log('no open niches of type %s', type);
          return false;
      }
      if (this == block.parentBlock){
          console.log('move to the next available niche');
          return true;
      }else{
          console.log('append to block');
          niches.first()._append(block);
          block.css({
              position: 'relative',
              left: 0 + 'px',
              top: 0 + 'px'
          });
          return true;
      }
  },
  noChildren: function(){
      this.dom.filter(function(elem){
          return $(elem).children('.wrapper').dom.length < 1;
      });
      return this;
  }
});

function button(options){
    return $.h('<button>' + options.button + '</button>');
}

function block(options){
    if (options.button){
        return button(options);
    }
    var opts = {
        klass: 'control',
        tab: true, // Something can come after
        trigger: false, // This is the start of a handler
        slot: true, // something can come before
        containers: 0,  // Something cannot be inside
        label: 'Step', // label is its own mini-language
        type: null
    };
    $.extend(opts, options);
    if (opts.trigger){
        opts.slot = false; // can't have both slot and trigger
    }
    if (opts['type']){
        opts.tab = false; // values nest, but do not follow
        opts.slot = false;
    }
    var wrapper = $.h('<div class="wrapper ' + opts.klass + '"><div class="block"><p><label>' + label(opts.label) + '</label></p></div></div>');
    var block = wrapper.children();
    if (opts['type']){
        block.addClass(opts['type'].name.toLowerCase());
        wrapper.addClass('value').addClass(opts['type'].name.toLowerCase());
    }
    if (opts.trigger){
        wrapper.addClass('trigger');
        block.append('<b class="trigger"></b>');
    }else if(opts.slot){
        block.append('<b class="slot"></b>');
        wrapper.addClass('step');
    }
    for (var i = 0; i < opts.containers; i++){
        block.append('</b><div class="contained"><i class="tab"></i></div>');
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

$('.submenu .wrapper').live(clickEvent, function(elem, event) {
    var copy = $(elem.cloneNode(true));
    $('.scripts_workspace')._append(copy);
    copy.center();
    copy.selectBlock();
});

$('.scripts_workspace').live(clickEvent, function(elem, event){
    if (event.srcElement !== elem){
        var selected = $('.scripts_workspace .selected');
        if (!selected.dom.length) return;
        var wrapper = $(event.srcElement).closest('.wrapper');
        if (!wrapper.dom.length) return;
        if (!wrapper.is('.scripts_workspace .wrapper')) return;
        if (wrapper.dom[0] == selected.dom[0]) return;
        wrapper.appendToBlock(selected);
        return;
    }
    $.selectedBlock().moveTo(event.offsetX, event.offsetY);
});

$('.scripts_workspace .wrapper').live(clickEvent, function(elem, event){
    var self = $(elem);
    if (self.is('.selected')){
        self.unselectBlock();
    }else{
        self.selectBlock();
    }
    event.stopPropagation();
});

$('body').live('keypress', function(event){
    // charCode 8 is delete
    switch(event.charCode){
        case 8: // delete key pressed
            var selected = $('.scripts_workspace .wrapper.selected');
            if (selected.length){
                var next = selected.find('.next > .wrapper');
                if (next.length){
                    var deletep = confirm('Delete selected block and its contents?');
                    if (deletep){
                        selected.remove();
                    }
                }else{
                    selected.remove();
                }
            }
            break;
        default:
            console.log('keypress: %s', event.charCode);
            break;
    }
});

$('.scripts_workspace input[type=text]').live('keypress', function(event){
    console.log('caught a keypress in a textfield');
    event.stopPropagation();
});
