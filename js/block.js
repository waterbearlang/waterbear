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
    var scriptspace = dom.find(document.body, 'wb-workspace > wb-contains');
    var selectedType = 'null';
    var BLOCK_MENU = document.querySelector('sidebar');

// Utility

function randomId(){
    // Based on Paul Irish's random hex color:http://www.paulirish.com/2009/random-hex-color-code-snippets/
    // Theoretically could return non-unique values, not going to let that keep me up at night
    return 'k'+Math.floor(Math.random()*16777215).toString(16); // 'k' because ids have to start with a letter
}

// FIXME: insert this into the document rather than including in markup
var svgText = document.querySelector('.resize-tester');
function resize(input){
    if (!input){
        console.error('No input');
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
    var parent = this.parentElement.localName;
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
};
BlockProto.attachedCallback = function blockAttached(){
    // Attached only fires the first time an element is added to the DOM
    // If you want a notification every time block is added to DOM (moved, etc.) use wb-added
    // (also wb-removed, wb-addedChild, wb-removedChild)
    // Attached will fire when re-loading a script too, so program defensively
    // Add locals
    // Make sure they have unique names in scope
    // Handle special cases:
    // 1) Added to socket of iteration, add iterationLocals
    //    Are there other expression blocks that add locals?
    // 2) Added to contains of setup block, add globally (to file)
    // 3) Otherwise, when added to contains add to locals view of closest context
    if (!this.parentElement || dom.matches(this.parentElement, 'wb-contains')){
        return;
    }
    var parent = dom.parent(this, 'wb-context');
    if (parent){
        setDefaultByTag(parent, 'wb-contains').appendChild(this);
    }else{
        // console.warn('free-floating block: %o, OK for now', this);
    }
};

BlockProto.detachedCallback = function blockDetached(){
    // Remove locals
};
BlockProto.attributeChangedCallback = function(attrName, oldVal, newVal){
    // Attributes to watch for:
    //    group or class (do nothing)
    //    title or help (do nothing)
    //    script (do nothing)
    //    type (do nothing
};
BlockProto.gatherValues = function(scope){
    var values = dom.children(dom.child(this, 'header'), 'wb-value[type], wb-value[value], wb-row');
    return values.map(function(value){
        return value.getValue(scope);
    });
};

/* Applicable for both <wb-step> and <wb-context>.
 * The next element is simply the nextElementSibling. */
BlockProto.next = function next() {
    return this.nextElementSibling;
};

/**
 * Tells you whether this block is a context block.  Obviously, only
 * ContextProto should override this property.
 */
BlockProto.isContext =  false;


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
    var values = this.gatherValues(scope);
    return this.fn.apply(scope, this.gatherValues(scope));
};
window.WBStep = document.registerElement('wb-step', {prototype: StepProto});

function updateVariableType(evt){
    var setVariableBlock = evt.detail;
    // ignore variables not in the workspace (in scripts)
    if (! dom.matches(setVariableBlock, 'wb-workspace *')){
        return;
    }
    // ignore blocks that are not setVariable
    if (setVariableBlock.getAttribute('script') !== 'control.setVariable'){
        return;
    }
    var valueBlock = evt.target;
    var type = valueBlock.getAttribute('type');
    setTypeOfVariable(setVariableBlock, type);
    updateLocalInstancesType(setVariableBlock, type);
}

function createVariableToLocalAssociation(evt){
    var setVariableBlock = evt.target;
    if (!setVariableBlock.hasAttribute('id')){
        var id = randomId();
        setVariableBlock.setAttribute('id', id);
        var local = dom.find(setVariableBlock, 'wb-local [script="control.getVariable"]');
        local.setAttribute('for', id);
    }
}


function handleVariableInput(evt){
    // Actually change the locals while we update
    var input = evt.target;
    var stepBlock = dom.closest(input, 'wb-step, wb-expression, wb-context');
    if (! dom.matches(stepBlock, '[script="control.setVariable"]')){
        return;
    }
    // keep from literal value matching
    if (! dom.matches(input.parentElement, ':first-of-type')){
        return;
    }
    var context = dom.closest(stepBlock, 'wb-contains');
    var newVariableName = input.value;
    updateVariableNameInInstances(newVariableName, getVariablesToUpdate(context, stepBlock.id));
    // evt.stopPropagation();
}

function handleVariableBlur(evt){
    // Cleanup
    var input = evt.target;
    var stepBlock = dom.closest(input, 'wb-step, wb-expression, wb-context');
    if (! dom.matches(stepBlock, '[script="control.setVariable"]')){
        return;
    }
    ensureNameIsUniqueInContext(input);
}

function trailingNumber(str){
    // return trailing number as a number or zero if no trailing number
    return Number((str.match(/\d+$/) || [0])[0]);
}

function ensureNameIsUniqueInContext(input){
    var parentContext = dom.closest(input, 'wb-contains');
    var setVariable = dom.closest(input, '[script="control.setVariable"]');
    var valueBlock = dom.closest(input, 'wb-value');
    // Find other variable names in scope
    var variablesToTestAgainst = dom.findAll(parentContext, '[script="control.setVariable"]')
        .filter(function(setVarBlock){ return setVarBlock && setVarBlock !== setVariable; })
        .map(function(setVarBlock){return dom.find(setVarBlock, 'input').value; })
        .sort();
    var newVariableName = input.value; // we may be changing this one
    var oldVariableName = input.value;
    // Compare against other variable names, update if there is a match
    while(variablesToTestAgainst.indexOf(newVariableName) > -1){
        var incrementalNumber = trailingNumber(newVariableName);
        var baseName;
        if (incrementalNumber){
            baseName = newVariableName.slice(0, -(''+incrementalNumber).length); // trim off number
        }else{
            baseName = newVariableName + ' ';
        }
        newVariableName = baseName + (incrementalNumber + 1);
    }
    if (newVariableName !== oldVariableName){
        input.value = newVariableName;
        valueBlock.setAttribute('value', newVariableName);
        var variablesToUpdate = getVariablesToUpdate(parentContext, setVariable.id);
        updateVariableNameInInstances(newVariableName, variablesToUpdate);
    }
}

function getVariablesToUpdate(parentContext, setVarId){
    return dom.findAll(workspace, '[for="' + setVarId + '"]');
}

function updateVariableNameInInstances(newVariableName, variableLocalsToUpdate){
    variableLocalsToUpdate.forEach(function(wbvalue){
        wbvalue.setAttribute('value', newVariableName);
        dom.find(wbvalue, 'header').textContent = newVariableName;
    });
}

function uniquifyVariableName(evt){
    var setVariableBlock = evt.target;
    var input = dom.find(setVariableBlock, 'input');
    ensureNameIsUniqueInContext(input);
}


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
    setDefaultByTag(this, 'wb-contains');
};
ContextProto.gatherContains = function(){
    // returns an array of arrays of blocks (steps and contexts)
    return dom.children(this, 'wb-contains');
};
ContextProto.run = function(strand, frame){
   var args, containers;
   /* Set this function's setup() callback */
    if (!this.setup){
        this.setupCallbacks();
    }

    /* FIXME: Allow for optional evaluation of values. */
    // expressions are evaluated if and only if shouldEvaluateValues returns
    // true. Containers are evaluated when needed.
    args = this.gatherValues(strand.scope);
    containers = this.gatherContains();

    /* Call setup! */
    return this.setup.call(strand.scope, strand, this, containers, args);
};
ContextProto.showLocals = function(evt){
    // This is way too specific to the needs to the loopOver block
    var blockAdded = evt.target;
    if (blockAdded && blockAdded.localName === 'wb-expression'){
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
    var blockAdded = evt.target;
    if (blockAdded && blockAdded.localName === 'wb-expression'){
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
/**
 * Prepares the setup() callback.
 */
ContextProto.setupCallbacks = function() {
    /* Fetch the callback object from runtime. */
    var qualifiedName = this.getAttribute('script').split('.');
    var category = qualifiedName[0], name = qualifiedName[1];
    var callback = runtime[category][name];

    console.assert(!!callback, 'Could not find script: ' + qualifiedName);

    this.setup = callback;
};

/**
 * Some code (e.g., execution.js) wants to know if they're dealing with a
 * context block. This is a surefire way of doing that.
 */
ContextProto.isContext = true;

/** Default: Always get the next DOM element and assume it's a wb-contains. */
function defaultNextCallback(strand, args, containers, elem) {
    return elem.nextElementSibling;
}

/** Default: Always evaluate arugments before calling setup(). */
function defaultShouldEvaluateValues(strand, containers, elem) {
    return true;
}

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
    var header = setDefaultByTag(this, 'header', true);
    if (this.getAttribute('context') === 'true'){
        setDefaultByTag(this, 'wb-disclosure');
    }
};
ExpressionProto.attachedCallback = function expressionAttached(){
    if (!this.parentElement){
        return;
    }
    this.parent = this.parentElement;
    var siblings = dom.children(this.parent, 'input, select');
    if (siblings.length){
        siblings.forEach(function(sib){
            sib.classList.add('hide');
        });
    }
    if (this.parent.localName !== 'wb-local'){
        var blockParent = dom.closest(this.parent, 'wb-expression, wb-step, wb-context');
        if (blockParent){
            Event.trigger(this, 'wb-added', blockParent);
        }
    }

};
ExpressionProto.detachedCallback = function expressionDetached(){
    if (!this.parent) return;
    var siblings = dom.children(this.parent, 'input, select');
    if (siblings.length){
        siblings.forEach(function(sib){
            sib.classList.remove('hide');
        });
    }
    if (this.parent.localName !== 'wb-local'){
        var blockParent = dom.closest(this.parent, 'wb-expression, wb-step, wb-context');
        if (blockParent){
            Event.trigger(blockParent, 'wb-removed', this);
        }
    }
    this.parent = null;
};
ExpressionProto.gatherValues = function gatherValues(scope){
    var value = this.getAttribute('value');
    if (!value){
        return BlockProto.gatherValues.call(this, scope);
    }
    return [value];
};
ExpressionProto.run = function(scope){
    if (!this.fn){
        var fnName = this.getAttribute('script').split('.');
        this.fn = runtime[fnName[0]][fnName[1]];
    }
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
};
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
    var block = dom.closest(evt.target, 'wb-step, wb-context, wb-expression');
    if (block.hasAttribute('closed')){
        block.removeAttribute('closed');
    }else{
        block.setAttribute('closed', true);
    }
}


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
    var newItem = dom.clone(template);
    template.parentElement.insertBefore(newItem, template.nextElementSibling);
}


/*****************
*
*  .remove-item button
*
*  Just a button with a class, removes a row from an expression context
*
******************/

function removeItem(evt){
    var self = evt.target;
    var row = dom.closest(self, 'wb-row');
    // we want to remove the row, but not if it is the last one
    if (row.previousElementSibling || row.nextElementSibling){
        row.parentElement.removeChild(row);
    }
}


/*****************
*
*  wb-value
*
*  Instantiated as new WBValue or as <wb-value>
*
*  Attributes: class, id, type (mandatory), value, allow, min, max
*
*    type:  Waterbear type of applicable input. Can be comma-separated list.
*    allow: unset, 'literal' or 'block'. If unset, both literals can be
*           typed in or expression blocks can be dragged over. If set to
*           'literal', only literals may be typed in. If set to 'block',
*           only expression blocks may be dragged into the value block.
*
*  Children: text, input, select, wb-expression
*
******************/


var ValueProto = Object.create(HTMLElement.prototype);
ValueProto.createdCallback = function valueCreated(){
    // Add holder, input or select, or block
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
    // Sets the proper HTML input for the given Waterbear type.
    var types = (this.getAttribute('type') || '').split(',');
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
        case 'image':
            input = elem('input', {type: 'wb-image'});
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
    var primaryType = this.type.split(',')[0];
    if (convert[primaryType]){
        return convert[primaryType](value);
    }else{
        return value;
    }
};
ValueProto.attachedCallback = insertIntoHeader;
window.WBValue = document.registerElement('wb-value', {prototype: ValueProto});

//toggle an inputs 'filter' selection
ValueProto.toggleSelect = function(){
    if (this.getAttribute('selected') === 'true'){
       BLOCK_MENU.removeAttribute('filtered');
       this.deselect();


    }else{
        BLOCK_MENU.setAttribute('filtered', 'true');
        this.select();
    }
}

//select an inout field and filter the sidebar by it
ValueProto.select = function(){
    var i = 0;
    var sidebarBlocks=[];
    var selectedTypeList;
    var existing = workspace.querySelectorAll('wb-value[selected=true]');
    if (existing.length !== 0){
        var i =0;
        for(i=0; i< existing.length; i++){ existing[i].deselect();}
    }
    this.setAttribute('selected', 'true');
    selectedType = this.getAttribute('type');
    selectedTypeList = selectedType.split(',');
    for(i=0; i<selectedTypeList.length; i++){sidebarBlocks = sidebarBlocks.concat(Array.prototype.slice.call(BLOCK_MENU.querySelectorAll('wb-expression[type *= ' + selectedTypeList[i] + ']')));}
    for(i=0; i< sidebarBlocks.length; i++){ sidebarBlocks[i].setAttribute('filtered', 'true');}

}

//deselect an inout field and unfilter the sidebar
ValueProto.deselect = function(){
    var i = 0;
    var sidebarBlocks;
    this.removeAttribute('selected');
    sidebarBlocks = BLOCK_MENU.querySelectorAll('wb-expression');
    for(i=0; i< sidebarBlocks.length; i++){ sidebarBlocks[i].removeAttribute('filtered');}
    selectedType = 'null';
}


//when a user clicks on an inout box in the workspace
function changeValueOnInputChange(evt){
    dom.closest(evt.target, 'wb-value').setAttribute('value', evt.target.value);
    // evt.stopPropagation();
}


var convert = {
    boolean: function(text){ return text === 'true'; },
    number: function(text){ return +text; },
    any: function(text){return util.isNumber(text) ? +text : text; }
};

/*****************
*
*  wb-contains
*
*  Instantiated as new WBContains or as <wb-contains>. Contains is a semi-block. It never
*  exists by itself, only as a child of a <wb-context> (and every <wb-context has at least one
*  <wb-contains> child, implicitly if not explicitly). Sometimes we need to test for other blocks
*  being in a <wb-context>, which is why sometimes it is block-ish.
*
*  Attributes: class, id
*
*  Children: wb-step, wb-context
*
******************/


var ContainsProto = Object.create(HTMLElement.prototype);
/* You sure love Object.defineProperty, dontcha, Eddie? */
Object.defineProperty(ContainsProto, 'firstInstruction', {
   get: function () {
      return this.firstElementChild;
   }
});

window.WBContains = document.registerElement('wb-contains', {prototype: ContainsProto});

Event.on(document.body, 'ui:click', 'wb-value > input', function(evt){
    if(dom.matches(dom.closest(evt.target, 'wb-value'), 'wb-contains *')){
        dom.closest(evt.target, 'wb-value').toggleSelect();
    }
})

//deselect all of the blocks and unfilter the sidebar if the 'Available Blocks' button is clicked
Event.on(document.body, 'ui:click', '.availableBlocks', function(evt){
    var existing = workspace.querySelectorAll('wb-value[selected=true]');
    if (existing.length !== 0){
        var i =0;
        for(i=0; i< existing.length; i++){ existing[i].deselect();}
    }
    BLOCK_MENU.removeAttribute('filtered');
});


/* DRAGGING */

var dragTarget = null;
var origTarget = null;
var dragStart = '';
var dropTarget = null;
var blockTop = 0;

function startDragBlock(evt){
    origTarget = dom.closest(evt.target, 'wb-step, wb-context, wb-expression');
    // Maybe move to object notation later
    //    return target.startDrag(evt);

    // Show trash can, should be in app.js, not block.js
    blockTop = BLOCK_MENU.scrollTop;
    BLOCK_MENU.classList.add('trashcan');

    document.body.classList.add('block-dragging');
    // FIXME: Highlight droppable places (or grey out non-droppable)

    dragTarget = dom.clone(origTarget);
    document.body.appendChild(dragTarget);
    dragStart = dom.matches(origTarget, 'wb-contains *, wb-value *') ? 'script' : 'menu';
    // Warning here: origTarget may be null, and thus, not have a
    // parentElement.
    if (origTarget.parentElement.localName === 'wb-local'){
        dragStart = 'menu';
    }
    if (dragStart === 'script'){
        origTarget.classList.add('hide');
        var siblingInput = dom.child(origTarget.parentElement, 'input, select');
        if (siblingInput){
            siblingInput.classList.remove('hide');
        }
    }
    dragTarget.classList.add('dragging');
    dragTarget.style.left = (evt.pageX - 15) + 'px';
    dragTarget.style.top = (evt.pageY - 15) + 'px';
}


function checkForScroll(evt){
    requestAnimationFrame(checkForScroll);
    if (!dragTarget){ return; }
    var x = Event.pointerX;
    var y = Event.pointerY;
    var rect = scriptspace.getBoundingClientRect();
    if (x < rect.left){
        scriptspace.scrollLeft -= 5;
    }else if (x > rect.right){
        scriptspace.scrollLeft += 5;
    }
    if (y < rect.top){
        scriptspace.scrollTop -= 5;
    }else if (y > rect.bottom){
        scriptspace.scrollTop += 5;
    }
}

function dragBlock(evt){
    if (!dragTarget){ return; }
    evt.preventDefault();
    evt.stopPropagation();
    // FIXME: hardcoded margin (???) values.
    // Essentially, the block is always dragged at an area 15 px away from the
    // top-left corner.
    dragTarget.style.left = (evt.pageX - 15) + 'px';
    dragTarget.style.top = (evt.pageY - 15) + 'px';
    var potentialDropTarget = document.elementFromPoint(evt.pageX, evt.pageY);

    // Check if the user dragged over the sidebar.
    if (potentialDropTarget.matches('sidebar, sidebar *')){
        dropTarget = BLOCK_MENU;
        app.warn('drop here to delete block(s)');
        return;
    }

    // When we're dragging an expression...
    if (dragTarget.matches('wb-expression')){
       // Check if we're on a literal block.
       if (potentialDropTarget.matches('wb-value[allow="literal"], wb-value[allow="literal"] *')) {
          app.warn("cannot drop on direct input value");
          return;
       }

        // FIXME
        dropTarget = dom.closest(potentialDropTarget, 'wb-value[type]:not([allow="literal"])');
        if (dropTarget){
            if (dom.child(dropTarget, 'wb-expression:not(.hide)')){
                app.warn('cannot drop an expression on another expression');
                dropTarget = null;
                return;
            }

            var dropTypes = dropTarget.getAttribute('type').split(','); // FIXME: remove excess whitespace
            var dragType = dragTarget.getAttribute('type');
            if (dragType === 'any' || dropTypes.indexOf('any') > -1 || dropTypes.indexOf(dragType) > -1){
                app.warn('drop here to add block to script');
            }else{
                app.warn('cannot drop a ' + dragType + ' block on a ' + dropTypes.join(',') + ' value');
                dropTarget = null;
            }
        }else{
           // Pretend the expression is a step.
           dropTargetIsContainer(potentialDropTarget);
        }
        return;
    }else{
       // It's a step or a context.
       dropTargetIsContainer(potentialDropTarget);
       return;
    }
    app.warn('Not a target, drop to cancel drag');
}

function dropTargetIsContainer(potentialDropTarget){
   dropTarget = dom.closest(potentialDropTarget, 'wb-step, wb-context, wb-contains');
   // FIXME: Don't drop onto locals
   if (dropTarget){
      if (dropTarget.matches('wb-contains')){
         app.warn('drop to add to top of the block container');
      }else{
         app.warn('drop to add after this block');
      }
   }
}

function addToContains(block, evt, addBlockEvent){
    // dropping directly into a contains section
    // insert as the first block unless dropped after the entire script
    addBlockEvent.addedBlock = block;
    if(dragStart === 'script' && addBlockEvent.type !== 'add-var-block'){
        addBlockEvent.type = 'move-block';
    }
    if (dropTarget.matches('wb-contains')){
        if (dropTarget.children.length && evt.pageY > dropTarget.lastElementChild.getBoundingClientRect().bottom){
            dropTarget.appendChild(block);
        }else{
            addBlockEvent.nextBlock = dropTarget.firstElementChild;
            dropTarget.insertBefore(block, dropTarget.firstElementChild);
        }
    }else{
        // dropping on a block in the contains, insert after that block
        addBlockEvent.nextBlock = dropTarget.nextElementSibling;
        addBlockEvent.addedTo = dropTarget.parentElement;
        dropTarget.parentElement.insertBefore(block, dropTarget.nextElementSibling);
    }
    Event.addNewEvent(addBlockEvent);
}

/**
    Variable Glossary:
    dragStart = 'script' or 'menu', depending on where the original block is located (local vars also use 'menu' so they aren't hidden)
    origTarget = the original block that has been cloned to be dragged
            - hidden if it's in the script
            - not hidden if it's in the menu, or is a local variable block
    dragTarget = the cloned block that is being dragged
    dropTarget = the block (or position) the clone is being dropped into
**/
function endDragBlock(evt){
    var originalBlock = origTarget;
    var originalParent = null;
    var nextElem = null;
    if (dragStart === 'script'){
        if(origTarget){
            originalParent = origTarget.parentElement;
            nextElem = origTarget.nextElementSibling;
        }
        origTarget.parentElement.removeChild(origTarget);
        origTarget = null;
    }
    if (!dropTarget){
        if(dragTarget){
            dragTarget.parentElement.removeChild(dragTarget);
        }
       // fall through to resetDragging()
    }else if (dropTarget === BLOCK_MENU){
        // Drop on script menu to delete block, always delete clone
        if (dragStart === 'script'){                        //only want to undo if it was deleted from the script
            originalBlock.classList.remove('hide');  //un-hide block
            var deleteEvent = {type:'delete-block', deletedBlock:originalBlock, deletedFrom:originalParent, nextBlock:nextElem};
            Event.addNewEvent(deleteEvent);                 //add new event to undo
        }
        dragTarget.parentElement.removeChild(dragTarget);
    }else if(dragTarget.matches('wb-expression')){

        if (dropTarget.matches('wb-value')) {
            dropTarget.appendChild(dragTarget);
            dropTarget.deselect();
            BLOCK_MENU.removeAttribute('filtered');
            var addValueEvent = {type:'add-block', addedBlock:dragTarget, addedTo:dropTarget, nextBlock:dragTarget.nextElementSibling, originalParent:originalParent, originalNextEl: nextElem};
            if (dragStart === 'script'){
                addValueEvent.type = 'move-block'
            }
            Event.addNewEvent(addValueEvent);

        }else if (dropTarget.matches('wb-context, wb-step, wb-contains')){
            // Create variable block to wrap the expression.
            var addBlockEvent = {type:'add-block', addedBlock:null, addedTo:dropTarget, nextBlock:null, originalParent:originalParent, originalNextEl:nextElem};
            if(dragStart==='script'){
                addBlockEvent.type = 'add-var-block';
                addBlockEvent.insideBlock = dragTarget;
            }
            addToContains(createVariableBlock(dragTarget), evt, addBlockEvent);
        }
    }else if(dragTarget.matches('wb-context, wb-step')){
        var addBlockEvent = {type:'add-block', addedBlock:null, addedTo:dropTarget, nextBlock:null, originalParent:originalParent, originalNextEl:nextElem};
        addToContains(dragTarget, evt, addBlockEvent);
    }else{
        dragTarget.parentElement.removeChild(dragTarget);
    }
    resetDragging();
}

function cancelDragBlock(evt){
    dragTarget.parentElement.removeChild(dragTarget);
    resetDragging();
}

// Handle resizing inputs when their content changes
function resizeInputOnChange(evt){
    var target = evt.target;
    if (! dom.matches(target, 'wb-value > input')) return;
    resize(target);
    Event.trigger(target, 'wb-changed', evt.target.value);
}

function resetDragging(){
    if (dragTarget){
        dragTarget.classList.remove('dragging');
        dragTarget.removeAttribute('style');
    }
    if (origTarget){
        origTarget.classList.remove('hide');
    }
    dragTarget = null;
    origTarget = null;
    dragStart = '';
    dropTarget = null;
    app.info('');
    // Hide trash can, should be in app.js, not block.js
    BLOCK_MENU.classList.remove('trashcan');
    BLOCK_MENU.scrollTop = blockTop;
    document.body.classList.remove('block-dragging');
}

/* End Dragging */

/**
 * Creates a new "set variable" step.
 * If `initialValue` is not null, it should be a <wb-expression>.
 *
 */
function createVariableBlock(initialValue) {
   // Make ourselves a clone of the original.
   var originalSetVariable = dom.find('sidebar wb-step[script="control.setVariable"]');
   console.assert(originalSetVariable, 'Could not find setVariable block');
   var variableStep = dom.clone(originalSetVariable);

   // Set the expression here.
   variableStep
      .querySelector('wb-value[type="any"]')
      .appendChild(initialValue);
   return variableStep;
}


// FIXME: This should be a method on Step
// And really, Variable should be a subclass of Step, but that screws up the selectors
function setTypeOfVariable(variableStep, type){
   // Set type of variable to match type of object
   variableStep
       .querySelector('[script="control.getVariable"]') // get local expression
       .setAttribute('type', type);
}

function updateLocalInstancesType(variableStep, type){
    var parentContext = dom.closest(variableStep, 'wb-contains');
    var variableLocalsToUpdate = getVariablesToUpdate(parentContext, variableStep.id);
    variableLocalsToUpdate.forEach(function(varinstance){
        dom.closest(varinstance, 'wb-expression').setAttribute('type', type);
    });
}


// Exports

window.block = {
    randomId: randomId,
    getVariablesToUpdate: getVariablesToUpdate
}

// Event handling

// Make sure wb-added, wb-removed, wb-addedChild, wb-removedChild events are triggered
Event.registerElementsForAddRemoveEvents(workspace, 'wb-', 'wb-step, wb-context, wb-expression, wb-contains', 'wb-step, wb-context, wb-expression');

Event.on(workspace, 'editor:wb-added', 'wb-expression', updateVariableType);
Event.on(workspace, 'editor:wb-added', '[script="control.setVariable"]', createVariableToLocalAssociation);
Event.on(workspace, 'editor:wb-added', '[script="control.setVariable"]', uniquifyVariableName);

Event.on(workspace, 'editor:wb-addedChild', 'wb-context', function(evt){ evt.target.showLocals(evt); });
Event.on(workspace, 'editor:wb-addedChild', 'wb-context', function(evt){ evt.target.hideLocals(evt); });

Event.on(workspace, 'editor:click', 'wb-disclosure', toggleClosed);

// Add/remove rows from expressions
Event.on(workspace, 'editor:click', '.add-item', addItem);
Event.on(workspace, 'editor:click', '.remove-item', removeItem);

Event.on(document.body, 'editor:drag-start', 'wb-step, wb-step *, wb-context, wb-context *, wb-expression, wb-expression *', startDragBlock);
Event.on(document.body, 'editor:dragging', null, dragBlock);
Event.on(document.body, 'editor:drag-end', null, endDragBlock);
Event.on(document.body, 'editor:drag-cancel', null, cancelDragBlock);

requestAnimationFrame(checkForScroll);


Event.on(workspace, 'editor:input', 'input', resizeInputOnChange);
Event.on(workspace, 'editor:input', 'input, select', changeValueOnInputChange);

Event.on(workspace, 'editor:input', '[script="control.setVariable"] input', handleVariableInput);
Event.on(workspace, 'editor:blur',  '[script="control.setVariable"] input', handleVariableBlur); // Mozilla
Event.on(workspace, 'editor:focusout',  '[script="control.setVariable"] input', handleVariableBlur); // All other browsers


})();
