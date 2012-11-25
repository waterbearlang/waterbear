## Creating Plugins

Plugins consist of a couple of key parts.

1. Menus
2. Blocks
3. Extensions
4. Styles

Menus are created in each plugin file. The menu function takes three parameters,
first: the name of the menu
second: an array of json blocks (see the blocks section)
third: a boolean (true or false) that specifies if the menu should default to open

The menu function should be called once for each menu group needed (ie: Control, Variables...).

###Block Description mini-language

The mini-language provides a number of stock blocks to choose from.
Currently these blocktypes are defined:
step
expression
context
eventhandler

Here is a simple example block:
``` json
	{
        blocktype: 'eventhandler',
        labels: ['when program runs'],
        script: 'function _start(){[[1]]}_start();',
        help: 'this trigger will run its scripts once when the program starts'
    }
```

Lets break down the properties that make up the block.

blocktype	-- The blocktype specifies the shape and whether or not blocks can preceed or follow.
labels		-- Labels will be applied to the block. See the section below on Label formatting & Substitution.
script		-- This is where the actual script is defined. See the section below on Label formatting & Substitution. 
help		-- The value of help will appear as a tooltip on the block. Hopefully soon there will be a way to better document the function of blocks.


#### Label formatting & Substitution
Labels can specify textboxes, dropdowns and default values. The user input from these control fields can then be substituted into the script for the block.

Labels use square brackets to denote special UI features. For example: ``` javascript 'repeat [number:30] times a second' ```
This label has one input field that accepts numbers and defaults to 30. The default value is optional, and when not specified is left blank.

Labels can also specify dropdown boxes. For this setup one must define the options for the dropdown near the top of the plugin file.
For example: ``` javascript 'when [choice:keys] key pressed' ```, when waterbear parses the label it will look in the choiceLists object for a list named 'keys'
