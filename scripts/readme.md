# Waterbear Scripts

This is the implementation of Waterbear. It pulls the libraries and the plugins together, implements the IDE and script writing, etc.

## block.js

Initialize both menu (template) blocks and instance (script) blocks, maintain their state, serialize and deserialize them.

## drag.js

Waterbear has some fairly specific drag-and-drop requirements, and has to work across both desktop and mobile browsers, so it has its own custom dragging library for this. Since the time of writing this library, some libraries have added support across desktop and mobile browsers, so we should investigate using a more standard library at some point.

## event.js

Utilities for handling event delegation, normalization between touch and mouse/trackpad events, custom events, and tying events to blocks.

* Event.on
* Event.off
* Event.once
* Event.trigger

## launch.js

Minimal script to support different embed modes at load time

## queryparams

Parse the URL queries and make them available to the rest of the code. Used to determine embed mode, to load from gists, etc.

## ui.js

Support for various generic UI features in the IDE: buttons, accordion view, tab switching. Also has nascent support for the coming context menus. The block menus are built here.

## util.js

Simple utility methods and helpers. Some jQuery-ish replacements.
* wb.makeArray(arrayLike): turns an array-like into a true array
* wb.reposition(elem, pos): moves an absolutely positioned element
* wb.hide(elem)
* wb.show(elem)
* wb.resize(elem): resizes a text input based on the length of its content
* wb.dist(x1, y1, x2, y2): distance between two points using Pythagorean theorem
* wb.overlapRect(r1, r2): the area of overlap between two rects
* wb.rect(elem): utility for calling elem.getBoundingClientRect()
* wb.overlap(elem1, elem2): returns the area of overlap between two elements
* wb.area(elem): returns the area of an element
* wb.containedBy(target, container): returns whether the rect of target is at least 90% contained by the rect of container
* wb.closest(elem, selector): find nearest parent, or self, which matches selector, because this is one thing I really missed from jQuery
* wb.indexOf(elem): what is the index of this element in a list of its parents children?
* wb.find(elem, selector): return the first decendant that matches selector
* wb.findAll(elem, selector): returns a (true) array of all decendants that match selector
* wb.findChildren(elem, selector): find direct children which match selector as an array
* wb.findChild(elem, selector): find the first child which matches selector
* wb.elem(name, attributes, children): utility for dynamically creating DOM elements and structures
* wb.matches(elem, selector): does elem match selector?
* wb.jsonp(url, callback): minimal support for jsonp, should probably be replaced by a better library
## Note: global variable wb is initialized in the HTML before any javascript files are loaded (in template/template.html)

## uuid.js

uuid(): returns a universally unique identifier as a string

## workspace.js

This is where the IDE is defined and implemented, built around the framework provided by HTML in the [language].html file. Event handlers, load and save, switching views, downloading code, etc. are handled here.
