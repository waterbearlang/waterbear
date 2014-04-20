(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "sound",
            "name": "Sound",
            "help": "Sound blocks can load and play sound files (wav, mp3, ogg) if those files are supported by your browser.",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "59f338b4-0f2f-489a-b4bd-b458fcb48e37",
                    "script": "global.preloadAudio('##', {{1}});",
                    "sockets": [
                        {
                            "name": "load audio## from url",
                            "type": "string"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "asset",
                            "sockets": [
                                {
                                    "name": "audio ##"
                                }
                            ],
                            "script": "global.audio[\"##\"]",
                            "type": "sound"
                        }
                    ],
                    "help": "Load a sound for playback"
                },
                {
                    "blocktype": "step",
                    "id": "4deb2817-6dfc-44e9-a885-7f4b350cc81f",
                    "script": "{{1}}.currentTime=0;{{1}}.play();",
                    "sockets": [
                    	{
                    		"name": "play sound",
                    		"type": "sound"
                    	}
                    ],
                    "help": "play a sound"
                },
                {
                    "blocktype": "step",
                    "id": "eb715a54-c1f2-4677-819a-9427537bad72",
                    "script": "{{1}}.pause();",
                    "sockets": [
                    	{
                    		"name": "pause sound",
                    		"type": "sound"
                    	}
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "79f14360-3a3b-48de-83ae-240977cf343b",
                    "script": "{{1}}.loop={{2}};",
                    "sockets": [
                    	{
                    		"name": "set sound",
                    		"type": "sound"
                    	},
                    	{
                    		"name": "looping to",
                    		"type": "boolean"
                    	}
        
                    ]
                }
            ]
        }
        
    );
})(wb);