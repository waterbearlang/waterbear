
/*begin queryparams.js*/
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

    wb.findChild = function(){
        var args = wb.makeArray(arguments);
        var elem = wb.elem(args.shift());
        var children, selector;
        while(args.length){
            selector = args.shift();
            children = wb.makeArray(elem.children);
            for(var i = 0; i < children.length; i++){
                if (wb.matches(children[i], selector)){
                    elem = children[i];
                    break;
                }
            }
        }
        return elem;
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
        document.head.append(wb.elem('script', {src: url, id: id}));
    }




})(this);

/*end util.js*/

/*begin event.js*/
// Add support for event delegation on top of normal DOM events
// Minimal support for non-DOM events
// Normalized between mouse and touch events

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
        if (typeof handler !== 'function'){ console.flog('fourth argument must be handler'); }
        var listener;
        if (selector){
            listener = function(event){
                blend(event); // normalize between touch and mouse events
                // if (eventname === 'mousedown'){
                //     console.log(event);
                // }
                if (!event.wbValid) return;
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
                if (!event.wbValid) return;
                handler(event);
            };
        }
        elem.addEventListener(eventname, listener);
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
        var evt = new CustomEvent(eventname, {detail: data});
        elem.dispatchEvent(evt);
    };

    // Are touch events supported?
    var isTouch = ('ontouchstart' in global);

    // Treat mouse events and single-finger touch events similarly
    var blend = function(event){
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

    // FIXME: Remove references to waterbear or jquery (jquery done!)
    // FIXME: Include mousetouch in garden
    // FIXME: Refactor utilities for testing rectangles to its own library (done)


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
        if (wb.matches(eT, 'input, select, option, .disclosure')  && !wb.matches(eT, '#block_menu *')) {
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
        if (wb.matches(dragTarget, '.expression')){
            wb.hide(dropCursor());
        }
        dragTarget.classList.add("dragIndication");
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
        if (dragTarget.dataset.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            dragTarget = dragTarget.cloneNode(true); // clones dataset and children, yay
            delete dragTarget.dataset.isTemplateBlock;
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
            Event.trigger(dragTarget, 'removeFromScript');
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
            // FIXME: Handle this event
            console.log('triggering deleteBlock');
            Event.trigger(dragTarget, 'deleteBlock');
            dragTarget.parentElement.removeChild(dragTarget);
        }else if (wb.overlap(dragTarget, workspace)){
            dropTarget.classList.remove('dropActive');
            if (wb.matches(dragTarget, '.step')){
                // Drag a step to snap to a step
                // dropTarget.parent().append(dragTarget);
                dropTarget.insertBefore(dragTarget, dropCursor());
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'addToScript', dropTarget);
            }else{
                console.log('inserting a value in a socket');
                // Insert a value block into a socket
                wb.findChildren(dropTarget, 'input, select').forEach(function(elem){
                    wb.hide(elem); // FIXME: Move to block.js
                });
                dropTarget.appendChild(dragTarget);
                dragTarget.removeAttribute('style');
                Event.trigger(dragTarget, 'addToScript', dropTarget);
            }
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                // Put blocks back where we got them from
                if (startParent){
                    if (wb.matches(startParent, '.socket')){
                        wb.findChildren(startParent, 'input').forEach(function(elem){
                            elem.hide();
                        });
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
        var position, middle, y = wb.rect(dragTarget).top;
        for (var tIdx = 0; tIdx < potentialDropTargets.length; tIdx++){
            dropTarget = potentialDropTargets[tIdx];
            if (wb.overlap(dragTarget, dropTarget)){
                var siblings = wb.findChildren(dropTarget, '.step');
                if (siblings.length){
                    for (sIdx = 0; sIdx < siblings.length; sIdx++){
                        var sibling = siblings[sIdx];
                        position = wb.rect(sibling);
                        if (y < position.top || y > position.bottom) continue;
                        middle = position.top + (position.height / 2);
                        if (y < middle){
                            dropTarget.insertBefore(dropCursor(), sibling);
                            return;
                        }else{
                            dropTarget.insertBefore(dropCursor(), sibling.nextSibling);
                            return;
                        }
                    }
                }else{
                    dropTarget.appendChild(dropCursor());
                    return;
                }
            }
        }
        wb.findAll(workspace, '.step').forEach(function(elem){
            // FIXME: Convert to for() iteration to avoid going over every element
            position = wb.rect(elem);
            if (y < position.top || y > position.bottom) return;
            middle = position.top + (position.height / 2);
            if (y < middle){
                elem.parentElement.insertBefore(dropCursor(), elem);
            }else{
                elem.parentElement.insertBefore(dropCursor(), elem.nextSibling);
            }
        });
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
        return true;
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
            case 'expression':
                var selector = expressionDropTypes(view.dataset.type).map(dataSelector).join(',');
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
            Event.on('.scripts_workspace', 'tap', '.socket', selectSocket);
        }else{
            Event.on('.scripts_workspace .contained, .block-menu', 'mousedown', '.block', initDrag);
            Event.on('.content', 'mousemove', null, drag);
            Event.on('.content', 'mouseup', null, endDrag);
            Event.on('.scripts_workspace', 'click', '.socket', selectSocket);
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

    var registerBlock = function(blockdesc){
        if (blockdesc.seqNum){
            registerSeqNum(blockdesc.seqNum);
        }else{
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
        return blockRegistry[id].script;
    }

    var getSockets = function(obj){
        return blockRegistry[obj.scriptid || obj.id].sockets.map(Socket);
    }

    var Block = function(obj){
        // FIXME:
        // Handle values coming from serialized (saved) blocks
        // Handle customized names (sockets)
        registerBlock(obj);
        var block = elem(
            'div',
            {
                'class': function(){
                    var names = ['block', obj.group, obj.blocktype];
                    if (obj.blocktype === 'context'){
                        names.push('step');
                    }else if (obj.blocktype === 'eventhandler'){
                        names.push('step');
                        names.push('context');
                    }
                    return names.join(' ');
                },
                'data-blocktype': obj.blocktype,
                'id': obj.id,
                'data-scopeid': obj.scopeid || 0,
                'data-scriptid': obj.scriptid || obj.id,
                'title': obj.help || getHelp(obj.scriptid || obj.id)
            },
            elem('div', {'class': 'label'}, getSockets(obj))
        );
        if (obj.type){
            block.dataset.type = obj.type; // capture type of expression blocks
        }
        if (obj.blocktype === 'context' || obj.blocktype === 'eventhandler'){
            block.appendChild(elem('div', {'class': 'locals block-menu'}, (obj.locals || []).map(
                function(spec){
                    spec.isTemplateBlock = true;
                    spec.isLocal = true;
                    spec.group = obj.group;
                    return Block(spec)
                })));
            block.appendChild(elem('div', {'class': 'contained'}, (obj.contained || []).map(Block)));
        }
        return block;
    }

    var Socket = function(obj){
        // Sockets are described by text, type, and default value
        // type and default value are optional, but if you have one you must have the other
        // If the type is choice it must also have a choicename for the list of values
        // that can be found in the wb.choiceLists
        var socket = elem('div',
            {
                'class': 'socket',
                'data-name': obj.name
            },
            elem('label', {'class': 'name'}, obj.name)
        );
        if (obj.type){
            socket.dataset.type = obj.type;
            socket.appendChild(elem('div', {'class': 'holder'}, [Default(obj)]))
        }
        return socket;
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
                value = obj.value || ''; break;
            case 'number':
                value = obj.value || 0; break;
            case 'string':
                value = obj.value || ''; break;
            case 'color':
                value = obj.value || '#000000'; break;
            case 'date':
                value = obj.value || new Date().toISOString().split('T')[0]; break;
            case 'time':
                value = obj.value || new Date().toISOString().split('T')[1]; break;
            case 'datetime':
                value = obj.value || new Date().toISOString(); break;
            case 'url':
                value = obj.value || 'http://waterbearlang.com'; break;
            case 'image':
                value = obj.value || ''; break;
            case 'phone':
                value = obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.value || 'waterbear@waterbearlang.com'; break;
            case 'boolean':
                obj.options = 'boolean';
            case 'choice':
                var choice = elem('select');
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    if (obj.default && obj.default === opt){
                        option.setAttribute('selected', 'selected');
                    }
                    choice.appendChild(option);
                });
                return choice;
            default:
                if (obj.default){
                    return Block(obj.default);
                }else{
                    value = obj.value || '';
                }
        }
        return elem('input', {type: type, value: value});
    }


    wb.Block = Block;
    wb.registerSeqNum = registerSeqNum;

})(wb);


/*end block.js*/

/*begin ui.js*/
(function(wb){

// UI Chrome Section

function tabSelect(event){
    var target = event.wbTarget;
    document.querySelector('.tabbar .selected').classList.remove('selected');
    target.classList.addToScriptEvent('selected');
    if (wb.matches(target, '.scripts_workspace_tab')){
        showWorkspace('block');
    }else if (self.is('.scripts_text_view_tab')){
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

function runCurrentScripts(event){
	if (document.body.className === 'result' && wb.script){
		wb.runScript(wb.script);
	}else{
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
		document.body.className = 'result';
		wb.runScript( wb.prettyScript(blocks) );
	}
}
Event.on('.runScripts', 'click', null, runCurrentScripts);

wb.runScript = function(script){
	wb.script = script;
	document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'runscript', script: script}), '*');
}

function clearStage(event){
	document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
}
Event.on('.clear_canvas', 'click', null, clearStage);

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
    removeFromScriptEvent(view);
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

var menu_built = false;
var saved_menus = [];

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

function run_menu(title, specs){
	if (menu_built){
		return edit_menu(title, specs);
	}
	saved_menus.push([title, specs]);
}

wb.buildDelayedMenus = function(){
	if (!menu_built && saved_menus.length){
		saved_menus.forEach(function(m){
			edit_menu(m[0], m[1]);
		});
		saved_menus = [];
	}
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
        document.querySelector('.workspace > .scripts_workspace').remove();
        createWorkspace('Workspace');
		document.querySelector('.workspace > .scripts_text_view').innerHTML = '';
    }
}
Event.on('.clearScripts', 'click', null, clearScripts);
Event.on('.editScript', 'click', null, function(){
	document.body.className = 'editor';
	wb.buildDelayedMenus();
	wb.loadCurrentScripts(wb.queryParams);
});

Event.on('.goto_stage', 'click', null, function(){
	document.body.className = 'result';
});

// Load and Save Section

function saveCurrentScripts(){
    wb.showWorkspace('block');
    document.querySelector('#block_menu').scrollIntoView();
    localStorage['__' + language + '_current_scripts'] = wb.Block.serialize();
}
// window.onunload = saveCurrentScripts;

function scriptsToString(title, description){
    if (!title){ title = ''; }
    if (!description){ description = ''; }
    return JSON.stringify({
        title: title,
        description: description,
        date: Date.now(),
        scripts: wb.Block.scriptsToObject('.scripts_workspace')
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

function comingSoon(evt){
    alert('Restore will be working again soon. You can drag saved json files to the script workspace now.');
}

Event.on('.save_scripts', 'click', null, createDownloadUrl);
Event.on('.restore_scripts', 'click', null, comingSoon);

function loadScriptsFromObject(fileObject){
    // console.info('file format version: %s', fileObject.waterbearVersion);
    // console.info('restoring to workspace %s', fileObject.workspace);
    // FIXME: Make sure we have the appropriate plugins loaded
	if (!fileObject) return createWorkspace();
    var blocks = fileObject.blocks.map(function(spec){
        return wb.Block(spec);
    });
    if (!blocks.length){
        return createWorkspace();
    }
    if (blocks.length > 1){
        console.log('not really expecting multiple blocks here right now');
    }
    blocks.forEach(function(block){
        var view = block.view()[0]; // FIXME: strip jquery wrapper
        wireUpWorkspace(view);
        block.script = '[[1]]';
        Event.trigger(view, 'addToScript', workspace);
    });
    wb.loaded = true;
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
	loadScriptsFromObject(JSON.parse(file).scripts);
    Event.trigger(document.body, 'scriptLoaded');
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
    if (wb.loaded) return;
    console.log('loading current scripts');
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
        scriptid: id,
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

function getFiles(evt){
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    if ( files.length > 0 ){
        // we only support dropping one file for now
        var file = files[0];
        if ( file.type.indexOf( 'json' ) === -1 ) { return; }
        var reader = new FileReader();
        reader.readAsText( file );
        reader.onload = function (evt){
            clearScripts(null, true);
            var saved = JSON.parse(evt.target.result);
            loadScriptsFromObject(saved.scripts);
        };
    }
}



})(wb);

/*end workspace.js*/

/*begin serialization-1.1.js*/
//
//  Serialize all the blocks in every workspace
//

// TODO:
// * Add timestamp
// * Allow name/description for scripts
// * Add version of script, automatically generated
// * Separate each workspace into its own file. This makes more sense and will simplify things, allow files to be cross-included
// * Include history of editorship (who created, who modified)
// * UI to get this info

(function(wb){

wb.Block.serialize = function(){
    return JSON.stringify(wb.Block.scriptsToObject('.scripts_workspace'));
};

wb.Block.scriptsToObject = function(workspace){
	if (!workspace) workspace = '.scripts_workspace'; // make a default for debugging convience
    var workspaceDom = document.querySelector(workspace);
    var workspaceModel = wb.Block.model(workspaceDom);
    // console.log('workspace selector: %s', workspace);
    // console.log('workspaces found: %s', $(workspace).length);
    return {
        "waterbearVersion": "1.1",
        "workspace": workspaceModel.spec.label,
        "blocks": [workspaceModel.toJSON()]
    };
};

// Utility to verify that a list exists and contains values
function exists(list){
    if (!list) return false;
    if (!list.length) return false;
    for (var i=0; i < list.length; i++){
        if (list[i]) return true;
    }
    return false;
}

wb.Block.prototype.toJSON = function(){
    var self = this;
    var serialized = {
        blocktype: self.blocktype,
        label: self.spec.label,
        group: self.group,
        id: self.id
    };
    if (self.seqNum){
        serialized.seqNum = self.seqNum;
    }else{
        console.warn('Block has no seqnum');
    }
    if (self.scriptid){
        serialized.scriptid = self.scriptid;
    }else{
        console.warn('Block has no scriptid');
    }
    if (self.collapsed){
        serialized.collapsed = self.collapsed; // persist open/closed state
    }
    if (self.scope){
        serialized.scope = self.scope;
    }else{
        console.warn('Block has no scope');
    }
    if (exists(self.values)){
        // console.info('with %s values', this.values.length);
        serialized.values = self.values.map(function(value){
            if (value && value.toJSON){
                return value.toJSON();
            }
            return value;
        });
    }
    if (exists(self.contained)){
        // console.info('with %s contained', this.contained.length);
        serialized.contained = self.contained.map(function(child){
            if (child && child.toJSON){
                return child.toJSON();
            }
            return null;
        });
    }
    if (exists(self.locals)){
        serialized.locals = self.locals.map(function(local){
            if (local && local.toJSON){
                return local.toJSON();
            }
            return local;
        });
    }
    return serialized;
};

// wb.Value.prototype.toJSON = function(){
//     // Implement me and make sure I round-trip back into the block model
//     var struct;
//     if (this.value && this.value.toJSON){
//         // console.info('serializing block value');
//         struct = {
//             type: this.type,
//             value: this.value.toJSON()
//         };
//     }else{
//         // console.info('serializing raw value');
//         struct = {
//             type: this.type,
//             value: this.value
//         };
//         if (this.choiceName){
//             struct.choiceName = this.choiceName;
//         }
//     }
//     return struct;
// };


wb.Block.reify = function(serialized){
};

})(wb);

/*end serialization-1.1.js*/

/*begin arduino.js*/
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
        return wb.Block.model(elem).code();
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

/*end arduino.js*/

/*begin boolean.json*/
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
                    "default": null
                },
                {
                    "name": "and",
                    "type": "boolean",
                    "default": null
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
                    "default": null
                },
                {
                    "name": "or",
                    "type": "boolean",
                    "default": null
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
                    "default": null
                }
            ]
        }
    ]
});
/*end boolean.json*/

/*begin control.json*/
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
                    "default": "ack"
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
                    "default": "ack"
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
                    "default": "false"
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
                    "default": null
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
                    "default": null
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
                    "default": null
                }
            ]
        }
    ]
});
/*end control.json*/

/*begin digitalio.json*/
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
                    "default": "choice"
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
                    "default": null
                },
                {
                    "name": "ON if",
                    "type": "boolean",
                    "default": null
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
                    "default": "choice"
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
                    "default": null
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
                    "default": "choice"
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
                    "default": null
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
                    "default": "choice"
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
                    "default": null
                },
                {
                    "name": "outputs",
                    "type": "int",
                    "default": "255"
                }
            ]
        }
    ]
}
);
/*end digitalio.json*/

/*begin math.json*/
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
                    "default": "0"
                },
                {
                    "name": "+",
                    "type": "number",
                    "default": "0"
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
                    "default": "0"
                },
                {
                    "name": "-",
                    "type": "number",
                    "default": "0"
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
                    "default": "0"
                },
                {
                    "name": "*",
                    "type": "number",
                    "default": "0"
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
                    "default": "0"
                },
                {
                    "name": "/",
                    "type": "number",
                    "default": "0"
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
                    "default": "1"
                },
                {
                    "name": "to",
                    "type": "number",
                    "default": "10"
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
                    "default": "1"
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
                    "default": "0"
                },
                {
                    "name": "<",
                    "type": "number",
                    "default": "0"
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
                    "default": "0"
                },
                {
                    "name": "=",
                    "type": "number",
                    "default": "0"
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
                    "default": "0"
                },
                {
                    "name": ">",
                    "type": "number",
                    "default": "0"
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
                    "default": "0"
                },
                {
                    "name": "mod",
                    "type": "number",
                    "default": "0"
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
                    "default": "0"
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
                    "default": "10"
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
                    "default": "10"
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
                    "default": "10"
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
                    "default": "10"
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
                    "default": "10"
                },
                {
                    "name": "to the power of",
                    "type": "number",
                    "default": "2"
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
                    "default": "10"
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
                    "default": "10"
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
                    "default": null
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
                    "default": null
                },
                {
                    "name": "from",
                    "type": "number",
                    "default": "0]-[number"
                },
                {
                    "name": "to",
                    "type": "number",
                    "default": "0]-[number"
                }
            ]
        }
    ]
});
/*end math.json*/

/*begin serialio.json*/
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
                    "default": "choice"
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
                    "default": "Message"
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
                    "default": "Message"
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
});
/*end serialio.json*/

/*begin timing.json*/
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
                    "default": "1"
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
});
/*end timing.json*/

/*begin variables.json*/
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
                    "default": "var"
                },
                {
                    "name": "set to",
                    "type": "string",
                    "default": null
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
                    "default": "var"
                },
                {
                    "name": "=",
                    "type": "string",
                    "default": null
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
                    "default": "var"
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
                    "default": "var"
                },
                {
                    "name": "set to",
                    "type": "int",
                    "default": "0"
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
                    "default": "var"
                },
                {
                    "name": "=",
                    "type": "int",
                    "default": "0"
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
                    "default": "var"
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
                    "default": "var"
                },
                {
                    "name": "set to",
                    "type": "float",
                    "default": "0.0"
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
                    "default": "var"
                },
                {
                    "name": "=",
                    "type": "float",
                    "default": "0.0"
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
                    "default": "var"
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
                    "default": "var"
                },
                {
                    "name": "set to",
                    "type": "boolean",
                    "default": "false"
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
                    "default": "var"
                },
                {
                    "name": "=",
                    "type": "boolean",
                    "default": "false"
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
                    "default": "var"
                }
            ]
        }
    ]
}
);
/*end variables.json*/

/*begin launch.js*/
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
    document.querySelector('#block_menu_load').remove();
    document.body.className = mode;
    //wb.loadCurrentScripts(q);
    // remove next line once load/save is working
    wb.createWorkspace('Workspace');
}

/*end launch.js*/
