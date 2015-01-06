/* Custom Element Widgets for layout and HTML enhancement */

(function(){
'use strict';

// Layout elements

/*************************
 *
 *  SEARCH
 *
 *************************/

var SearchProto = Object.create(HTMLElement.prototype);
window.WBSearch = document.registerElement('wb-search', {prototype: SearchProto});

/*************************
 *
 *  ACCORDION
 *
 *************************/

var AccordionProto = Object.create(HTMLElement.prototype);

AccordionProto.open = function(){
    // If there are other accordions in this group open, close them
    var existing = this.parentElement.querySelector('wb-accordion[open=true]');
    if (existing){
        existing.close();
    }
    this.setAttribute('open', 'true');
}

AccordionProto.close = function(){
    this.removeAttribute('open');
}

AccordionProto.toggle = function(){
    if (this.getAttribute('open') === 'true'){
        this.close();
    }else{
        this.open();
    }
}

window.WBAccordion = document.registerElement('wb-accordion', {prototype: AccordionProto});

function accordionClick(event){
    event.preventDefault();
    dom.closest(event.target, 'wb-accordion').toggle();
}

event.on(document.body, 'click', 'wb-accordion > header', accordionClick);
event.on(document.body, 'tap', 'wb-accordion > header', accordionClick);

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
    // console.log('splitting up');
};
SplitterProto.detachedCallback = function splitterDetached(){
    // console.log('unsplitting my parent: %s', this.parentElement);
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
