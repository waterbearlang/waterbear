$.selectedBlock = function(){
    return $('.scripts_workspace .selected');
};

$.extend($.fn,{
  long_name: function() {
    var names;
    names = [];
    this.each(function(idx,e) {
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
    return this.each(function(elem) {
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
  block_type: function(){
      if (this.is('.trigger')) return 'trigger';
      if (this.is('.step')) return 'step';
      if (this.is('.number')) return 'number';
      if (this.is('.boolean')) return 'boolean';
      if (this.is('.string')) return 'string';
      return 'unknown';
  },
  extract_script: function(){
      if (this.is('input')) return this.val();
      var script = this.data('script');
      if (!script) return null;
      var exprs = $.map(this.socketBlocks(), function(elem, idx){return $(elem).extract_script();});
      var blks = $.map(this.childBlocks(), function(elem, idx){return $(elem).extract_script();});
      if (exprs.length){
          function exprf(match, offset, s){
              var idx = parseInt(match.slice(2,-2), 10) - 1;
              return exprs[idx];
          };
          script = script.replace(/\{\{\d\}\}/g, exprf);
      }
      if (blks.length){
          function blksf(match, offset, s){
              var idx = parseInt(match.slice(2,-2), 10) - 1;
              return blks[idx];
          }
          script = script.replace(/\[\[\d\]\]/g, blksf);
      }
      next = this.nextBlock().extract_script();
      if (script.indexOf('[[next]]') > -1){
          script.replace('[[next]]', next);
      }else{
          script = script + '\n' + next;
      }
      return script;
  },
  write_script: function(view){
      view.append('<code><pre>' + this.extract_script() + '</pre></code>');
  },
  parentBlock: function(){
      var p = this.closest('.wrapper').parent();
      if (p.is('.next')){
          return p.closest('.wrapper');
      }
      return null;
  },
  childBlocks: function(){
      return this.find('> .block > .contained > .wrapper');
  },
  socketBlocks: function(){
      return this.find('> .block > p > label > .socket > .wrapper, > .block > p > label > .socket > input');
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
      if (nn.length){
          cn.push(nn.get(0));
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
      var type = block.block_type();
      // FIXME: Make sure we cannot add a parent to a child
      if (type == 'trigger'){
          console.log('cannot add a trigger to another block');
          return false;
      }
      var niches = this.niches(type);
      if (!niches.length){
          console.log('no open niches of type %s', type);
          return false;
      }
      if (this == block.parentBlock){
          console.log('move to the next available niche');
          return true;
      }else{
          console.log('append to block');
          niches.first().append(block);
          block.css({
              position: 'relative',
              left: 0 + 'px',
              top: 0 + 'px'
          });
          return true;
      }
  },
  noChildren: function(){
      this.filter(function(elem){
          return $(elem).children('.wrapper').length < 1;
      });
      return this;
  }
});

function button(options){
    return $('<button>' + options.button + '</button>');
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
    var wrapper = $('<div class="wrapper ' + opts.klass + '"><div class="block"><p><label>' + label(opts.label) + '</label></p></div></div>');
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
    if (opts.script){
        wrapper.data('script', opts.script);
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
    value = value.replace(/\[number:(-?\d*\.?\d+)\]/g, '<div class="number socket"><input value="$1"></div>');
    value = value.replace(/\[number\]/g, '<div class="number socket"><input></div>');
    value = value.replace(/\[boolean:(true|false)\]/g, '<div class="boolean socket"><input value="$1"></div>');
    value = value.replace(/\[boolean\]/g, '<div class="boolean socket"><input></div>');
    value = value.replace(/\[string:(.+)\]/g, '<div class="string socket"><input value="$1"></div>');
    value = value.replace(/\[string\]/g, '<div class="string socket"><input></div>');
    return value;
}

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
    event.stopPropagation();
});
