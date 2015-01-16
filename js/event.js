// Bare-bones Event library
// Adds support for event delegation on top of normal DOM events (like jQuery "live" events)
// Minimal support for non-DOM (custom) events
// Normalized between mouse and touch events
// Supports namespaced events, removing event listeners by namespace

(function(){
    "use strict";

    function isDomObject(e){
        if (e === window) return true;
        if (e === document) return true;
        if (e.tagName) return true;
        return false;
    }

    // Move these to utils.js

    // Maintain references to events so we can mass-remove them later
    var allEvents = {};

    // Refactor this into an constructor with prototype methods
    function cloneEvent(evt){
        var newEvent = {};
        for (var key in evt){
            if (key === 'returnValue'){ continue; }
            if (key === 'keyLocation'){ continue; }
            if (typeof evt[key] === 'function'){ continue; }
            newEvent[key] = evt[key];
        }
        newEvent.original = evt;
        newEvent.stopPropagation = function(){
            evt.stopPropagation();
        };
        newEvent.preventDefault = function(){
            evt.preventDefault();
        };
        return newEvent;
    }

    function on(elem, eventname, selector, handler, onceOnly){
        var ns_name = eventname.split(':');
        var namespace = 'global';
        if (ns_name.length === 2){
            namespace = ns_name[0];
            eventname = ns_name[1];
        }else{
            // console.warn('Setting event handler in global namespace: %o : %s', elem, eventname);
        }
        if (typeof elem === 'string'){
            return dom.makeArray(document.querySelectorAll(elem)).map(function(e){
                return on(e, eventname, selector, handler);
            });
        }
        if (!isDomObject(elem)){
            console.error('first argument must be element, document, or window: %o', elem);
            throw new Error('first argument must be element, document, or window');
        }
        if (typeof eventname !== 'string'){
            console.error('second argument must be eventname: %s', eventname);
            throw new Error('second argument must be eventname: ' + eventname);
        }
        if (selector && typeof selector !== 'string'){ console.error('third argument must be selector or null'); }
        if (typeof handler !== 'function'){ console.error('fourth argument must be handler'); }
        var listener = function listener(originalEvent){
            var evt;
            // console.log('event %s', originalEvent.type);
            if (originalEvent.detail && originalEvent.detail.forwarded){
                // console.log('unwrapping forwarded event %s: %o', originalEvent.type, originalEvent.detail.forwarded);
                evt = blend(originalEvent.detail.forwarded);
                evt.type = originalEvent.type;
            }else{
                evt = blend(originalEvent); // normalize between touch and mouse events
            }
            if (evt.invalid){
                // console.log('event is not valid: %o', evt);
                return;
            }
            if (onceOnly){
                Event.off(elem, eventname, listener);
            }
            if (selector){
                if (dom.matches(evt.target, selector)){
                    handler(evt);
                // }else if (dom.matches(evt.target, selector + ' *')){
                //     // Fix for missing events that are contained in child elements
                //     // Bubble up to the nearest matching parent
                //     evt.target = dom.closest(evt.target, selector);
                //     handler(evt);
                }
            }else{
                handler(evt);
            }
        };
        elem.addEventListener(eventname, listener, false);
        util.setDefault(allEvents, namespace, []).push([elem, eventname, listener]);
        return listener;
    }

    function off(elem, eventname, handler){
        var ns_name = eventname.split(':');
        var namespace = 'global';
        if (ns_name.length === 1){
            namespace = ns_name[0];
            eventname = ns_name[1];
        }
        if (handler){
            elem.removeEventListener(eventname, handler);
        }else{
            allEvents[namespace].slice().forEach(function(elem_name_hand, idx){
                // Pass in null element to remove listeners from all elements
                var el = elem || elem_name_hand[0];
                var en = eventname === '*' ? elem_name_hand[1] : eventname;
                var hd = elem_name_hand[2];
                if (el === elem_name_hand[0] && eventname === elem_name_hand[1]){
                    elem.removeEventListener(elem_name_hand[1], elem_name_hand[2]);
                    allEvents[namespace].splice(idx, 1); // remove elem_name_hand from allEvents
                }
            });
        }
    }

    function once(elem, eventname, selector, handler){
        return Event.on(elem, eventname, selector, handler, true);
    }

    function trigger(elemOrSelector, eventname, data){
        var elem = elemOrSelector;
        if (typeof elemOrSelector === 'string'){
            elem = document.querySelector(elemOrSelector);
        }
        var evt = new CustomEvent(eventname, {bubbles: true, cancelable: true, detail: data});
        // console.log('dispatching %s for %o', eventname, elem);
        elem.dispatchEvent(evt);
    }

    function forward(elem, eventName, evt){
        if (evt.original){
            evt = evt.original;
        }
        trigger(elem, eventName, {forwarded: evt});
    }

    // Are touch events supported?
    var isTouch = ('ontouchstart' in window);
    function isMouseEvent(evt){
        switch(evt.type){
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
            case 'click':
                return true;
            default:
                return false;
        }
    }

    function isTouchEvent(evt){
        switch(evt.type){
            case 'touchstart':
            case 'touchmove':
            case 'touchend':
            case 'tap':
                return true;
            default:
                return false;
        }
    }

    function isPointerEvent(event){
        return isTouchEvent(event) || isMouseEvent(event);
    }

    // Treat mouse events and single-finger touch events similarly
    function blend(originalEvent){
        var evt = cloneEvent(originalEvent);
        if (isPointerEvent(evt)){
            if (isTouchEvent(evt)){
                var touch = null;
                if (evt.touches.length === 1){
                    touch = evt.touches[0];
                }else if (evt.changedTouches.length === 1){
                    touch = evt.changedTouches[0];
                }else{
                    evt.invalid = true;
                    evt.invalidReason = 'Multiple touches present';
                    return evt;
                }
                evt.target = touch.target;
                evt.pageX = touch.pageX;
                evt.pageY = touch.pageY;
            }else{
                // is this necessary or desirable?
                if (evt.which !== 1){ // left mouse button
                    evt.invalid = true;
                    evt.invalidReason = 'Not the left mouse button';
                    return evt;
                }
            }
			evt.x = evt.pageX;
			evt.y = evt.pageY;
        }
        return evt;
    }



    /****************************
     *
     *  Synthesize dragging events
     *
     *  Simple dragging within the window and DOM, not to/from desktop or wild crazy stuff like that
     *
     *  NOT W3C "HTML5 Drag and Drop" which is badly broken and not supported at all on mobile
     *
     *  File under "Things we shouldn't have to do"
     *
     *****************************/
    var dragTarget = null;
    var isDragging = false;
    var startPos = {x: 0, y: 0};
    var DELTA = 5; // movement required to trigger drag vs. tap

    function reset(){
        // called when we end a drag for any reason
        dragTarget = null;
        isDragging = false;
        Event.pointerDown = false;
        trigger(document, 'drag-reset');
    }

    function initDrag(evt){
        // Called on mousedown or touchstart, we haven't started dragging yet
        // Don't start drag on a text input or select
        if (dom.closest(evt.target, 'input, select')){
            return undefined;
        }
        // console.log('init drag: ' +  evt.target.tagName.toLowerCase());
        Event.pointerDown = true;
        Event.pointerX = evt.pageX;
        Event.pointerY = evt.pageY;
        dragTarget = evt.target;
        startPos = {x: evt.pageX, y: evt.pageY};
        forward(dragTarget, 'drag-init', evt);
    }

    function startDrag(evt){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) { return undefined; }
        if (!Event.pointerDown) { return undefined; }
        // console.info('start drag: ' + dragTarget.tagName.toLowerCase());
        isDragging = true;
        forward(dragTarget, 'drag-start', evt);
        return false;
    }

    function dragging(evt){
        Event.pointerX = evt.pageX;
        Event.pointerY = evt.pageY;
        if (!dragTarget) { return undefined; }
        if (!isDragging) {
            // Test if we've moved more than a delta?
            // Otherwise this could block legitimate click/tap events
            // var distanceMoved = Math.sqrt(Math.pow(evt.pageX - startPos.x, 2) + Math.pow(evt.pageY - startPos.y));
            // if (distanceMoved < DELTA){
                // console.info('Have not moved enough yet');
            //     return undefined;
            // }
            if (startDrag(evt) === undefined) {
                return undefined;
            }
        }
        // console.log('dragging: ' + dragTarget.tagName.toLowerCase() + ' (' + evt.pageX + ', ' + evt.pageY + ')');
        evt.preventDefault();
        forward(dragTarget, 'dragging', evt);
        return false;
    }

    function endDrag(evt){
        Event.pointerDown = false;
        if (!isDragging) { return undefined; }
        // console.log('end drag: ' + dragTarget.tagName.toLowerCase());
        forward(dragTarget, 'drag-end', evt);
        // FIXME: Don't prevent default unless we've dragged more than delta
        evt.preventDefault();
        reset();
        return false;
    }

    function cancelDrag(evt) {
        // Cancel if escape key pressed
        if(evt.keyCode == 27 && isDragging) {
            forward(dragTarget, 'drag-cancel', evt);
            reset();
            return false;
        }
    }


    /*****************************
    *
    *   Keyboard events
    *
    ******************************/

    var specialKeys = {
        // taken from jQuery Hotkeys Plugin
        8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
        20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
        37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
        96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
        104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
        112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
        120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
    };

    var shiftNums = {
        // taken from jQuery Hotkeys Plugin
        "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
        "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
        ".": ">",  "/": "?",  "\\": "|"
    }


    function keyForEvent(evt){
        if (specialKeys[evt.keyCode]){
            return specialKeys[evt.keyCode];
        }else{
            return String.fromCharCode( evt.which ).toLowerCase();
        }
    }

    function isKeyDown(key){
        return this.keys[key];
    }

    function handleKeyDown(evt){
        var key = keyForEvent(evt);
        Event.keys[key] = true;
        if (Event.keyHandlers[key]){
            Event.keyHandlers.forEach(function(handler){
                handler(evt);
            });
        }
    }

    function handleKeyUp(evt){
        Event.keys[keyForEvent(evt)] = false;
    }

    function onKeyDown(key, handler){
        if (! Event.keyHandlers[key] ){
            Event.keyHandlers[key] = [];
        }
        Event.keyHandlers[key].push(handler);
    };


    function clearRuntime(){
        Event.keyHandlers = {};
    }

    window.Event = {
        on: on,
        onKeyDown: onKeyDown, // special version of on to listen for specific keys
        off: off,
        once: once,
        trigger: trigger,
        forward: forward,
        cloneEvent: cloneEvent,
        isTouch: isTouch,
        // Variables for use by programs
        pointerDown: false,
        pointerX: 0,
        pointerY: 0,
        keys: {},
        keyHandlers: {}
    };


    Event.on(document.body, 'touchstart', null, initDrag);
    Event.on(document.body, 'touchmove', null, dragging);
    Event.on(document.body, 'touchend', null, endDrag);
    Event.on(document.body, 'mousedown', null, initDrag);
    Event.on(document.body, 'mousemove', null, dragging);
    Event.on(window, 'mouseup', null, endDrag);
    Event.on(window, 'keyup', null, cancelDrag);
    Event.on(window, 'keydown', null, handleKeyDown);
    Event.on(window, 'keyup', null, handleKeyUp);


})();
