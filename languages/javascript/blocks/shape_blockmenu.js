(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "shapes",
            "name": "Shapes",
            "help": "Shape blocks are for creating shapes that can then be drawn or used to create sprites",
            "blocks": [
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "local.ctx.clearRect({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "help": "clear...",
                    "id": "3d714bd6-8d02-49cb-8e56-ece642b295ad",
                    "sockets": [
                        {
                            "name": "clear rect",
                            "type": "rect"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();",
                    "help": "circle...",
                    "id": "3ae0e65c-1d1c-4976-8807-799b0408984b",
                    "sockets": [
                        {
                            "name": "fill circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.fillStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.restore();",
                    "id": "e399d950-4d91-49aa-ac42-bfc58299633c",
                    "sockets": [
                        {
                            "name": "fill circle at point",
                            "type": "point",
                            "block": "29803c49-5bd5-4473-bff7-b3cf66ab9711"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 30
                        },
                        {
                            "name": "and color",
                            "type": "color",
                            "block": "da9a266b-8ec0-4b97-bd79-b18dc7d4596f"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();",
                    "help": "circle...",
                    "id": "79133274-d53f-4ef4-8b17-9259fe25fb87",
                    "sockets": [
                        {
                            "name": "stroke circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}}; var color## = {{3}};local.ctx.save();local.ctx.strokeStyle = color##;local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.stroke();local.ctx.restore();",
                    "id": "8a091a21-1fa9-49b6-a622-696c38556a2e",
                    "sockets": [
                        {
                            "name": "stroke circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10
                        },
                        {
                            "name": "and color",
                            "type": "color"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var point## = {{1}}; var radius## = {{2}};local.ctx.beginPath();local.ctx.arc(point##.x,point##.y,radius##,0,Math.PI*2,true);local.ctx.closePath();local.ctx.fill();local.ctx.stroke();",
                    "help": "circle...",
                    "id": "094fa424-8b6f-4759-a9bc-f4dbf289f697",
                    "sockets": [
                        {
                            "name": "stroke and fill circle at point",
                            "type": "point"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "script": "var rect## = {{1}};local.ctx.fillRect(rect##.x,rect##.y,rect##.w,rect##.h);",
                    "help": "fill...",
                    "id": "bf909ec4-5387-4baf-ba43-f17df493f9bd",
                    "sockets": [
                        {
                            "name": "fill rect",
                            "type": "rect"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "7a342b2b-f169-4071-8771-34394cc07393",
                    "script": "var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.fillStyle = color##; local.ctx.fillRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();",
                    "sockets": [
                        {
                            "name": "fill rect",
                            "type": "rect"
                        },
                        {
                            "name": "with color",
                            "type": "color"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "cbc60543-0a14-4f5c-af14-a2b55148b4e0",
                    "script": "var rect## = {{1}};var borderRadius## = {{2}};var color## = {{3}};local.ctx.save();local.ctx.strokeStyle=color##;local.ctx.fillStyle=color##;local.ctx.lineJoin='round';local.ctx.lineWidth=borderRadius##;local.ctx.strokeRect(rect##.x+(borderRadius##/2), rect##.y+(borderRadius##/2), rect##.w-borderRadius##, rect##.h-borderRadius##);local.ctx.fillRect(rect##.x+(borderRadius##/2), rect##.y+(borderRadius##/2), rect##.w-borderRadius##, rect##.h-borderRadius##);local.ctx.restore();",
                    "sockets": [
                        {
                            "name": "fill round rect",
                            "type": "rect",
                            "value": null
                        },
                        {
                            "name": "with border-radius",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "and color",
                            "type": "color",
                            "value": null
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "9cf3a017-ab20-4987-875a-5d8436377bd0",
                    "script": "var rect## = {{1}};var color## = {{2}};local.ctx.save();local.ctx.strokeStyle = color##; local.ctx.strokeRect(rect##.x, rect##.y, rect##.w, rect##.h);local.ctx.restore();",
                    "sockets": [
                        {
                            "name": "stroke rect",
                            "type": "rect"
                        },
                        {
                            "name": "with color",
                            "type": "color"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "b28a6aeb-bbad-4828-8ff1-2f846e556e1a",
                    "script": "var rect## = {{1}};local.ctx.strokeRect(rect##.x,rect##.y,rect##.w,rect##.h);",
                    "help": "stroke...",
                    "sockets": [
                        {
                            "name": "stroke rect",
                            "type": "rect"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "ebe1b968-f117-468d-91cb-1e67c5776030",
                    "script": "local.ctx.fillRect({{1}},{{2}},{{3}},{{4}});local.ctx.strokeRect({{1}},{{2}},{{3}},{{4}});",
                    "help": "fill and stroke...",
                    "sockets": [
                        {
                            "name": "fill and stroke rect x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "width",
                            "type": "number",
                            "value": 10
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 10
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e93b909e-19f8-4f80-8308-ae896bd63189",
                    "script": "var points## = {{1}}; var color## = {{2}}; local.ctx.save();local.ctx.beginPath(); local.ctx.moveTo(points##[0].x, points##[0].y); for (var i = 1; i < points##.length; i ++ ) {   local.ctx.lineTo(points##[i].x, points##[i].y); } local.ctx.closePath(); local.ctx.fillStyle = color##; local.ctx.fill();local.ctx.restore();",
                    "help": "fill the polygon defined by array of points",
                    "sockets": [
                        {
                            "name": "fill polygon ",
                            "type": "array",
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
                    "deprecated": true,
                    "blocktype": "step",
                    "id": "c0416416-9a75-4202-b3cf-54b03f9a28ee",
                    "script": "var points## = {{1}}; var color## = {{2}}; local.ctx.save();local.ctx.beginPath(); local.ctx.moveTo(points##[0].x, points##[0].y); for (var i = 1; i < points##.length; i ++ ) {   local.ctx.lineTo(points##[i].x, points##[i].y); } local.ctx.closePath(); local.ctx.strokeStyle = color##; local.ctx.stroke();local.ctx.restore()",
                    "help": "stroke the polygon defined by array of points",
                    "sockets": [
                        {
                            "name": "stroke polygon ",
                            "type": "array",
                            "value": null
                        },
                        {
                            "name": "with color",
                            "type": "color",
                            "value": null
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8219fa9f-caeb-42cf-a3e5-9cd5066b707c",
                    "script": "{type: 'circle', x: {{1}}, y: {{2}}, r: {{3}}}",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "circle at x",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "with radius",
                            "type": "number",
                            "value": "10"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "957e8a12-b933-4489-ba55-8d9a08d511a5",
                    "script": "{type: 'poly', points: {{1}}}",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "polygon with points ",
                            "type": "array",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7c7e116b-3035-43d7-9230-4d1b6cc4a7dd",
                    "script": "{type: 'rect', x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}}, r:{{5}}}",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "rect at x",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "with width",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": "10"
                        },
                        {
                            "name": "border-radius",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a51afa9e-f6be-444c-a591-1ca0d0ab697f",
                    "script": "{type: 'rect', x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h, r: {{3}}",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "rect at point",
                            "type": "point",
                            "value": null
                        },
                        {
                            "name": "with size",
                            "type": "size",
                            "value": null
                        },
                        {
                            "name": "border-radius",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "b2b9d08f-5d21-4742-a1fd-3f118c254c17",
                    "script": "{type: 'rect', x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] }, r:{{1}}[4];",
                    "type": "shape",
                    "sockets": [
                        {
                            "name": "rect from array",
                            "type": "array",
                            "value": null
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);
