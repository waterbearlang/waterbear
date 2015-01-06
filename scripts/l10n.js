(function(wb){

String.toLocaleString({
    "en": {
        "javascript playground":"javascript playground",
        "File▾": "File▾",
        "New": "New",
        "Open Gist": "Open Gist",
        "Open File": "Open File",
        "Save Gist": "Save Gist", 
        "Save File": "Save File",
        "Examples▾": "Examples▾",
        "View▾": "View▾",
        "Blocks Menu": "Blocks Menu",
        "Scripts Workspace": "Scripts Workspace",
        "Tutorial": "Tutorial",
        "Scratchpad": "Scratchpad",
        "Preview": "Preview",
        "Text Script": "Text Script",
        "Run Full Size": "Run Full Size",
        "Show IDE": "Show IDE",
        "Undo": "Undo",
        "Redo": "Redo",
        "search":"search",
        "Tutorial goes here": "Tutorial goes here",
        "Scratch space, drag blocks here to re-use": "Scratch space, drag blocks here to re-use",
        "Workspace": "Workspace",
        "Show/Hide blocks": "Show/Hide blocks",
        "Save": "Save",
    },
    "es": {
        "javascript playground":"playa de javascript",
        "File▾": "Archivo▾",
        "New": "Nuevo",
        "Open Gist": "Abra Gist",
        "Open File": "Abra Archivo",
        "Save Gist": "Guarde Gist",
        "Save File": "Guarde Archivo",
        "Examples▾": "Ejemplos▾",
        "View▾": "Vista▾",
        "Blocks Menu": "Blocks Menu",
        "Scripts Workspace": "Scripts Workspace",
        "Tutorial": "Tutorial",
        "Scratchpad": "Scratchpad",
        "Preview": "Preview",
        "Text Script": "Text Script",
        "Run Full Size": "Run Full Size",
        "Show IDE": "Show IDE",
        "Undo": "Undo",
        "Redo": "Redo",
        "search":"search",
        "Tutorial goes here": "Tutorial goes here",
        "Scratch space, drag blocks here to re-use": "Scratch space, drag blocks here to re-use",
        "Workspace": "Workspace",
        "Show/Hide blocks": "Show/Hide blocks",
        "Save": "Save",
    }
});

var localize = function (string, fallback) {
    var localized = string.toLocaleString();
    if (localized !== string) {
        return localized;
    } else {
        return fallback;
    }
};

var elements = document.getElementsByClassName('l10n'); 
for (var i=0; i<elements.length; i++) {
    // localize(key, default)
    var element = elements[i];
    element.textContent = localize(element.textContent, element.textContent);
}
// document.documentElement.dir = localize("%locale.dir", document.documentElement.dir);

document.documentElement.lang = String.locale || document.documentElement.lang;

/* old Obj will be overwritten by newObj */
function overwriteAttributes(oldObj, newObj) {
 
    if (!newObj || ! oldObj)
        return;

    var oldObjQueue = [];
    var newObjQueue = [];
    oldObjQueue.push(oldObj);
    newObjQueue.push(newObj);

    while (oldObjQueue.length && newObjQueue.length) {

        // pop object to investigate. 
        var currOldObj = oldObjQueue.pop();
        var currNewObj = newObjQueue.pop();

        // Objects: get strings values of keys in current object     
        // Arrays:  get the integer values of all indexes into array 
        //          (this is obviously 0...n)     
        // 
        // This isn't the cleanest approach, but it keeps me from creating
        // a more complex structure with typeof array or typeof object
        var keys = Object.keys(currNewObj);

        // iterate through all keys 
        for (var idx in keys) {
            var key = keys[idx];

            if (typeof currNewObj[key] === "object" && currNewObj[key] !== null) {

                // if it's an object, queue it to dive into it later
                newObjQueue.push(currNewObj[key]);
                oldObjQueue.push(currOldObj[key]);

            } else {

                // if anything but object, overwrite value from new object in old object 
                currOldObj[key] = currNewObj[key];
            }
        }
    }
}

wb.overwriteAttributes = overwriteAttributes;

})(wb);

if (wb.l10nHalfDone) {
    console.log("l10n populating");
    wb.populateMenu();
} else {
    console.log("l10n done");
    wb.l10nHalfDone = true;
}