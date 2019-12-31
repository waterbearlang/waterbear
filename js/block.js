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


(function () {
    'use strict';

    /*******************
     *
     * Script Globals
     *
     ********************/

    var elem = dom.html,
        workspace = dom.find(document.body, 'wb-workspace'),
        scriptspace = dom.find(document.body, 'wb-workspace > wb-contains'),
        BLOCK_MENU = document.querySelector('sidebar');

    /************************
     *
     * Script Utils
     *
     ************************/

    // FIXME: This should be a method on Step
    // And really, Variable should be a subclass of Step, but that screws up the selectors
    function setTypeOfVariable(variableStep, type) {
        // Set type of variable to match type of object
        variableStep
            .querySelector('[fn="getVariable"]') // get local expression
            .setAttribute('type', type);
    }

    function updateLocalInstancesType(variableStep, type) {
        var localInstances = variableStep.getLocalInstances(variableStep.id);
        localInstances.forEach(function (instance) {
            // set instance
            var expr = dom.closest(instance, 'wb-expression');
            expr.setAttribute('type', type);
            // FIXME: needs to percolate to container, esp. if in setVariable
            // Is this instance still valid now?
            var types = dom.parent(expr, 'wb-value').getAttribute('type').split(',');
            if (types.indexOf('any') < 0 && types.indexOf(type) < 0) {
                // FIXME: Should we just mark these and refuse to run the script
                // while it is invalid? Not sure if auto-removing them is good UI.
                // Maybe mark then and provide a button to remove all of them at
                // user discretion?
                app.warn('Removing instance of ' + instance.getAttribute('fn') + ' because it now has a type which is illegal in this position', true);
                dom.remove(instance);
            }
        });
    }


    function handleInputOnBalance(evt) {
        var input = dom.closest(evt.target, 'input');
        if (input.min && input.value < input.min) {
            input.value = input.min;
        } else if (input.max && input.value > input.max) {
            input.value = input.max;
        }
    }


    function updateVariableNameInInstances(newVariableName, localInstances) {
        localInstances.forEach(function (instance) {
            var wbValue = dom.find(instance, 'wb-value');
            wbValue.setAttribute('value', newVariableName);
            wbValue.innerHTML = newVariableName;
        });
    }

    // FIXME: insert this into the document rather than including in markup
    var svgText = document.querySelector('.resize-tester');

    function resize(input) {
        if (!input) {
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
    function setDefaultByTag(element, tagname, top) {
        var test = dom.child(element, tagname);
        if (!test) {
            test = elem(tagname);
            if (top) {
                element.insertBefore(test, element.firstChild);
            } else {
                element.appendChild(test);
            }
        }
        return test;
    }

    const tabMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="12">
    <path
        d="M 0 12 
        a 6 6 90 0 0 6 -6 
        a 6 6 90 0 1 6 -6
        h 16
        a 6 6 90 0 1 6 6
        a 6 6 90 0 0 6 6" />
    </svg>
    `;
    const tabPath=`M 0 12 
    a 6 6 90 0 0 6 -6 
    a 6 6 90 0 1 6 -6
    h 16
    a 6 6 90 0 1 6 6
    a 6 6 90 0 0 6 6`

    function setDefaultTab(element){
        let tab = dom.child(element, 'svg.tab');
        if (!tab){
            element.prepend(dom.svg('svg', {'class': 'tab', width: 40, height: 12}, [dom.svg('path', {d: tabPath})]));
        }
    }

    function setDefaultSlot(element){
        let slot = dom.child(element, 'svg.slot');
        if (!slot){
            element.append(dom.svg('svg', {'class': 'slot', width: 40, height: 12}, [dom.svg('path', {d: tabPath})]));
        }
    }

    /*****************
     *
     *  BlockProto
     *
     *  Not actually instantiated, but used as a superclass for other blocks
     *
     ******************/
    var headerOnly = ['wb-row', 'wb-value', 'wb-disclosure', 'wb-local'];

    var BlockProto = Object.create(HTMLElement.prototype);
    BlockProto.createdCallback = function blockCreated() {
        // Add required structure
        var header = setDefaultByTag(this, 'header', true);
        // Put blocks that should only live in the header there
        if (this.getAttribute('context') === 'true') {
            setDefaultByTag(this, 'wb-disclosure');
        }
        if (!this.hasAttribute('id')){
            this.setAttribute('id', util.randomId());
        }
        var children = [].slice.call(this.children);
        children.forEach(function(child) {
            if (headerOnly.indexOf(child.localName) > -1) {
                header.appendChild(child);
            }
        });
    };
    BlockProto.attachedCallback = function blockAttached() {
        // Attached only fires the first time an element is added to the DOM
        // If you want a notification every time block is added to DOM (moved, etc.) use wb-added
        // (also wb-addedChild, wb-removedChild [NOT wb-removed])
        // Attached will fire when re-loading a script too, so program defensively
        // Add locals
        // Make sure they have unique names in scope
        // Handle special cases:
        // 1) Added to socket of iteration, add iterationLocals
        //    Are there other expression blocks that add locals?
        // 2) Added to contains of setup block, add globally (to file)
        // 3) Otherwise, when added to contains add to locals view of closest context
        if (!this.parentElement || dom.matches(this.parentElement, 'wb-contains') || dom.matches(this.parentElement, 'wb-local')) {
            return;
        }
        var parent = dom.parent(this, 'wb-context');
        if (parent) {
            setDefaultByTag(parent, 'wb-contains').appendChild(this);
        }
    };

    BlockProto.header = function blockHeader() {
        return dom.child(this, 'header');
    };

    BlockProto.gatherArguments = function blockGatherArguments() {
        return dom.children(this.header(), 'wb-value[type], wb-value[value], wb-row');
    };

    BlockProto.firstExpression = function blockFirstExpression() {
        return dom.child(this.header(), 'wb-expression');
    };

    BlockProto.localOrSelf = function blockLocalOrSelf() {
        if (this.isInstance()) {
            return this.getLocalForInstance();
        }
        return this;
    };

    BlockProto.gatherValues = function blockGatherValues() {
        var value = this.getAttribute('value');
        if (value) {
            return [value];
        }
        var values = this.gatherArguments();
        return Array.prototype.concat.apply(
            [],
            values.map(function(value) {
                return value.getValue();
            })
        );
    };

    BlockProto.run = function blockRun() {
        if (typeof(this._currentValue) !== 'undefined') {
            return this._currentValue;
        }
        if (!this.fn) {
            var nsName = this.getAttribute('ns');
            var fnName = this.getAttribute('fn');
            this.fn = runtime[nsName][fnName];
            // We could match arbitrary functions without duplicating them
            // into runtime by using ns="global" or no namespace at all.
            // With a bit more work we could have specialized "well-known"
            // namespaces that recognize libraries external to Waterbear.
            // or we could look in runtime and fall back to globals if
            // nothing is found, for things like Math namespace. That way
            // runtime can over-ride built-in behaviour as needed.
        }
        if (this.hasAttribute('specialform')) {
            // Don't evaluate arguments, let the function do that
            return this.fn();
        } else {
            var values = this.gatherValues();
            return this.fn.apply(this, values);
        }
    };

    BlockProto.hasLocal = function blockHasLocal() {
        return !!this.getLocals().length;
    };

    BlockProto.getLocals = function blockHasLocals() {
        // Default, over-ride in each subclass
        return [];
    };

    BlockProto.getFreeInstances = function blockGetFreeInstances() {
        // get contained instances, so we can get the local from them
        return dom.findAll(this, '[instanceof]');
    };

    BlockProto.getInstances = function blockGetInstances() {
        // Get instances from locals
        var instances = [];
        var self = this;
        this.getLocals().forEach(function(theLocal) {
            instances = instances.concat(self.getLocalInstances(theLocal.id));
        });
        return instances;
    };

    // typically called on the parent context
    BlockProto.getLocalInstances = function blockGetLocalInstances(setVarId) {
        var parentContext = dom.closest(this, 'wb-contains');
        return dom.findAll(parentContext, '[instanceof="' + setVarId + '"]');
    };


    BlockProto.undoableInsert = function(parent, nextSibling /*nextSibling is optional */){
        parent.insertBefore(this, nextSibling); /* if nextSibling is undefined, this is the same as parent.appendChild(this) */
        // Return info for undo stack
        this.makeSelected();
        return {
            type: 'add-block',
            block: this,
            parent: parent,
            nextSibling: nextSibling
        };
    };

    BlockProto.undoableRemove = function(){
        var undoEvt = {
            type: 'remove-block',
            block: this,
            parent: this.parentElement,
            nextSibling: this.nextSibling,
            subEvents: this.removeInstances()
        };
        this.classList.remove('selected,selected-block,selected-value');
        dom.remove(this);
        return undoEvt;
    };

    // Validation maintenance
    BlockProto.removeInstances = function blockRemoveInstances() {
        // Called when block they are instances of is being removed
        var instances = this.getInstances();
        if (instances.length) {
            app.warn('Removing ' + instances.length + ' instances of ' + this.getAttribute('fn') + ' because their value was removed', true);
        }
        return instances.map(function(instance){
            // FIXME: Some animation here would be nice
            return instance.undoableRemove(); // return list of undo data
        });
    };

    // Validation maintenance
    BlockProto.removeOutOfScopeInstances = function blockRemoveOutOfScopeInstances() {
        // Called when a block is dragged to a new location, to cull any instances
        // which would now be out of scope.
        var context = dom.closest(this, 'wb-contains');
        var invalidInstances = this.getInstances().filter(function(instance) {
            // FIXME? Do I need to test against each wb-contains?
            // this will allow instances to be in the header of the context
            return !context.contains(instance);
        });
        if (invalidInstances.length) {
            app.warn('Removing ' + invalidInstances.length + ' instances of ' + this.getAttribute('fn') + ' because the are no longer in scope', true);
        }
        return invalidInstances.map(function(instance){
            // FIXME: Some animation here would be nice
            return instance.undoableRemove(); // return list of undo data
        });
    };


    BlockProto.getAncestorContexts = function blockGetAncestorContexts() {
        var context = dom.parent(this, 'wb-context, wb-workspace');
        var contexts = [context];
        while (context.tagName.toLowerCase() !== 'wb-workspace') {
            context = dom.parent(context, 'wb-context, wb-workspace');
            contexts.push(context);
        }
        return contexts.reverse();
    };

    BlockProto.isInstance = function blockIsInstance() {
        return this.hasAttribute('instanceof');
    };

    BlockProto.getLocalForInstance = function blockGetLocalForInstance() {
        var localId = this.getAttribute('instanceof');
        if (localId) {
            return document.getElementById(localId);
        }
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
    BlockProto.isContext = false;


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

    StepProto.createdCallback = function stepCreated() {
        BlockProto.createdCallback.call(this);
        setDefaultTab(this);
        setDefaultSlot(this);
    };


    StepProto.getLocals = function stepGetLocals() {
        // For Steps this should work, but for contexts we need to gather the steps and contexts
        return dom.findAll(dom.child(this, 'header'), 'wb-local > *');
    };

    StepProto.getDescendantLocals = StepProto.getLocals;

    window.WBStep = document.registerElement('wb-step', {
        prototype: StepProto
    });


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
    ContextProto.createdCallback = function contextCreated() {
        // Add disclosure, contained, local
        BlockProto.createdCallback.call(this);
        var header = dom.child(this, 'header');
        setDefaultTab(this);
        setDefaultByTag(header, 'wb-disclosure');
        setDefaultByTag(this, 'wb-contains');
        setDefaultSlot(this);
    };

    ContextProto.childContainers = function childContainers() {
        return dom.children(this, 'wb-contains');
    };

    ContextProto.gatherContains = function contextGatherContains() {
        // returns an array of arrays of blocks (steps and contexts)
        // This is used by context blocks that have multiple contains areas
        // such as if/else
        // Other contexts can use gatherSteps which returns a single array of blocks
        return dom.children(this, 'wb-contains').map(function(container) {
            return Array.prototype.slice.call(container.children);
        });
    };

    ContextProto.gatherSteps = function contextGatherSteps() {
        // return an array of contained blocks, both steps and contexts
        return Array.prototype.slice.call(dom.child(this, 'wb-contains').children);
    };

    ContextProto.getLocals = function contextGetLocals() {
        // Doesn't get locals from decendent or ancestor contexts
        // Use getDecendentLocals() and getAllContextLocals for those
        var locals = dom.findAll(dom.child(this, 'header'), 'wb-local > *');
        var containers = this.childContainers();
        var i, j, container, stepChildren;
        for (i = 0; i < containers.length; i++) {
            container = containers[i];
            stepChildren = dom.children(container, 'wb-step');
            for (j = 0; j < stepChildren.length; j++) {
                // add each container's child's locals
                locals = locals.concat(stepChildren[j].getLocals());
            }
        }
        return locals;
    };

    ContextProto.getDescendantLocals = function contextGetDescendantLocals() {
        /* Wouldn't it be easier and faster to just find 'wb-local > *'? */
        var locals = dom.findAll(dom.child(this, 'header'), 'wb-local > *');
        var containers = this.childContainers();
        var i, j, container;
        for (i = 0; i < containers.length; i++) {
            container = containers[i];
            for (j = 0; j < container.children.length; j++) {
                // add each container's child's locals
                locals = locals.concat(container.children[j].getDescendantLocals());
            }
        }
        return locals;
    };

    ContextProto.getAllContextLocals = function contextGetAllContextLocals() {
        // get locals from both ancestors and descendants
        // but not sibling contexts along ancestor axis
        var locals = [];
        this.getAncestorContexts().forEach(function(context) {
            locals = locals.concat(context.getLocals());
        });
        locals = locals.concat(this.getDescendantLocals());
        return locals;
    };

    /**
     * Prepares the setup() callback.
     */

    window.WBContext = document.registerElement('wb-context', {
        prototype: ContextProto
    });

    /*****************
     *
     * wb-workspace
     *
     * Instantiated as new WBWorkspace or as <wb-workspace>
     *
     ******************/

    var WorkspaceProto = Object.create(HTMLElement.prototype);

    WorkspaceProto.getLocals = ContextProto.getLocals;
    WorkspaceProto.getDescendantLocals = ContextProto.getDescendantLocals;
    // Workspace is the bottom of the context chain, getAllContextLocals and getDescendantLocals are the same
    WorkspaceProto.getAllContextLocals = ContextProto.getDescendantLocals;
    WorkspaceProto.gatherContains = ContextProto.gatherContains;
    WorkspaceProto.childContainers = ContextProto.childContainers;

    window.WBWorkspace = document.registerElement('wb-workspace', {
        prototype: WorkspaceProto
    });
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

    var ExpressionProto = Object.create(BlockProto);
    ExpressionProto.attachedCallback = function expressionAttached() {
        if (!this.parentElement) {
            return;
        }
        this.parent = this.parentElement;
        var siblings = dom.children(this.parent, 'input, select');
        if (siblings.length) {
            siblings.forEach(function(sib) {
                sib.classList.add('hide');
            });
        }
        if (this.parent.localName !== 'wb-local') {
            var blockParent = dom.closest(this.parent, 'wb-expression, wb-step, wb-context');
            if (blockParent) {
                Event.trigger(this, 'wb-added', blockParent);
            }
        } else {
            if (!this.id) {
                this.id = util.randomId();
            }
        }
    };

    ExpressionProto.detachedCallback = function expressionDetached() {
        if (!this.parent) {
            return;
        }
        var siblings = dom.children(this.parent, 'input, select');
        if (siblings.length) {
            siblings.forEach(function(sib) {
                sib.classList.remove('hide');
            });
        }
        this.parent = null;
    };

    ExpressionProto.removeInstances = function() {
        /* do nothing */
        return [];
    };

    ExpressionProto.setValue = function(val) {
        if (this.isInstance()) {
            var local = this.getLocalForInstance();
            local._currentValue = val;
        } else {
            this._currentValue = val;
        }
    };

    ExpressionProto.getValue = function() {
        if (this.isInstance()) {
            var local = this.getLocalForInstance();
            return local.getValue();
        }
        if (typeof(this._currentValue) !== 'undefined') {
            return this._currentValue;
        }
        return this.run();
        // return [dom.child(this.header(), 'wb-value').getValue()];
    };

    window.WBExpression = document.registerElement('wb-expression', {
        prototype: ExpressionProto
    });

    /*******************
     *
     * Functions for managing local variables (currently only Expressions)
     *
     ********************/
    function updateVariableType(evt) {
        var setVariableBlock = evt.detail; // detail holds block added to
        var valueBlock = evt.target; // target holds block that was added
        // ignore if not setVariable
        if (setVariableBlock.getAttribute('fn') !== 'setVariable') {
            return;
        }
        var getVariableBlock = dom.find(setVariableBlock, '[fn="getVariable"]');
        var type = valueBlock.getAttribute('type');
        setTypeOfVariable(setVariableBlock, type);
        updateLocalInstancesType(getVariableBlock, type);
    }

    function createLocalToInstanceAssociation(evt) {
        var localNode = evt.target;
        var instanceNode = evt.detail;
        var id = localNode.id;
        if (!instanceNode.hasAttribute('instanceof')) {
            instanceNode.setAttribute('instanceof', id);
        }
        var wbValue = dom.find(instanceNode, 'wb-value');
        wbValue.innerHTML = wbValue.getAttribute('value');
    }


    function handleVariableInput(evt) {
        // Actually change the locals while we update
        var input = evt.target;
        var stepBlock = dom.closest(input, 'wb-step, wb-expression, wb-context');
        if (!dom.matches(stepBlock, '[fn="getVariable"]')) {
            return;
        }
        // keep from literal value matching
        if (!dom.matches(input.parentElement, ':first-of-type')) {
            return;
        }
        var newVariableName = input.value;
        updateVariableNameInInstances(newVariableName, stepBlock.getLocalInstances(stepBlock.id));
        // evt.stopPropagation();
    }

    function handleVariableBlur(evt) {
        // Cleanup
        var input = evt.target;
        var stepBlock = dom.closest(input, 'wb-step, wb-expression, wb-context');
        if (!dom.matches(stepBlock, '[fn="getVariable"]')) {
            return;
        }
        ensureNameIsUniqueInContext(input);
    }

    function trailingNumber(str) {
        // return trailing number as a number or zero if no trailing number
        return Number((str.match(/\d+$/) || [0])[0]);
    }

    function ensureNameIsUniqueInContext(input) {
        var block = dom.closest(input, 'wb-expression, wb-step, wb-context');
        var parentContext = dom.closest(input, 'wb-contains');
        var getVariable = dom.closest(input, '[fn="getVariable"]');
        var valueBlock = dom.closest(input, 'wb-value');
        // Find other variable names in scope
        // 1. Get list of setVariable blocks contained by parentContext
        // 2. Remove this block from the list
        // 3. Return the value of the input of the block
        // 4. Sort the resulting list
        var variablesToTestAgainst = parentContext.getAllContextLocals()
            .filter(function(setVarBlock) {
                return setVarBlock && setVarBlock !== getVariable && setVarBlock.getAttribute('fn') === 'getVariable';
            })
            .map(function(setVarBlock) {
                return dom.find(setVarBlock, 'input').value;
            })
            .sort();
        var newVariableName = input.value; // we may be changing this one
        var oldVariableName = input.value;
        // Compare against other variable names, update if there is a match
        // We don't want to shadow variables in ancestor contexts, but we
        // also don't want to cause decendants to shadow us. So we need all the
        // variables above and below. Siblings can still have the same name,
        // so we're not enforcing global uniqueness, but kinda close.
        while (variablesToTestAgainst.indexOf(newVariableName) > -1) {
            newVariableName = incrementName(newVariableName);
        }
        if (newVariableName !== oldVariableName) {
            input.value = newVariableName;
            valueBlock.setAttribute('value', newVariableName);
            var variablesToUpdate = block.getLocalInstances(getVariable.id);
            updateVariableNameInInstances(newVariableName, variablesToUpdate);
        }
    }

    function incrementName(name) {
        var incrementalNumber = trailingNumber(name);
        var baseName;
        if (incrementalNumber) {
            baseName = name.slice(0, -('' + incrementalNumber).length); // trim off number
        } else {
            baseName = name + ' ';
        }
        return baseName + (incrementalNumber + 1);
    }

    function uniquifyVariableNames(evt) {
        var blockWithLocals = evt.target;
        blockWithLocals.getLocals().forEach(function(getVariableBlock) {
            var input = dom.find(getVariableBlock, 'input');
            if (input) {
                ensureNameIsUniqueInContext(input);
            }
        });
    }

    /*******************
     *
     * End functions for local variables
     *
     ********************/


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
    window.WBUnit = document.registerElement('wb-unit', {
        prototype: UnitProto
    });

    /*****************
     *
     *  wb-row
     *
     *  Instantiated as new WBRow or as <wb-row>
     *
     *  Rows can be used wherever a <wb-value> could go (except inside other wb-rows). They are used to group
     *  values, units, and locals on a single line when they belong together.
     *
     ******************/
    var RowProto = Object.create(HTMLElement.prototype);
    RowProto.getValue = function() {
        // This will always return an array (maybe an empty array)
        var valueBlocks = dom.children(this, 'wb-value[type]:not(.hide)');
        var values = valueBlocks.map(function(block) {
            return block.getValue()[0];
        });
        return values;
    };
    window.WBRow = document.registerElement('wb-row', {
        prototype: RowProto
    });


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
    window.WBDisclosure = document.registerElement('wb-disclosure', {
        prototype: DisclosureProto
    });

    function toggleClosed(evt) {
        var block = dom.closest(evt.target, 'wb-step, wb-context, wb-expression');
        if (block.hasAttribute('closed')) {
            block.removeAttribute('closed');
        } else {
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
    LocalProto.run = BlockProto.run;
    LocalProto.getValue = function() {
        // wb-value already returns an array
        return dom.find(this, 'wb-value').getValue();
    };
    window.WBLocal = document.registerElement('wb-local', {
        prototype: LocalProto
    });

    /*****************
     *
     *  .add-item button
     *
     *  Just a button with a class, adds a new row to an expression context
     *
     ******************/

    function addItem(evt) {
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

    function removeItem(evt) {
        var self = evt.target;
        var row = dom.closest(self, 'wb-row');
        // we want to remove the row, but not if it is the last one
        if (row.previousElementSibling || (row.nextElementSibling &&
                row.nextElementSibling.localName === 'wb-row')) {
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
    ValueProto.createdCallback = function valueCreated() {
        // Add holder, input or select, or block
        var blockParent = dom.closest(this, 'wb-expression, wb-step, wb-context');
        // See if we're already initialized (if cloned, for instance)
        var value = this.getAttribute('value');
        var input;
        if (dom.child(this, 'input, select, wb-expression')) {
            if (value) {
                input = dom.child(this, 'input, select');
                if (input) {
                    input.value = value;
                }
            }
            return;
        }
        if (blockParent.localName === 'wb-expression' && blockParent.hasAttribute('instanceof')) {
            // this is an instance variable
            return;
        }
        // Sets the proper HTML input for the given Waterbear type.
        var types = (this.getAttribute('type') || '').split(',');
        var list;
        switch (types[0]) {
            // FIXME: Support multiple types on a value (comma-separated)
            case 'number':
            case 'text':
            case 'color':
                input = elem('input', {
                    type: types[0]
                });
                if (this.hasAttribute('min')) {
                    input.setAttribute('min', this.getAttribute('min'));
                }
                if (this.hasAttribute('max')) {
                    input.setAttribute('max', this.getAttribute('max'));
                }
                this.appendChild(input);
                input.value = value;
                break;
            case 'image':
                input = elem('input', {
                    type: 'wb-image'
                });
                this.appendChild(input);
                input.value = value;
                break;
            case 'list':
                list = this.getAttribute('options').split(',');
                input = dom.createSelect(list, value);
                this.appendChild(input);
                break;
            case 'boolean':
                input = dom.createSelect(['true', 'false'], value);
                this.appendChild(input);
                break;
            case 'any':
                input = elem('input', {
                    type: 'any'
                });
                this.appendChild(input);
                if (input !== '') {
                    input.value = value;
                }
                break;
            default:
                if (types.length && types[0] !== '') {
                    // block types, only drop blocks of proper type, no direct input
                    input = elem('input', {
                        type: types[0]
                    });
                    this.appendChild(input);
                    input.readOnly = true;
                }
                break;
        }
        if (input) {
            resize(input);
        }
    };
    ValueProto.getValue = function() {
        // All versions of getValue eventually call this
        var block = dom.child(this, 'wb-expression');
        if (block) {
            return [block.run()];
        }
        var input = dom.child(this, 'input, select');
        if (!this.type) {
            this.type = this.getAttribute('type') || 'text';
        }
        var value;
        if (input) {
            value = input.value;
        } else {
            value = this.getAttribute('value');
        }
        // FIXME: We need to be able to adapt return types based on arguments
        var primaryType = this.type.split(',')[0];
        if (convert[primaryType]) {
            return [convert[primaryType](value)];
        } else {
            return [value];
        }
    };

    window.WBValue = document.registerElement('wb-value', {
        prototype: ValueProto
    });


    function toggleFilter(evt) {
        if (dom.closest(evt.target, 'wb-local')){
            return;
        }
        var origTarget = evt.target;
        var triggerFilter = origTarget.localName === 'input';
        var value = dom.closest(evt.target, 'wb-value');

        if (BLOCK_MENU.getAttribute('filtered') === 'true') {
            app.clearFilter();

            // filter on value which is the next value for selectedItem
            if (value && value.matches('wb-value') && triggerFilter) {
                app.setFilter(value);
            }
        } else if (value && triggerFilter) {
            app.setFilter(value);
        }

    }

    //when a user clicks on an input box in the workspace
    function changeValueOnInputChange(evt) {
        dom.closest(evt.target, 'wb-value').setAttribute('value', evt.target.value);
    }


    var convert = {
        boolean: function(text) {
            return text === 'true';
        },
        number: function(text) {
            return +text;
        },
        any: function(text) {
            return util.isNumber(text) ? +text : text;
        }
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
        get: function() {
            return this.firstElementChild;
        }
    });

    ContainsProto.getAllContextLocals = function() {
        return dom.closest(this, 'wb-context, wb-workspace').getAllContextLocals();
    };

    ContainsProto.getFreeInstances = BlockProto.getFreeInstances;

    window.WBContains = document.registerElement('wb-contains', {
        prototype: ContainsProto
    });

    /* DRAGGING */

    var dragTarget = null;
    var dragStart = '';
    var dropTarget = null;
    var blockTop = 0;
    var undoDrag = [];

    function startDragBlock(evt) {
        // Don't start dragging if ctrl is down (menu interferes)
        if (Event.keys.ctrl) {
            return;
        }
        dragTarget = dom.closest(evt.target, 'wb-step, wb-context, wb-expression');
        if (dom.matches(dragTarget, 'sidebar *, wb-local *')){
            dragTarget = dom.clone(dragTarget);
            dragStart = 'menu';
        }else{
            undoDrag.push(dragTarget.undoableRemove());
            dragStart = 'script';
        }
        
        // Show trash can, should be in app.js, not block.js
        blockTop = BLOCK_MENU.scrollTop;
        BLOCK_MENU.classList.add('trashcan');

        workspace.classList.add('block-dragging');
        // FIXME: Highlight droppable places (or grey out non-droppable)

        document.body.appendChild(dragTarget);

        dragTarget.classList.add('dragging');
        dragTarget.style.left = (evt.pageX - 15) + 'px';
        dragTarget.style.top = (evt.pageY - 15) + 'px';
    }


    function checkForScroll(evt) {
        requestAnimationFrame(checkForScroll);
        if (!dragTarget) {
            return;
        }
        var x = Event.pointerX;
        var y = Event.pointerY;
        var rect = scriptspace.getBoundingClientRect();
        if (x < rect.left) {
            scriptspace.scrollLeft -= 5;
        } else if (x > rect.right) {
            scriptspace.scrollLeft += 5;
        }
        if (y < rect.top) {
            scriptspace.scrollTop -= 5;
        } else if (y > rect.bottom) {
            scriptspace.scrollTop += 5;
        }
    }

    function markDropTarget(block) {
        var oldDropTargets = dom.findAll(workspace, '.drop-target');
        oldDropTargets.forEach(function(dt) {
            if (dt !== dropTarget) {
                dt.classList.remove('drop-target');
            }
        });
        block.classList.add('drop-target');
    }

    function canInsertHere(block, target){
        if (!isInsertionInScope(block, target)){
            return {test: false, reason: 'instances can only be dropped within the scope of their local'};
        }
        if (dom.matches(block, 'wb-expression')){
            return canInsertExpressionHere(block, target);
        }else{
            return canInsertStepHere(block, target);
        }
    }
    
    function insertHere(block, target, evt /*optional, only used in dragging */){
        if (dom.matches(block, 'wb-expression')) {
            if (dom.matches(target, 'wb-value')) {
                BLOCK_MENU.removeAttribute('filtered'); // FIXME: where does this go?
                return block.undoableInsert(target);
            } else if (dom.matches(target, 'wb-context, wb-step, wb-contains')) {
                // Create variable block to wrap the expression
                return addToContains(createVariableBlock(block), target, evt);
            }
        } else if (dom.matches(target, 'wb-context, wb-step, wb-contains')) {
            return addToContains(block, target, evt);
        }
        throw new Exception('You cannot insert ' + block.localName + ' on ' + target.localName);
    }

    function canInsertExpressionHere(block, target){
        // FIXME: Check for scope
        // Can't insert into literals
        if (dom.matches(target, 'wb-value[allow="literal"], wb-value[allow="literal"] *')) {
            return {test: false, reason: 'cannot insert on direct input value'};
        }
        // Can't insert variables anywhere but update variable
        if (dom.matches(target, 'wb-value[allow="variable"], wb-value[allow="variable"] *')) {
            if (!dom.matches(block, '[fn="getVariable"]')) {
                return {test: false, reason: 'can only insert variables on update variable'};
            }
        }
        var origTarget = target;
        target = dom.closest(target, 'wb-value[type]:not([allow="literal"])');
        // if no longer a target, try dropping as a step
        if (!target){
            return canInsertStepHere(block, origTarget);
        }
        // Can't drop if there is already an expression in the socket
        if (dom.child(target, 'wb-expression:not(.hide)')) {
            return {test: false, reason: 'cannot insert an expression on another expression'};
        }
        // Only drop on matching types
        var dropTypes = target.getAttribute('type').split(','); // FIXME: remove excess whitespace
        var dragType = block.getAttribute('type');
        if (dragType === 'any' || dropTypes.indexOf('any') > -1 || dropTypes.indexOf(dragType) > -1) {
            return {test: true, target: target, tip: 'insert here to add block to script'};
        } else {
            return {test: false, reason: 'cannot insert a ' + dragType + ' block on a ' + dropTypes.join(',') + ' value'};
        }
        // what should the default be here?
        return {test: false, reason: 'cannot insert on ' + target.localName};
    }

    function canInsertStepHere(block, target){
        target = dom.closest(target, 'wb-step, wb-context, wb-contains, wb-value');
        // FIXME: Don't drop onto locals
        if (!target){
            return {test: false, reason: 'drop anywhere else (or hit Esc) to cancel the drag'};
        }
        if (dom.matches(target, 'wb-value')) {
            return {test: false, reason: 'you cannot insert a ' + block.localName + ' on a value block'};
        }
        if (dom.matches(target, 'wb-contains')) {
            return {test: true, target: target, tip: 'drop to add to top of the block container'};
        }
        if (dom.matches(target, 'wb-context, wb-step')) {
            return {test: true, target: target, tip: 'drop to add after this block'};
        }   
        return {test: false, reason: 'you cannot insert a ' + block.localName + ' on a ' + target.localName};
    }

    function dragBlock(evt) {
        if (!dragTarget) {
            return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        // FIXME: hardcoded margin (???) values.
        // Essentially, the block is always dragged at an area 15 px away from the
        // top-left corner.
        dragTarget.style.left = (evt.pageX - 15) + 'px';
        dragTarget.style.top = (evt.pageY - 15) + 'px';
        var potentialDropTarget = document.elementFromPoint(evt.pageX, evt.pageY);

        // Check if the user dragged over the sidebar.
        if (dom.matches(potentialDropTarget, 'sidebar, sidebar *')) {
            dropTarget = BLOCK_MENU;
            dropTarget.classList.add('no-drop');
            app.warn('drop here to delete block(s)');
            return;
        }

        var canInsert = canInsertHere(dragTarget, potentialDropTarget);
        if (!canInsert.test){
            potentialDropTarget.classList.add('no-drop');
            app.warn(canInsert.reason);
            dropTarget = null;
        }else{
            dropTarget = canInsert.target;
            markDropTarget(dropTarget);
            if (canInsert.tip){
                app.tip(canInsert.tip);
            }
        }
    }

    function isInsertionInScope(block, target){
        var localId = block.getAttribute('instanceof');
        if (localId) {
            var local = document.getElementById(localId);
            if (!local){
                return false; // can happen when pasting from another document
            }
            var localContext = dom.closest(local, 'wb-contains');
            if (!localContext.contains(target) && localContext !== target) {
                return false;
            }
        }
        return true;
    }


    function addToContains(block, target, evt) {
        // dropping directly into a contains section
        // insert as the first block unless dropped after the entire script
        if (dom.matches(target, 'wb-contains')) {
            if (target.children.length && evt && evt.pageY > target.lastElementChild.getBoundingClientRect().bottom) {
                return block.undoableInsert(target);
            } else {
                return block.undoableInsert(target, target.firstElementChild);
            }
        } else {
            // dropping on a block in the contains, insert after that block
            return block.undoableInsert(target.parentElement, target.nextElementSibling);
        }
    }
    
    /**
        Variable Glossary:
        dragStart = 'script' or 'menu', depending on where the original block is located (local vars also use 'menu' so they aren't hidden)
        dragTarget = the cloned block that is being dragged
        dropTarget = the block (or position) the clone is being dropped into
    **/
    function endDragBlock(evt) {
        var undoEvent = undoDrag;
        if (!dragTarget) {
            // Sometimes we get spurious drags, ignore
            return cancelDragBlock();
        }
        if (!dropTarget) {
            // No legal target, probably outside of workspace
            return cancelDragBlock();
        }
        if (dropTarget === BLOCK_MENU) {
            // Drop on script menu to delete block
            dom.remove(dragTarget);
        }else if (canInsertHere(dragTarget, dropTarget)){
            undoEvent.push(insertHere(dragTarget, dropTarget, evt));
        } else {
            /* something unexpected, cancel drag */
            return cancelDragBlock();
        }
        Undo.addNewEvent(undoEvent);
        resetDragging();
    }

    function cancelDragBlock() {
        if (dragTarget){
            dom.remove(dragTarget);
        }
        if (undoDrag.length) {
            Undo.partialUndo(undoDrag);
        }
        resetDragging();
    }

    // Handle resizing inputs when their content changes
    function resizeInputOnChange(evt) {
        var target = evt.target;
        if (!dom.matches(target, 'wb-value > input')) {
            return;
        }
        resize(target);
        Event.trigger(target, 'wb-changed', evt.target.value);
    }

    function resetDragging() {
        if (dragTarget) {
            dragTarget.classList.remove('dragging');
            dragTarget.removeAttribute('style');
        }
        dragTarget = null;
        dragStart = '';
        dropTarget = null;
        undoDrag = [];
        app.info('');
        // Hide trash can, should be in app.js, not block.js
        BLOCK_MENU.classList.remove('trashcan');
        BLOCK_MENU.scrollTop = blockTop;
        workspace.classList.remove('block-dragging');
        dropTarget = dom.find(document.body, '.drop-target');
        if (dropTarget) {
            dropTarget.classList.remove('drop-target');
        }
        dom.findAll(document.body, '.no-drop').forEach(function(e) {
            e.classList.remove('no-drop');
        });
    }

    /* End Dragging */

    /**
     * Creates a new "set variable" step.
     * If `initialValue` is not null, it should be a <wb-expression>.
     *
     */
    function createVariableBlock(initialValue) {
        // Make ourselves a clone of the original.
        var originalSetVariable = dom.find('sidebar wb-step[fn="setVariable"]');
        console.assert(originalSetVariable, 'Could not find setVariable block');
        var variableStep = dom.clone(originalSetVariable);

        // Set the expression here.
        variableStep
            .querySelector('wb-value[type="any"]')
            .appendChild(initialValue);
        return variableStep;
    }



    // Event handling

    // Make sure wb-added, wb-addedChild, wb-removedChild events are triggered
    // signature is container, prefix, parentList, elementList
    Event.registerElementsForAddRemoveEvents(workspace, 'wb-', 'wb-step, wb-context, wb-expression, wb-contains', 'wb-step, wb-context, wb-expression');

    Event.on(workspace, 'editor:wb-added', 'wb-expression', updateVariableType);
    Event.on(workspace, 'editor:wb-added', 'wb-context, wb-step', uniquifyVariableNames);
    Event.on(document.body, 'editor:wb-cloned', '[fn="getVariable"]', createLocalToInstanceAssociation);

    Event.on(workspace, 'editor:click', 'wb-disclosure', toggleClosed);
    Event.on(workspace, 'editor:input', 'input[type="number"]', handleInputOnBalance);
    // Add/remove rows from expressions
    Event.on(workspace, 'editor:click', '.add-item', addItem);
    Event.on(workspace, 'editor:click', '.remove-item', removeItem);

    Event.on(document.body, 'editor:drag-start', 'wb-step, wb-step *, wb-context, wb-context *, wb-expression, wb-expression *', startDragBlock);
    Event.on(document.body, 'editor:dragging', null, dragBlock);
    Event.on(document.body, 'editor:drag-end', null, endDragBlock);
    Event.on(document.body, 'editor:drag-cancel', null, cancelDragBlock);

    // allow blocks to be dragged to parts of the script which are out of current view
    requestAnimationFrame(checkForScroll);


    Event.on(workspace, 'editor:input', 'input', resizeInputOnChange);
    Event.on(workspace, 'editor:input', 'input, select', changeValueOnInputChange);

    Event.on(workspace, 'editor:input', 'wb-local input', handleVariableInput);
    Event.on(workspace, 'editor:blur', 'wb-local input', handleVariableBlur); // Mozilla
    Event.on(workspace, 'editor:focusout', 'wb-local input', handleVariableBlur); // All other browsers

    Event.on(workspace, 'editor:click', '*', toggleFilter);

    window.Block = {
        proto : BlockProto,
        valueProto: ValueProto,
        containedProto: ContainsProto,
        canInsertHere: canInsertHere,
        insertHere: insertHere
    };

})();
