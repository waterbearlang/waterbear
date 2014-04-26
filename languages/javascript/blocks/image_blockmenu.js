(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "images",
            "name": "Images",
            "help": "Image blocks are for loading image files to use in other blocks and for manipulating images. See Sprite and Canvas menus.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "7c40299d-ca48-4aba-a326-45ccb5f9d37b",
                    "script": "local.image##=new Image();local.image##.src={{1}};",
                    "help": "Create a new image from a URL",
                    "sockets": [
                        {
                            "name": "load image##",
                            "type": "url"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "asset",
                            "type": "image",
                            "script": "local.image##",
                            "help": "reference to an image",
                            "sockets": [
                                {
                                    "name": "image##"
                                }
                            ]
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1a6150d8-b3d5-46e3-83e5-a4fe3b00f7db",
                    "script": "local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y);",
                    "help": "draw the HTML &lt;img&gt; into the canvas without resizing",
                    "sockets": [
                        {
                            "name": "draw image",
                            "type": "image"
                        },
                        {
                            "name": "at point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "da300b03-1d39-4865-ab99-beec07b53bb2",
                    "script": "local.ctx.drawImage({{1}},{{2}}.x,{{2}}.y,{{2}}.w,{{2}}.h);",
                    "help": "draw the HTML &lt;img&gt; into the canvas sized to the given dimension",
                    "sockets": [
                        {
                            "name": "draw image",
                            "type": "image"
                        },
                        {
                            "name": "in rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "5514e085-970f-48c2-b6bf-a443488c3c07",
                    "script": "local.ctx.drawImage({{2}},{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h,{{3}}.x,{{3}}.y,{{3}}.w,{{3}}.h);",
                    "help": "draw a rect extracted from image into a rect specified on the canvas",
                    "sockets": [
                        {
                            "name": "draw a rect",
                            "type": "rect"
                        },
                        {
                            "name": "from image",
                            "type": "image"
                        },
                        {
                            "name": "to rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "6c79800c-af02-48e1-b9cb-d043e8299f7a",
                    "script": "local.imageData## = local.ctx.createImageData({{1}}.w,{{1}}.h);",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "imageData##"
                                }
                            ],
                            "script": "local.imageData##",
                            "type": "imagedata"
                        }
                    ],
                    "help": "initialize a new imageData with the specified dimensions",
                    "sockets": [
                        {
                            "name": "create ImageData ImageData## with size",
                            "type": "size"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "2137c296-1666-499c-871c-60226188f031",
                    "script": "local.imageData## = local.ctx.createImageData({{1}});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "imageData##"
                                }
                            ],
                            "script": "local.imageData##",
                            "type": "imagedata"
                        }
                    ],
                    "help": "initialized a new imageData the same size as an existing imageData",
                    "sockets": [
                        {
                            "name": "create ImageData ImageData## from imageData",
                            "type": "imageData"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a2745268-a506-46b6-8d96-e4c275dd5584",
                    "script": "local.imageData## = local.ctx.getImageData({{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "imageData##"
                                }
                            ],
                            "script": "local.imageData##",
                            "type": "imagedata"
                        }
                    ],
                    "help": "returns the image data from the specified rectangle",
                    "sockets": [
                        {
                            "name": "get imageData## for rect",
                            "type": "rect"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "207c93f2-d8c7-4b87-99bf-d79b61faafc2",
                    "script": "local.ctx.putImageData({{1}},{{2}}.x,{{2}}.y);",
                    "help": "draw the given image data into the canvas at the given coordinates",
                    "sockets": [
                        {
                            "name": "draw imageData",
                            "type": "imagedata"
                        },
                        {
                            "name": "at point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "52ecfee7-005f-45ef-8c2a-df7b15dd974f",
                    "script": "local.ctx.putImageData({{2}},{{3}}.x,{{3}}.y,{{1}}.x,{{1}}.y,{{1}}.w,{{1}}.h);",
                    "help": "draw the given image data into the canvas from the given rect to the given position",
                    "sockets": [
                        {
                            "name": "draw a rect",
                            "type": "rect"
                        },
                        {
                            "name": "from imageData",
                            "type": "imagedata"
                        },
                        {
                            "name": "at point",
                            "type": "point"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "578ba232-d1c2-4354-993d-8538bbaf4de2",
                    "script": "{{1}}.width",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "imageData",
                            "type": "imagedata",
                            "suffix": "width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "01bc0775-1a0b-4d0f-b009-786e18417703",
                    "script": "{{1}}.height",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "imageData",
                            "type": "imagedata",
                            "suffix": "height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5e97eed9-acf7-45af-838e-fae9bf85921c",
                    "script": "{{1}}.data",
                    "type": "array",
                    "sockets": [
                        {
                            "name": "imageData",
                            "type": "imagedata",
                            "suffix": "as array"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "7fa79655-4c85-45b3-be9e-a19aa038feae",
                    "script": "runtime.preloadImage('##', {{1}});",
                    "sockets": [
                        {
                            "name": "create ImageData image## from url",
                            "type": "string"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "asset",
                            "sockets": [
                                {
                                    "name": "image ##"
                                }
                            ],
                            "script": "runtime.images[\"##\"]",
                            "type": "image"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "a7e59ad2-47ab-4240-8801-5d66d8f57fc9",
                    "script": "{{1}}.width",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "image",
                            "type": "image",
                            "suffix": "width"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "d9c7d36e-d15f-48a9-9423-1a6497727221",
                    "script": "{{1}}.height",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "image",
                            "type": "image",
                            "suffix": "height"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8d90b1fa-2791-4381-add5-c3c5d238ac0d",
                    "script": "{{1}}.width",
                    "type": "string",
                    "sockets": [
                        {
                            "name": "image",
                            "type": "image",
                            "suffix": "url"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);