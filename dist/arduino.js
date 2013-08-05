
/*begin queryparams.js*/
// Sets up wb namespace (wb === waterbear)
// Extracts parameters from URL, used to switch embed modes, load from gist, etc.

    	var wb = {};

		// Source: http://stackoverflow.com/a/13984429
		wb.urlToQueryParams = function(url){
		    var qparams = {},
		        parts = (url||'').split('?'),
		        qparts, qpart,
		        i=0;

		    if(parts.length <= 1 ){
		        return qparams;
		    }else{
		        qparts = parts[1].split('&');
		        for(i in qparts){

		            qpart = qparts[i].split('=');
		            qparams[decodeURIComponent(qpart[0])] =
		                           decodeURIComponent(qpart[1] || '');
		        }
		    }

		    return qparams;
		};

		wb.queryParamsToUrl = function(params){
			var base = location.href.split('?')[0];
			var keys = Object.keys(params);
			var parts = [];
			keys.forEach(function(key){
				if (Array.isArray(params[key])){
					params[key].forEach(function(value){
						parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
					});
				}else{
					parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
				}
			});
			return base + '?' + parts.join('&');
		}

	    var q = wb.urlToQueryParams(location.href);
		wb.queryParams = q;
		wb.view = wb.queryParams.view || 'editor';
	    // if they don't have the plugin part of the query string lets send them back home.

/*end queryparams.js*/

/*begin util.js*/
(function(global){
    //
    //
    // UTILITY FUNCTIONS
    //
    // A bunch of these are to avoid needing jQuery just for simple things like matches(selector) and closest(selector)
    //
    //
    // TODO
    // Make these methods on HTMLDocument, HTMLElement, NodeList prototypes

    wb.makeArray = function makeArray(arrayLike){
        return Array.prototype.slice.call(arrayLike);
    };

    wb.reposition = function reposition(elem, position){
        // put an absolutely positioned element in the right place
        // May need to take into account offsets of container
        elem.style.top = position.top + 'px';
        elem.style.left = position.left + 'px';
    };

    wb.hide = function(elem){
        elem.dataset.display = elem.style.display;
        elem.style.display = 'none';
    };

    wb.show = function(elem){
        elem.style.display = elem.dataset.display || 'block';
        delete elem.dataset.display;
    };

    var svgtext = document.querySelector('svg text');
    wb.resize = function(input){
        if (input.wbTarget){
            input = input.wbTarget;
        }
        svgtext.textContent = input.value;
        var textbox = svgtext.getBBox();
        input.style.width = (textbox.width*0.7 + 25) + 'px';
    };

    // wb.mag = function mag(p1, p2){
    //     return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
    // };

    wb.dist = function dist(p1, p2, m1, m2){
        return Math.sqrt(Math.pow(p1 - m1, 2) + Math.pow(p2 - m2, 2));
    };


    wb.overlapRect = function overlapRect(r1, r2){ // determine area of overlap between two rects
        if (r1.left > r2.right){ return 0; }
        if (r1.right < r2.left){ return 0; }
        if (r1.top > r2.bottom){ return 0; }
        if (r1.bottom < r2.top){ return 0; }
        var max = Math.max, min = Math.min;
        return (max(r1.left, r2.left) - min(r1.right, r2.right)) * (max(r1.top, r2.top) - min(r1.bottom, r2.bottom));
    };

    wb.rect = function rect(elem){
        return elem.getBoundingClientRect();
    };

    wb.overlap = function overlap(elem1, elem2){
        return wb.overlapRect(wb.rect(elem1), wb.rect(elem2));
    };

    wb.area = function area(elem){
        return elem.clientWidth * elem.clientHeight;
    };

    wb.containedBy = function containedBy(target, container){
        var targetArea = Math.min(wb.area(target), wb.area(container) * 0.90);
        return target.overlap(container) >= targetArea;
    };

    wb.closest = function closest(elem, selector){
        if (elem.jquery){
            elem = elem[0];
        }
        while(elem){
            if (wb.matches(elem, selector)){
                return elem;
            }
            if (!elem.parentElement){
                throw new Error('Element has no parent, is it in the tree? %o', elem);
            }
            elem = elem.parentElement;
        }
        return null;
    };

    wb.indexOf = function indexOf(elem){
        var idx = 0;
        while(elem.previousSiblingElement){
            elem = elem.previousSiblingElement;
            idx++;
        }
        return idx;
    }

    wb.find = function find(elem, selector){
        return elem.querySelector(selector);
    };

    wb.findAll = function findAll(elem, selector){
        return wb.makeArray(elem.querySelectorAll(selector));
    };

    wb.findChildren = function findChildren(elem, selector){
        return wb.makeArray(elem.children).filter(function(item){
            return wb.matches(item, selector);
        });
    };

    wb.findChild = function(elem, selector){
        if (arguments.length !== 2){
            throw new Exception('This is the culprit');
        }
        var children = elem.children;
        for(var i = 0; i < children.length; i++){
            var child = children[i];
            if (wb.matches(child, selector)){
                return child;
            }
        }
        return null;
    }

    wb.elem = function elem(name, attributes, children){
        // name can be a jquery object, an element, or a string
        // attributes can be null or undefined, or an object of key/values to set
        // children can be text or an array. If an array, can contain strings or arrays of [name, attributes, children]
        var e, val;
        if (name.jquery){
            e = name[0];
        }else if(name.nodeType){
            e = name;
        }else{
            // assumes name is a string
            e = document.createElement(name);
        }
        if (attributes){
            Object.keys(attributes).forEach(function(key){
                if (attributes[key] === null || attributes[key] === undefined) return;
                if (typeof attributes[key] === 'function'){
                    val = attributes[key](attributes);
                    if (val){
                        e.setAttribute(key, val);
                    }
                }else{
                    e.setAttribute(key, attributes[key]);
                }
            });
        }
        if (children){
            if (Array.isArray(children)){
                children.forEach(function(child){
                    if (child.nodeName){
                        e.appendChild(child);
                    }else if (Array.isArray(child)){
                        console.log('DEPRECATED array arg to elem: use sub-elem instead');
                        e.appendChild(elem(child[0], child[1], child[2]));
                    }else{
                        // assumes child is a string
                        e.appendChild(document.createTextNode(child));
                    }
                });
            }else{
                if (children.nodeName){
                    // append single node
                    e.appendChild(children);
                }else{
                    // assumes children is a string
                    e.appendChild(document.createTextNode(children));
                }
            }
        }
        return e;
    };


    // Remove namespace for matches
    if (document.body.matches){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).matches(selector); };
    }else if(document.body.mozMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).mozMatchesSelector(selector); };
    }else if (document.body.webkitMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).webkitMatchesSelector(selector); };
    }else if (document.body.msMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).msMatchesSelector(selector); };
    }else if(document.body.oMatchesSelector){
        wb.matches = function matches(elem, selector){ return wb.elem(elem).oMatchesSelector(selector); };
    }

    // AJAX utilities

    var jsonpHandlers = {};
    wb.jsonp = function(url, callback){
        var id = 'handler' + Math.floor(Math.random() * 0xFFFF);
        var handler = function(data){
            // remove jsonp element
            var script = document.getElementById(id);
            script.parentElement.removeChild(script);
            // remove self
            delete window[id];
            callback(data);
        };
        window[id] = handler;
        document.head.appendChild(wb.elem('script', {src: url + '?callback=' + id, id: id}));
    }




})(this);

/*end util.js*/

/*begin event.js*/
// Bare-bones Event library
// Adds support for event delegation on top of normal DOM events (like jQuery "live" events)
// Minimal support for non-DOM (custom) events
// Normalized between mouse and touch events
// Waterbear specific: events have wb-target which is always a block element

(function(global){
    "use strict";

    var on = function on(elem, eventname, selector, handler){
        if (typeof elem === 'string'){
            return wb.makeArray(document.querySelectorAll(elem)).map(function(e){
                return on(e, eventname, selector, handler);
            });
        }
        if (!elem.tagName){ console.error('first argument must be element'); }
        if (typeof eventname !== 'string'){ console.error('second argument must be eventname'); }
        if (selector && typeof selector !== 'string'){ console.log('third argument must be selector or null'); }
        if (typeof handler !== 'function'){ console.log('fourth argument must be handler'); }
        var listener;
        if (selector){
            listener = function(event){
                blend(event); // normalize between touch and mouse events
                // if (eventname === 'mousedown'){
                //     console.log(event);
                // }
                if (!event.wbValid){
                    // console.log('event %s is not valid', eventname);
                    return;
                }
                if (wb.matches(event.wbTarget, selector)){
                    handler(event);
                }else if (wb.matches(event.wbTarget, selector + ' *')){
                    event.wbTarget = wb.closest(event.wbTarget, selector);
                    handler(event);
                }
            };
        }else{
            listener = function(event){
                blend(event);
                if (!event.wbValid){
                    return;
                }
                handler(event);
            };
        }
        elem.addEventListener(eventname, listener, false);
        return listener;
    };

    var off = function(elem, eventname, handler){
        elem.removeEventListener(eventname, handler);
    }

    var once = function(elem, eventname, selector, handler){
        var listener = function listener(event){
            handler(event);
            Event.off(elem, eventname, listener);
        };
        return Event.on(elem, eventname, selector, listener);
    }

    var trigger = function(elemOrSelector, eventname, data){
        var elem;
        if (elemOrSelector.nodeName){
            elem = elemOrSelector;
        }else{
            elem = document.querySelector(elem);
        }
        var evt = new CustomEvent(eventname, {bubbles: true, cancelable: true, detail: data});
        // console.log('dispatching %s for %o', eventname, elem);
        elem.dispatchEvent(evt);
    };

    // Are touch events supported?
    var isTouch = ('ontouchstart' in global);
    var isPointerEvent = function(event){
        switch(event.type){
            case 'touchstart':
            case 'touchmove':
            case 'touchend':
            case 'tap':
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
            case 'click':
                return true;
            default:
                return false;
        }
    }

    // Treat mouse events and single-finger touch events similarly
    var blend = function(event){
        if (isPointerEvent(event)){
            if (isTouch){
                if (event.touches.length > 1){
                    return event;
                }
                var touch = event.touches[0];
                event.wbTarget = touch.target;
                event.wbPageX = touch.pageX;
                event.wbPageY = touch.pageY;
                event.wbValid = true;
            }else{
                if (event.which !== 1){ // left mouse button
                    return event;
                }
                event.wbTarget = event.target;
                event.wbPageX = event.pageX;
                event.wbPageY = event.pageY;
                event.wbValid = true;
            }
        }else{
            event.wbTarget = event.target;
            event.wbValid = true;
        }
        // fix target?
        return event;
    }


    global.Event = {
        on: on,
        off: off,
        once: once,
        trigger: trigger,
        isTouch: isTouch
    };
})(this);

/*end event.js*/

/*begin drag.js*/
(function(global){

    // After trying to find a decent drag-and-drop library which could handle
    // snapping tabs to slots *and* dropping expressions in sockets *and*
    // work on both touch devices and with mouse/trackpad *and* could prevent dragging
    // expressions to sockets of the wrong type, ended up writing a custom one for
    // Waterbear which does what we need. The last piece makes it waterbear-specific
    // but could potentially be factored out if another library supported all of the
    // rest (and didn't introduce new dependencies such as jQuery)

    // FIXME: Remove references to waterbear
    // FIXME: Include mousetouch in garden


// Goals:
//
// Drag any block from block menu to canvas: clone and add to canvas
// Drag any block from anywhere besides menu to menu: delete block and attached blocks
// Drag any attached block to canvas: detach and add to canvas
// Drag any block (from block menu, canvas, or attached) to a matching, open attachment point: add to that script at that point
//    Triggers have no flap, so no attachment point
//    Steps can only be attached to flap -> slot
//    Values can only be attached to sockets of a compatible type
// Drag any block to anywhere that is not the block menu or on a canvas: undo the drag

// Drag Pseudocode
//
// Mouse Dragging:
//
// 1. On mousedown, test for potential drag target
// 2. On mousemove, if mousedown and target, start dragging
//     a) test for potential drop targets, remember them for hit testing
//     b) hit test periodically (not on mouse move)
//     c) clone element (if necessary)
//     d) if dragging out of a socket, replace with input of proper type
//     e) move drag target
// 3. On mouseup, if dragging, stop
//     a) test for drop, handle if necessary
//     b) clean up temporary elements, remove or move back if not dropping
//
//
// Touch dragging
//
// 1. On touchmove, test for potential drag target, start dragging
//     a..d as above
// 2. On touchend, if dragging, stop
//    a..b as above

// Key to jquery.event.touch is the timer function for handling movement and hit testing

    var dragTimeout = 20;
    var snapDist = 25; //In pixels
    var startParent;
    var startIndex;
    var timer;
    var dragTarget;
    var dropTarget;
    var dragging;
    var currentPosition;
    var scope;
    var workspace;
    var blockMenu = document.querySelector('#block_menu');
    var potentialDropTargets;
    var selectedSocket;

    var _dropCursor;

    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.dropCursor');
        }
        return _dropCursor;
    }

    function reset(){
        dragTarget = null;
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        dragging = false;
        cloned = false;
        scope = null;
    }
    reset();



    function initDrag(event){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        var eT = event.wbTarget;
        //Check whther the original target was an input ....
        if (wb.matches(event.target, 'input, select, option, .disclosure,.scripts_workspace')  && !wb.matches(eT, '#block_menu *')) {
            console.log('not a drag handle');
            return undefined;
        }
        var target = wb.closest(eT, '.block');
        if (target){
            // console.log('got a drag target: %o', target);
            dragTarget = target;
            if (target.parentElement.classList.contains('block-menu')){
                target.dataset.isTemplateBlock = 'true';
            }
            if (target.parentElement.classList.contains('local')){
                target.dataset.isLocal = 'true';
            }
            //dragTarget.classList.add("dragIndication");
            startPosition = wb.rect(target);
            if (! wb.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            // Need index too, if it is a step
            if (wb.matches(target, '.step')){
                startIndex = wb.indexOf(target);
            }
        }else{
            console.log('not a valid drag target');
            dragTarget = null;
        }
        return false;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {return undefined;}
        // if (wb.matches(dragTarget, '.expression')){
        //     wb.hide(dropCursor());
        // }
        dragTarget.classList.add("dragIndication");
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
        if (dragTarget.dataset.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            dragTarget = wb.cloneBlock(dragTarget); // clones dataset and children, yay
            // Event.trigger(dragTarget, 'wb-clone'); // not in document, won't bubble to document.body
            dragTarget.classList.add('dragIndication');
            if (dragTarget.dataset.isLocal){
                scope = wb.closest(parent, '.context');
            }else{
                scope = null;
            }
            cloned = true;
            // Make sure the workspace is available to drag to
            wb.showWorkspace('block');
        }else{
            // TODO: handle detach better (generalize restoring sockets, put in language file)
            // FIXME: Need to handle this somewhere
            // FIXME: Better name?
            Event.trigger(dragTarget, 'wb-remove');
        }
        dragging = true;
        // get position and append target to .content, adjust offsets
        // set last offset
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
//        if (wb.matches(dragTarget, '.scripts_workspace .step')){
//            dragPlaceholder.style.height = dragTarget.clientHeight + 'px';
//            dragTarget.parentElement.insertBefore(dragPlaceholder, dragTarget);
//        }
        document.querySelector('.content.editor').appendChild(dragTarget);
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

        // start timer for drag events
        timer = setTimeout(hitTest, dragTimeout);
        return false;
    }

    function drag(event){
        if (!dragTarget) {return undefined;}
        if (!currentPosition) {startDrag(event);}
        event.preventDefault();
        // update the variables, distance, button pressed
        var nextPosition = {left: event.wbPageX, top: event.wbPageY};
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget);
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        // Scoll workspace as needed
        if (workspace){
            var container = workspace.parentElement;
            var offset = wb.rect(container);
            // console.log('scrollTop: %s, scrollHeight: %s', container.scrollTop, container.scrollHeight);
            // console.log('top: %s, bottom: %s', currPos.top, currPos.bottom);
            // console.log('offset top: %s, offset bottom: %s', offset.top, offset.bottom);
            if (currPos.top < offset.top){
                container.scrollTop -= Math.min(container.scrollTop, offset.top - currPos.top);
            }else if (currPos.bottom > offset.bottom){
                var maxVerticalScroll = container.scrollHeight - offset.height - container.scrollTop;
                container.scrollTop += Math.min(maxVerticalScroll, currPos.bottom - offset.bottom);
            }
            // console.log('scrollLeft: %s, scrollWidth: %s', container.scrollLeft, container.scrollWidth);
            // console.log('left: %s, right: %s', currPos.left, currPos.right);
            // console.log('offset left: %s, offset right: %s', offset.left, offset.width);
            if (currPos.left < offset.left){
                container.scrollLeft -= Math.min(container.scrollLeft, offset.left - currPos.left);
            }else if(currPos.right > offset.right){
                var maxHorizontalScroll = container.scrollWidth - offset.width - container.scrollLeft;
                console.log('maxHorizontalScroll: %s', maxHorizontalScroll);
                container.scrollLeft += Math.min(maxHorizontalScroll, currPos.right - offset.right);
            }
        }
        currentPosition = nextPosition;
        return false;
    }

    function endDrag(end){
        clearTimeout(timer);
        timer = null;
        if (!dragging) {return undefined;}
        handleDrop();
        reset();
        return false;
    }

    function handleDrop(){
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        dragTarget.classList.remove('dragActive');
        dragTarget.classList.remove('dragIndication');
        potentialDropTargets.forEach(function(elem){
            elem.classList.remove('dropTarget');
        });
        if (wb.overlap(dragTarget, blockMenu)){
            // delete block if dragged back to menu
            Event.trigger(dragTarget, 'wb-delete');
            dragTarget.parentElement.removeChild(dragTarget);
        }else if (dropTarget){
            dropTarget.classList.remove('dropActive');
            if (wb.matches(dragTarget, '.step')){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                dropTarget.insertBefore(dragTarget, dropCursor());
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }else{
                // Insert a value block into a socket
                dropTarget.appendChild(dragTarget);
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'wb-add');
            }
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                // Put blocks back where we got them from
                if (startParent){
                    if (wb.matches(startParent, '.socket')){
                        // wb.findChildren(startParent, 'input').forEach(function(elem){
                        //     elem.hide();
                        // });
                    }
                    startParent.appendChild(dragTarget); // FIXME: We'll need an index into the contained array
                    dragTarget.removeAttribute('style');
                    startParent = null;
                }else{
                    workspace.appendChild(dragTarget); // FIXME: We'll need an index into the canvas array
                    wb.reposition(dragTarget, startPosition);
                }
            }
        }
    }

    function positionExpressionDropCursor(){
        if (!potentialDropTargets.length){
            console.log('no drop targets found');
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
        event.wbTarget.classList.add('selected');
        selectedSocket = event.wbTarget;
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
            case 'eventhandler':
                return [workspace];
            default:
                throw new Error('Unrecognized blocktype: ' + blocktype);
        }
    };

    function dataSelector(name){
        if (name[0] === '.'){
            name = name.slice(1); // remove leading dot
        }
        return '.socket[data-type=' + name + '] > .holder';
    }

    // Initialize event handlers
    wb.initializeDragHandlers = function(){
        if (Event.isTouch){
            Event.on('.scripts_workspace .contained, .block-menu', 'touchstart', '.block', initDrag);
            Event.on('.content', 'touchmove', null, drag);
            Event.on('.content', 'touchend', null, endDrag);
            // Event.on('.scripts_workspace', 'tap', '.socket', selectSocket);
        }else{
            Event.on('.scripts_workspace .contained, .block-menu', 'mousedown', '.block', initDrag);
            Event.on('.content', 'mousemove', null, drag);
            Event.on('.content', 'mouseup', null, endDrag);
            // Event.on('.scripts_workspace', 'click', '.socket', selectSocket);
        }
    };



})(this);


/*end drag.js*/

/*begin uuid.js*/
// This returns a Version 4 (random) UUID
// See: https://en.wikipedia.org/wiki/Universally_unique_identifier for more info

function hex(length){
  if (length > 8) return hex(8) + hex(length-8); // routine is good for up to 8 digits
  var myHex = Math.random().toString(16).slice(2,2+length);
  return pad(myHex, length); // just in case we don't get 8 digits for some reason
}

function pad(str, length){
    while(str.length < length){
        str += '0';
    }
    return str;
}

function variant(){
    return '89ab'[Math.floor(Math.random() * 4)];
}

// Constants
var UUID_TEST = /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}/;

function isUuid(value){
  return UUID_TEST.test(value);
}

// Public interface
function uuid(){
  return hex(8) + '-' + hex(4) + '-4' + hex(3) + '-' + variant() + hex(3) + '-' + hex(12);
}


/*end uuid.js*/

/*begin block.js*/
// Revised Block handling.
//
// Nearly all the block is defined in the HTML and DOM
// This file helps to initialize the block DOM, and provide
// support routines
//
// The idea here is that rather than try to maintain a separate "model" to capture
// the block state, which mirros the DOM and has to be kept in sync with it,
// just keep that state in the DOM itself using attributes (and data- attributes)
//
// Block(obj) -> Block element
// scriptForId(scriptid) -> script template
// nextSeqNum() -> int
// registerSeqNum(int) make sure we don't re-use sequence numbers
// Socket(json) -> Socket element

(function(wb){

    var elem = wb.elem;


    var _nextSeqNum = 0;

    var newSeqNum = function(){
        _nextSeqNum++;
        return _nextSeqNum;
    };

    var registerSeqNum = function(seqNum){
        // When reifying saved blocks, call this for each block to make sure we start new blocks
        // that do not overlap with old ones.
        if (!seqNum) return;
        seqNum = Math.max(parseInt(seqNum, 10), _nextSeqNum);
    }

    var blockRegistry = {};
    wb.blockRegistry = blockRegistry;

    var registerBlock = function(blockdesc){
        if (blockdesc.seqNum){
            registerSeqNum(blockdesc.seqNum);
        }else if (!blockdesc.isTemplateBlock){
            blockdesc.seqNum = newSeqNum();
        }
        if (! blockdesc.id){
            blockdesc.id = uuid();
        }
        blockRegistry[blockdesc.id] = blockdesc;
    }

    var getHelp = function(id){
        return blockRegistry[id] ? blockRegistry[id].help : '';
    }

    var getScript = function(id){
        try{
            return blockRegistry[id].script;
        }catch(e){
            console.log('Error: could not get script for %o', id);
            console.log('Hey look: %o', document.getElementById(id));
            return '';
        }
    }

    var getSockets = function(block){
        return wb.findChildren(wb.findChild(block, '.label'), '.socket');
    }

    var getSocketValue = function(socket){
        return socketValue(wb.findChild(socket, '.holder'));
    }

    var createSockets = function(obj){
        return obj.sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj);
        });
    }

    var Block = function(obj){
        // FIXME:
        // Handle customized names (sockets)
        registerBlock(obj);
        // if (!obj.isTemplateBlock){
        //     console.log('block seq num: %s', obj.seqNum);
        // }
        var block = elem(
            'div',
            {
                'class': function(){
                    var names = ['block', obj.group, obj.blocktype];
                    if(obj.blocktype === "expression"){
                        names.push(obj.type);
                        names.push(obj.type+'s');
                    }else if (obj.blocktype === 'context'){
                        names.push('step');
                    }else if (obj.blocktype === 'eventhandler'){
                        names.push('step');
                        names.push('context');
                    }else if (obj.blocktype === 'asset'){
                        names.push('expression');
                    }
                    return names.join(' ');
                },
                'data-blocktype': obj.blocktype,
                'data-group': obj.group,
                'id': obj.id,
                'data-scope-id': obj.scopeId || 0,
                'data-script-id': obj.scriptId || obj.id,
                'data-local-source': obj.localSource || null, // help trace locals back to their origin
                'data-sockets': JSON.stringify(obj.sockets),
                'data-locals': JSON.stringify(obj.locals),
                'title': obj.help || getHelp(obj.scriptId || obj.id)
            },
            elem('div', {'class': 'label'}, createSockets(obj))
        );
        if (obj.seqNum){
            block.dataset.seqNum = obj.seqNum;
        }
        if (obj.type){
            block.dataset.type = obj.type; // capture type of expression blocks
        }
        if (obj.script){
            block.dataset.script = obj.script;
        }
        if (obj.isLocal){
            block.dataset.isLocal = obj.isLocal;
        }
        if (obj.isTemplateBlock){
            block.dataset.isTemplateBlock = obj.isTemplateBlock;
        }
        if (obj.closed){
            block.dataset.closed = true;
        }
        if (obj.blocktype === 'context' || obj.blocktype === 'eventhandler'){
            block.appendChild(elem('div', {'class': 'locals block-menu'}));
            var contained = elem('div', {'class': 'contained'});
            block.appendChild(contained);
            if (obj.contained){
                obj.contained.map(function(childdesc){
                    var child = Block(childdesc);
                    contained.appendChild(child);
                    addStep({wbTarget: child}); // simulate event
                });
            }
            if (! wb.matches(block, '.scripts_workspace')){
                var label = wb.findChild(block, '.label');
                label.insertBefore(elem('div', {'class': 'disclosure'}), label.firstElementChild);
            }
        }
        // if (!obj.isTemplateBlock){
        //     console.log('instantiated block %o from description %o', block, obj);
        // }
        return block;
    }

    // Block Event Handlers

    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-add', '.block', addBlock);
    Event.on(document.body, 'wb-clone', '.block', onClone);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

    function removeBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            removeExpression(event);
        }else{
            removeStep(event);
        }
    }

    function addBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            addExpression(event);
        }else{
            addStep(event);
        }
    }

    function removeStep(event){
        // About to remove a block from a block container, but it still exists and can be re-added
        // Remove instances of locals
        var block = event.wbTarget;
        // console.log('remove block: %o', block);
        if (block.classList.contains('step') && !block.classList.contains('context')){
            var parent = wb.closest(block, '.context'); // valid since we haven't actually removed the block from the DOM yet
            if (block.dataset.locals && block.dataset.locals.length){
                // remove locals
                var locals = wb.findAll(parent, '[data-local-source="' + block.id + '"]');
                locals.forEach(function(local){
                    if (!local.isTemplateBlock){
                        Event.trigger(local, 'wb-remove');
                    }
                    local.parentElement.removeChild(local);
                });
                delete block.dataset.localsAdded;
            }
        }
    }

    function removeExpression(event){
        // Remove an expression from an expression holder, say for dragging
        // Revert socket to default
        var block = event.wbTarget;
        //  ('remove expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.removeAttribute('style');
        });
    }

    function addStep(event){
        // Add a block to a block container
        var block = event.wbTarget;
        // console.log('add block %o', block);
        if (block.dataset.locals && block.dataset.locals.length && !block.dataset.localsAdded){
            var parent = wb.closest(block, '.context');
            var locals = wb.findChild(parent, '.locals');
            var parsedLocals = [];
            JSON.parse(block.dataset.locals).forEach(
                function(spec){
                    spec.isTemplateBlock = true;
                    spec.isLocal = true;
                    spec.group = block.dataset.group;
                    if (!spec.seqNum){
                        spec.seqNum = block.dataset.seqNum;
                    }
                    // add scopeid to local blocks
                    spec.scopeId = parent.id;
                    if(!spec.id){
                        spec.id = spec.scriptId = uuid();
                    }
                    // add localSource so we can trace a local back to its origin
                    spec.localSource = block.id;
                    block.dataset.localsAdded = true;
                    locals.appendChild(Block(spec));
                    parsedLocals.push(spec);
                }
            );
            block.dataset.locals = JSON.stringify(parsedLocals);
        }
    }

    function addExpression(event){
        // add an expression to an expression holder
        // hide or remove default block
        var block = event.wbTarget;
        // console.log('add expression %o', block);
        wb.findChildren(block.parentElement, 'input, select').forEach(function(elem){
            elem.style.display = 'none';
        });
        if (event.stopPropagation){
            event.stopPropagation();
        }
    }

    function onClone(event){
        // a block has been cloned. Praise The Loa!
        var block = event.wbTarget;
        // console.log('block cloned %o', block);
    }

    var Socket = function(desc, blockdesc){
        // desc is a socket descriptor object, block is the owner block descriptor
        // Sockets are described by text, type, and (default) value
        // type and value are optional, but if you have one you must have the other
        // If the type is choice it must also have a options for the list of values
        // that can be found in the wb.choiceLists
        // A socket may also have a block, the id of a default block
        // A socket may also have a uValue, if it has been set by the user, over-rides value
        // A socket may also have a uName if it has been set by the user, over-rides name
        // A socket may also have a uBlock descriptor, if it has been set by the user, this over-rides the block
        var socket = elem('div',
            {
                'class': 'socket',
                'data-name': desc.name,
                'data-id': blockdesc.id
            },
            elem('span', {'class': 'name'}, desc.uName || desc.name)
        );
        // Optional settings
        if (desc.value){
            socket.dataset.value = desc.value;
        }
        if (desc.options){
            socket.dataset.options = desc.options;
        }
        // if (!blockdesc.isTemplateBlock){
        //     console.log('socket seq num: %s', blockdesc.seqNum);
        // }
        socket.firstElementChild.innerHTML = socket.firstElementChild.innerHTML.replace(/##/, ' <span class="seq-num">' + (blockdesc.seqNum || '##') + '</span>');
        if (desc.type){
            socket.dataset.type = desc.type;
            var holder = elem('div', {'class': 'holder'}, [Default(desc)]);
            socket.appendChild(holder)
        }
        if (desc.block){
            socket.dataset.block = desc.block;
        }
        if (!blockdesc.isTemplateBlock){
            var newBlock = null;
            if (desc.uBlock){
                // console.log('trying to instantiate %o', desc.uBlock);
                newBlock = Block(desc.uBlock);
                // console.log('created instance: %o', newBlock);
            }else if (desc.block){
                newBlock = cloneBlock(document.getElementById(desc.block));
            }
            if (newBlock){
                holder.appendChild(newBlock);
                addExpression({'wbTarget': newBlock});
            }
        }
        return socket;
    }


    function socketDesc(socket){
        var desc = {
            name: socket.dataset.name,
        }
        // optional defined settings
        if (socket.dataset.type){
            desc.type = socket.dataset.type;
        }
        if (socket.dataset.value){
            desc.value = socket.dataset.value;
        }
        if (socket.dataset.options){
            desc.options = socket.dataset.options;
        }
        if (socket.dataset.block){
            desc.block = socket.dataset.block;
        }
        // User-specified settings
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name')
        
        if (desc.name !== uName){
            desc.uName = uName;
        }
        var holder = wb.findChild(socket, '.holder');
        if (holder){
            var input = wb.findChild(holder, 'input, select');
            desc.uValue = input.value;
            var block = wb.findChild(holder, '.block');
            if (wb.matches(holder.lastElementChild, '.block')){
                desc.uBlock = blockDesc(holder.lastElementChild);
            }
        }
        return desc;
    }

    function blockDesc(block){
        var label = wb.findChild(block, '.label');
        var sockets = wb.findChildren(label, '.socket');
        var desc = {
            blocktype: block.dataset.blocktype,
            group: block.dataset.group,
            id: block.id,
            help: block.title,
            scopeId: block.dataset.scopeId,
            scriptId: block.dataset.scriptId,
            sockets: sockets.map(socketDesc)
        }
        if (block.dataset.seqNum){
            desc.seqNum  = block.dataset.seqNum;
        }
        if (block.dataset.script){
            desc.script = block.dataset.script;
        }
        if (block.dataset.isTemplateBlock){
            desc.isTemplateBlock = true;
        }
        if (block.dataset.isLocal){
            desc.isLocal = true;
        }
        if (block.dataset.localSource){
            desc.localSource = block.dataset.localSource;
        }
        if (block.dataset.type){
            desc.type = block.dataset.type;
        }
        if (block.dataset.locals){
            desc.locals = JSON.parse(block.dataset.locals);
        }
        if (block.dataset.closed){
            desc.closed = true;
        }
        var contained = wb.findChild(block, '.contained');
        if (contained && contained.children.length){
            desc.contained = wb.findChildren(contained, '.block').map(blockDesc);
        }
        return desc;
    }

    function cloneBlock(block){
        // Clone a template (or other) block
        var blockdesc = blockDesc(block);
        delete blockdesc.id;
        if (!blockdesc.isLocal){
            delete blockdesc.seqNum;
        }
        delete blockdesc.isTemplateBlock;
        delete blockdesc.isLocal;
        blockdesc.scriptId = block.id;
        return Block(blockdesc);
    }

    function deleteBlock(event){
        // delete a block from the script entirely
        // remove from registry
        var block = event.wbTarget;
        // console.log('block deleted %o', block);
    }

    var Default = function(obj){
        // return an input for input types (number, string, color, date)
        // return a block for block types
        var value;
        var type = obj.type;
        if (type === 'int' || type === 'float'){
            type = 'number';
        }
        switch(type){
            case 'any':
                value = obj.uValue || obj.value || ''; break;
            case 'number':
                value = obj.uValue || obj.value || 0; break;
            case 'string':
                value = obj.uValue || obj.value || ''; break;
            case 'color':
                value = obj.uValue || obj.value || '#000000'; break;
            case 'date':
                value = obj.uValue || obj.value || new Date().toISOString().split('T')[0]; break;
            case 'time':
                value = obj.uValue || obj.value || new Date().toISOString().split('T')[1]; break;
            case 'datetime':
                value = obj.uValue || obj.value || new Date().toISOString(); break;
            case 'url':
                value = obj.uValue || obj.value || 'http://waterbearlang.com/'; break;
            case 'image':
                value = obj.uValue || obj.value || ''; break;
            case 'phone':
                value = obj.uValue || obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.uValue || obj.value || 'waterbear@waterbearlang.com'; break;
            case 'boolean':
                obj.options = 'boolean';
            case 'choice':
                var choice = elem('select');
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    var value = obj.uValue || obj.value;
                    if (value && value === opt){
                        option.setAttribute('selected', 'selected');
                    }
                    choice.appendChild(option);
                });
                return choice;
            default:
                value = obj.uValue || obj.value || '';
        }
        var input = elem('input', {type: type, value: value});
        wb.resize(input);
        return input;
    }

    var socketValue = function(holder){
        if (holder.children.length > 1){
            return codeFromBlock(wb.findChild(holder, '.block'));
        }else{
            var value = wb.findChild(holder, 'input, select').value;
            var type = holder.parentElement.dataset.type;
            if (type === 'string' || type === 'choice'){
                if (value[0] === '"'){value = value.slice(1);}
                if (value[value.length-1] === '"'){value = value.slice(0,-1);}
                value = value.replace(/"/g, '\\"');
                value = '"' + value + '"';
            }
            return value;
        }
    }

    var codeFromBlock = function(block){
        var scriptTemplate = getScript(block.dataset.scriptId).replace(/##/g, '_' + block.dataset.seqNum);
        var childValues = [];
        var label = wb.findChild(block, '.label');
        var expressionValues = wb.findChildren(label, '.socket')
            .map(function(socket){ return wb.findChild(socket, '.holder'); }) // get holders, if any
            .filter(function(holder){ return holder; }) // remove undefineds
            .map(socketValue); // get value
        if (wb.matches(block, '.context')){
            var childValues = wb.findChildren(wb.findChild(block, '.contained'), '.block').map(codeFromBlock).join('');
        }
        // Now intertwingle the values with the template and return the result
        function replace_values(match, offset, s){
            var idx = parseInt(match.slice(2, -2), 10) - 1;
            if (match[0] === '{'){
                return expressionValues[idx] || 'null';
            }else{
                return childValues || '/* do nothing */';
            }
        }
        var _code = scriptTemplate.replace(/\{\{\d\}\}/g, replace_values);
        var _code2 = _code.replace(/\[\[\d\]\]/g, replace_values);
        return _code2;
    };

    function changeName(event){
        var nameSpan = event.wbTarget;
        var input = elem('input', {value: nameSpan.textContent});
        nameSpan.parentNode.appendChild(input);
        nameSpan.style.display = 'none';
        input.focus();
        input.select();
        wb.resize(input);
        Event.on(input, 'blur', null, updateName);
        Event.on(input, 'keydown', null, maybeUpdateName);
    }

    function updateName(event){
        console.log('updateName on %o', event);
        var input = event.wbTarget;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        var nameSpan = input.previousSibling;
        var newName = input.value;
        // if (!input.parentElement) return; // already removed it, not sure why we're getting multiple blurs
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
        console.log('now update all instances too');
        var source = wb.closest(nameSpan, '.block');
        var instances = wb.findAll(wb.closest(source, '.context'), '[data-local-source="' + source.dataset.localSource + '"]');
        instances.forEach(function(elem){
            wb.find(elem, '.name').textContent = newName;
        });
    }

    function cancelUpdateName(event){
        var input = event.wbTarget;
        var nameSpan = input.previousSibling;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
    }

    function maybeUpdateName(event){
        var input = event.wbTarget;
        if (event.keyCode === 0x1B /* escape */ ){
            event.preventDefault();
            input.value = input.previousSibling.textContent;
            input.blur()
        }else if(event.keyCode === 0x0D /* return or enter */ || event.keyCode === 0x09 /* tab */){
            event.preventDefault();
            input.blur();
        }
    }


    // Export methods
    wb.Block = Block;
    wb.blockDesc = blockDesc;
    wb.registerSeqNum = registerSeqNum;
    wb.cloneBlock = cloneBlock;
    wb.codeFromBlock = codeFromBlock;
    wb.addBlockHandler = addBlock;
    wb.changeName = changeName;
    wb.getSockets = getSockets;
    wb.getSocketValue = getSocketValue;
})(wb);


/*end block.js*/

/*begin ui.js*/
(function(wb){

// UI Chrome Section

function tabSelect(event){
    var target = event.wbTarget;
    document.querySelector('.tabbar .selected').classList.remove('selected');
    target.classList.add('selected');
    if (wb.matches(target, '.scripts_workspace_tab')){
        showWorkspace('block');
    }else if (wb.matches(target, '.scripts_text_view_tab')){
        showWorkspace('text');
        updateScriptsView();
    }
}
Event.on('.tabbar', 'click', '.chrome_tab', tabSelect);

function accordion(event){
    var open = document.querySelector('#block_menu .open');
    if (open){
        open.classList.remove('open');
    }
    if (open && open === event.wbTarget.nextSibling) return;
    event.wbTarget.nextSibling.classList.add('open');
}

Event.on('#block_menu', 'click', '.accordion-header', accordion);


function showWorkspace(mode){
    var workspace = document.querySelector('.workspace');
    if (mode === 'block'){
        workspace.classList.remove('textview');
        workspace.classList.add('blockview');
    }else if (mode === 'text'){
        workspace.classList.remove('blockview');
        workspace.classList.add('textview');
    }
}
// Expose this to dragging and saving functionality
wb.showWorkspace = showWorkspace;

function updateScriptsView(){
    var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
    var view = wb.find(document.body, '.workspace .scripts_text_view');
    wb.writeScript(blocks, view);
}
window.updateScriptsView = updateScriptsView;


// Context Menu
//
// 'this' is the object matching the selector
// key is the key in the items object
// opt is the context menu object itself

function cloneCommand(key, opt){
    console.info('cloneCommand(%s, %o)', key, opt);
}

function editCommand(key, opt){
    console.info('editCommand(%s, %o)', key, opt);
}

function expandCommand(key, opt){
    console.info('expandCommand(%s, %o)', key, opt);
}

function collapseCommand(key, opt){
    console.info('collapseCommand(%s, %o)', key, opt);
}

function cutBlockCommand(key, opt){
    console.info('cutBlockCommand(%o, %s, %o)', this, key, opt);
    var view = this.closest('.wrapper');
    pasteboard = Block.model(view);
    // Remove it programatically, and trigger the right events:
    Event.trigger(view, 'wb-event');
    view.remove();
}

function copyBlockCommand(key, opt){
    console.info('copyBlockCommand(%s, %o)', key, opt);
    pasteboard = Block.model(this.closest('.wrapper')).clone();
}

function copySubscriptCommand(key, opt){
    console.info('copySubscriptCommand(%s, %o)', key, opt);
    pasteboard = Block.model(this.closest('.wrapper')).clone(true);
}

function pasteCommand(key, opt){
    console.info('pasteCommand(%s, %o)', key, opt);
    if (pasteboard){
        this.append(pasteboard.view());
        addToScriptEvent(this, pasteboard.view());
    }
}

function pasteExpressionCommand(key, opt){
    console.info('pasteExpressionCommand(%s, %o)', key, opt);
    if (pasteboard && pasteboard.blocktype === 'expression'){
        this.hide();
        pasteCommand.call(this.parent(), key, opt);
    }
}

function pasteStepCommand(key, opt){
    console.info('pasteStepCommand(%s, %o)', key, opt);
    if (pasteboard && pasteboard.blocktype !== 'expression'){
        if (this.find('> .wrapper').length){
            console.log('already has a child element');
        }else{
            pasteCommand.call(this, key, opt);
        }
    }
}

function cancelCommand(key, opt){
    console.info('cancelCommand(%s, %o)', key, opt);
}

var pasteboard = null;

// $.contextMenu({
//     selector: '.scripts_workspace .block',
//     items: {
//         //clone: {'name': 'Clone', icon: 'add', callback: cloneCommand},
//         //edit: {'name': 'Edit', icon: 'edit', callback: editCommand},
//         //expand: {'name': 'Expand', callback: expandCommand},
//         //collapse: {'name': 'Collapse', callback: collapseCommand},
//         cut: {'name': 'Cut block', icon: 'cut', callback: cutBlockCommand},
//         copy: {'name': 'Copy block', icon: 'copy', callback: copyBlockCommand},
//         copySubscript: {'name': 'Copy subscript', callback: copySubscriptCommand},
//         //paste: {'name': 'Paste', icon: 'paste', callback: pasteCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
//
// $.contextMenu({
//    selector: '.scripts_workspace',
//    items: {
//        paste: {'name': 'Paste', icon: 'paste', callback: pasteCommand},
//        cancel: {'name': 'Cancel', callback: cancelCommand}
//    }
// });
//
// $.contextMenu({
//     selector: '.scripts_workspace .value > input',
//     items: {
//         paste: {'name': 'Paste', icon: 'paste', callback: pasteExpressionCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
//
// $.contextMenu({
//     selector: '.scripts_workspace .contained',
//     items: {
//         paste: {'name': 'Paste', icon: 'paste', callback: pasteStepCommand},
//         cancel: {'name': 'Cancel', callback: cancelCommand}
//     }
// });
//

// TODO: add event handler to enable/disable, hide/show items based on state of block

// Handle Context menu for touch devices:
// Test drawn from modernizr

function is_touch_device() {
  return !!('ontouchstart' in window);
}

// if (is_touch_device()){
//     $.tappable({
//         container: '.blockmenu, .workspace',
//         selector: '.block',
//         callback: function(){
//             console.info('long tap detected');
//             console.info(this);
//             this.contextMenu();
//         },
//         touchDelay: 150
//     });
// }

// var menu_built = false;
// var saved_menus = [];

// Build the Blocks menu, this is a public method
wb.menu = function(blockspec){
    var title = blockspec.name.replace(/\W/g, '');
    var specs = blockspec.blocks;
	switch(wb.view){
		case 'result': return run_menu(title, specs);
		case 'blocks': return edit_menu(title, specs);
		case 'editor': return edit_menu(title, specs);
		default: return edit_menu(title, specs);
	}
};

if (wb.view === 'result'){
    Event.once(document.body, 'wb-script-loaded', null, runCurrentScripts);
}

function run_menu(title, specs){
    edit_menu(title, specs);
}


function edit_menu(title, specs, show){
	menu_built = true;
    var group = title.toLowerCase().split(/\s+/).join('');
    var submenu = document.querySelector('.' + group + '+ .submenu');
    if (!submenu){
        var header = wb.elem('h3', {'class': group + ' accordion-header'}, title);
        var submenu = wb.elem('div', {'class': 'submenu block-menu accordion-body'});
        var blockmenu = document.querySelector('#block_menu');
        blockmenu.appendChild(header);
        blockmenu.appendChild(submenu);
    }
    specs.forEach(function(spec, idx){
        spec.group = group;
        spec.isTemplateBlock = true;
        submenu.appendChild(wb.Block(spec));
    });
}

})(wb);


/*end ui.js*/

/*begin workspace.js*/
(function(wb){

var language = location.pathname.match(/\/(.*)\.html/)[1];

function clearScripts(event, force){
    if (force || confirm('Throw out the current script?')){
        var workspace = document.querySelector('.workspace > .scripts_workspace')
        workspace.parentElement.removeChild(workspace);
        createWorkspace('Workspace');
		document.querySelector('.workspace > .scripts_text_view').innerHTML = '';
    }
}
Event.on('.clearScripts', 'click', null, clearScripts);
Event.on('.editScript', 'click', null, function(){
	document.body.className = 'editor';
	wb.loadCurrentScripts(wb.queryParams);
});

Event.on('.goto_stage', 'click', null, function(){
	document.body.className = 'result';
});

// Load and Save Section

function saveCurrentScripts(){
    wb.showWorkspace('block');
    document.querySelector('#block_menu').scrollIntoView();
    localStorage['__' + language + '_current_scripts'] = scriptsToString();
}
window.onunload = saveCurrentScripts;

function scriptsToString(title, description){
    if (!title){ title = ''; }
    if (!description){ description = ''; }
    var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
    return JSON.stringify({
        title: title,
        description: description,
        date: Date.now(),
        waterbearVersion: '2.0',
        blocks: blocks.map(wb.blockDesc)
    });
}


function createDownloadUrl(evt){
    var URL = window.webkitURL || window.URL;
    var file = new Blob([scriptsToString()], {type: 'application/json'});
    var reader = new FileReader();
    var a = document.createElement('a');
    reader.onloadend = function(){
        a.href = reader.result;
        a.download = 'script.json';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
    };
    reader.readAsDataURL(file);
    evt.preventDefault();
}

Event.on('.save_scripts', 'click', null, createDownloadUrl);
Event.on('.restore_scripts', 'click', null, loadScriptsFromFilesystem);

function loadScriptsFromFilesystem(){
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'application/json');
    input.addEventListener('change', function(evt){
        var file = input.files[0];
        loadScriptsFromFile(file);
    });
    input.click();
}

function loadScriptsFromObject(fileObject){
    // console.info('file format version: %s', fileObject.waterbearVersion);
    // console.info('restoring to workspace %s', fileObject.workspace);
	if (!fileObject) return createWorkspace();
    var blocks = fileObject.blocks.map(wb.Block);
    if (!blocks.length){
        return createWorkspace();
    }
    if (blocks.length > 1){
        console.log('not really expecting multiple blocks here right now');
        console.log(blocks);
    }
    blocks.forEach(function(block){
        wireUpWorkspace(block);
        Event.trigger(block, 'wb-add');
    });
    wb.loaded = true;
    Event.trigger(document.body, 'wb-script-loaded');
}

function loadScriptsFromGist(gist){
	var keys = Object.keys(gist.data.files);
	var file;
	keys.forEach(function(key){
		if (/.*\.json/.test(key)){
			// it's a json file
			file = gist.data.files[key].content;
		}
	});
	if (!file){
		console.log('no json file found in gist: %o', gist);
		return;
	}
	loadScriptsFromObject(JSON.parse(file));
}

function runScriptFromGist(gist){
	console.log('running script from gist');
	var keys = Object.keys(gist.data.files);
	var file;
	keys.forEach(function(key){
		if (/.*\.js$/.test(key)){
			// it's a javascript file
			console.log('found javascript file: %s', key);
			file = gist.data.files[key].content;
		}
	});
	if (!file){
		console.log('no javascript file found in gist: %o', gist);
		return;
	}
	wb.runScript(file);
}


wb.loaded = false;
wb.loadCurrentScripts = function(queryParsed){
    if (!wb.loaded){
    	if (queryParsed.gist){
    		wb.jsonp(
    			'https://api.github.com/gists/' + queryParsed.gist,
    			loadScriptsFromGist
    		);
    	}else if (localStorage['__' + language + '_current_scripts']){
            var fileObject = JSON.parse(localStorage['__' + language + '_current_scripts']);
            if (fileObject){
                loadScriptsFromObject(fileObject);
            }
        }else{
            createWorkspace('Workspace');
        }
        wb.loaded = true;
    }
    Event.trigger(document.body, 'wb-loaded');
};

wb.runCurrentScripts = function(queryParsed){
	if (queryParsed.gist){
		wp.json(
			'https://api.github.com/gists/' + queryParsed.gist,
			runScriptFromGist
		);
	}else if (localStorage['__' + language + '_current_scripts']){
		var fileObject = localStorage['__' + language + '_current_scripts'];
		if (fileObject){
			wb.runScript(fileObject);
		}
	}
}


// Allow saved scripts to be dropped in
function createWorkspace(name){
    var id = uuid();
    var workspace = wb.Block({
        group: 'scripts_workspace',
        id: id,
        scriptId: id,
        scopeId: id,
        blocktype: 'context',
        sockets: [
            {
                name: name
            }
        ],
        script: '[[1]]',
        isTemplateBlock: false,
        help: 'Drag your script blocks here'
    });
    wireUpWorkspace(workspace);
}
wb.createWorkspace = createWorkspace;

function wireUpWorkspace(workspace){
    workspace.addEventListener('drop', getFiles, false);
    workspace.addEventListener('dragover', function(evt){evt.preventDefault();}, false);
    wb.findAll(document, '.scripts_workspace').forEach(function(ws){
        ws.parentElement.removeChild(ws); // remove any pre-existing workspaces
    });
    document.querySelector('.workspace').appendChild(workspace);
    workspace.querySelector('.contained').appendChild(wb.elem('div', {'class': 'dropCursor'}));
    wb.initializeDragHandlers();
}

function handleDragover(evt){
    // Stop Firefox from grabbing the file prematurely
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function loadScriptsFromFile(file){
    if ( file.type.indexOf( 'json' ) === -1 ) { return; }
    var reader = new FileReader();
    reader.readAsText( file );
    reader.onload = function (evt){
        clearScripts(null, true);
        var saved = JSON.parse(evt.target.result);
        loadScriptsFromObject(saved);
    };
}

function getFiles(evt){
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    if ( files.length > 0 ){
        // we only support dropping one file for now
        var file = files[0];
        loadScriptsFromFile(file);
    }
}

Event.on('.workspace', 'click', '.disclosure', function(evt){
    var block = wb.closest(evt.wbTarget, '.block');
    if (block.dataset.closed){
        delete block.dataset.closed;
    }else{
        block.dataset.closed = true;
    }
});

Event.on('.workspace', 'dblclick', '.locals .name', wb.changeName);
Event.on('.workspace', 'keypress', 'input', wb.resize);
Event.on(document.body, 'wb-loaded', null, function(evt){console.log('loaded');});
Event.on(document.body, 'wb-script-loaded', null, function(evt){console.log('script loaded');});
})(wb);

/*end workspace.js*/

/*begin languages/arduino/arduino.js*/
(function(){

    // This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global

// expose these globally so the Block/Label methods can find them
window.choiceLists = {
    /*keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
        .split('').concat(['up', 'down', 'left', 'right',
        'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
        'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
        'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),*/
    boolean: ['true', 'false'],
    highlow: ['HIGH', 'LOW'],
    inoutput: ['INPUT', 'OUTPUT'],
    onoff: ['ON', 'OFF'],
    logic: ['true', 'false'],
    digitalpins: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,'A0','A1','A2','A3','A4','A5'],
    analoginpins: ['A0','A1','A2','A3','A4','A5'],
    pwmpins: [3, 5, 6, 9, 10, 11],
    baud:[9600, 300, 1200, 2400, 4800, 14400, 19200, 28800, 38400, 57600, 115200],
    analogrefs:['DEFAULT', 'INTERNAL', 'INTERNAL1V1', 'INTERNAL2V56', 'EXTERNAL']
};

window.setDefaultScript = function(script){
    window.defaultscript = script;
};

window.loadDefaultScript = function(script){
    if (typeof window.defaultscript != 'undefined'){
        loadScriptsFromObject(window.defaultscript);
    }
};

wb.writeScript = function(elements, view){
    var code = elements.map(function(elem){
        return wb.codeFromBlock(elem);
    }).join('\n');
    view.innerHTML = '<pre class="language-arduino">' + code + '</pre>';
};


jQuery.fn.extend({
  wrapScript: function(){
      // wrap the top-level script to prevent leaking into globals
      var script = this.map(function(){return wb.Block.model(this).code();}).get().join('\n\n');
      return script;
  },
  writeScript: function(view){
      view.html('<code><pre class="script_view">' + this.wrapScript() +  '</pre></code>');
  }
});


function clearScriptsDefault(event, force){
  clearScripts(event, force);
  loadDefaultScript();
}


$('.clearScripts').click(clearScriptsDefault);



var defaultscript=[{"klass":"control","label":"Global Settings","script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Setup - When program starts","script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Main loop","script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[""],"next":""}];
setDefaultScript(defaultscript);


})();

/*end languages/arduino/arduino.js*/

/*begin languages/arduino/boolean.json*/
wb.menu({
    "name": "Boolean",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "03d1df81-c7de-40a0-a88f-95b732d19936",
            "type": "boolean",
            "script": "({{1}} && {{2}})",
            "help": "Check if both are true",
            "sockets": [
                {
                    "name": "",
                    "type": "boolean",
                    "value": null
                },
                {
                    "name": "and",
                    "type": "boolean",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "482db566-b14b-4381-8135-1e29f8c4e7c3",
            "type": "boolean",
            "script": "({{1}} || {{2}})",
            "help": "Check if one is true",
            "sockets": [
                {
                    "name": "",
                    "type": "boolean",
                    "value": null
                },
                {
                    "name": "or",
                    "type": "boolean",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "866a1181-e0ff-4ebc-88dd-55e2b70d7c52",
            "type": "boolean",
            "script": "(! {{1}})",
            "help": "Not true is false and Not false is true",
            "sockets": [
                {
                    "name": "not",
                    "type": "boolean",
                    "value": null
                }
            ]
        }
    ]
}
);
/*end languages/arduino/boolean.json*/

/*begin languages/arduino/control.json*/
wb.menu({
    "name": "Controls",
    "blocks": [
        {
            "blocktype": "eventhandler",
            "id": "25339ea4-1bc2-4c66-bde8-c455b9a3d1cd",
            "script": "void setup()\n{\n[[1]]\n}\n",
            "help": "Start scripts when program starts",
            "sockets": [
                {
                    "name": "Setup - When program starts"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "fb958a3d-0372-4ab7-95c1-70dd9c454d19",
            "script": "void loop()\n{\n[[1]]\n}\n",
            "help": "Trigger for main loop",
            "sockets": [
                {
                    "name": "Main loop"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "1e4b61cf-c4ce-4b08-9944-7ea1ebf54775",
            "script": "/*Global Settings*/\n\n[[1]]\n\n",
            "help": "Trigger for blocks in global setup",
            "sockets": [
                {
                    "name": "Global Settings"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "b54a3daa-3dfa-4885-afc4-9592944296df",
            "script": "{{1}}();",
            "help": "Send a message to all listeners",
            "sockets": [
                {
                    "name": "broadcast",
                    "type": "string",
                    "value": "ack"
                },
                {
                    "name": "message"
                }
            ]
        },
        {
            "blocktype": "eventhandler",
            "id": "64fd2a90-a689-4ffd-bd66-bc8c61775cd4",
            "script": "function {{1}}(){\n[[next]]\n}",
            "help": "Trigger for blocks to run when message is received",
            "sockets": [
                {
                    "name": "when I receive",
                    "type": "string",
                    "value": "ack"
                },
                {
                    "name": "message"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "c79f205e-eab3-4ebd-9c72-2e6a54209593",
            "script": "while({{1}}){\n[[1]]\n}",
            "help": "loop until condition fails",
            "sockets": [
                {
                    "name": "forever if",
                    "type": "boolean",
                    "value": "false"
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "0a313a7a-1187-4619-9819-fbfd7a32f6a6",
            "script": "if({{1}}){\n[[1]]\n}",
            "help": "only run blocks if condition is true",
            "sockets": [
                {
                    "name": "if",
                    "type": "boolean",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "dc724c8c-27b3-4c93-9420-050dd2466c43",
            "script": "if(! {{1}} ){\n[[1]]\n}",
            "help": "run blocks if condition is not true",
            "sockets": [
                {
                    "name": "if not",
                    "type": "boolean",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "context",
            "id": "a11f426a-9a48-4e0f-83f5-cff4ec5b4154",
            "script": "while(!({{1}})){\n[[1]]\n}",
            "help": "loop until condition is true",
            "sockets": [
                {
                    "name": "repeat until",
                    "type": "boolean",
                    "value": null
                }
            ]
        }
    ]
}
);
/*end languages/arduino/control.json*/

/*begin languages/arduino/digitalio.json*/
wb.menu({
    "name": "Digital I/O",
    "blocks": [
        {
            "blocktype": "step",
            "id": "451eda35-be10-498f-a714-4a32f3bcbe53",
            "script": "digital_output## = \"{{1}}\"; pinMode(digital_output##, OUTPUT);",
            "help": "Create a named pin set to output",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "digital_output##"
                        }
                    ],
                    "script": "digital_output##",
                    "type": "string"
                }
            ],
            "sockets": [
                {
                    "name": "Create digital_output## on Pin",
                    "type": "choice",
                    "options": "digitalpins",
                    "value": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "d0a3d825-0d2d-4339-838f-b30d06441c23",
            "script": "if({{2}} == HIGH)\n{\ndigitalWrite({{1}}, HIGH);\n}\nelse\n{\ndigitalWrite({{1}}, LOW);\n}\n",
            "help": "Write a boolean value to given pin",
            "sockets": [
                {
                    "name": "Digital Pin",
                    "type": "string",
                    "value": null
                },
                {
                    "name": "ON if",
                    "type": "boolean",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "ef757ca5-053d-4cfd-8ed4-9345cefef569",
            "script": "digital_input## = \"{{1}}\"; pinMode(digital_input##, INPUT);",
            "help": "Create a named pin set to input",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "digital_input##"
                        }
                    ],
                    "script": "digital_input##",
                    "type": "string"
                }
            ],
            "sockets": [
                {
                    "name": "Create digital_input## on Pin",
                    "type": "choice",
                    "options": "digitalpins",
                    "value": "choice"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "010020b8-4e76-4e56-9cd5-65541bf2dbc9",
            "type": "boolean",
            "script": "(digitalRead({{1}}) == HIGH)",
            "help": "Is the digital input pin ON",
            "sockets": [
                {
                    "name": "Digital Pin",
                    "type": "string",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "220caace-bd77-4e82-9f5d-0457a5bbfe9f",
            "script": "analog_input## = \"{{1}}\"; pinMode(analog_input##, INPUT);",
            "help": "Create a named pin set to input",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "analog_input##"
                        }
                    ],
                    "script": "analog_input##",
                    "type": "string"
                }
            ],
            "sockets": [
                {
                    "name": "Create analog_input## on Pin",
                    "type": "choice",
                    "options": "analoginpins",
                    "value": "choice"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5b76796a-7fa9-4d56-b532-5194bf5db20f",
            "type": "int",
            "script": "(analogRead({{1}}))",
            "help": "Value of analog pin",
            "sockets": [
                {
                    "name": "Analog Pin",
                    "type": "string",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "4fa77d69-30fb-4734-8697-5ed56ba67433",
            "script": "analog_output## = \"{{1}}\"; pinMode(analog_output##, OUTPUT);",
            "help": "Create a named pin set to output",
            "locals": [
                {
                    "blocktype": "expression",
                    "sockets": [
                        {
                            "name": "analog_output##"
                        }
                    ],
                    "script": "analog_output##",
                    "type": "string"
                }
            ],
            "sockets": [
                {
                    "name": "Create analog_output## on Pin",
                    "type": "choice",
                    "options": "pwmpins",
                    "value": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "4b29af90-96e0-4de9-a7d8-2c88a35e1f49",
            "script": "analogWrite({{1}}, {{2}});",
            "help": "Set value of a pwm pin",
            "sockets": [
                {
                    "name": "Analog",
                    "type": "string",
                    "value": null
                },
                {
                    "name": "outputs",
                    "type": "int",
                    "value": "255"
                }
            ]
        }
    ]
}
);
/*end languages/arduino/digitalio.json*/

/*begin languages/arduino/math.json*/
wb.menu({
    "name": "Math",
    "blocks": [
        {
            "blocktype": "expression",
            "id": "cbb65aa7-b36c-4311-a479-f1776579dcd3",
            "type": "number",
            "script": "({{1}} + {{2}})",
            "help": "Add two numbers",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "+",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "594700d5-64c6-4b21-bc70-f3fbf6913a69",
            "type": "number",
            "script": "({{1}} - {{2}})",
            "help": "Subtract two numbers",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "-",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "afec758c-7ccc-4ee5-8d2c-f95160da83d4",
            "type": "number",
            "script": "({{1}} * {{2}})",
            "help": "Multiply two numbers",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "*",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "5cec08b8-eb58-4ef0-a73e-f5245d6859a2",
            "type": "number",
            "script": "({{1}} / {{2}})",
            "help": "Divide two numbers",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "/",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "90a5d524-fa8a-4a52-a4df-0beb83d32c40",
            "type": "number",
            "script": "(random({{1}}, {{2}}))",
            "help": "Generate a random number between two other numbers",
            "sockets": [
                {
                    "name": "pick random",
                    "type": "number",
                    "value": "1"
                },
                {
                    "name": "to",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "d35330ee-5b49-492b-b7dd-41c3fd1496d0",
            "script": "(randomSeed({{1}}))",
            "help": "",
            "sockets": [
                {
                    "name": "set seed for random numbers to",
                    "type": "number",
                    "value": "1"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7f047e8a-3a87-49f8-b9c7-daad742faa9d",
            "type": "boolean",
            "script": "({{1}} < {{2}})",
            "help": "Check if one number is less than another",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "<",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "faddd68c-6c75-4908-9ee6-bccc246f9d89",
            "type": "boolean",
            "script": "({{1}} == {{2}})",
            "help": "Check if one number is equal to another",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "=",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e4d81ccd-f9dc-4a0b-b41f-a5cd146a8c27",
            "type": "boolean",
            "script": "({{1}} > {{2}})",
            "help": "Check if one number is greater than another",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": ">",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "8353c1f3-a1da-4d80-9bf9-0c9584c3896b",
            "type": "number",
            "script": "({{1}} % {{2}})",
            "help": "Gives the remainder from the division of these two number",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "0"
                },
                {
                    "name": "mod",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "1fde8b93-1306-4908-97c8-d628dd91eb4f",
            "type": "int",
            "script": "(int({{1}}))",
            "help": "Gives the whole number, without the decimal part",
            "sockets": [
                {
                    "name": "round",
                    "type": "number",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "b7634de4-69ed-492c-bc9a-16ac3bb5ca45",
            "type": "number",
            "script": "(abs({{1}}))",
            "help": "Gives the positive of the number",
            "sockets": [
                {
                    "name": "absolute of",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "20268318-b168-4519-a32a-10b94c264226",
            "type": "float",
            "script": "(cos((180 / {{1}})/ 3.14159))",
            "help": "Gives the cosine of the angle",
            "sockets": [
                {
                    "name": "cosine of",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "86c2f303-861f-4ad7-a7de-3108637ce264",
            "type": "float",
            "script": "(sin((180 / {{1}})/ 3.14159))",
            "help": "Gives the sine of the angle",
            "sockets": [
                {
                    "name": "sine of",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "0e018648-0b45-4096-9052-e3080a47793a",
            "type": "float",
            "script": "(tan((180 / {{1}})/ 3.14159))",
            "help": "Gives the tangent of the angle given",
            "sockets": [
                {
                    "name": "tangent of",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "degrees"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "814444c5-f3f4-4412-975c-7284409f1f3d",
            "type": "number",
            "script": "(pow({{1}}, {{2}}))",
            "help": "Gives the first number multiplied by itself the second number of times",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "to the power of",
                    "type": "number",
                    "value": "2"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "1f4df24e-22ea-460e-87c5-4b0f92e233ce",
            "type": "float",
            "script": "(sqrt({{1}}))",
            "help": "Gives the two numbers that if multiplied will be equal to the number input",
            "sockets": [
                {
                    "name": "square root of",
                    "type": "number",
                    "value": "10"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "18a0560d-beff-43da-8708-55398cc08d30",
            "type": "string",
            "script": "{{1}}",
            "help": "Allows you to use a numeric result as a string",
            "sockets": [
                {
                    "name": "",
                    "type": "number",
                    "value": "10"
                },
                {
                    "name": "as string"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "e37dae6d-608f-43e9-9cd9-57ff03aba29d",
            "type": "number",
            "script": "map({{1}}, 0, 1023, 0, 255)",
            "help": "",
            "sockets": [
                {
                    "name": "Map",
                    "type": "number",
                    "value": null
                },
                {
                    "name": "from Analog in to Analog out"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "007bccc5-36b2-4ff8-a0bc-f80def66ff49",
            "type": "number",
            "script": "map({{1}}, 0, 1023, 0, 255)",
            "help": "",
            "sockets": [
                {
                    "name": "Map",
                    "type": "number",
                    "value": null
                },
                {
                    "name": "from",
                    "type": "number",
                    "value": "0]-[number"
                },
                {
                    "name": "to",
                    "type": "number",
                    "value": "0]-[number"
                }
            ]
        }
    ]
}
);
/*end languages/arduino/math.json*/

/*begin languages/arduino/serialio.json*/
wb.menu({
    "name": "Serial I/O",
    "blocks": [
        {
            "blocktype": "step",
            "id": "11c7b422-0549-403e-9f2e-e1db13964f1b",
            "script": "Serial.begin({{1}});",
            "help": "Eanble serial communications at a chosen speed",
            "sockets": [
                {
                    "name": "Setup serial communication at",
                    "type": "choice",
                    "options": "baud",
                    "value": "choice"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "9ffc70c4-b0da-4d2c-a38a-f1ec2ec743ac",
            "script": "Serial.println({{1}});",
            "help": "Send a message over the serial connection followed by a line return",
            "sockets": [
                {
                    "name": "Send",
                    "type": "any",
                    "value": "Message"
                },
                {
                    "name": "as a line"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "40fb939a-a393-4d26-8902-93ee78bd01b0",
            "script": "Serial.print({{1}});",
            "help": "Send a message over the serial connection",
            "sockets": [
                {
                    "name": "Send",
                    "type": "any",
                    "value": "Message"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a1630959-fc16-4ba8-af98-4724edc636b4",
            "type": "string",
            "script": "Serial.read()",
            "help": "Read a message from the serial connection",
            "sockets": [
                {
                    "name": "Message Value"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "43618563-c8a3-4330-bfef-89469a797a90",
            "script": "Serial.end();",
            "help": "Disable serial communications",
            "sockets": [
                {
                    "name": "End serial communication"
                }
            ]
        }
    ]
}
);
/*end languages/arduino/serialio.json*/

/*begin languages/arduino/timing.json*/
wb.menu({
    "name": "Timing",
    "blocks": [
        {
            "blocktype": "step",
            "id": "5f4a98ff-3a12-4f2d-8327-7c6a375c0192",
            "script": "delay(1000*{{1}});",
            "help": "pause before running subsequent blocks",
            "sockets": [
                {
                    "name": "wait",
                    "type": "int",
                    "value": "1"
                },
                {
                    "name": "secs"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "937921ed-49f4-4915-ba39-be217ddb6175",
            "type": "int",
            "script": "(millis())",
            "help": "int value of time elapsed",
            "sockets": [
                {
                    "name": "Milliseconds since program started"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "7d4ab88b-7769-497a-8822-8f0cc92c81de",
            "type": "int",
            "script": "(int(millis()/1000))",
            "help": "int value of time elapsed",
            "sockets": [
                {
                    "name": "Seconds since program started"
                }
            ]
        }
    ]
}
);
/*end languages/arduino/timing.json*/

/*begin languages/arduino/variables.json*/
wb.menu({
    "name": "Variables",
    "blocks": [
        {
            "blocktype": "step",
            "id": "eda33e3e-c6de-4f62-b070-f5035737a241",
            "script": "String {{1}} = '{{2}}';",
            "help": "Create a string variable",
            "sockets": [
                {
                    "name": "Create",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "set to",
                    "type": "string",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "3423bd33-6a55-4660-ba78-2304308b653d",
            "script": "{{1}} = '{{2}}';",
            "help": "Change the value of an already created string variable",
            "sockets": [
                {
                    "name": "",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "=",
                    "type": "string",
                    "value": null
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "076b71fc-23eb-485a-8002-7e84abe8b6cf",
            "type": "string",
            "script": "{{1}}",
            "help": "Get the value of a string variable",
            "sockets": [
                {
                    "name": "value of",
                    "type": "string",
                    "value": "var"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "1236184b-2397-44b3-8c69-0b184e24ffd8",
            "script": "int {{1}} = {{2}}'",
            "help": "Create an integer variable",
            "sockets": [
                {
                    "name": "Create",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "set to",
                    "type": "int",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "60a81c46-fd2e-4eb4-a828-00d201534baa",
            "script": "{{1}} = {{2}};",
            "help": "Change the value of an already created integer variable",
            "sockets": [
                {
                    "name": "",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "=",
                    "type": "int",
                    "value": "0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "06a44aae-31a8-4909-80b9-61151dc2d666",
            "type": "int",
            "script": "{{1}}",
            "help": "Get the value of an integer variable",
            "sockets": [
                {
                    "name": "value of",
                    "type": "string",
                    "value": "var"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "645f8dde-a050-4106-b436-57c9f2301b17",
            "script": "float {{1}} = {{2}}",
            "help": "Create a decimal variable",
            "sockets": [
                {
                    "name": "Create",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "set to",
                    "type": "float",
                    "value": "0.0"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "f487db77-3f81-47ae-8fb5-478e24019c0b",
            "script": "{{1}} = {{2}};",
            "help": "Change the value of an already created deciaml variable",
            "sockets": [
                {
                    "name": "",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "=",
                    "type": "float",
                    "value": "0.0"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "705a5ef3-c0b9-49f5-885d-f195c2f4c464",
            "type": "float",
            "script": "{{1}}",
            "help": "Get the value of a decimal variable",
            "sockets": [
                {
                    "name": "value of",
                    "type": "string",
                    "value": "var"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "c4ab9c5d-4493-429c-beb1-be9b411c0a7e",
            "script": "int {{1}} = {{2}};",
            "help": "Create a new true or false variable",
            "sockets": [
                {
                    "name": "Create",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "set to",
                    "type": "boolean",
                    "value": "false"
                }
            ]
        },
        {
            "blocktype": "step",
            "id": "027bbe7b-6b50-4d94-b447-9bca02ec513f",
            "script": "{{1}} = {{2}};",
            "help": "Change the value of an already created true or false variable",
            "sockets": [
                {
                    "name": "",
                    "type": "string",
                    "value": "var"
                },
                {
                    "name": "=",
                    "type": "boolean",
                    "value": "false"
                }
            ]
        },
        {
            "blocktype": "expression",
            "id": "a41881a2-7cce-4ee5-98f4-c8067e3d57a6",
            "type": "boolean",
            "script": "{{1}}",
            "help": "Get the value of a true or false variable",
            "sockets": [
                {
                    "name": "value of",
                    "type": "string",
                    "value": "var"
                }
            ]
        }
    ]
}
);
/*end languages/arduino/variables.json*/

/*begin launch.js*/
// Minimal script to run on load
// Loads stored state from localStorage
// Detects mode from URL for different embed views

switch(wb.view){
    case 'editor':
    case 'blocks':
    case 'result':
        switchMode(wb.view);
        break;
    default:
        switchMode('editor');
        break;
}

function switchMode(mode){
    var loader = document.querySelector('#block_menu_load');
    loader.parentElement.removeChild(loader);
    document.body.className = mode;
    wb.loadCurrentScripts(q);
}

/*end launch.js*/
