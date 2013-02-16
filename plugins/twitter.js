// Pre-load dependencies
(function(){

yepnope({
    load: [ 'plugins/twitter.css'
    ]
});

    // FIXME: Move runtime code to iframerunner project
    Local.prototype.getTweet = function(name, callback){
        var jsonTwitterFeed = "https://twitter.com/statuses/user_timeline/" + name + ".json";
        $.ajax({
            url: jsonTwitterFeed,
            dataType: 'jsonp',
            data: 'count=1',
            success: function(data, textStatus, jqXHR){
                $.each(data, function(idx,value){
                    callback(value.text);
                });
            },
            error: function(XHR, textStatus, errorThrown){
                callback(textStatus);
                console.error('getTweet error %s: %s', textStatus, errorThrown);
            }
        });
    };

    wb.menu('Twitter', [
        {
            blocktype: 'eventhandler',
            contained: [{label: 'get tweet for [string]'}],
            script: 'local.getTweet({{1}}, function(tweet){local.tweet## = tweet;[[1]]});',
            returns: {
                blocktype: 'expression',
                label: 'last tweet##',
                script: 'local.tweet## || "waiting…"',
                type: 'string'
            },
            help: 'asynchronous call to get the last tweet of the named account'
        }
    ]);

})();
