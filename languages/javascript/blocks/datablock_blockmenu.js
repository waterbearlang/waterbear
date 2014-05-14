(function(wb){
'use strict';
    wb.menu(
        {
        "sectionkey": "datablock",
        "name": "DataBlock",
        "help": "Retrieve Remote Data",
        "blocks": [
            {
                "blocktype": "step",
                "id": "744f4e58-b99e-4df5-9f1a-27c03c312811",
                "script": "local.datablock## = new DataBlock({{1}});",
                "locals": [
                    {
                        "blocktype": "expression",
                        "sockets": [
                            {
                                "name": "datablock##"
                            }
                        ],
                        "script": "local.datablock##",
                        "type": "datablock"
                    }
                ],
                "help": "create a simple datablock",
                "sockets": [
                    {
                        "name": "datablock ## url",
                        "type": "string",
                        "value": "data.gc.ca/data/api/action/package_show?id=6a26595e-3b66-4591-b795-87702ed5d58e"
                    }
                ]
            },
            {
                "blocktype": "step",
                "id": "332d17f7-01f1-400f-b011-d07a91caf0d9",
                "script": "{{1}}.getData();",
                "help": "retrieve data from website",
                "sockets": [
                    {
                        "name": "retrieve data",
                        "type": "datablock"
                    }
                ]
            }
        ]
    }
            
        
    );
})(wb);