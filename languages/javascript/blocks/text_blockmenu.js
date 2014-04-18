(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "text",
            "name": "Text",
            "help": "Text blocks represent and manipulate the way text is drawn to the screen, things like alignment, font, and size.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "d16df0dc-f90a-4e21-967d-f054956c8135",
                    "script": "local.ctx.font = {{1}}+{{2}}+\" \"+{{3}};",
                    "help": "set the current font",
                    "sockets": [
                        {
                            "name": "font",
                            "type": "number",
                            "value": 10
                        },
                        {
                            "name": "",
                            "type": "string",
                            "options": "unit",
                            "value": "px"
                        },
                        {
                            "name": "",
                            "type": "string",
                            "value": "sans-serif"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7ea4ef80-8355-4987-8d3b-165367b97cc1",
                    "script": "local.ctx.textAlign = {{1}};",
                    "help": "how should the text align?",
                    "sockets": [
                        {
                            "name": "text align",
                            "type": "string",
                            "options": "align",
                            "value": "left"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "46345cbf-e095-4b34-9d37-c9dcc22da7db",
                    "script": "local.ctx.textBaseline = {{1}};",
                    "help": "set the text baseline",
                    "sockets": [
                        {
                            "name": "text baseline",
                            "type": "string",
                            "options": "baseline",
                            "value": ""
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "9f3fb819-f8a9-4929-87c8-6c6742b4cb2d",
                    "script": "local.ctx.fillText({{1}},{{2}},{{3}});",
                    "help": "basic text operation",
                    "sockets": [
                        {
                            "name": "fill text",
                            "type": "string"
                        },
                        {
                            "name": "x",
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
                    "id": "742ee568-8a27-49d5-9dce-8b9151b30bef",
                    "script": "local.ctx.fillText({{1}},{{2}},{{3}},{{4}});",
                    "help": "basic text operation with optional max width",
                    "sockets": [
                        {
                            "name": "fill text",
                            "type": "string"
                        },
                        {
                            "name": "x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "max width",
                            "type": "number",
                            "value": 10
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "b9bfe426-3110-4b67-bc4e-5da48103e890",
                    "script": "local.ctx.strokeText({{1}},{{2}},{{3}});",
                    "help": "outline the text",
                    "sockets": [
                        {
                            "name": "stroke text",
                            "type": "string"
                        },
                        {
                            "name": "x",
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
                    "id": "6d03d273-8c5d-4059-b525-641ceb7ed662",
                    "script": "local.ctx.strokeText({{1}},{{2}},{{3}},{{4}});",
                    "help": "outline the text with optional max width",
                    "sockets": [
                        {
                            "name": "stroke text",
                            "type": "string"
                        },
                        {
                            "name": "x",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "max width",
                            "type": "number",
                            "value": 10
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "7edfa688-bdbb-491b-9011-4cb866b7dc2e",
                    "script": "local.ctx.measureText({{1}}).width",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "text",
                            "type": "string",
                            "suffix": "width"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);