# Waterbear

Waterbear is a toolkit for making programming more accessible and fun. Not a language itself, but a block syntax inspired by Scratch (http://scratch.mit.edu/) that can be used to represent langauges. Waterbear's blocks drag and snap together, representing code that eliminates syntax errors much like garbage collection alleviates memory errors and bound checking helps prevent overrun errors.

Waterbear's system of draggable, snappable blocks, are built using clean HTML5, CSS3, and Javascript. The goal is not to slavishly duplicate Scratch, or to create a programming language, but to create a visual syntax tool that can be used with a variety of languages and projects.

The motivation is to reduce syntax errors in the same way that garbage collection has reduced memory errors, or bounds checking has reduced overrun errors. I have also been testing various programming systems on my own kids, and Scratch is the one tool they were able to pick up easily, both for creating projects and for reading/modifying other people's projects. Waterbear is a way of relaxing some of the restrictions imposed on Scratch, and opening it up to the web at large.

The look and feel of Waterbear differs from Scratch, which is implemented in Squeak Smalltalk's Morphic environment. Waterbear blocks are intended to use web technologies naturally, without trying to force them into a different paradigm. In other words, this project is attempting to create blocks in a web-centric way. Waterbear is designed to be easy to use on both desktop/laptop browsers and on iPads and smart phones.

There is a demo of a recent build (not guaranteed to be working at any given time) of waterbear here: <a href="http://waterbear.livingcode.org/">waterbear.livingcode.org</a>, if you would like a (very early) sneak preview.


## Todo

* Finish drag-n-drop implementation
  - ✓ Get it working on iPad (again)
  - ✓ Actually move the block in the hit_test call
  - Handle dropping blocks
    - ✓ Drop into workspace
    - ✓ Delete when appropriate
    - ✓ Move back when appropriate
    - Snap together
  - On starting drag, un-snap more intelligently (and put back properly)
  - When dropping a value, remove the input element
  - When dragging a value out of a socket, replace the input element with current value
  - Don't start drag on input element
  - Don't allow clicks into input element in blocks menu
* Attach script snippets to blocks
* Build an animation using blocks
* ✓ Build up drag-n-drop from first principles
* ✓ Get it working on iPad
* ✓ Right/left borders for values
* ✓ Top/bottom borders for slots
* ✓ Dragging on mobile
* Test in Firefox
* Mini-language for building blocks to bind a language/library
* Clean up look of IDE
* Save and restore projects
* ✓ Move from popup dialog to sidebar with zooming interface
* ✓ Remove all dragging, use selected element and click/touch
* ✓ Switch from jQuery to Zepto (and back again)
* ✓ Get tap event working, not sure why it doesn't now (bad browser sniffing?)
* Zoom into script view
* Toggle between control views for different sprites / stage
* Toggle between script/skin/sound views for a specific sprite
* Visual distinctiveness of value blocks and slots (right/left for values, top/bottom of slots)
* ✓ Reduce padding in value blocks
* ✓ Remove blocks delete key or drag back to menu
* Create a larger script workspace, with scrollbars
* Multiple script workspaces (allows one per sprite, for instance)
* Force blocks into two columns (get rid of table, ick)
* Fix position when dragging out of a snapped position (still needs some tweaks)
* [optional] Allow contained blocks to overflow right edge of block without growing block
* ✓ Re-enable dragging, at least for positioning


