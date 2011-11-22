


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
      // FIXME: Move all type-specific functionality to plugins
      if (this.is('.trigger')) return 'trigger';
      if (this.is('.step')) return 'step';
      
      var classes = this.attr('class');
      if(classes){
	  classes = classes.replace("socket","").replace("wrapper","")
	  classes = classes.replace("drag_indication","").replace("value","")
	  classes = classes.replace("  "," ").trim();
	  //Please let me know if there is a better way to do this. I first thought of array_intersection, 
	  //but since vartypes has a bunch of other stuff, i couldn't figure how to get it to work.
	  var clas;
	  $.each(classes.split(" "), function(){
	      if(vartypes[this]){
		  clas = this;
		  return;
	      }  
	  });
	  if(clas){
	      return clas;
	  }
      }
      return 'unknown';
  },
  parent_block: function(){
      var p = this.closest('.wrapper').parent();
      if (p.is('.next')){
          return p.closest('.wrapper');
      }
      return null;
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
  next_block: function(){
      return this.find('> .next > .wrapper');
  },
  moveTo: function(x,y){
      return this.css({left: x + 'px', top: y + 'px'});
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
            containers: this.data('containers')
        };
        // FIXME: Move specific type handling to raphael_demo.js
	type = this.block_type();
	if(type == 'trigger')
	    desc.trigger = true;
	else
	    desc['type'] = this.block_type();
	
        desc.sockets = this.socket_blocks().map(function(){return $(this).block_description();}).get();
        desc.contained = this.child_blocks().map(function(){return $(this).block_description();}).get();
        desc.next = this.next_block().block_description();
        return desc;
    }
});

function Block(options){
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
        label: 'Step', // label is its own mini-language
        type: null
    };
    $.extend(opts, options);
    if (opts.trigger){
        opts.flap = false; // can't have both flap and trigger
    }
    if (opts['type'] && opts['type']!='step'){
        opts.slot = false; // values nest, but do not follow
        opts.flap = false;
    }
    var wrapper = $('<span class="wrapper ' + opts.klass + '"><span class="block"><span class="blockhead"><span class="label">' + Label(opts.label) + '</span></span></span></span>');
    wrapper.data('label', opts.label);
    wrapper.data('klass', opts.klass);
    var block = wrapper.children();
    block.find('.socket').addSocketHelp();
    if (opts['help']){
        block.attr('title', opts['help']);
    }
    if (opts['type'] && opts['type']!='step'){
        block.addClass(opts['type']);
        wrapper.addClass('value').addClass(opts['type']);
    }
    if (opts.trigger){
        wrapper.addClass('trigger');
        block.append('<b class="trigger"></b>');
    }else if(opts.flap){
        block.append('<b class="flap"></b>');
        wrapper.addClass('step');
    }
    for (var i = 0; i < opts.containers; i++){
        block.append('</b><span class="contained"><i class="slot"></i></span>');
    }
    if (opts.containers){
        block.find('> .blockhead > .label').prepend('<span class="disclosure open">▼</span>');
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

$('.scripts_workspace').delegate('.disclosure', 'click', function(event){
    var self = $(event.target);
    if (self.is('.open')){
        self.text('►').closest('.block').find('> .contained').hide();
    }else{
        self.text('▼').closest('.block').find('> .contained').show();
    }
    self.toggleClass('open closed');
});

        
function choice_func(s, listname, default_opt){
    var list = choice_lists[listname];
    return '<span class="string ' + listname + ' autosocket"><select>' + 
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
    
    // FIXME: Move specific type handling to raphael_demo.js
    
    value = value.replace(/\[boolean:(true|false)\]/g, '<span class="boolean socket"><select><option>true</option><option selected>false</option></select></span>');
    value = value.replace(/\[boolean\]/g, '<span class="boolean socket"><select><option>true</option><option>false</option></select></span>');
    /*
    value = value.replace(/\[number:(-?\d*\.?\d+)\]/g, '<span class="number socket"><input type="number" value="$1"></span>');
    value = value.replace(/\[number\]/g, '<span class="number socket"><input type="number"></span>');
    value = value.replace(/\[float:(-?\d*\.?\d+)\]/g, '<span class="float socket"><input type="number" value="$1"></span>');
    value = value.replace(/\[float\]/g, '<span class="float socket"><input type="number"></span>');
    value = value.replace(/\[int:(-?\d*)\]/g, '<span class="int socket"><input type="number" value="$1"></span>');
    value = value.replace(/\[int\]/g, '<span class="int socket"><input type="number"></span>');
    value = value.replace(/\[string:(.+?)\]/g, '<span class="string socket"><input value="$1"></span>');
    value = value.replace(/\[string\]/g, '<span class="string socket"><input></span>');
    value = value.replace(/\[array:(.+?)\]/g, '<span class="array socket"><input value="$1"></span>');
    value = value.replace(/\[array\]/g, '<span class="array socket"><input></span>');
    value = value.replace(/\[object:(.+?)\]/g, '<span class="object socket"><input value="$1"></span>');
    value = value.replace(/\[object\]/g, '<span class="object socket"><input></span>');
    value = value.replace(/\[function:(.+?)\]/g, '<span class="function socket"><input value="$1"></span>');
    value = value.replace(/\[function]/g, '<span class="function socket"><input></span>');
    value = value.replace(/\[any:(.+?)\]/g, '<span class="any socket"><input value="$1"></span>');
    value = value.replace(/\[any\]/g, '<span class="any socket"><input></span>');
    */
   
   value = value.replace(/\[color\]/g, '<span class="color socket"><input type="color"></span>');
    value = value.replace(/\[color:(#[01234567890ABCDEF]{6})\]/g, '<span class="color socket"><input type="color" value="$1" style="color:$1;background-color:$1;"></span>');
    value = value.replace(/(?:\[choice\:)(\w+)(?:\:)(\w+)(?:\])/g, choice_func);
    value = value.replace(/(?:\[choice\:)(\w+)(?:\])/g, choice_func);
   
   value = value.replace(/\[([a-zA-Z]*)\]$/g,  function(a, type){

	// a is the whole string    [int]
	// type is the first match   int
	data = vartypes[type];
	
	if(data.defaulthtml)
	    defaulthtml = data.defaulthtml; //Options here could be expanded upon
	else{
	    classes = data.htmltype;
	    if(!classes || classes=="string"){ //default to text
		classes = '\"text\"';
	    }
	    defaulthtml = '<span class="'+type+' socket" title="'+type+'"><input  type="'+classes+'" /></span>';
	}
	return defaulthtml;
    });
   //A lot of this code is copy/pasted Is there a better way?
    value = value.replace(/\[([a-zA-Z]*)\:(.*?)\]/g,    function(a, type, val){
	//console.log(" a "+a+" b "+b+" c "+c+" d "+d+" e "+e+" f "+f+" g "+g);
	// a is the whole string [int:10]
	// type is the first match  int
	// val is the second match 10
	// d is string that comes after
	
	data = vartypes[type];
	if(data.defaulthtml){
	    defaulthtml = data.defaulthtml; //Options here could be expanded upon
	}
	else{
	    classes = data.htmltype;
	    if(!classes || classes=="string"){ //default to text
		classes = '\"text\"';	
	    }
	    inputtype = 'type="'+classes+'"';
	    defaulthtml = '<span class="'+type+' socket" title="'+type+'"><input value="'+val+'" '+inputtype+' /></span>';
	}
	return defaulthtml;
    });
   
   
    
    return value;
}

