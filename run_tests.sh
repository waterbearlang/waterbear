#!/bin/sh

# Runs all the tests on this project. On OS X with Homebrew (you can probably
# use `apt-get` instead of `brew` on Ubuntu):
#
#   $ brew install node phantomjs
#   $ npm install
#
# NOTE: npm (& node) is ONLY required for testing (for now...).
# NOTE: This is intended to be run using `npm test`; or by otherwise
# explicitly putting `./node_modules/.bin` on the path e.g.:
#
#   $ env PATH="./node_modules/.bin:$PATH" ./run_tests.sh

set -e # Exit on first error.
set -x # Print every command.

# Run QUnit tests.
node-qunit-phantomjs test/runtime.html
# Ensure all blocks have valid functions.
phantomjs test/all-blocks-have-functions.js playground.html
# Validate CSS.
prettycss css/{block,app,widget}.css
