(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "twitter",
            "name": "Twitter",
            "help": "Social blocks are intended for working with social networking sites",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "467848f3-3493-439a-9228-d6f83007e886",
                    "script": "local.getTweet({{1}}, function(tweet){local.tweet## = tweet;[[1]]});",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "last tweet##"
                                }
                            ],
                            "script": "local.tweet## || \"waiting…\"",
                            "type": "string"
                        }
                    ],
                    "help": "asynchronous call to get the last tweet of the named account",
                    "sockets": [
                        {
                            "name": "get tweet for",
                            "type": "string"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);