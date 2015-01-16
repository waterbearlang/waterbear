// Revised Block handling.
//
// Moving to custom elements
//
// A wb- or wb-expression can only contain wb-arguments, wb-locals, and/or text
// A wb-context, wb-toplevel, or wb-workspace must also contain wb-contents, wb-locals
// Some elements can be implied, like in HTML: when you don't include a header it goes in anyway?
// So you could make a context with multiple wb-contains, but by default there would be one even
// if you don't put it there explicitly.
//
// Or should we avoid that kind of magic? I think if it is documented it might be OK and help keep
// the code readable.

(function(){
'use strict';
    var elem = dom.html;
    var workspace = dom.find(document.body, 'wb-workspace');

// Utility

// FIXME: insert this into the document rather than including in markup
var svgText = document.querySelector('.resize-tester');
function resize(input){
    if (!input){
        console.err('No input');
        return;
    }
    var textStyle = window.getComputedStyle(input);
    svgText.style.fontFamily = textStyle.fontFamily;
    svgText.style.fontSize = textStyle.fontSize;
    svgText.style.fontWeight = textStyle.fontWeight;
    svgText.textContent = input.value || '';
    var textwidth = svgText.getComputedTextLength();
    input.style.width = Math.max((textwidth + 15), 30) + 'px';
}

// If the markup doesn't contain this element, add it
// This is like how tables will insert <thead> elements
// if they are left out
function setDefaultByTag(element, tagname, top){
    var test = dom.child(element, tagname);
    if (!test){
        test = elem(tagname);
        if (top){
            element.insertBefore(test, element.firstChild);
        }else{
            element.appendChild(test);
        }
    }
    return test;
}

// Make sure these elements are always inserted into a header element
// and that the header element exists
function insertIntoHeader(){
    var parent = this.parentElement.tagName.toLowerCase();
    if (parent === 'header' || parent === 'wb-row') return;
    var block = dom.closest(this, 'wb-step, wb-context, wb-expression');
    var head = setDefaultByTag(block, 'header');
    head.appendChild(this, true);
};

/*****************
*
*  BlockProto
*
*  Not actually instantiated, but used as a superclass for other blocks
*
******************/

var BlockProto = Object.create(HTMLElement.prototype);
BlockProto.createdCallback = function blockCreated(){
    // Add required structure
    setDefaultByTag(this, 'header', true);
    // console.log('%s created with %s children', this.tagName.toLowerCase(), this.children.length);
};
BlockProto.attachedCallback = function blockAttached(){
    // Add locals
    // Make sure they have unique names in scope
    // Handle special cases:
    // 1) Added to socket of iteration, add iterationLocals
    //    Are there other expression blocks that add locals?
    // 2) Added to contains of setup block, add globally (to file)
    // 3) Otherwise, when added to contains add to locals view of closest context
    if (dom.matches(this.parentElement, 'wb-contains')) return;
    var parent = dom.parent(this, 'wb-context');
    if (parent){
        setDefaultByTag(parent, 'wb-contains').appendChild(this);
    }else{
        // console.warn('free-floating block: %o, OK for now', this);
    }
    // console.log('%s attached', this.tagName.toLowerCase());
};
BlockProto.detachedCallback = function blockDetached(){
    // Remove locals
    // console.log('%s detached', this.tagName.toLowerCase());
};
BlockProto.attributeChangedCallback = function(attrName, oldVal, newVal){
    // Attributes to watch for:
    //    group or class (do nothing)
    //    title or help (do nothing)
    //    script (do nothing)
    //    type (do nothing
    // console.log('%s[%s] %s -> %s', this.tagName.toLowerCase(), attrName, oldVal, newVal);
};
BlockProto.gatherValues = function(scope){
    if (!this.values){
        this.values = dom.children(dom.child(this, 'header'), 'wb-value[type], wb-value[value], wb-row');
    }
    return this.values.map(function(value){
        return value.getValue(scope);
    });
};

/*****************
*
*  wb-step
*
*  Instantiated as new WBStep or as <wb-step>
*
*  Attributes: class, id, script (mandatory)
*
*  Children: wb-value
*
******************/

var StepProto = Object.create(BlockProto);
StepProto.run = function(scope){
    if (!this.fn){
        var fnName = this.getAttribute('script').split('.');
        this.fn = runtime[fnName[0]][fnName[1]];
    }
    // console.log('calling step %s with scope %s, values %o', this.getAttribute('script'), scope, this.gatherValues(scope));
    return this.fn.apply(scope, this.gatherValues(scope));
};
window.WBStep = document.registerElement('wb-step', {prototype: StepProto});

// Context Proto
// Instantiated as new WBContext or as <wb-context>

/*****************
*
*  wb-context
*
*  Instantiated as new WBContext or as <wb-context>
*
*  Attributes: class, id, script (mandatory)
*
*  Children: wb-value, wb-disclosure, wb-locals, wb-contains
*
******************/

var ContextProto = Object.create(BlockProto);
ContextProto.createdCallback = function contextCreated(){
    // Add disclosure, contained, local
    BlockProto.createdCallback.call(this);
    var header = dom.child(this, 'header');
    setDefaultByTag(header, 'wb-disclosure');
    setDefaultByTag(this, 'wb-local');
    setDefaultByTag(this, 'wb-contains');
    // console.log('Context created');
};
ContextProto.gatherContains = function(){
    // returns an array of arrays of blocks (steps and contexts)
    return dom.children(this, 'wb-contains').map(function(container){
        return [].slice.call(container.children);
    });
}
ContextProto.run = function(parentScope){
    if (!this.fn){
        var fnName = this.getAttribute('script').split('.');
        this.fn = runtime[fnName[0]][fnName[1]];
    }
    var scope = util.extend({}, parentScope);
    // expressions are eagerly evaluated against scope, contains are late-evaluated
    // I'm not yet sure if this is the Right Thing™
    // console.log('calling context %s with scope %o, values %o', this.getAttribute('script'), scope, this.gatherValues(scope));
    return this.fn.call(scope, this.gatherValues(scope), this.gatherContains());
};
ContextProto.showLocals = function(evt){
    // This is way too specific to the needs to the loopOver block
    var blockAdded = evt.detail;
    if (blockAdded && blockAdded.tagName.toLowerCase() === 'wb-expression'){
        var type = blockAdded.getAttribute('type');
        var header = dom.child(this, 'header');
        if (!header){
            return;
        }
        var row = dom.child(header, 'wb-row');
        if (!row){
            return;
        }
        var locals = dom.children(row, 'wb-local[fortype]');
        locals.forEach(function(local){
            var localtypes = local.getAttribute('fortype').split(',');
            if (localtypes.indexOf(type) > -1 || localtypes.indexOf('any') > -1){
                local.classList.add('show');
            }
        });
    }
};
ContextProto.hideLocals = function(evt){
    // This is way too specific to the needs to the loopOver block
    var blockAdded = evt.detail;
    if (blockAdded && blockAdded.tagName.toLowerCase() === 'wb-expression'){
        var header = dom.child(this, 'header');
        if (!header) return;
        var row = dom.child(header, 'wb-row');
        if (!row) return;
        var locals = dom.children(row, 'wb-local[fortypes]');
        locals.forEach(function(local){
            local.classList.remove('show');
        });
    }
};

window.WBContext = document.registerElement('wb-context', {prototype: ContextProto});

Event.on(document.body, 'wb-added', 'wb-context', function(evt){ evt.target.showLocals(evt); });
Event.on(document.body, 'wb-added', 'wb-context', function(evt){ evt.target.hideLocals(evt); });
/*****************
*
*  wb-expression
*
*  Instantiated as new WBExpression or as <wb-expression>
*
*  Attributes: class, id, script (mandatory), type (mandatory)
*
*  Children: wb-value
*
******************/

var typeMapping = {
    number: 'math',
    text: 'text',
    color: 'color',
    'boolean': 'boolean',
    'array': 'array',
    'object': 'object',
    'any': 'control',
    sprite: 'sprite',
    sound: 'sound',
    image: 'image',
    shape: 'shape',
    vector: 'vector',
    path: 'path',
    point: 'point',
    rect: 'rect'
};

var ExpressionProto = Object.create(HTMLElement.prototype);
ExpressionProto.createdCallback = function expressionCreated(){
    // console.log('Expression created');
    var header = setDefaultByTag(this, 'header', true);
    if (this.getAttribute('context') === 'true'){
        setDefaultByTag(this, 'wb-disclosure');
    }
};
ExpressionProto.attachedCallback = function expressionAttached(){
    this.parent = this.parentElement;
    var siblings = dom.children(this.parent, 'input, select');
    if (siblings.length){
        siblings.forEach(function(sib){
            sib.classList.add('hide');
        });
    }
    if (this.parent.tagName.toLowerCase() !== 'wb-local'){
        var blockParent = dom.closest(this.parent, 'wb-expression, wb-step, wb-context');
        if (blockParent){
            Event.trigger(blockParent, 'wb-added', this);
        }
    }

};
ExpressionProto.detachedCallback = function expressionDetached(){
   var siblings = dom.children(this.parent, 'input, select');
    if (siblings.length){
        siblings.forEach(function(sib){
            sib.classList.remove('hide');
        });
    }
    if (this.parent.tagName.toLowerCase() !== 'wb-local'){
        var blockParent = dom.closest(this.parent, 'wb-expression, wb-step, wb-context');
        if (blockParent){
            Event.trigger(blockParent, 'wb-removed', this);
        }
    }
    this.parent = null;
};
ExpressionProto.gatherValues = BlockProto.gatherValues;
ExpressionProto.run = function(scope){
    if (!this.fn){
        var fnName = this.getAttribute('script').split('.');
        this.fn = runtime[fnName[0]][fnName[1]];
    }
    // console.log('calling expression %s with scope %o and values %o', this.getAttribute('script'), scope, this.gatherValues(scope));
    return this.fn.apply(scope, this.gatherValues(scope));
};


window.WBExpression = document.registerElement('wb-expression', {prototype: ExpressionProto});

/*****************
*
*  wb-unit
*
*  Instantiated as new WBUnit or as <wb-unit>
*
*  Attributes: type: list or name (default: name)
*
*  Units are meant to be used with wb-values to give more context than simply "number"
*
******************/

var UnitProto = Object.create(HTMLElement.prototype);
// UnitProto.attachedCallback = function unitAttached(){
//     if (this.nextElementSibling){
//         this.parentElement.appendChild(this); // move to end of value, after the input
//     }
// };
window.WBUnit = document.registerElement('wb-unit', {prototype: UnitProto});

/*****************
*
*  wb-row
*
*  Instantiated as new WBRow or as <wb-row>
*
*  Rows can be used wherever a <wb-value> could go. They are used to group
*  values, units, and locals on a single line when they belong together.
*
******************/
var RowProto = Object.create(HTMLElement.prototype);
RowProto.getValue = function(scope){
    var values = dom.children(this, 'wb-value[type]:not(.hide)');
    if (values.length == 1){
        return values[0].getValue(scope);
    }else if (values.length > 1){
        return values.map(function(value){ return value.getValue(scope); });
    }
    return null;
}
RowProto.attachedCallback = insertIntoHeader;
window.WBRow = document.registerElement('wb-row', {prototype: RowProto});


/*****************
*
*  wb-disclosure
*
*  Instantiated as new WBDisclosure or as <wb-disclosure>
*
*  Attributes: closed (true/false)
*
******************/

var DisclosureProto = Object.create(HTMLElement.prototype);
DisclosureProto.attachedCallback = insertIntoHeader;
window.WBDisclosure = document.registerElement('wb-disclosure', {prototype: DisclosureProto});

function toggleClosed(evt){
    console.log('toggle');
    var block = dom.closest(evt.target, 'wb-step, wb-context, wb-expression');
    console.log('%s closed = %s', block.tagName.toLowerCase(), block.getAttribute('closed'));
    if (block.hasAttribute('closed')){
        block.removeAttribute('closed');
    }else{
        block.setAttribute('closed', true);
    }
}

Event.on(workspace, 'click', 'wb-disclosure', toggleClosed);

/*****************
*
*  wb-local
*
*  Instantiated as new WBLocals or as <wb-local>
*
*  Children: wb-expression
*
*  Local holds a single expression block, acting as a tiny blockmenu of one, inline to another block
*
******************/

var LocalProto = Object.create(HTMLElement.prototype);
LocalProto.run = StepProto.run;
LocalProto.attachedCallback = insertIntoHeader;
window.WBLocal = document.registerElement('wb-local', {prototype: LocalProto});

/*****************
*
*  .add-item button
*
*  Just a button with a class, adds a new row to an expression context
*
******************/

function addItem(evt){
    var self = evt.target;
    var template = dom.closest(self, 'wb-row');
    // we want to clone the row and it's children, but not their contents
    var newItem = template.cloneNode(true);
    template.parentElement.insertBefore(newItem, template.nextElementSibling);
}

Event.on(document.body, 'click', 'wb-contains .add-item', addItem);

/*****************
*
*  .remove-item button
*
*  Just a button with a class, removes a row from an expression context
*
******************/

function removeItem(evt){
    console.log('removing a row');
    var self = evt.target;
    var row = dom.closest(self, 'wb-row');
    // we want to remove the row, but not if it is the last one
    if (row.previousElementSibling || row.nextElementSibling){
        row.parentElement.removeChild(row);
    }
}

Event.on(document.body, 'click', 'wb-contains .remove-item', removeItem);



/*****************
*
*  wb-value
*
*  Instantiated as new WBValue or as <wb-value>
*
*  Attributes: class, id, type (mandatory, can be comma-separated list), value, min, max
*
*  Children: text, input, select, wb-expression
*
******************/


var ValueProto = Object.create(HTMLElement.prototype);
ValueProto.createdCallback = function valueCreated(){
    // Add holder, input or select, or block
    // console.log('Value created');
    // See if we're already initialized (if cloned, for instance)
    var value = this.getAttribute('value');
    var input;
    if (dom.child(this, 'input, select, wb-expression')){
        if (value){
            input = dom.child(this, 'input, select');
            if (input){
                input.value = value;
            }
        }
        return;
    }
    var types = (this.getAttribute('type') || '').split(',');
    var input;
    switch(types[0]){
        // FIXME: Support multiple types on a value (comma-separated)
        case 'number':
        case 'text':
        case 'color':
            input = elem('input', {type: types[0]});
            if (this.hasAttribute('min')){
                input.setAttribute('min', this.getAttribute('min'));
            }
            if (this.hasAttribute('max')){
                input.setAttribute('max', this.getAttribute('max'));
            }
            this.appendChild(input);
            input.value = value;
            break;
        case 'list':
            var list = this.getAttribute('options').split(',');
            input = dom.createSelect(list, value);
            this.appendChild(input);
            break;
        case 'boolean':
            input = dom.createSelect(['true', 'false'], value);
            this.appendChild(input);
            break;
        case 'any':
            input = elem('input', {type: 'any'});
            this.appendChild(input);
            if (input !== ''){
                input.value = value;
            }
            break;
        default:
            if (types.length && types[0] !== ''){
                // block types, only drop blocks of proper type, no direct input
                input = elem('input', {type: types[0]});
                this.appendChild(input);
                input.readOnly = true;
            }
            break;
    }
    if (input){
        resize(input);
    }
};
ValueProto.getValue = function(scope){
    var block = dom.child(this, 'wb-expression');
    if (block){
        if (block.run(scope) === undefined){
            // throw new Error('expressions cannot return undefined');
        }
        return block.run(scope);
    }
    var input = dom.child(this, 'input, select');
    if (!this.type){
        this.type = this.getAttribute('type') || 'text';
    }
    var value;
    if (input){
        value = input.value;
    }else{
        value = this.getAttribute('value');
    }
    if (convert[this.type]){
        return convert[this.type](value);
    }else{
        return value;
    }
};
ValueProto.attachedCallback = insertIntoHeader;
window.WBValue = document.registerElement('wb-value', {prototype: ValueProto});

Event.on(document.body, 'change', 'wb-contains input, wb-contains select', function(evt){
    dom.closest(evt.target, 'wb-value').setAttribute('value', evt.target.value);
});

var convert = {
    boolean: function(text){ return text === 'true'; },
    number: function(text){ return +text; },
    any: function(text){return util.isNumber(text) ? +text : text; }
};

var ContainsProto = Object.create(HTMLElement.prototype);
window.WBContains = document.registerElement('wb-contains', {prototype: ContainsProto});


/* DRAGGING */

var dragTarget = null;
var origTarget = null;
var dragStart = '';
var dropTarget = null;
var BLOCK_MENU = document.querySelector('sidebar');
var blockTop = 0;

Event.on(document.body, 'drag-start', 'wb-step, wb-step *, wb-context, wb-context *, wb-expression, wb-expression *', function(evt){
    origTarget = dom.closest(evt.target, 'wb-step, wb-context, wb-expression');
    // Maybe move to object notation later
    //    return target.startDrag(evt);

    // Show trash can, should be in app.js, not block.js
    blockTop = BLOCK_MENU.scrollTop;
    BLOCK_MENU.classList.add('trashcan');

    // FIXME: Highlight droppable places (or grey out non-droppable)

    dragTarget = origTarget.cloneNode(true);
    document.body.appendChild(dragTarget);
    dragStart = dom.matches(origTarget, 'wb-contains *') ? 'script' : 'menu';
    if (origTarget.parentElement.nodeName.toLowerCase() === 'wb-local'){
        dragStart = 'menu';
    }
    if (dragStart === 'script'){
        origTarget.classList.add('singularity');
    }
    dragTarget.classList.add('dragging');
    dragTarget.style.left = (evt.pageX - 15) + 'px';
    dragTarget.style.top = (evt.pageY - 15) + 'px';
});

Event.on(document.body, 'dragging', null, function(evt){
    if (!dragTarget){ return; }
    // console.log('block dragging ' + dragTarget.tagName.toLowerCase() + ' (' + evt.pageX + ', ' + evt.pageY + ') %o', evt);
    dragTarget.style.left = (evt.pageX - 15) + 'px';
    dragTarget.style.top = (evt.pageY - 15) + 'px';
    var potentialDropTarget = document.elementFromPoint(evt.pageX, evt.pageY);
    if (potentialDropTarget.matches('sidebar, sidebar *')){
        dropTarget = BLOCK_MENU;
        app.warn('drop here to delete block(s)');
        return;
    }
    if (dragTarget.matches('wb-expression')){
        // FIXME
        dropTarget = dom.closest(potentialDropTarget, 'wb-value[type]');
        if (dropTarget){
            if (dom.child(dropTarget, 'wb-expression')){
                app.warn('cannot drop an expression on another expression');
                dropTarget = null;
                return;
            }
            if (dom.child(dropTarget, 'select')){
                app.warn('cannot currently drop an expression on a drop-down');
                dropTarget = null;
                return;
            }
            var dropTypes = dropTarget.getAttribute('type').split(','); // FIXME: remove excess whitespace
            var dragType = dragTarget.getAttribute('type');
            if (dropTypes.indexOf('any') > -1 || dropTypes.indexOf(dragType) > -1){
                app.warn('drop here to add block to script');
            }else{
                app.warn('cannot drop a ' + dragType + ' block on a ' + dropTypes.join(',') + ' value');
                dropTarget = null;
            }
        }else{
            app.warn('expressions blocks can only be dropped on values');
        }
        return;
    }else{
        dropTarget = dom.closest(potentialDropTarget, 'wb-step, wb-context, wb-contains');
        // FIXME: Don't drop onto locals
        if (dropTarget){
            if (dropTarget.matches('wb-contains')){
                app.warn('drop to add to top of the block container');
            }else{
                app.warn('drop to add after this block');
            }
            return;
        }
    }
    app.warn('Not a target, drop to cancel drag');
});

Event.on(document.body, 'drag-end', null, function(evt){
    if (!dropTarget){
        if(dragTarget){
	    dragTarget.parentElement.removeChild(dragTarget);
	}
        // fall through to resetDragging()
    }else if (dropTarget === BLOCK_MENU){
        // Drop on script menu to delete block, always delete clone
        dragTarget.parentElement.removeChild(dragTarget);
        if (dragStart === 'script'){
            // only delete original if it is in the script, not menu
            // FIXME: Don't delete originals in locals
            origTarget.parentElement.removeChild(origTarget);
            origTarget = null;
        }
    }else if(dragTarget.matches('wb-expression')){
        dropTarget.appendChild(dragTarget);
    }else if(dragTarget.matches('wb-context, wb-step')){
        if (dropTarget.matches('wb-contains')){
            // dropping directly into a contains section
            // insert as the first block unless dropped after the entire script
            if (dropTarget.children.length && evt.pageY > dropTarget.lastElementChild.getBoundingClientRect().bottom){
                dropTarget.appendChild(dragTarget);
            }else{
                dropTarget.insertBefore(dragTarget, dropTarget.firstElementChild);
            }
        }else{
            // dropping on a block in the contains, insert after that block
            dropTarget.parentElement.insertBefore(dragTarget, dropTarget.nextElementSibling);
        }
        if (dragStart === 'script'){
            // only delete original if it is in the script, not menu
            // FIXME: Don't delete originals in locals
            // FIXME: Duplicated code, refactor
            origTarget.parentElement.removeChild(origTarget);
            origTarget = null;
        }
    }else{
        dragTarget.parentElement.removeChild(dragTarget);
    }

    resetDragging();
});

Event.on(document.body, 'drag-cancel', null, function(evt){
    dragTarget.parentElement.removeChild(dragTarget);
    resetDragging();
});

// Handle resizing inputs when their content changes
Event.on(document.body, 'input', 'input', function(evt){
    var target = evt.target;
    if (! dom.matches(target, 'wb-value > input')) return;
    resize(target);
}, false);



function resetDragging(){
    if (dragTarget){
        dragTarget.classList.remove('dragging');
        dragTarget.removeAttribute('style');
    }
    if (origTarget){
        origTarget.classList.remove('singularity');
    }
    dragTarget = null;
    origTarget = null;
    dragStart = '';
    dropTarget = null;
    app.info('');
    // Hide trash can, should be in app.js, not block.js
    BLOCK_MENU.classList.remove('trashcan');
    BLOCK_MENU.scrollTop = blockTop;
}


})();

