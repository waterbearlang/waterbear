
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

//Create number array from user-inputted CSV file
//potential issue: use of "Number()" to convert string to number may be too
//lenient, because Number() auto-converts variables of type "Date" to a number,
//and there may be similar auto-conversions too. TBD if this is desired behavior
function createArrayFromCSV(file) {
    if (file.indexOf('.csv', file.length - 4) === -1) {
        console.error("File is not a CSV file");
	return;
    }
    var arr= localStorage['__' + file];
    console.log("ARRAY: " + arr);
    var parsed= CSV.parse(arr);
    if(parsed.length==1) {
        parsed= parsed[0];
    }
    console.log(parsed);
    return parsed;
}