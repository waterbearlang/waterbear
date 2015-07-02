var fs = require('fs')
var parse5 = require('parse5');
var parser = new parse5.Parser();

var filename = process.argv[2];
var origHtml = fs.readFileSync(filename, {encoding: 'utf-8'});
var document = parser.parse(origHtml);

// Do the refactoring here

var serializer = new parse5.Serializer();
var refactoredHtml = serializer.serialize(document);
fs.writeFileSync(filename + '.ref', refactoredHtml);
