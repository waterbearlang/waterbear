(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "rects",
            "name": "Rects",
            "help": "Rect blocks represent and manipulate rectangles represented by x,y coordinates for the top left corner of the rectangle, plus a size (width,height).",
            "blocks": [
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "67924ef4-71eb-4793-9599-d8605b14320a",
                    "script": "{x: {{1}}, y: {{2}}, w: {{3}}, h: {{4}} }",
                    "type": "rect",
                    "sockets": [
                        {
                            "name": "rect at x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "with width",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 10,
                            "min": 0
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "24b44fea-7be1-472a-a203-2a0d97515311",
                    "script": "{x: {{1}}.x, y: {{1}}.y, w: {{2}}.w, h: {{2}}.h}",
                    "type": "rect",
                    "sockets": [
                        {
                            "name": "rect at point",
                            "type": "point"
                        },
                        {
                            "name": "with size",
                            "type": "size"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "68c9cfd0-d06b-41ae-9eac-d762126f6bd7",
                    "script": "{x: {{1}}[0], y: {{1}}[1], w: {{1}}[2], h: {{1}}[3] };",
                    "type": "rect",
                    "sockets": [
                        {
                            "name": "rect from array",
                            "type": "array"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "aed385a0-7439-4b36-ad3e-fd07c562523a",
                    "script": "{x: {{1}}.x, y: {{1}}.y}",
                    "type": "point",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "position"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "deprecated": true,
                    "blocktype": "expression",
                    "id": "453db037-c418-467b-8808-52d84c7a3273",
                    "script": "{w: {{1}}.w, h: {{1}}.h}",
                    "type": "size",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "size"
                        }
                    ],
                    "tags": [
                        "deprecated"
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "599f6375-e26e-414c-9740-fa9fcfc8ff00",
                    "script": "[{{1}}.x, {{1}}.y, {{1}}.w, {{1}}.h]",
                    "type": "array",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "as array"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c95a1658-e1ec-4500-8766-abab8f67f865",
                    "script": "{{1}}.x",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "x"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7ee1fb57-7a16-4eff-9077-ade7fad60e86",
                    "script": "{{1}}.y",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "y"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "79df9d07-6894-45bc-bcc8-fc565e66df0c",
                    "script": "{{1}}.w",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8ae2a7ee-712d-4288-ac55-957a7e2b2b72",
                    "script": "{{1}}.h",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "rect",
                            "type": "rect",
                            "suffix": "height"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);
