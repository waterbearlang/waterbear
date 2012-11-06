# Waterbear Scripts

This is the implementation of Waterbear. It pulls the libraries and the plugins together, implements the IDE and script writing, etc.

## blocks.js

Defines the models and pulls in the views (defined in garden.html) for all of the blocks. Nearly all of the basic block support and behaviour is defined here by several objects: Block and its subtypes (Expression, Step, Context, EventHandler), Value, and Label.

## drag.js

Waterbear has some fairly specific drag-and-drop requirements, and has to work across both desktop and mobile browsers, so it has its own custom dragging library for this. Since the time of writing this library, some libraries have added support across desktop and mobile browsers, so we should investigate using a more standard library at some point.

## jquery.blocks.js

In the early versions of Waterbear, most of the block behaviour was defined as jQuery extension methods, but this got out of hand and convoluted, leading to the models in blocks.js. There are still a handful of jQuery extensions used, mostly defined here, but these should be considered deprecated and will be phased out pretty soon.

## runtime.js

The Javascript plugin relies on specific behaviour, and on being isolated from the IDE. This is where the code lives for implementing the Javascript stage for the IDE.

## serialization-[version].js

In an effort to a) standardize the Waterbear serialization and b) provide forward and backward compatibility, it has been kept out of block.js and move here. Currently only the writing of serialized files is here, reading them back in is still in blocks.js and workspace.js, but that is a bug which should be corrected.

## template.js

After considering many templating languages, I ended up writing my own. The main thing I was looking for was to avoid going back and forth between HTML strings, the DOM, and jQuery objects. This template keeps the jQuery objects around (and the associated models), which helps with the very dynamic blocks. We'll see how this works in practice, and may have to revisit it down the road.

## test.js

Early, and primitive testing for blocks. This should be moved and expanded to the test directory.

## timer.js

Support for timers in the runtime.js, used by the Javascript stage in the IDE.

## ui.js

Support for various UI features in the IDE

## utils.js

Simple utility methods and helpers.

## workspace.js

This is where the IDE is defined and implemented, built around the framework provided by HTML in the garden.html file.
