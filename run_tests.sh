#!/bin/sh

# Runs all the tests on this project. On OS X with Homebrew (you can probably
# use `apt-get` instead of `brew` on Ubuntu):
#
#   $ brew install node phantomjs
#   $ npm install
#
# NOTE: npm (& node) is ONLY required for testing (for now...).

set -e # Exit on first error.
set -x # Print every command.

node-qunit-phantomjs test/runtime.html
phantomjs test/all-blocks-have-functions.js playground.html
