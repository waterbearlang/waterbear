(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "canvas",
            "name": "Canvas",
            "help": "Canvas blocks are blocks that are about drawing on the canvas but don't fit elsewhere. Also look at the Sprites, Shapes, and Path menus.",
            "blocks": [
                {
                    "blocktype": "context",
                    "script": "local.ctx.save();[[1]];local.ctx.restore();",
                    "help": "save the current state, run the contained steps, then restore the saved state",
                    "id": "9e514499-05a6-4b76-ad4b-1ea888181a8b",
                    "sockets": [
                        {
                            "name": "with local state"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "local.ctx.stroke();",
                    "help": "stroke...",
                    "id": "99d5828c-ccdd-47db-9abe-f67a8c065fe6",
                    "sockets": [
                        {
                            "name": "stroke"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "local.ctx.fill();",
                    "help": "fill...",
                    "id": "d540bb5f-7711-4133-a631-53821daeb593",
                    "sockets": [
                        {
                            "name": "fill"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c7e2e322-921a-4a96-9c86-9dbbaf54eb53",
                    "script": "local.ctx.globalAlpha = {{1}};",
                    "help": "set the global alpha",
                    "sockets": [
                        {
                            "name": "global alpha",
                            "type": "number",
                            "value": 1.0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "0237bbab-d62a-4ff9-afb8-4a64bc98dbc3",
                    "script": "local.ctx.globalCompositOperator = {{1}};",
                    "help": "set the global composite operator",
                    "sockets": [
                        {
                            "name": "global composite operator",
                            "type": "string",
                            "options": "globalCompositeOperators",
                            "value": "source-over"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "96085392-9a2d-4857-85f1-af2af72cf800",
                    "script": "local.ctx.scale({{1}},{{2}});",
                    "help": "change the scale of subsequent drawing",
                    "sockets": [
                        {
                            "name": "scale x",
                            "type": "number",
                            "value": 1.0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 1.0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "5e6ce8f8-d5a2-454e-8e88-d5155fb0eef0",
                    "script": "local.ctx.rotate(deg2rad({{1}}));",
                    "help": "rotate...",
                    "sockets": [
                        {
                            "name": "rotate by",
                            "type": "number",
                            "value": 0,
                            "suffix": "degrees"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "df0ffca8-dd43-45aa-8b9f-b7d588090cd5",
                    "script": "local.ctx.translate({{1}},{{2}});",
                    "help": "translate...",
                    "sockets": [
                        {
                            "name": "translate by x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "d297afc2-3941-4977-a6af-d7f4e222b467",
                    "script": "local.ctx.lineWidth = {{1}};",
                    "help": "set line width",
                    "sockets": [
                        {
                            "name": "line width",
                            "type": "number",
                            "value": 1
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b538aadd-e90d-4d0d-bc12-95b7df9c2a61",
                    "script": "local.ctx.lineCap = {{1}};",
                    "help": "set line cap",
                    "sockets": [
                        {
                            "name": "line cap",
                            "type": "string",
                            "options": "linecap",
                            "value": "round"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "4b3f5315-295c-46d7-baf2-e791c707cf4f",
                    "script": "local.ctx.lineJoin = {{1}};",
                    "help": "set line join",
                    "sockets": [
                        {
                            "name": "line join",
                            "type": "string",
                            "options": "linejoin",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "c3aec6b2-ccb1-4e24-b00f-0736214f44c3",
                    "script": "local.ctx.mitreLimit = {{1}};",
                    "help": "set mitre limit",
                    "sockets": [
                        {
                            "name": "mitre limit",
                            "type": "number",
                            "value": 10
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "f28b6498-87f7-4b39-bf16-81644a2a1996",
                    "script": "local.ctx.shadowOffsetX = {{1}}; local.ctx.shadowOffsetY = {{2}}",
                    "help": "set the offsets for shadow",
                    "sockets": [
                        {
                            "name": "shadow offset x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "278b0b41-895c-4786-9c09-d745ae5501af",
                    "script": "local.ctx.shadowBlur = {{1}};",
                    "help": "set the shadow blur radius",
                    "sockets": [
                        {
                            "name": "shadow blur",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "help": "clear...",
                    "id": "cf17a61d-8c7a-4829-a476-0b650efda3e4",
                    "sockets": [
                        {
                            "name": "clear rect",
                            "type": "shape",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();",
                    "help": "circle...",
                    "id": "b4e05d48-32e4-4e0b-832c-b2433ffda2e2",
                    "sockets": [
                        {
                            "name": "stroke circle at point",
                            "type": "point",
                            "value": null
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "var shape## = {{1}}; var color## = {{2}}; Shape.fillShape(shape##, color##);",
                    "help": "fill...",
                    "id": "0baa9d2b-659d-40a7-bbd3-cc72712a546b",
                    "sockets": [
                        {
                            "name": "fill shape",
                            "type": "shape",
                            "value": null
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "script": "var shape## = {{1}}; var color## = {{2}}; var width## = {{3}}; Shape.strokeShape(shape##, color##, width##);",
                    "help": "stroke...",
                    "id": "90b70122-340f-46a7-9753-9c39022c00ac",
                    "sockets": [
                        {
                            "name": "stroke shape",
                            "type": "shape",
                            "value": null
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "value": null
                        },
                        {
                            "name": "and width",
                            "type": "number",
                            "value": 1
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);