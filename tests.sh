#!/bin/sh

node-qunit-phantomjs test/runtime.html && phantomjs test/all-blocks-have-functions.js playground.html
