(function(wb){
'use strict';
    wb.menu(
        {
            "sectionkey": "geolocation",
            "name": "Geolocation",
            "help": "Geolocation blocks are for getting your position on Earth",
            "blocks": [
                {
                    "blocktype": "eventhandler",
                    "id": "0da815af-6010-48b6-838d-f7dd0999b07d",
                    "script": "runtime.location.watchPosition(function(){[[1]]});",
                    "help": "called every time current location is updated",
                    "sockets": [
                        {
                            "name": "track my location"
                        }
                    ],
                    "locals": [
                        {
                            "blocktype": "expression",
                            "type": "location",
                            "script": "runtime.location.currentLocation",
                            "help": "current location",
                            "sockets": [
                                {
                                    "name": "my location"
                                }
                            ]
                        }
                    ]
                },
                {
                    "blocktype": "eventhandler",
                    "id": "a7b25224-a030-4cf5-8f30-026a379d958b",
                    "script": "runtime.location.whenWithinXOf({{1}},{{2}},function(){[[1]]});",
                    "help": "script to call when the distance from a position is less than specified distance",
                    "sockets": [
                        {
                            "name": "when within",
                            "type": "number",
                            "value": 1
                        },
                        {
                            "name": "km of",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "e3bcf430-979b-4fff-a856-d10071c63708",
                    "script": "runtime.location.distance({{1}},{{2}})",
                    "type": "number",
                    "help": "return distance in kilometers between two locations",
                    "sockets": [
                        {
                            "name": "distance between",
                            "type": "location"
                        },
                        {
                            "name": "and",
                            "type": "location"
                        },
                        {
                            "name": "in km"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "84583276-c54c-4db0-b703-e0a7bdc81e71",
                    "script": "{{1}}.latitude",
                    "type": "number",
                    "help": "returns the latitude of a location",
                    "sockets": [
                        {
                            "name": "latitude",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "0afffda9-ef4f-40dc-8ac7-96354417030e",
                    "script": "{{1}}.longitude",
                    "type": "number",
                    "help": "returns the longitude of a location",
                    "sockets": [
                        {
                            "name": "longitude",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "36d3af40-e1ae-4e72-9d7e-26c64938c6ba",
                    "script": "{{1}}.altitude",
                    "type": "number",
                    "help": "returns the altitude of a location, or null if not available",
                    "sockets": [
                        {
                            "name": "altitude (m)",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "86c429bf-2d8d-45fc-8869-7d93f3821032",
                    "script": "{{1}}.heading",
                    "type": "number",
                    "help": "returns the heading of a location update, if moving",
                    "sockets": [
                        {
                            "name": "heading (degrees from north)",
                            "type": "location"
                        }
                    ]
                },
                {
                    "blocktype": "expression",
                    "id": "5454a36d-ed35-4c7e-880a-31849d6bbe98",
                    "script": "{{1}}.speed",
                    "type": "number",
                    "help": "returns the speed of a location update, if moving",
                    "sockets": [
                        {
                            "name": "speed (m/s)",
                            "type": "location"
                        }
                    ]
                }
            ]
        }
    );
})(wb);