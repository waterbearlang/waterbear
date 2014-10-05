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
                    "script": "{w: convert({{1}}), h: convert({{2}})}",
                    "type": "size",
                    "sockets": [
                        {
                            "name": "size with width",
                            "type": "number",
                            "value": 32,
                            "min": 0,
                            "quantity": "length",
                            "unit": "% width"
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": 32,
                            "min": 0,
                            "quantity": "length",
                            "unit": "% height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "33f2a3b7-5d87-4481-ad1c-f2970915db51",
                    "script": "convert({{1}}.w)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "size",
                            "type": "size",
                            "suffix": "width",
                            "quantity": "length",
                            "unit": "% width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2d449e0e-cb18-473f-a574-614320b7ba22",
                    "script": "convert({{1}}.h)",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "size",
                            "type": "size",
                            "suffix": "height",
                            "quantity": "length",
                            "unit": "% height"
                        }
                    ]
                }
            ]
        }

    );
})(wb);
