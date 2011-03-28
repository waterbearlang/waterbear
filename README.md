# Waterbear

## Description

Waterbear is a toolkit for making programming more accessible and fun. Not a language itself, but a block syntax inspired by Scratch (http://scratch.mit.edu/) that can be used to represent langauges. Waterbear's blocks drag and snap together, representing code that eliminates syntax errors much like garbage collection alleviates memory errors and bound checking helps prevent overrun errors.

Waterbear's system of draggable, snappable blocks, are built using clean HTML5, CSS3, and Javascript. The goal is not to slavishly duplicate Scratch, or to create a programming language, but to create a visual syntax tool that can be used with a variety of languages and projects.

The motivation is to reduce syntax errors in the same way that garbage collection has reduced memory errors, or bounds checking has reduced overrun errors. I have also been testing various programming systems on my own kids, and Scratch is the one tool they were able to pick up easily, both for creating projects and for reading/modifying other people's projects. Waterbear is a way of relaxing some of the restrictions imposed on Scratch, and opening it up to the web at large.

The look and feel of Waterbear differs from Scratch, which is implemented in Squeak Smalltalk's Morphic environment. Waterbear blocks are intended to use web technologies naturally, without trying to force them into a different paradigm. In other words, this project is attempting to create blocks in a web-centric way. Waterbear is designed to be easy to use on both desktop/laptop browsers and on iPads and smart phones.

Waterbear is pre-alpha software, very raw, and in constant flux right now.

## Installation

Waterbear is pure Javascript. The only external dependencies are on jQuery (currently 1.5.1) and Modernizr (1.6). Some Waterbear block sets may have further dependencies, on Processing.js, Raphael.js, or Crafty.js (for instance).

## Demo

There is a demo of a recent build (not guaranteed to be working at any given time) of waterbear here: <a href="http://waterbearlang.com/">waterbear.livingcode.org</a>, if you would like a (very early) sneak preview.

## Where to get help

The best way to get help right now is to email me: [dethe ATGLYPH livingcode DOTGLYPH org]. As the project progresses I will set up a mailing list or forum, buglist, etc.  The documentation for Waterbear will live here: <a href="docs/">Waterbear Documentation</a>. You can follow this project on twitter at <a href="http://twitter.com/water_bear">@water_bear</a>.

## Acknowledgements

* My kids, Azlen and Mina, for helping test so many programming environments and being my best critics
* Steve Dekorte, Alex Payne, Bob Nystrom, Wolf Rentzsch, Victoria Wang, and Brian Leroux for the encouragement to make this real
* Scratch, the primary source of inspiration for this project
* Alice
* StarLogo
* Basic
* Quartz Composer
* NodeBox
* Processing
* Processing.js
* Raphael
* Crafty


## Contributors

* Dethe Elza
* [Your name here]


## License

Copyright 2011 Dethe Elza

Waterbear code licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

<a rel="license" href="http://creativecommons.org/licenses/by/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by/3.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/Text" property="dct:title" rel="dct:type">Waterbear Documentation</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://waterbearlang.com/" property="cc:attributionName" rel="cc:attributionURL">Dethe Elza</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0 Unported License</a>.<br />Permissions beyond the scope of this license may be available at <a xmlns:cc="http://creativecommons.org/ns#" href="http://www.apache.org/licenses/LICENSE-2.0" rel="cc:morePermissions">http://www.apache.org/licenses/LICENSE-2.0</a>.


## Todo

* Finish drag-n-drop implementation
  - ✓ Get it working on iPad (again)
  - ✓ Actually move the block in the hit_test call
  - Handle dropping blocks
    - ✓ Drop into workspace
    - ✓ Delete when appropriate
    - ✓ Move back when appropriate
    - ✓ Snap together
    - Avoid random moving when blocks on canvas are rearranged
  - ✓ On starting drag, un-snap more intelligently (and put back properly)
  - ✓ When dropping a value, remove the input element
  - When dragging a value out of a socket, replace the input element with current value
  - Don't start drag on input element
  - Don't allow clicks into input element in blocks menu
* Attach script snippets to blocks
  - ✓ Tab to show built script
  - Extract expressions/values
  - Implement script building mini-language
* Build an animation using blocks
* ✓ Build up drag-n-drop from first principles
* ✓ Get it working on iPad
* ✓ Right/left borders for values
* ✓ Top/bottom borders for slots
* ✓ Dragging on mobile
* Test in Firefox
* Mini-language for building blocks to bind a language/library
* Clean up look of IDE
  - ✓ Get tabs working for workspaces
* Save and restore projects
* ✓ Move from popup dialog to sidebar with zooming interface
* ✓ Remove all dragging, use selected element and click/touch
* ✓ Switch from jQuery to Zepto (and back again)
* ✓ Get tap event working, not sure why it doesn't now (bad browser sniffing?)
* Zoom into script view
* Toggle between control views for different sprites / stage
* ✓ Toggle between script/skin/sound views for a specific sprite
* Visual distinctiveness of value blocks and slots (right/left for values, top/bottom of slots)
* ✓ Reduce padding in value blocks
* ✓ Remove blocks delete key or drag back to menu
* Create a larger script workspace, with scrollbars
* Multiple script workspaces (allows one per sprite, for instance)
* Force blocks into two columns (get rid of table, ick)
* Fix position when dragging out of a snapped position (still needs some tweaks)
* [optional] Allow contained blocks to overflow right edge of block without growing block
* ✓ Re-enable dragging, at least for positioning
* Fix issues listed at http://thechangelog.com/post/3032074343/top-ten-reasons-why-i-wont-use-your-open-source-project
  - Readme
    - Description
    - Installation instructions
    - Where to get help
    - Contribution guidelines
    - Contributor list
    - Credits, inspirations, alternatives
  - Test, specs, features, examples
  - Project home page
  - Design help
  - Domain name
  - Twitter account
  - Clear licensing
  - Reach out
    - Twitter
    - Facebook
    - IRC
  - Speak at conferences and meetups
  - Submit to the Changelog


