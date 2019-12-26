// Bare-bones Event library
// Adds support for event delegation on top of normal DOM events (like jQuery "live" events)
// Minimal support for non-DOM (custom) events
// Normalized between mouse and touch events
// Supports namespaced events, removing event listeners by namespace

(function() {
    "use strict";

    function isDomObject(e) {
        if (e === window) return true;
        if (e === document) return true;
        if (e.tagName) return true;
        return false;
    }

    if (!CustomEvent) {
        var CustomEvent = function CustomEvent(event, params) {
            params = params || {
                bubbles: false,
                cancelable: false,
                detail: undefined
            };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    // Move these to utils.js

    // Maintain references to events so we can mass-remove them later
    var allEvents = {};

    // Give all scoped events a class for future reference.
    function ScopedEvent(elem, eventname, listener) {
        this.element = elem;
        this.name = eventname;
        this.listener = listener;
    }

    // Refactor this into an constructor with prototype methods
    function cloneEvent(evt) {
        var newEvent = {};
        for (var key in evt) {
            if (key.substring(0, 6) === 'webkit') {
                continue;
            }
            if (key === 'returnValue') {
                continue;
            }
            if (key === 'keyLocation') {
                continue;
            }
            if (typeof evt[key] === 'function') {
                continue;
            }
            newEvent[key] = evt[key];
        }
        newEvent.original = evt;
        newEvent.stopPropagation = function() {
            evt.stopPropagation();
        };
        newEvent.preventDefault = function() {
            evt.preventDefault();
        };
        return newEvent;
    }

    function on(elem, originalEventname, selector, handler, onceOnly) {
        var eventname, ns_name, namespace;

        // Allow use of selector for `elem`.
        if (typeof elem === 'string') {
            // Bind all elements matched by `elem` selector. Not recommended due to
            // multiple event listeners used when one could suffice and be
            // matched using the `selector` argument.
            return [].slice.call(document.querySelectorAll(elem)).map(function(e) {
                return on(e, originalEventname, selector, handler, onceOnly);
            });
        }

        // Argument validation.
        if (typeof originalEventname !== 'string') {
            console.error('second argument must be eventname: %s', eventname);
            throw new Error('second argument must be eventname: ' + eventname);
        }
        if (!isDomObject(elem)) {
            console.error('first argument must be element, document, or window: %o', elem);
            throw new Error('first argument must be element, document, or window');
        }
        if (selector && typeof selector !== 'string') {
            throw new TypeError('third argument must be selector String or null');
        }
        if (typeof handler !== 'function') {
            throw new TypeError('fourth argument must be handler');
        }

        // Check for presence of namespace.
        ns_name = originalEventname.split(':');
        if (ns_name.length === 2) {
            namespace = ns_name[0];
            eventname = ns_name[1];
        } else if (ns_name.length === 1) {
            namespace = 'global';
            eventname = originalEventname;
            console.warn('Registering `' + eventname + '` in the global namespace');
        } else {
            throw new Error('Invalid namespace: ' + originalEventname);
        }

        var listener = function listener(originalEvent) {
            var evt;
            if (originalEvent.detail && originalEvent.detail.forwarded) {
                evt = blend(originalEvent.detail.forwarded);
                evt.type = originalEvent.type;
            } else {
                evt = blend(originalEvent); // normalize between touch and mouse events
            }
            if (evt.invalid) {
                return;
            }
            if (onceOnly) {
                Event.off(elem, originalEventname, listener);
            }
            if (selector) {
                if (dom.matches(evt.target, selector)) {
                    handler(evt);
                }
            } else {
                handler(evt);
            }
        };
        /// liveFix is needed because Firefox doesn't support "focusin" events and "focus" events don't bubble
        var liveFix = false;
        if (selector && (eventname === 'focus' || eventname === 'blur')) { // any others?
            liveFix = true;
        }
        elem.addEventListener(eventname, listener, liveFix);
        util.setDefault(allEvents, namespace, []).push(new ScopedEvent(elem, eventname, listener));
        return listener;
    }

    function off(elem, eventname, handler) {
        var events;
        var ns_name = eventname.split(':');
        var namespace = 'global';
        if (ns_name.length === 2) {
            // It's a scoped event.
            namespace = ns_name[0];
            eventname = ns_name[1];
        }
        events = allEvents[namespace];

        if (!events) {
            // No events registered for the given namespace.
            return;
        }

        // Copy the array, because we'll be modifying it.
        events.slice().forEach(function(scopedEvent, idx) {
            // Pass in null element to remove listeners from all elements
            var el = elem || scopedEvent.element;
            var name = eventname === '*' ? scopedEvent.name : eventname;
            var listener = handler || scopedEvent.listener;
            if (el === scopedEvent.element && name === scopedEvent.name) {
                el.removeEventListener(name, listener);
                allEvents[namespace].splice(idx, 1); // remove the event from allEvents
            }
        });
    }

    function once(elem, eventname, selector, handler) {
        return Event.on(elem, eventname, selector, handler, true);
    }

    function trigger(elemOrSelector, eventname, data) {
        var elem = elemOrSelector;
        if (typeof elemOrSelector === 'string') {
            elem = document.querySelector(elemOrSelector);
        }
        var evt = new CustomEvent(eventname, {
            bubbles: true,
            cancelable: true,
            detail: data
        });
        elem.dispatchEvent(evt);
    }

    function triggerAsync(elemOrSelector, eventname, data) {
        setTimeout(function() {
            trigger(elemOrSelector, eventname, data);
        }, 0);
    }

    function forward(elem, eventName, evt) {
        if (evt.original) {
            evt = evt.original;
        }
        trigger(elem, eventName, {
            forwarded: evt
        });
    }

    // Are touch events supported?
    var isTouch = ('ontouchstart' in window);

    function isMouseEvent(evt) {
        switch (evt.type) {
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
            case 'click':
                return true;
            default:
                return false;
        }
    }

    function isTouchEvent(evt) {
        switch (evt.type) {
            case 'touchstart':
            case 'touchmove':
            case 'touchend':
            case 'tap':
                return true;
            default:
                return false;
        }
    }

    function isPointerEvent(event) {
        return isTouchEvent(event) || isMouseEvent(event);
    }

    // Treat mouse events and single-finger touch events similarly
    function blend(originalEvent) {
        var evt = cloneEvent(originalEvent);
        if (isPointerEvent(evt)) {
            if (isTouchEvent(evt)) {
                var touch = null;
                if (evt.touches.length === 1) {
                    touch = evt.touches[0];
                } else if (evt.changedTouches.length === 1) {
                    touch = evt.changedTouches[0];
                } else {
                    evt.invalid = true;
                    evt.invalidReason = 'Multiple touches present';
                    console.warn('multiple touches');
                    return evt;
                }
                evt.target = touch.target;
                evt.pageX = touch.pageX;
                evt.pageY = touch.pageY;
            }
        }
        return evt;
    }

    /* Add custom events for adding and removing blocks from the DOM */
    function registerElementsForAddRemoveEvents(root, eventPrefix, parentList, childList) {

        if (typeof MutationObserver === 'undefined') {
            console.warn('If you see this and you are not running tests in PhantomJS you have problems');
            return;
        }

        var blockObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // send childAdded or childRemove event to parent element
                var parent = mutation.target;
                // if (!Node.contains){
                //     console.error('Node.contains not found');
                //     console.error('Find a polyfill');
                // }
                if (!root.contains(parent)) {
                    return;
                }
                var blockParent = dom.closest(parent, parentList);
                if (!blockParent) {
                    return;
                }
                [].slice.apply(mutation.removedNodes)
                    .filter(function(node) {
                        return node.nodeType === node.ELEMENT_NODE && dom.matches(node, childList);
                    }) // only child elements
                    .forEach(function(node) {
                        Event.trigger(blockParent, eventPrefix + 'removedChild', node);
                        // This won't bubble through the tree because the node is
                        // not in the tree anymore
                        //Event.trigger(node, eventPrefix + 'removed', blockParent);
                    });
                [].slice.apply(mutation.addedNodes)
                    .filter(function(node) {
                        return node.nodeType === node.ELEMENT_NODE && dom.matches(node, childList);
                    }) // only block elements
                    .forEach(function(node) {
                        Event.trigger(blockParent, 'wb-addedChild', node);
                        Event.trigger(node, 'wb-added', blockParent);
                    });
            });
        });

        var blockObserverConfig = {
            childList: true,
            subtree: true
        };

        // Only observe after script is loaded?
        blockObserver.observe(document.body, blockObserverConfig);

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
    var startPos = {
        x: 0,
        y: 0
    };
    Event.distancePointerMoved = 0;
    var DELTA = 10; // movement required to trigger drag vs. tap

    function reset() {
        // called when we end a drag for any reason
        dragTarget = null;
        isDragging = false;
        Event.pointerDown = false;
        // FIXME: This doesn't appear to be called
        document.body.classList.remove('dragging');
        trigger(document, 'drag-reset');
    }

    function initDrag(evt) {
        // Called on mousedown or touchstart, we haven't started dragging yet
        // Don't start drag on a text input or select
        if (dom.closest(evt.target, 'input, select')) {
            return undefined;
        }
        // prevent text selection while dragging
        Event.pointerDown = true;
        Event.pointerX = evt.pageX;
        Event.pointerY = evt.pageY;
        dragTarget = evt.target;
        startPos = {
            x: evt.pageX,
            y: evt.pageY
        };
        Event.distancePointerMoved = 0;
        forward(dragTarget, 'drag-init', evt);
    }

    function startDrag(evt) {
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {
            return undefined;
        }
        if (!Event.pointerDown) {
            return undefined;
        }
        document.body.classList.add('dragging');
        isDragging = true;
        forward(dragTarget, 'drag-start', evt);
        return false;
    }

    // Used when we're not tracking dragging
    function trackPointerPosition(evt) {
        Event.pointerX = evt.pageX;
        Event.pointerY = evt.pageY;
    }

    function trackPointerDown(evt) {
        Event.pointerDown = true;
    }

    function trackPointerUp(evt) {
        Event.pointerDown = false;
    }

    function dragging(evt) {
        Event.pointerX = evt.pageX;
        Event.pointerY = evt.pageY;
        Event.distancePointerMoved = util.dist(evt.pageX, startPos.x, evt.pageY, startPos.y);
        if (!dragTarget) {
            return undefined;
        }
        if (!isDragging) {
            // Test if we've moved more than a delta?
            // Otherwise this could block legitimate click/tap events
            if (Event.distancePointerMoved < DELTA) {
                return undefined;
            }
            if (startDrag(evt) === undefined) {
                return undefined;
            }
        }
        evt.preventDefault();
        evt.stopPropagation();
        forward(dragTarget, 'dragging', evt);
        return false;
    }

    function endDrag(evt) {
        Event.pointerDown = false;
        if (!isDragging) {
            return undefined;
        }
        forward(dragTarget, 'drag-end', evt);
        // FIXME: Don't prevent default unless we've dragged more than delta
        evt.preventDefault();
        reset();
        return false;
    }

    function cancelDrag(evt) {
        // Cancel if escape key pressed
        if (evt.keyCode == 27 && isDragging) {
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
        // updated because browsers suck, meta returned for 4 different values
        // see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Non-printable_keys_%28function_keys%29
        8: "backspace",
        9: "tab",
        13: "return",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "del",
        91: "meta",
        92: "meta",
        93: "meta", // left and right commands
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scroll",
        191: "/",
        224: "meta"
    };

    var shiftNums = {
        // taken from jQuery Hotkeys Plugin
        "`": "~",
        "1": "!",
        "2": "@",
        "3": "#",
        "4": "$",
        "5": "%",
        "6": "^",
        "7": "&",
        "8": "*",
        "9": "(",
        "0": ")",
        "-": "_",
        "=": "+",
        ";": ": ",
        "'": "\"",
        ",": "<",
        ".": ">",
        "/": "?",
        "\\": "|"
    };


    function keyForEvent(evt) {
        if (specialKeys[evt.keyCode]) {
            return specialKeys[evt.keyCode];
        } else {
            return String.fromCharCode(evt.which).toLowerCase();
        }
    }

    function handleKeyDown(evt) {
        updateSpecialKeys(evt);
        var key = keyForEvent(evt);
        Event.keys[key] = true;
        if (Event.keyHandlers[key]) {
            Event.keyHandlers[key].forEach(function(handler) {
                handler(evt);
            });
        }
    }

    function handleKeyUp(evt) {
        updateSpecialKeys(evt);
        Event.keys[keyForEvent(evt)] = false;
    }

    function updateSpecialKeys(evt){
        Event.keys.shift = evt.shiftKey;
        Event.keys.meta = evt.metaKey;
        Event.keys.ctrl = evt.ctrlKey;
        Event.keys.alt = evt.altKey;
    }

    function onKeyDown(key, handler) {
        if (!Event.keyHandlers[key]) {
            Event.keyHandlers[key] = [];
        }
        Event.keyHandlers[key].push(handler);
    }

    function clearKeysOnFocusChange(evt){
        // doesn't really matter whether we're gaining or losing focus
        Event.keys = {};
    }

    function clearRuntime() {
        Event.keys = {};
        Event.keyHandlers = {};
        Event.mouseOrTouchHandlers = {};
    }

    /*****************************
     *
     *   Mouse and Touch events
     *
     ******************************/

    function handleMouseOrTouchEvent(type, evt) {
        if (Event.mouseOrTouchHandlers[type]) {
            Event.mouseOrTouchHandlers[type].forEach(function(handler) {
                handler(evt);
            });
        }
    }

    function handleMouseOrTouchUp(evt) {
        handleMouseOrTouchEvent('up', evt);
    }

    function handleMouseOrTouchDown(evt) {
        handleMouseOrTouchEvent('down', evt);
    }

    function handleMouseOrTouchMove(evt) {
        handleMouseOrTouchEvent('move', evt);
    }

    function mouseOrTouchEvent(type, handler) {
        if (!Event.mouseOrTouchHandlers[type]) {
            Event.mouseOrTouchHandlers[type] = [];
        }
        Event.mouseOrTouchHandlers[type].push(handler);
    }


    window.Event = {
        on: on,
        onKeyDown: onKeyDown, // special version of on to listen for specific keys
        off: off,
        once: once,
        trigger: trigger,
        triggerAsync: triggerAsync,
        forward: forward,
        cloneEvent: cloneEvent,
        isTouch: isTouch,
        // Variables for use by programs
        pointerDown: false,
        pointerX: 0,
        pointerY: 0,
        stagePointerX: 0,
        stagePointerY: 0,
        keys: {},
        keyHandlers: {},
        clearKeysOnFocusChange: clearKeysOnFocusChange,
        clearRuntime: clearRuntime,
        initDrag: initDrag,
        dragging: dragging,
        endDrag: endDrag,
        cancelDrag: cancelDrag,
        trackPointerPosition: trackPointerPosition,
        trackPointerDown: trackPointerDown,
        trackPointerUp: trackPointerUp,
        handleKeyUp: handleKeyUp,
        handleKeyDown: handleKeyDown,
        registerElementsForAddRemoveEvents: registerElementsForAddRemoveEvents,
        keyForEvent: keyForEvent,
        mouseOrTouchHandlers: {},
        handleMouseOrTouchUp: handleMouseOrTouchUp,
        mouseOrTouchEvent: mouseOrTouchEvent,
        handleMouseOrTouchDown: handleMouseOrTouchDown,
        handleMouseOrTouchMove: handleMouseOrTouchMove
    };

})();
