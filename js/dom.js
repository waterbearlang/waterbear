// DOM utilities

(function(global){
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';

    function html(name, attributes, children){
        return element(document.createElement(name), attributes, children);
    }

    function element(elem, attributes /* optional object */, children /* optional array, node, or string */){
        if (!children && attributes && (Array.isArray(attributes) ||
                attributes.nodeName ||
                typeof attributes === 'string')){
            children = attributes;
            attributes = null;
        }
        if (attributes){
            setAttributes(elem, attributes);
        }
        if (children){
            appendChildren(elem, children);
        }
        return elem;
    }

    function svg(name, attrs, children){
        return element(document.createElementNS(SVG_NS, name), attrs, children);
    }

    function setAttributes(elem, attributes){
        // keys must be strings
        // values can be strings, numbers, booleans, or functions
        if (attributes){
            Object.keys(attributes).forEach(function(key){
                if (attributes[key] === null || attributes[key] === undefined) return;
                if (typeof attributes[key] === 'function'){
                    var val = attributes[key](key, attributes);
                    if (val){
                        elem.setAttribute(key, val);
                    }
                }else{
                    elem.setAttribute(key, attributes[key]);
                }
            });
        }
        return elem; // for chaining
    }

    function appendChildren(elem, children){
        // Children can be a single child or an array
        // Each child can be a string or a node
        if (children){
            if (!Array.isArray(children)){
                children = [children]; // convenience, allow a single argument vs. an array of one
            }
            children.forEach(function(child){
                if (child.nodeName){
                    e.appendChild(child);
                }else{
                    // assumes child is a string
                    e.appendChild(document.createTextNode(child));
                }
            });
        }
        return elem;
    }

    function elemToObject(elem){
        var obj = {
            name: elem.tagName
        };
        if (elem.attributes && elem.attributes.length){
            var attributes = {};
            [].slice.call(elem.attributes).forEach(function(attr){
                attributes[attr.name] = attr.value;
            });
            obj.attributes = attributes;
        }
        if (elem.childNodes && elem.childNodes.length){
            obj.children = [].slice.call(elem.childNodes).map(function(child){
                if (child.nodeType === Node.ELEMENT_NODE){
                    return elemToObject(child);
                }else if(child.nodeType === Node.TEXT_NODE){
                    return node.textContent;
                }else{
                    return null; // we only care about element and text nodes
                }
            }).filter(function(child){ return !! child; }); // remove nulls
        }
        return obj;
    }

    function remove(elem){
        elem.parentElement.removeChild(elem);
    }

    function insertAfter(newElement, sibling){
        sibling.parentElement.insertBefore(newElement, sibling.nextElementSibling);
    }

   function closest(elem, selector){
        var e = elem;
        while(e){
            if (matches(e, selector)){
                return e;
            }
            if (!e.parentElement){
                throw new Error('Element has no parent, is it in the tree? ' + e);
                //return null;
            }
            e = e.parentElement;
        }
        return null;
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
        return [].slice.call(elem.querySelectorAll(selector));
    }

    function child(elem, selector){
        for (var i = 0; i < elem.children.length; i++){
            if (matches(elem.children[i], selector)){
                return elem.children[i];
            }
        }
        return null;
    }

    function children(elem, selector){
        return [].slice.call(elem.children).filter(function(child){
            return matches(child, selector);
        });
    }

    // like closest, but won't match itself
    function parent(elem, selector){
        // OK to return null
        try{
            return closest(elem.parentElement, selector);
        }catch(e){
            return null;
        }
    }

    // Remove namespace for matches
    var matches;
    if (document.body.matches){
        matches = function matches(elem, selector){ return elem.matches(selector); };
    }else if(document.body.mozMatchesSelector){
        matches = function matches(elem, selector){ return elem.mozMatchesSelector(selector); };
    }else if (document.body.webkitMatchesSelector){
        matches = function matches(elem, selector){ return elem.webkitMatchesSelector(selector); };
    }else if (document.body.msMatchesSelector){
        matches = function matches(elem, selector){ return elem.msMatchesSelector(selector); };
    }else if(document.body.oMatchesSelector){
        matches = function matches(elem, selector){ return elem.oMatchesSelector(selector); };
    }

    function addClass(elem, klass){
        /* Conditionally add class if element exists */
        if (elem){
            elem.classList.add(klass);
        }
    }

    function removeClass(elem, klass){
        /* Conditionall remove class if element exists */
        if (elem){
            elem.classList.remove(klass);
        }
    }

    function nextSibling(elem){
        /* conditionally returns next sibling if element exists */
        return elem ? elem.nextElementSibling : null;
    }

    function prevSibling(elem){
        /* conditionally returns previous sibling if element exists */
        return elem ? elem.previousElementSibling : null;
    }

    function toggleClass(elements, klass){
        if (!elements) return;
        if (Array.isArray(elements)){
            elements.forEach(function(elem){
                toggleClass(elem, klass);
            });
        }else{
            elements.classList.toggle(klass);
        }
    }

    function indexOf(child){
        var allChildren = [].slice.call(child.parentElement.children);
        return allChildren.indexOf(child);
    }

    global.dom = {
        html: html,
        svg: svg,
        elemToObj: elemToObject,
        remove: remove,
        insertAfter: insertAfter,
        matches: matches,
        find: find,
        findAll: findAll,
        child: child,
        children: children,
        closest: closest,
        parent: parent,
        addClass: addClass,
        removeClass: removeClass,
        prevSibling: prevSibling,
        nextSibling: nextSibling,
        toggleClass: toggleClass,
        indexOf: indexOf,
    };


})(this);
