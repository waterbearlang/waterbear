# Rethinking Waterbear #

We have enough experience with waterbear now to be able to step back and take a look at what is working and what needs improvement. It's time to explore potentially radical changes before things get set in stone.

There are several types of blocks and more potential types of blocks

Current blocks:

* Trigger (on some event, do: )
* Step (Do this thing, then the next thing)
* Container (Do this with these steps, values)
* Value (Typed expression)

Other blocks that could be useful

* Function (given this, return this)
* Patch (given these inputs, do this, send to these outputs)
* Form (set several values together as a group)
* Object (like scratch sprites, have internal values and methods)
* Definition (create a new type of block)

Some blocks may want to change shape depending on context

* Color block may switch between RGB(A), CSV(A), colorwheel
* Some blocks may function as either steps or expressions

Blocks behave differently if they are in different contexts:

* On a menu (block templates)
* On a workspace (no effect unless they are a trigger or a definition
* On a specialized workspace (a sprite or object)
* Embedded in another block (everything except triggers)

Defining a new block

* Could be an object, with methods
* Could be a function
* How generic can we get?

Definition blocks are also top-level, like triggers

Sometimes definitions can be nested. Can triggers be nested?

BIG QUESTION: Should objects be workspaces (like in Scratch) or blocks?

What events should blocks support?

* Drag
* Over
* Out
* Drop - in block, in value slot, on workspace, on menu, on "trash"
* Scoping - when dragged to a new scope, or out of scope
* When parent/prototype goes out of scope

How should block changes be recorded for undo/redo?

How should blocks be represented?

* As definitions/prototypes?
* As stored scripts?
* As executable scripts?

Can blocks be steps *and* values?

How to collapse complex blocks or expand blocks? How to edit the representation? How to store new block templates on the menu?

Building the web: How to represent HTML, CSS, JS, Canvas, Audio, Video, SVG, networking, web workers, etc. without being overwhelming?

### Problems we've encountered so far ###

* Representing different languages
* Converting code -> blocks (round-tripping or blocks as a view of normal code)
* Finding the block you need (menu navigation)
* Types vs. flexibility
* Should objects be implicit or parameters?
* Explosion of block for different type signatures
* Really hard to test
* Types designated by color and/or shape run out of easily distinguished colors/shapes pretty fast.

For finding blocks, on the desktop text search helps to narrow down block choice, but a) not so great on tablet, and b) you have to know what you're looking for.

As an alternative, or supplement, to colors/shapes, perhaps add an icon to blocks to represent the type. The icon may also double as a return value? Perhaps a toggle to switch between step and expression?

## Libraries in use already ##

* beautify
* colorwheel
* highlight
* jquery
* jquery autogrowinput
* jquery gamequery
* jquery hotkeys
* json2
* prefixfree
* raphael
* raphael sketchy
* raphael path
* yepnope

## Libraries under consideration ##

* 3rd party drag / touch library
* More powerful color library with no dependency on Raphael
* Coffeescript / underscore / backbone / less
* Library for gists

## Core of waterbear in 4 files ##

* blocks.js
* drag.js
* runtime.js
* workspace.js

### blocks.js ###

* utilities
* debugging
* jquery extensions for access

Making this use real JS objects (backbone models) could be a lot simpler. Also, using templates could avoid a lot of JQuery construction code. Could also clean up block language spec.

### drag.js ###

This would be ideal to move to a 3rd party library, but haven't found one that solves touch vs. mouse *and* waterbear's need to support tabs and slots for steps and sockets for values. Value sockets are pretty easy and there are newer libraries to manage touch vs. mouse. The final problem is with tabs and slots, which could be solved by relaxing that restriction. Now that scripts are basically linear anyway, we don't really need the Scratch metaphor for joining blocks together, and can use it only as a visual cue, but highlight the entire block when it is in a legal position in the script.

### runtime.js ###

Runtime has grown way too many specifics about the JS binding and types. It should really be just a touch of isolation (perhaps using an iframe) for scripts, and a timer for events.

### workspace.js ###

The workspace has all the primitive UI for the IDE, serialization and deserialization, and some even more primitive testing.

## Next Steps ##

* Convert blocks from JQuery to HTML templates
* Convert block data/methods to backbone models
* Use events pervasively
* Convert core to Coffeescript/Less
* Consider using oBloq
* Evaluate the newer touch libraries: 
  - https://github.com/bebraw/jswiki/wiki/Touch
  - https://github.com/cheeaun/tappable
  - https://github.com/alexgibson/tap.js/blob/master/tap.js
  - http://mwbrooks.github.com/thumbs.js/

## Moar future ##

* Plan for addressing all the issues on github
* Game lib for animation, sprites
* Immediate-style programming (see changes in view as code changes)
* A saturday-morning style cartoon show produced with Waterbear where kids can access all the scripts and assets to remix the cartoon each week and make their own.

For Waterbear presentation: a dinosaur animation using dialogue from Serenity





