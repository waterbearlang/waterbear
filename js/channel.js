// Bare-bones Pub-Sub library
// Handles event delegation automatically

(function(global){
    "use strict";

    // David Baron's setTimeoutZero from here: http://dbaron.org/log/20100309-faster-timeouts
    // Only add setZeroTimeout to the window object, and hide everything
    // else in a closure.
    var timeouts = [];
    var messageName = "zero-timeout-message";

    // Like setTimeout, but only takes a function argument.  There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function setZeroTimeout(fn) {
        timeouts.push(fn);
        window.postMessage(messageName, "*");
    }

    function handleMessage(event) {
        if (event.source == window && event.data == messageName) {
            event.stopPropagation();
            if (timeouts.length > 0) {
                var fn = timeouts.shift();
                fn();
            }
        }
    }

    window.addEventListener("message", handleMessage, true);

    // Add the one thing we want added to the window object.
    // window.setZeroTimeout = setZeroTimeout;



    function Channel(){
        this.channels = {};
    }

    Channel.prototype.on = function on(channelname, elem){
        if (!elem.tagName){ 
            throw new Error('First argument must be an element');
        }
        if (typeof channelname !== 'string'){ 
            throw new Error('second argument must be a channel');
        }
        if (!this.channels[channelname]){
            this.channels[channelname] = [];
        }
        if (this.channels[channelname].indexOf(elem) !== -1){
            console.error('Only add an element to a channel once');
            console.log('channel %s: %o', channelname, this.channels[channelname]);
        }else{
            this.channels[channelname].push(elem);
        }
        return this;
    };

    Channel.prototype.off = function(channelname, elem){
        if (elem && channelname){
            if (this.channels[channelname]){
                var index = this.channels[channelname].indexOf(elem);
                if (index > -1){
                    // Found both channel and element in the channel, remove element
                    this.channels[channelname].splice(index, 0);
                }else{
                    console.error('Cannot find element to remove');
                }
            }else{
                console.error('Cannot remove from a non-existent channel');
            }
        }else{
            if (channelname){
                // no element specified, remove all elements from channel

            }else{
                throw new Error('Must at least specify a channelname');
            }
        }
    }

    Channel.prototype.once = function(channelname, elem){
        elem.dataset[channelname + 'ChannelOnce'] = 'true';
        this.on(channelname, elem);
    };

    Channel.prototype.emit = function(channelname, data){
        if (this.channels[channelname]){
            console.log('sending %s to %s listeners on %s', data, this.channels[channelname].length, channelname);
            this.channels[channelname].forEach(function(elem){
                if (elem.onChannel){
                    // work with elements from this pattern language
                    elem.onChannel(channelname, data);
                }else{
                    // work with normal elements that can use event listeners
                    var evt = new CustomEvent('channel', {bubbles: true, cancelable: true, detail: { data: data, channel: channelname}});
                    elem.dispatchEvent(evt);
                }
                if (elem.dataset[channelname + 'ChannelOnce']){
                    delete elem.dataset[channelname + 'ChannelOnce'];
                    this.off(channelname, elem);
                }
            });
        }else{
            console.error('Sending data on a non-existent channel: %s', channelname);
        }
    };

    Channel.prototype.emitAsync = function(channelname, data){
        if (this.channels[channelname]){
            this.channels[channelname].forEach(function(elem){
                if (elem.onChannel){
                    // work with elements from this pattern language
                    setZeroTimeout(function(){
                        elem.onChannel(channelname, data);
                    });
                }else{
                    // work with normal elements that can use event listeners
                    var evt = new CustomEvent('channel', {bubbles: true, cancelable: true, detail: { data: data, channel: channelname}});
                    setZeroTimeout(function(){
                        elem.dispatchEvent(evt);
                    });
                }
                if (elem.dataset[channelname + 'ChannelOnce']){
                    delete elem.dataset[channelname + 'ChannelOnce'];
                    this.off(channelname, elem);
                }
            });
        }else{
            console.error('Sending data on a non-existent channel');
        }
    };

    global.channel = new Channel();

})(this);
