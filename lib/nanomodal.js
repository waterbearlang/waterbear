var nanoModal;
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ModalEvent = require("./ModalEvent");

function El(tag, classNames) {
    var doc = document;
    var el = (tag.nodeType || tag === window) ? tag : doc.createElement(tag);
    var eventHandlers = [];
    if (classNames) {
        el.className = classNames;
    }

    var onShowEvent = ModalEvent();
    var onHideEvent = ModalEvent();

    var addListener = function(event, handler) {
        if (el.addEventListener) {
            el.addEventListener(event, handler, false);
        } else {
            el.attachEvent("on" + event, handler);
        }
        eventHandlers.push({
            event: event,
            handler: handler
        });
    };

    var removeListener = function(event, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(event, handler);
        } else {
            el.detachEvent("on" + event, handler);
        }
        var t = eventHandlers.length;
        var handlerObj;
        while (t-- > 0) {
            handlerObj = eventHandlers[t];
            if (handlerObj.event === event && handlerObj.handler === handler) {
                eventHandlers.splice(t, 1);
                break;
            }
        }
    };


    var addClickListener = function(handler) {
        var flag = false;
        var wrappedHandler = function(evt){
            if (!flag){
                flag = true;
                setTimeout(function(){ flag = false; }, 100);
                handler(evt);
            }
        }
        addListener("touchstart", wrappedHandler);
        addListener("click", wrappedHandler);
    };

    var show = function(arg, display) {
        if (el) {
            el.style.display = display ? display : "block";
            onShowEvent.fire(arg);
        }
    };

    var hide = function(arg) {
        if (el) {
            el.style.display = "none";
            onHideEvent.fire(arg);
        }
    };

    var isShowing = function() {
        return el.style && el.style.display === "block";
    };

    var html = function(html) {
        if (el) {
            el.innerHTML = html;
        }
    };

    var text = function(text) {
        if (el) {
            html("");
            el.appendChild(doc.createTextNode(text));
        }
    };

    var remove = function() {
        if (el.parentNode) {
            var x = eventHandlers.length;
            var eventHandler;
            while (x-- > 0) {
                eventHandler = eventHandlers[x];
                removeListener(eventHandler.event, eventHandler.handler);
            }
            el.parentNode.removeChild(el);
            onShowEvent.removeAllListeners();
            onHideEvent.removeAllListeners();
        }
    };

    var add = function(elObject) {
        var elementToAppend = elObject.el || elObject;
        el.appendChild(elementToAppend);
    };

    return {
        el: el,
        addListener: addListener,
        addClickListener: addClickListener,
        onShowEvent: onShowEvent,
        onHideEvent: onHideEvent,
        show: show,
        hide: hide,
        isShowing: isShowing,
        html: html,
        text: text,
        remove: remove,
        add: add
    };
}

module.exports = El;

},{"./ModalEvent":3}],2:[function(require,module,exports){

var El = require("./El");

function Modal(content, options, overlay, customShow, customHide) {
    if (content === undefined) {
        return;
    }
    options = options || {};
    var modal = El("div", "nanoModal nanoModalOverride " + (options.classes || ""));
    var contentContainer = El("div", "nanoModalContent");
    var buttonArea = El("div", "nanoModalButtons");
    var onRequestHideListenerId;

    modal.add(contentContainer);
    modal.add(buttonArea);
    modal.el.style.display = "none";

    var buttons = [];
    var pub;

    options.buttons = options.buttons || [{
        text: "Close",
        handler: "hide",
        primary: true
    }];

    var removeButtons = function() {
        var t = buttons.length;
        while (t-- > 0) {
            var button = buttons[t];
            button.remove();
        }
        buttons = [];
    };

    var center = function() {
        modal.el.style.marginLeft = -modal.el.clientWidth / 2 + "px";
    };

    var anyModalsOpen = function() {
        var modals = document.querySelectorAll(".nanoModal");
        var t = modals.length;
        while (t-- > 0) {
            if (modals[t].style.display !== "none") {
                return true;
            }
        }
        return false;
    };

    var defaultShow = function() {
        if (!modal.isShowing()) {
            // Call the static method from the Modal module.
            Modal.resizeOverlay();
            overlay.show(overlay);
            modal.show(pub);
            center();
        }
    };

    var defaultHide = function() {
        if (modal.isShowing()) {
            modal.hide(pub);
            if (!anyModalsOpen()) {
                overlay.hide(overlay);
            }
            if (options.autoRemove) {
                pub.remove();
            }
        }
    };

    var quickClone = function(obj) {
        var newObj = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    };

    pub = {
        modal: modal,
        overlay: overlay,
        show: function() {
            if (customShow) {
                customShow(defaultShow, pub);
            } else {
                defaultShow();
            }
            return pub;
        },
        hide: function() {
            if (customHide) {
                customHide(defaultHide, pub);
            } else {
                defaultHide();
            }
            return pub;
        },
        onShow: function(callback) {
            modal.onShowEvent.addListener(function() {
                callback(pub);
            });
            return pub;
        },
        onHide: function(callback) {
            modal.onHideEvent.addListener(function() {
                callback(pub);
            });
            return pub;
        },
        remove: function() {
            overlay.onRequestHide.removeListener(onRequestHideListenerId);
            onRequestHideListenerId = null;
            removeButtons();
            modal.remove();
        },
        setButtons: function(buttonList) {
            var btnIdx = buttonList.length;
            var btnObj;
            var btnEl;
            var classes;
            var giveButtonCustomClickListener = function(btnEl, btnObj) {
                var pubCopy = quickClone(pub);
                btnEl.addClickListener(function(e) {
                    pubCopy.event = e || window.event;
                    btnObj.handler(pubCopy);
                });
            };

            removeButtons();

            if (btnIdx === 0) {
                buttonArea.hide();
            } else {
                buttonArea.show(null, 'flex');
                while (btnIdx-- > 0) {
                    btnObj = buttonList[btnIdx];
                    classes = "nanoModalBtn";
                    if (btnObj.primary) {
                        classes += " nanoModalBtnPrimary";
                    }
                    classes += btnObj.classes ? " " + btnObj.classes : "";
                    btnEl = El("button", classes);
                    if (btnObj.handler === "hide") {
                        btnEl.addClickListener(pub.hide);
                    } else if (btnObj.handler) {
                        giveButtonCustomClickListener(btnEl, btnObj);
                    }
                    btnEl.text(btnObj.text);
                    buttonArea.add(btnEl);
                    buttons.push(btnEl);
                }
            }
            center();
            return pub;
        },
        setContent: function(newContent) {
            // Only good way of checking if a node in IE8...
            if (newContent.nodeType) {
                contentContainer.html("");
                contentContainer.add(newContent);
            } else {
                contentContainer.html(newContent);
            }
            center();
            content = newContent;
            return pub;
        },
        getContent: function() {
            return content;
        }
    };

    onRequestHideListenerId = overlay.onRequestHide.addListener(function() {
        if (options.overlayClose !== false && modal.isShowing()) {
            pub.hide();
        }
    });

    pub.setContent(content).setButtons(options.buttons);

    document.body.appendChild(modal.el);

    return pub;
}

var doc = document;

var getDocumentDim = function(name) {
    var docE = doc.documentElement;
    var scroll = "scroll" + name;
    var offset = "offset" + name;
    return Math.max(doc.body[scroll], docE[scroll],
        doc.body[offset], docE[offset], docE["client" + name]);
};

// Make this a static function so that main.js has access to it so it can
// add a window keydown event listener. Modal.js also needs this function.
Modal.resizeOverlay = function() {
    var overlay = doc.getElementById("nanoModalOverlay");
    overlay.style.width = getDocumentDim("Width") + "px";
    overlay.style.height = getDocumentDim("Height") + "px";
};

module.exports = Modal;

},{"./El":1}],3:[function(require,module,exports){
function ModalEvent() {
    var listeners = {};
    var nextListenerId = 0;

    var addListener = function(callback) {
        listeners[nextListenerId] = callback;
        return nextListenerId++;
    };

    var removeListener = function(id) {
        if (id) {
            delete listeners[id];
        }
    };

    var removeAllListeners = function() {
        listeners = {};
    };

    var fire = function() {
        for (var x = 0, num = nextListenerId; x < num; ++x) {
            if (listeners[x]) {
                listeners[x].apply(null, arguments);
            }
        }
    };

    return {
        addListener: addListener,
        removeListener: removeListener,
        removeAllListeners: removeAllListeners,
        fire: fire
    };
}

module.exports = ModalEvent;

},{}],4:[function(require,module,exports){
var ModalEvent = require("./ModalEvent");

var nanoModalAPI = (function() {



    var El = require("./El");
    var Modal = require("./Modal");

    var overlay;
    var doc = document;

    function init() {
        if (!doc.querySelector("#nanoModalOverlay")) {
            // Put the main styles on the page.
            var styleObj = El("style");
            var style = styleObj.el;
            var firstElInHead = doc.querySelectorAll("head")[0].childNodes[0];
            firstElInHead.parentNode.insertBefore(style, firstElInHead);

            var styleText = ".nanoModal{position:absolute;top:100px;left:50%;display:none;z-index:9999;width:300px;min-width:300px;max-width:300px;padding:15px 20px 10px;-webkit-border-radius:10px;-moz-border-radius:10px;border-radius:10px;background:#fff;background:-moz-linear-gradient(top,#fff 0,#ddd 100%);background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,#fff),color-stop(100%,#ddd));background:-webkit-linear-gradient(top,#fff 0,#ddd 100%);background:-o-linear-gradient(top,#fff 0,#ddd 100%);background:-ms-linear-gradient(top,#fff 0,#ddd 100%);background:linear-gradient(to bottom,#fff 0,#ddd 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#dddddd', GradientType=0)}.nanoModalOverlay{position:absolute;top:0;left:0;width:100%;height:100%;z-index:9998;background:#000;display:none;-ms-filter:\"alpha(Opacity=50)\";-moz-opacity:.5;-khtml-opacity:.5;opacity:.5}.nanoModalButtons{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:space-between;border-top:1px solid #ddd;margin-top:15px;text-align:right}.nanoModalBtn{color:#333;background-color:#fff;flex:0 1 140px;padding:6px 12px;margin:8px 4px 0;font-size:14px;text-align:center;white-space:nowrap;vertical-align:middle;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border:1px solid transparent;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px}.nanoModalBtn:active,.nanoModalBtn:focus,.nanoModalBtn:hover{color:#333;background-color:#e6e6e6;border-color:#adadad}.nanoModalBtn.nanoModalBtnPrimary{color:#fff;background-color:#428bca;border-color:#357ebd}.nanoModalBtn.nanoModalBtnPrimary:active,.nanoModalBtn.nanoModalBtnPrimary:focus,.nanoModalBtn.nanoModalBtnPrimary:hover{color:#fff;background-color:#3071a9;border-color:#285e8e}";
            if (style.styleSheet) {
                style.styleSheet.cssText = styleText;
            } else {
                styleObj.text(styleText);
            }

            // Make the overlay and put it on the page.
            overlay = El("div", "nanoModalOverlay nanoModalOverride");
            overlay.el.id = "nanoModalOverlay";
            doc.body.appendChild(overlay.el);

            // Add an event so that the modals can hook into it to close.
            overlay.onRequestHide = ModalEvent();

            var overlayCloseFunc = function() {
                overlay.onRequestHide.fire();
            };

            overlay.addClickListener(overlayCloseFunc);
            El(doc).addListener("keydown", function(e) {
                var keyCode = e.which || e.keyCode;
                if (keyCode === 27) { // 27 is Escape
                    overlayCloseFunc();
                }
            });

            var windowEl = El(window);
            var resizeOverlayTimeout;
            windowEl.addListener("resize", function() {
                if (resizeOverlayTimeout) {
                    clearTimeout(resizeOverlayTimeout);
                }
                resizeOverlayTimeout = setTimeout(Modal.resizeOverlay, 100);
            });

            // Make SURE we have the correct dimensions so we make the overlay the right size.
            // Some devices fire the event before the document is ready to return the new dimensions.
            windowEl.addListener("orientationchange", function() {
                for (var t = 0; t < 3; ++t) {
                    setTimeout(Modal.resizeOverlay, 1000 * t + 200);
                }
            });
        }
    }

    if (document.body) {
        init();
    }

    var api = function(content, options) {
        init();
        return Modal(content, options, overlay, api.customShow, api.customHide);
    };
    api.resizeOverlay = Modal.resizeOverlay;

    return api;
})();

// expose api to var outside browserify so that we can export a module correctly.
nanoModal = nanoModalAPI;

},{"./El":1,"./Modal":2,"./ModalEvent":3}]},{},[1,2,3,4]);
if (typeof window !== "undefined") {
    if (typeof window.define === "function" && window.define.amd) {
        window.define(function() {
            return nanoModal;
        });
    }
    window.nanoModal = nanoModal;
}
if (typeof module !== "undefined") {
    module.exports = nanoModal;
}
