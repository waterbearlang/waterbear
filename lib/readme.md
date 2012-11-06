# Waterbear Libs

The libs directory is where 3rd party libraries used by Waterbear are kept. Not all of these are used by all plugins, so below is a description of the libraries and what they are used for (and by).

## contextMenu folder

Contains png images used for the block context menus. Part of the Waterbear IDE core.

## theme folder

Contains images used by jQuery UI for styling buttons and accordion widget. Part of the Waterbear IDE core.

## beautify.js

Used for formatting generated Javascript code. Part of the Waterbear IDE, used by the Javascript plugin.

## chai.js

An assertion library, used for checking objects passed into functions to catch errors earlier. Part of the implementation of the block models.

## colorwheel.js

A color picker widget built on top of Raphael.js. Used by block that are part of the Raphael plugin.

## highlight.js, highlight-javascript.js, highlight-github.css

The syntax highlighter driver, currently only used on generated Javascript code. Part of the Waterbear IDE, used by the Javascript plugin.

Looking at replacing this with Prism.

## jquery-1.7.2.min.js

Waterbear makes extensive used of JQuery. It would be interesting to catalogue our uses of jQuery and see if we could make the switch to something more lightweight, like Zepto, but when I tried that for the dragging library Zepto didn't have anything like what we needed.

## jquery-ui-[version].custom.css, jquery-ui-[version].custom.min.js

Waterbear uses JQuery UI for buttons and the accordion widget, which may well be overkill for the simple uses we put them to.

## jquery.autoGrowInput.js

This is used for text entry in blocks, to allow text fields to resize as you type. Part of the core block implementation.

## jquery.bpopup-[version].min.js

This is a lightweight modal dialog implementation, used for file dialogs.

## jquery.contextMenu.css,  jquery.contextMenu.js, jquery.tappable.js

Used for creating context menus for the blocks which work across browsers, including mobile.

## jquery.gamequery.js

The gamequery plugin is a wrapper around this gaming library.

## jquery.hotkeys.js

Used as a helper for keyboard events. I think right now this is only used by the Javascript plugin for keyboard event blocks, but the goal is to also use this to support hotkey shortcuts in the IDE.

## jquery.querystring.js

Used to parse the query string to extract plugins to load. Will revisit this when we have better support for plugin loading in the UI of the IDE.

## jquery.ui.position.js

Used for extracting position information. Part of the dragging implementation.

## json2.js

Not all browsers have implementation of JSON.parse() and JSON.stringify. This is used as a shim for browsers that lack this, although it is debatable whether we can or should support any browser like that.

## mocha.js, mocha.css

Mocha is a testing library used to run the unit tests. Currently those tests are only for the template library, but eventually we want to have good test coverage for all of Waterbear. Chai.js assertions can be used in these tests.

We probably also should move toward using doctest.js for our tests.

## prefixfree.min.js

This library allows us to write standard CSS, including newer features, and the library will insert vendor prefixes only for the current browser, and only where there are needed.

## raphael-[version].min.js

The raphael library is a convenient wrapper around SVG (most browsers) and VML (IE) which gives a nice, consistent API. Used by the raphael plugin and the colorwheel widget.

## raphael-path.js

An extension to the raphael API, used by the Sketchy plugin (and maybe the Raphael plugin?).

## sketchy.js

An extension to the raphael API to provide more hand-drawn, jittery lines. Used by the sketchy plugin.

## yepnope.[version]-min.js

Conditional library loader. Used to load plugins, and used by the plugins to load their dependencies (libraries, css, etc.).


