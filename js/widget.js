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

//depreciated
/*************************
 *
 *  ACCORDION
 *
 *************************/
/*
var AccordionProto = Object.create(HTMLElement.prototype);

AccordionProto.open = function(){
    // If there are other accordions in this group open, close them
    var existing = this.parentElement.querySelector('wb-accordion[open=true]');
    if (existing){
        existing.close();
    }
    this.setAttribute('open', 'true');
    this.scrollIntoView();

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

function accordionClick(evt){
    if (Event.distancePointerMoved > 5){
        return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    dom.closest(evt.target, 'wb-accordion').toggle();
    evt.target.scrollIntoView(true);
}

Event.on(document.body, 'editor:click', 'wb-accordion > header', accordionClick);
Event.on(document.body, 'editor:touchend', 'wb-accordion > header', accordionClick);

 */   
/*************************
 *
 *  Menu Selections
 *
 *************************/
    
var MenuProto = Object.create(HTMLElement.prototype);
    
MenuProto.select = function() {
    app.clearFilter();
    //hide the currently opened selection
    var existing = dom.find('wb-menu[open=true]');
    if(existing) {
        existing.deselect();
    }
    
    //highlight the new menu selection
    this.setAttribute('open','true');
    
    //reveal the block selection
    var type = this.getAttribute('class');
    var blocks = document.getElementById(type);
    blocks.setAttribute('open','true');
}

MenuProto.deselect = function() {
    app.clearFilter();
    this.removeAttribute('open');
    var type = this.getAttribute('class');
    var blocks = document.getElementById(type);
    blocks.removeAttribute('open');
}

MenuProto.toggle = function() {
    if (this.getAttribute('open') === 'true'){
        this.deselect();
    }else{
        this.select();
    }
}
window.WBMenu = document.registerElement('wb-menu', {prototype: MenuProto});
    
function sideMenuClick(evt) {
    if (Event.distancePointerMoved > 5){
        return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    dom.closest(evt.target,'wb-menu').toggle();
}
    
Event.on(document.body, 'editor:click', 'wb-menu > header', sideMenuClick);
Event.on(document.body, 'editor:touchend', 'wb-menu > header', sideMenuClick);   
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

//splitters removed so code is depreciated
/******************************
*
* SPLITTER
*
*******************************/
/*
var SplitterProto = Object.create(HTMLElement.prototype);
SplitterProto.attachedCallback = function splitterAttached(){
    // console.log('splitting up');
};
SplitterProto.detachedCallback = function splitterDetached(){
    // console.log('unsplitting my parent: %s', this.parentElement);
};
window.WBSplitter = document.registerElement('wb-splitter', {prototype: SplitterProto});


// Splitter dragging
var dragSplitter = null;
var prevPanel = null;
var nextPanel = null;
var direction = null;
var minPosition = 0;
var maxPosition = 0;
var slop = 0;
//FIXME: next value should be determined dynamically 
var splitterThickness = 8;

Event.on(document.body, 'ui:drag-start', 'wb-splitter', function(evt){
    dragSplitter = evt.target;
    direction = dragSplitter.parentElement.localName === 'wb-vbox' ? 'vertical' : 'horizontal';
    prevPanel = dragSplitter.previousElementSibling;
    var prevBox = prevPanel.getBoundingClientRect();
    nextPanel = dragSplitter.nextElementSibling;
    var nextBox = nextPanel.getBoundingClientRect();
    minPosition = direction === 'vertical' ? prevBox.top : prevBox.left;
    maxPosition = direction === 'vertical' ? nextBox.bottom : nextBox.right;
    slop = direction === 'vertical' ? evt.clientY - prevBox.bottom : evt.clientX - prevBox.right;
    // maxPosition = maxPosition - evt.target.thickness ;
});

Event.on(document.body, 'ui:dragging', null, function(evt){
    if (!dragSplitter) return;
    var currPos = direction === 'vertical' ? evt.clientY - slop : evt.clientX - slop;
    if (currPos > minPosition && currPos < maxPosition){
        prevPanel.style.flex = '0 0 ' + (currPos - minPosition) + 'px';
    }
});

Event.on(document.body, 'ui:drag-end', null, function(evt){
    // clear variables
    if (!dragSplitter) return;
    Event.trigger(prevPanel, 'wb-resize');
    Event.trigger(nextPanel, 'wb-resize');
    dragSplitter = null;
    prevPanel = null;
    nextPanel = null;
    direction = null;
    minPosition = 0;
    maxPosition = 0;
    slop = 0;
    // persist
    var splitters = dom.findAll('wb-splitter');
    localStorage.__splitterPositions = JSON.stringify(splitters.map(function(splitter){
        return getComputedStyle(splitter.previousElementSibling)['flex'];
    }));
});

Event.on(window, 'ui:load', null, function(evt){
    if (localStorage.__splitterPositions){
        var splitters = dom.findAll('wb-splitter');
        var positions = JSON.parse(localStorage.__splitterPositions);
        for (var i = 0; i < positions.length; i++){
            splitters[i].previousElementSibling.style.flex = positions[i];
        }
    }
});

Event.on(window, 'ui:dblclick', 'wb-splitter', function(evt){
    var panel = evt.target.previousElementSibling;
    var width = parseInt(getComputedStyle(panel)['flexBasis'], 10);
    if (width < 5){
        panel.style.flex = '';
    }else{
        panel.style.flex = '0 0 0';
    }
});*/


})();
