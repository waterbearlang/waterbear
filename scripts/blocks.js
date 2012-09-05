

var templates = {};
var compiledTemplates = {};
['step', 'context', 'eventhandler', 'expression'].forEach(function(type){
    compiledTemplates[type] = Mustache.compile($('#' + type + '_template').text());
    templates[type] = function (values){
        return compiledTemplates[type](values);
    };
});

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
    var htmlLabel = textLabel;
    try{
        if (!this.values && this.valueSlots.length){
            this.values = this.valueSlots.map(function(slot){ return new Value(slot);});
        }
    }catch(e){
        console.error('Failed in this.valueSlots.map: %o', e);
    }
    try{
        this.valueSlots.forEach(function(slot, idx){
            // FIXME (1): This won't work if some of the slots have the same text (and they do) (unless it does work...)
            // FIXME (2): When we're reserializing, values are still raw objects, not Value objects, so they don't have .view()
            var value = self.values[idx];
            // console.log('test and convert value: %o', value);
            if (!value.view){
                value = new Value(value);
            }
            // console.log('converted value : %o', value);
            // console.log('"' + htmlLabel + '".replace(' + slot + ', ' +  value.view() + ')');
            htmlLabel = htmlLabel.replace(slot, value.view());
        });
    }catch(e){
        // console.error('Failed in this.valueSlots.forEach: %o', e);
        // console.log(htmlLabel.replace);
        // console.log('self: %o', self);
        // console.log(self.values, idx);
        // console.log(self.values[idx]);
        // console.log(self.values[idx].view);
    }
    return htmlLabel;
};

var defaultValue = {
    'number': 0,
    'boolean': false,
    'string': '',
    'date': function(){ return new Date().toISOString().split('T')[0]; },
    'time': function(){ return new Date().toISOString().split('T')[1].split('.')[0] + 'Z'; },
    'datetime': function(){ return new Date().toISOString(); },
    'color': 'rgb(0,0,0)'
};

function Value(textValue){
    if ($.isPlainObject(textValue)){
        $.extend(this, textValue);
        if (textValue.value.signature){
            // console.log('block value: %s', textValue.value.signature);
            this.addBlock(Block(value.value));
        }else{
            // console.log('literal value: %s', textValue.value);
            this.literal = true;
        }
    }else{
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

Value.prototype.addBlock = function(blockModel){
    this.literal = false;
    this.value = blockModel;
};

Value.prototype.removeBlock = function(blockModel){
    this.literal = true;
    this.value = this.defaultValue;
};

Value.prototype.view = function(){
    if (! this.literal && this.value){ return this.value.view().html(); }
    if (this.choiceName){
        return this.choiceView(this.choiceName, this.choiceList);
    }else if (this.value !== undefined){
        return '<span class="value ' + this.type + ' socket" data-type="' + this.type + '"><input type="' + this.type + '" value="' + this.value + '"></span>';
    }else{
        return '<span class="value ' + this.type + ' socket" data-type="' + this.type + '"><input type="' + this.type + '"></span>';
    }
};

Value.prototype.choiceView = function(){
    return '<span class="value string ' + this.choiceName + ' autosocket" data-type="  "><select>' + 
        this.choiceList.map(function(item){
            if (item === this.value){
                return '<option selected>' + item + '</option>';
            }else{
                return '<option>' + item + '</option>';
            }
        }).join('') +
        '</select></span>';
};


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
    this.debug('creating context');
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
        var instance = {
            isLocal: false,
            isTemplateBlock: false,
            templateBlock: template
        };
        if (!template){
            throw new Exception('Cannot find a block to restore this from');
        }
        spec = $.extend({}, template.spec, instance, spec);
        // console.log('deserializing %o', spec);
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
    console.log.apply(console, arguments);
};

Block.prototype.init = function(spec){
    var self = this;
    // normalize labels to a list
    if (spec.label){
        spec.labels = [spec.label];
        delete spec.label;
    }
    $.extend(this, spec);
    this.debug('initializing instance');
    this.spec = spec; // save unmodified description
    if (! (this.id || this.isTemplateBlock)){
        this.id = Block.newId();
    }
    this.labels = this.labels.map(function(labelspec){
        return labelspec.replace(/##/g, self.id ? '_' + self.id : '');
    });
    this.signature = signature(this);
    this._allViews = [];
    this.script = this.script.replace(/##/g, '_' + self.id);
    Block.registerBlock(this);
    self.debug('are my labels parsed already? %s', this.labels[0][0]);
    this.labels = this.labels.map(function(labelspec){
        return self.parseLabel(labelspec);
    });
    self.debug('initialize template block');
    self.debug('do I already have a template? %s', !!this.template);
    this.template = templates[this.blocktype];
    self.debug('initialize instance');
    if (!this.isTemplateBlock){
        this.initInstance();
    }
};

Block.prototype.initInstance = function(){
    // console.log('initInstance %o', this);
    this.labels[0] = attachLocals(this.labels[0]);
    if (this.locals){
        this.spec.locals.forEach(function(spec){
            spec.isTemplateBlock = true;
            spec.isLocal = true;
            spec.id = self.id;
        });
        this.locals = this.spec.locals.map(function(spec){
            return Block(spec);
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
        }
    }
    if (this.spec.contained && this.spec.contained.length){
        this.contained = this.spec.contained.map(function(spec){
            return Block(spec);
        });
    }else{
        this.contained = [];
    }
    if (this.spec.next){
        this.next = Block(this.spec.next);
    }else{
        this.next = null;
    }
    // console.log('this.values: %o', this.values);
    // console.log('this.spec.values: %o', this.spec.values);
    if (this.spec.values && this.spec.values.length){
        // console.log('deserializing values');
        this.values = this.spec.values.map(function(value){
            return new Value(value);
        });
    }else if (this.values && this.values.length){
        // console.log('we already have values, thank you: %o', this.values);
        // do nothing
    }else{
        // console.log('values: %o', this.values);
        this.values = [];
    }
};

Block.prototype.cloneScript = function(){
    var spec = $.extend({}, this.spec, {
       isLocal: false,
       isTemplateBlock: false,
       templateBlock: this
    });
    return Block(spec);
};

function attachLocals(theString){
    return {
        toString: function(){ return theString; },
        attachLocals: true
    };
}

Block.prototype.view = function(){
    if (!this.isTemplateBlock){
        // console.log('view()');
    }
    var view = $(this.template(this));
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
            view.find('> .block > .contained').eq(idx).append(contained.view());
        });
        view.find('> .block > .blockhead > .value > .socket').each(function(idx){
            $(this).data('index', idx);
        });
        this.values.forEach(function(value, idx){
            view.find('> .block > .blockhead > .label > .socket').eq(idx).append(value.view());
        });
        if (this.next){
            view.find('> .next').append(this.next.view());
        }
    }
    this._allViews.push(view);
    return view;
};

Block.prototype.removeChild = function(block, container){
    // console.log('remove this block from %o', container);
};

Block.prototype.deleteViews = function(){
    this._allViews.forEach(function(view){
        view.parent().closest('.wrapper').data('model').removeChild(this, view.parent());
        view.remove();
    });
    this._allViews = [];
};

Block.prototype.addLocalsToParentContext = function(view){
    // on addToScript
    if (!this.returns) return;
    if (this.returns === 'block'){
        // special metablock handler
        return;
    }
    // remove from DOM if already place elsewhere
    this.returns.deleteViews();
    var returnView = this.returns.view();
    if (!this.id){
        console.error('Model must have an id by now');
    }
//    returnView.id(this.id);
    var context = view.context_block();
    if (context.length){
        context.addLocalBlock(returnView);
        if (this.next){
            this.next.addLocalsToParentContext();
        }
    }else{
        this.addGlobals();
        if (this.next){
            this.next.addGlobals();
        }
    }
    // make sure subsequent blocks also add their locals
};

Block.prototype.addGlobals = function(view){
    if (!this.returns) return;
    if (this.returns === 'block'){
        // special metablock handler
        return;
    }
    // remove from DOM if already in place elsewhere
    this.returns.deleteViews();
    $('.submenu.globals').append(this.returns.view());
};

Block.prototype.removeLocalsFromParent = function(){
    if (!(this.returns && this.returns.signature)) return;
    this.returns.deleteViews();
};

Block.prototype.addToScript = function(view, evt, params){
    console.info('addToScript');
    this.addLocalsToParentContext(view);
    // add to parent blocks model
    var parentBlock = params.dropTarget.closest('.wrapper').data('model');
    var ctx = params.dropTarget.parent().attr('class'); // contained vs. next
    if (ctx === 'next'){
        parentBlock.next = this;
    }else{
        var idx = params.dropTarget.closest('.block').find('> .contained').index(params.dropTarget.parent());
        parentBlock.contained[idx] = this;
    }
};

Block.prototype.addToWorkspace = function(view, evt, params){
    console.info('addToWorkspace');
    this.addGlobals(view);
    if (this.next){
        this.next.addToWorkspace();
    }
};

Block.prototype.addToSocket = function(view, evt, params){
    console.info('addToSocket(%o, %o, %o)', view, evt, params);
    // which socket?
    var idx = params.dropTarget.parent().find('> .socket, > .autosocket').index(params.dropTarget);
    // add block to value
    window.dropTarget = params.dropTarget;
    var parentModel = params.dropTarget.closest('.wrapper').data('model');
    parentModel.values[idx].addBlock(this);
    // FIXME: update view (currently happens elsewhere)
};

Block.prototype.deleteBlock = function(view, evt, params){
    console.info('deleteBlock(%o, %o, %o)', view, evt, params);
    var holder = view.data('startParent');
    var parentModel = holder.closest('.wrapper').data('model');
    var idx;
    if (holder.is('.socket, .autosocket')){
        idx = holder.parent().find('> .socket, > .autosocket').index(holder);
        console.log('removing from expression socket %s', idx);
        var value = parentModel.values[idx];
        value.value = value.defaultValue;
        value.literal = true;
    }else if (holder.is('.next')){
        console.log('removing from next');
        parentModel.next = null;
    }else if (holder.is('.contained')){
        idx = holder.closest('.block').find('> .contained').index(holder);
        console.log('removing from contained %s', idx);
        console.log('container before: %o', parentModel);
        console.log('contained before: %o', parentModel.contained);
        delete parentModel.contained[idx];
        var len = parentModel.contained.length;
        for (var i = len; len > 0; len--){
            if (parentModel.contained[i-1] !== undefined) break;
            parentModel.contained.length--;
        }
        console.log('container after: %o', parentModel);
        console.log('contained after: %o', parentModel.contained);
    }else if ( holder.is('.scripts_workspace')){
        idx = holder.find('> .wrapper').index(view);
        console.log('removing from workspace %s, position %s', holder.attr('class'), idx);
    }else{
        console.error('What are we removing this from? %o', params.dropTarget);
    }
    this.removeLocalsFromParent();
};

function newBlockHandler(blocktype, args, body, returns){
    console.info('blocktype: %s', blocktype);
    console.info('%s args: %o', args.length, args);
    console.info('body: %o', body);
    console.info('returns: %s', returns);
}

$('.scripts_workspace')
    .on('add_to_script', '.wrapper', function(evt, params){
        var view = $(this);
        view.data('model').addToScript(view, evt, params);
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
    .on('drag_from_expression', '.wrapper', function(evt, params){
        console.log('Dragging value out of expression slot %o', params);
    })
    .on('drag_from_context', '.wrapper', function(evt, params){
        console.log('Dragging block out of context slot %o', params);
    })
    .on('drag_from_sequence', '.wrapper', function(evt, params){
        console.log('Dragging block out of next slot');
    });
    
$('body').on('delete_block', '.wrapper', function(evt, params){
    var view = $(this);
    view.data('model').deleteBlock(view, evt, params);
    return false;
});
