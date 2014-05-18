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
    }

    function initDrag(event){
        var target = wb.closest(event.target, '.block');
        if (!target){ return; }
        // don't start dragging from these elements, unless block is in block menu
        if (wb.matches(event.target, 'input, select, option, .disclosure, .contained') && !wb.matches(target, '#block_menu *')) {
            return;
        }
        dragTarget = target;
        if (target.parentElement.classList.contains('block-menu')){            //console.log('target parent: %o', target.parentElement);
            target.dataset.isTemplateBlock = 'true';
            templateDrag = true;
        }
        if (target.parentElement.classList.contains('locals')){
            target.dataset.isLocal = 'true';
            localDrag = true;
        }
        //dragTarget.classList.add("dragIndication");
        startPosition = wb.rect(target);
        if (! wb.matches(target.parentElement, '.scripts_workspace')){
            startParent = target.parentElement;
        }
        startSibling = target.nextElementSibling;
        if(startSibling && !wb.matches(startSibling, '.block')) {
            // Sometimes the "next sibling" ends up being the cursor
            startSibling = startSibling.nextElementSibling;
        }
    }

    function startDrag(event){
        dragTarget.classList.add("dragIndication");
        // start timer for drag events
        timer = setTimeout(hitTest, dragTimeout);

        currentPosition = {left: event.pageX, top: event.pageY};
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
        if (dragTarget.dataset.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            // console.log('set drag target to clone of old drag target');
            dragTarget = wb.cloneBlock(dragTarget); // clones dataset and children, yay
            dragTarget.classList.add('dragIndication');
            if (localDrag){
                scope = wb.closest(parent, '.context');
            }else{
                scope = null;
            }
            cloned = true;
        }else{
            // TODO: handle detach better (generalize restoring sockets, put in language file)
            // FIXME: Always clone, remove on drop when needed
            Event.trigger(dragTarget, 'wb-remove');
        }

        // get position and append target to .content, adjust offsets
        // set last offset
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
        dragTarget.style.pointerEvents = 'none'; // FIXME, this should be in CSS
        document.body.appendChild(dragTarget);
        if (cloned){
            // call this here so it can bubble to document.body
            Event.trigger(dragTarget, 'wb-clone');
        }
        wb.reposition(dragTarget, startPosition);
        potentialDropTargets = getPotentialDropTargets(dragTarget);
        dropRects = potentialDropTargets.map(function(elem, idx){
            elem.classList.add('dropTarget');
            return wb.rect(elem);
        });

    }

    function dragging(event){
        var nextPosition = {left: event.pageX, top: event.pageY};
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget);
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        currentPosition = nextPosition;
    }

    function endDrag(event){
        clearTimeout(timer);
        timer = null;
        handleDrop(event,event.altKey || event.ctrlKey);
    }

    function cancelDrag(event) {
        // Cancel if escape key pressed
        clearTimeout(timer);
        timer = null;
        resetDragStyles();
        revertDrop();
    }

    // HELPERS
    
    function handleDrop(event,copyBlock){
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        resetDragStyles();
        if (wb.overlap(dragTarget, blockMenu)){
            // delete block if dragged back to menu
            Event.trigger(dragTarget, 'wb-delete');
            dragTarget.parentElement.removeChild(dragTarget);
            // Add history action if the source block was in the workspace
        } else if (wb.overlap(dragTarget, scratchpad)) {
            var scratchPadStyle = scratchpad.getBoundingClientRect();
            var newOriginX = scratchPadStyle.left;
            var newOriginY = scratchPadStyle.top;

            var blockStyle = dragTarget.getBoundingClientRect();
            var oldX = blockStyle.left;
            var oldY = blockStyle.top;
            dragTarget.removeAttribute('style');
            dragTarget.style.position = "absolute";
            dragTarget.style.left = (oldX - newOriginX) + "px";
            dragTarget.style.top = (oldY - newOriginY) + "px";
            scratchpad.appendChild(dragTarget);
            Event.trigger(dragTarget, 'wb-add');
            return;
        }
        else if(wb.overlap(dragTarget, cm_cont)){
            if (cloned){
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                revertDrop();
            }
        }
        else if (dropTarget){
            //moving around when dragged block is moved in scratchpad
            dropTarget.classList.remove('dropActive');
            if (wb.matches(dragTarget, '.step')){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                if(copyBlock && !templateDrag) {
                    // FIXME: This results in two blocks if you copy-drag back to the starting socket
                    revertDrop();
                    // console.log('clone dragTarget block to dragTarget');
                    dragTarget = wb.cloneBlock(dragTarget);
                }
                dropTarget.insertBefore(dragTarget, dropCursor());
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }else{
                // Insert a value block into a socket
                if(copyBlock && !templateDrag) {
                    revertDrop();
                    // console.log('clone dragTarget value to dragTarget');
                    dragTarget = wb.cloneBlock(dragTarget);
                }
                dropTarget.appendChild(dragTarget);
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                revertDrop();
            }
        }
    }    

    function resetDragStyles() {
        if (dragTarget){
            dragTarget.classList.remove('dragActive');
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
        var dragRect = wb.rect(wb.findChild(dragTarget, '.label'));
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
        if (wb.matches(dragTarget, '.expression')){
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
        if(!wb.matches(event.target, '.cloned')){
            var cloned = wb.cloneBlock(wb.closest(event.target, '.block'));
            scratchpad.appendChild(cloned);
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
        Event.on('.content', 'dblclick', '.scratchpad', arrangeScratchpad);
        Event.on('.content', 'dblclick', '.blockmenu .block', menuToScratchpad);
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