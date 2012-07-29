

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

function choiceFunction(s, listname, default_opt){
    // TODO: Convert this to a template
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
            


function Label(value, disclosure){
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

var models = [];

function Step(mod, scope){
    var model = {
        returns: false
    };
    $.extend(model, mod);
    model.label = Label(model.label);
    model.view = $(templates.step(model));
    model.view.data('model', model);
    // models.push(model);
    return  model.view;
}

function Expression(mod, scope){
    var model = {
        returns: {type: 'int', label: 'int##'}
    };
    $.extend(model, mod);
    model.label = Label(model.label);
    model.view = $(templates.expression(model));
    model.view.data('model', model);
    // models.push(model);
    return  model.view;
}

function Context(mod, scope){
    var model = {
        contained: [],
        locals: []
    };
    $.extend(model, mod);
    for (var i = 0; i < model.contained.length; i++){
        var container = model.contained[i];
        container.label = Label(container.label, true);
    }
    model.view = $(templates.context(model));
    model.view.data('model', model);
    if (model.locals){
        for (var j = 0; j < model.locals.length; j++){
            var local = Expression(model.locals[j]);
            model.locals[j] = local.data('model');
            model.view.find('.locals').append(local);
        }
    }
    return  model.view;
}

function EventHandler(mod, scope){
    var model = {
        locals: [],
        contained: []
    };
    $.extend(model, mod);
    for (var i = 0; i < model.contained.length; i++){
        var container = model.contained[i];
        container.label = Label(container.label, true);
    }
    model.view = $(templates.eventhandler(model));
    model.view.data('model', model);
    if (model.locals){
        for (var j = 0; j < model.locals.length; j++){
            var local = Expression(model.locals[j]);
            model.locals[j] = local.data('model');
            model.view.find('.locals').append(local);
        }
    }
    return  model.view;
}

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

function Signature(model){
    var type = model.blocktype;
    var label = model.label || model.contained.map(function(sub){ return sub.label; }).join('|');
    return type + ':' +  label;
}

var scripts = {};
function registerScript(model){
    model.signature = Signature(model);
    if (scripts[model.signature]){
        console.log('Warning: overwriting existing scripts for %s', model.signature);
    }
    scripts[model.signature] = model.script;
    delete model.script;
}

function Block(model, scope){
    registerScript(model);
    switch(model.blocktype){
        case 'step':
            assertStep(model);
            return Step(model, scope);
        case 'expression':
            assertExpression(model);
            return Expression(model, scope);
        case 'context':
            assertContext(model);
            return Context(model, scope);
        case 'eventhandler':
            assertContext(model);
            return EventHandler(model, scope);
        default:
            alert('Warning: unsupported block type: ' + model.blocktype);
            console.log('Unsupported blocktype: %o', model);
    }
}


