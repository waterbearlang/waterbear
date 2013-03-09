
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

function Deferred(parent, type, idx, spec){
    this.parent = parent;
    this.type = type;
    this.idx = idx;
    this.spec = spec;
}

Deferred.prototype.resolve = function(){
    var block = Block(this.spec);
    if (block){
        switch(this.type){
            case 'value':
                this.parent.addBlock(block, this.idx);
                return true;
            case 'child':
                this.parent.contained[this.idx] = block;
                return true;
            case 'next':
                this.parent.addNext(block);
                return true;
            default:
                console.log('Error: we should never get here');
                return false;
        }
    }else{
        console.log('Deferred.resolve() failed: %o', this);
        return false;
    }
}
Deferred._allDeferreds = [];
Deferred.add = function(parent, type, idx, spec){
    Deferred._allDeferreds.push(new Deferred(parent, type, idx, spec));
};
Deferred.resolve = function(){
    var total = Deferred._allDeferreds.length;
    var count = 0;
    if (total){
        console.log('trying to resolve %s Deferreds', total);
    }
    while(Deferred._allDeferreds.length){
        count++;
        var deferred = Deferred._allDeferreds.shift();
        if (!deferred.resolve()){
            Deferred._allDeferreds.push(deferred);
        }else{
            console.log('resolved!');
        }
        if (count > total){
            if (total === Deferred._allDeferreds.length){
                console.log('Something is wrong, no deferreds (%s left) are resolving', total);
                break;
            }
            total = Deferred._allDeferreds.length;
            count = 0;
        }
    }
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
        if (this.choiceName){
            this.choiceList = choiceLists[this.choiceName];
        }
        if (textValue.value && textValue.value.signature){
            var block = Block(textValue.value);
            if (block){
                this.addBlock(block);
            }else{
                Deferred.add(this, 'value', null, textValue.value);
            }
            // assert.isObject(block, 'Value blocks must be objects');
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
        if (this.value && this.value.substring && this.type !== 'any'){ // is it a string?
            return '"' + this.value + '"';
        }
		return this.value;
	}else{
        try{
            return this.value.code();
        }catch(e){
            console.log('What happened to code? %o', this);
            throw e;
        }
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

function getInputType(testType){
    if (['color', 'date', 'datetime', 'time', 'email', 'month', 'number', 'tel', 'text', 'url', 'week'].indexOf(testType) > -1){
        return testType;
    }
    if (['float', 'double', 'int', 'long'].indexOf(testType) > -1){
        return 'number';
    }
    return 'text';
}

Value.prototype.view = function(){
	print('building view for %o, has cached view: %s', j(this), !!this._view);
	print('we do not have a cached view');
    if (! this.literal && this.value){ return this.value.view(); }
	print('we do not have a block value');
    var inputType;
    if (this.choiceName){
		print('return choice view');
        this._view =  this.choiceView(this.choiceName, this.choiceList);
    }else if (this.value !== undefined){
        inputType = getInputType(this.type);
		print('return type/index/value %o/%o/%o', this.type, this.index, this.value);
        this._view = $('<span class="value ' + this.type + ' socket" data-type="' + this.type + '" data-index="' + this.index  + '"><input type="' + inputType + '" value="' + this.value + '"></span>');
    }else{
		print('return undefined value');
        inputType = getInputType(this.type);
        this._view = $('<span class="value ' + this.type + ' socket" data-type="' + this.type + '" data-index="' + this.index + '"><input type="' + inputType + '"></span>');
    }
	print('return cached value: %o', h(this._view));
    return this._view;
};

Value.prototype.choiceView = function(){
    var self = this;
    return $('<span class="value string ' + this.choiceName + ' autosocket" data-type="  " + data-index="' + this.index + '"><select>' +
        this.choiceList.map(function(item){
            if (item === self.value){
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
        default: this.value = newValue; break;
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
        console.log('Error: step "' + model.signature + '" treated as an expression');
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
        if (model.isLocal && model.id){
            sig = sig.replace(/##/g, '_' + model.id);
        }
    return sig;
}

function Block(spec, scope){
    // If called as constructor, return empty example
    if (this instanceof Block) return this;
    // if called while de-serializing, get the parent spec
    if (spec.signature){
        var template = Block.registry[spec.signature];
        if (!template){
            console.log('Failed to find template model with signature %s', spec.signature);
            return null; // let Deferred handle it
        }
        // assert.isObject(template, 'We fail to find a template block for ' + spec.signature + ', has it been initialized yet?');
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
    console.log('returning new id: %s', Block._nextId);
    return Block._nextId;
};

Block.registerId = function(id){
    id = parseInt(id);
    // if (id < Block._nextId){
    //     console.log('Warning: registering id %s that may already have been used (next: %s)', id, Block._nextId);
    // }else{
    //     console.log('Registered id %s', id);
    // }
    Block._nextId = Math.max(id, Block._nextId);
}

Block.registry = {};

Block.registerBlock = function(model){
    if (!model.isTemplateBlock) return; // only register blocks in the menu
    if (model.isLocal){
        console.log('registering model %s', model.signature);
    }
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
        throw new Error('Scripts must use labels: not label:');
    }
    $.extend(true, this, spec);
    this.spec = spec; // save unmodified description
    if (this.id){
        Block.registerId(this.id);
    }else{
        if (this.isTemplateBlock){
            if (this.isLocal){
                this.id = Block.newId(); // templates only get ids if they are locals (or returns, which have their origin's id)
            }else{
                this.id = '';
            }
        }else{
            this.id = Block.newId();
        }
    }
    if (!this.group){
        console.log('no group? %o', this);
    }
    if (this.help){
        this.tooltip = this.group + ' ' + this.id + ': ' + this.help;
    }else{
        this.tooltip = this.group + ' ' + this.id;
    }
    // if (this.isLocal) print('this local id: %s', this.id);
    try{
        print('initializing labels from inherited labels: %s', this.labels.map(h));
    }catch(e){
        console.log('Error with labels: %o', this.labels);
    }
	this.labels = this.labels.map(function(labelspec){
        return labelspec.replace(/##/g, self.id ? '_' + self.id : '');
    });
    if (!this.signature){
        this.signature = signature(this);
    }
    if (this.isLocal){
        this.signature = this.signature.replace(/##/g, '_' + self.id);
    }
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
    this.labels[0].attachLocals = true;
    if (this.locals){
        this.spec.locals.forEach(function(spec){
            if (spec === null){
                return spec;
            }
            spec.isTemplateBlock = true;
            spec.isLocal = true;
            spec.id = self.id;
        });
        this.locals = this.spec.locals.map(function(spec, idx){
            if (spec === null){
                return spec;
            }
            spec.group = self.group;
            spec.localOrigin = self;
            spec.localIndex = idx;
            if (self.customLocals){
                spec.labels[0] = self.customLocals[idx];
            }
            var block = Block(spec);
            // assert.isObject(block, 'Blocks must be objects');
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
            this._returns.group = this.group;
            this._returns.returnOrigin = this;
            this._returns.id = this.id;
            if (self.customReturns){
                this._returns.labels[0] = self.customReturns;
            }
            this._returns.help = 'value of ' + this._returns.labels[0].replace('##', self.id);
            this.returns = Block(this._returns);
            assert.isObject(this.returns, 'Returns blocks must be objects');
        }
    }
    if (this.spec.next){
        this.next = Block(this.spec.next);
        if (!this.next){
            Deferred.add(this, 'next', null, this.spec.next);
        }
    }else{
        this.next = null;
    }
    if (this.spec.contained && this.spec.contained.length){
        this.contained = this.spec.contained.map(function(spec, idx){
            if (spec === null) return spec;
            var block = Block(spec);
            if (!block){
                Deferred.add(self, 'child', idx, spec);
            }
            // assert.isObject(block, 'Contained blocks must be blocks');
            return block;
        });
    }else{
        this.contained = [];
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
	            var value = self.values[idx];
	            // When we're reserializing, values are still raw objects, not Value objects, so they don't have .view()
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
                var input = $('<span class="socket value ' + value.type + '" data-type="' + value.type + '" data-index="' + idx + '"><input type="' + getInputType(value) + '" + style="display:none"></input></span>');
                input.append(value.view());
	            slot.replaceWith(input);
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
    // Copy a template model (in the menu) to a script model (in the script workspace)
    var spec = $.extend({}, this.spec, {
       isLocal: false,
       isTemplateBlock: false,
       templateBlock: this,
       id: this.id,
       signature: this.signature
    });
    console.log('cloneScript: model: %o, spec: %o', this, spec);
    var clone = Block(spec);
	print('block labels: %s', clone.labels[0].toString());
	return clone;
};

Block.prototype.clone = function(deep){
    // Clone a script block. If deep is true, clone values and contained blocks
    // Do not clone next blocks, this is for supporting copy and paste
    var spec = this.toJSON();
    if (!deep){
        spec.contained = [];
        spec.values = this.values.map(function(v){return {
            type: this.type,
            value:  v.literal ? v.value : v.defaultValue
        }});
    }
    return Block(spec);
}

// Not used, delete?
// Block.prototype.cloneTemplate = function(){
//     var spec = $.extend({}, this.spec, {
//         isLocal: false,
//         isTemplateBlock: true
//     });
//     return Block(spec);
// };

function attachLocals(node){
	node.attachLocals = true; // this should probably be data, c'est la vie
	return node;
}

Block.prototype.view = function(){
    if (this._view){
        if (!this._view.data('model')){
            console.log('belatedly setting model %o on view %o', this, this._view);
            this._view.data('model', this);
        }
        return this._view;
    }
    var self = this;
    var view = this._view = this.template(this);
    view.data('model', this);
    if (this.isTemplateBlock){
        return view;
    }
    if (this.locals){
        var localContainer = view.find('.locals');
        this.locals.forEach(function(local){
            localContainer.append(local.view());
        });
    }
    view.find('> .block > .blockhead > .contained').each(function(idx){
        $(this).data('index', idx);
    });
    this.contained.forEach(function(contained, idx){
        if (contained === null) return;
        view.find('> .block > .blockhead > .contained').eq(idx).append(contained.view());
        contained.addLocalsToParentContext();
    });
    view.find('> .block > .blockhead > .value > .socket').each(function(idx){
        $(this).data('index', idx);
    });
    this.values.forEach(function(value, idx){
        view.find('> .block > .blockhead > .label > .socket').eq(idx).append(value.view());
    });
    if (this.next){
        view.find('> .next').append(this.next.view());
        this.next.addLocalsToParentContext(true);
    }
    if (this.id){
        view.attr('data-id', this.id);
    }
    return view;
};

Block.prototype.changeLabel = function(labelText){
    this._view.find('> .block > .blockhead > .label').text(labelText);
    this.spec.labels[0] = labelText;
    if (this.returnOrigin){
        // console.log('setting returnOrigin returns label: %o', this.returnOrigin);
        this.returnOrigin.spec.returns.labels[0] = labelText;
        this.returnOrigin.customReturns = labelText;
    }
    if (this.localOrigin){
        var locals = this.localOrigin.spec.locals;
        locals[this.localIndex].labels[0] = labelText;
        if (!this.localOrigin.customLocals){
            this.localOrigin.customLocals = locals.map(function(loc){
                return loc.labels[0];
            });
        }
        this.localOrigin.customLocals[this.localIndex] = labelText;
    }
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

Block.prototype.addLocalsToParentContext = function(isNext){
    // on addToScript
	// console.log('addLocalsToParentContext %o', this);
    if (!this.locals) return;
    if (!this.locals.length) return;
    if (!this.id){
        throw new Error('Model must have an id by now');
    }
    var context = this.view().closest('.context').data('model');
    if (context){
        this.locals.forEach(function(local){
            context.addLocalBlock(local);
        });
        if (this.next){
            this.next.addLocalsToParentContext(isNext);
        }
    }else{
        this.addGlobals();
        if (this.next){
            this.next.addGlobals();
        }
    }
};

Block.prototype.addGlobals = function(){
    if (!this.locals) return;
    if (!this.locals.length) return;
    // remove from DOM if already in place elsewhere
    this.locals.forEach(function(local){
        $('.submenu.globals').append(local.view());
    });
};

Block.prototype.removeLocalsFromParent = function(){
    if (!(this.returns && this.returns.signature)) return;
    this.returns.view().remove();
};

Block.prototype.addNext = function(step){
    if (this.next){
        throw new Error('Cannot add a next step where a next step already exists');
    }
    step.addLocalsToParentContext(true);
    this.next = step;
}

Block.prototype.addStep = function(step, stepIndex){
    if (this.contained[stepIndex]){
        throw new Error('Cannot add a step where a step exists already');
    }
    step.addLocalsToParentContext();
    this.contained[stepIndex] = step;
};
Block.prototype.addToWorkspace = function(){
    this.addLocalsToParentScope();
};
Block.prototype.setValue = function(index, type, newValue){
    print('set value %s to %s', index, newValue);
    this.values[index].update(newValue);
}

Block.prototype.addExpression = function(expression, expressionIndex){
    // add block to value
    // print('add value block to socket');
    this.values[expressionIndex].addBlock(expression);
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
    // .on('add_to_workspace', '.wrapper', function(evt, params){
    //     var view = $(this);
    //     view.data('model').addToWorkspace(view, evt, params);
    //     return false;
    // })
    .on('change', '.socket input, .autosocket select', function(evt){
        var input = $(evt.target);
        var socket = input.parent();
        var socketIndex = socket.data('index');
        var parentModel = socket.closest('.wrapper').data('model');
        parentModel.setValue(socketIndex, input.attr('type') || 'text', input.val());
		$('.scripts_workspace').trigger('scriptmodified');
    });

Block.prototype.removeExpression = function(expression, expressionIndex){
    console.log('remove expression');
    var value = this.values[expressionIndex];
    value.value = value.defaultValue;
    value.literal = true;
};

Block.prototype.removeContainedStep = function(step, stepIndex){
    console.log('remove child step');
    this.contained[stepIndex].removeLocalsFromParent();
    this.contained[stepIndex] = null;
};

Block.prototype.removeNextStep = function(step){
    console.log('remove next step (sorry Steve)');
    this.next.removeLocalsFromParent(true);
    this.next = null;
};

$('body').on('delete_block', '.wrapper', function(evt, params){
    var view = $(this);
    view.data('model').deleteBlock(view, evt, params);
    return false;
});

function removeFromScriptEvent(view){
    var parent = view.parent();
    var model = view.data('model');
    var parentView = parent.closest('.wrapper');
    var parentModel = parentView.data('model');
    model.removeLocalsFromParent();
    if (parent.hasClass('contained')){
        parentModel.removeContainedStep( model, parent.data('index'));
    }else if (parent.hasClass('socket')){
        var exprIndex = parent.data('index');
        parentModel.removeExpression(model, exprIndex);
        assert(parent.children('input').length > 0, "No input found, where can it be?")
        if(parent.hasClass('boolean')){
            parent.append(
                '<select><option>true</option><option>false</option></select>');
        }else{
            parent.children('input').show();
        }
        // Why is val an actual value rather than a method?
        parent.children('input').val(parentModel.values[exprIndex].defaultValue);
    }else if (parent.hasClass('next')){
        parentModel.removeNextStep(model);
    }
	$('.scripts_workspace').trigger('scriptmodified');

}

function addToScriptEvent(container, view){
    // Converts from DOM/jQuery action to model action
    // console.log('addToScriptEvent %o, %o', container, view);
    var model = view.data('model');
    if (!model){
        console.log('unable to retrieve model for view %o', view);
        throw new Error('unable to retrieve model');
    }
    if (container.is('.slot') || container.is('input')){
        container = container.parent();
    }
    if (container.is('.scripts_workspace')){
        model.addLocalsToParentContext();
    }else{
        var parentModel = view.parent().closest('.wrapper').data('model');
        if (view.is('.value')){
            parentModel.addExpression(model, container.data('index'));
        }else{
            if (container.hasClass('next')){
                parentModel.addNext(model);
            }else{
                parentModel.addStep(model, container.data('index'));
            }
        }
    }
	$('.scripts_workspace').trigger('scriptmodified');
}

$('.content').on('dblclick', '.locals .label, .globals .label', function(evt){
    var label = $(evt.target);
	var model = label.closest('.wrapper').data('model');
    // Rather than use jquery to find instances, should origin model keep track of all instances?
    // How would that survive serialization/reification?
    var instances = $('.content .value.wrapper[data-id=' + model.id + ']');
    var input = $('<input class="label_input" value="' + label.text() + '" />');
    label.after(input).hide();
    input.select();
    // FIND ALL INSTANCES
	return false;
});

$('.content').on('keypress', '.locals .label_input, .globals .label_input', function(evt){
    if (evt.which === 13){
        var labelInput = $(evt.target);
        var labelText = labelInput.val();
        var model = labelInput.closest('.wrapper').data('model');
        labelInput.prev().show();
        labelInput.remove();
        if (labelText.length){
            var instances = $('.content .value.wrapper[data-id=' + model.id + ']');
            instances.each(function(){
                $(this).data('model').changeLabel(labelText);
            });
            model.changeLabel(labelText);
        }
        return false;
    }
});

$(document.body).on('scriptloaded', function(evt){
	$('.scripts_workspace').on('scriptmodified', function(evt){
		if (wb.queryParams.gist){
			delete wb.queryParams.gist;
			var prev = location.href;
			history.pushState(null, null, wb.queryParamsToUrl(wb.queryParams));
			window.addEventListener('popstate', function(e){
				location.reload(prev);
			});
		}
	});
});
