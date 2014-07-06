(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "strings",
            "name": "Strings",
            "help": "String blocks represent or manipulate bits of text (strings of characters)",
            "blocks": [
                {
                    "blocktype": "expression",
                    "id": "cdf5fa88-0d87-45d1-bf02-9ee4ec4c5565",
                    "script": "{{1}}.split({{2}})",
                    "type": "array",
                    "help": "create an array by splitting the named string on the given string",
                    "sockets": [
                        {
                            "name": "split string",
                            "type": "string"
                        },
                        {
                            "name": "on separator",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e1951d04-dc2f-459e-9d7a-4796f29169ea",
                    "type": "string",
                    "script": "({{1}} + {{2}})",
                    "help": "returns a string by joining together two strings",
                    "sockets": [
                        {
                            "name": "concatenate",
                            "type": "string",
                            "value": "hello"
                        },
                        {
                            "name": "with",
                            "type": "string",
                            "value": "world"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "3889BB61-FC62-4BED-B0EC-792AF636EC18",
                    "type": "string",
                    "script": "{{1}}.repeat({{2}})",
                    "help": "returns a string by joining together copies of the original string",
                    "sockets": [
                        {
                            "name": "repeat",
                            "type": "string",
                            "value": "hello"
                        },
                        {
                            "name": "",
                            "type": "number",
                            "value": 2,
                            "min": 0
                        },
                        {
                            "name": "times"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e71d4b0b-f32e-4b02-aa9d-5cbe76a8abcb",
                    "script": "{{1}}[{{2}}]",
                    "type": "string",
                    "help": "get the single character string at the given index of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string"
                        },
                        {
                            "name": "character at",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "304A88C6-FFF3-4DA5-9522-6DAF99E89F10",
                    "script": "{{1}}[{{1}}.length-{{2}}]",
                    "type": "string",
                    "help": "get the single character string at the given index from the end of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "character at",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "from the end"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "6BA0B0CF-6F22-4384-8A16-630C745FA3D3",
                    "script": "{{1}}.substr({{2}},{{3}})",
                    "type": "string",
                    "help": "get the substring of specified length starting at the given index of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "substring at",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "of length",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "A41F840C-C64A-4047-9EBD-CF7152EA5D7B",
                    "script": "{{1}}.slice({{2}},{{3}}+1)",
                    "type": "string",
                    "help": "get the substring starting at the given index of named string and ending at the second given index",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "substring from",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        },
                        {
                            "name": "to",
                            "type": "number",
                            "value": 0,
                            "min": 0
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "c1eda8ae-b77c-4f5f-9b9f-c11b65235765",
                    "script": "{{1}}.length",
                    "type": "number",
                    "help": "get the length of named string",
                    "sockets": [
                        {
                            "name": "string",
                            "type": "string",
                            "suffix": "length"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "cc005f19-e1b9-4f74-8fd0-91faccedd370",
                    "script": "{{1}}.indexOf({{2}})",
                    "type": "number",
                    "help": "get the index of the substring within the named string",
                    "sockets": [
                        {
                            "name": "search string",
                            "type": "string"
                        },
                        {
                            "name": "for substring",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "037BB272-ADA5-41E4-BE9E-5FACA42F02C8",
                    "script": "{{1}}.contains({{2}})",
                    "type": "boolean",
                    "help": "check for the substring within the named string",
                    "sockets": [
                        {
                            "name": "test string",
                            "type": "string"
                        },
                        {
                            "name": "for substring",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8b536c13-4c56-471e-83ac-cf8648602df4",
                    "script": "{{1}}.replace({{2}}, {{3}})",
                    "type": "string",
                    "help": "get a new string by replacing a substring with a new string",
                    "sockets": [
                        {
                            "name": "replace",
                            "type": "string"
                        },
                        {
                            "name": "with",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "3047CA98-2E78-4D0B-BD88-6F4D1B3E8420",
                    "script": "{{1}}.replace({{2}}g, {{3}})",
                    "type": "string",
                    "help": "get a new string by replacing a pattern with a new string using regular expressions",
                    "sockets": [
                        {
                            "name": "in string",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "replace pattern",
                            "type": "regex",
                            "value": null
                        },
                        {
                            "name": "with",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "1D76122E-1E5D-4A19-AA5E-267B41A788FA",
                    "script": "{{1}}.trim()",
                    "type": "string",
                    "help": "remove trailing and leading whitespace",
                    "sockets": [
                        {
                            "name": "trim whitespace from",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "85CA02CB-229F-4DF5-8400-4AFA2BA8E627",
                    "script": "{{1}}.toUpperCase()",
                    "type": "string",
                    "help": "change to uppercase",
                    "sockets": [
                        {
                            "name": "to uppercase",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5AD79C7C-321E-4588-B05D-DB1FEF86B82D",
                    "script": "{{1}}.toLowerCase()",
                    "type": "string",
                    "help": "change to lowercase",
                    "sockets": [
                        {
                            "name": "to lowercase",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "DBA355CF-0F3A-4BA1-BBD7-2F8BDCE8C3CC",
                    "type": "boolean",
                    "script": "({{1}} === {{2}})",
                    "help": "two strings are equal",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "=",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "46391AF0-3002-4A58-85BA-C670FE743219",
                    "type": "boolean",
                    "script": "({{1}} !== {{2}})",
                    "help": "two strings are not equal",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "≠",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "C9B4EC06-0C82-458F-AB99-E5BB620269D7",
                    "type": "boolean",
                    "script": "({{1}} < {{2}})",
                    "help": "first string precedes second string in lexicographical ordering",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "<",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "085AD019-E831-4501-A058-34A7A1E6744D",
                    "type": "boolean",
                    "script": "({{1}} <= {{2}})",
                    "help": "first precedes or is equal to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "≤",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "684A6EDF-7351-4DCF-AE93-EEA4AF1B41A5",
                    "type": "boolean",
                    "script": "({{1}} > {{2}})",
                    "help": "second string precedes first string in lexicographical ordering",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": ">",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "149FFB1E-4143-4724-BBBA-EEE133F517A7",
                    "type": "boolean",
                    "script": "({{1}} >= {{2}})",
                    "help": "first string succeeds or is equal to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "≥",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "55FC2AC3-7C0E-43CD-BDDE-8E890073EDAC",
                    "type": "boolean",
                    "script": "{{1}}.startsWith({{2}})",
                    "help": "first string starts with to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "starts with",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "2F3963B1-1FAC-402A-B5B6-86927DCD3241",
                    "type": "boolean",
                    "script": "{{1}}.endsWith({{2}})",
                    "help": "first string ends with to second string",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "ends with",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "73A7E675-E152-454A-9B60-A7C3D54F603C",
                    "type": "boolean",
                    "script": "{{2}}.test({{1}})",
                    "help": "first string matches the given regular expression",
                    "sockets": [
                        {
                            "name": "",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "matches pattern",
                            "type": "regex",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "D8EF192D-16BD-42AA-98A0-C6C2236392F7",
                    "script": "levenshtein({{1}},{{2}})",
                    "type": "number",
                    "help": "calculate how much two strings are different using Levenshtein difference",
                    "sockets": [
                        {
                            "name": "difference of strings",
                            "type": "string",
                            "value": null
                        },
                        {
                            "name": "and",
                            "type": "string",
                            "value": null
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "8eaacf8a-18eb-4f21-a1ab-a356326f7eae",
                    "script": "{{1}}.toString()",
                    "type": "string",
                    "help": "convert any object to a string",
                    "sockets": [
                        {
                            "name": "to string",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "48bb8639-0092-4384-b5a0-3a772699dea9",
                    "script": "/* {{1}} */",
                    "help": "this is a comment and will not be run by the program",
                    "sockets": [
                        {
                            "name": "comment",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "2f178d61-e619-47d0-b9cf-fcb52625c2a3",
                    "script": "window.alert({{1}});",
                    "help": "pop up an alert window with string",
                    "sockets": [
                        {
                            "name": "alert",
                            "type": "string"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "8496b7af-129f-48eb-b15b-8803b7617493",
                    "script": "console.log({{1}});",
                    "help": "Send any object as a message to the console",
                    "sockets": [
                        {
                            "name": "console log",
                            "type": "any"
                        }
                    ]
                },
                {
                    "blocktype": "step",
                    "id": "8bfaf131-d169-4cf4-afe4-1d7f02a55341",
                    "script": "var __a={{2}};__a.unshift({{1}});console.log.apply(console, __a);",
                    "help": "send a message to the console with a format string and multiple objects",
                    "sockets": [
                        {
                            "name": "console log format",
                            "type": "string"
                        },
                        {
                            "name": "arguments",
                            "type": "array"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "06ddcfee-76b7-4be4-856d-44cda3fb109b",
                    "script": "runtime.keys",
                    "help": "for debugging",
                    "type": "object",
                    "sockets": [
                        {
                            "name": "global keys object"
                        }
                    ]
                }
            ]
        }
        
    );
})(wb);