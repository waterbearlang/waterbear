Note for improving block description langauge

1. What is needed to define a block for a plugin?
  * Script
  * Dependencies (language, etc.)
  * Arguments
  * Type
  * Return value
2. What is needed to save a block (drop values that match defaults, drop help, etc.)?
  * Simpler is better
  * Can it be pure JSON or coffeescript? Something even lighter?
3. What are the defaults?
  * Don't store defaults into serialized blocks
4. How do we store things like scripts and help?
  * Each block doesn't need these, just the definition block
  * Can definition blocks be written in Waterbear?
5. What are the events in the lifecycle of a block?
  * Start drag from menu
  * Drag over workspace
  * Drag over object (sprite, image, etc.)
  * Drag over socket
  * Drag over block
6. How can we give blocks identifiers
  * Dragging several copies of a return value should only be references to it
7. What are the types of blocks that we want (above and beyond what we have)
  * Trigger
  * Step
  * Container
  * Value
  * Form
  * Patch
  * Function
8. How can we improve blocks and the code around them?
  * Simpler HTML and dragging
  * Simpler code loading and generation
9. How can we separate blocks from IDE, allow them to be configurable (esp. colours)

Important bits (currently)

block_description (blocks.js)
Block (blocks.js)
loadScriptsFromObject (workspace.js)


Definition:

{
    label: 'when program runs',
    trigger: true,
    slot: false,
    containers: 1,
    script: 'function _start(){[[1]]}_start();',
    help: 'this trigger will run its scripts once when the program starts'
}




Saved:
{
    "klass":"control",
    "label":"when program runs",
    "script":"function _start(){[[1]]}_start();",
    "containers":1,
    "trigger":true,
    "locals":[],
    "sockets":[],
    "contained":[
        {"klass":"control",
        "label":"repeat [number:10]",
        "script":"range({{1}}).forEach(function(idx, item){local.count = idx; local.last_var = item;[[1]]});",
        "containers":1,
        "locals":[
            {"label":"loop index",
            "script":"local.index",
            "type":"number",
            "klass":"control"}
        ],
        "sockets":["10"],
        "contained":[
            {"klass":"shapes",
            "label":"rect_1 with width [number:0] and height [number:0] at position x [number:0] y [number:0]",
            "script":"local.shape_1 = global.paper.rect({{3}}, {{4}}, {{1}}, {{2}});",
            "containers":0,
            "locals":[],
            "returns":{
                "label":"rect_1",
                "script":"local.shape_1",
                "type":"shape",
                "klass":"shapes"
            },
            "sockets":[
                "40",
                "40",
                {
                    "klass":"operators",
                    "label":"pick random [number:1] to [number:10]",
                    "script":"randint({{1}}, {{2}})",
                    "containers":0,
                    "type":"number",
                    "locals":[],
                    "sockets":[
                        "1",
                        {
                            "klass":"sensing",
                            "label":"stage width",
                            "script":"global.stage_width",
                            "containers":0,
                            "type":"number",
                            "locals":[],
                            "sockets":[],
                            "contained":[],
                            "next":""
                        }
                    ],
                   "contained":[],
                   "next":""
                },
                {
                    "klass":"operators",
                    "label":"pick random [number:1] to [number:10]",
                    "script":"randint({{1}}, {{2}})",
                    "containers":0,
                    "type":"number",
                    "locals":[],
                    "sockets":
                        [
                            "1",
                            {
                                "klass":"sensing",
                                "label":"stage height",
                                "script":"global.stage_height",
                                "containers":0,
                                "type":"number",
                                "locals":[],
                                "sockets":[],
                                "contained":[],
                                "next":""
                            }
                        ],
                        "contained":[],
                        "next":""
                    }
                ],
                "contained":[],
                "next":{
                    "klass":"animation",
                    "label":"shape [shape] rotation [number:15] degrees over [number:500] ms with [choice:easing]",
                    "script":"{{1}}.animate({rotation: {{2}} }, {{3}}, {{4}});",
                    "containers":0,
                    "locals":[],
                    "sockets":[
                        {
                            "klass":"shapes",
                            "label":"rect_1",
                            "script":"local.shape_1",
                            "containers":0,
                            "type":"shape",
                            "locals":[],
                            "sockets":[],
                            "contained":[],
                            "next":""
                        },
                        "360",
                        "2000",
                        ">"
                    ],
                    "contained":[],
                    "next":""
                }
            }
        ],
        "next":""
    }
],
    "next":""
}
