// Bare-bones Event library
// Adds support for event delegation on top of normal DOM events (like jQuery "live" events)
// Minimal support for non-DOM (custom) events
// Normalized between mouse and touch events
// Waterbear specific: events have wb-target which is always a block element
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(runtime){
    "use strict";

    function isDomObject(e){
        if (e === window) return true;
        if (e === document) return true;
        if (e.tagName) return true;
        return false;
    }

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
        if (typeof elem === 'string'){
            return wb.makeArray(document.querySelectorAll(elem)).map(function(e){
                return on(e, eventname, selector, handler);
            });
        }
        if (!isDomObject(elem)){
            console.error('first argument must be element, document, or window: %o', elem);
            throw new Error('first argument must be element, document, or window');
        }
        if (typeof eventname !== 'string'){ console.error('second argument must be eventname'); }
        if (selector && typeof selector !== 'string'){ console.log('third argument must be selector or null'); }
        if (typeof handler !== 'function'){ console.log('fourth argument must be handler'); }
        var listener = function listener(originalEvent){
            var event;
            // console.log('event %s', originalEvent.type);
            if (originalEvent.detail && originalEvent.detail.forwarded){
                event = blend(originalEvent.detail.forwarded);
                event.type = originalEvent.type;
            }else{
                event = blend(originalEvent); // normalize between touch and mouse events
            }
            if (event.invalid){
                // console.log('event is not valid');
                return;
            }
            if (onceOnly){
                Event.off(elem, eventname, listener);
            }
            if (selector){
                if (wb.matches(event.target, selector)){
                    handler(event);
                }else if (wb.matches(event.target, selector + ' *')){
                    // Fix for missing events that are contained in child elements
                    // Bubble up to the nearest matching parent
                    event.target = wb.closest(event.target, selector);
                    handler(event);
                }
            }else{
                handler(event);
            }
        };
        elem.addEventListener(eventname, listener, false);
        return listener;
    }

    function off(elem, eventname, handler){
        elem.removeEventListener(eventname, handler);
    }

    function once(elem, eventname, selector, handler){
        return Event.on(elem, eventname, selector, handler, true);
    }

    function trigger(elemOrSelector, eventname, data){
        var elem = elemOrSelector;
        if (typeof elemOrSelector === 'string'){
            elem = document.querySelector(elem);
        }
        var evt = new CustomEvent(eventname, {bubbles: true, cancelable: true, detail: data});
        //console.log('dispatching %s for %o', eventname, elem);
        elem.dispatchEvent(evt);
    }

    function forward(elem, eventName, evt){
        if (evt.original){
            evt = evt.original;
        }
        trigger(elem, eventName, {forwarded: evt});
    }

    // Are touch events supported?
    var isTouch = ('ontouchstart' in runtime);
    function isMouseEvent(event){
        switch(event.type){
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
            case 'click':
                return true;
            default:
                return false;
        }
    }

    function isTouchEvent(event){
        switch(event.type){
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
        var event = cloneEvent(originalEvent);
        if (isPointerEvent(event)){
            if (isTouchEvent(event)){
                var touch = null;
                if (event.touches.length === 1){
                    touch = event.touches[0];
                }else if (event.changedTouches.length === 1){
                    touch = event.changedTouches[0];
                }else{
                    event.invalid = true;
                    return event;
                }
                event.target = touch.target;
                event.pageX = touch.pageX;
                event.pageY = touch.pageY;
            }else{
                // is this necessary or desirable?
                if (event.which !== 1){ // left mouse button
                    event.invalid = true;
                    return event;
                }
            }
        }
        return event;
    }


    runtime.Event = {
        on: on,
        off: off,
        once: once,
        trigger: trigger,
        forward: forward,
        cloneEvent: cloneEvent,
        isTouch: isTouch
    };
})(this);
