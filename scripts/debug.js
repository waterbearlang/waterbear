window.DEBUG = false;
window.debug = function debug(){
    if (window.DEBUG){
        console.log.apply(console, arguments);
    }
}
