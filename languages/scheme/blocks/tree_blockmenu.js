(function(wb){
    'use strict';
    wb.menu({
        "sectionkey": "trees",
        "name": "Trees",
        "help": "Tree blocks are for creating a binary tree data structure.",
        "blocks": [
            {
                "blocktype": "expression",
                "id": "13eaa1bd-ddc6-496f-a1d3-e6924129b869",
                "script": "(list {{1}} {{2}} {{3}})",
                "type": "tree",
                "help": "create a new binary tree given a data element, a left subtree, and a right subtree",
                "sockets": [
                    {
                        "name": "left subtree",
                        "type": "tree"
                    },
                    {
                        "name": "data",
                        "type": "any"
                    },
                    {
                        "name": "right subtree",
                        "type": "tree"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "0ca32238-2681-496f-b1ad-e6e146c729bc",
                "script": "(list {{1}})",
                "type": "tree",
                "help": "Create a binary tree of only one element",
                "sockets": [
                    {
                        "name": "data",
                        "type": "any"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "7bc79894-a495-4464-ae5d-2d47b66cbfc6",
                "script": "(listToTree {{1}})",
                "type": "tree",
                "help": "Convert a list to a tree",
                "sockets": [
                    {
                        "name": "list",
                        "type": "list",
                        "suffix": "of tree"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "03703fac-5252-456d-bb1b-46b9a1bd0ca8",
                "script": "(car {{1}})",
                "type": "tree",
                "help": "get the left subtree. The tree cannot be a leaf",
                "sockets": [
                    {
                        "name": "left subtree of",
                        "type": "tree"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "53b0ff25-3761-4597-870e-76ffc4afeacf",
                "script": "(caddr {{1}})",
                "type": "tree",
                "help": "get the right subtree. The free cannot be a leaf",
                "sockets": [
                    {
                        "name": "right subtree of",
                        "type": "tree"
                    }
                ]
            },
            {
                "blocktype": "expression",
                "id": "102ce9b4-ae29-4bd5-9bbc-effbbd3a177a",
                "script": "(if (equals? (cdr {{1}}) ()) (car {{1}}) (cadr {{1}}))",
                "type": "tree",
                "help": "get the data of ",
                "sockets": [
                    {
                        "name": "right subtree of",
                        "type": "tree"
                    }
                ]
            }
        ]
    });
})(wb);
