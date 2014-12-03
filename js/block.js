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
        console.log('font: %s %s %s', textStyle.fontFamily, textStyle.fontSize, textStyle.fontWeight);
        svgText.style.fontFamily = textStyle.fontFamily;
        svgText.style.fontSize = textStyle.fontSize;
        svgText.style.fontWeight = textStyle.fontWeight;
        svgText.textContent = input.value || '';
        var textwidth = svgText.getComputedTextLength();
        console.log('textwidth = %s', textwidth);
        input.style.width = Math.max((textwidth + 15), 30) + 'px';
    }


// Blocks

var BlockProto = Object.create(HTMLElement.prototype);
BlockProto.createdCallback = function blockCreated(){
    // Add required structure
    console.log('%s created', this.tagName.toLowerCase());
};
BlockProto.attachedCallback = function blockAttached(){
    // Add locals
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

var StepProto = Object.create(BlockProto);
window.WBStep = document.registerElement('wb-step', {prototype: StepProto});

var ContextProto = Object.create(BlockProto);
ContextProto.createdCallback = function contextCreated(){
    // Add disclosure, contained, local
    console.log('Context created');
};
window.WBContext = document.registerElement('wb-context', {prototype: ContextProto});

var ExpressionProto = Object.create(BlockProto);
ExpressionProto.createdCallback = function expressionCreated(){
    console.log('Expression created');
    var children = [].slice.apply(this.children);
    children.forEach(function(child){
        console.log('Expression child of mine: %s', child);
    });
};
window.WBExpression = document.registerElement('wb-expression', {prototype: ExpressionProto});

var DisclosureProto = Object.create(HTMLElement.prototype);
window.WBDisclosure = document.registerElement('wb-disclosure', {prototype: DisclosureProto});

var LocalProto = Object.create(HTMLElement.prototype);
window.WBLocal = document.registerElement('wb-local', {prototype: LocalProto});

var ValueProto = Object.create(HTMLElement.prototype);
ValueProto.createdCallback = function valueCreated(){
    // Add holder, input or select, or block
    console.log('Value created');
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
    console.warn('min: %s', min);
    if (min !== null){
        input.setAttribute('min', min);
    }
    var max = this.getAttribute('max');
    console.warn('max: %s', max);
    if (max !== null){
        input.setAttribute('max', max);
    }
    resize(input);
};
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

