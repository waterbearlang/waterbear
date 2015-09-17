var fs = require('fs')
var parse5 = require('parse5');
var parser = new parse5.Parser();

var filename = process.argv[2];
if (!filename){
    console.log('You must supply a filename');
    process.exit();
}
var origHtml = fs.readFileSync(filename, {encoding: 'utf-8'});
var document = parser.parseFragment(origHtml);

// Do the refactoring here
function walk(node, fn){
    fn(node);
    if (!node['childNodes']) return;
    node.childNodes.forEach(function(child){
        walk(child,fn);
    });
}

function hasScript(node){
    if (node.tagName){
        // console.log(node.tagName);
    }
    if (!node['attrs']) return;
    node.attrs.forEach(function(attr){
        if (attr.name === 'script'){
            var script = attr.value;
            var nsFn = script.split('.');
            attr.name = 'ns'
            attr.value = nsFn[0];
            node.attrs.push({name: 'fn', value: nsFn[1]});
        }
    });
}
walk(document, hasScript);

var serializer = new parse5.Serializer();
var refactoredHtml = serializer.serialize(document);
fs.writeFileSync(filename, refactoredHtml);
