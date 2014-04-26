(function(wb){

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