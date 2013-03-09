(function(global){
    //
    //
    // UTILITY FUNCTIONS
    //
    //

    wb.makeArray = function makeArray(arrayLike){
        return Array.prototype.slice.call(arrayLike);
    };

    wb.reposition = function reposition(elem, position){
        // put an absolutely positioned element in the right place
        // May need to take into account offsets of container
        elem.style.top = position.top;
        elem.style.bottom = position.bottom;
        console.log('if element looks wrong, fix it in reposition()');
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
        return wb.overlapRect(rect(elem1), rect(elem2));
    };


    wb.area = function area(elem){
        return elem.clientWidth * elem.clientHeight;
    };

    wb.containedBy = function containedBy(target, container){
        var targetArea = Math.min(wb.area(target), wb.area(container) * 0.90);
        return target.overlap(container) >= targetArea;
    };

    wb.cursorOver = function cursorOver(elem){
        var rect = elem.getBoundingClientRect();
        return currentPosition.left >= rect.left && currentPosition.left <= rect.right &&
           currentPosition.top >= rect.top && currentPosition.top <= rect.bottom;
    };

    wb.closest = function closest(elem, selector){
        while(elem){
            if (wb.matches(elem, selector)){
                return elem;
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

    if (document.body.matches){
        wb.matches = function matches(elem, selector){ return elem.matches(selector); };
    }else if(document.body.mozMatchesSelector){
        wb.matches = function matches(elem, selector){ return elem.mozMatchesSelector(selector); };
    }else if (document.body.webkitMatchesSelector){
        wb.matches = function matches(elem, selector){ return elem.webkitMatchesSelector(selector); };
    }else if (document.body.msMatchesSelector){
        wb.matches = function matches(elem, selector){ return elem.msMatchesSelector(selector); };
    }else if(document.body.oMatchesSelector){
        wb.matches = function matches(elem, selector){ return elem.oMatchesSelector(selector); };
    }




})(this);
