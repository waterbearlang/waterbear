Dragging Conditions and requirements

Start Location
    √ Block menu
    Locals
    √ Script area (incl. block contents in script area)

End Location
    √ Block menu (change to trashcan)
    √ Script area (incl. content of block in script area)

Drag target
    √ Expression
    Scoped Expression
    √ Step or Context
    Scoped Step or Context

Drop targets:
    √ Block menu (always)
    √ Sockets if Expression and type matches
    √ Blocks in script area (place drag target after block) if within scope
    √ Context contains (place drag target as first block) if step or context
    √ Script area if step or context
    √ Context contents if step or context
    Enforces scope

Other considerations:
    Add locals on drop
        To self if context
        To parent context if step
        To workspace locals if dropped on script area
    Rename variables to be unique in scope, carry naming through to all instances
    Maintain scope, grey out non-scope areas
    √ While dragging, block menu should turn to trashcan

Still to be resolved
    How can I have different locals depending on which expression is added to a socket?

CAN I ELIMINATE NEED FOR SCRATCH SPACE?

    Yes, I think so

Select block, move selection as blocks are added by tapping:

Last block added is always selected (first socket of that block is selected for expressions)
Adding a context block selects the contents of the context
Click a block or socket to select it
Click a block in the block menu to add it to the script
    If an expression, try to add to the selected block, put error message in output if it fails
        If new expression has sockets, select the first one, else select the next valid socket
    If a block, add after the currently selected block or append to the current context
    Newly added block is now selected
