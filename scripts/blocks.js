

Block.nextId = 0;

var templates = {};
var compiledTemplates = {};
['step', 'context', 'eventhandler', 'expression'].forEach(function(type){
    compiledTemplates[type] = Mustache.compile($('#' + type + '_template').text());
    templates[type] = function (opts){
        window.opts = opts;
        return compiledTemplates[type](opts);
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

function Step(options, scope){
    var opts = {
        returns: false
    };
    $.extend(opts, options);
    opts.label = Label(opts.label);
    opts.view = $(templates.step(opts));
    opts.view.data('model', opts);
    // models.push(opts);
    return  opts.view;
}

function Expression(options, scope){
    var opts = {
        returns: {type: 'int', label: 'int##'}
    };
    $.extend(opts, options);
    opts.label = Label(opts.label);
    opts.view = $(templates.expression(opts));
    opts.view.data('model', opts);
    // models.push(opts);
    return  opts.view;
}

function Context(options, scope){
    var opts = {
        contained: [],
        locals: []
    };
    $.extend(opts, options);
    for (var i = 0; i < opts.contained.length; i++){
        var container = opts.contained[i];
        container.label = Label(container.label, true);
    }
    opts.view = $(templates.context(opts));
    opts.view.data('model', opts);
    if (opts.locals){
        for (var j = 0; j < opts.locals.length; j++){
            opts.locals[j] = Expression(opts.locals[j]);
            opts.view.find('.locals').append(opts.locals[j]);
        }
    }
    return  opts.view;
}

function EventHandler(options, scope){
    var opts = {
        locals: [],
        contained: []
    };
    $.extend(opts, options);
    for (var i = 0; i < opts.contained.length; i++){
        var container = opts.contained[i];
        container.label = Label(container.label, true);
    }
    opts.view = $(templates.eventhandler(opts));
    opts.view.data('model', opts);
    if (opts.locals){
        for (var j = 0; j < opts.locals.length; j++){
            opts.locals[j] = Block(opts.locals[j]);
            opts.view.find('.locals').append(opts.locals[j]);
        }
    }
    return  opts.view;
}

function assertStep(options){
    if (options.type){
        alert('Error: expression "' + options.label + '" treated as a step');
    }
    if (options.contained){
        alert('Error: context "' + options.contained[0].label + '" treated as a step');
    }
}

function assertExpression(options){
    if (! options.type){
        alert('Error: step "' + options.label + '" treated as an expression');
    }
    if (options.contained){
        alert('Error: context "' + options.contained[0].label + '" treated as an expression');
    }
}

function assertContext(options){
    if (options.containers){
        alert('Error: context with containers vs. contained');
        console.log('Error context: %o', options);
    }
    if (! options.contained){
        alert('Error: block "' + options.label + '" treated as a context');
        console.log('Error context: %o', options);
    }
}



function Block(options, scope){
    switch(options.blocktype){
        case 'step':
            assertStep(options);
            return Step(options, scope);
        case 'expression':
            assertExpression(options);
            return Expression(options, scope);
        case 'context':
            assertContext(options);
            return Context(options, scope);
        case 'eventhandler':
            assertContext(options);
            return EventHandler(options, scope);
        default:
            alert('Warning: unsupported block type: ' + options.blocktype);
            console.log('Unsupported blocktype: %o', options);
    }
}


