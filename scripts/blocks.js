// Constructors and models for Blocks

(function(wb){

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
        alert('Error: expression "' + model.id+ '" treated as a step');
    }
}

function assertExpression(model){
    if (! model.type){
        console.log('Error: step "' + model.id + '" treated as an expression');
		throw new Error('Bite me');
        alert('Error: step "' + model.id + '" treated as an expression');
    }
}

function assertContext(model){
    if (model.containers){
        alert('Error: context with containers vs. contained');
        console.error('Context: %o', model);
    }
}

function Block(spec, scope){
    // If called as constructor, return empty example
    if (this instanceof Block) return this;
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

Block._nextSeqNum = 0;

Block.newSeqNum = function(){
    // FIXME: keep registry of sequence numbers by name?
    Block._nextSeqNum++;
    return Block._nextSeqNum;
};

Block.registerSeqNum = function(seqNum){
    seqNum = parseInt(seqNum);
    Block._seqNum = Math.max(id, Block._seqNum);
}

Block.registry = {};

Block.registerBlock = function(model){
    if (!model.script) return; // only register blocks in the menu
    if (Block.registry[model.id]){
        console.warn('Overwriting existing scripts for %s', model.id);
    }
    Block.registry[model.id] = model;
};

Block.prototype.init = function(spec){
    var self = this;
    // normalize labels to a list
    if (spec.label){
        throw new Error('Scripts must use labels: not label:');
    }
    $.extend(true, this, spec);
    this.spec = spec; // save unmodified description
    if (!this.id){
        this.id = uuid();
    }
    Block.registerBlock(this);
    if (this.isTemplateBlock){
        if (this.isLocal){
            this.seqNum = Block.newSeqNum(); // templates only get ids if they are locals (or returns, which have their origin's id)
        }else{
            this.seqNum = '';
        }
    }else{
        this.seqNum = Block.newSeqNum();
    }
    if (!this.group){
        console.log('no group? %o', this);
    }
    if (this.help){
        this.tooltip = this.group + ' ' + this.seqNum + ': ' + this.help;
    }else{
        this.tooltip = this.group + ' ' + this.seqNum;
    }
	this.labels = this.labels.map(function(labelspec){
        return labelspec.replace(/##/g, self.seqNum ? '_' + self.seqNum : '');
    });
    this.script = this.script.replace(/##/g, '_' + self.seqNum);
    this.labels = this.labels.map(function(labelspec){
        return self.parseLabel(labelspec);
    });
    this.template = template(this.blocktype);
    if (!this.isTemplateBlock){
        this.initInstance();
    }
};

Block.prototype.initInstance = function(){
    var self = this;
    this.labels[0].attachLocals = true;
    if (this.locals){
        this.spec.locals.forEach(function(spec){
            if (spec === null){
                return spec;
            }
            spec.isTemplateBlock = true;
            spec.isLocal = true;
            spec.scriptid = self.id;
            spec.seqNum = self.seqNum;
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
            var val = new wb.Value(value, idx);
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
            this.values = this.valueSlots.map(function(slot, idx){return new wb.Value(slot, idx);});
        }
    }catch(e){
        console.error('Failed in this.valueSlots.map: %o', e);
    }
        label.find('.valueslot').each(function fillSlots(idx, slotdom){
			var slot = $(slotdom);
            // FIXME (1): This won't work if some of the slots have the same text (and they do) (unless it does work...)
            var value = self.values[idx];
            // When we're reserializing, values are still raw objects, not Value objects, so they don't have .view()
            if (!value.view){
                value = new wb.Value(value, idx);
                self.values[idx] = value;
            }
            var input = $('<span class="socket value ' + value.type + '" data-type="' + value.type + '" data-index="' + idx + '"><input type="' + wb.getInputType(value) + '" + style="display:none"></input></span>');
            input.append(value.view());
            slot.replaceWith(input);
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
       id: uuid(),
       scriptid: this.id
    });
    var clone = Block(spec);
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
    // remove this block from container
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
    if (!this.returns) return;
    if (this.returns === 'block'){
        // special metablock handler
        return;
    }
    if (!this.id){
        throw new Error('Model must have an id by now');
    }
    var context = this.view().closest('.context').data('model');
    if (context && typeof context === 'Step'){
        context = this.view().closest('.context').parent().closest('.context').data('model')    ;
    }
    if (context){
        context.addLocalBlock(this.returns);
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
    if (!this.returns) return;
    if (this.returns === 'block'){
        // special metablock handler
        return;
    }
    // remove from DOM if already in place elsewhere
    $('.submenu.globals').append(this.returns.view());
};

Block.prototype.removeLocalsFromParent = function(){
    if (!this.returns) return;
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
    this.addGlobals(this.view());
    if (this.next){
        this.next.addToWorkspace();
    }
};
Block.prototype.setValue = function(index, type, newValue){
    this.values[index].update(newValue);
}

Block.prototype.addExpression = function(expression, expressionIndex){
    // add block to value
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
        model.addGlobals();
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

// Export public interface to waterbear namespace

wb.Block = Block;
wb.Step = Step;
wb.Context = Context;
wb.EventHandler = EventHandler;
wb.Expression = Expression;

// and event notifications
wb.removeFromScriptEvent = removeFromScriptEvent;
wb.addToScriptEvent = addToScriptEvent;

})(wb);

