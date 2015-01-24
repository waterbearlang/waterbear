# What are the unique events used in Waterbear?

## wb-initialize

Parameters: component ('script', 'stage', or 'ide')

Fired when each of these component load. Waterbear is fully ready to run script when all three have fired (which results in a wb-ready event).

## wb-add

Fired when a block is added to a script. When a block is moved, it is removed, then added.

## wb-modified

Fired when a block in a script is modified (i.e., it's socket values are changed).

## wb-remove

Fired when a block is removed from a script. Moving a block fires both a remove and an add event.

## wb-delete

Fired when a block is deleted entirely from a script.

## wb-clone

Fired when a block is cloned. Not really used, may be unnecessary.

## wb-toggle

I think this is fired when the accordion menus are toggled, but need to check.

## wb-workspace-initialized

Fired when the root block is created that contains all the other blocks in a script

## wb-state-loaded

Fired when we've loaded saved state back into the IDE. Currently unused.

## wb-state-change

Fired when there is a change to one of the state variables (???)

## wb-ready

Fired when all the async components (ide, stage, script) have reported in that they're ready.


