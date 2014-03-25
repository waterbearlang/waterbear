(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "music",
            "name": "Music",
            "help": "Music blocks are for creating and manipulating sound programmatically, generating the sounds rather than playing back a recorded audio file (see the Sound menu for that).",
            "blocks": [
                {
                    "blocktype": "step",
                    "id": "ac1d8b1a-013c-46e0-b5e7-f241c594a7c7",
                    "script": "local.voice## = new Voice();",
                    "locals": [
                        {
                            "blocktype": "expression",
                            "sockets": [
                                {
                                    "name": "voice##"
                                }
                            ],
                            "script": "local.voice##",
                            "type": "voice"
                        }
                    ],
                    "help": "create a simple voice to play tones",
                    "sockets": [
                        {
                            "name": "voice##"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "ee91b7ec-d52b-45ff-bd13-ff8a8e5e50fb",
                    "help": "set the frequency of the voice",
                    "script": "(function(voice, freq){voice.frequency = freq; voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "tone",
                            "type": "number",
                            "value": 440,
                            "suffix": "Hz"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "60984C26-0854-4075-994B-9573B3F48E95",
                    "help": "set the note of the voice",
                    "script": "(function(voice, note){voice.setNote(note); voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "note",
                            "type": "string",
                            "options": "notes",
                            "value": "A4"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "a133f0ad-27e6-444c-898a-66410c447a07",
                    "help": "set the volume of the voice",
                    "script": "(function(voice, vol){voice.volume = vol; voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "volume",
                            "type": "number",
                            "value": 1
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "A64A4BC7-4E93-47B4-910B-F185BC42E366",
                    "help": "set the tempo of the voice, for determining the length of a quarter note",
                    "script": "(function(voice, tempo){voice.tempo = tempo; voice.updateTone();})({{1}}, {{2}});",
                    "sockets": [
                        {
                            "name": "set voice",
                            "type": "voice"
                        },
                        {
                            "name": "tempo quarter note =",
                            "type": "number",
                            "value": 120,
                            "suffix": "beats per minute"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c1ce82b2-9810-41e0-b96e-44702982372b",
                    "script": "{{1}}.frequency",
                    "help": "get frequency of a voice",
                    "type": "number",
                    "sockets": [
                        {
                            "name": "voice",
                            "type": "voice",
                            "suffix": "Hz"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "e4a4949f-1010-4026-a070-2555dbf3be0e",
                    "script": "{{1}}.startOsc();",
                    "help": "turn the voice on",
                    "sockets": [
                        {
                            "name": "turn voice",
                            "type": "voice",
                            "suffix": "on"
                        }
                    ]
                },
                        {
                    "blocktype": "step",
                    "id": "c471bc07-fe25-4c6d-a5ef-4ee7f3076561",
                    "script": "{{1}}.stopOsc();",
                    "help": "turn the voice off",
                    "sockets": [
                        {
                            "name": "turn voice",
                            "type": "voice",
                            "suffix": "off"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "2003f5ae-0bef-4517-aad4-7baf4457a823",
                    "script": "(function(voice, sec){voice.startOsc();setTimeout(function() {voice.stopOsc();}, 1000 * sec);})({{1}},{{2}});",
                    "help": "play the voice for a number of seconds",
                    "sockets": [
                        {
                            "name": "play voice",
                            "type": "voice"
                        },
                        {
                            "name": "for ",
                            "type": "number",
                            "value": 2,
                            "suffix": "seconds"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "1F98BD7B-8E13-4334-854B-6B9C1B31C99D",
                    "script": "(function(voice, note, len, dots){voice.push(note,len,dots);})({{1}},{{2}},{{3}},{{4}});",
                    "help": "schedule a note to be played as part of a song",
                    "sockets": [
                        {
                            "name": "schedule voice",
                            "type": "voice"
                        },
                        {
                            "name": "to play note",
                            "type": "string",
                            "options": "notes",
                            "value": "A4"
                        },
                        {
                            "name": "as ",
                            "type": "string",
                            "options": "durations",
                            "value": "quarter note"
                        },
                        {
                            "name": "dotted",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "24875971-7CB4-46A6-8A53-D966424A3E70",
                    "script": "(function(voice, note, len, dots){voice.push(note,len,dots);})({{1}},'none',{{2}},{{3}});",
                    "help": "schedule a note to be played as part of a song",
                    "sockets": [
                        {
                            "name": "schedule voice",
                            "type": "voice"
                        },
                        {
                            "name": "to rest for a ",
                            "type": "string",
                            "options": "durations",
                            "value": "quarter note"
                        },
                        {
                            "name": "dotted",
                            "type": "number",
                            "value": 0
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "34788069-BF4F-46DB-88DC-FC437F484A80",
                    "script": "(function(voice){voice.play();})({{1}});",
                    "help": "play the scheduled song",
                    "sockets": [
                        {
                            "name": "play voice",
                            "type": "voice",
                            "suffix": "stored song"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "112ffdd3-7832-43df-85a5-85587e951295",
                    "script": "{{1}}.on",
                    "help": "get whether the voice is turned on or off",
                    "type": "boolean",
                    "sockets": [
                        {
                            "name": "voice",
                            "type": "voice",
                            "suffix": "is on?"
                        }
                    ]
                }
            ]
        }
    );
})(wb);