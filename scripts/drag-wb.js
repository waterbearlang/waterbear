(function(wb, drag){
    // This is for the waterbear-specific dragging code, to keep drag.js straightforward.
    // After factoring it out to here it should be easier to see where things might go
    // into other files like block.js, workspace.js, etc.

    var workspace; // The Workspace block is created with the function
       // createWorkspace() in the workspace.js file.
       // We grab workspace in reset() because it can change, while the blocks below
       // do not change and we can fetch them once.
    var blockMenu = document.querySelector('#block_menu');
    var scratchpad = document.querySelector('.scratchpad');

    var selectedSocket;
    var templateDrag, localDrag;
    var _dropCursor;
    var dragTarget;
    var currentPosition;
    var dragTimeout = 20;
    var timer;
    var startParent;
    var startSibling;
    var dropTarget;
    var dropRects;
    var scope;
    var potentialDropTargets;
    var startPosition;

    var selectedBlocks = [];
    var selectedInAscOrder;

    // Specific to the code map
    var cloned;
    var cm_cont= document.querySelector('#cm_container');

    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.drop-cursor');
        }
        return _dropCursor;
    }

    function reset(){
        startParent = null;
        startSibling = null;
        dropTarget = null;
        dropRects = [];
        potentialDropTargets = [];
        startPosition = null;
        cloned = false;
        scope = null;
        templateDrag = false;
        localDrag = false;
        workspace = null;
        selectedSocket = null;
        _dropCursor = null;
        dragTarget = null;
        currentPosition = null;
        if (timer){
            clearTimeout(timer);
            timer = null;
        }

        deselectAllBlocks();

        selectedInAscOrder = false;
    }

    function initDrag(event) {
        var target = wb.closest(event.target, '.block');

        // No block was clicked
        if (!target) { return; }

        // Don't start dragging from these elements, unless block is in block menu
        if (wb.matches(event.target, 'input, select, option, .disclosure, .contained, .scripts_workspace') && !wb.matches(target, '#block_menu *')) {
            return;
        }
        // Select block
        selectBlock(target, event.shiftKey);
        if (!selectedBlocks.length){
            return;
        }

        // Set different behavior for template blocks
        if (wb.matches(target.parentElement, '.block-menu')) {
            // Drag from block menu or local variables
            target.dataset.isTemplateBlock = 'true';
            templateDrag = true;

             // Drag from local variables
             if (target.parentElement.classList.contains('locals')) {
                 target.dataset.isLocal = 'true';
                 localDrag = true;
            }
        }


        if (!wb.matches(target.parentElement, '.scripts_workspace')) {
            startParent = target.parentElement;
        }
        startSibling = target.nextElementSibling;
        if(startSibling && !wb.matches(startSibling, '.block')) {
            // Sometimes the "next sibling" ends up being the cursor
            startSibling = startSibling.nextElementSibling;
        }
    }

    function startDrag(event) {
        if (!selectedBlocks.length){
            return;
        }

        // FIXME: Set different listeners on menu blocks than on the script area
        if (localDrag) {
            scope = wb.closest(selectedBlocks[0].parentElement, '.context');
        } else {
            scope = null;
        }

        // Create a div for the selected blocks
        dragTarget = wb.elem('div');
        for (var i = 0; i < selectedBlocks.length; i++) {
            var index = selectedInAscOrder ? i : selectedBlocks.length - 1 - i;
            var clonedBlock = wb.block.clone(selectedBlocks[index]);
            Event.trigger(selectedBlocks[index], 'wb-clone');
            dragTarget.appendChild(clonedBlock);
        }

        // Position the block at the correct location
        if (selectedInAscOrder) {
            startPosition = wb.rect(selectedBlocks[0]);
        } else {
            startPosition = wb.rect(selectedBlocks[selectedBlocks.length - 1]);
        }

        dragTarget.classList.add("dragIndication");
        document.body.appendChild(dragTarget);
        wb.reposition(dragTarget, startPosition);

        // Save the current position for dragging event
        currentPosition = {left: event.pageX, top: event.pageY};

        // Start timer for drag events
        timer = setTimeout(hitTest, dragTimeout);

        potentialDropTargets = getPotentialDropTargets(dragTarget.firstChild);
        dropRects = potentialDropTargets.map(function(elem, idx) {
            elem.classList.add('dropTarget');
            return wb.rect(elem);
        });
    }

    function dragging(event) {
        if (!selectedBlocks.length){
            return;
        }
        var nextPosition = {left: event.pageX, top: event.pageY};
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget);
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        currentPosition = nextPosition;
    }

    function endDrag(event) {
        if (!selectedBlocks.length){
            return;
        }
        clearTimeout(timer);
        timer = null;
        handleDrop(event, event.altKey || event.ctrlKey);
    }

    function cancelDrag(event) {
        if (!selectedBlocks.length){
            return;
        }
        // Cancel if escape key pressed
        clearTimeout(timer);
        timer = null;
        resetDragStyles();
        dragTarget.parentElement.removeChild(dragTarget);
    }

    // HELPERS

    function selectBlock(target, multiselect) {
        // Handle single selection
        if (!multiselect) {
            // Select the block if it is not selected
            // Ignore the selection if it is already selected
            if (selectedBlocks.indexOf(target) == -1) {
                deselectAllBlocks();
                target.classList.add("selected");
                selectedBlocks.push(target);
            }

            return;
        }

        // Disable multiselect for blocks outside of the workspace
        if (wb.closest(target, '.scripts_workspace') === null) { return; }

        // Disable multiselect for blocks in the block menu
        if (wb.matches(target.parentElement, '.block-menu')) { return; }

        // Handle multiple selection
        var nodes = wb.makeArray(selectedBlocks[0].parentNode.children);
        var firstIndex = nodes.indexOf(selectedBlocks[0]);
        var targetIndex = nodes.indexOf(target);

        // Only select blocks if target block is on the same level
        if (targetIndex > -1) {
            // FIXME: Inefficient algorithm
            deselectAllBlocks();

            var step;

            if (firstIndex < targetIndex) {
                selectedInAscOrder = true;
                step = 1;
            } else {
                selectedInAscOrder = false;
                step = -1;
            }

            for (var i = firstIndex; i != targetIndex; i += step) {
                nodes[i].classList.add("selected");
                selectedBlocks.push(nodes[i]);
            }

            target.classList.add("selected");
            selectedBlocks.push(target);
        }
    }

    function deselectAllBlocks() {
        while (selectedBlocks.length > 0) {
            selectedBlocks.pop().classList.remove("selected");
        }
    }

    function deleteAllSelectedBlocks() {
        for (var i = 0; i < selectedBlocks.length; i++) {
            selectedBlocks[i].classList.remove('selected');
            Event.trigger(selectedBlocks[i], 'wb-remove');
            Event.trigger(selectedBlocks[i], 'wb-delete');
            selectedBlocks[i].parentElement.removeChild(selectedBlocks[i]);
        }

        selectedBlocks.length = 0;
    }

    function handleDrop(event, copyBlock) {
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        var childNodes = dragTarget.childNodes;

        if (wb.overlap(dragTarget, blockMenu)) {
            // Delete block if dragged back to menu
            if (!templateDrag) {
                deleteAllSelectedBlocks();
            }

            // Add history action if the source block was in the workspace
        } else if (wb.overlap(dragTarget, scratchpad)) {
            var scratchPadStyle = scratchpad.getBoundingClientRect();
            var newOriginX = scratchPadStyle.left;
            var newOriginY = scratchPadStyle.top;

            var height = 0;

            while (childNodes.length > 0) {
                var blockStyle = childNodes[0].getBoundingClientRect();
                var oldX = blockStyle.left;
                var oldY = blockStyle.top;

                childNodes[0].removeAttribute('style');
                childNodes[0].style.position = "absolute";
                childNodes[0].style.left = (oldX - newOriginX) + "px";
                childNodes[0].style.top = (oldY - newOriginY + height) + "px";

                height += blockStyle.bottom - blockStyle.top;

                scratchpad.appendChild(childNodes[0]);
            }

            if (!templateDrag) {
                deleteAllSelectedBlocks();
            }
        } else if (wb.overlap(dragTarget, cm_cont)) {
            // Ignore dragging blocks to code map
        } else if (dropTarget) {
            //moving around when dragged block is moved in scratchpad
            dropTarget.classList.remove('dropActive');

            // NOTE: dragTarget.childNodes[0] will be undefined after it is
            // moved to dropTarget. So we need to create a reference to it
            // if we want to use it later.
            var firstChild = childNodes[0];

            if (wb.matches(firstChild, '.step')) {
                // Drag a step to snap to a step
                while (childNodes.length > 0) {
                    firstChild = childNodes[0];
                    dropTarget.insertBefore(firstChild, dropCursor());
                    firstChild.removeAttribute('style');
                    Event.trigger(firstChild, 'wb-add');
                }

            } else {
                // Insert a value block into a socket
                dropTarget.appendChild(firstChild);
                firstChild.removeAttribute('style');
                Event.trigger(firstChild, 'wb-add');
            }

            if (!copyBlock && !templateDrag) {
                // FIXME: This results in two blocks if you copy-drag back to the starting socket
                // TODO: Check if this is fixed
                deleteAllSelectedBlocks();
            }
        }

        resetDragStyles();
        dragTarget.parentElement.removeChild(dragTarget);
    }

    function resetDragStyles() {
        if (dragTarget){
            dragTarget.classList.remove('dragActive'); // TODO: Is this deprecated?
            dragTarget.classList.remove('dragIndication');
        }
        potentialDropTargets.forEach(function(elem){
            elem.classList.remove('dropTarget');
        });
    }

    function revertDrop() {
        // Put blocks back where we got them from
        if (startParent){
            if (wb.matches(startParent, '.socket')){
                // wb.findChildren(startParent, 'input').forEach(function(elem){
                //     elem.hide();
                // });
            }
            if(startSibling) {
                startParent.insertBefore(dragTarget, startSibling);
            } else {
                startParent.appendChild(dragTarget);
            }
            dragTarget.removeAttribute('style');
            startParent = null;
        }else{
            workspace.appendChild(dragTarget); // FIXME: We'll need an index into the canvas array
            wb.reposition(dragTarget, startPosition);
        }
        Event.trigger(dragTarget, 'wb-add');
    }

    function positionExpressionDropCursor(){
        if (!potentialDropTargets.length){
            // console.log('no drop targets found');
            return;
        }
        var targets = potentialDropTargets.map(function(target){
            return [wb.overlap(dragTarget, target), target];
        });
        targets.sort().reverse();
        if(dropTarget){
            dropTarget.classList.remove('dropActive');
        }
        dropTarget = targets[0][1]; // should be the potential target with largest overlap
        dropTarget.classList.add('dropActive');
    }

    function positionDropCursor(){
        var dragRect = wb.rect(wb.findChild(dragTarget.firstChild, '.label'));
        var cy = dragRect.top + dragRect.height / 2; // vertical centre of drag element
        // get only the .contains which cx is contained by
        var overlapping = potentialDropTargets.filter(function(item){
            var r = wb.rect(item);
            if (cy < r.top) return false;
            if (cy > r.bottom) return false;
            return true;
        });
        overlapping.sort(function(a, b){
            return wb.rect(b).left - wb.rect(a).left; // sort by depth, innermost first
        });
        if (!overlapping.length){
            workspace.appendChild(dropCursor());
            dropTarget = workspace;
            return;
        }
        dropTarget = overlapping[0];
        var position, middle;
        var siblings = wb.findChildren(dropTarget, '.step');
        if (siblings.length){
            for (var sIdx = 0; sIdx < siblings.length; sIdx++){
                var sibling = siblings[sIdx];
                position = wb.rect(sibling);
                if (cy < (position.top -4) || cy > (position.bottom + 4)) continue;
                middle = position.top + (position.height / 2);
                if (cy < middle){
                    dropTarget.insertBefore(dropCursor(), sibling);
                    return;
                }else{
                    dropTarget.insertBefore(dropCursor(), sibling.nextSibling);
                    return;
                }
            }
            dropTarget.appendChild(dropCursor()); // if we get here somehow, add it anyway
        }else{
            dropTarget.appendChild(dropCursor());
            return;
        }
    }

    function selectSocket(event){
        // FIXME: Add tests for type of socket, whether it is filled, etc.
        event.target.classList.add('selected');
        selectedSocket = event.target;
    }

    function hitTest(){
        // test the dragging rect(s) against the target rect(s)
        // test all of the left borders first, then the top, right, bottom
        // goal is to eliminate negatives as fast as possible
        if (!dragTarget) {return;}
        if (wb.matches(dragTarget.firstChild, '.expression')) {
            positionExpressionDropCursor();
        }else{
            positionDropCursor();
        }
        setTimeout(hitTest, dragTimeout);
    }

    function expressionDropTypes(expressionType){
        switch(expressionType){
            case 'number': return ['.number', '.int', '.float', '.any'];
            case 'int': return ['.number', '.int', '.float', '.any'];
            case 'float': return ['.number', '.float', '.any'];
            case 'any': return [];
            default: return ['.' + expressionType, '.any'];
        }
    }

    function hasChildBlock(elem){
        // FIXME, I don't know how to work around this if we allow default blocks
        return !wb.findChild(elem, '.block');
    }

    function getPotentialDropTargets(view){
        if (!workspace){
            workspace = document.querySelector('.scripts_workspace').querySelector('.contained');
        }
        var blocktype = view.dataset.blocktype;
        switch(blocktype){
            case 'step':
            case 'context':
                if (scope){
                    return wb.findAll(scope, '.contained');
                }else{
                    return wb.findAll(workspace, '.contained').concat([workspace]);
                }
                break;
            case 'asset':
            case 'expression':
                var selector = expressionDropTypes(view.dataset.type).map(dataSelector).join(',');
                if (!selector || !selector.length){
                    selector = '.socket > .holder'; // can drop an any anywhere
                }
                if (scope){
                    return wb.findAll(scope, selector).filter(hasChildBlock);
                }else{
                    return wb.findAll(workspace, selector).filter(hasChildBlock);
                }
                break;
            case 'eventhandler':
                return [workspace];
            default:
                throw new Error('Unrecognized blocktype: ' + blocktype);
        }
    }

    function dataSelector(name){
        if (name[0] === '.'){
            name = name.slice(1); // remove leading dot
        }
        return '.socket[data-type=' + name + '] > .holder';
    }

    function getClickedBlock(element, event) {
        var children = element.childNodes;
        //console.log(children);
        var x = event.clientX;
        var y = event.clientY;

        for (var i = 0; i < children.length; i++){
            if (children[i].nodeType != 3) {
                var r = children[i].getBoundingClientRect();
                if (r.bottom > y && r.top < y && r.left < x && r.right > x) {
                    return children[i];
                }
            }
        }
        return false;
    }

    function menuToScratchpad(event) {
        // console.log('menuToScratchpad');
        if(!wb.matches(event.target, '.cloned')){
            console.log('cloning and sending');
            var cloned = wb.block.clone(wb.closest(event.target, '.block'));
            scratchpad.appendChild(cloned);
        }else{
            console.log('where are the clones? send in the clones!');
        }
    }

    //This function arranges the blocks into a grid. Future functions could
    //sort the blocks by type, frequency of use, or other such metrics
    function arrangeScratchpad(event) {
        var PADDING = 8;

        var scratchPadRect = scratchpad.getBoundingClientRect();
        var width = scratchPadRect.width;
        var xOrigin = 5;
        var yOrigin = 5;

        var x = xOrigin;
        var y = yOrigin;

        var children = scratchpad.childNodes;
        var maxHeight = 0;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeType != 3) {
                var r = children[i];

                var rBounding = r.getBoundingClientRect();
                if (rBounding.height > maxHeight) {
                    maxHeight = rBounding.height;
                }
                r.style.top = y + "px";
                r.style.left = x + "px";
                x += rBounding.width + PADDING;

                if (x >= width - 25) {
                    //We are going into a new row.
                    x = xOrigin;
                    y += maxHeight + PADDING;
                    maxHeight = 0;
                }
            }
        }
    }

    // Initialize event handlers
    wb.initializeDragHandlers = function(){
        // Set Low-Level Handlers
        // console.log('initializeDragHandlers');
        Event.on('.content', 'touchstart', '.block', drag.init);
        Event.on('.content', 'touchmove', null, drag.dragging);
        Event.on('.content', 'touchend', null, drag.end);
        // TODO: A way to cancel touch drag?
        // REFACTOR: Move Scratchpad code to own file
        Event.on('.content', 'dblclick', '.scratchpad', arrangeScratchpad);
        Event.on('.content', 'click', '.blocks-menu .block', menuToScratchpad);
        Event.on('.content', 'mousedown', '.block', drag.init);
        Event.on('.content', 'mousemove', null, drag.dragging);
        Event.on(window, 'mouseup', null, drag.end);
        Event.on(document.body, 'keyup', null, drag.cancel);

        // Set high-level handlers
        Event.on(document, 'drag-reset', null, reset);
        Event.on('.content', 'drag-init', '.block', initDrag);
        Event.on('.content', 'drag-start', '.block', startDrag);
        Event.on('.content', 'dragging', null, dragging);
        Event.on('.content', 'drag-end', null, endDrag);
        Event.on(document, 'drag-cancel', null, cancelDrag);

        reset(); // initialization kick
    };


})(wb, drag);
