

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
        view.find('.locals > .wrapper').hide();
        view.find('.contained').css('padding-bottom', 0).children().hide();
    }else{
        self.text('▼');
        view.find('.locals > .wrapper').show();
        view.find('.contained').css('padding-bottom', 10).children().show();
    }
    self.toggleClass('open closed');
});

function choiceFunction(s, listname, default_opt){
    // TODO: Convert this to a template
    var list = choiceLists[listname];
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
            


function label(value, disclosure){
    // TODO: Convert this to a template
    //
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
    value = value.replace(/(?:\[choice\:)(\w+)(?:\:)(\w+)(?:\])/gm, choiceFunction);
    value = value.replace(/(?:\[choice\:)(\w+)(?:\])/gm, choiceFunction);
    // match selector [^\[\]] should match any character except '[', ']', and ':'
    value = value.replace(/\[([^\[\]\:]+):([^\[\]]+)\]/gm, '<span class="value $1 socket" data-type="$1"><input type="$1" value="$2"></span>');
    value = value.replace(/\[([^\[\]:]+)\]/gm, '<span class="value $1 socket" data-type="$1"><input type="$1"></span>');
    value = value.replace(/##/gm, '');
    if (disclosure){
        return '<div class="value"><span class="disclosure open">▼</span>' + value + '</div>';
    }else{
        return '<div class="value">' + value + '</div>';
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
        alert('Error: expression "' + model.label + '" treated as a step');
    }
    if (model.contained){
        alert('Error: context "' + model.contained[0].label + '" treated as a step');
    }
}

function assertExpression(model){
    if (! model.type){
        alert('Error: step "' + model.label + '" treated as an expression');
    }
    if (model.contained){
        alert('Error: context "' + model.contained[0].label + '" treated as an expression');
    }
}

function assertContext(model){
    if (model.containers){
        alert('Error: context with containers vs. contained');
        console.log('Error context: %o', model);
    }
    if (! model.contained){
        alert('Error: block "' + model.label + '" treated as a context');
        console.log('Error context: %o', model);
    }
}

function signature(model){
    var type = model.blocktype;
    var label = model.label || model.contained.map(function(sub){ return sub.label; }).join('|');
    return type + ':' +  label;
}

var scripts = {};
function registerScript(model){
    if (scripts[model.signature]){
        console.log('Warning: overwriting existing scripts for %s', model.signature);
    }
    scripts[model.signature] = model.script;
    delete model.script;
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
            alert('Warning: unsupported block type: ' + model.blocktype);
            console.log('Unsupported blocktype: %o', model);
            return null;
    }
}

Block._nextId = 0;
Block.newId = function(){
    Block._nextId++;
    return Block._nextId;
};

Block.prototype.init = function(spec){
    $.extend(this, spec);
    this.signature = signature(this);
    this._allViews = [];
    registerScript(this);
    if (this.label){
        this.label = label(this.label);
    }else{
        this.contained.forEach(function(contained, idx){
            contained.label = label(contained.label, !idx);
        });
    }
    if (this.locals){
        this.locals = this.locals.map(function(spec){
            return new Expression(spec);
        });
    }
    if (this.returns && !this.returns.signature){
        if (this.returns === 'block'){
            // special user-defined block handler
        }else{
            this.returns = Block(this.returns);
        }
    }
    this.template = templates[this.blocktype];
};

Block.prototype.view = function(){
    var view = $(this.template(this));
    view.data('model', this);
    if (this.locals){
        var localContainer = view.find('.locals');
        this.locals.forEach(function(local){
            localContainer.append(local.view());
        });
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

Block.prototype.setId = function(id){
    this.id = id;
    this._allViews.forEach(function(view){
        view.id(id);
    });
    if (this.label){
        // set label
    }else{
        // set contained labels
    }
    // FIXME: set id in scripts too?
    if (this.returns && this.returns.signature){
        this.returns.setId(id);
    }
    if (this.locals.length){
        this.locals.forEach(function(local){
            local.setId(id);
        });
    }
};

Block.prototype.generateId = function(view){
    if (!((this.locals && this.locals.length) || (this.returns && this.returns.signature))) return;
    if (this.id){
        this.setId(Block.newId());
    }
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
    returnView.id(this.id);
    view.parent_block().addLocalBlock(returnView);
    view.next_block().trigger('add_to_script');
};

Block.prototype.removeLocalsFromParent = function(){
    if (!(this.returns && this.returns.signature)) return;
    this.returns.deleteViews();
};

Block.prototype.addToScript = function(view, evt){
    console.log('addToScript');
    this.generateId(view);
    this.addLocalsToParentContext(view);
};

Block.prototype.addToWorkspace = function(view, evt){
    console.log('addToWorkspace');
    this.generateId(view);
    this.removeLocalsFromParent();
};

Block.prototype.addToSocket = function(view, evt){
};

Block.prototype.deleteBlock = function(view, evt){
    this.removeLocalsFromParent();
};

function newBlockHandler(blocktype, args, body, returns){
    console.log('blocktype: %s', blocktype);
    console.log('%s args: %o', args.length, args);
    console.log('body: %o', body);
    console.log('returns: %s', returns);
};

$('.scripts_workspace')
    .on('add_to_script', '.wrapper', function(evt){
        var view = $(this);
        view.data('model').addToScript(view, evt);
        return false;
    })
    .on('add_to_workspace', '.wrapper', function(evt){
        var view = $(this);
        view.data('model').addToWorkspace(view, evt);
        return false;
    })
    .on('delete_block', '.wrapper', function(evt){
        var view = $(this);
        view.data('model').deleteBlock(view, evt);
        return false;
    })
    .on('add_to_socket', '.wrapper', function(evt){
        var view = $(this);
        view.data('model').addToSocket(view, evt);
        return false;
    });
