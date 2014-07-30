(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sizes",
            "name": "Sizes",
            "help": "Size blocks represent a width and height. They are often used as components of Rects.",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "d8e71067-afc2-46be-8bb5-3527b36474d7",
                    "script": "{w: convert({{1}}, {{2}}, true), h: convert({{3}}, {{4}}, false)}",
                    "type": "size",
                    "sockets": [
                        {
                            "name": "size with width",
                            "type": "number",
                            "value": 32,
                            "min": 0
                        },
                        {
                            "name": "width units",
                            "type": "string",
                            "value": "choice",
                            "options": "relativeUnit"
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 32,
                            "min": 0
                        },
                        {
                            "name": "height units",
                            "type": "string",
                            "value": "choice",
                            "options": "relativeUnit"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "404cb2f4-abe5-4c3b-a9da-9b44050e012d",
                    "script": "{w: convert({{1}}[0], {2}, true), h: convert({{1}}[1], {3}, false)",
                    "type": "size",
                    "sockets": [
                        {
                            "name": "size from array",
                            "type": "array"
                        },
                        {
                            "name": "width units",
                            "type": "string",
                            "value": "choice",
                            "options": "relativeUnit"
                        },
                        {
                            "name": "height units",
                            "type": "string",
                            "value": "choice",
                            "options": "relativeUnit"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "33f2a3b7-5d87-4481-ad1c-f2970915db51",
                    "script": "convert({{1}}.w, {2}, true)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "size",
                            "type": "size",
                            "suffix": "width"
                        },
                        {
                            "name": "width units",
                            "type": "string",
                            "value": "px",
                            "options": "relativeUnit"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2d449e0e-cb18-473f-a574-614320b7ba22",
                    "script": "convert({{1}}.h, {2}, false)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "size",
                            "type": "size",
                            "suffix": "height"
                        },
                        {
                            "name": "height units",
                            "type": "string",
                            "value": "px",
                            "options": "relativeUnit"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7ca31ad7-946a-4587-a5c8-d6b8879dc4e2",
                    "script": "[{{1}}.w, {{1}}.h]",
                    "type": "array",
                    "sockets": [
                        {
                            "name": "size",
                            "type": "size",
                            "suffix": "as array"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);