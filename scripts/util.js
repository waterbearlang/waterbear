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
        if (!elem){
            console.log('no children of null with selector %s', selector);
            return [];
        }
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
