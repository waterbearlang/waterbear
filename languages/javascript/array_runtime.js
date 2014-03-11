
//Calculate mean of number array
function mean(arr){
    if(arr.length==0) {
        console.log("Array is empty!");
        return NaN;
    }
    var sum= 0;
    for(var i = 0; i < arr.length; i++){
        if(typeof arr[i] != "number") {
            console.log("Non-numerical value in array!");
            return NaN;
        }
        sum += arr[i];    
    }
    //console.log("Mean= %d", sum/arr.length);
    return sum/arr.length;
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

//Calculate standard deviation of array consisting of numbers
function stdev(arr){
    avg= mean(arr);
    //appending to "squares" array via grow-as-you-go method:
    //http://jsperf.com/array-pre-allocate-vs-array-push
    squares= [];
    for(var i = 0; i < arr.length; i++){
        squares[i]= Math.pow((arr[i]-avg),2);    
    }
    //console.log("Stdev= %d", Math.sqrt(fastMean(squares)));
    return Math.sqrt(fastMean(squares));
}