// Constructors and models for Blocks

(function(wb){

// BLOCK SUBTYPES

function Step(spec, scope){
    this.returns = false;
    this.init(spec);
}
Step.prototype = new Block();
Step.prototype.constructor = Step;

function Expression(spec, scope){
    this.init(spec);
}
Expression.prototype = new Block();
Expression.prototype.constructor = Expression;

function Context(spec, scope){
    this.locals = [];
    this.init(spec);
}
Context.prototype = new Block();
Context.prototype.constructor = Context;

function EventHandler(spec, scope){
    this.locals = [];
    this.init(spec);
}
EventHandler.prototype = new Block();
EventHandler.prototype.constructor = EventHandler;

// HERE is the main definition of Block and its methods

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

Block.model = function(view){
    if (view.jquery){
        view = view[0];
    }
    view = wb.closest(view, '.wrapper');
    return Block.registry[view.dataset.id];
}

Block.registerBlock = function(model){
    if (Block.registry[model.id]){
        console.warn('Overwriting existing scripts for %s', model.id);
    }
    Block.registry[model.id] = model;
};

Block.lookup = function(id){
    return Block.registry[id];
}

Block.prototype.init = function(spec){
    var self = this;
    // normalize label from a list
    if (spec.labels){
        spec.label = spec.labels[0];
        delete spec.labels;
    }
    $.extend(true, self, spec);
    this.spec = spec; // save unmodified description
    if (!self.id){
        self.id = uuid();
    }
    Block.registerBlock(self);
    if (self.isTemplateBlock){
        if (self.isLocal){
            self.seqNum = Block.newSeqNum(); // templates only get ids if they are locals (or returns, which have their origin's id)
        }else{
            self.seqNum = '';
        }
    }else{
        self.seqNum = Block.newSeqNum();
    }
    if (!self.group){
        console.log('no group? %o', self);
    }
    if (self.help){
        self.tooltip = self.group + ' ' + self.seqNum + ': ' + self.help;
    }else{
        self.tooltip = self.group + ' ' + self.seqNum;
    }
    self.label = self.parseLabel(self.label.replace(/##/g, self.seqNum ? '_' + self.seqNum : ''));
    self.template = template(self.blocktype);
    if (!self.isTemplateBlock){
        self.initInstance();
    }
};

Block.prototype.initInstance = function initInstance(){
    var self = this;
    if (self.spec.locals){
        self.spec.locals.forEach(function(spec){
            if (spec === null){
                return spec;
            }
            spec.isTemplateBlock = true;
            spec.isLocal = true;
            spec.scriptid = self.id;
            spec.seqNum = self.seqNum;
        });
        self.locals = self.spec.locals.map(function(spec, idx){
            if (spec === null){
                return spec;
            }
            spec.group = self.group;
            spec.localOrigin = self;
            spec.localIndex = idx;
            if (self.customLocals){
                spec.label = self.customLocals[idx];
            }
            var block = Block(spec);
            assert.isObject(block, 'Blocks must be objects');
            return block;
        });
    }
    if (self.spec.contained && self.spec.contained.length){
        self.contained = self.spec.contained.map(function(spec, idx){
            if (spec === null) return spec;
            return Block(spec);
        });
    }else{
        self.contained = [];
    }
    if (self.spec.values && self.spec.values.length){
        self.values = self.spec.values.map(function(value, idx){
            if (value instanceof wb.Value){
                return value;
            }
            var val = new wb.Value(value, idx);
            assert.isObject(val, 'Values must be objects');
            return val;
        });
    }else if (self.values && self.values.length){
        // do nothing
    }else{
        self.values = [];
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
        }slot.replaceWith(value.view());
        // var input = $('<span class="socket value ' + value.type + '" data-type="' + value.type + '" data-index="' + idx + '"><input type="' + wb.getInputType(value) + '"  style="display:none"></input></span>');
        // input.append(value.view());
        // slot.replaceWith(input);
    });
    return label;
};

Block.prototype.code = function(){
    // extract code from script, and recursively from  values and contained blocks
    var self = this;
    var _code = Block.lookup(this.scriptid).script.replace(/##/g, '_' + self.seqNum);
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
        if (!this._view[0].dataset.id){
            console.log('belatedly setting model %o on view %o', this, this._view);
            this._view[0].dataset.id = this.id;
        }
        return this._view;
    }
    var self = this;
    var view = this._view = this.template(this);
    view[0].dataset.id = this.id;
    if (this.isTemplateBlock){
        return view;
    }
    if (this.locals){
        var localContainer = view.find('.locals');
        this.locals.forEach(function(local){
            localContainer.append(local.view());
        });
    }
    this.contained.forEach(function(contained, idx){
        wb.findChild(view, '.block', '.blockhead', '.contained').appendChild(contained.view()[0]);
        contained.addLocalsToParentContext();
    });
    // this.values.forEach(function(value, idx){
    //     view.find('> .block > .blockhead > .label > .socket').eq(idx).append(value.view());
    // });
    if (this.id){
        view.attr('data-id', this.id);
    }
    if (this.collapsed){
        view.toggleClass('open closed');
        view.find('.disclosure').text('►');
        view.find('.locals').hide();
        view.find('.contained').hide();
    }
    return view;
};

Block.prototype.changeLabel = function(labelText){
    this._view.find('> .block > .blockhead > .label').text(labelText);
    this.spec.label = labelText;
    if (this.returnOrigin){
        // console.log('setting returnOrigin returns label: %o', this.returnOrigin);
        this.returnOrigin.spec.returns.label = labelText;
        this.returnOrigin.customReturns = labelText;
    }
    if (this.localOrigin){
        var locals = this.localOrigin.spec.locals;
        locals[this.localIndex].label = labelText;
        if (!this.localOrigin.customLocals){
            this.localOrigin.customLocals = locals.map(function(loc){
                return loc.label;
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
    if (this.locals === undefined){
        this.locals = [];
    }
    if (this.locals.indexOf(block) > -1){
        // pass, we already have this one
    }else{
        this.locals.push(block);
    }
    locals.append(block.view());
}

Block.prototype.addLocalsToParentContext = function(){
    // on addToScript
    // console.log('addLocalsToParentContext %o', this);
    if (!(this.locals && this.locals.length)) return;
    if (!this.id){
        throw new Error('Model must have an id by now');
    }
    var context = Block.model(this.view().closest('.context'));
    if (context){
        this.locals.forEach(function(local){
            context.addLocalBlock(local);
        });
    }else{
        this.addGlobals();
    }
};

Block.prototype.addGlobals = function(){
    if (!(this.locals && this.locals.length)) return;
    // remove from DOM if already in place elsewhere
    this.locals.forEach(function(local){
        $('.submenu.globals').append(local.view());
    });
};

Block.prototype.removeLocalsFromParent = function(){
    // this should work for globals as well
    if (!(this.locals && this.locals.length)) return;
    this.locals.forEach(function(local){
        local.view().remove();
    });
};

Block.prototype.addStep = function(step, stepIndex){
    // console.log('before addStep: %s', this.contained.length);
    // console.log('step index: %s', stepIndex);
    this.contained.splice(stepIndex, 0, step);
    // console.log('after addStep: %s', this.contained.length);
    step.addLocalsToParentContext();
};
Block.prototype.addToWorkspace = function(){
    this.addLocalsToParentScope();
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
    var model = Block.model(view);
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
    //     Block.model(view).addToWorkspace(view, evt, params);
    //     return false;
    // })
    .on('change', '.socket input, .autosocket select', function(evt){
        var input = $(evt.target);
        var socket = input.parent();
        var socketIndex = socket.data('index');
        var parentModel = Block.model(socket.closest('.wrapper'));
        parentModel.setValue(socketIndex, input.attr('type') || 'text', input.val());
        $('.scripts_workspace').trigger('scriptmodified');
    });

Block.prototype.removeExpression = function(expression, expressionIndex){
    // console.log('remove expression');
    var value = this.values[expressionIndex];
    value.value = value.defaultValue;
    value.literal = true;
};

Block.prototype.removeContainedStep = function(step){
    // console.log('remove child step');
    step.removeLocalsFromParent();
    this.contained.splice(this.contained.indexOf(step), 1);
};


$('body').on('delete_block', '.wrapper', function(evt, params){
    var view = $(this);
    Block.model(view).deleteBlock(view, evt, params);
    return false;
});


function removeFromScriptEvent(view){
    var parent = view.parentElement;
    var model = Block.model(view);
    if (wb.matches(parent, '.scripts_workspace')){
        model.removeLocalsFromParent();
    }else{
        var parentView = wb.closest(parent, '.wrapper');
        var parentModel = Block.model(parentView);
        model.removeLocalsFromParent();
        if (parent.classList.contains('contained')){
            parentModel.removeContainedStep( model );
        }else if (parent.hasClass('socket')){
            var exprIndex = parent.dataset.index;
            parentModel.removeExpression(model, exprIndex);
            assert(parent.children('input').length > 0, "No input found, where can it be?")
            if(parent.classList.contains('boolean')){
                parent.appendChild(wb.elem('select', null, [['option', null, 'true'], ['option', null, 'false']]));
            }else{
                parent.children('input').show();
            }
            // Why is val an actual value rather than a method?
            parent.children('input').val(parentModel.values[exprIndex].defaultValue);
        }
    }
    $('.scripts_workspace').trigger('scriptmodified');

}

function addToScriptEvent(droptarget, view){
    // Converts from DOM/jQuery action to model action
    // console.log('addToScriptEvent %o, %o', container, view);
    // FIXME: We need to add the view to the right model's view
    // These are the cases that need to be handled:
    // 1. Drop a block into another block as the first contained block
    // 2. Drop a block on the script, not contained (global)
    // 3. Drop a block in another block, following another step
    // 4. Drop an expression block into a socket
    var container;
    var model = Block.model(view);
    if (!model){
        console.log('unable to retrieve model for view %o', view);
        throw new Error('unable to retrieve model');
    }
    if (wb.matches(droptarget, '.socket')){
        container = droptarget.parentElement;
    }else if (wb.matches(droptarget, '.contained')){
        container = droptarget.parentElement;
    }
    if (wb.matches(droptarget, '.scripts_workspace')){
        model.addLocalsToParentContext();
    }else if (wb.matches(droptarget, '.contained')){
        var parentModel = Block.model(wb.closest(droptarget, '.context'));
    }else{
        var parentModel = Block.model(wb.closest(droptarget, '.wrapper'));
    }
    if (parentModel){
        if (wb.matches(view, '.value')){
            console.log('adding %o to %o at index %s', model, parentModel, wb.indexOf(droptarget));
            parentModel.addExpression(model, wb.indexOf(droptarget)); // FIXME, this is not the way to get the index
        }else{
            parentModel.addStep(model, wb.indexOf(view));
        }
    }else{
        // console.log('no parent model found for %o', droptarget);
    }
    // FIXME: Move adding view to parent's view from drag2.js to here
    $('.scripts_workspace').trigger('scriptmodified');
}

$('.content').on('dblclick', '.locals .label, .globals .label', function(evt){
    var label = $(evt.target);
    var model = Block.model(label.closest('.wrapper'));
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
        var model = Block.model(labelInput.closest('.wrapper'));
        labelInput.prev().show();
        labelInput.remove();
        if (labelText.length){
            var instances = $('.content .value.wrapper[data-id=' + model.id + ']');
            instances.each(function(){
                Block.model(this).changeLabel(labelText);
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
    var model = Block.model(view);
    if (self.is('.open')){
        self.text('►');
        view.find('.locals').hide();
        view.find('.contained').hide();
        model.collapsed = true;
    }else{
        self.text('▼');
        view.find('.locals').show();
        view.find('.contained').show();
        model.collapsed = false;
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

