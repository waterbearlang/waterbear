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

function dropNSFromClasses(node){
    if (!node['attrs']) return;
    var klass, namespace, index;
    node.attrs.forEach(function(attr, idx){
        if (attr.name === 'class'){
            klass = attr.value;
            index = idx;
        }else if (attr.name == 'ns'){
            namespace = attr.value;
        }
    });
    if (klass && namespace){
        // if class only has value of ns attribute, delete class
        // if there is no ns attribute, continue on as if nothing happened, whistling softly
        // if class holds ns and other values, just remove ns from classlist
        if (klass === namespace){
            node.attrs.splice(index, 1);
            console.log('removing class %s', klass);
            return;
        }
        var classes = klass.split(/\s+/);
        if (classes.indexOf(namespace) > -1){
            classes.splice(classes.indexOf(namespace), 1);
            console.log('updating class %s (%s) to remove %s: %s', klass, node.attrs[index].value, namespace, classes.join(' '));
            node.attrs[index].value = classes.join(' ');
        }
    }
}
walk(document, dropNSFromClasses);

var serializer = new parse5.Serializer();
var refactoredHtml = serializer.serialize(document);
fs.writeFileSync(filename, refactoredHtml);
