

Block.nextId = 0;

var templates = {};
var compiledTemplates = {};
['step', 'context', 'eventhandler', 'expression'].forEach(function(type){
    compiledTemplates[type] = Mustache.compile($('#' + type + '_template').text());
    templates[type] = function (values){
        return compiledTemplates[type](values);
    };
});

$('.scripts_workspace').delegate('.disclosure', 'click', function(event){
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
    this.returns = {type: 'int', label: 'int##'};
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

Block.prototype.init = function(spec){
    $.extend(this, spec);
    this.signature = signature(this);
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
    return view;
};

Block.prototype.addToScript = function(view, evt){
    console.log('adding view to script, override for contexts');
};

Block.prototype.addToWorkspace = function(view, evt){
    console.log('adding view to workspace, override for contexts');
};

Block.prototype.addToSocket = function(view, evt){
    console.log('adding view to socket, override for expressions');
};

Block.prototype.deleteBlock = function(view, evt){
    console.log('removing block, delete all sub-blocks');
};

$('.wrapper')
    .on('add_to_script', function(evt){
        this.data('model').addToScript(this, evt);
    })
    .on('add_to_workspace', function(evt){
        this.data('model').addToWorkspace(this, evt);
    })
    .on('delete_block', function(evt){
        this.data('model').deleteBlock(this, evt);
    })
    .on('add_to_socket', function(evt){
        this.data('model').addToSocket(this, evt);
    });
