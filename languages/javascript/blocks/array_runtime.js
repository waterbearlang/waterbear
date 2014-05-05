
//Calculate sum of number array
function sum(arr){
    if(arr.length==0) {
        console.error("Array is empty!");
        return NaN;
    }
    var total= 0;
    for(var i = 0; i < arr.length; i++){
        if(typeof arr[i] != "number") {
            console.error("Non-numerical value in array!");
            return NaN;
        }
        total += arr[i];    
    }
    return total;
}

//Calculate mean of number array
function mean(arr){
    return sum(arr)/arr.length;
}

//Calculate mean of number array when error checks aren't needed
function fastMean(arr){
    var sum= 0;
    for(var i = 0; i < arr.length; i++){
        sum += arr[i];    
    }
    //console.log("Mean= %d", sum/arr.length);
    return sum/arr.length;    
}

//Calculate variance of number array
function variance(arr){
    var avg= mean(arr);
    //appending to "squares" array via grow-as-you-go method:
    //http://jsperf.com/array-pre-allocate-vs-array-push
    var squares= [];
    for(var i = 0; i < arr.length; i++){
        squares[i]= Math.pow((arr[i]-avg),2);    
    }
    //console.log("Stdev= %d", Math.sqrt(fastMean(squares)));
    return fastMean(squares);
}

//Calculate standard deviation of number array
function stdev(arr){
    return Math.sqrt(variance(arr));
}

//Normalize a number array (error checks done by "sum" function)
function normalize(arr){
    var total= sum(arr);
    for(var i = 0; i < arr.length; i++){
        arr[i] /= total;    
    }    
}

//ignores last entry b/c that's assumed to be the label
function dist(a,b){
    //appending to "diffs" array via grow-as-you-go method:
    //http://jsperf.com/array-pre-allocate-vs-array-push
    var diffs= [];
    for(var i = 0; i < a.length-1; i++){
        diffs[i]= Math.pow(a[i]-b[i],2);    
    }
    return Math.sqrt(sum(diffs));
}

//returns an array of the form:
//[[neighbor_1_label, similarity score], ... , [neighbor_k_label, similarity score]]
function getNearestNeighbors(k, trainSet, testPoint) {
    if(trainSet.length==0) {
        console.error("Training set is empty!");
        return NaN;
    }
    var kClosest= [];
    var distBound= Number.MIN_VALUE;
    var furthestIndex= 0
    for(var i=0; i<trainSet.length; i++) {
        label= trainSet[i][trainSet[i].length-1];
        d= dist(trainSet[i],testPoint);
        //if there aren't k neighbors yet, add one
        if(kClosest.length < k) {
            kClosest[kClosest.length]= [label,d];
            if(distBound < d) {
                distBound= d;
                furthestIndex= kClosest.length-1;
            }
        }
        //else only add if it is closer than the current furthest neighbor N,
        //and replace N with it
        else {
            if(d < distBound) {
                kClosest[furthestIndex]= [label,d];
                distBound= d;
                for(var j=0; j<kClosest.length; j++) {
                    if(kClosest[j][1] >= distBound) {
                        distBound= kClosest[j][1];
                        furthestIndex= j;
                    }
                }
            }
        }
    }
    return kClosest;
}

//no weighting, just majority vote
function kNN(k,trainSet,testPoint) {
    kClosest= getNearestNeighbors(k, trainSet, testPoint);
    //majority vote, can be made more efficient
    kClosest.sort();
    mode= kClosest[0][0]; //guaranteed to exist (so no array bounds issue)
    modeFreq= 0;
    currMode= kClosest[0][0];
    currModeFreq= 0;
    for(var n=0; n<kClosest.length; n++) {
        if(kClosest[n][0] == currMode) {
            currModeFreq++;
            if(currModeFreq > modeFreq) {
                modeFreq= currModeFreq;
                mode= currMode;
            }
        }
        else{
            currMode= kClosest[n][0];
            currModeFreq= 1;
        }
    }
    //alert("Your test point can be labeled as: " + mode);
    return mode;
}

//uses 1/similarity_score for weight, value of infinity if sim_score=0
function weightedKNN(k,trainSet,testPoint) {
    kClosest= getNearestNeighbors(k, trainSet, testPoint);
    //majority vote, can be made more efficient
    kClosest.sort();
    mode= kClosest[0][0]; //guaranteed to exist (so no array bounds issue)
    modeFreq= 0;
    currMode= kClosest[0][0];
    currModeFreq= 0;
    for(var n=0; n<kClosest.length; n++) {
        if(kClosest[n][0] == currMode) {
            //console.log(kClosest[n][1]);
            currModeFreq += 1/kClosest[n][1]; //when kClosest[n][1], currModeFreq= infinity
            if(currModeFreq > modeFreq) {
                modeFreq= currModeFreq;
                mode= currMode;
            }
        }
        else{
            currMode= kClosest[n][0];
            currModeFreq= kClosest[n][1];
        }
    }
    //alert("Your test point can be labeled as: " + mode);
    return mode;
}


//Possible issue: does this cover all possible control sequence issues?
//Do all browsers handle all control sequences the same way?
function stringEscape(s) {
    //not optimal design decision, but "escapse" contains length-3 arrays where:
    //1st entry is the escape character
    //2nd entry is the regex to be used in the replace function
    //3rd entry is the the replacement string
    escapes= [["\b", " b"], ["\t", " t"], ["\n", " n"],
              ["\v", " v"], ["\f", " f"], ["\r", " r"]];
    for (var i = 0; i < escapes.length; i++) {
        ind = s.indexOf(escapes[i][0]);
        while (ind != -1) {
            s = s.replace(escapes[i][0], escapes[i][1]);
            //console.log("Replacement process"+escapes[i][1]+": " + s);
            ind = s.substr(ind + 1).indexOf(escapes[i][0]);
        }
    }
    filepathParts= s.split(' ');
    filename= filepathParts[filepathParts.length-1]
    //the below replace is needed b/c "\" followed by something like "c" (i.e.
    //something that doesn't make an escape sequence) just gets reduced to "c"
    //(i.e. the "\" disappears), so the "fakepath" part of the filepath gets
    //prepended to the actual filename
    filename= filename.replace("fakepath","");
    return filename;
}

//Create number array from user-inputted CSV file
//potential issue: use of "Number()" to convert string to number may be too
//lenient, because Number() auto-converts variables of type "Date" to a number,
//and there may be similar auto-conversions too. TBD if this is desired behavior
function createArrayFromCSV(file) {
    file= stringEscape(file);//want to replace backslashes so that they arent seen as escapes
    if(localStorage.getItem('__' + file) === null) {
        console.error("File not entered");
        return;
    }
    if (file.indexOf('.csv', file.length - 4) === -1) {
        console.error("File is not a CSV file");
	return;
    }
    var arr= localStorage['__' + file];
    var parsed= CSV.parse(arr);
    if(parsed.length==1) {
        parsed= parsed[0];
    }
    return parsed;
}