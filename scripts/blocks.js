
//
// Handler for the hide/show triangle on context and eventhandler blocks
//
$('.scripts_workspace').on('click', '.disclosure', function(event){
    var self = $(event.target);
    var view = self.closest('.wrapper');
    if (self.is('.open')){
        self.text('►');
        view.find('.locals').hide();
        view.find('.contained').hide();
    }else{
        self.text('▼');
        view.find('.locals').show();
        view.find('.contained').show();
    }
    self.toggleClass('open closed');
});
            
//
// Value objects get defaults depending on their type. These are the defaults for
// primitive values when the plugin does not over-ride the default.
//
var defaultValue = {
    'number': 0,
    'boolean': false,
    'string': '',
    'date': function(){ return new Date().toISOString().split('T')[0]; },
    'time': function(){ return new Date().toISOString().split('T')[1].split('.')[0] + 'Z'; },
    'datetime': function(){ return new Date().toISOString(); },
    'color': 'rgb(0,0,0)'
};

//
// Blocks which take parameters store those parameters as Value objects, which may hold primitive
// values such as numbers or strings, or may be Expression blocks. 
//
function Value(textValue, index){
    assert.isNumber(index, 'Values must know their place');
    this.index = index;
    if ($.isPlainObject(textValue)){
		print('initializing Value with object: %o', textValue);
        $.extend(this, textValue);
        if (textValue.value.signature){
            var block = Block(textValue.value);
            assert.isObject(block, 'Value blocks must be objects');
            this.addBlock(block);
        }else{
            this.literal = true;
        }
    }else{
		print('initializing Value with text: %o', textValue);
		assert(textValue.length > 0, 'textValue must contain text');
        var parts = textValue.slice(1,-1).split(':');
        this.type = parts[0];
        if (this.type === 'choice'){
            this.choiceName = parts[1];
            this.choiceList = choiceLists[this.choiceName];
            if (parts.length === 3){
                this.value = parts[2];
            }else{
                this.value = this.choiceList[0];
            }
        }else{
            if (parts.length === 1){
                this.value = defaultValue[this.type];
                if (this.value && this.value.apply){
                    this.value = this.value();
                }
            }else{
                this.value = parts[1];
                if (this.type.match(/number|float|double/)){
                    this.value = parseFloat(this.value);
                }else if (this.type.match(/int|long/)){
                    this.value = parseInt(this.value, 10);
                }else if (this.type.match(/boolean|bool/)){
                    this.value = !!(this.value === 'true');
                    this.choiceName = 'boolean';
                    this.choiceList = [true,false];
                }
            }
        }
        if (this.value !== undefined){
            this.defaultValue = this.value; // for when expressions are removed
            this.literal = true;
        }
    }
}

Value.prototype.code = function(){
	if (this.literal){
		return this.value;
	}else{
		return this.value.code();
	}
}

Value.prototype.addBlock = function(blockModel){
    this.literal = false;
    this.value = blockModel;
};

Value.prototype.removeBlock = function(blockModel){
    this.literal = true;
    this.value = this.defaultValue;
};

Value.prototype.view = function(){
	print('building view for %o, has cached view: %s', j(this), !!this._view);
    if (this._view) return this._view;
	print('we do not have a cached view');
    if (! this.literal && this.value){ return this.value.view(); }
	print('we do not have a block value');
    if (this.choiceName){
		print('return choice view');
        this._view =  this.choiceView(this.choiceName, this.choiceList);
    }else if (this.value !== undefined){
		print('return type/index/value %o/%o/%o', this.type, this.index, this.value);
        this._view = $('<span class="value ' + this.type + ' socket" data-type="' + this.type + '" data-index="' + this.index  + '"><input type="' + this.type + '" value="' + this.value + '"></span>');
    }else{
		print('return undefined value');
        this._view = $('<span class="value ' + this.type + ' socket" data-type="' + this.type + '" data-index="' + this.index + '"><input type="' + this.type + '"></span>');
    }
	print('return cached value: %o', h(this._view));
    return this._view;
};

Value.prototype.choiceView = function(){
    return $('<span class="value string ' + this.choiceName + ' autosocket" data-type="  " + data-index="' + this.index + '"><select>' + 
        this.choiceList.map(function(item){
            if (item === this.value){
                return '<option selected>' + item + '</option>';
            }else{
                return '<option>' + item + '</option>';
            }
        }).join('') +
        '</select></span>');
};

Value.prototype.update = function(newValue){
    switch(this.type){
        case 'number': this.value = parseFloat(newValue); break;
        case 'boolean': this.value = newValue === 'true'; break;
        case 'string': this.value = newValue; break;
        case 'date': assert.isString(newValue, 'expects an ISO8601 value');this.value = newValue; break; 
        case 'datetime': assert.isString(newValue, 'expects an ISO8601 value');this.value = newValue; break;
        case 'time': assert.isString(newValue, 'expects an ISO8601 value');this.value = newValue; break;
        case 'int': this.value = parseInteger(newValue); break;
        case 'float': this.value = parseInteger(newValue); break;
    }
}


function Step(spec, scope){
    assertStep(spec);
    this.returns = false;
    this.init(spec);
}
Step.prototype = new Block();
Step.prototype.constructor = Step;

function Expression(spec, scope){
    assertExpression(spec);
    this.init(spec);
}
Expression.prototype = new Block();
Expression.prototype.constructor = Expression;

function Context(spec, scope){
    assertContext(spec);
    this.locals = false;
    this.init(spec);
}
Context.prototype = new Block();
Context.prototype.constructor = Context;

function EventHandler(spec, scope){
    assertContext(spec);
    this.locals = false;
    this.init(spec);
}
EventHandler.prototype = new Block();
EventHandler.prototype.constructor = EventHandler;

function assertStep(model){
    if (model.type){
        alert('Error: expression "' + model.signature + '" treated as a step');
    }
}

function assertExpression(model){
    if (! model.type){
		throw new Error('Bite me');
        alert('Error: step "' + model.signature + '" treated as an expression');
    }
}

function assertContext(model){
    if (model.containers){
        alert('Error: context with containers vs. contained');
        console.error('Context: %o', model);
    }
}

function noDefaultValues(match, spec){
    // remove default values, if any, from labels
    var parts = spec.split(':');
    var val;
    if (parts[0] === 'choice'){
        val = 'choice:' +  parts[1];
    }else{
        val = parts[0];
    }
    return '[' + val + ']';
}

function signature(model){
    var sig = model.blocktype + ': ' + model.spec.labels.map(function(label){
            return label.replace(/\[(.*?)\]/g, noDefaultValues);
        }).join(', ');
    return sig;
}

function Block(spec, scope){
    // If called as constructor, return empty example
    if (this instanceof Block) return this;
    // if called while de-serializing, get the parent spec
    if (spec.signature){
        var template = Block.registry[spec.signature];
        assert.isObject(template, 'We fail to find a template block, has it been initialized yet?');
        var instance = {
            isLocal: false,
            isTemplateBlock: false,
            templateBlock: template
        };
        if (!template){
            throw new Exception('Cannot find a block to restore this from');
        }
        spec = $.extend({}, template.spec, instance, spec);
    }
    // If called as function, demux to the correct constructor
    switch(spec.blocktype){
        case 'step':
            return new Step(spec, scope);
        case 'expression':
            return new Expression(spec, scope);
        case 'context':
            return new Context(spec, scope);
        case 'eventhandler':
            return new EventHandler(spec, scope);
        default:
            console.warn('Unsupported blocktype: %o', model);
            return null;
    }
}

Block._nextId = 0;
Block.newId = function(){
    Block._nextId++;
    return Block._nextId;
};

Block.registry = {};
Block.registerBlock = function(model){
    if (model.isLocal) return; // we build these scripts dynamically anyway
    if (!model.isTemplateBlock) return; // only register blocks in the menu
    if (Block.registry[model.signature]){
        console.warn('Overwriting existing scripts for %s', model.signature);
    }
    Block.registry[model.signature] = model;
};


Block.prototype.debug = function(){
    if (this.isTemplateBlock) return;
    print.apply(console, arguments);
};

Block.prototype.init = function(spec){
    var self = this;
    // normalize labels to a list
    if (spec.label){
        spec.labels = [spec.label];
        delete spec.label;
    }
    $.extend(this, spec);
    this.spec = spec; // save unmodified description
    if (! (this.id || this.isTemplateBlock)){
        this.id = Block.newId();
    }
    // if (this.isLocal) print('this local id: %s', this.id);
	print('initializing labels from inherited labels: %s', this.labels.map(h));
	this.labels = this.labels.map(function(labelspec){
        return labelspec.replace(/##/g, self.id ? '_' + self.id : '');
    });
    this.signature = signature(this);
    this.script = this.script.replace(/##/g, '_' + self.id);
    Block.registerBlock(this);
	print('parsing labels');
    this.labels = this.labels.map(function(labelspec){
        return self.parseLabel(labelspec);
    });
	print('labels after parse: %s', h(this.labels));
    this.template = template(this.blocktype);
    if (!this.isTemplateBlock){
        this.initInstance();
    }
};

Block.prototype.initInstance = function(){
    var self = this;
    if (this.id){
        //Block._nextId = Math.max(Block._nextId, this.id + 1);
    }
    this.labels[0] = attachLocals(this.labels[0]);
    if (this.locals){
        this.spec.locals.forEach(function(spec){
            if (spec === null){
                return spec;
            }
            spec.isTemplateBlock = true;
            spec.isLocal = true;
            spec.id = self.id;
        });
        this.locals = this.spec.locals.map(function(spec){
            if (spec === null){
                return spec;
            }
            var block = Block(spec);
            assert.isObject(block, 'Blocks must be objects');
            return block;
        });
    }
    if (this.returns){
        this._returns = this.returns;
        if (this.returns === 'block'){
            // special user-defined block handler
        }else{
            this._returns.isTemplateBlock = true;
            this._returns.isLocal = true;
            this._returns.id = self.id;
            this.returns = Block(this._returns);
            assert.isObject(this.returns, 'Returns blocks must be objects');
        }
    }
    if (this.spec.contained && this.spec.contained.length){
        this.contained = this.spec.contained.map(function(spec){
            if (spec === null) return spec;
            var block = Block(spec);
            assert.isObject(block, 'Contained blocks must be blocks');
            return block;
        });
    }else{
        this.contained = [];
    }
    if (this.spec.next){
        this.next = Block(this.spec.next);
    }else{
        this.next = null;
    }
    if (this.spec.values && this.spec.values.length){
        this.values = this.spec.values.map(function(value, idx){
			if (value instanceof Value){
				return value;
			}
            var val = new Value(value, idx);
            assert.isObject(val, 'Values must be objects');
            return val;
        });
    }else if (this.values && this.values.length){
        // do nothing
    }else{
        this.values = [];
    }
    
};

Block.prototype.addValue = function(value){
    if (!this.values){
        this.values = [];
    }
    this.values.push(value);
};

Block.prototype.parseLabel = function(textLabel){
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
    // [choice:options:default] => choice list with a default besides the first item
    // etc…

    // FIXME: Move specific type handling to plugins
    var self = this;
    try{
        textLabel = textLabel.replace(/##/, '');
    }catch(e){
        console.error('Failed in textlabel.replace: %o', e);
    }

    this.valueSlots = textLabel.match(/\[.+?\]/g) || [];
    var htmlLabel = textLabel.replace(/\[.+?\]/g, '<div class="valueslot"></div>');
    var label = $('<span class="label">' + htmlLabel + '</label>');
    try{
        if (!this.values && this.valueSlots.length){
            this.values = this.valueSlots.map(function(slot, idx){return new Value(slot, idx);});
        }
    }catch(e){
        console.error('Failed in this.valueSlots.map: %o', e);
    }
		print('label: %s, slots: %s', h(label), label.find('.valueslot').length);
        label.find('.valueslot').each(function fillSlots(idx, slotdom){
		    // try{
				print('value slot idx: %s, slotdom: %s', idx, slotdom);
				var slot = $(slotdom);
	            // FIXME (1): This won't work if some of the slots have the same text (and they do) (unless it does work...)
	            // FIXME (2): When we're reserializing, values are still raw objects, not Value objects, so they don't have .view()
	            var value = self.values[idx];
	            if (!value.view){
					print('converting raw value object into type Value');
	                value = new Value(value, idx);
					print('received new value: %o', value);
	                self.values[idx] = value;
					print('set value[%s] to %o', idx, value);
	            }
				print('here I am!');
				print('replacing slot value with new view: %o', value.view());
				print('')
	            slot.replaceWith(value.view());
		    // }catch(e){
		        // console.error('Failed in this.valueSlots.each: %o', e);
		        // print(htmlLabel.replace);
		        // print('self: %o', self);
		        // print(self.values, idx);
		        // print(self.values[idx]);
		        // print('value has view: %s', self.values[idx].view);
		    // }
        });
    return label;
};

Block.prototype.code = function(){
	// extract code from script, values, contained, and next
	var self = this;
	var _code = this.script;
	function replace_values(match, offset, s){
        var idx = parseInt(match.slice(2, -2), 10) - 1;
		if (match[0] === '{'){
			return self.values[idx] ? self.values[idx].code() : match;
		}else{
			return self.contained[idx] ? self.contained[idx].code() : match;
		}
	}
	_code = _code.replace(/\{\{\d\}\}/g, replace_values);
	_code = _code.replace(/\[\[\d\]\]/g, replace_values);
	if (this.next){
		_code = _code + this.next.code();
	}
	return _code;
}

Block.prototype.cloneScript = function(){
    var spec = $.extend({}, this.spec, {
       isLocal: false,
       isTemplateBlock: false,
       templateBlock: this
    });
    var clone = Block(spec);
	print('block labels: %s', clone.labels[0].toString());
	return clone;
};

Block.prototype.cloneTemplate = function(){
    var spec = $.extend({}, this.spec, {
        isLocal: false,
        isTemplateBlock: true
    });
    return Block(spec);
};

function attachLocals(node){
	node.attachLocals = true; // this should probably be data, c'est la vie
	return node;
}

Block.prototype.view = function(){
    if (this._view){
        return this._view;
    }
    var self = this;
    if (!this.isTemplateBlock){
    }
    var view = this.template(this);
    view.data('model', this);
    if (!this.isTemplateBlock){
        if (this.locals){
            var localContainer = view.find('.locals');
            this.locals.forEach(function(local){
                localContainer.append(local.view());
            });
        }
        view.find('> .block > .contained').each(function(idx){
            $(this).data('index', idx);
        });
        this.contained.forEach(function(contained, idx){
            if (contained === null) return;
            view.find('> .block > .contained').eq(idx).append(contained.view());
            contained.addLocalsToParentContext(view);
        });
        view.find('> .block > .blockhead > .value > .socket').each(function(idx){
            $(this).data('index', idx);
        });
        this.values.forEach(function(value, idx){
            view.find('> .block > .blockhead > .label > .socket').eq(idx).append(value.view());
        });
        if (this.next){
            view.find('> .next').append(this.next.view());
            this.next.addLocalsToParentContext(view);
        }
    }
    this._view = view;
    return view;
};

// EVENT HANDLERS

Block.prototype.removeChild = function(block, container){
    // print('remove this block from %o', container);
};

Block.prototype.addLocalBlock = function(block){
    var locals = this.view().find('> .block > .blockhead > .locals');
    if (!locals.length) {
        throw new Error('no locals found');
    }
    locals.append(block.view());
}

Block.prototype.addLocalsToParentContext = function(view){
    // on addToScript
    if (!this.returns) return;
    if (this.returns === 'block'){
        // special metablock handler
        return;
    }
    if (!this.id){
        throw new Error('Model must have an id by now');
    }
    var context = view.closest('.context').data('model');
    if (context){
        context.addLocalBlock(this.returns);
        if (this.next){
            this.next.addLocalsToParentContext();
        }
    }else{
        this.addGlobals();
        if (this.next){
            this.next.addGlobals();
        }
    }
};

Block.prototype.addGlobals = function(view){
    if (!this.returns) return;
    if (this.returns === 'block'){
        // special metablock handler
        return;
    }
    // remove from DOM if already in place elsewhere
    $('.submenu.globals').append(this.returns.view());
};

Block.prototype.removeLocalsFromParent = function(){
    if (!(this.returns && this.returns.signature)) return;
    this.view().remove();
};

Block.prototype.addToSequence = function(view, evt, params){
    this.addLocalsToParentContext(view);
    // add to parent blocks model
    var parentModel = params.dropTarget.closest('.wrapper').data('model');
    print('Add to sequence params: %o', params);
    parentModel.next = this;
};

Block.prototype.addToContext = function(view, evt, params){
    this.addLocalsToParentContext(view);
    // add to parent blocks model
    var parentModel = params.dropTarget.closest('.wrapper').data('model');
    print('Add to context params: %o', params);
    parentModel.contained[params.parentIndex] = this;
};
Block.prototype.addToWorkspace = function(view, evt, params){
    this.addGlobals(view);
    if (this.next){
        this.next.addToWorkspace();
    }
};
Block.prototype.setValue = function(index, type, newValue){
    print('set value %s to %s', index, newValue);
    this.values[index].update(newValue);
}

Block.prototype.addToSocket = function(view, evt, params){
    // add block to value
    print('add value block to socket');
    var parentModel = params.dropTarget.closest('.wrapper').data('model');
    parentModel.values[params.parentIndex].addBlock(this);
    // FIXME: update view (currently happens elsewhere)
};

Block.prototype.deleteBlock = function(view, evt, params){
    var model = view.data('model');
    model.view().remove();
};

function newBlockHandler(blocktype, args, body, returns){
    console.info('blocktype: %s', blocktype);
    console.info('%s args: %o', args.length, args);
    console.info('body: %o', body);
    console.info('returns: %s', returns);
}

$('.scripts_workspace')
    .on('add_to_sequence', '.wrapper', function(evt, params){
        var view = $(this);
        view.data('model').addToSequence(view, evt, params);
        return false;
    })
    .on('add_to_context', '.wrapper', function(evt, params){
        var view = $(this);
        view.data('model').addToContext(view, evt, params);
        return false;
    })
    .on('add_to_workspace', '.wrapper', function(evt, params){
        var view = $(this);
        view.data('model').addToWorkspace(view, evt, params);
        return false;
    })
    .on('add_to_socket', '.wrapper', function(evt, params){
        var view = $(this);
        view.data('model').addToSocket(view, evt, params);
        return false;
    })
    .on('removeExpression', '.wrapper', function(evt, params){
        console.log('remove expression');
        var parentModel = $(this).data('model');
        var value = parentModel.values[params.expressionIndex];
        value.value = value.defaultValue;
        value.literal = true;
        // Fix up the view
        if(params.socket.hasClass('boolean')){           
            params.socket.parent().append(
                '<select><option>true</option><option>false</option></select>');
        }else{
            params.socket.parent().children('input').show();
        }
    })
    .on('removeChildStep', '.wrapper', function(evt, params){
        console.log('remove child step');
        var parentModel = $(this).data('model');
        if (parentModel.contained[params.childIndex].returns){
            parentModel.contained[params.childIndex].returns.removeLocalsFromParent();
        }
        parentModel.contained[params.childIndex] = null;
    })
    .on('removeNextStep', '.wrapper', function(evt, params){
        console.log('remove next step (sorry Steve)');
        var parentModel = $(this).data('model');
        if (parentModel.next.returns){
            parentModel.next.returns.removeLocalsFromParent();
        }
        parentModel.next = null;
    })
    .on('change', '.socket input, .autosocket select', function(evt){
        var input = $(evt.target);
        var socket = input.parent();
        var socketIndex = socket.data('index');
        var parentModel = socket.closest('.wrapper').data('model');
        parentModel.setValue(socketIndex, input.attr('type') || 'text', input.val());
    })
    
$('body').on('delete_block', '.wrapper', function(evt, params){
    var view = $(this);
    view.data('model').deleteBlock(view, evt, params);
    return false;
});

function removeFromScriptEvent(view){
    var parent = view.parent();
    var parentView = parent.closest('.wrapper');
    if (parent.hasClass('contained')){
        parentView.trigger(
            'removeChildStep', 
            {
                target: view,
                childIndex: parent.data('index')
            }
        );
    }else if (parent.hasClass('socket')){
        parentView.trigger(
            'removeExpression',
            {
                target: view,
                socket: parent,
                expressionIndex: parent.data('index')
            }
        );
        assert(parent.children('input').length > 0, "No input found, where can it be?")
        parent.children('input').val(value.defaultValue);
        
    }else if (parent.hasClass('next')){
        parentView.trigger(
            'removeNextStep',
            {
                target: view
            }
        );
    }
    
}