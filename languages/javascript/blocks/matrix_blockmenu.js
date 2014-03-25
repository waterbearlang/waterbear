(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "matrix",
            "name": "Matrix",
            "help": "Matrix blocks can be used to store more complex tranformations on the canvas",
            "blocks": [
                {
                    "blocktype": "step",
                    "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.transform.apply(local.ctx, {{1}});",
                    "help": "transform by an arbitrary matrix [a,b,c,d,e,f]",
                    "sockets": [
                        {
                            "name": "transform by 6-matrix",
                            "type": "array"
                        }
                    ],
                    "id": "b65e02c5-b990-4ceb-ab18-2593337103d9"
                },
                {
                    "blocktype": "step",
                    "id": "e4787583-77ce-4d45-a863-50dcb4e87af0",
                    "script": "if ({{1}}.length !== 6){alert(\"Array must have 6 numbers\"); return false;}local.ctx.setTransform.apply(local.ctx, {{1}});",
                    "help": "set transform to an arbitrary array [a,b,c,d,e,f]",
                    "sockets": [
                        {
                            "name": "set transform to 6-matrix",
                            "type": "array"
                        }
                    ]
                }
            ]
        }
    );
})(wb);