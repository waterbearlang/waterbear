(function(wb){

String.toLocaleString({
    "en": {
        "javascript playground":"javascript playground",
        "New": "New",
        "%open_gist_button": "Open Gist",
        "%open_file_button": "Open File",
        "%save_gist_button": "Save Gist",
        "%save_file_button": "Save File",
    },
    "es": {
        "javascript playground":"playa de javascript",
        "New": "Nuevo",
        "%open_gist_button": "Abra Gist",
        "%open_file_button": "Abra Archivo",
        "%save_gist_button": "Guarde Gist",
        "%save_file_button": "Guarde Archivo",
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
    // console.log("l10n populating");
    wb.populateMenu();
} else {
    // console.log("l10n done");
    wb.l10nHalfDone = true;
}