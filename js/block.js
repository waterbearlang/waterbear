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
        input.style.width = Math.max((textwidth + 5), 30) + 'px';
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
            var list = wb.choiceLists[listName];
            this.appendChild(wb.createSelect(list, value));
            break;
        case 'block':
            alert('FIXME');
            break;
        case 'any':
            input = elem('input', {type: 'any'});
            this.appendChild(input);
            console.log('FIXME');
            break;
        default:
            throw new Error('Type ' + type + ' is not supported for value types');
    }
    resize(input);
};
window.WBValue = document.registerElement('wb-value', {prototype: ValueProto});


var ContainedProto = Object.create(HTMLElement.prototype);
window.WBContained = document.registerElement('wb-contained', {prototype: ContainedProto});

// Layout elements

var SearchProto = Object.create(HTMLElement.prototype);
window.WBSearch = document.registerElement('wb-search', {prototype: SearchProto});

var AccordionProto = Object.create(HTMLElement.prototype);
window.WBAccordion = document.registerElement('wb-accordion', {prototype: AccordionProto});


// (function(wb, Event){
// 'use strict';
//     var elem = wb.elem;



//     function getScript(id){
//         // TODO
//     }

//     // Get socket elements from live block
//     function getSockets(block){
//         return wb.findChildren(wb.findChild(block, '.label'), '.socket');
//     }

//     function createBlock(args){
//         // args: scriptname, keywords, tags, help, sockets, [type], [closed]
//         var block = elem(
//             'block',
//             {
//                 'keywords': JSON.stringify(args.keywords), // do we need both keywords and tags?
//                 'tags': JSON.stringify(args.tags),
//                 'title': args.help
//             },
//             elem('blockhead', {}, wb.socket.mapCreate(args.sockets))
//         );
//         if (args.type){ // expressions only
//             block.dataset.type = args.type; // capture type of expression blocks
//         }
//         if (args.closed){
//             block.dataset.closed = true;
//         }
//         // context only
//         block.appendChild(elem('div', {'class': 'locals block-menu'}));
//         var contained = elem('div', {'class': 'contained'});
//         block.appendChild(contained);
//         if (args.contained){
//             args.contained.map(function(childdesc){
//                 var child = createBlock(childdesc);
//                 contained.appendChild(child);
//                 addStep({target: child}); // simulate event
//             });
//             if (! wb.matches(block, '.scripts-workspace')){
//                 var label = wb.findChild(block, '.label');
//                 label.insertBefore(elem('div', {'class': 'disclosure'}), label.firstElementChild);
//             }
//         }
//         return block;
//     }

//     // Block Event Handlers

//     function removeBlock(event){
//         event.stopPropagation();
//         var block = event.target;
//         if (wb.matches(block, '.expression')){
//             removeExpression(block);
//         }else{
//             removeStep(block);
//         }
//         Event.trigger(document.body, 'wb-modified', {block: block, type: 'removed'});
//     }

//     function addBlock(event){
//         event.stopPropagation();
//         if (wb.matches(event.target, '.expression')){
//             addExpression(event);
//         }else if(wb.matches(event.target, '.scripts-workspace')){
//             addWorkspace(event);
//         }else{
//             addStep(event);
//         }
//         Event.trigger(document.body, 'wb-modified', {block: event.target, type: 'added'});
//     }


//     function removeStep(block){
//         // About to remove a block from a block container, but it still exists and can be re-added
//         removeLocals(block);
//     }

//     function removeLocals(block){
//         // Remove instances of locals
//         if (block.classList.contains('step') && !block.classList.contains('context')){
//             var parent = wb.closest(block, '.context');
//             if (parent){
//                 var locals = wb.findAll(parent, '[data-local-source="' + block.id + '"]');
//                 locals.forEach(function(local){
//                     if (!local.isTemplateBlock){
//                         Event.trigger(local, 'wb-remove');
//                     }
//                     local.parentElement.removeChild(local);
//                 });
//                 delete block.dataset.localsAdded;
//             }
//         }
//         return block;
//     }

//     function removeExpression(block){
//         // Remove an expression from an expression holder, say for dragging
//         // Revert socket to default
//         //  ('remove expression %o', block);
//         wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
//             elem.removeAttribute('style');
//         });
//     }

//     function addWorkspace(event){
//     }

//     function addStep(event){
//         // Add a block to a block container
//         var block = event.target;
//         if (block.dataset.locals && block.dataset.locals.length && !block.dataset.localsAdded){
//             var parent = wb.closest(block, '.context');
//             if (!parent){
//                 // We're putting a block into the Scratchpad, ignore locals
//                 return;
//             }
//             var parsedLocals = addLocals(block, parent);
//             block.dataset.locals = JSON.stringify(parsedLocals);
//         }
//     }

//     function addExpression(event){
//         // add an expression to an expression holder
//         // hide or remove default block
//         var block = event.target;
//         wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
//             elem.style.display = 'none';
//         });
//         if (event.stopPropagation){
//             event.stopPropagation();
//         }
//     }

//     function addLocals(block, parent){
//         var locals = wb.findChild(parent, '.locals');
//         JSON.parse(block.dataset.locals).forEach(
//             function(spec){
//                 locals.appendChild(createBlock(spec));
//             }
//         );
//     }

//     function addExpressionCodeMap(block){
//         wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
//             elem.style.display = 'none';
//         });
//     }

//     function blockDesc(block){
//         // get save format, also used for cloning
//         var label = wb.findChild(block, '.label');
//         var sockets = wb.findChildren(label, '.socket');
//         var desc = {
//             sockets: sockets.map(wb.socket.description)
//         };

//         if (block.dataset.locals){
//             desc.locals = JSON.parse(block.dataset.locals);
//         }
//         if (block.dataset.closed){
//             // maintain open/closed widgets, might be better in a parallele IDE local state?
//             desc.closed = true;
//         }
//         var contained = wb.findChild(block, '.contained');
//         if (contained && contained.children.length){
//             desc.contained = wb.findChildren(contained, '.block').map(blockDesc);
//         }
//         return desc;
//     }

//     function blockValidate(block){
//         var valid = true;
//         block.classList.remove('invalid');
//         // Are the block's sockets valid?
//         var sockets = socketsForBlock(block);
//         for (var i = 0; i < sockets.length; i++){
//             if (!wb.socket.validate(sockets[i])){
//                 valid = false;
//             }
//         }
//         // If a container, does it contain anything?
//         // If it contains anything, are those blocks valid?
//         if (wb.matches(block, '.context')){
//             var containers = containedForBlock(block);
//             containers.forEach(function(children){
//                 if (!children.length){
//                     valid = false;
//                     console.warn('Empty context block: %s', block);
//                     block.classList.add('invalid');
//                 }
//                 for (var j = 0; j < children.length; j++){
//                     if (!blockValidate(children[j])){
//                         valid = false;
//                     }
//                 }
//             });
//         }
//         return valid;
//     }

//     function cloneBlock(block, cloneForCM){
//         // Clone a template (or other) block
//         var blockdesc = blockDesc(block);
//         return createBlock(blockdesc, cloneForCM);
//     }

//     function deleteBlock(event){
//         // delete a block from the script entirely
//         // var block = event.target;
//     }



//     function codeFromBlock(block){
//         // TODO: get code from template's scriptId
//     }

//     function containedForBlock(block){
//         // returns an array with one item for each .contained block
//         // Each item is an array of blocks held by that container
//         if (wb.matches(block, '.context')){
//             return wb.findChildren(block, '.contained').map(function(container){
//                 return wb.findChildren(container, '.block');
//             });
//         }else{
//             return [];
//         }
//     }

//     function gatherContained(block){
//         if (wb.matches(block, '.context')){
//             return wb.findChildren(block, '.contained').map(function(container){
//                 return wb.findChildren(container, '.block').map(codeFromBlock).join('');
//             });
//         }else{
//             return [];
//         }
//     }


//     function socketsForBlock(block){
//         var label = wb.findChild(block, '.label');
//         return wb.findChildren(label, '.socket');
//     }

//     function gatherArgs(block){
//         return socketsForBlock(block)
//             .map(function(socket){ return wb.findChild(socket, '.holder'); }) // get holders, if any
//             .filter(function(holder){ return holder; }) // remove undefineds
//             .map(wb.socket.holderValue); // get value
//     }



//     Event.on(document.body, 'wb-remove', '.block', removeBlock);
//     Event.on(document.body, 'wb-add', '.block', addBlock);
//     Event.on('.workspace', 'wb-add', null, addBlock);
//     Event.on(document.body, 'wb-delete', '.block', deleteBlock);

//     // Export methods
//     wb.block = {
//         create: createBlock,
//         addExpression: addExpression,
//         description: blockDesc,
//         validate: blockValidate,
//         clone: cloneBlock,
//         code: codeFromBlock,
//         sockets: getSockets,
//         getSocketDefinitions: getSocketDefinitions
//     };

})();

