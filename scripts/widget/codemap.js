(function(wb){

//call back function for code map
function thirtyPercent(evt) {
	wb.cm_percent  = 0.3;
	wb.drawRectForViewPort();
	var element = document.querySelector('.code-map');
	var transfromString = ("scale(0.3, 0.3)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}

//call back function for code map
function fiftyPercent(evt) {
	wb.cm_percent  = 0.5;
	wb.drawRectForViewPort();
	var element = document.querySelector('.code-map');
	var transfromString = ("scale(0.5, 0.5)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}
//call back function for code map
function seventyPercent(evt) {
	wb.cm_percent  = 0.7;
	wb.drawRectForViewPort();
	var element = document.querySelector('.code-map');
	var transfromString = ("scale(0.7, 0.7)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}
//call back function for code map
function hundredPercent(evt) {
	wb.cm_percent  = 1;
	wb.drawRectForViewPort();
	var element = document.querySelector('.code-map');
	var transfromString = ("scale(1, 1)");
    // now attach that variable to each prefixed style
    element.style.webkitTransform = transfromString;
    element.style.MozTransform = transfromString;
    element.style.msTransform = transfromString;
    element.style.OTransform = transfromString;
    element.style.transform = transfromString;
}

wb.thirtyPercent = thirtyPercent;
wb.fiftyPercent = fiftyPercent;
wb.seventyPercent = seventyPercent;
wb.hundredPercent = hundredPercent;

})(wb);