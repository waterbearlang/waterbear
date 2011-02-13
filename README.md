# Waterbear

Waterbear is a toolkit for making programming more accessible and fun. Not a language itself, but a block syntax inspired by Scratch (http://scratch.mit.edu/) that can be used to represent langauges. Waterbear's blocks drag and snap together, representing code that eliminates syntax errors much like garbage collection alleviates memory errors and bound checking helps prevent overrun errors.

Waterbear's system of draggable, snappable blocks, are built using clean HTML5, CSS3, and Javascript. The goal is not to slavishly duplicate Scratch, or to create a programming language, but to create a visual syntax tool that can be used with a variety of languages and projects.

The motivation is to reduce syntax errors in the same way that garbage collection has reduced memory errors, or bounds checking has reduced overrun errors. I have also been testing various programming systems on my own kids, and Scratch is the one tool they were able to pick up easily, both for creating projects and for reading/modifying other people's projects. Waterbear is a way of relaxing some of the restrictions imposed on Scratch, and opening it up to the web at large.

The look and feel of Waterbear differs from Scratch, which is implemented in Squeak Smalltalk's Morphic environment. Waterbear blocks are intended to use web technologies naturally, without trying to force them into a different paradigm. In other words, this project is attempting to create blocks in a web-centric way. Waterbear is designed to be easy to use on both desktop/laptop browsers and on iPads and smart phones.



I've been programming Javascript since 1997, pushing the envelope of what can be done. I was writing what are now called Ajax programs back in IE4.0. I'm excited that after years of being at the cutting edge of Javascript, I can't keep up with all of the JS changes and tools anymore. It's a great time to be working with open web technologies, and I'd like to share some of my enthusiasm.

## Todo

* ✓ Move from popup dialog to sidebar with zooming interface
* ✓ Remove all dragging, use selected element and click/touch
* ✓ Switch from jQuery to Zepto
* ✓ Get tap event working, not sure why it doesn't now (bad browser sniffing?)
* Zoom into script view
* Prevent clicks in inputs from bubbling
* Toggle between control views for different sprites / stage
* Toggle between script/skin/sound views for a specific sprite
* Visual distinctiveness of value blocks and slots (right/left for values, top/bottom of slots)
* Test on iPad (fixing drag'n'drop on touch devices requires research)
* Get rid of double-handling clicks (inserting multiple blocks per click)
* ✓ Reduce padding in value blocks
* Remove blocks delete key or trash icon
* Create a larger script workspace, with scrollbars
* Multiple script blocks (allows one per sprite, for instance)
* Higher-level description of a language
* Force blocks into two columns
* Fix position when dragging out of a snapped position (still needs some tweaks)
* [optional] Allow contained blocks to overflow right edge of block without growing block
* Re-enable dragging, at least for positioning


