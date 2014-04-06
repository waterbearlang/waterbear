
/*begin events.min.js*/
/*
|------------------------------------------------
| Events.js
|------------------------------------------------
|
| A super-awesome JavaScript event handler library.
|
| @author     James Brumond
| @version    0.2.3-beta
| @copyright  Copyright 2011 James Brumond
| @license    Dual licensed under MIT and GPL
|
*/
var Events=new function(){var a=this,b=[],c="0.2.3-beta",d=function(){var a=document.readyState==="complete";if(!a){function b(){a=!0}window.addEventListener?window.addEventListener("load",b,!1):window.attachEvent&&window.attachEvent("onload",b)}return function(){return a}}(),e={mouseenter:{attachesTo:"mouseover",eventTest:function(a){return!withinElement(a,a.originalTarget(),"fromElement")}},mouseleave:{attachesTo:"mouseout",eventTest:function(a){return!withinElement(a,a.originalTarget(),"toElement")}},hashchange:{bind:function(a,b){f.addEventListener(b)},unbind:function(a,b){f.removeEventListener(b)},invoke:function(a){f.dispatchEvent()}},keystroke:{attachesTo:"keydown",eventTest:function(a){return g.runTest(a,a.getNamespace().split(".")[0])}}},f=new function(){var b=this,c=25,d=[],e=function(){var a=(location+"").match(/^[^#]*(#.+)$/);return a?a[1]:""},f=function(a){a[0]!=="#"&&(a="#"+a),location.hash=a},g=function(){var a=!1;return function(b){typeof b=="boolean"&&(a=b);return a}}(),h=function(b,c){return a.buildEventObject("hashchange",{},merge({oldURL:b,newURL:location+""},c||{}))},i=function(a){var b;for(var c=0,e=d.length;c<e;c++)b=d[c].call(window,a);a.returnValue!=null&&(b=a.returnValue);return b},j=function(){var a=e(),d=location+"",f=!1,h=null;return{start:function(){f||(f=!0,h=window.setInterval(function(){var c=e();c!==a&&(a=c,g()||b.dispatchEvent(d),d=location+"")},c))},stop:function(){f&&(f=!1,window.clearInterval(h))}}}(),k=function(a){var a=a||window.event,b=a._isEmulated||!1;!g()&&!b&&(g(!0),j.stop());return i(a)};b.init=function(){attachListener(window,"hashchange",k),g()||j.start()},b.addEventListener=function(a){d.push(a)},b.removeEventListener=function(a){var b=[];for(var c=0,e=d.length;c<e;c++)d[c]!==a&&b.push(d[c]);d=b},b.dispatchEvent=function(a){return i(h(location+"",a))}},g=function(){var a={type:"keydown",propagate:!1,disable_in_input:!0,target:document,keycode:!1},b={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":":","'":'"',",":"<",".":">","/":"?","\\":"|"},c={esc:27,escape:27,tab:9,space:32,"return":13,enter:13,backspace:8,scrolllock:145,scroll_lock:145,scroll:145,capslock:20,caps_lock:20,caps:20,numlock:144,num_lock:144,num:144,pause:19,"break":19,insert:45,home:36,"delete":46,end:35,pageup:33,page_up:33,pu:33,pagedown:34,page_down:34,pd:34,left:37,up:38,right:39,down:40,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123},d=function(){return{shift:{wanted:!1,pressed:!1},ctrl:{wanted:!1,pressed:!1},alt:{wanted:!1,pressed:!1},meta:{wanted:!1,pressed:!1}}},e=function(a,e,f){var g,h,i,j,k,l;if(f.disable_in_input){i=a.currentTarget;if(i&&i.tagName&&(i.tagName.toLowerCase()==="input"||i.tagName.toLowerCase()==="textarea")&&i!==f.target)return}a.keyCode?k=a.keyCode:a.which&&(k=a.which),j=String.fromCharCode(k).toLowerCase(),k===188&&(j=","),k===190&&(j="."),g=e.split("+"),h=0,l=d(),a.ctrlKey&&(l.ctrl.pressed=!0),a.shiftKey&&(l.shift.pressed=!0),a.altKey&&(l.alt.pressed=!0),a.metaKey&&(l.meta.pressed=!0);for(var m=0;m<g.length;m++){var n=g[m];n==="ctrl"||n==="control"?(h++,l.ctrl.wanted=!0):n==="shift"?(h++,l.shift.wanted=!0):n==="alt"?(h++,l.alt.wanted=!0):n==="meta"?(h++,l.meta.wanted=!0):n.length>1?c[n]===k&&h++:f.keycode?f.keycode===k&&h++:j===n?h++:b[j]&&a.shiftKey&&(j=b[j],j===n&&h++)}return h===g.length&&l.ctrl.pressed===l.ctrl.wanted&&l.shift.pressed===l.shift.wanted&&l.alt.pressed===l.alt.wanted&&l.meta.pressed===l.meta.wanted};return{runTest:function(b,c,d){var d=d||{};for(var f in a)a.hasOwnProperty(f)&&d[f]===undefined&&(d[f]=a[f]);return e(b,c.toLowerCase(),d)},defaults:a}}(),h=function(){var a=function(a){if(typeof this=="undefined"||typeof a=="undefined"||typeof this[a]=="undefined")return!1;return this[a]!==this.constructor.prototype[a]};return function(b){try{b.prototype.hasOwnProperty=a;if(typeof b.hasOwnProperty!="function")throw 0}catch(c){b.hasOwnProperty=a}}}();EventController=function(a,b){var c=this,d=!1,a=a,b=b,e=null;typeof a.hasOwnProperty!="function"&&h(a),c.target=c.srcElement=b;for(var f in a)a.hasOwnProperty(f)&&typeof a[f]!="function"&&(c[f]=a[f]);c.getNamespace=function(){return e},c._setNamespace=function(a){e=a},c.mousePosition=function(){var b=0,c=0;if(a.pageX||a.pageY)b=a.pageX,c=a.pageY;else if(a.clientX||a.clientY)b=a.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,c=a.clientY+document.body.scrollTop+document.documentElement.scrollTop;return{x:b,y:c}},c.eventObject=function(){return a},c.originalTarget=function(){return b},c.stopPropagation=function(){typeof a.stopPropagation=="function"&&a.stopPropagation(),a.cancelBubble=!0},c.cancelDefault=function(){d||(d=!0,typeof a.preventDefault=="function"&&a.preventDefault(),a.returnValue=!1)},c.isDefaultCanceled=function(){return d}},EventFunction=function(a,b){var c=this,b=b;a=a||undefined;if(typeof a!="function")return undefined;c.call=function(b,c){return a.call(b,c)}},EventWrapper=function(a,b){var c=this,a=a||null,b=b||null,d={},f=!1,g=!1,h=function(a){var b=d;for(var c=0,e=a.length;c<e;c++){var f=a[c];typeof b[f]!="object"&&(b[f]={}),b=b[f]}typeof b["."]!="object"&&(b["."]=[]);return b};c.registerFunction=function(a,b){var d=h(b);d["."].push(new EventFunction(a,c))},c.removeNamespace=function(a){if(a&&a.length){var b=a.pop(),c=h(a);c[b]={}}else d={}},c.run=function(c,f){var f=f||new EventController(c,a),g=[],h=b in e&&e[b].eventTest?e[b].eventTest:function(){return!0},i=function(b){var c=null;for(var d in b)if(b.hasOwnProperty(d)){f._setNamespace(g.join("."));if(d==="."){if(h(f))for(var e=0,j=b[d].length;e<j;e++)c=b[d][e].call(a,f),c===!1&&f.cancelDefault()}else g.push(d),c=i(b[d]),g.pop()}return c},j=i(d);return f.isDefaultCanceled()?!1:j};if(b in e){var i=e[b],j=!!i.bind&&!!i.unbind,k=function(a){return c.run(a||window.event)};c.bindEvent=function(){g||(g=!0,j?i.bind(a,k):attachListener(a,i.attachesTo,k))},c.unbindEvent=function(){g&&(g=!1,j?i.unbind(a,k):detachListener(a,i.attachesTo,k))}}else{var k=function(a){return c.run(a||window.event)};c.bindEvent=function(){g||(g=!0,attachListener(a,b,k))},c.unbindEvent=function(){g&&(g=!1,detachListener(a,b,k))}}c.bindEvent()},EventHandler=function(a){var c=this,a=a||null,d={};b.push(c),c.getTarget=function(){return a},c.registerEvent=function(b,c){if(typeof b!="string"||typeof c!="function")return!1;var e=b.split("."),f;b=e.shift(),f=e,startsWithOn.test(b)&&(b=b.substring(2)),d[b]===undefined&&(d[b]=new EventWrapper(a,b)),d[b].registerFunction(c,f)},c.removeEvent=function(a){var a=a||!1,b;if(typeof a!="string")return!1;if(a==="*"){for(var c in d)d.hasOwnProperty(c)&&d[c].removeNamespace(!1);return!0}b=a.split("."),a=b.shift(),d[a].removeNamespace(b)}},startsWithOn=/^on/,startsWithDOM=/^DOM/,attachListener=function(a,b,c){if(a.addEventListener)startsWithOn.test(b)&&(b=b.substring(2)),a.addEventListener(b,c,!1);else if(a.attachEvent)!startsWithDOM.test(b)&&!startsWithOn.test(b)&&(b="on"+b),a.attachEvent(b,c);else throw new YourBrowserFailsError("Could not attach event listener")},detachListener=function(a,b,c){if(a.removeEventListener)startsWithOn.test(b)&&(b=b.substring(2)),a.removeEventListener(b,c,!1);else if(a.detachEvent)!startsWithDOM.test(b)&&!startsWithOn.test(b)&&(b="on"+b),a.detachEvent(b,c);else throw new YourBrowserFailsError("Could not detach event listener")},invokeListener=function(b,c,d){var e;if(b.dispatchEvent)startsWithOn.test(c)&&(c=c.substring(2)),e=a.buildEventObject(b,c,d),b.dispatchEvent(e);else if(b.fireEvent)!startsWithDOM.test(c)&&!startsWithOn.test(c)&&(c="on"+c),e=a.buildEventObject(b,c,d),b.fireEvent(c,e);else throw new YourBrowserFailsError("Could not invoke event listener")},getEventTarget=function(a,b){var c=!1;a.target?c=a.target:a.srcElement&&(c=a.srcElement),!c&&a.srcElement===null&&(c=b||window),c.nodeType==3&&(c=c.parentNode);return c},withinElement=function(a,b,c){var d=a.relatedTarget,e;d==null&&(d=a[c]||null);try{while(d&&d!==b)d=d.parentNode;e=d===b}catch(f){e=!1}return e},getHandlerByTarget=function(a){for(var c=0;c<b.length;c++)if(b[c].getTarget()===a)return b[c];return!1},getEventHandler=function(a){var b=getHandlerByTarget(a);return b?b:new EventHandler(a)},merge=function(){var a=Array.prototype.slice.call(arguments,0),b={};for(var c=0,d=a.length;c<d;c++)for(var e in a[c])a[c].hasOwnProperty(e)&&(b[e]=a[c][e]);return b},contains=function(a,b){for(var c=0,d=b.length;c<d;c++)if(b[c]===a)return!0;return!1},a.version=function(){return c},a.ready=function(){var a=[],b=!1;return function(c){d()?c():(a.push(c),b||Events.bind(window,"load",function(){for(var b=0,c=a.length;b<c;b++)a[b]()}))}}(),a.log=function(){var a=null,b=function(){a==null&&(typeof window.console!="undefined"?typeof window.console.log.apply=="function"?a=function(){window.console.log.apply(window.console,arguments)}:a=function(){window.console.log(arguments)}:typeof console!="undefined"?a=function(){console.log.apply(console,arguments)}:a=function(){});return a};return function(){var a=Array.prototype.slice.call(arguments,0);typeof a[0]=="string"&&(a[0]="["+Date()+"] - "+a[0]),b().apply(this,a)}}(),a.bind=function(a,b,c){var d=getEventHandler(a);return d.registerEvent(b,c)},a.unbind=function(a,b){var c=getEventHandler(a);return c.removeEvent(b)},a.specialEvents={exists:function(a){return e[a]!=null},add:function(a,b){e[a]==null&&(e[a]=b)},edit:function(a,b){if(e[a]!=null)for(var c in b)b.hasOwnProperty(c)&&(e[a][c]=b[c])},del:function(a){e[a]!=null&&(e[a]=null)}},a.invoke=function(a,b,c){return invokeListener(a,b,c)},a.buildEventObject=function(){var a={HTMLEvents:["abort","blur","change","error","focus","load","reset","resize","scroll","select","submit","unload","hashchange"],UIEvents:["DOMActivate","DOMFocusIn","DOMFocusOut"],KeyEvents:["keydown","keypress","keyup"],MouseEvents:["click","mousedown","mousemove","mouseout","mouseover","mouseup"],MutationEvents:["DOMAttrModified","DOMNodeInserted","DOMNodeRemoved","DOMCharacterDataModified","DOMNodeInsertedIntoDocument","DOMNodeRemovedFromDocument","DOMSubtreeModified"]},b=function(b){var c="Events";for(var d in a)if(a.hasOwnProperty(d)&&contains(b,a[d])){d==="KeyEvents"&&!window.KeyEvent&&(d="UIEvents");if(document.implementation.hasFeature(d,"2.0")||window[d.substring(0,d.length-1)])d="Events";c=d;break}return c},c={useDefaults:!1,bubbles:!0,cancelable:!1},d={winObj:window,detail:1},e={winObj:window,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:0,charCode:0},f={winObj:window,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,button:0,relatedTarget:null},g={relatedNode:null,prevValue:null,newValue:null,attrName:null,attrChange:null};return document.createEvent?function(a,h,i){var j=b(event),k=document.createEvent(j),l=h,h=h||{};if(typeof l!="object"||h.useDefaults)j="Events";switch(j){case"Events":case"HTMLEvents":h=merge(c,h),k.initEvent(a,h.bubbles,h.cancelable);break;case"UIEvents":h=merge(c,d,h),k.initUIEvent(a,h.bubbles,h.cancelable,h.winObj,h.detail);break;case"KeyEvents":h=merge(c,e,h),k.initKeyEvent(a,h.bubbles,h.cancelable,h.winObj,h.ctrlKey,h.altKey,h.shiftKey,h.metaKey,h.keyCode,h.charCode);break;case"MouseEvents":h=merge(c,f,h),k.initMouseEvent(a,h.bubbles,h.cancelable,h.winObj,h.screenX,h.screenY,h.clientX,h.clientY,h.ctrlKey,h.altKey,h.shiftKey,h.metaKey,h.button,h.relatedTarget);break;case"MutationEvents":h=merge(c,g,h),k.initMutationEvent(a,h.bubbles,h.cancelable,h.relatedNode,h.prevValue,h.newValue,h.attrName,h.attrChange)}for(var m in i)i.hasOwnProperty(m)&&(k[m]=i[m]);return k}:document.createEventObject?function(a,b,d){var e=document.createEventObject(),b=merge(c,b||{},d);for(var f in b)b.hasOwnProperty(f)&&(e[f]=b[f]);return e}:function(a,b,d){return merge({type:a,timeStamp:(new Date).getTime(),target:target,srcElement:target,currentTarget:target,defaultPrevented:!1},c,b||{},d||{},{bubbles:!1})}}(),f.init()};typeof window.YourBrowserFailsError=="undefined"&&(window.YourBrowserFailsError=function(a){if(!this instanceof YourBrowserFailsError)return new YourBrowserFailsError(a);var b=function(){var a;try{(0)()}catch(b){a=b}return a}();this.name="YourBrowserFailsError",this.message=a,this.stack=b.stack||b.stacktrace||"Could not get a stack. MORE FAILS!!"});
/*end events.min.js*/


/* list of files used for localization of blocks */
var l10nFiles = {};


/*begin ajax.js*/
(function (global) {
    'use strict';
    function $(e) {
        if (typeof e == 'string') e = document.getElementById(e);
        return e
    };

    function collect(a, f) {
        var n = [];
        for (var i = 0; i < a.length; i++) {
            var v = f(a[i]);
            if (v != null) n.push(v)
        }
        return n
    };

    var ajax = {};
    ajax.x = function () {
        try {
            return new ActiveXObject('Msxml2.XMLHTTP')
        } catch (e) {
            try {
                return new ActiveXObject('Microsoft.XMLHTTP')
            } catch (e) {
                return new XMLHttpRequest()
            }
        }
    };
    ajax.serialize = function (f) {
        var g = function (n) {
            return f.getElementsByTagName(n)
        };
        var nv = function (e) {
            if (e.name) return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value);
            else return ''
        };
        var i = collect(g('input'), function (i) {
            if ((i.type != 'radio' && i.type != 'checkbox') || i.checked) return nv(i)
        });
        var s = collect(g('select'), nv);
        var t = collect(g('textarea'), nv);
        return i.concat(s).concat(t).join('&');
    };

    ajax.send = function (u, f, m, a, e) {
        var x = ajax.x();
        x.open(m, u, true);
        x.onreadystatechange = function () {
            if (x.readyState == 4 && x.status < 400) {
                var cType = x.getResponseHeader("Content-Type");
                f(x.responseText, cType);
            } else if (x.readyState == 4) {
                if (e == undefined) {
                    console.log(x.status + " (" + x.statusText + ") ");
                } else {
                    e(x.status, x);
                }
            }
        };
        if (m == 'POST')
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        x.send(a);
    };

    ajax.get = function (url, func, err) {
        ajax.send(url, func, 'GET', {}, err)
    };

    ajax.gets = function (url) {
        var x = ajax.x();
        x.open('GET', url, false);
        x.send(null);
        return x.responseText
    };

    ajax.post = function (url, func, args, err) {
        ajax.send(url, func, 'POST', args, err)
    };

    ajax.update = function (url, elm) {
        var e = $(elm);
        var f = function (r) {
            e.innerHTML = r
        };
        ajax.get(url, f)
    };
    ajax.submit = function (url, elm, frm) {
        var e = $(elm);
        var f = function (r) {
            e.innerHTML = r
        };
        ajax.post(url, f, ajax.serialize(frm))
    };
    global.ajax = ajax;
})(this);

/*end ajax.js*/

/*begin queryparams.js*/
// Sets up wb namespace (wb === waterbear). Global variable wb
// is initialized in the HTML before any javascript files are
// loaded (in template/template.html).
// Extracts parameters from URL, used to switch embed modes, load from gist, etc.
(function(global){
'use strict';
	// Source: http://stackoverflow.com/a/13984429
	function urlToQueryParams(url){
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
	                           decodeURIComponent(qpart[1] || '').split('#')[0];
	        }
	    }
	    return qparams;
	};

	function queryParamsToUrl(params){
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
		if (!parts.length){
			return base;
		}
		return base + '?' + parts.join('&');
	}

	wb.urlToQueryParams = urlToQueryParams;
	wb.queryParamsToUrl = queryParamsToUrl;
	global.wb = wb;
})(this);

/*end queryparams.js*/

/*begin util.js*/
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(global){
    'use strict';
    //
    //
    // UTILITY FUNCTIONS
    //
    // A bunch of these are to avoid needing jQuery just for simple things like matches(selector) and closest(selector)
    //
    //
    // TODO
    // Make these methods on HTMLDocument, HTMLElement, NodeList prototypes

    function makeArray(arrayLike){
        return Array.prototype.slice.call(arrayLike);
    }

    function reposition(elem, position){
        // put an absolutely positioned element in the right place
        // May need to take into account offsets of container
        elem.style.top = position.top + 'px';
        elem.style.left = position.left + 'px';
    }

    function hide(elem){
        elem.classList.add('hidden');
    }

    function show(elem){
        elem.classList.remove('hidden');
    }

    var svgText = document.querySelector('.resize-tester');
    function resize(input){
        if (!input)
        {
            return;
        }
        if (input.wbTarget){
            input = input.wbTarget;
        }
        svgText.textContent = input.value || '';
        var textbox = svgText.getBBox();
        input.style.width = (textbox.width + 25) + 'px';
    }

    // wb.mag = function mag(p1, p2){
    //     return Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
    // };

    function dist(p1, p2, m1, m2){
        return Math.sqrt(Math.pow(p1 - m1, 2) + Math.pow(p2 - m2, 2));
    }


    function overlapRect(r1, r2){ // determine area of overlap between two rects
        if (r1.left > r2.right){ return 0; }
        if (r1.right < r2.left){ return 0; }
        if (r1.top > r2.bottom){ return 0; }
        if (r1.bottom < r2.top){ return 0; }
        var max = Math.max, min = Math.min;
        return (max(r1.left, r2.left) - min(r1.right, r2.right)) * (max(r1.top, r2.top) - min(r1.bottom, r2.bottom));
    }

    function rect(elem){
        return elem.getBoundingClientRect();
    }

    function overlap(elem1, elem2){
        return wb.overlapRect(wb.rect(elem1), wb.rect(elem2));
    }

    function area(elem){
        return elem.clientWidth * elem.clientHeight;
    }

    function containedBy(target, container){
        var targetArea = Math.min(wb.area(target), wb.area(container) * 0.90);
        return target.overlap(container) >= targetArea;
    }

    function closest(elem, selector){
        if (elem.jquery){
            elem = elem[0];
        }
        while(elem){
            if (wb.matches(elem, selector)){
                return elem;
            }
            if (!elem.parentElement){
                throw new Error('Element has no parent, is it in the tree? %o', elem);
                //return null;
            }
            elem = elem.parentElement;
        }
        return null;
    }

    function indexOf(elem){
        var idx = 0;
        while(elem.previousSiblingElement){
            elem = elem.previousSiblingElement;
            idx++;
        }
        return idx;
    }

    function find(elem, selector){
        if (typeof(elem) === 'string'){
            selector = elem;
            elem = document.body;
        }
        return elem.querySelector(selector);
    }

    function findAll(elem, selector){
        if (typeof(elem) === 'string'){
            selector = elem;
            elem = document.body;
        }
        return wb.makeArray(elem.querySelectorAll(selector));
    }

    function findChildren(elem, selector){
        return wb.makeArray(elem.children).filter(function(item){
            return wb.matches(item, selector);
        });
    }

    function findChild(elem, selector){
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

   function elem(name, attributes, children){
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
                if (attributes[key] === null || attributes[key] === undefined)
                {
                    return;
                }
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
        if (children !== null && children !== undefined){
            if (Array.isArray(children)){
                children.forEach(function(child){
                    if (child.nodeName){
                        e.appendChild(child);
                    }else if (Array.isArray(child)){
                        console.error('DEPRECATED array arg to elem: use sub-elem instead');
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
    }


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

    wb.makeArray = makeArray;
    wb.reposition = reposition;
    wb.hide = hide;
    wb.show = show;
    wb.resize = resize;
    wb.dist = dist;
    wb.overlapRect = overlapRect;
    wb.rect = rect;
    wb.overlap = overlap;
    wb.area = area;
    wb.containedBy = containedBy;
    wb.closest = closest;
    wb.indexOf = indexOf;
    wb.find = find;
    wb.findAll = findAll;
    wb.findChildren = findChildren;
    wb.findChild = findChild;
    wb.elem = elem;

})(this);

/*end util.js*/

/*begin event.js*/
// Bare-bones Event library
// Adds support for event delegation on top of normal DOM events (like jQuery "live" events)
// Minimal support for non-DOM (custom) events
// Normalized between mouse and touch events
// Waterbear specific: events have wb-target which is always a block element
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(global){
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
    var isTouch = ('ontouchstart' in global);
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
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)

(function(global){
'use strict';
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
    // Drag any block from block menu to script canvas: clone and add to script canvas
    // Drag any block from anywhere besides menu to menu: delete block and contained blocks
    // Drag any attached block to canvas: detach and add to script canvas
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
    
    // Key to touch is the timer function for handling movement and hit testing
    
    var dragTimeout = 20;
    var snapDist = 25; //In pixels
    var startParent;
    var startSibling;
    var timer;
    var dragTarget;
    var dropTarget;
    var dropRects;
    var dragging;
    var currentPosition;
    var scope;
    var workspace; // <- WB. The Workspace block is created with the function
           // createWorkspace() in the workspace.js file.
    var blockMenu = document.querySelector('#block_menu'); // <- WB
    var scratchpad= document.querySelector('.scratchpad'); // <- WB
    var potentialDropTargets;
    var selectedSocket; // <- WB
    var dragAction = {};
    var templateDrag, localDrag; // <- WB
    var startPosition;
    var pointerDown;
    var cloned;
    
    var _dropCursor; // <- WB
    
    // WB-specific
    function dropCursor(){
        if (!_dropCursor){
            _dropCursor = document.querySelector('.drop-cursor');
        }
        return _dropCursor;
    }
    
    function reset(){
        // console.log('reset dragTarget to null');
        dragTarget = null;
        dragAction = {undo: undoDrag, redo: redoDrag}; // <- WB
        potentialDropTargets = [];
        dropRects = [];
        dropTarget = null;
        startPosition = null;
        currentPosition = null;
        timer = null;
        dragging = false;
        pointerDown = false;
        cloned = false; // <- WB
        scope = null; // <- WB
        templateDrag = false; // <- WB
        localDrag = false; // <- WB
        blockMenu = document.querySelector('#block_menu');
        var scratchpad= document.querySelector('.scratchpad'); // <- WB
        workspace = null;
        selectedSocket = null;
        _dropCursor = null;
        startParent = null;
        startSibling = null;
    }
    reset();
    
    function initDrag(event){
        // console.log('initDrag(%o)', event);
        
        // Called on mousedown or touchstart, we haven't started dragging yet
        // DONE: Don't start drag on a text input or select using :input jquery selector
        pointerDown = true;
        var eT = event.wbTarget; // <- WB
        //Check whether the original target was an input ....
        // WB-specific
        if (wb.matches(event.target, 'input, select, option, .disclosure, .contained')  && !wb.matches(eT, '#block_menu *')) {
            console.log('not a drag handle');
            return undefined;
        }
        
        var target = null;
        if (eT.classList.contains('scratchpad')) {
            var clickedBlock = getClickedBlock(scratchpad, event);
            if (clickedBlock != false) {
                console.log("The event has block");
                target = clickedBlock;
            } else {
                return undefined;
            }
        } else {
            target = wb.closest(eT, '.block'); // <- WB
        }
        //This throws an error when block is in scratchpad
        if (target){
            // WB-Specific
            if (wb.matches(target, '.scripts_workspace')){
                // don't start drag on workspace block
                return undefined;
            }
            dragTarget = target;
            // WB-Specific
            if (target.parentElement.classList.contains('block-menu')){
                //console.log('target parent: %o', target.parentElement);
                target.dataset.isTemplateBlock = 'true';
                templateDrag = true;
            }
            dragAction.target = target;
            // WB-Specific
            if (target.parentElement.classList.contains('locals')){
                //console.log('target parent: %o', target.parentElement);
                target.dataset.isLocal = 'true';
                localDrag = true;
            }
            //dragTarget.classList.add("dragIndication");
            startPosition = wb.rect(target); // <- WB
            // WB-Specific
            if (! wb.matches(target.parentElement, '.scripts_workspace')){
                startParent = target.parentElement;
            }
            startSibling = target.nextElementSibling;
            // WB-Specific
            if(startSibling && !wb.matches(startSibling, '.block')) {
                // Sometimes the "next sibling" ends up being the cursor
                startSibling = startSibling.nextElementSibling;
            }
        }else{
            console.warn('not a valid drag target');
            dragTarget = null;
        }
        return false;
    }

    function startDrag(event){
        // called on mousemove or touchmove if not already dragging
        if (!dragTarget) {return undefined;}
        if (!pointerDown) {return undefined;}
        // console.log('startDrag(%o)', event);
        dragTarget.classList.add("dragIndication");
        currentPosition = {left: event.wbPageX, top: event.wbPageY};
        // Track source for undo/redo
        dragAction.target = dragTarget;
        dragAction.fromParent = startParent;
        dragAction.fromBefore = startSibling;
        // target = clone target if in menu
        // FIXME: Set different listeners on menu blocks than on the script area
        // WB-Specific
        if (dragTarget.dataset.isTemplateBlock){
            dragTarget.classList.remove('dragIndication');
            var parent = dragTarget.parentElement;
            // console.log('set drag target to clone of old drag target');
            dragTarget = wb.cloneBlock(dragTarget); // clones dataset and children, yay
            dragAction.target = dragTarget;
            // If we're dragging from the menu, there's no source to track for undo/redo
            dragAction.fromParent = dragAction.fromBefore = null;
            // Event.trigger(dragTarget, 'wb-clone'); // not in document, won't bubble to document.body
            dragTarget.classList.add('dragIndication');
            if (localDrag){
                scope = wb.closest(parent, '.context');
            }else{
                scope = null;
            }
            cloned = true;
        }else{
            // TODO: handle detach better (generalize restoring sockets, put in language file)
            // FIXME: Need to handle this somewhere
            // FIXME: Better name?
            // WB-Specific
            Event.trigger(dragTarget, 'wb-remove');
        }
        dragging = true;
        // get position and append target to .content, adjust offsets
        // set last offset
        dragTarget.style.position = 'absolute'; // FIXME, this should be in CSS
        dragTarget.style.pointerEvents = 'none'; // FIXME, this should be in CSS
        // WB-Specific
        document.body.appendChild(dragTarget);
        // WB-Specific
        if (cloned){
            // call this here so it can bubble to document.body
            Event.trigger(dragTarget, 'wb-clone');
        }
        // WB-Specific
        wb.reposition(dragTarget, startPosition);
        // WB-Specific ???
        potentialDropTargets = getPotentialDropTargets(dragTarget);
        // WB-Specific
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
        // console.log('drag(%o)', event);
        event.preventDefault();
        // update the variables, distance, button pressed
        var nextPosition = {left: event.wbPageX, top: event.wbPageY}; // <- WB
        var dX = nextPosition.left - currentPosition.left;
        var dY = nextPosition.top - currentPosition.top;
        var currPos = wb.rect(dragTarget); // <- WB
        // WB-Specific
        wb.reposition(dragTarget, {left: currPos.left + dX, top: currPos.top + dY});
        currentPosition = nextPosition;
        return false;
    }

    function endDrag(event){
        pointerDown = false;
        // console.log('endDrag(%o) dragging: %s', event, dragging);
        if (!dragging) {return undefined;}
        clearTimeout(timer);
        timer = null;
        handleDrop(event,event.altKey || event.ctrlKey);
        reset();
        event.preventDefault();
        return false;
    }

    function handleDrop(event,copyBlock){
        // console.log('handleDrop(%o)', copyBlock);
        // TODO:
           // is it over the menu
           // 1. Drop if there is a target
           // 2. Remove, if not over a canvas
           // 3. Remove, if dragging a clone
           // 4. Move back to start position if not a clone (maybe not?)
        resetDragStyles(); // <- WB
        // WB-Specific
        if (wb.overlap(dragTarget, blockMenu)){
            // delete block if dragged back to menu
            Event.trigger(dragTarget, 'wb-delete');
            dragTarget.parentElement.removeChild(dragTarget);
            // Add history action if the source block was in the workspace
            if(!templateDrag) {
                // If we're dragging to the menu, there's no destination to track for undo/redo
                dragAction.toParent = dragAction.toBefore = null;
                wb.history.add(dragAction);
            }
        } else if (wb.overlap(dragTarget, scratchpad)) {
            var scratchPadStyle = scratchpad.getBoundingClientRect();
            var newOriginX = scratchPadStyle.left;
            var newOriginY = scratchPadStyle.top;

            var blockStyle = dragTarget.getBoundingClientRect();
            var oldX = blockStyle.left;
            var oldY = blockStyle.top;

            dragTarget.style.position = "absolute";
            dragTarget.style.left = (oldX - newOriginX) + "px";
            dragTarget.style.top = (oldY - newOriginY) + "px";
            scratchpad.appendChild(dragTarget);

            //when dragging from workspace to scratchpad, this keeps workspace from
            //moving around when block in scratchpad is moved.
            //dragTarget.parentElement.removeChild(dragTarget); 
            Event.trigger(dragTarget, 'wb-add');
            return;
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
            dragAction.toParent = dragTarget.parentNode;
            dragAction.toBefore = dragTarget.nextElementSibling;
            if(dragAction.toBefore && !wb.matches(dragAction.toBefore, '.block')) {
                // Sometimes the "next sibling" ends up being the cursor
                dragAction.toBefore = dragAction.toBefore.nextElementSibling;
            }
            wb.history.add(dragAction);
        }else{
            if (cloned){
                // remove cloned block (from menu)
                dragTarget.parentElement.removeChild(dragTarget);
            }else{
                revertDrop();
            }
        }
    }
    
    /* There's basically four types of drag actions
    - Drag-in – dragging a block from the menu to the workspace
        If fromParent is null, this is the type of drag that occurred.
        - To undo: remove the block from the workspace
        - To redo: re-insert the block into the workspace
    - Drag-around - dragging a block from one position to another in the workspace
        Indicated by neither of fromParent and toParent being null.
        - To undo: remove the block from the old position and re-insert it at the new position.
        - To redo: remove the block from the old position and re-insert it at the new position.
    - Drag-out - dragging a block from the workspace to the menu (thus deleting it)
        If toParent is null, this is the type of drag that occurred.
        - To undo: re-insert the block into the workspace.
        - To redo: remove the block from the workspace.
    - Drag-copy - dragging a block from one position to another in the workspace and duplicating it
        At the undo/redo level, no distinction from drag-in is required.
        - To undo: remove the block from the new location.
        - To redo: re-insert the block at the new location.
    
    Note: If toBefore or fromBefore is null, that just means the location refers to the last
    possible position (ie, the block was added to or removed from the end of a sequence). Thus,
    we don't check those to determine what action to undo/redo.
    */
    
    function undoDrag() {
        if(this.toParent != null) {
            // Remove the inserted block
            // WB-Specific
            Event.trigger(this.target, 'wb-remove');
            this.target.remove();
        }
        if(this.fromParent != null) {
            // Put back the removed block
            this.target.removeAttribute('style');
            // WB-Specific
            if(wb.matches(this.target,'.step')) {
                this.fromParent.insertBefore(this.target, this.fromBefore);
            } else {
                this.fromParent.appendChild(this.target);
            }
            // WB-Specific
            Event.trigger(this.target, 'wb-add');
        }
    }
    
    function redoDrag() {
        if(this.toParent != null) {
            // WB-Specific
            if(wb.matches(this.target,'.step')) {
                this.toParent.insertBefore(this.target, this.toBefore);
            } else {
                this.toParent.appendChild(this.target);
            }
            Event.trigger(this.target, 'wb-add');
        }
        if(this.fromParent != null) {
            // WB-Specific
            Event.trigger(this.target, 'wb-remove');
            this.target.remove();
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
    
    function cancelDrag(event) {
        // Cancel if escape key pressed
        // console.log('cancel drag of %o', dragTarget);
        if(event.keyCode == 27) {
            resetDragStyles();
            revertDrop();
            clearTimeout(timer);
            timer = null;
            reset();
            return false;
        }
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
	cloned = wb.cloneBlock(event.target);
	scratchpad.appendChild(cloned);
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
        // console.log('initializeDragHandlers');
        Event.on('.content', 'touchstart', '.block', initDrag);
        Event.on('.content', 'touchmove', null, drag);
        Event.on('.content', 'touchend', null, endDrag);
        // TODO: A way to cancel touch drag?
    Event.on('.content', 'mousedown', '.scratchpad', initDrag);
    Event.on('.content', 'dblclick', null, arrangeScratchpad);
    Event.on('.content', 'dblclick', '.block', menuToScratchpad)
        Event.on('.content', 'mousedown', '.block', initDrag);
        Event.on('.content', 'mousemove', null, drag);
        Event.on(document.body, 'mouseup', null, endDrag);
        Event.on(document.body, 'keyup', null, cancelDrag);
    };
})(this);


/*end drag.js*/

/*begin uuid.js*/
// This returns a Version 4 (random) UUID
// See: https://en.wikipedia.org/wiki/Universally_unique_identifier for more info

(function(global){
  'use strict';
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
  var UUID_TEST = /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{11}[a-zA-Z0-9]?/;

  function isUuid(value){
    if (!value) return false;
    return UUID_TEST.test(value);
  }

  // Public interface
  function uuid(){
    return hex(8) + '-' + hex(4) + '-4' + hex(3) + '-' + variant() + hex(3) + '-' + hex(12);
  }

  global.uuid = uuid;
  global.isUuid = isUuid;

})(this);

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

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
    var elem = wb.elem;

    var nextSeqNum = 0;
    var blockRegistry = {}; /* populated in function "registerBlock", which is
                               called by the Block() function below*/

    function newSeqNum(){
        nextSeqNum++;
        return nextSeqNum;
    }

    function registerSeqNum(seqNum){
        // When reifying saved blocks, call this for each block to make sure we start new blocks
        // that do not overlap with old ones.
        if (!seqNum)
        {
            return;
        }
        nextSeqNum = Math.max(parseInt(seqNum, 10), nextSeqNum);
    }

    function resetSeqNum(){
        console.log('resetSeqNum (and also block registry)');
        nextSeqNum = 0;
        // the lines below were breaking loading from files, and probably any load after the menus were built
        // blockRegistry = {};
        // wb.blockRegistry = blockRegistry;
    }

    function registerBlock(blockdesc){
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

    function getHelp(id){
        return blockRegistry[id] ? blockRegistry[id].help : '';
    }

    function getScript(id){
        try{
            return blockRegistry[id].script;
        }catch(e){
            console.error('Error: could not get script for %o', id);
            console.error('Hey look: %o', document.getElementById(id));
            return '';
        }
    }

    function getSockets(block){
        return wb.findChildren(wb.findChild(block, '.label'), '.socket');
    }

    function getSocketValue (socket){
        return socketValue(wb.findChild(socket, '.holder'));
    }

    function createSockets(obj){
        return obj.sockets.map(function(socket_descriptor){
            return Socket(socket_descriptor, obj);
        });
    }

    var Block = function(obj){
        registerBlock(obj);
        // if (!obj.isTemplateBlock){
        //     console.log('block seq num: %s', obj.seqNum);
        // }
        if (!obj.isTemplateBlock){
            updateFromTemplateBlock(obj);
        }
        var block = elem(
            'div',
            {
                'class': function(){
                    var names = ['block', obj.group, obj.blocktype];
                    if(obj.blocktype === "expression"){
                        names.push(obj.type);
                        names.push(obj.type+'s'); // FIXME, this is a horrible hack for CSS
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
                'data-keywords': JSON.stringify(obj.keywords),
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
        //if (!obj.isTemplateBlock){
        //     console.log('instantiated block %o from description %o', block, obj);
        //}
        return block;
    };

    // Block Event Handlers

    function removeBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            removeExpression(event);
        }else{
            removeStep(event);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'removed'});
    }

    function addBlock(event){
        event.stopPropagation();
        if (wb.matches(event.wbTarget, '.expression')){
            addExpression(event);
        }else{
            addStep(event);
        }
        Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'added'});
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
                    // if (!spec.seqNum){
                        spec.seqNum = block.dataset.seqNum;
                    // }
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

    var Socket = function(desc, blockdesc){
        // desc is a socket descriptor object, block is the owner block descriptor
        // Sockets are described by text, type, and (default) value
        // type and value are optional, but if you have one you must have the other
        // If the type is choice it must also have a options for the list of values
        // that can be found in the wb.choiceLists
        // A socket may also have a suffix, text after the value
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
        //      console.log('socket seq num: %s', blockdesc.seqNum);
        // }
        socket.firstElementChild.innerHTML = socket.firstElementChild.innerHTML.replace(/##/, ' <span class="seq-num">' + (blockdesc.seqNum || '##') + '</span>');
        if (desc.type){
            socket.dataset.type = desc.type;
            var holder = elem('div', {'class': 'holder'}, [Default(desc)]);
            socket.appendChild(holder);
        }
        if (desc.block){
            socket.dataset.block = desc.block;
        }
        socket.dataset.seqNum = blockdesc.seqNum;
        if (!blockdesc.isTemplateBlock){
            //console.log('socket seq num: %s', blockdesc.seqNum);
            var newBlock = null;
            if (desc.uBlock){
                // console.log('trying to instantiate %o', desc.uBlock);
                delete desc.uValue;
                newBlock = Block(desc.uBlock);
                //console.log('created instance: %o', newBlock);
            } else if (desc.block && ! desc.uValue){
                //console.log('desc.block');
                newBlock = cloneBlock(document.getElementById(desc.block));
            }else if (desc.block && desc.uValue){
                // for debugging only
                // console.log('block: %s, uValue: %s', desc.block, desc.uValue);                
            }
            if (newBlock){
                //console.log('appending new block');
                holder.appendChild(newBlock);
                addExpression({'wbTarget': newBlock});
            }
        }
        if (desc.suffix){
            socket.dataset.suffix = desc.suffix;
            socket.appendChild(elem('span', {'class': 'suffix'}, desc.suffix));
        }
        return socket;
    };


    function socketDesc(socket){
        var parentBlock = wb.closest(socket, '.block');
        var isTemplate = !!parentBlock.dataset.isTemplateBlock;
        var desc = {
            name: socket.dataset.name
        };
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
        if (socket.dataset.suffix){
            desc.suffix = socket.dataset.suffix;
        }
        // User-specified settings
        if (isTemplate) 
        {
            return desc;
        }
        var uName = wb.findChild(socket, '.name').textContent;
        var uEle = wb.findChild(socket, '.name');
        
        if (desc.name.replace(/##/, ' ' + socket.dataset.seqNum) !== uName){
            desc.uName = uName;
        }
        var holder = wb.findChild(socket, '.holder');
        if (holder){
            var input = wb.findChild(holder, 'input, select');
            // var block = wb.findChild(holder, '.block');
            if (wb.matches(holder.lastElementChild, '.block')){
                desc.uBlock = blockDesc(holder.lastElementChild);
            }else{
                desc.uValue = input.value;
            }
        }
        return desc;
    }

    function updateFromTemplateBlock(obj){
        // Retrieve the things we don't need to duplicate in every instance block description
        var tB = blockRegistry[obj.scriptId];
        if (!tB){
            console.error('Error: could not get template block for  for %o', obj);
            return obj;
        }
        obj.blocktype = tB.blocktype;
        obj.group = tB.group;
        obj.help = tB.help;
        obj.type = tB.type;
    }

    function blockDesc(block){
        var label = wb.findChild(block, '.label');
        var sockets = wb.findChildren(label, '.socket');
        var desc = {
            id: block.id,
            scopeId: block.dataset.scopeId,
            scriptId: block.dataset.scriptId,
            sockets: sockets.map(socketDesc)
        };

        if (block.dataset.group === 'scripts_workspace'){
            desc.blocktype = block.dataset.blocktype;
            desc.group = block.dataset.group;
            desc.help = block.dataset.help;
            desc.type = block.dataset.type;            
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
        ////////////////////
        // Why were we deleting seqNum here?
        // I think it was from back when menu template blocks had sequence numbers
        // UPDATE:
        // No, it was because we want cloned blocks (and the locals they create) to get 
        // new sequence numbers. But, if the block being clones is an instance of a local then we
        // don't want to get a new sequence number.
        // /////////////////
        if (!block.dataset.localSource){
            delete blockdesc.seqNum;
        }
        if (blockdesc.isTemplateBlock){
            blockdesc.scriptId = block.id;            
        }
        delete blockdesc.isTemplateBlock;
        delete blockdesc.isLocal;        
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
        
        if(type === 'boolean')
        {
            obj.options = 'boolean';
        }
        
        if(typeof obj.options !== 'undefined')
        {
            // DONE : #24
            // DONE : #227
            var choice = elem('select');
            var list = wb.choiceLists[obj.options];
            
            if(Array.isArray(list))
            {
                wb.choiceLists[obj.options].forEach(function(opt){
                    var option = elem('option', {}, opt);
                    var value = obj.uValue || obj.value;
                    
                    if (value !== undefined && value !== null && value == opt){
                        option.setAttribute('selected', 'selected');
                    }
                    
                    choice.appendChild(option);
                });
            }
            else
            {
                var values = Object.keys(list);
                
                values.forEach(function(val){
                    var option = elem('option', {"value":val}, list[val]);
                    var value = obj.uValue || obj.value;
                    
                    if (value !== undefined && value !== null && value == val){
                        option.setAttribute('selected', 'selected');
                    }
                    
                    choice.appendChild(option);
                });
            }
            
            return choice;
        
        }
        
        if (type === 'int' || type === 'float'){
            type = 'number';
        }
        if (type === 'image'){
            type = '_image'; // avoid getting input type="image"
        }
        switch(type){
            case 'any':
                value = obj.uValue || obj.value || ''; break;
            case 'number':
                value = obj.uValue || obj.value || 0; break;
            case 'string':
                value = obj.uValue || obj.value || ''; break;
            case 'regex':
                value = obj.uValue || obj.value || /.*/; break;
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
            case 'phone':
                value = obj.uValue || obj.value || '604-555-1212'; break;
            case 'email':
                value = obj.uValue || obj.value || 'waterbear@waterbearlang.com'; break;
            default:
                value = obj.uValue || obj.value || '';
        }
        var input = elem('input', {type: type, value: value, 'data-oldvalue': value});

        //Only enable editing for the appropriate types
        if (!(type === "string" || type === "any" || type === 'regex' ||
              type === "url"    || type === "phone" ||
              type === "number" || type === "color")) {
            input.readOnly = true;
        }

        wb.resize(input);
        return input;
    };

    function socketValue(holder){
        if (holder.children.length > 1){
            return codeFromBlock(wb.findChild(holder, '.block'));
        }else{
            var value = wb.findChild(holder, 'input, select').value;
            var type = holder.parentElement.dataset.type;

            // DONE : #227
            if (type === 'string' || type === 'color' || type === 'url'){
                if (value[0] === '"'){value = value.slice(1);}
                if (value[value.length-1] === '"'){value = value.slice(0,-1);}
                value = value.replace(/"/g, '\\"');
                value = '"' + value + '"';
            } else if (type === 'regex'){
                if (value[0] === '/'){value = value.slice(1);}
                if (value[value.length-1] === '/'){value = value.slice(0,-1);}
                value = value.replace(/\//g, '\\/');
                value = '/' + value + '/';
            }
            return value;
        }
    }

    function codeFromBlock(block){
        console.log(getScript(block.dataset.scriptId));
        var scriptTemplate = getScript(block.dataset.scriptId).replace(/##/g, '_' + block.dataset.seqNum);
        if (!scriptTemplate){
            // If there is no scriptTemplate, things have gone horribly wrong, probably from 
            // a block being removed from the language rather than hidden
            wb.findAll('.block[data-script-id="' + block.dataset.scriptId + '"]').forEach(function(elem){
                elem.style.backgroundColor = 'red';
            });
        }
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
    }

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
        // console.log('updateName on %o', event);
        var input = event.wbTarget;
        Event.off(input, 'blur', updateName);
        Event.off(input, 'keydown', maybeUpdateName);
        var nameSpan = input.previousSibling;
        var newName = input.value;
        var oldName = input.parentElement.textContent;
        // if (!input.parentElement) return; // already removed it, not sure why we're getting multiple blurs
        input.parentElement.removeChild(input);
        nameSpan.style.display = 'initial';
        function propagateChange(newName) {
            // console.log('now update all instances too');
            var source = wb.closest(nameSpan, '.block');
            var instances = wb.findAll(wb.closest(source, '.context'), '[data-local-source="' + source.dataset.localSource + '"]');
            instances.forEach(function(elem){
                wb.find(elem, '.name').textContent = newName;
                wb.find(elem, '.socket').dataset.name = newName;
            });

            //Change name of parent
            var parent = document.getElementById(source.dataset.localSource);
            var nameTemplate = JSON.parse(parent.dataset.sockets)[0].name;
            nameTemplate = nameTemplate.replace(/[^' ']*##/g, newName);

            //Change locals name of parent
            var parentLocals = JSON.parse(parent.dataset.locals);
            var localSocket = parentLocals[0].sockets[0];
            localSocket.name = newName;
            parent.dataset.locals = JSON.stringify(parentLocals);

            wb.find(parent, '.name').textContent = nameTemplate;
            Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'nameChanged'});
        }
        var action = {
            undo: function() {
                propagateChange(oldName);
            },
            redo: function() {
                propagateChange(newName);
            }
        };
        wb.history.add(action);
        action.redo();
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
            input.blur();
        }else if(event.keyCode === 0x0D /* return or enter */ || event.keyCode === 0x09 /* tab */){
            event.preventDefault();
            input.blur();
        }
    }

    /** Search filter */

    var oldQuery = '';

    function searchBlock(event) {
        // Clear input if the clear button is pressed
        var searchTextNode = document.getElementById('search_text');

        if (event.target.id == 'search_clear') {
            searchTextNode.value = '';
        }

        // Proceed if the query is changed
        var query = searchTextNode.value.trim().toLowerCase();

        if (oldQuery == query) {
            return;
        } else {
            oldQuery = query;
        }

        var searchResultsNode = document.getElementById('search_results');
        var blockMenuNode = document.getElementById('block_menu');

        // For non-empty query, show all blocks; otherwise, hide all blocks
        if (query) {
            wb.show(searchResultsNode);
            wb.hide(blockMenuNode);

            while (searchResultsNode.firstChild) {
                searchResultsNode.removeChild(searchResultsNode.firstChild);
            }
        } else {
            wb.hide(searchResultsNode);
            wb.show(blockMenuNode);
            return;
        }

        // Clear suggestions
        var suggestions = [];
        var suggestionsNode = document.getElementById('search_suggestions');
        while (suggestionsNode.firstChild) {
            suggestionsNode.removeChild(suggestionsNode.firstChild);
        }

        var groups = document.querySelectorAll('.block-menu');
     
        for (var i = 0; i < groups.length; i++) {
            var blocks = groups[i].getElementsByClassName('block');

            for (var j = 0; j < blocks.length; j++) {
                // Construct an array of keywords
                var keywords = [];

                var group = blocks[j].getAttribute('data-group');
                if (group) {
                    keywords.push(group);
                }

                var keywordsAttr = blocks[j].getAttribute('data-keywords');
                if (keywordsAttr) {
                    keywords = keywords.concat(JSON.parse(keywordsAttr));
                }

                // Find a match
                var matchingKeywords = [];

                for (var k = 0; k < keywords.length; k++) {
                    if (keywords[k].indexOf(query) == 0) {
                        matchingKeywords.push(keywords[k]);

                        if (suggestions.indexOf(keywords[k]) == -1) {
                            suggestions.push(keywords[k]);

                            var suggestionNode = document.createElement('option');
                            suggestionNode.value = keywords[k];
                            suggestionsNode.appendChild(suggestionNode);
                        }
                    }
                }

                // Show/hide blocks
                if (matchingKeywords.length > 0) {
                    var resultNode = document.createElement('div');
                    resultNode.classList.add('search_result');
                    resultNode.classList.add(group);
                    resultNode.style.backgroundColor = 'transparent';

                    // Block
                    resultNode.appendChild(blocks[j].cloneNode(true));

                    // Fix result height
                    var clearNode = document.createElement('div');
                    clearNode.style.clear = 'both';
                    resultNode.appendChild(clearNode);

                    // Keyword name
                    var keywordNode = document.createElement('span');
                    keywordNode.classList.add('keyword');
                    var keywordNodeContent = '<span class="keyword">';
                    keywordNodeContent += '<span class="match">';
                    keywordNodeContent += matchingKeywords[0].substr(0, query.length);
                    keywordNodeContent += '</span>';
                    keywordNodeContent += matchingKeywords[0].substr(query.length);

                    for (var k = 1; k < matchingKeywords.length; k++) {
                        keywordNodeContent += ', <span class="match">';
                        keywordNodeContent += matchingKeywords[k].substr(0, query.length);
                        keywordNodeContent += '</span>';
                        keywordNodeContent += matchingKeywords[k].substr(query.length);
                    }

                    keywordNodeContent += '</span>';
                    keywordNode.innerHTML = keywordNodeContent;
                    resultNode.appendChild(keywordNode);

                    searchResultsNode.appendChild(resultNode);
                }
            }
        }
    }

    Event.on(document.body, 'wb-remove', '.block', removeBlock);
    Event.on(document.body, 'wb-add', '.block', addBlock);
    Event.on(document.body, 'wb-delete', '.block', deleteBlock);

    Event.on('#search_text', 'keyup', null, searchBlock);
    Event.on('#search_text', 'input', null, searchBlock);
    Event.on('#search_clear', 'click', null, searchBlock);

    wb.blockRegistry = blockRegistry;

    // Export methods
    wb.Block = Block;
    wb.blockDesc = blockDesc;
    wb.socketDesc = socketDesc;
    wb.registerSeqNum = registerSeqNum;
    wb.resetSeqNum = resetSeqNum;
    wb.cloneBlock = cloneBlock;
    wb.codeFromBlock = codeFromBlock;
    wb.changeName = changeName;
    wb.getSockets = getSockets;
    wb.getSocketValue = getSocketValue;
})(wb);


/*end block.js*/

/*begin file.js*/
// All File-like I/O functions, including:
//
// * Loading and saving to Gists
// * Loading and saving to MakeAPI (not implemented yet)
// * Loading and saving to Filesystem
// * Loading and saving to LocalStorage (including currentScript)
// * Loading examples
// * etc.
/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
    function saveCurrentScripts(){
        if (!wb.scriptModified){
            // console.log('nothing to save');
            // nothing to save
            return;
        }
        document.querySelector('#block_menu').scrollIntoView();
        localStorage['__' + wb.language + '_current_scripts'] = scriptsToString();
    }

    // Save script to gist;
    function saveCurrentScriptsToGist(event){
        event.preventDefault();
        // console.log("Saving to Gist");
        var title = prompt("Save to an anonymous Gist titled: ");
        if ( !title ) return;
        ajax.post("https://api.github.com/gists", function(data){
            //var raw_url = JSON.parse(data).files["script.json"].raw_url;
            var gistID = JSON.parse(data).url.split("/").pop();
            prompt("This is your Gist ID. Copy to clipboard: Ctrl+C, Enter", gistID);

            //save gist id to local storage
            var localGists = localStorage['__' + wb.language + '_recent_gists'];
            var gistArray = localGists === undefined ? [] : JSON.parse(localGists);
            gistArray.push(gistID);
            localStorage['__' + wb.language + '_recent_gists'] = JSON.stringify(gistArray);

        }, JSON.stringify({
            "description": title,
            "public": true,
            "files": {
                "script.json": {
                    "content": scriptsToString(title, '', title)
                },
            }
        }), function(statusCode, x){
            alert("Can't save to Gist:\n" + statusCode + " (" + x.statusText + ") ");
        });
    }
    //populate the gist submenu with recent gists
    function loadRecentGists() {
        var localGists = localStorage['__' + wb.language + '_recent_gists'];
        var gistArray = localGists === undefined ? [] : JSON.parse(localGists);
        var gistContainer = document.querySelector("#recent_gists");
        gistContainer.innerHTML = '';

        for (var i = 0; i < gistArray.length; i++) {
            //add a new button to the gist sub-menu
            var gist = gistArray[i];
            var node = document.createElement("li");
            var button = document.createElement('button');
            var buttonText = document.createTextNode("#" + gist);

            button.appendChild(buttonText);
            button.classList.add('load-gist');
            button.dataset.href = wb.language + ".html?gist=" + gist;
            button.dataset.gist = gist;

            node.appendChild(button);
            gistContainer.appendChild(node);

            button.addEventListener('click', function(){
                wb.loadScriptsFromGistId(this.dataset.gist);
            });
        }
    }

    //Potential FIXME: I feel that title should be the filename, but uName || name
    //determines what is shown in the workspace.
    function scriptsToString(title, description, name){
        if (!title){ title = ''; }
        if (!description){ description = ''; }
        if (!name){ name = 'Workspace';}
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        var json = {
            title: title,
            description: description,
            date: Date.now(),
            waterbearVersion: '2.0',
            blocks: blocks.map(wb.blockDesc)
        };

        if(json.blocks[0].sockets[0].name){
            json.blocks[0].sockets[0].name = name;
        }else if(json.blocks[0].sockets[0].uName){
            json.blocks[0].sockets[0].uName = name;
        }

        return JSON.stringify(json, null, '    ');
    }


    function createDownloadUrl(evt){
        evt.preventDefault();
        var name = prompt("Save file as: ");
        if( !name ) return;
        var URL = window.webkitURL || window.URL;
        var file = new Blob([scriptsToString('','',name)], {type: 'application/json'});
        var reader = new FileReader();
        var a = document.createElement('a');
        reader.onloadend = function(){
            a.href = reader.result;
            a.download = name + '.json';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
        };
        reader.readAsDataURL(file);
    }

    function loadScriptsFromGistId(id){
        //we may get an event passed to this function so make sure we have a valid id or ask for one
        var gistID = isNaN(parseInt(id)) ? prompt("What Gist would you like to load? Please enter the ID of the Gist: ")  : id;
        // console.log("Loading gist " + id);
        if( !gistID ) return;
        ajax.get("https://api.github.com/gists/"+gistID, function(data){
            loadScriptsFromGist({data:JSON.parse(data)});
        }, function(statusCode, x){
            alert("Can't load from Gist:\n" + statusCode + " (" + x.statusText + ") ");
        });
        var path = location.href.split('?')[0];
        path += "?gist=" + gistID;
        history.pushState(null, '', path);
    }

    function loadScriptsFromFilesystem(event){
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
        if (!fileObject) return wb.createWorkspace();
        var blocks = fileObject.blocks.map(wb.Block);
        if (!blocks.length){
            return wb.createWorkspace();
        }
        if (blocks.length > 1){
            console.error('not really expecting multiple blocks here right now');
            console.error(blocks);
        }
        blocks.forEach(function(block){
            wb.wireUpWorkspace(block);
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
            console.error('no json file found in gist: %o', gist);
            return;
        }
        loadScriptsFromJson(file);
    }

    function loadScriptsFromExample(name){
        ajax.get('examples/' + wb.language + '/' + name + '.json?b=' + Math.random(), function(exampleJson){
            loadScriptsFromJson(exampleJson);
        }, function(statusCode, xhr){
            console.error(statusCode + xhr);
        });
    }

    function loadScriptsFromJson(jsonblob){
        // wb.clearScripts(null, true);
        wb.loaded = true;
        loadScriptsFromObject(JSON.parse(jsonblob));
        wb.scriptModified = true;
    }

    function loadCurrentScripts(queryParsed){
        // console.log('loadCurrentScripts(%s)', JSON.stringify(queryParsed));
        if (wb.loaded) return;
        wb.scriptLoaded = false;
        if (queryParsed.gist){
            //console.log("Loading gist %s", queryParsed.gist);
            ajax.get("https://api.github.com/gists/"+queryParsed.gist, function(data){
                loadScriptsFromGist({data:JSON.parse(data)});
            }, function(statusCode, x){
              alert("Can't save to gist:\n" + statusCode + " (" + x.statusText + ") ");
            });
        }else if (queryParsed.example){
            //console.log('loading example %s', queryParsed.example);
            loadScriptsFromExample(queryParsed.example);
        }else if (localStorage['__' + wb.language + '_current_scripts']){
            //console.log('loading current script from local storage');
            var fileObject = JSON.parse(localStorage['__' + wb.language + '_current_scripts']);
            if (fileObject){
                loadScriptsFromObject(fileObject);
            }
        }else{
            //console.log('no script to load, starting a new script');  
            wb.scriptLoaded = true;
            wb.createWorkspace('Workspace');
        }
        wb.loaded = true;
        Event.trigger(document.body, 'wb-loaded');
    }

	function loadScriptsFromFile(file){
		var fileName = file.name;
		if (fileName.indexOf('.json', fileName.length - 5) === -1) {
			console.error("File is not a JSON file");
			return;
		}
		var reader = new FileReader();
		reader.readAsText( file );
		reader.onload = function (evt){
            loadScriptsFromJson(evt.target.result);
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

    wb.saveCurrentScripts = saveCurrentScripts;
    wb.saveCurrentScriptsToGist = saveCurrentScriptsToGist;
    wb.loadRecentGists = loadRecentGists;
    wb.createDownloadUrl = createDownloadUrl;
    wb.loadScriptsFromGistId = loadScriptsFromGistId;
    wb.loadScriptsFromFilesystem = loadScriptsFromFilesystem;
    wb.loadCurrentScripts = loadCurrentScripts;
    wb.getFiles = getFiles;

})(wb);

/*end file.js*/

/*begin undo.js*/
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
	'use strict';
// Undo list

// Undo actions must support two methods:
// - undo() which reverses the effect of the action
// - redo() which reapplies the effect of the action, assuming it has been redone.
// These methods may safely assume that no other actions have been performed.

// This is the maximum number of actions that will be stored in the undo list.
// There's no reason why it needs to be constant; there could be an interface to alter it.
// (Of course, that'd require making it public first.)
var MAX_UNDO = 30;
var undoActions = [];
// When currentAction == undoActions.length, there are no actions available to redo
var currentAction = 0;

function clearUndoStack(){
	undoActions.length = 0;
	currentAction = 0;
	try{
		document.querySelector('.undoAction').classList.add('disabled');
		document.querySelector('.redoAction').classList.add('disabled');
	}catch(e){
		// don't worry if undo ui is not available yet
	}
}

function undoLastAction() {
	if(currentAction <= 0) return; // No action to undo!
	currentAction--;
	undoActions[currentAction].undo();
	if(currentAction <= 0) {
		document.querySelector('.undoAction').classList.add('disabled');
	}
	document.querySelector('.redoAction').classList.remove('disabled');
}

try{
	document.querySelector('.undoAction').classList.add('disabled');
}catch(e){
	return; // some languages do not yet support undo/redo
}

function redoLastAction() {
	if(currentAction >= undoActions.length) return; // No action to redo!
	undoActions[currentAction].redo();
	currentAction++;
	if(currentAction >= undoActions.length) {
		document.querySelector('.redoAction').classList.add('disabled');
	}
	document.querySelector('.undoAction').classList.remove('disabled');
}

try{
	document.querySelector('.redoAction').classList.add('disabled');
}catch(e){
	return; // some languages do not yet support undo/redo
}

function addUndoAction(action) {
	if(!action.hasOwnProperty('redo') || !action.hasOwnProperty('undo')) {
		console.error("Tried to add invalid action!");
		return;
	}
	if(currentAction < undoActions.length) {
		// Truncate any actions available to be redone
		undoActions.length = currentAction;
	} else if(currentAction >= MAX_UNDO) {
		// Drop the oldest action
		currentAction--;
		undoActions.shift();
	}
	undoActions[currentAction] = action;
	currentAction++;
	document.querySelector('.undoAction').classList.remove('disabled');
	document.querySelector('.redoAction').classList.add('disabled');
	// console.log('undo stack: %s', undoActions.length);
}

wb.history = {
	add: addUndoAction,
	undo: undoLastAction,
	redo: redoLastAction,
	clear: clearUndoStack
}

Event.on('.undoAction', 'click', ':not(.disabled)', undoLastAction);
Event.on('.redoAction', 'click', ':not(.disabled)', redoLastAction);
//begin short-cut implementation for redo and undo
Events.bind(document, 'keystroke.Ctrl+Z', undoLastAction);
Events.bind(document, 'keystroke.Ctrl+Y', redoLastAction);
//for mac user, cmd added 
Events.bind(document, 'keystroke.meta+Z', undoLastAction);
Events.bind(document, 'keystroke.meta+Y', redoLastAction);
//end short cut 
Event.on(document.body, 'wb-script-loaded', null, clearUndoStack);

})(wb);

/*end undo.js*/

/*begin ui.js*/
// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
// UI Chrome Section


function accordion(event){
    event.preventDefault();
    var open = document.querySelector('#block_menu .open');
    if (open){
        open.classList.remove('open');
    }
    if (open && open === event.wbTarget.nextSibling) return;
    event.wbTarget.nextSibling.classList.add('open');
}


function updateScriptsView(){
    var blocks = wb.findAll(document.body, '.scripts_workspace');
    var view = wb.find(document.body, '.scripts_text_view');
    wb.writeScript(blocks, view);
}
wb.updateScriptsView = updateScriptsView; 


function changeSocket(event) {
	// console.log("Changed a socket!");
	var oldValue = event.target.getAttribute('data-oldvalue');
	var newValue = event.target.value;
	if(oldValue === undefined) oldValue = event.target.defaultValue;
	// console.log("New value:", newValue);
	// console.log("Old value:", oldValue);
	event.target.setAttribute('data-oldvalue', newValue);
	var action = {
		undo: function() {
			event.target.value = oldValue;
			event.target.setAttribute('data-oldvalue', oldValue);
		},
		redo: function() {
			event.target.value = newValue;
			event.target.setAttribute('data-oldvalue', newValue);
		}
	};
	wb.history.add(action);
}


/* TODO list of undoable actions:
 -  Moving a step from position A to position B
 -  Adding a new block at position X
 -  Moving an expression from slot A to slot B
 -  Adding a new expression to slot X
 -  Editing the value in slot X (eg, using the colour picker, typing in a string, etc)
 -  Renaming a local expression/variable
 -  Deleting a step from position X
 -  Deleting an expression from slot X
 Break them down:
1. Replacing the block in the clipboard with a new block
2. Editing the literal value in slot X
3. Inserting a step at position X
4. Removing a step at position X
5. Inserting an expression into slot X
6. Removing an expression from slot X
 More detail:
 - Copy is 1
 - Cut is 1 and 4 or 1 and 6
 - Paste is 3 or 5
 - Drag-in is 3 or 5
 - Drag-around is 4 and 3 or 6 and 5
 - Drag-out is 4 or 6
 - Drag-copy is 3 or 5
*/

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

function copyCommand(evt) {
	// console.log("Copying a block in ui.js!");
	// console.log(this);
	var action = {
		copied: this,
		oldPasteboard: pasteboard,
		undo: function() {
			pasteboard = this.oldPasteboard;
		},
		redo: function() {
			pasteboard = this.copied;
		},
	};
	wb.history.add(action);
	action.redo();
}

function deleteCommand(evt) {
	// console.log("Deleting a block!");
	var action = {
		removed: this,
		// Storing parent and next sibling in case removing the node from the DOM clears them
		parent: this.parentNode,
		before: this.nextSibling,
		undo: function() {
			// console.log(this);
			if(wb.matches(this.removed,'.step')) {
				this.parent.insertBefore(this.removed, this.before);
			} else {
				this.parent.appendChild(this.removed);
			}
			Event.trigger(this.removed, 'wb-add');
		},
		redo: function() {
			Event.trigger(this.removed, 'wb-remove');
			this.removed.remove();
		},
	};
	wb.history.add(action);
	action.redo();
}

function cutCommand(evt) {
	// console.log("Cutting a block!");
	var action = {
		removed: this,
		// Storing parent and next sibling in case removing the node from the DOM clears them
		parent: this.parentNode,
		before: this.nextSibling,
		oldPasteboard: pasteboard,
		undo: function() {
			// console.log(this);
			if(wb.matches(this.removed,'.step')) {
				this.parent.insertBefore(this.removed, this.before);
			} else {
				this.parent.appendChild(this.removed);
			}
			Event.trigger(this.removed, 'wb-add');
			pasteboard = this.oldPasteboard;
		},
		redo: function() {
			Event.trigger(this.removed, 'wb-remove');
			this.removed.remove();
			pasteboard = this.removed;
		},
	};
	wb.history.add(action);
	action.redo();
}

function pasteCommand(evt) {
	// console.log(pasteboard);
	var action = {
		pasted: wb.cloneBlock(pasteboard),
		into: cmenuTarget.parentNode,
		before: cmenuTarget.nextSibling,
		undo: function() {
			Event.trigger(this.pasted, 'wb-remove');
			this.pasted.remove();
		},
		redo: function() {
			if(wb.matches(pasteboard,'.step')) {
				// console.log("Pasting a step!");
				this.into.insertBefore(this.pasted,this.before);
			} else {
				// console.log("Pasting an expression!");
				cmenuTarget.appendChild(this.pasted);
			}
			Event.trigger(this.pasted, 'wb-add');
		},
	};
	wb.history.add(action);
	action.redo();
}

function canPaste() {
	if(!pasteboard) return false;
	if(wb.matches(pasteboard,'.step') && !wb.matches(cmenuTarget,'.holder')) {
		return true;
	}
	if(wb.matches(pasteboard,'.expression') && wb.matches(cmenuTarget,'.holder')) {
		return true;
	}
	return false;
}

var pasteboard = null;
var cmenuCurrent = null;
var showContext = false;
var cmenuDisabled = false;
var cmenuTarget = null;

function cmenuitem_enabled(menuitem) {
	if(menuitem.enabled) {
		if(typeof(menuitem.enabled) == 'function') {
			return menuitem.enabled();
		} else return menuitem.enabled;
	}
	return true;
}


function buildContextMenu(options) {
	// console.log('building context menu');
	// console.log(options);
	var contextDiv = document.getElementById('context_menu');
	contextDiv.innerHTML = '';
	var menu = document.createElement('ul');
	var item;
	menu.classList.add('cmenu');
	for(var key in options) {
		if(options.hasOwnProperty(key) && options[key]) {
			item = document.createElement('li');
			if(cmenuitem_enabled(options[key])) {
				Event.on(item, "click", null, cmenuCallback(options[key].callback));
			} else {
				item.classList.add('disabled');
			}
			if(options[key].startGroup) {
				item.classList.add('topSep');
			}
			item.innerHTML = options[key].name;
			menu.appendChild(item);
		}
	}
	item = document.createElement('li');
	item.onclick = function(evt) {};
	item.innerHTML = 'Disable this menu';
	item.classList.add('topSep');
	Event.on(item, 'click', null, disableContextMenu);
	menu.appendChild(item);
	contextDiv.appendChild(menu);
}

function stackTrace() {
	var e = new Error('stack trace');
	var stack = e.stack.replace(/@.*\//gm, '@')
		.split('\n');
	// console.log(stack);
}

function closeContextMenu(evt) {
	var contextDiv = document.getElementById('context_menu');
	if(!wb.matches(evt.wbTarget, '#context_menu *')) {
		contextDiv.style.display = 'none';
	}
}

function handleContextMenu(evt) {
	// console.log('handling context menu');
	stackTrace();
	//if(!showContext) return;
	// console.log(evt.clientX, evt.clientY);
	// console.log(evt.wbTarget);
	if(cmenuDisabled || wb.matches(evt.wbTarget, '.block_menu_wrapper *')) return;
	else if(false);
	else if(wb.matches(evt.wbTarget, '.block:not(.scripts_workspace) *')) {
		setContextMenuTarget(evt.wbTarget);
		buildContextMenu(block_cmenu);
	} else return;
	showContextMenu(evt.clientX, evt.clientY);
	evt.preventDefault();
}

function setContextMenuTarget(target) {
	cmenuTarget = target;
	while(!wb.matches(cmenuTarget, '.block') && !wb.matches(cmenuTarget, '.holder')) {
		// console.log(cmenuTarget);
		cmenuTarget = cmenuTarget.parentNode;
		if(cmenuTarget.tagName == 'BODY') {
			console.error("Something went wrong with determining the context menu target!");
			cmenuTarget = null;
			contextDiv.style.display = 'none';
		}
	}
}

function showContextMenu(atX, atY) {
	// console.log('showing context menu');
	var contextDiv = document.getElementById('context_menu');
	contextDiv.style.display = 'block';
	contextDiv.style.left = atX + 'px';
	contextDiv.style.top = atY + 'px';
}

function cmenuCallback(fcn) {
	return function(evt) {
		// console.log(cmenuTarget);
		fcn.call(cmenuTarget,evt);
		var contextDiv = document.getElementById('context_menu');
		contextDiv.style.display = 'none';
		evt.preventDefault();
	};
}

function disableContextMenu(evt) {
	cmenuDisabled = true;
	var enableBtn = document.querySelector('.cmenuEnable');
	enableBtn.style.display = '';
	var contextDiv = document.getElementById('context_menu');
	contextDiv.style.display = 'none';
}

function enableContextMenu(evt) {
	cmenuDisabled = false;
	var enableBtn = document.querySelector('.cmenuEnable');
	enableBtn.style.display = 'none';
}

var block_cmenu = {
	//expand: {name: 'Expand All', callback: dummyCallback},
	//collapse: {name: 'Collapse All', callback: dummyCallback},
	cut: {name: 'Cut', callback: cutCommand},
	copy: {name: 'Copy', callback: copyCommand},
	//copySubscript: {name: 'Copy Subscript', callback: dummyCallback},
	paste: {name: 'Paste', callback: pasteCommand, enabled: canPaste},
	//cancel: {name: 'Cancel', callback: dummyCallback},
        delete: {name: 'Delete', callback: deleteCommand},
};

// Test drawn from modernizr
function is_touch_device() {
  return !!('ontouchstart' in window);
}

initContextMenus();

var defaultLangData  = {};
var localizationData = {};

var l10nHalfDone = false;
wb.l10nHalfDone = l10nHalfDone;

/* will be set true by either code in l10n.js or initLanguageFiles() */
initLanguageFiles();

// Build the Blocks menu, this is a public method
function menu(blockspec){
    var id_blocks = {};
    var blocks = blockspec.blocks;

    // put blocks in data structure with block.id as key 
    for (var key in blocks) {
        var block = blocks[key];
        id_blocks[block.id] = block;
    }

    // store blocks temporarily in defaultLangData
    blockspec.blocks = id_blocks;
    defaultLangData[blockspec.sectionkey] = blockspec;

}

function populateMenu() {
	for (var key in defaultLangData) {

        //default data
        var blockspec = defaultLangData[key];

        //read in from localized file
        var l10nData = localizationData[blockspec.sectionkey];
 
        //overwrite attributes in blockspec
        wb.overwriteAttributes(blockspec, l10nData);

		var title = blockspec.name;
        var sectionKey = blockspec.sectionkey.replace(/\W/g, '');
        var specs = blockspec.blocks;
        var help = blockspec.help !== undefined ? blockspec.help : '';
        edit_menu(title, sectionKey, specs, help);
	}
}

function edit_menu(title, sectionKey, specs, help, show){
    var group = title.toLowerCase().split(/\s+/).join('');
    var submenu = document.querySelector('.' + sectionKey + '+ .submenu');
    if (!submenu){
        var header = wb.elem('h3', {'class': sectionKey + ' accordion-header', 'id': 'group_'+sectionKey}, title);
        submenu = wb.elem('div', {'class': 'submenu block-menu accordion-body'});
        var description = wb.elem('p', {'class': 'accordion-description'}, help);
        var blockmenu = document.querySelector('#block_menu');
        blockmenu.appendChild(header);
        blockmenu.appendChild(submenu);
        submenu.appendChild(description);
    }
    for (var key in specs) {
        var spec = specs[key];
        spec.group = sectionKey;
        spec.isTemplateBlock = true;
        submenu.appendChild(wb.Block(spec));
    }
}

function initLanguageFiles(){
    // pulled from workspace.js, one file below in the dist/javascript.js
    var language = location.pathname.match(/\/([^/.]*)\.html/)[1];

    //gets language locale code. en, es, de, etc.
    var locale = (navigator.userLanguage || navigator.language || "en-US").substring(0,2);

    // get list of paths of localized language files for language
    var listFiles;

    if ( (typeof(l10nFiles) != "undefined") && (typeof(l10nFiles[language]) != "undefined") )
        listFiles = l10nFiles[language][locale];

    // if no localized files exist 
    if (!listFiles) {
        if (l10nHalfDone) {
            populateMenu();
        } else {
            l10nHalfDone = true;
        }

        return;
    }

    // open all relevent localized files for language 
    listFiles.forEach(function(name, idx){
        ajax.get('languages/' + language + '/' + 'localizations' + '/' + locale + '/' + name +'.json', function(json){
            var lang = JSON.parse(json);

            var id_blocks = {};
            var blocks = lang.blocks;

            // put blocks into proper structure. resembles blockRegistry 
            for (var key in blocks) {
                var block = blocks[key];
                id_blocks[block.id] = block;
            }

            lang.blocks = id_blocks;
            localizationData[lang.sectionkey] = lang;

            // if this is the last file that needs to be retrieved (this step is done)
            if ( idx === (listFiles.length - 1 )) {
                if (wb.l10nHalfDone) {
                    populateMenu();
                } else {
                    wb.l10nHalfDone = true;
                }
            }

        }, function(xhr, status){
            console.error('Error in ajax.get:', status);
        });

    });
}

function initContextMenus() {
	Event.on(document.body, 'contextmenu', null, handleContextMenu);
	Event.on(document.body, 'mouseup', null, closeContextMenu);
	Event.on('.cmenuEnable', 'click', null, enableContextMenu);
	document.querySelector('.cmenuEnable').style.display = 'none';
}

// functions to show various mobile views

function handleShowButton(button, newView){
	// stop result
	wb.clearStage();
	// enable previous button, disable current button
	var currentButton = document.querySelector('.current-button');
	if (currentButton){
		currentButton.classList.remove('current-button');
	}
	button.classList.add('current-button');
	//slide old view out, slide new view in
	var oldView = document.querySelector('.current-view');
	oldView.classList.remove('current-view');
	oldView.style.transitionDuration = '0.5s';
	oldView.style.left = '-100%';
	newView.classList.add('current-view');
	newView.style.transitionDuration = '0.5s';
	newView.style.left = '0';
	Event.once(document.body, 'transitionend', null, function(){
		// console.log('transitionend: %o', oldView);
		oldView.style.transitionDuration = '0s';
		oldView.style.left = '100%';
	});
}

function showFiles(evt){
	handleShowButton(evt.target, document.querySelector('.files'));
}

function showBlocks(evt){
	handleShowButton(evt.target, document.querySelector('.block_menu_wrapper'));
}

function showScript(evt){
	handleShowButton(evt.target, document.querySelector('.workspace'));
}

function showResult(evt){
	handleShowButton(evt.target, document.querySelector('.results'));
	Event.once(document.body, 'transitionend', null, wb.runCurrentScripts);
}

/* Search filter */

function highlightSearch(event) {
	var form = document.querySelector('#search > form');
	form.style.border = "1px solid #FFA500";
}

function unhighlightSearch(event) {
	var form = document.querySelector('#search > form');
	form.style.border = "1px solid #CCC";
}

Event.on(document.body, 'change', 'input', changeSocket);
Event.on('#block_menu', 'click', '.accordion-header', accordion);
// Event.on('.tabbar', 'click', '.chrome_tab', tabSelect);

Event.on('#search_text', 'focus', null, highlightSearch);
Event.on('#search_text', 'blur', null, unhighlightSearch);

if (document.body.clientWidth < 361){
	// console.log('mobile view');
	Event.on('.show-files', 'click', null, showFiles);
	Event.on('.show-blocks', 'click', null, showBlocks);
	Event.on('.show-script', 'click', null, showScript);
	Event.on('.show-result', 'click', null, showResult);
	document.querySelector('.show-script').classList.add('current-button');
	document.querySelector('.workspace').classList.add('current-view');
}
if (document.body.clientWidth > 360){
	// console.log('desktop view');
	Event.on(document.body, 'change', 'input', updateScriptsView);
	Event.on(document.body, 'wb-modified', null, updateScriptsView);
}

wb.menu = menu;
wb.populateMenu = populateMenu;
wb.l10nHalfDone = l10nHalfDone;

})(wb);

/*end ui.js*/

/*begin workspace.js*/
//The Workspace block is created with the function createWorkspace() in
//this file. The createWorkspace() function is called in file.js

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
	'use strict';

	function clearScripts(event, force){
		if (force || confirm('Throw out the current script?')){
			var workspace = document.querySelector('.scripts_workspace')
            var path = location.href.split('?')[0];
            history.pushState(null, '', path);
			workspace.parentElement.removeChild(workspace);
			wb.scriptModified = false;
			wb.scriptLoaded = false;
			wb.loaded = false;
			wb.clearStage();
			createWorkspace('Workspace');
			document.querySelector('.scripts_text_view').innerHTML = '';
			wb.history.clear();
			wb.resetSeqNum();
			delete localStorage['__' + wb.language + '_current_scripts'];
		}
	}
	
	function loadExample(event){
		var path = location.href.split('?')[0];
		path += "?example=" + event.target.dataset.example;
		if (wb.scriptModified){
			if (confirm('Throw out the current script?')){
				wb.scriptModified = false;
				wb.loaded = false;
				history.pushState(null, '', path);
				Event.trigger(document.body, 'wb-state-change');
			}
		}else{
			wb.scriptModified = false;
			wb.loaded = false;
			history.pushState(null, '', path);
			Event.trigger(document.body, 'wb-state-change');
		}
	}

	function handleStateChange(event){
		// hide loading spinner if needed
		console.log('handleStateChange');
		hideLoader();
		var viewButtons = document.querySelectorAll('.views + .sub-menu .toggle');
		wb.queryParams = wb.urlToQueryParams(location.href);
		if (wb.queryParams.view === 'result'){
			document.body.classList.add('result');
			document.body.classList.remove('editor');
			for(var i = 0; i < viewButtons.length; i++) {
				viewButtons[i].classList.add('disabled');
			}
			wb.view = 'result';
		}else{
			document.body.classList.remove('result');
			document.body.classList.add('editor');
			for(var i = 0; i < viewButtons.length; i++) {
				viewButtons[i].classList.remove('disabled');
			}
			wb.view = 'editor';
		}
		if (wb.queryParams.embedded === 'true'){
			document.body.classList.add('embedded');
		}else{
			document.body.classList.remove('embedded');
		}
		// handle loading example, gist, currentScript, etc. if needed
	    wb.loadCurrentScripts(wb.queryParams);
	    // If we go to the result and can run the result inline, do it
	    // if (wb.view === 'result' && wb.runCurrentScripts){
	    // 	// This bothers me greatly: runs with the console.log, but not without it
	    // 	console.log('running current scripts');
	    // 	runFullSize();
	    // }else{
	    // 	if (wb.view === 'result'){
		   //  	// console.log('we want to run current scripts, but cannot');
		   //  }else{
		   //  	runWithLayout();
		   //  	// console.log('we do not care about current scripts, so there');
		   //  }
	    // }
	    if (wb.toggleState.scripts_text_view){
	    	wb.updateScriptsView();
	    }
	    if (wb.toggleState.stage || wb.view === 'result'){
	    	// console.log('run current scripts');
	    	wb.runCurrentScripts();
	    }else{
	    	wb.clearStage();
	    }
	}

	function hideLoader(){
	    var loader = document.querySelector('#block_menu_load');
	    if (loader){
	        loader.parentElement.removeChild(loader);
	    }		
	}

	function historySwitchState(state, clearFiles){
		//console.log('historySwitchState(%o, %s)', state, !!clearFiles);
		var params = wb.urlToQueryParams(location.href);
		if (state !== 'result'){
			delete params['view'];
		}else{
			params.view = state;
		}
		if (clearFiles){
			delete params['gist'];
			delete params['example'];
		}
		history.pushState(null, '', wb.queryParamsToUrl(params));
		Event.trigger(document.body, 'wb-state-change');
	}


	window.addEventListener('unload', wb.saveCurrentScripts, false);
	window.addEventListener('load', wb.loadRecentGists, false);

	// Allow saved scripts to be dropped in
	function createWorkspace(name){
	    console.log('createWorkspace');
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
		wb.wireUpWorkspace(workspace);
	}
	
	function wireUpWorkspace(workspace){
		workspace.addEventListener('drop', wb.getFiles, false);
		workspace.addEventListener('dragover', function(event){event.preventDefault();}, false);
		wb.findAll(document, '.scripts_workspace').forEach(function(ws){
	        ws.parentElement.removeChild(ws); // remove any pre-existing workspaces
	    });
		document.querySelector('.workspace').appendChild(workspace);
		workspace.querySelector('.contained').appendChild(wb.elem('div', {'class': 'drop-cursor'}));
		// wb.initializeDragHandlers();
		Event.trigger(document.body, 'wb-workspace-initialized');
	};


	function handleDragover(evt){
	    // Stop Firefox from grabbing the file prematurely
	    event.stopPropagation();
	    event.preventDefault();
	    event.dataTransfer.dropEffect = 'copy';
	}

	function disclosure(event){
		var block = wb.closest(event.wbTarget, '.block');
		if (block.dataset.closed){
			delete block.dataset.closed;
		}else{
			block.dataset.closed = true;
		}
	}

	function handleScriptLoad(event){
		wb.scriptModified = false;
		wb.scriptLoaded = true;
		if (wb.view === 'result'){
			// console.log('run script because we are awesome');
			if (wb.windowLoaded){
				// console.log('run scripts directly');
				wb.runCurrentScripts();
			}else{
				// console.log('run scripts when the iframe is ready');
				window.addEventListener('load', function(){
				// 	// console.log('in window load, starting script: %s', !!wb.runCurrentScripts);
				 	wb.runCurrentScripts();
				 }, false);
			}
		// }else{
		// 	console.log('do not run script for some odd reason: %s', wb.view);
		}
		// clear undo/redo stack
		console.log('script loaded');
	}

	function handleScriptModify(event){
		// still need modified events for changing input values
		if (!wb.scriptLoaded) return;
		if (!wb.scriptModified){
			wb.scriptModified = true;
			wb.historySwitchState(wb.view, true);
		}
	}

	// function runFullSize(){
	// 	['#block_menu', '.workspace', '.scripts_text_view'].forEach(function(sel){
	// 		wb.hide(wb.find(document.body, sel));
	// 	});
	// 	wb.show(wb.find(document.body, '.stage'));
	// }

	// function runWithLayout(){
	// 	['#block_menu', '.workspace'].forEach(function(sel){
	// 		wb.show(wb.find(document.body, sel));
	// 	});
	// 	['stage', 'scripts_text_view', 'tutorial', 'scratchpad', 'scripts_workspace'].forEach(function(name){
	// 		toggleComponent({detail: {name: name, state: wb.toggleState[name]}});
	// 	});
	// }

	function toggleComponent(evt){
		var component = wb.find(document.body, '.' + evt.detail.name);
		if (!component) return;
		evt.detail.state ? wb.show(component) : wb.hide(component);
		var results = wb.find(document.body, '.results');
		// Special cases
		switch(evt.detail.name){
			case 'stage':
				if (evt.detail.state){
					wb.show(results);
				}else{
					wb.clearStage();
					if (!wb.toggleState.scripts_text_view){
						wb.hide(results);
					}
				}
				break;
			case 'scripts_text_view':
				if (evt.detail.state){
					wb.show(results);
					wb.updateScriptsView();
				}else{
					if (!wb.toggleState.stage){
						wb.hide(results);
					}
				}
				break;
			case 'tutorial':
			case 'scratchpad':
			case 'scripts_workspace':
				if (! (wb.toggleState.tutorial || wb.toggleState.scratchpad || wb.toggleState.scripts_workspace)){
					wb.hide(wb.find(document.body, '.workspace'));
				}else{
					wb.show(wb.find(document.body, '.workspace'));
				}
			default:
				// do nothing
				break;
		}
		if (wb.toggleState.stage){
			// restart script on any toggle
			// so it runs at the new size
			wb.runCurrentScripts();
		}

	}

	Event.on(document.body, 'wb-toggle', null, toggleComponent);

	window.addEventListener('popstate', function(evt){
		console.log('popstate event');
		Event.trigger(document.body, 'wb-state-change');
	}, false);

	window.addEventListener('load', function(evt){
		console.log('load event');
		Event.trigger(document.body, 'wb-state-change');
	})

	// Kick off some initialization work
	Event.once(document.body, 'wb-workspace-initialized', null, function initHistory(){
		console.log('workspace ready');
		wb.windowLoaded = true;
		wb.workspaceInitialized = true;
		Event.trigger(document.body, 'wb-state-change');
	}, false);
	Event.once(document.body, 'wb-workspace-initialized', null, wb.initializeDragHandlers);

	Event.on('.clear_scripts', 'click', null, clearScripts);
	Event.on('.edit-script', 'click', null, function(event){
		wb.historySwitchState('editor');
	});
	Event.on(document.body, 'click', '.load-example', loadExample);
	Event.on(document.body, 'wb-state-change', null, handleStateChange);
	Event.on('.save_scripts', 'click', null, wb.saveCurrentScriptsToGist);
	Event.on('.download_scripts', 'click', null, wb.createDownloadUrl);
	Event.on('.load_from_gist', 'click', null, wb.loadScriptsFromGistId);
	Event.on('.restore_scripts', 'click', null, wb.loadScriptsFromFilesystem);
	Event.on('.workspace', 'click', '.disclosure', disclosure);
	Event.on('.workspace', 'dblclick', '.locals .name', wb.changeName);
	Event.on('.workspace', 'keypress', 'input', wb.resize);
	Event.on('.workspace', 'change', 'input, select', function(event){
		Event.trigger(document.body, 'wb-modified', {block: event.wbTarget, type: 'valueChanged'});
	});
	Event.on(document.body, 'wb-script-loaded', null, handleScriptLoad);
	Event.on(document.body, 'wb-modified', null, handleScriptModify);
	Event.on('.run-scripts', 'click', null, function(){
        wb.historySwitchState('result');
    });
    Event.on('.show-ide', 'click', null, function(){
    	wb.historySwitchState('ide');
    });
    Event.on('.escape-embed', 'click', null, function(){
    	// open this in a new window without embedded in the url
    	var params = wb.urlToQueryParams(location.href);
    	delete params.embedded;
    	var url = wb.queryParamsToUrl(params);
    	var a = wb.elem('a', {href: url, target: '_blank'});
    	a.click();
    });
    // autorun buttons
    Event.on('.run-script', 'click', null, function(){
    	document.body.classList.add('running');
    	wb.runCurrentScripts(true);
    });
    Event.on('.stop-script', 'click', null, function(){
    	document.body.classList.remove('running');
    	wb.clearStage();
    });
    Event.on('.autorun-script-on', 'click', null, function(){
    	// turn it off
    	document.body.classList.add('no-autorun');
    	wb.autorun = false;
    	wb.clearStage();
    });
    Event.on('.autorun-script-off', 'click', null, function(){
    	document.body.classList.remove('no-autorun');
    	wb.autorun = true;
    	wb.runCurrentScripts(true);
    });

	wb.language = location.pathname.match(/\/([^/.]*)\.html/)[1];
	wb.loaded = false;
	wb.clearScripts = clearScripts;
	wb.historySwitchState = historySwitchState;
	wb.createWorkspace = createWorkspace;
	wb.wireUpWorkspace = wireUpWorkspace;
})(wb);

/*end workspace.js*/

/*begin blockprefs.js*/
// User block preferences
//
// Allows the user to hide groups of blocks within the interface
// Settings are stored in LocalStorage and retreived each
// time the page is loaded.
/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb){
'use strict';
	//save the state of the settings link
	var closed = true;
	var language = wb.language;
	var settingsLink;
	//add a link to show the show/hide block link
	function addSettingsLink(callback) {
		// console.log("adding settings link");
		var block_menu = document.querySelector('#block_menu');
		var settingsLink = document.createElement('a');
		settingsLink.href = '#';
		settingsLink.style.float = 'right';
		settingsLink.appendChild(document.createTextNode('Show/Hide blocks'));
		settingsLink.addEventListener('click', toggleCheckboxDisplay);
		block_menu.appendChild(settingsLink);
		return settingsLink;
	}

	//create the checkboxes next to the headers
	function createCheckboxes() {
		var block_headers = document.querySelectorAll('.accordion-header');
		[].forEach.call(block_headers, function (el) {
			var checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = '1';
			checkbox.style.float = 'right';
			checkbox.style.display = 'none';
			checkbox.checked = 'true';
			checkbox.addEventListener('click', hideBlocks);
			el.appendChild(checkbox);
		});
	};

	//settings link has been clicked
	function toggleCheckboxDisplay() {
		// console.log('toggle checkboxes called');
		var checkboxes = document.querySelectorAll('.accordion-header input[type="checkbox"]');
		var block_menu = document.querySelector('#block_menu');
		var display;
		block_menu.classList.toggle("settings");
		if (closed) {
			closed = false;
			display = 'inline';
			settingsLink.innerHTML = 'Save';
		} else {
			//save was clicked
			closed = true;
			display = 'none'
			settingsLink.innerHTML = 'Show/Hide blocks';
			//save the settings
			saveSettings();
		}
		[].forEach.call(checkboxes, function (el) {
			el.style.display = display;
		});
	};

	//checkbox has been clicked
	function hideBlocks(e) {
		var parent = this.parentNode;
		if (this.checked) {
			parent.classList.remove('hidden');
		} else {
			parent.classList.add('hidden');
		}
		//save the settings
		saveSettings();
		e.stopPropagation();
	};

	//save the block preferences to local storage
	function saveSettings(){
		var checkboxes = document.querySelectorAll('.accordion-header input[type="checkbox"]');
		var toSave = {};
		[].forEach.call(checkboxes,	function (el) {
			var id = el.parentNode.id;
			var checked = el.checked;
			toSave[id] = checked;
		});
		// console.log("Saving block preferences", toSave);
		localStorage['__' + language + '_hidden_blocks'] = JSON.stringify(toSave);
	};

	//load block display from local storage
	function loadSettings(){
		var storedData = localStorage['__' + language + '_hidden_blocks'];
		var hiddenBlocks = storedData == undefined ? [] : JSON.parse(storedData);
		window.hbl = hiddenBlocks;
		// console.log("Loading block preferences", hiddenBlocks);
		Object.keys(hiddenBlocks).forEach(function(key){
			if(!hiddenBlocks[key]){
				var h3 = document.getElementById(key);
				if(h3 != null){
					var check = h3.querySelector('input[type="checkbox"]');
					check.checked = false;
					h3.classList.add('hidden');
				}
			}
		});
	}

	//after initliazation, create the settings and checkboxes
	function load(){
		settingsLink = addSettingsLink();
		createCheckboxes();
		loadSettings();
	}

	//onload initialize the blockmanager
	window.onload = load;
})(wb);

/*end blockprefs.js*/

/*begin menu.js*/
/* Note: LocalStorage is persistent, for things you want to have available
   even if the user leaves the site or restarts their browser. SessionStorage
   is volatile and will be deleted if they restart the browser.*/

// global variable wb is initialized in the HTML before any javascript files
// are loaded (in template/template.html)
(function(wb, Event){

	var toggleState = {};
	if (localStorage.toggleState){
		toggleState = JSON.parse(localStorage.toggleState);
	}

	function handleToggle(evt){
		var button = evt.target;
		var name = button.dataset.target;
		var isOn = !getState(name);
		toggleState[name] = isOn;
		if (isOn){
			button.classList.remove('icon-unchecked');
			button.classList.add('icon-check');
		}else{
			button.classList.add('icon-unchecked');
			button.classList.remove('icon-check');
		}
		Event.trigger(document.body, 'wb-toggle', {name: name, state: isOn});
		localStorage.toggleState = JSON.stringify(toggleState);
	}

	Event.on(document.body, 'click', '.toggle:not(.disabled)', handleToggle);

	function getState(name){
		if (toggleState[name] === undefined){
			toggleState[name] = true;
		}
		return toggleState[name];
	}

	// initialize toggle states

	function initializeToggleStates(evt){
		wb.findAll(document.body, '.toggle').forEach(function(button){
			var name = button.dataset.target;
			var isOn = getState(name);
			if (isOn){
				button.classList.add('icon-check');
			}else{
				button.classList.add('icon-unchecked');
			}
			Event.trigger(document.body, 'wb-toggle', {name: name, state: isOn});
		});
	}

	Event.once(document.body, 'wb-workspace-initialized', null, initializeToggleStates);

	wb.toggleState = toggleState; // treat as read-only

})(wb, Event);
/*end menu.js*/

/*begin languages/arduino/arduino.js*/
(function(){

// This file depends on the runtime extensions, which should probably be moved into this namespace rather than made global

// Remove stage menu item until menus get templatized
var stageMenu = document.querySelector('[data-target=stage]').parentElement;
stageMenu.parentElement.removeChild(stageMenu);

// expose these globally so the Block/Label methods can find them
wb.choiceLists = {
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

wb.setDefaultScript = function(script){
    window.defaultscript = script;
};

wb.loadDefaultScript = function(script){
    if (typeof window.defaultscript != 'undefined'){
        loadScriptsFromObject(window.defaultscript);
    }
};

wb.writeScript = function(blocks, view){
    var code = blocks.map(function(elem){
        return wb.codeFromBlock(elem);
    }).join('\n');
    view.innerHTML = '<pre class="language-arduino">' + code + '</pre>';
};

wb.runCurrentScripts = function(){ /* do nothing */ };
wb.clearStage = function(){ /* do nothing */ };


wb.wrap = function(blocks){
        // update size of frame
        return blocks.map(function(elem){
          return wb.codeFromBlock(elem);
        }).join('\n\n');
};


function clearScriptsDefault(event, force){
  clearScripts(event, force);
  loadDefaultScript();
}

document.querySelector('.clear_scripts').addEventListener('click', clearScriptsDefault, false);



var defaultscript=[{"klass":"control","label":"Global Settings","script":"/*Global Settings*/\u000a\u000a[[next]]\u000a\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Setup - When program starts","script":"void setup()\u000a{\u000a[[next]]\u000a}\u000a","containers":0,"trigger":true,"sockets":[],"contained":[],"next":""},{"klass":"control","label":"Main loop","script":"void loop()\u000a{\u000a[[1]]\u000a}\u000a","containers":1,"trigger":true,"sockets":[],"contained":[""],"next":""}];
wb.setDefaultScript(defaultscript);


})();

/*end languages/arduino/arduino.js*/

/*begin languages/arduino/boolean.json*/
wb.menu({
	"sectionkey": "boolean",
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
	"sectionkey": "controls",
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
	"sectionkey": "digitalio",
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
                    "type": "number",
                    "options": "digitalpins",
                    "value": 0
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
                    "type": "number",
                    "options": "digitalpins",
                    "value": 0
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
                    "type": "number",
                    "options": "analoginpins",
                    "value": "A0"
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
                    "value": 0
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
                    "type": "number",
                    "options": "pwmpins",
                    "value": 3
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
	"sectionkey": "math",
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
	"sectionkey": "serialio",
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
                    "type": "number",
                    "options": "baud",
                    "value": "9600"
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
	"sectionkey": "timing",
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
	"sectionkey": "variables",
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

/*begin l10n.js*/
(function(wb){

/* old Obj will be overwritten by newObj */
function overwriteAttributes(oldObj, newObj) {
 
    if (!newObj || ! oldObj)
        return;

    var oldObjQueue = [];
    var newObjQueue = [];
    oldObjQueue.push(oldObj);
    newObjQueue.push(newObj);

    while (oldObjQueue.length && newObjQueue.length) {

        // pop object to investigate. 
        var currOldObj = oldObjQueue.pop();
        var currNewObj = newObjQueue.pop();

        // Objects: get strings values of keys in current object     
        // Arrays:  get the integer values of all indexes into array 
        //          (this is obviously 0...n)     
        // 
        // This isn't the cleanest approach, but it keeps me from creating
        // a more complex structure with typeof array or typeof object
        var keys = Object.keys(currNewObj);

        // iterate through all keys 
        for (var idx in keys) {
            var key = keys[idx];

            if (typeof currNewObj[key] === "object" && currNewObj[key] !== null) {

                // if it's an object, queue it to dive into it later
                newObjQueue.push(currNewObj[key]);
                oldObjQueue.push(currOldObj[key]);

            } else {

                // if anything but object, overwrite value from new object in old object 
                currOldObj[key] = currNewObj[key];
            }
        }
    }
}

wb.overwriteAttributes = overwriteAttributes;

})(wb);

if (wb.l10nHalfDone) {
    // console.log("l10n populating");
    wb.populateMenu();
} else {
    // console.log("l10n done");
    wb.l10nHalfDone = true;
}
/*end l10n.js*/
