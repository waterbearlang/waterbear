# Moving to custom elements

## 2014-11-20

Each type of block would be a custom element:

* file (what is now workspace)
* context
* step
* expression
* asset
* async?
* top-level (singletons, all put their variables in file global context)
 - setup
 - draw
 - assets
 - exports
 - exit

No need for a separate event-handler block, just use context.

Save and restore should be based on absolute minimum data.

Blocks tied to scripts by descriptive (not uuid) scriptId.

Variables, including locals, have default name, but name is a) always editable, and b) only has to be unique in context, c) gets numbers added to make it unique if necessary, and d) renames all instances as name changes.

I think I can avoid all auto ids, globals, registry, sequence numbers, maybe event the block definition files (just stick menu blocks straight into HTML).

Should I make containers and sockets be explicit tags too? Maybe just sockets?

Magic left over:

* Add to document (in script) adds locals.
* Remove from document removes instances, locals.
* Rename a variable socket finds and renames all instances.
* Enforce unique names in context.
* Enforce drag & drop rules
* Distinction between template (menu) and instance. Can template blocks be distinguished purely by context or by virtue of having a scriptId?
* how do I associate locals with scriptIds?

There is already a lot of special casing depending on type of block. Anything shared can go into a common prototype.

## 2014-11-22

OK, now that I've ripped Waterbear apart, what are the steps to putting it back together?

* [x] Custom elements for blocks
* [-] User hammer.js for drag-and-drop (NOPE)
* [ ] Move all code out of blocks, runtime, put in namespaced, accessible functions

## 2014-11-29

I have basic blocks showing up. Things I still need:

* [x] Contains, block nesting
* [ ] Block type values, expression nesting
* [ ] Embed locals a) on attachedCallback, b) when something is added to the expression value
* [ ] Handle "any" values
* [x] Handle event namespaces to separate UI and runtime events (needs testing)
* [ ] Build choice lists
* [ ] All drag and drop
* [ ] All layout and widgets (move to a separate file)
* [-] Shaping the blocks? Or leave rectangular-ish like we do for 500 lines Block Code? (LEAVE)
* [ ] Validation: enforce types in inputs
* [x] Resize inputs when value changes
* [ ] Tap, Double-tap, and other gestures

## 2014-12-15

Maybe a better route than having the loop block watch for child changes and add the right locals depending on the child would be to have children that are iterable have iterableLocals get inserted. Other specific types of locals could be added too?

Keeping the original locals as children, with unambiguous names, can give a handle to find all clones with when removing the originating block.

* [ ] Maintain unique name for variables (locals) within scope at all times
* [ ] Rename instances of locals when name changes
* [ ] How do I define the supported gestures?
