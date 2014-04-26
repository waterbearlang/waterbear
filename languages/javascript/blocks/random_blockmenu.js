(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "random",
            "name": "Random",
            "help": "Various forms of randomness for your code",
            "blocks": [
            	{
            		"blocktype": "expression",
            		"id": "12488f92-1fc4-41fe-a882-95c5d5fe72dd",
            		"type": "number",
            		"script": "Math.random()",
            		"help": "returns a random number between 0.0 and 1.0",
            		"sockets": [
            			{
            				"name": "random float"
            			}
            		]
            	},
                {
                    "blocktype": "expression",
                    "id": "a35fb291-e2fa-42bb-a5a6-2124bb33157d",
                    "type": "number",
                    "script": "randint({{1}}, {{2}})",
                    "help": "random number between two numbers (inclusive)",
                    "sockets": [
                        {
                            "name": "pick random integer from",
                            "type": "number",
                            "value": 1
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 10
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4bc09592-ed3c-4a0c-b0bd-8e520d5385b6",
                    "type": "number",
                    "script": "noise({{1}},{{2}},{{3}})",
                    "help": "generates Perlin noise from 3 dimensions",
                    "sockets": [
                    	{
                    		"name": "noise from x",
                    		"type": "number",
                    		"value": 0.001
                    	},
                    	{
                    		"name": "y",
                    		"type": "number",
                    		"value": 0.002
                    	},
                    	{
                    		"name": "z",
                    		"type": "number",
                    		"value": 0.003
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "24bd9687-b29d-45af-9a00-b7961bcbd65d",
                    "type": "number",
                    "script": "noise({{1}},{{2}},1)",
                    "help": "generates Perlin noise from 2 dimensions",
                    "sockets": [
                    	{
                    		"name": "noise from x",
                    		"type": "number",
                    		"value": 0.001
                    	},
                    	{
                    		"name": "y",
                    		"type": "number",
                    		"value": 0.002
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e3a04097-3fb2-44f8-abe4-2047e15fab21",
                    "type": "number",
                    "script": "noise({{1}},1,1)",
                    "help": "generates Perlin noise from 1 dimension",
                    "sockets": [
                    	{
                    		"name": "noise from x",
                    		"type": "number",
                    		"value": 0.001
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "649ec162-8584-4aeb-b75d-2e55f0551015",
                    "type": "any",
                    "script": "choice({{1}})",
                    "help": "returns a random item from an array, without changing the array",
                    "sockets": [
                    	{
                    		"name": "choose item from",
                    		"type": "array"
                    	}
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f444a3cd-2f1c-48e7-a2df-a2881e7a18fb",
                    "type": "any",
                    "script": "removeChoice({{1}})",
                    "help": "removes a random item from a array and returns the array",
                    "sockets": [
                    	{
                    		"name": "remove random item from",
                    		"type": "array"
                    	}
                    ]
                }
            ]
        }
    );
})(wb);