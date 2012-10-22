# Embedding Waterbear #

Work has finally begun on embedding waterbear. There are several pieces to this.

1. √ Improving the waterbear script serialization (and documenting it)
2. √ Making scripts carry their own set of dependencies (esp. what language and blocks are required)
3. Having a minimal set of files to load for viewing and executing a script.
4. Storing serialized scripts as Gists: saving, loading, editing, removing, listing, searching
5. UI for embedded scripts allowing scripts to be edited and run with minimal space requirements, in an iframe
6. Using embedded scripts in the main Waterbear IDE as the primary way to run scripts (improving script isolation)