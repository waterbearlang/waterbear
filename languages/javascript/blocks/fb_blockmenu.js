(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "facebook",
            "name": "Facebook",
            "help": "Blocks for interacting with Facebook",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "4a2fd78c-4d0e-4c96-8ec3-52a96b2d6920",
                    "script": "FB.api(\"/me/feed/\", \"post\", { message : {{1}} }, $.noop );",
                    "sockets": [
                        {
                            "name": "share",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "4f41013c-b053-439a-b284-769525f6df5d",
                    "script": "fb.friends.data",
                    "type": "array",
                    "sockets": [
                        {
                            "name": "all my friends"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "9f987bdb-87f4-4cf7-aea7-6d282bc0276e",
                    "script": "fb.me",
                    "type": "object",
                    "sockets": [
                        {
                            "name": "me"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c290da4a-c84d-46ac-a6c8-20b367283ea1",
                    "script": "{{1}}.name",
                    "type": "string",
                    "sockets": [
                        {
                            "name": "name of",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "f0361c85-7ed9-4ecf-b5dc-c08da20034e1",
                    "script": "(function(){var img = new Image(); img.src=\"https://graph.facebook.com/\" + {{1}}.id + \"/picture\"; return img;})",
                    "type": "image",
                    "sockets": [
                        {
                            "name": "image of",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "6a4bbc09-5782-43b9-968b-4610c7664d29",
                    "type": "string",
                    "script": "\"https://graph.facebook.com/\" + {{1}}.id + \"/picture\"",
                    "sockets": [
                        {
                            "name": "images url of",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "ac41fb9e-c0c6-4e41-b190-87ba3fdb258d",
                    "script": "(function(){var correct = {id: \"\", name: \"\"}; $.each( fb.friends.data , function(i, user) { if( user.name.indexOf( {{1}} ) != -1 ) correct = user; } ); return correct;})()",
                    "type": "object",
                    "sockets": [
                        {
                            "name": "friend with name like",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "cc6fa7cf-fa7e-47fc-b97a-27f5c83d8d4b",
                    "script": "FB.api( \"/search\", { \"type\" : \"place\", \"center\" : \"{{1}}.latitude,{{1}}.longitude\", \"distance\": \"1000\" }, function(r){ FB.api(\"/me/feed/\", \"post\", { place : r.data[0].id }, $.noop ); } );",
                    "sockets": [
                        {
                            "name": "checkin at",
                            "type": "location"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);