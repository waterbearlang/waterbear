// jQuery-based templates
//
// context is current container
// data-if="<condition>"
// data-for="<variable> in <list>"
// data-replace="variable" // variable.view() or variable.view or variable


// Dammit, I need all the find() methods to be depth-first and to skip the inner
// versions if the outer versions have already run (especially data-if)

(function(){
	
	window.debug = false;
	function print(){
		if (debug){
			console.log.apply(console, arguments);
		}
	}
	
	function h(node){
		if (node.length){
			return node[0].outerHTML;
		}else{
			return '';
		}
	}
	
	function j(obj){
		try{
			return JSON.stringify(obj);
		}catch(e){
			return 'cannot stringify ' + obj;
		}
	}
	
	// fn should return the node walked. If it is replaced in place, return the new node.
	function walk(node, fn){
		var previous = node.prev();
		if (!previous.length){
			previous = node.parent();
		}
		var oldContext = node.data('context'); // maintain contexts as a stack
		node = fn(node);
		if (!node.length){
			node = previous;
		} if (oldContext){
			node.data('context', oldContext);
		}
		var child = node.children().first();
		while(child.length){
			child = walk(child, fn).next();
		}
		return node;
	}

function template(name){
	if (!name || name === ''){
		throw new Exception('You must pass a name to retrieve a template by name');
	}
	if (!template.templates[name]){
		var tmpl = new Template({name: name});
		template.templates[name] = function(model){return tmpl.render(model);};
	}
	return template.templates[name];
}
template.templates = {};

function Template(opts){
	if (opts.name){
		this.tmpl = $($('#' + opts.name + '_template').text());
	}else if(opts.html){
		this.tmpl = $(opts.html);
	}else if(opts.jquery){
		this.tmpl = opts.jquery;
	}
}

Template.prototype.render = function(model){
	var tmpl = this.tmpl.clone();
//	print('model: %s', j(model));
	tmpl.data('context', model);
	walk(tmpl, renderNode);
	return tmpl;
}

function renderNode(node){
//	print('start render %s', h(node));
	var hasParent = node.parent().length;
	if (!node.data('context')){
		var context = node.parent().data('context');
		// if (!context){
		// 	print('node %s has no context', h(node));
		// }
		node.data('context', context);
	}
	node = renderFor(node);
	node = renderIf(node);
	node = renderClasses(node);
	node = renderTitle(node);
	node = renderReplace(node);
//	print('end render: %s', h(node));
	return node;
}

function renderClasses(node){
	var newClasses = node.data('classes');
	if (newClasses){
		newClasses.split(/\s/).forEach(function(key){
			node.addClass(namedValue(node.data('context'), key));
		});
		node.removeAttr('data-classes');
	}
	return node;
}

function renderTitle(node){
	var titleKey = node.data('title');
	if (titleKey){
		node.attr('title', namedValue(node.data('context'), titleKey));
		node.removeAttr('data-title');
	}
	return node;
}

function renderIf(node){
	var ifKey = node.data('if');
	if (ifKey){
		// print('\tbefore if: %s', h(node));
		var test = namedValue(node.data('context'), ifKey);
		if (test){
			node.removeAttr('data-if');
			// print('\t\ttest %s=%s passed: %s', ifKey, test, h(node));
			return node;
		}else{
			// print('\t\ttest %s=%s failed', ifKey, test);
			node.remove();
			return $();
		}
	}
	return node;
};


function renderFor(node){
	var forKey = node.data('for');
	if (forKey){
		// print('\tbefore for: %s', h(node));
		var test = forKey.match(/(.+) in (.+)/);
		var listname = test[2];
		var eachname = test[1];
		node.removeAttr('data-for');
		var values = $();
		var context = node.data('context');
		var tmpl = new Template({jquery: node});
		var list = namedValue(context, listname);
		print('list %s: %s (from context: %o)', listname, j(list), context);
		if (list.jquery){
			list = list.get();
		}
		list.forEach(function(value, idx){
			// print('\t\trendering for #%s %s = %s', idx, eachname, j(value));
			var local_context = $.extend({}, context); // start with a shallow copy of context
			local_context[eachname] = value;
			// print('\n\nlocal_context: %s', j(local_context));
			var renderedValue = tmpl.render(local_context);
			values = values.add(renderedValue);
		});
		node.replaceWith(values);
		if (values.length){
			return values.eq(0);
		}else{
			return $();
		}
	}
	return node;
};

function renderReplace(node){
	var replaceKey = node.data('replace');
	if (replaceKey){
		print('renderReplace(%s, %s)', h(node), j(node.data('context')));
		node.removeAttr('data-replace')
		print('\tbefore replace: %o', h(node));
		node.replaceWith(namedValue(node.data('context'), replaceKey));
		return $();
	}
	return node;
};


function first(path){
	return path.split('.', 1);
}

function rest(path){
	var arr = path.split('.');
	arr.shift();
	return arr.join('.');
}

function namedValue(context, name){
	var retVal;
	if(name === undefined) return '';
	if (name.indexOf('.') > -1){
		// recursively walk the object to get the value
		return namedValue(namedValue(context, first(name)), rest(name));
	}
	else if (context[name]){
		var v = context[name];
		if (v.view){
			try{
				retVal = v.view();
			}catch(e){
				retVal = v.view;
			}
		}else{
			retVal = v;
		}
	}else{
		retVal = '';
	}
	return retVal;
}

template.Template = Template;
window.template = template;

})();