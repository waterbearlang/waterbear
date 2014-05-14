/* DataBlock Plugin for WaterBear */

(function(window){
    'use strict';

    var  whitelist = [
        'www.google.com',
        'www.wikipedia.com'
    ];
    function DataBlock(url) {
        this.url = 'http://www.corsproxy.com/' + url;
        this.data = '';
    }

    DataBlock.prototype.getData = function() {
        if(this.url === null || this.url === undefined) {
            alert("Please give a url");
            return;
        } 
        // else if(whitelist.indexOf(this.url) < 0) {
        //     alert(this.url + " is not supported");
        //     return;
        // }
        console.log(JSON.stringify(this.url));
        this.data = ajax.gets(this.url); 
        console.log(JSON.stringify(this.data));
    };
    window.DataBlock = DataBlock;
})(window);
