// Revised Block handling.
//
// Moving to custom elements
//
// A wb- or wb-expression can only contain wb-arguments, wb-locals, and/or text
// A wb-context, wb-toplevel, or wb-workspace must also contain wb-contents, wb-locals
// Some elements can be implied, like in HTML: when you don't include a wb-head it goes in anyway?
// So you could make a context with multiple wb-contents, but by default there would be one even
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
function setDefault(element, tagname, top){
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
    var head = setDefault(block, 'header');
    head.appendChild(this, true);
};


// BlockProto
// Not actually instantiated, but used as a superclass for other blocks

var BlockProto = Object.create(HTMLElement.prototype);
BlockProto.createdCallback = function blockCreated(){
    // Add required structure
    setDefault(this, 'header', true);
    console.log('%s created with %s children', this.tagName.toLowerCase(), this.children.length);
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
        setDefault(parent, 'wb-contains').appendChild(this);
    }else{
        console.warn('free-floating block: %o, OK for now', this);
    }
    console.log('%s attached', this.tagName.toLowerCase());
};
BlockProto.detachedCallback = function blockDetached(){
    // Remove locals
    console.log('%s detached', this.tagName.toLowerCase());
};
BlockProto.attributeChangedCallback = function(attrName, oldVal, newVal){
    // Attributes to watch for:
    //    group or class (do nothing)
    //    title or help (do nothing)
    //    script (do nothing)
    //    type (do nothing
    console.log('%s[%s] %s -> %s', this.tagName.toLowerCase(), attrName, oldVal, newVal);
};

// Step Proto
// Instantiated as new WBStep or as <wb-step>

var StepProto = Object.create(BlockProto);
window.WBStep = document.registerElement('wb-step', {prototype: StepProto});

// Context Proto
// Instantiated as new WBContext or as <wb-context>

var ContextProto = Object.create(BlockProto);
ContextProto.createdCallback = function contextCreated(){
    // Add disclosure, contained, local
    BlockProto.createdCallback.call(this);
    setDefault(this, 'wb-disclosure');
    setDefault(this, 'wb-local');
    setDefault(this, 'wb-contains');
    console.log('Context created');
};
window.WBContext = document.registerElement('wb-context', {prototype: ContextProto});

var ExpressionProto = Object.create(BlockProto);
ExpressionProto.createdCallback = function expressionCreated(){
    // console.log('Expression created');
    var children = [].slice.apply(this.children);
    children.forEach(function(child){
        console.log('Expression child of mine: %s', child);
    });
};
window.WBExpression = document.registerElement('wb-expression', {prototype: ExpressionProto});

var DisclosureProto = Object.create(HTMLElement.prototype);
DisclosureProto.attachedCallback = insertIntoHeader;
window.WBDisclosure = document.registerElement('wb-disclosure', {prototype: DisclosureProto});

var LocalProto = Object.create(HTMLElement.prototype);
window.WBLocal = document.registerElement('wb-local', {prototype: LocalProto});

var ValueProto = Object.create(HTMLElement.prototype);
ValueProto.createdCallback = function valueCreated(){
    // Add holder, input or select, or block
    // console.log('Value created');
    var type = this.getAttribute('type');
    var value = this.getAttribute('value');
    var input;
    switch(type){
        case 'number':
        case 'text':
        case 'color':
            input = elem('input', {type: type, value: value});
            this.appendChild(input);
            break;
        case 'choice':
            var listName = this.getAttribute('choiceList');
            console.log('FIXME: Choice value');
            var list = wb.choiceLists[listName];
            this.appendChild(wb.createSelect(list, value));
            break;
        case 'block':
            input = elem('input', {type: 'block'});
            input.readOnly = true;
            console.log('FIXME: Block value');
            break;
        case 'any':
            input = elem('input', {type: 'any'});
            this.appendChild(input);
            console.log('FIXME: Any value');
            break;
        default:
            throw new Error('Type ' + type + ' is not supported for value types');
    }
    var min = this.getAttribute('min');
    if (min !== null){
        input.setAttribute('min', min);
    }
    var max = this.getAttribute('max');
    if (max !== null){
        input.setAttribute('max', max);
    }
    resize(input);
};
ValueProto.attachedCallback = insertIntoHeader;
window.WBValue = document.registerElement('wb-value', {prototype: ValueProto});

// Handle resizing inputs when their content changes
document.addEventListener('input', function(event){
    var target = event.target;
    if (! dom.matches(target, 'wb-value > input')) return;
    resize(target);
}, false);


var ContainedProto = Object.create(HTMLElement.prototype);
window.WBContained = document.registerElement('wb-contained', {prototype: ContainedProto});


})();

