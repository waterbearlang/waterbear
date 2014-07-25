(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "paths",
            "name": "Paths",
            "help": "Path blocks are for construction more complex shapes for drawing, masking, and other uses.",
            "blocks": [
                {
                    "blocktype": "context",
                    "id": "5bd66c5d-1a66-4cbb-8984-a4361270c2c6",
                    "script": "local.ctx.beginPath();[[1]];local.ctx.closePath();",
                    "help": "create a path, run the contained steps, close the path",
                    "sockets": [
                        {
                            "name": "with path"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f9c9328b-746c-468b-90fa-4d3da4cb1479",
                    "script": "local.ctx.moveTo({{1}}.x,{{1}}.y);",
                    "help": "move to...",
                    "sockets": [
                        {
                            "name": "move to point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1dec1d26-282b-4d14-b943-6c06ebdd5ceb",
                    "script": "local.ctx.lineTo({{1}}.x,{{1}}.y);",
                    "help": "line to...",
                    "sockets": [
                        {
                            "name": "line to point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e79ff085-fb9a-46cb-8e4f-f61c5563d73b",
                    "script": "local.ctx.quadraticCurveTo({{2}}.x, {{2}}.y, {{1}}.x, {{1}}.y);",
                    "help": "quad curve to ...",
                    "sockets": [
                        {
                            "name": "quadradic curve to point",
                            "type": "point"
                        },
                        {
                            "name": "with control point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f311980c-eb49-4e42-9e9b-a4bdf428d5b5",
                    "script": "local.ctx.bezierCurveTo({{2}}.x,{{2}}.y,{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y);",
                    "help": "bezier curve to...",
                    "sockets": [
                        {
                            "name": "bezier curve to point",
                            "type": "point"
                        },
                        {
                            "name": "with control points",
                            "type": "point"
                        },
                        {
                            "name": "and",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "adf632ea-02e1-4087-8dfd-91e41ec520b1",
                    "script": "local.ctx.arcTo({{1}}.x,{{1}}.y,{{2}}.x,{{2}}.y,{{3}});",
                    "help": "I wish I understood this well enough to explain it better",
                    "sockets": [
                        {
                            "name": "arc to point1",
                            "type": "point"
                        },
                        {
                            "name": "point1",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 1.0,
                            "min": 0.0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "5b46a44d-6974-4eb9-ac35-ba1ec5a79304",
                    "script": "local.ctx.arc({{1}}.x,{{1}}.y,{{2}},deg2rad({{3}}),deg2rad({{4}}),{{5}});",
                    "help": "arc...",
                    "sockets": [
                        {
                            "name": "arc with origin",
                            "type": "point"
                        },
                        {
                            "name": "radius",
                            "type": "number",
                            "value": "1",
                            "min": 0
                        },
                        {
                            "name": "start angle",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        },
                        {
                            "name": "end angle",
                            "type": "number",
                            "value": 45,
                            "suffix": "degrees"
                        },
                        {
                            "name": "anticlockwise",
                            "type": "boolean",
                            "value": true
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "236e2fb4-3705-4465-9aa8-d7128e1f1c7f",
                    "script": "local.ctx.rect({{1}},{{1}},{{1}},{{1}});",
                    "help": "rect...",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e4198722-951c-4dd9-8396-a70813478152",
                    "script": "local.ctx.arc({{1}}.x,{{1}}.y,{{2}},0,Math.PI*2,true);",
                    "help": "circle...",
                    "sockets": [
                        {
                            "name": "circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "db455432-c7dd-4cba-af80-1802e38446c2",
                    "script": "local.ctx.clip();",
                    "help": "adds current path to the clip area",
                    "sockets": [
                        {
                            "name": "clip"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5b0fd9a6-39e7-4a70-86f8-1e7dc1c7166f",
                    "script": "local.ctx.isPointInPath({{1}}.x,{{1}}.y)",
                    "type": "boolean",
                    "help": "test a point against the current path",
                    "sockets": [
                        {
                            "name": "is point",
                            "type": "point",
                            "suffix": "in path?"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);