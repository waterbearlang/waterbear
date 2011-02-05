/*! 
 * jquery.event.drag - v 2.0.0 
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
// Created: 2008-06-04 
// Updated: 2010-06-07
// REQUIRES: jquery 1.4.2+

;(function( $ ){

function debug(str){
    if (false){
        console.log(str);
    }
}

// add the jquery instance method
$.fn.drag = function( str, arg, opts ){
	// figure out the event type
	var type = typeof str == "string" ? str : "",
	// figure out the event handler...
	fn = $.isFunction( str ) ? str : $.isFunction( arg ) ? arg : null;
	// fix the event type
	if ( type.indexOf("drag") !== 0 ) 
		type = "drag"+ type;
	// were options passed
	opts = ( str == fn ? arg : opts ) || {};
	// trigger or bind event handler
	return fn ? this.bind( type, opts, fn ) : this.trigger( type );
};
var startevent, endevent, moveevent, istouch;
if (Modernizr && Modernizr.touch){
    startevent = 'touchstart';
    endevent = 'touchend';
    moveevent = 'touchmove';
    istouch = true;
}else{
    startevent = 'mousedown';
    endevent = 'mouseup';
    moveevent = 'mousemove';
    istouch = false;
}

function prop(event, propname, newprop){
    if (typeof newprop === 'undefined'){
        if (istouch){
            if (propname == 'currentTarget') propname = 'target';
            if (propname == 'which') return 1;
            try{
                return event.originalEvent.touches[0][propname];
            }catch(e){
                console.log('Error accessing ' + propname + ' in ' + prop.caller);
                throw e;
            }
        }else{
            return event[propname];
        }
    }else{
        if (istouch){
            event.originalEvent.touches[0][propname] = newprop;
        }else{
            event[propname] = newprop;
        }
    }
}
// local refs (increase compression)
var $event = $.event, 
$special = $event.special,
// configure the drag special event 
drag = $special.drag = {
	
	// these are the default settings
	defaults: {
		which: 1, // mouse button pressed to start drag sequence
		distance: 0, // distance dragged before dragstart
		not: ':input', // selector to suppress dragging on target elements
		handle: null, // selector to match handle target elements
		relative: false, // true to use "position", false to use "offset"
		drop: true, // false to suppress drop events, true or selector to allow
		click: false // false to suppress click events after dragend (no proxy)
	},
	
	// the key name for stored drag data
	datakey: "dragdata",
	
	// the namespace for internal live events
	livekey: "livedrag",
	
	// count bound related events
	add: function( obj ){ 
		// read the interaction data
		var data = $.data( this, drag.datakey ),
		// read any passed options 
		opts = obj.data || {};
		// count another related event
		data.related += 1;
		// bind the live "draginit" delegator
		if ( !data.live && obj.selector ){
			data.live = true;
			$event.add( this, "draginit."+ drag.livekey, drag.delegate );
		}
		// extend data options bound with this event
		// don't iterate "opts" in case it is a node 
		$.each( drag.defaults, function( key, def ){
			if ( opts[ key ] !== undefined )
				data[ key ] = opts[ key ];
		});
	},
	
	// forget unbound related events
	remove: function(){
		$.data( this, drag.datakey ).related -= 1;
	},
	
	// configure interaction, capture settings
	setup: function(){
		// check for related events
		if ( $.data( this, drag.datakey ) ) 
			return;
		// initialize the drag data with copied defaults
		var data = $.extend({ related:0 }, drag.defaults );
		// store the interaction data
		$.data( this, drag.datakey, data );
		// bind the mousedown event, which starts drag interactions
		$event.add( this, startevent, drag.init, data );
		// prevent image dragging in IE...
		if ( this.attachEvent ) 
			this.attachEvent("ondragstart", drag.dontstart ); 
	},
	
	// destroy configured interaction
	teardown: function(){
		// check for related events
		if ( $.data( this, drag.datakey ).related ) 
			return;
		// remove the stored data
		$.removeData( this, drag.datakey );
		// remove the mousedown event
		$event.remove( this, startevent, drag.init );
		// remove the "live" delegation
		$event.remove( this, "draginit", drag.delegate );
		// enable text selection
		drag.textselect( true ); 
		// un-prevent image dragging in IE...
		if ( this.detachEvent ) 
			this.detachEvent("ondragstart", drag.dontstart ); 
	},
		
	// initialize the interaction
	init: function( event ){
		// the drag/drop interaction data
		if (event.originalEvent.touches && event.originalEvent.touches.length > 1) return; // only handle one finger
		var dd = event.data, results, target = $(prop(event, 'target'));
		// check the which directive, if mouse event
		if ( dd.which > 0 && prop(event, 'which') != dd.which ) {
	        debug('which does not match');
			return;
		} 
		// check for suppressed selector
		if ( target.is( dd.not ) ) {
		    debug('event is suppressed');
			return;
	    }
		// check for handle selector
		if ( dd.handle && !target.closest( dd.handle, target ).length ){
		    debug('handle not found');
			return;
		}
		// store/reset some initial attributes
		dd.propagates = 1;
		dd.interactions = [ drag.interaction( this, dd ) ];
		dd.target = prop(event, 'target');
		dd.pageX = prop(event, 'pageX');
		dd.pageY = prop(event, 'pageY');
		dd.dragging = null;
		// handle draginit event... 
		results = drag.hijack( event, "draginit", dd );
		debug('returned from hijack draginit');
		// early cancel
		if ( !dd.propagates ){
		    debug(8);
			return;
		}
		// flatten the result set
		results = drag.flatten( results );
		// insert new interaction elements
		if ( results && results.length ){
			dd.interactions = [];
			$.each( results, function(){
				dd.interactions.push( drag.interaction( this, dd ) );
			});
		}
		// remember how many interactions are propagating
		dd.propagates = dd.interactions.length;
		// locate and init the drop targets
		if ( dd.drop !== false && $special.drop ) 
			$special.drop.handler( event, dd );
		// disable text selection
		drag.textselect( false ); 
		// bind additional events...
		$event.add( document, moveevent + ' ' + endevent, drag.handler, dd );
		// helps prevent text selection
		return false;
	},	
	// returns an interaction object
	interaction: function( elem, dd ){
		return {
			drag: elem, 
			callback: new drag.callback(), 
			droppable: [],
			offset: $( elem )[ dd.relative ? "position" : "offset" ]() || { top:0, left:0 }
		};
	},
	// handle drag-related DOM events
	handler: function( event ){ 
		// read the data before hijacking anything
		debug('starting handler');
		var dd = event.data;
		// handle various events
		switch ( event.type ){
			// mousemove, check distance, start dragging
			case !dd.dragging && moveevent: 
			    debug('starting mousemove, not dragging yet');
				//  drag tolerance, x² + y² = distance²
				debug('pageX: ' + prop(event, 'pageX') + ', pageY:' + prop(event, 'pageY') + ', memoized: (' + dd.pageX + ',' + dd.pageY + '), distance: ' + dd.distance);
				debug((Math.pow(prop(event, 'pageX')-dd.pageX, 2) + Math.pow(prop(event, 'pageY') - dd.pageY,2))  + ' < ' + Math.pow(dd.distance, 2));
				if ( Math.pow(  prop(event, 'pageX')-dd.pageX, 2 ) + Math.pow(  prop(event, 'pageY')-dd.pageY, 2 ) < Math.pow( dd.distance, 2 ) ){
				    debug('distance tolerance not reached');
					break; // distance tolerance not reached
			    }
				debug('setting target to ' + dd.target);
				prop(event, 'target', dd.target); // force target from "mousedown" event (fix distance issue)
				drag.hijack( event, "dragstart", dd ); // trigger "dragstart"
				debug('returned from hijack dragstart');
				if ( dd.propagates ){ // "dragstart" not rejected
				    debug('start dragging');
					dd.dragging = true; // activate interaction
				}
			// mousemove, dragging
			case moveevent: 
				if ( dd.dragging ){
				    debug('starting mousemove while dragging');
					// trigger "drag"		
					drag.hijack( event, "drag", dd );
					debug('returned from hijack drag');
					if ( dd.propagates ){
						// manage drop events
						if ( dd.drop !== false && $special.drop )
							$special.drop.handler( event, dd ); // "dropstart", "dropend"
						break; // "drag" not rejected, stop		
					}
					event.type = endevent; // helps "drop" handler behave
				}else{
				    debug('should not be able to reach this code');
			    }
                if (istouch) return false; // needed to prevent dragging document
			// mouseup, stop dragging
			case endevent:
			    debug('starting end move cleanup');
				$event.remove( document, moveevent + ' ' + endevent, drag.handler ); // remove page events
				if ( dd.dragging ){
					if ( dd.drop !== false && $special.drop ) 
						$special.drop.handler( event, dd ); // "drop"
					drag.hijack( event, "dragend", dd ); // trigger "dragend"	
					debug('returned from hijack dragend');
					}
				drag.textselect( true ); // enable text selection
				
				// if suppressing click events...
				if ( dd.click === false && dd.dragging ){
					jQuery.event.triggered = true;
					setTimeout(function(){
						jQuery.event.triggered = false;
					}, 20 );
				dd.dragging = false; // deactivate element	
				}
				break;
		}
	},
	
	// identify potential delegate elements
	delegate: function( event ){
	    debug('starting delegate');
		// local refs
		if (event.originalEvent.touches && event.originalEvent.touches.length > 1) return; // only handle one finger
		var elems = [], target, 
		// element event structure
		events = $.data( this, "events" ) || {};
		// query live events
		$.each( events.live || [], function( i, obj ){
			// no event type matches
			if ( obj.preType.indexOf("drag") !== 0 )
				return;
			// locate the element to delegate
			target = $(prop(event, 'target')).closest( obj.selector, prop(event, 'currentTarget'))[0];
			// no element found
			if ( !target ){
			    debug('no element found');
				return;
			}
			// add an event handler
			$event.add( target, obj.origType+'.'+drag.livekey, obj.origHandler, obj.data );
			// remember new elements
			if ( $.inArray( target, elems ) < 0 )
				elems.push( target );		
		});
		// if there are no elements, break
		if ( !elems.length ) {
		    debug('no elements');
			return false;
		}
		// return the matched results, and clean up when complete		
		return $( elems ).bind("dragend."+ drag.livekey, function(){
			$event.remove( this, "."+ drag.livekey ); // cleanup delegation
		});
		if (istouch){
		    return false; // prevent dragging the desktop
	    }
	},
	
	// re-use event object for custom events
	hijack: function( event, type, dd, x, elem ){
	    debug('starting hijack');
		// not configured
		if ( !dd ){
		    debug('not configured');
			return;
		}
		// remember the original event and type
		var orig = { event:event.originalEvent, type: event.type },
		// is the event drag related or drog related?
		mode = type.indexOf("drop") ? "drag" : "drop",
		// iteration vars
		result, i = x || 0, ia, $elems, callback,
		len = !isNaN( x ) ? x : dd.interactions.length;
		// modify the event type
		event.type = type;
		// remove the original event
		event.originalEvent = null;
		// initialize the results
		dd.results = [];
		// handle each interacted element
		do if ( ia = dd.interactions[ i ] ){
			// validate the interaction
			if ( type !== "dragend" && ia.cancelled )
				continue;
			// set the dragdrop properties on the event object
			callback = drag.properties( event, dd, ia, orig );
			// prepare for more results
			ia.results = [];
			// handle each element
			$( elem || ia[ mode ] || dd.droppable ).each(function( p, subject ){
				// identify drag or drop targets individually
				callback.target = subject;
				// handle the event	
				debug('calling the real handler');
				result = subject ? $event.handle.call( subject, event, callback ) : null;
				debug('back from the handler with result = ' + result);
				// stop the drag interaction for this element
				if ( result === false ){
					if ( mode == "drag" ){
						ia.cancelled = true;
						dd.propagates -= 1;
					}
					if ( type == "drop" ){
						ia[ mode ][p] = null;
					}
				}
				// assign any dropinit elements
				else if ( type == "dropinit" )
					ia.droppable.push( drag.element( result ) || subject );
				// accept a returned proxy element 
				if ( type == "dragstart" )
					ia.proxy = $( drag.element( result ) || ia.drag )[0];
				// remember this result	
				ia.results.push( result );
				// forget the event result, for recycling
				delete event.result;
				// break on cancelled handler
				if ( type !== "dropinit" ){
				    debug('break on cancelled handler');
					return result;
				}
			});	
			// flatten the results	
			dd.results[ i ] = drag.flatten( ia.results );	
			// accept a set of valid drop targets
			if ( type == "dropinit" )
				ia.droppable = drag.flatten( ia.droppable );
			// locate drop targets
			if ( type == "dragstart" && !ia.cancelled )
				callback.update(); 
		}
		while ( ++i < len )
		// restore the original event & type
		event.type = orig.type;
		event.originalEvent = orig.event;
		// return all handler results
		return drag.flatten( dd.results );
	},
		
	// extend the callback object with drag/drop properties...
	properties: function( event, dd, ia, orig ){		
		var obj = ia.callback;
		var touch = event.touches ? event.touches[0] : null;
		// elements
		obj.drag = ia.drag;
		obj.proxy = ia.proxy || ia.drag;
		// starting mouse position
		obj.startX = dd.pageX;
		obj.startY = dd.pageY;
		// current distance dragged
		var evt = istouch ? {originalEvent: orig.event} : event;
		obj.deltaX = prop(evt, 'pageX') - dd.pageX;
		obj.deltaY = prop(evt, 'pageY') - dd.pageY;
		// original element position
		obj.originalX = ia.offset.left;
		obj.originalY = ia.offset.top;
		// adjusted element position
		obj.offsetX = prop(evt, 'pageX') - ( dd.pageX - obj.originalX );
		obj.offsetY = prop(evt, 'pageY') - ( dd.pageY - obj.originalY );
		// assign the drop targets information
		obj.drop = drag.flatten( ( ia.drop || [] ).slice() );
		obj.available = drag.flatten( ( ia.droppable || [] ).slice() );
		return obj;	
	},
	
	// determine is the argument is an element or jquery instance
	element: function( arg ){
		if ( arg && ( arg.jquery || arg.nodeType == 1 ) )
			return arg;
	},
	
	// flatten nested jquery objects and arrays into a single dimension array
	flatten: function( arr ){
		return $.map( arr, function( member ){
			return member && member.jquery ? $.makeArray( member ) : 
				member && member.length ? drag.flatten( member ) : member;
		});
	},
	
	// toggles text selection attributes ON (true) or OFF (false)
	textselect: function( bool ){ 
		$( document )[ bool ? "unbind" : "bind" ]("selectstart", drag.dontstart )
			.attr("unselectable", bool ? "off" : "on" )
			.css("MozUserSelect", bool ? "" : "none" );
	},
	
	// suppress "selectstart" and "ondragstart" events
	dontstart: function(){ 
		return false; 
	},
	
	// a callback instance contructor
	callback: function(){}
	
};

// callback methods
drag.callback.prototype = {
	update: function(){
		if ( $special.drop && this.available.length )
			$.each( this.available, function( i ){
				$special.drop.locate( this, i );
			});
	}
};

// share the same special event configuration with related events...
$special.draginit = $special.dragstart = $special.dragend = drag;

})( jQuery );