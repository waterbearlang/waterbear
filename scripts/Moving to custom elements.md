Moving to custom elements

Each type of block would be a custom element:

* file (what is now workspace)
* context
* step
* expression
* asset
* async?

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

