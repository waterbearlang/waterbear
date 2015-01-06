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
    if (dom.matches(this.parentElement, 'header')) return;
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
    setDefaultByTag(this, 'wb-disclosure');
    setDefaultByTag(this, 'wb-local');
    setDefaultByTag(this, 'wb-contains');
    // console.log('Context created');
};
window.WBContext = document.registerElement('wb-context', {prototype: ContextProto});

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
    // var children = [].slice.apply(this.children);
    // children.forEach(function(child){
        // console.log('Expression child of mine: %s', child);
    // });
};
window.WBExpression = document.registerElement('wb-expression', {prototype: ExpressionProto});

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

/*****************
*
*  wb-locals
*
*  Instantiated as new WBLocals or as <wb-locals>
*
*  Attributes: class, id
*
*  Children: wb-step, wb-context, wb-expression
*
*  Locals are a menu of blocks which are local to a wb-context
*
*  FIXME: Still need to decide on how to represent locals in a block definintion vs. locals
*  in a context runtime
*
******************/


var LocalProto = Object.create(HTMLElement.prototype);
window.WBLocal = document.registerElement('wb-local', {prototype: LocalProto});

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
    if (dom.child(this, 'input, select, wb-expression')){ return; }
    var types = (this.getAttribute('type') || '').split(',');
    var value = this.getAttribute('value');
    var input;
    switch(types[0]){
        // FIXME: Support multiple types on a value (comma-separated)
        case 'number':
        case 'text':
        case 'color':
            input = elem('input', {type: types[0], value: value});
            if (this.hasAttribute('min')){
                input.setAttribute('min', this.getAttribute('min'));
            }
            if (this.hasAttribute('max')){
                input.setAttribute('max', this.getAttribute('max'));
            }
            this.appendChild(input);
            break;
        case 'list':
            var list = this.getAttribute('options').split(',');
            this.appendChild(dom.createSelect(list, value));
            break;
        case 'boolean':
            this.appendChild(dom.createSelect(['true','false'], value));
            break;
        case 'any':
            input = elem('input', {type: 'any'});
            this.appendChild(input);
            break;
        default:
            if (types.length){
                // block types, only drop blocks of proper type, no direct input
                input = elem('input', {type: types[0]});
                input.readOnly = true;
            }
            break;
    }
    if (input){
        resize(input);
    }
};
ValueProto.attachedCallback = insertIntoHeader;
window.WBValue = document.registerElement('wb-value', {prototype: ValueProto});


var ContainedProto = Object.create(HTMLElement.prototype);
window.WBContained = document.registerElement('wb-contained', {prototype: ContainedProto});

var dragTarget = null;
var origTarget = null;
var dragStart = '';
var dropTarget = null;
var BLOCK_MENU = document.querySelector('sidebar');

event.on(document.body, 'drag-start', 'wb-step, wb-step *, wb-context, wb-context *, wb-expression, wb-expression *', function(evt){
    origTarget = dom.closest(evt.target, 'wb-step, wb-context, wb-expression');
    // Maybe move to object notation later
    //    return target.startDrag(evt);

    // Show trash can, should be in app.js, not block.js
    BLOCK_MENU.classList.add('trashcan');

    // FIXME: Highlight droppable places (or grey out non-droppable)

    dragTarget = origTarget.cloneNode(true);
    document.body.appendChild(dragTarget);
    dragStart = dom.matches(origTarget, 'wb-contains *') ? 'script' : 'menu';
    if (dragStart === 'script'){
        origTarget.style.display = 'none';
    }
    dragTarget.classList.add('dragging');
    dragTarget.style.left = (evt.pageX - 15) + 'px';
    dragTarget.style.top = (evt.pageY - 15) + 'px';
});

event.on(document.body, 'dragging', null, function(evt){
    if (!dragTarget){ return; }
    // console.log('block dragging ' + dragTarget.tagName.toLowerCase() + ' (' + evt.pageX + ', ' + evt.pageY + ') %o', evt);
    dragTarget.style.left = (evt.pageX - 15) + 'px';
    dragTarget.style.top = (evt.pageY - 15) + 'px';
    var potentialDropTarget = document.elementFromPoint(evt.x, evt.y);
    if (potentialDropTarget.matches('sidebar, sidebar *')){
        dropTarget = BLOCK_MENU;
        app.warn('drop here to delete block(s)');
        return;
    }
    if (dragTarget.matches('wb-expression')){
        // FIXME
        dropTarget = dom.closest(potentialDropTarget, 'wb-value');
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
            if (dropTypes[0] === 'any' || dropTypes.indexOf(dragType) > -1){
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

event.on(document.body, 'drag-end', null, function(evt){
    if (!dropTarget){
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
            dropTarget.insertBefore(dragTarget, dropTarget.firstElementChild);
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

event.on(document.body, 'drag-cancel', null, function(evt){
    dragTarget.parentElement.removeChild(dragTarget);
    resetDragging();
});

// Handle resizing inputs when their content changes
document.addEventListener('input', function(event){
    var target = event.target;
    if (! dom.matches(target, 'wb-value > input')) return;
    resize(target);
}, false);



function resetDragging(){
    if (dragTarget){
        dragTarget.classList.remove('dragging');
        dragTarget.removeAttribute('style');
    }
    if (origTarget){
        delete origTarget.style.display;
    }
    dragTarget = null;
    origTarget = null;
    dragStart = '';
    dropTarget = null;
    app.info('');
    // Hide trash can, should be in app.js, not block.js
    BLOCK_MENU.classList.remove('trashcan');
}


})();

