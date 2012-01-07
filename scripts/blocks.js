


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
  id: function(_id){
    if (_id){
        this.data('_id', _id);
        if (this.data('script').indexOf('##') > -1){
            this.data('script', this.data('script').replace('##', '_' + _id));
            this.data('label', this.data('label').replace('##', '_' + _id));
            this.find('> .block > .blockhead > .label').html('<span class="label">' + Label(this.data('label')) + '</span>');
        }
    }else{
        return this.data('_id');
    }
  },
  info: function(){
      return this.closest('.wrapper').long_name();
  },
  block_type: function(){
      return this.data('type');
  },
  parent_block: function(){
      var p = this.closest('.wrapper').parent();
      return p.closest('.contained').closest('.wrapper');
  },
  child_blocks: function(){
      return this.find('> .block > .contained').map(function(){
          var kids = $(this).children('.wrapper');
          if (kids.length){
              return kids;
          }else{
              return $('<span class="empty"></span>');
          }
      });
  },
  socket_blocks: function(){
      return this.find('> .block > .blockhead > .label').children('.socket, .autosocket').children('input, select, .wrapper');
  },
  local_blocks: function(){
    return this.find('> .block > .locals > .wrapper');
  },
  next_block: function(){
      return this.find('> .next > .wrapper');
  },
  moveTo: function(x,y){
      return this.css({left: x + 'px', top: y + 'px'});
  },
  addLocalBlock: function(block){
    window.parent_block = this;
    var head = this.find('> .block > .blockhead');
    var locals = head.find('.locals');
    if (!locals.length){
        locals = $('<div class="locals block_menu"></div>');
        head.find('.label').after(locals);
    }
    locals.append(block);
    return this;
  },
  addSocketHelp: function(){
    var self = $(this);
    var type = self.block_type();
    var desc = 'this is a ' + type + ' socket. You can type in a value or drag in a matching value block';
    if(type === 'any'){
        desc = 'this is a socket that can take any type. Strings must be quoted.';
    }
    $(this).attr('title', desc);
  }
});

$.fn.extend({
    block_description: function(){
        if (this.length < 1) return '';
        if (this.is('.empty')) return '';
        if (this.is(':input')){
            return this.val();
        }
        var desc = {
            klass: this.data('klass'),
            label: this.data('label'),
            script: this.data('script'),
            subContainerLabels: this.data('subContainerLabels'),
            containers: this.data('containers')
        };
        // FIXME: Move specific type handling to raphael_demo.js
        if (this.is('.trigger')){desc.trigger = true;}
        if (this.is('.value')){desc['type'] = this.data('type')};
        desc.sockets = this.socket_blocks().map(function(){return $(this).block_description();}).get();
        desc.contained = this.child_blocks().map(function(){return $(this).block_description();}).get();
        desc.next = this.next_block().block_description();
        return desc;
    }
});

function Block(options, scope){
    // Options include:
    //
    // Menu blocks subset:
    //
    // label: required (yes, there are required options, deal with it)
    // klass: [control] (for styling)
    // trigger: [false] (is this a trigger?)
    // containers: [0] (how many sub-scripts does this hold?)
    // slot: [true] (can scripts follow this block in sequence?)
    // type: string, number, color, or boolean if this is a value block
    // 
    // Script block additions:
    // 
    // sockets: array of values or value blocks
    // contained: array of contained blocks
    // next: block that follows this block
    var opts = {
        klass: 'control',
        slot: true, // Something can come after
        trigger: false, // This is the start of a handler
        flap: true, // something can come before
        containers: 0,  // Something cannot be inside
        locals: [],
        returns: false,
        subContainerLabels: [],
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
    var wrapper = $('<span class="wrapper ' + opts.klass + '"><span class="block"><span class="blockhead"><span class="label">' + Label(opts.label) + '</span></span></span></span>');
    if (scope){
        wrapper.data('scope', scope);
    }
    wrapper.data('label', opts.label);
    wrapper.data('klass', opts.klass);
    var block = wrapper.children();
    block.find('.socket').addSocketHelp();
    if (opts['help']){
        block.attr('title', opts['help']);
    }
    if (opts['type']){
        block.addClass(opts['type']);
        wrapper.addClass('value').addClass(opts['type']);
        wrapper.data('type', opts['type']);
    }
    if (opts.locals.length){
        $.each(opts.locals, function(idx, value){
            if ($.isPlainObject(value)){
                value.klass = opts.klass;
                wrapper.addLocalBlock(Block(value, wrapper));
            }
        });
    }
    if (opts.returns){
        opts.returns.klass = opts.klass;
        wrapper.bind('add_to_script', function(e){
            // remove from DOM if already place elsewhere
            var self = $(e.target);
            if (self.data('returnBlock')){
                self.data('returnBlock').detach();
            }else{
                self.data('returnBlock', Block(opts.returns));
            }
            var returnBlock = self.data('returnBlock');
            if (! self.id()){
                Block.nextId++;
                self.id(Block.nextId);
                returnBlock.id(Block.nextId);
            }
            console.log('return block: %o', returnBlock);
            console.log('parent block: %o', self.parent_block());
            self.parent_block().addLocalBlock(returnBlock);
        });
        wrapper.bind('delete_block add_to_workspace', function(e){
            // FIXME: We should delete returnBlock on delete_block to avoid leaking memory
            returnBlock.detach();
        });
    }
    if(opts.containers > 0){
        wrapper.addClass('containerBlock'); //This might not be necessary
    }
    if(opts.containers > 1){
        wrapper.data('subContainerLabels', opts['subContainerLabels']);
    }
    for(i=0; i<opts.containers; i++){
        ContainerLabel='';
        if(opts.containers > 1){
            if(i != (opts.containers-1)){
                ContainerLabel='<span class="blockhead"><span class="label">'+Label(wrapper.data('subContainerLabels')[i])+'</span></span>';
            }
        }
        block.append('</b><span class="contained"><i class="slot"></i></span>'+ContainerLabel);
    }
    if (opts.containers){
        block.find('> .blockhead > .label').prepend('<span class="disclosure open">▼</span>');
    }
    if (opts.trigger){
        wrapper.addClass('trigger');
        wrapper.data('type', 'trigger');
        block.append('<b class="trigger"></b>');
    }else if(opts.flap){
        block.append('<b class="flap"></b>');
        wrapper.addClass('step');
        wrapper.data('type', 'step');
    }
    
    wrapper.data('containers', opts.containers);
    if (opts.slot){
        wrapper.append('<span class="next"><i class="slot"></i></span>');
    }
    if (opts.script){
        wrapper.data('script', opts.script);
    }
    if (opts.sockets){
        $.each(opts.sockets, function(idx, value){
            if ($.isPlainObject(value)){
                var child = Block(value);
                block.find('> .blockhead > .label > .socket').eq(idx).empty().append(child);
            }else{ // presumably a string
                var socket = block.find('> .blockhead > .label > .socket :input, > .blockhead > .label > .autosocket select').eq(idx);
                socket.val(value);
                if (socket.attr('type') === 'color'){
                    socket.css({color: value, 'background-color': value});
                }
            }
        });
    }
    if (opts.contained){
        $.each(opts.contained, function(idx, value){
            if ($.isPlainObject(value)){
                var child = Block(value);
                block.find('> .contained').eq(idx).append(child);
            }
        });
    }
    if (opts.next){
        if ($.isPlainObject(opts.next)){
            var child = Block(opts.next);
            wrapper.find('> .next').append(child);
        }
    }
    // add update handlers
    return wrapper;
}
Block.nextId = 0;

$('.scripts_workspace').delegate('.disclosure', 'click', function(event){
    var self = $(event.target);
    if (self.is('.open')){
        self.text('►');
        getContained(self).css('padding-bottom',0).children().hide();
    }else{
        self.text('▼');
        getContained(self).css('padding-bottom',10).children().show();
    }
    self.toggleClass('open closed');
});
function getContained(s){
    if(s.closest('.blockhead').next().is('.contained'))
        return s.closest('.blockhead').next('.contained');
    return s.closest('.blockhead').next().next();
}

function choice_func(s, listname, default_opt){
    var list = choice_lists[listname];
    return '<span class="value string ' + listname + ' autosocket" data-type="string"><select>' + 
        list.map(function(item){
            if (item === default_opt){
                return '<option selected>' + item + '</option>';
            }else{
                return '<option>' + item + '</option>';
            }
        }).join('') +
        '</select></span>';
}
            
function Label(value){
    // Recognize special values in the label string and replace them with 
    // appropriate markup. Some values are dynamic and based on the objects currently
    // in the environment
    //
    // values include:
    //
    // [number] => an empty number socket
    // [number:default] => a number socket with a default value
    // [boolean] => an empty boolean socket
    // [boolean:default] => a boolean with a default value
    // [string] => an empty string socket
    // [string:default] => a string socket with a default value
    // [choice:options] => a fixed set of options, listed in options parameter function
    // etc…
    
    // FIXME: Move specific type handling to raphael_demo.js
    value = value.replace(/\[boolean:(true|false)\]/g, '<span class="value boolean socket" data-type="boolean"><select><option>true</option><option selected>false</option></select></span>');
    value = value.replace(/\[boolean\]/g, '<span class="value boolean socket" data-type="boolean"><select><option>true</option><option>false</option></select></span>');
    value = value.replace(/(?:\[choice\:)(\w+)(?:\:)(\w+)(?:\])/g, choice_func);
    value = value.replace(/(?:\[choice\:)(\w+)(?:\])/g, choice_func);
    // match selector [^\[\]:] should match any character except '[', ']', and ':'
    value = value.replace(/\[([^\[\]\:]+):([^\[\]:]+)\]/g, '<span class="value $1 socket" data-type="$1"><input type="$1" value="$2"></span>');
    value = value.replace(/\[([^\[\]:]+)\]/g, '<span class="value $1 socket" data-type="$1"><input type="$1"></span>');
    value = value.replace('##', '');
    return value;
}


