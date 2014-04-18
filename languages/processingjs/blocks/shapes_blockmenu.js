(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "shape",
            "name": "Shape",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "71eb32s1-6cc0-4322-82sc-mh50di3jns2",
                    "script": "strokeWeight({{1}});",
                    "help": "Draws a point, a coordinate in space at the dimension of one pixel",
                    "sockets": [
                        {
                            "name": "stroke weight",
                            "type": "number",
                            "value": "12"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "71eb32s1-6cc0-4322-82sc-4c50779c57e7",
                    "script": "point({{1}}, {{2}});",
                    "help": "Draws a point, a coordinate in space at the dimension of one pixel",
                    "sockets": [
                        {
                            "name": "point x",
                            "type": "number",
                            "value": "30"
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": "20"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "71e73171-6dc0-4122-82cc-4253748618e0",
                    "script": "line({{1}}, {{2}}, {{3}}, {{4}});",
                    "help": "Draws a line (a direct path between two points)",
                    "sockets": [
                        {
                            "name": "line x1",
                            "type": "number",
                            "value": "30"
                        },
                        {
                            "name": "y1",
                            "type": "number",
                            "value": "20"
                        },
                        {
                            "name": "x2",
                            "type": "number",
                            "value": "85"
                        },
                        {
                            "name": "y2",
                            "type": "number",
                            "value": "20"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "82eb3271-6dc0-4a82-81cc-4cf0d94c11e7",
                    "script": "ellipse({{1}}, {{2}}, {{3}}, {{4}});",
                    "help": "Create ellipse",
                    "sockets": [
                        {
                            "name": "ellipse X",
                            "type": "number",
                            "value": "200"
                        },
                        {
                            "name": "Y",
                            "type": "number",
                            "value": "200"
                        },
                        {
                            "name": "radius",
                            "type": "number",
                            "value": "200"
                        },
                        {
                            "name": "radius",
                            "type": "number",
                            "value": "200"
                        }
        
                    ]
                },
               {
                    "blocktype": "step",
                    "id": "715e83281-6c20-4362-824c-4c5277ac19ez",
                    "script": "rect({{1}}, {{2}}, {{3}}, {{4}});",
                    "help": "Draws a rectangle",
                    "sockets": [
                        {
                            "name": "rect x",
                            "type": "number",
                            "value": "30"
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": "20"
                        },
                        {
                            "name": "width",
                            "type": "number",
                            "value": "20"
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": "20"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "018e83781-2c40-4162-824c-09ijek3os91",
                    "script": "triangle({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}});",
                    "help": "A triangle is a plane created by connecting three points",
                    "sockets": [
                        {
                            "name": "triangle x1",
                            "type": "number",
                            "value": "30"
                        },
                        {
                            "name": "y1",
                            "type": "number",
                            "value": "75"
                        },
                        {
                            "name": "x2",
                            "type": "number",
                            "value": "58"
                        },
                        {
                            "name": "y2",
                            "type": "number",
                            "value": "20"
                        },
                        {
                            "name": "x3",
                            "type": "number",
                            "value": "86"
                        },
                        {
                            "name": "y3",
                            "type": "number",
                            "value": "75"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "91e73171-6ec0-4122-82cc-4c5074axc0e7",
                    "script": "quad({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}}, {{7}}, {{8}});",
                    "help": "A quad is a quadrilateral, a four sided polygon",
                    "sockets": [
                        {
                            "name": "quad x1",
                            "type": "number",
                            "value": "38"
                        },
                        {
                            "name": "y1",
                            "type": "number",
                            "value": "31"
                        },
                        {
                            "name": "x2",
                            "type": "number",
                            "value": "86"
                        },
                        {
                            "name": "y2",
                            "type": "number",
                            "value": "20"
                        },
                        {
                            "name": "x3",
                            "type": "number",
                            "value": "69"
                        },
                        {
                            "name": "y3",
                            "type": "number",
                            "value": "63"
                        },
                        {
                            "name": "x4",
                            "type": "number",
                            "value": "30"
                        },
                        {
                            "name": "y4",
                            "type": "number",
                            "value": "76"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "018e83781-2c40-4162-824c-4c5277ac19e7",
                    "script": "arc({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}});",
                    "help": "Draws an arc",
                    "sockets": [
                        {
                            "name": "arc x",
                            "type": "number",
                            "value": "50"
                        },
                        {
                            "name": "y",
                            "type": "number",
                            "value": "55"
                        },
                        {
                            "name": "width",
                            "type": "number",
                            "value": "50"
                        },
                        {
                            "name": "height",
                            "type": "number",
                            "value": "50"
                        },
                        {
                            "name": "start",
                            "type": "number",
                            "value": "0"
                        },
                        {
                            "name": "stop",
                            "type": "number",
                            "value": "PI/2"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "018e83781-2c40-4g62-820c-4852p7ak19e7",
                    "script": "bezier({{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}}, {{7}}, {{8}});",
                    "help": "Draws a Bezier curve",
                    "sockets": [
                        {
                            "name": "bezier x1",
                            "type": "number",
                            "value": "30"
                        },
                        {
                            "name": "y1",
                            "type": "number",
                            "value": "20"
                        },
                        {
                            "name": "cx1",
                            "type": "number",
                            "value": "80"
                        },
                        {
                            "name": "cy1",
                            "type": "number",
                            "value": "5"
                        },
                        {
                            "name": "cx2",
                            "type": "number",
                            "value": "80"
                        },
                        {
                            "name": "cy2",
                            "type": "number",
                            "value": "75"
                        },
                        {
                            "name": "x2",
                            "type": "number",
                            "value": "30"
                        },
                        {
                            "name": "y2",
                            "type": "number",
                            "value": "75"
                        }
                    ]
                }
            ]
        }
        
        
    );
})(wb);