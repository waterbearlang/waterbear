$.selected_block = function(){
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
  block_type: function(){
      if (this.is('.trigger')) return 'trigger';
      if (this.is('.step')) return 'step';
      if (this.is('.number')) return 'number';
      if (this.is('.boolean')) return 'boolean';
      if (this.is('.string')) return 'string';
      return 'unknown';
  },
  extract_script: function(){
      if (this.length === 0) return '';
      if (this.is(':input')) return this.val();
      if (this.is('.empty')) return '// do nothing';
      var script = this.data('script');
      if (!script) return null;
      var exprs = $.map(this.socket_blocks(), function(elem, idx){return $(elem).extract_script();});
      var blks = $.map(this.child_blocks(), function(elem, idx){return $(elem).extract_script();});
      if (exprs.length){
          // console.log('expressions: %o', exprs);
          function exprf(match, offset, s){
              var idx = parseInt(match.slice(2,-2), 10) - 1;
              // console.log('index: %d, expression: %s', idx, exprs[idx]);
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
      next = this.next_block().extract_script();
      if (script.indexOf('[[next]]') > -1){
          script = script.replace('[[next]]', next);
      }else{
          script = script + '\n' + next;
      }
      return script;
  },
  wrap_script: function(){
      // wrap the top-level script to prevent leaking into globals
      var script = this.map(function(){return $(this).extract_script();}).get().join('\n\n');
      return 'var global = new Global();(function($){\nvar local = new Local();\n' + script + '\n})(jQuery);';
  },
  write_script: function(view){
      view.html('<code><pre class="script_view">' + this.wrap_script() +  '</pre></code>');
  },
  parent_block: function(){
      var p = this.closest('.wrapper').parent();
      if (p.is('.next')){
          return p.closest('.wrapper');
      }
      return null;
  },
  child_blocks: function(){
      var empty = this.find('> .block > .contained:not(:has(.wrapper))').map(function(){
          return $('<span class="empty"></span>');
      });
      return this.find('> .block > .contained > .wrapper').add(empty);
  },
  socket_blocks: function(){
      return this.find('> .block > p > label > .socket > .wrapper, > .block > p > label > .socket > input, > .block > p > label > .autosocket > select');
  },
  next_block: function(){
      return this.find('> .next > .wrapper');
  },
  moveTo: function(x,y){
      return this.css({left: x + 'px', top: y + 'px'});
  }
});

function button(options){
    return $('<button>' + options.button + '</button>');
}

$.fn.extend({
    block_description: function(){
        var desc = {
            klass: this.data('klass'),
            label: this.data('label'),
            script: this.data('script'),
            containers: this.data('containers')
        };
        if (this.parent().is('.scripts_workspace')){ desc.offset = this.offset(); }
        if (this.is('.trigger')){ desc.trigger = true; }
        if (this.is('number')){ desc['type'] = Number; }
        if (this.is('string')){ desc['type'] = String; }
        if (this.is('boolean')){ desc['type'] = Boolean; }
        return desc;
    }
    
});

function block(options){
    // Options include:
    //
    // Menu blocks subset:
    //
    // label: required (yes, there are required options, deal with it)
    // klass: [control] (for styling)
    // trigger: [false] (is this a trigger?)
    // containers: [0] (how many sub-scripts does this hold?)
    // slot: [true] (can scripts follow this block in sequence?)
    // type: String, Number, or Boolean if this is a value block
    // 
    // Script block additions:
    // 
    // position [0,0] (root blocks only)
    // sockets: array of values or value blocks
    // contained: array of contained blocks
    // next: block that follows this block
    if (options.button){
        return button(options);
    }
    var opts = {
        klass: 'control',
        slot: true, // Something can come after
        trigger: false, // This is the start of a handler
        flap: true, // something can come before
        containers: 0,  // Something cannot be inside
        label: 'Step', // label is its own mini-language
        type: null
    };
    $.extend(opts, options);
    if (opts.trigger){
        opts.flap = false; // can't have both flap and trigger
    }
    if (opts['type']){
        opts.slot = false; // values nest, but do not follow
        opts.flap = false;
    }
    var wrapper = $('<div class="wrapper ' + opts.klass + '"><div class="block"><p><label>' + label(opts.label) + '</label></p></div></div>');
    wrapper.data('label', opts.label);
    var block = wrapper.children();
    if (opts['type']){
        block.addClass(opts['type'].name.toLowerCase());
        wrapper.addClass('value').addClass(opts['type'].name.toLowerCase());
    }
    if (opts.trigger){
        wrapper.addClass('trigger');
        block.append('<b class="trigger"></b>');
    }else if(opts.flap){
        block.append('<b class="flap"></b>');
        wrapper.addClass('step');
    }
    for (var i = 0; i < opts.containers; i++){
        block.append('</b><div class="contained"><i class="slot"></i></div>');
    }
    wrapper.data('containers', opts.containers);
    if (opts.slot){
        wrapper.append('<div class="next"><i class="slot"></i></div>');
    }
    if (opts.script){
        wrapper.data('script', opts.script);
    }
    // add update handlers
    return wrapper;
}

var keys_supported = 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'.split('').concat(['up', 'down', 'left', 'right',
    'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt', 'pause', 'capslock', 'esc', 'space',
    'pageup', 'pagedown', 'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']); 

var keys_input = '<div class="string keys autosocket"><select>' + 
        keys_supported.map(function(letter){return '<option>' + letter + '</option>';}).join('') + '</select></div>';
    
function label(value){
    // Recognize special values in the label string and replace them with 
    // appropriate markup. Some values are dynamic and based on the objects currently
    // in the environment
    //
    // values include:
    //
    // [flag] => the start flag image (no longer relevant)
    // [key] => any valid key on the keyboard
    // [sprite] => any currently defined sprite (not currently supported)
    // [number] => an empty number socket
    // [number:default] => a number socket with a default value
    // [boolean] => an empty boolean socket
    // [boolean:default] => a boolean with a default value
    // [string] => an empty string socket
    // [string:default] => a string socket with a default value
    // [message] => a message combo box
    // [shape] => a stored shape reference
    // [stop] => stop sign graphic  /\[number:(-?\d*\.\d+)\]/ (not currently used)
    value = value.replace(/\[number:(-?\d*\.?\d+)\]/g, '<div class="number socket"><input value="$1"></div>');
    value = value.replace(/\[number\]/g, '<div class="number socket"><input></div>');
    value = value.replace(/\[boolean\]/g, '<div class="boolean socket"><select><option>true</option><option>false</option></select></div>');
    value = value.replace(/\[string:(.+?)\]/g, '<div class="string socket"><input value="$1"></div>');
    value = value.replace(/\[string\]/g, '<div class="string socket"><input></div>');
    value = value.replace(/\[key\]/g, keys_input);
    return value;
}

