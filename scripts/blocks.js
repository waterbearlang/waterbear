

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
    textLabel = textLabel.replace(/##/, '');

    this.valueSlots = textLabel.match(/\[.+?\]/g) || [];
    var htmlLabel = textLabel;
    if (!this.values && this.valueSlots.length){
        this.values = this.valueSlots.map(function(slot){ return new Value(slot);});
    }
    this.valueSlots.forEach(function(slot, idx){
        htmlLabel = htmlLabel.replace(slot, self.values[idx].view());
    });
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
                this.value = !! this.value === 'true';
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

function signature(model){
    return model.blocktype + ': ' + model.spec.labels.join(', ');
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
        console.('Warning: overwriting existing scripts for %s', model.signature);
    }
    Block.registry[model.signature] = model;
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
    this.labels = this.labels.map(function(labelspec){
        return labelspec.replace(/##/g, self.id ? '_' + self.id : '');
    });
    this.signature = signature(this);
    this._allViews = [];
    this.script = this.script.replace(/##/g, '_' + self.id);
    Block.registerBlock(this);
    this.labels = this.labels.map(function(labelspec){
        return self.parseLabel(labelspec);
    });
    if (!this.isTemplateBlock){
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
    }
    this.template = templates[this.blocktype];
    if (!this.isTemplateBlock){
        this.initInstance();
    }
};

Block.prototype.initInstance = function(){
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
    if (this.spec.values && this.spec.values.length){
        this.values = this.spec.values.map(function(value){
            var val = new Value(value.type);
            if (value.value.signature){
                val.addBlock(Block(value.value));
            }else{
                val.value = value.value;
            }
            return val;
        });
    }else{
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
    var view = $(this.template(this));
    view.data('model', this);
    if (!this.isTemplateBlock){
        if (this.locals){
            var localContainer = view.find('.locals');
            this.locals.forEach(function(local){
                localContainer.append(local.view());
            });
        }
        this.contained.forEach(function(contained){
            view.find('> .contained').append(contained.view());
        });
        this.values.forEach(function(value, idx){
            view.find('> .socket').eq(idx).append(value.view());
        });
        if (this.next){
            view.find('> .next').append(this.next.view());
        }
    }
    this._allViews.push(view);
    return view;
};

Block.prototype.deleteViews = function(){
    this._allViews.forEach(function(view){
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
    console.trace('addToScript');
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
    console.trace('addToWorkspace');
    this.addGlobals(view);
    if (this.next){
        this.next.addToWorkspace();
    }
};

Block.prototype.addToSocket = function(view, evt, params){
    console.trace('addToSocket(%o, %o, %o)', view, evt, params);
    // which socket?
    var idx = params.dropTarget.parent().find('> .socket, > .autosocket').index(params.dropTarget);
    console.trace('socket index: %s', idx);
    // add block to value
    window.dropTarget = params.dropTarget;
    var parentBlock = params.dropTarget.closest('.wrapper').data('model');
    parentBlock.values[idx].addBlock(this);
    // update view (currently happens elsewhere)
};

Block.prototype.deleteBlock = function(view, evt, params){
    this.removeLocalsFromParent();
};

function newBlockHandler(blocktype, args, body, returns){
    console.trace('blocktype: %s', blocktype);
    console.trace('%s args: %o', args.length, args);
    console.trace('body: %o', body);
    console.trace('returns: %s', returns);
};

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
    .on('delete_block', '.wrapper', function(evt, params){
        var view = $(this);
        view.data('model').deleteBlock(view, evt, params);
        return false;
    })
    .on('add_to_socket', '.wrapper', function(evt, params){
        var view = $(this);
        view.data('model').addToSocket(view, evt, params);
        return false;
    });
