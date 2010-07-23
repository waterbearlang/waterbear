# Waterbear

Waterbear is a programming toolkit for making programming more accessible to beginners, and more fun for all. The first part of it is a system of blocks inspired by Scratch (http://scratch.mit.edu) that can be used to create new visual languages.

It is an attempt to create a system of draggable, snappable blocks, similar to what is used in the Scratch programming language, using HTML, CSS, and Javascript. The goal is not to slavishly duplicate Scratch, or to create a programming language, but to create a visual syntax tool that can be used with a variety of languages and projects.

The motivation for this project is to reduce syntax errors in the same way that garbage collection has reduced memory errors, or bounds checking has reduced overrun errors.

The look and feel is different from Scratch, which is implemented in Squeak Smalltalk's Morphic environment. Scratch Blocks are intended to use web technologies naturally, without trying to force them into a different paradigm. In other words, this project is attempting to create blocks in a web-centric way.

## Todo

* Visual distinctiveness of value blocks and slots (right/left for values, top/bottom of slots)
* Test on iPad (fixing drag'n'drop on touch devices requires research)
* Get rid of double-handling clicks (inserting multiple blocks per click)
* Reduce padding in value blocks
* Remove blocks by dragging off script workspace
* Close menu popover on menu click, if open
* Create a larger script workspace, with scrollbars
* Tabs for different sections: scripts, sounds, costumes
* Multiple script blocks (allows one per sprite, for instance)
* Higher-level description of a language
* Force blocks into two columns
* Fix position when dragging out of a snapped position (still needs some tweaks)
* [optional] Allow contained blocks to overflow right edge of block without growing block



