
window.DEBUG = false;
window.debug = function debug(){
    if (window.DEBUG){
        console.log.apply(console, arguments);
    }
}

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
        if (!this.data('_id')){
            this.data('_id', _id);
            if (this.data('script') && this.data('script').indexOf('##') > -1){
                this.data('script', this.data('script').replace(/##/gm, '_' + _id));
                this.data('label', this.data('label').replace(/##/gm, '_' + _id));
                this.find('> .block > .blockhead > .label').html(Label(this.data('label')));
            }
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
    return this.find('> .block > .blockhead .locals .wrapper');
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
        var patt = new RegExp('##','gm');
        
        var desc = {
            klass: this.data('klass'),
            label: this.data('label').replace(/##/gm, '_' + this.id()),
            script: this.data('script').replace(/##/gm, '_' + this.id()),
            subContainerLabels: this.data('subContainerLabels'),
            containers: this.data('containers')
        };
        // FIXME: Move specific type handling to raphael_demo.js
        if (this.is('.trigger')){desc.trigger = true;}
        if (this.is('.value')){desc['type'] = this.data('type')};
        if (this.data('locals')){
            var self = this;
            desc.locals = this.data('locals');
            desc.locals.forEach(function(local){
                local.script = local.script.replace(/##/g, '_' + self.id());
                local.label = local.label.replace(/##/g, '_' + self.id());
            });
        }
        if (this.data('returns')){ 
            desc.returns = this.data('returns');
            desc.returns.script = desc.returns.script.replace(/##/g, '_' + this.id());
            desc.returns.label = desc.returns.label.replace(/##/g, '_' + this.id());
        }
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
//        opts.slot = false; // can't have both slot and trigger -- really? they do in the Glossary.
    }
    if (opts['type']){
        opts.slot = false; // values nest, but do not follow
        opts.flap = false;
    }
    // console.log('wrapping "%s" with label, non-id path', opts.label);
    var wrapper = $('<span class="wrapper ' + opts.klass + '"><span class="block"><span class="blockhead"><span class="label">' + Label(opts.label) + '</span></span></span></span>');
    if (scope){
        wrapper.data('scope', scope);
    }
    wrapper.data('label', opts.label);
    wrapper.data('klass', opts.klass);
    wrapper.data('returns', opts.returns);
    wrapper.data('script', opts.script);
    wrapper.data('locals', opts.locals);
    wrapper.data('type', opts['type']);
    wrapper.data('containers', opts.containers);
    if(opts.containers > 1){
        wrapper.data('subContainerLabels', opts['subContainerLabels']);
    }
    var block = wrapper.children();
    block.find('.socket').addSocketHelp();
    if (opts['help']){
        block.attr('title', opts['help']);
    }
    if (opts['type']){
        block.addClass(opts['type']);
        wrapper.addClass('value').addClass(opts['type']);
    }
    if (opts.locals.length){
        $.each(opts.locals, function(idx, value){
            if ($.isPlainObject(value)){
                value.klass = opts.klass;
                wrapper.addLocalBlock(Block(value, wrapper));
            }
        });
        wrapper.bind('add_to_script, add_to_workspace', function(e){
            var self = $(e.target),
                locals = self.data('locals');
            if (!(locals && locals.length)) return false;
            if (! self.id()){
                Block.nextId++;
                self.id(Block.nextId);
                self.local_blocks().each(function(idx, local){
                    $(local).id(Block.nextId); 
                });
            }
            return false;
        });
    }
    if (opts.returns){
        opts.returns.klass = opts.klass;
        wrapper.bind('add_to_script', function(e){
            // remove from DOM if already place elsewhere
            var self = $(e.target),
                returns = self.data('returns');
            if (!returns) return false;
            if (self.data('returnBlock')){
                // console.log('return block exists');
                self.data('returnBlock').detach();
            }else{
                // console.log('return block created: %s', returns.label);
                self.data('returnBlock', Block(returns));
            }
            var returnBlock = self.data('returnBlock');
            if (! self.id()){
                Block.nextId++;
                self.id(Block.nextId);
                returnBlock.id(Block.nextId);
            }
            self.parent_block().addLocalBlock(returnBlock);
            //self.child_blocks().each(function(block){ block.trigger('add_to_script'); });
            self.next_block().trigger('add_to_script');
            return false;
        });
        wrapper.bind('delete_block add_to_workspace', function(e){
            // FIXME: We should delete returnBlock on delete_block to avoid leaking memory
            var self = $(e.target),
                returnBlock = self.data('returnBlock');
            if (returnBlock){
                returnBlock.detach();
            }
            self.next_block().trigger('delete_block');
        });
    }
    if(opts.containers > 0){
        wrapper.addClass('containerBlock'); //This might not be necessary
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
    
    if (opts.slot){
        wrapper.append('<span class="next"><i class="slot"></i></span>');
    }
    if (opts.sockets){
        debug('sockets: %o', opts.sockets);
        $.each(opts.sockets, function(idx, value){
            debug('trying to add a value to a socket');
            if ($.isPlainObject(value)){
                debug('value is plain object');
                var child = Block(value);
                debug('new value block: %o', child);
                debug('sockets found: %s', block.find('> .blockhead > .label > .socket').eq(idx).length);
                block.find('> .blockhead > .label > .socket').eq(idx).empty().append(child);
            }else{ // presumably a string
                debug('value is %s of type %s', value, typeof value);
                var socket = block.find('> .blockhead > .label > .socket, > .blockhead > .label > .autosocket').eq(idx).find(':input, select');
                debug('sockets found: %s', socket.length);
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
                child.css({position: 'relative', top: 0, left: 0, display: 'inline-block'});
                child.trigger('add_to_script');
            }
        });
    }
    if (opts.next){
        if ($.isPlainObject(opts.next)){
            var child = Block(opts.next);
            wrapper.find('> .next').append(child);
            child.css({position: 'relative', top: 0, left: 0, display: 'inline-block'});
            child.trigger('add_to_script');
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
    return '<span class="value string ' + listname + ' autosocket" data-type="  "><select>' + 
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
    value = value.replace(/\[boolean:(true|false)\]/gm, '<span class="value boolean socket" data-type="boolean"><select><option>true</option><option selected>false</option></select></span>');
    value = value.replace(/\[boolean\]/gm, '<span class="value boolean socket" data-type="boolean"><select><option>true</option><option>false</option></select></span>');
    value = value.replace(/(?:\[choice\:)(\w+)(?:\:)(\w+)(?:\])/gm, choice_func);
    value = value.replace(/(?:\[choice\:)(\w+)(?:\])/gm, choice_func);
    // match selector [^\[\]] should match any character except '[', ']', and ':'
    value = value.replace(/\[([^\[\]\:]+):([^\[\]]+)\]/gm, '<span class="value $1 socket" data-type="$1"><input type="$1" value="$2"></span>');
    value = value.replace(/\[([^\[\]:]+)\]/gm, '<span class="value $1 socket" data-type="$1"><input type="$1"></span>');
    value = value.replace(/##/gm, '');
    return value;
}


