// Add support for event delegation on top of normal DOM events
// Minimal support for non-DOM events
// Normalized between mouse and touch events

(function(global){
    "use strict";

    var on = function(elem, eventname, selector, handler){
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
                if (!event.wbValid) return;
                if (wb.matches(event.wbTarget, selector + ' *')){
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

    var trigger = function(elem, eventname, data){
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
