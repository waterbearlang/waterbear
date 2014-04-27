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

    function on(elem, eventname, selector, handler, onceOnly){
        if (typeof elem === 'string'){
            return wb.makeArray(document.querySelectorAll(elem)).map(function(e){
                return on(e, eventname, selector, handler);
            });
        }
        if (!isDomObject(elem)){ 
            console.error('first argument must be element, document, or window: %o', elem);
            throw new Error('first argument must be element');
        }
        if (typeof eventname !== 'string'){ console.error('second argument must be eventname'); }
        if (selector && typeof selector !== 'string'){ console.log('third argument must be selector or null'); }
        if (typeof handler !== 'function'){ console.log('fourth argument must be handler'); }
        var listener;
        if (selector){
            listener = function listener(event){
                blend(event); // normalize between touch and mouse events
                // if (eventname === 'mousedown'){
                //     console.log(event);
                // }
                if (!event.wbValid){
                    // console.log('event is not valid');
                    return;
                }
                if (onceOnly){
                    Event.off(elem, eventname, listener);
                }
                if (wb.matches(event.wbTarget, selector)){
                    handler(event);
                }else if (wb.matches(event.wbTarget, selector + ' *')){
                    event.wbTarget = wb.closest(event.wbTarget, selector);
                    handler(event);
                }
            };
        }else{
            listener = function listener(event){
                blend(event);
                if (!event.wbValid){
                    return;
                }
                if (onceOnly){
                    Event.off(elem, eventname, listener);
                }
                handler(event);
            };
        }
        elem.addEventListener(eventname, listener, false);
        return listener;
    };

    function off(elem, eventname, handler){
        elem.removeEventListener(eventname, handler);
    }

    var once = function(elem, eventname, selector, handler){
        return Event.on(elem, eventname, selector, handler, true);
    }

    function trigger(elemOrSelector, eventname, data){
        var elem;
        if (elemOrSelector.nodeName){
            elem = elemOrSelector;
        }else{
            elem = document.querySelector(elem);
        }
        var evt = new CustomEvent(eventname, {bubbles: true, cancelable: true, detail: data});
        //console.log('dispatching %s for %o', eventname, elem);
        elem.dispatchEvent(evt);
    };

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
    };
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
    };

    function isPointerEvent(event){
        return isTouchEvent(event) || isMouseEvent(event);
    };

    // Treat mouse events and single-finger touch events similarly
    function blend(event){
        if (isPointerEvent(event)){
            if (isTouchEvent(event)){
                var touch = null;
                if (event.touches.length === 1){
                    touch = event.touches[0];
                }else if (event.changedTouches.length === 1){
                    touch = event.changedTouches[0];
                }else{
                    return event;
                }
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


    runtime.Event = {
        on: on,
        off: off,
        once: once,
        trigger: trigger,
        isTouch: isTouch
    };
})(this);
