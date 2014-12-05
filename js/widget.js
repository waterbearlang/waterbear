/* Custom Element Widgets for layout and HTML enhancement */

(function(){
'use strict';
    // var elem = dom.html;

// Layout elements

var SearchProto = Object.create(HTMLElement.prototype);
window.WBSearch = document.registerElement('wb-search', {prototype: SearchProto});

var AccordionProto = Object.create(HTMLElement.prototype);
window.WBAccordion = document.registerElement('wb-accordion', {prototype: AccordionProto});

/* For HBox, VBox, and Splitter:

  * Use % widths (or heights)
  * Splitter auto-adapts to vertical or horizontal
  * On drag, calculate new %, use calc() to remove splitter width
  * On document load, restore saved %
  * On document unload, save % to localStorage
  * On double-click on splitter, collapse to the left or top
  * Pass through initial sizing from attributes, but over-ride with user preferences
  * Dragging all the way to either edge collapses the hidden panel
  * ++should++ just work on document resize

*/

var HBoxProto = Object.create(HTMLElement.prototype);
window.WBHBox = document.registerElement('wb-hbox', {prototype: HBoxProto});

var VBoxProto = Object.create(HTMLElement.prototype);
window.WBVBox = document.registerElement('wb-vbox', {prototype: VBoxProto});

/******************************
*
* SPLITTER
*
*******************************/

var SplitterProto = Object.create(HTMLElement.prototype);
SplitterProto.attachedCallback = function splitterAttached(){
    console.log('splitting up');
    this.parentElement.setAttribute('split', 'true');
};
SplitterProto.detachedCallback = function splitterDetached(){
    console.log('unsplitting my parent: %s', this.parentElement);
    this.parentElement.removeAttribute('split');
};
window.WBSplitter = document.registerElement('wb-splitter', {prototype: SplitterProto});


document.addEventListener('childAdded', function(event){
    if (dom.matches(event.target, 'wb-hbox, wb-vbox')){
        console.log('%s added to %s', event.target, event.detail);
    }
}, false);
document.addEventListener('childRemoved', function(event){
    if (dom.matches(event.target, 'wb-hbox, wb-vbox')){
        console.log('%s removed from %s', event.target, event.detail);
    }
}, false);

var splitDragging = {
    direction: 'horizontal',
    parentBox: [0,0,0,0],
    startX: 0,
    startY: 0
};

$(document.body).draggable({selector: 'wb-splitter'}).on('draggable:start', 'wb-splitter', function(evt){
    console.log('start drag: %o', evt);
    var splitterBox = evt.target.getBoundingBox();
    splitDragging = {
        direction: $(evt.target).is('wb-hbox > wb-splitter') ? 'horizontal' : 'vertical',
        parentBox: evt.target.parentElement.getBoundingBox(),
        startX: splitterBox.x,
        startY: splitterBox.y
    };
}).on('draggable:drag', 'wb-splitter', function(evt){
    console.log('dragging: %o', evt);
}).on('draggable:stop', 'wb-splitter', function(evt){
});

// Observe child changes

var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){
        // send childAdded or childRemove event to parent element
        // should I filter this to only elements (otherwise text nodes will be included)?
        var parent = mutation.target;
        [].slice.apply(mutation.removedNodes).forEach(function(node){
            parent.dispatchEvent(new CustomEvent('removeChild', {
                bubbles: true,
                detail: node
            }));
        });
        [].slice.apply(mutation.addedNodes).forEach(function(node){
            parent.dispatchEvent(new CustomEvent('addChild', {
                bubbles: true,
                detail: node
            }));
        });
    });
});

var config = { childList: true, subtree: true };

observer.observe(document.body, config);

})();
