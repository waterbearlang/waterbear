# Waterbear Plugins

Plugins are the heart of Waterbear. A plugin defines the blocks you have available in the IDE. There are two main types of plugins: language wrappers and extensions. A language wrapper is the core plugin for a given language, while extensions provide additional blocks for that base language. At the time of this writing, Waterbear supports two languages in the core (there are branches which support others, such as Java): Javascript and Arduino.

## Javascript language plugin

This plugin does not attempt to provide every possible construct in Javascript, but to cover the important patterns. It provides a higher-level view than writing Javascript by hand, with some blocks being wrappers over larger blocks of actual code. No attempt is made to round-trip textual Javascript code into blocks, but that is a goal in the future.

### canvas.js

One of two (mutually incompatible) graphics extensions for Javascript that is currently being provided, with the goal that before going into beta we will choose one to "bless" as the default and standard. The canvas library is built over the native &lt;canvas&gt; tag (as the Processing library is) and has a state-based model which can be tricky for users to understand and use.

### raphael.js

Raphael is the alternative graphics extension we provide for Javascript, which is built on top of SVG and provides a more object-oriented model of graphics, with support built-in for events, animation, hit-testing, etc. (Not all of this is currently exposed by blocks).

### twitter.js

This is a super-simple plugin that give very bare-bones support for reading twitter statuses, mainly used as a quick demo of the network / web capabilities of Waterbear.

### gamequery.js

This is an experimental plugin to add blocks for building games on top of Waterbear.

## Arduino

This is the language plugin for supporting arduino programming, especially in the context of programming robots, as part of the Simple Waterbear Arduino Robotics Program (SWARMP).
