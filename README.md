# Waterbear

> "It goes against the grain of modern education to teach children to program. What fun is there in making plans, acquiring discipline in organizing thoughts, devoting attention to detail and learning to be self-critical?" --Alan Perlis

## Description

Waterbear is a toolkit for making programming more accessible and fun. Not a language itself, but a block syntax inspired by Scratch (http://scratch.mit.edu/) that can be used to represent languages. Waterbear's blocks drag and snap together, representing code that eliminates syntax errors much like garbage collection alleviates memory errors and bound checking helps prevent overrun errors.

Waterbear's system of draggable, snappable blocks, are built using clean HTML5, CSS3, and Javascript. The goal is not to slavishly duplicate Scratch, or to create a programming language, but to create a visual syntax tool that can be used with a variety of languages and projects.

The motivation is to reduce syntax errors in the same way that garbage collection has reduced memory errors, or bounds checking has reduced overrun errors. I have also been testing various programming systems on my own kids, and Scratch is the one tool they were able to pick up easily, both for creating projects and for reading/modifying other people's projects. Waterbear is a way of relaxing some of the restrictions imposed on Scratch, and opening it up to the web at large.

The look and feel of Waterbear differs from Scratch, which is implemented in Squeak Smalltalk's Morphic environment. Waterbear blocks are intended to use web technologies naturally, without trying to force them into a different paradigm. In other words, this project is attempting to create blocks in a web-centric way. Waterbear is designed to be easy to use on both desktop/laptop browsers and on iPads and smart phones.

Waterbear is pre-alpha software, very raw, and in constant flux right now.

## Installation

Waterbear is pure Javascript. The only external dependencies are on jQuery (currently 1.5.1) and Modernizr (1.6). Some Waterbear block sets may have further dependencies, on Processing.js, Raphael.js, or Crafty.js (for instance).

Update: Have removed Modernizr dependency, but added dependencies on bPopup (http://dinbror.dk/blog/bPopup/) and Colorwheel (http://jweir.github.com/colorwheel/). Have also regressed Raphael to an earlier version to avoid bugs in the current version.

## Demo

There is a demo of a recent build (not guaranteed to be working at any given time) of waterbear here: <a href="http://waterbearlang.com/">waterbear.livingcode.org</a>, if you would like a (very early) sneak preview.

## Where to get help

The best way to get help right now is to email me: [dethe ATGLYPH livingcode DOTGLYPH org]. As the project progresses I will set up a mailing list or forum, buglist, etc.  The documentation for Waterbear will live here: <a href="docs/">Waterbear Documentation</a>. You can follow this project on twitter at <a href="http://twitter.com/waterbearlang">@waterbearlang</a>.

## Acknowledgements

* My kids, for helping test so many programming environments and being my best critics
* Steve Dekorte, Alex Payne, Bob Nystrom, Wolf Rentzsch, Victoria Wang, and Brian Leroux for the encouragement to make this real
* Scratch, the primary source of inspiration for this project
* Basic
* Quartz Composer
* NodeBox
* Processing
* Processing.js
* Raphael
* Crafty

## Related Projects

* Scratch http://scratch.mit.edu/
* Alice 3D: http://www.alice.org/
* Design Blocks: http://www.kickstarter.com/projects/evhan55/designblocks-visual-programming-for-artists
* Open Blocks: http://education.mit.edu/openblocks
* StarLogo: http://education.mit.edu/projects/starlogo-tng
* Google App Inventor: http://appinventor.googlelabs.com/about/


## Contributors

* Dethe Elza (https://github.com/dethe)
* Martyn Eggleton (https://github.com/stretchyboy)
* Blake Bourque (https://github.com/TechplexEngineer)
* Chistopher de Beer (http://github.com/christopherdebeer)
* Atul Varma (http://github.com/toolness/)

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


# Coming Features

* Make scripts left-aligned instead of free-floating
* Add local variable selection to top of containers
* Create and manipulate arrays and objects
* Create new functions
* Move block scripts aside, don't store with blocks on stage or saved blocks
* Support for any() type variables (fix String troubles)
* √ Add disclosure triangles to containers
* √ Make front page about Waterbear, start IDE on subsequent page
* √ Wrap scripts to avoid global pollution on run, not on display
* Move JS, Raphael, Sketchy, Arduino to plugins
* Format UI from plugins
* √ Move wrap_scripts to language plugin
* √ Use a library loader (YepNope)
* Autogenerate variable names
* Full web site with tutorial and forums
* Zoom into script view
* Build new blocks in Workspace
* Show all blocks (workaround for block drift bug) or autolayout
* Larger script workspace, with scrollbars
* Multiple script workspaces (allows one per sprite, for instance)
* [optional] Allow contained blocks to overflow right edge of block without growing block
* Contribution guidelines
* Contributor list
* Credits, inspirations, alternatives
* Built-in demos
* Test, specs, features, examples
* Reach out: Facebook, IRC
* Get design help, especially for workspace
* Waterbear logo
* √ Better code formatting for code view
* Script embedding
* Server for saving and sharing scripts
* Two ways to beautify JS:
  - √ https://github.com/einars/js-beautify/blob/master/beautify.js
  - https://github.com/douglascrockford/JSLint/blob/master/jslint.js
  - try 'em both, see what sticks
* JS to coffeescript:
  - https://github.com/mindynamics/js2cs
  - (more recent) http://ricostacruz.com/js2coffee/
* Flared borders: http://orderedlist.com/blog/articles/flared-borders-with-css/
* High-level components like Android AppInventor:
  - UI: Button, canvas, checkbox, clock, image, label, listpicker, password, textbox, tinydb???
  - Media: Camera, imagepicker, player, sound, videoplayer
  - Animation: Ball, imagesprite
  - Social: Contact picker, email picker, phone call, phone number picker, texting, twitter
  - Sensors: Accelerometer, location, orientation
  - Screen arrangement: Vertical, horizontal, table
  - Mindstorms: Color sensor, directions, drive, light sensor, sound sensor, touch sensor, ultrasonic sensor
  - Other: Activity starter, barcode scanner, bluetooth scanner, bluetooth server, notifier, speech recognizer, text to speech, tinywebdb, web
* Also like AppInventor: Configuration sheets for high-level components

# On Chromeless (nee

>    Absolutely, You can use processes [1], though the api for interacting with external procs is rather miserable at the moment [2]. Or you can use JSCtypes [3], for which there's a tiny toy example you can start from [4].

>    lloyd

>    [1] http://nochro.me/#module/lib/child_process
>    [2] https://github.com/mozilla/chromeless/issues/130
>    [3] https://wiki.mozilla.org/JSctypes
>    [4] https://github.com/mozilla/chromeless/tree/master/examples/jsctypes

Short answer: No, but if you want to write code for Chromeless to make it work...

# Bugs

* Keypressed sensor block broken
* Empty blocks insert comments that break scripts
* When switching languages, clear the scripts
* When saving and restoring, language matters - restore needed plugins
* Make sure restore dialogue scrolls
* √ Dragging block out of a Boolean socket doesn't restore select element
* Clicking into an input doesn't select contents
* √ Clicking into an input after the first input puts cursor in first input
* Visual cues when snapping are overly subtle
* Snap regions too small
