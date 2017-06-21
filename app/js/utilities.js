'use strict';

// Define a prototype to provide C# style functionality for formatting a string.  To use, invoke on a
// string,  e.g. 'Your mother was a {0} and your father smelt of {1}'.format('hamster', 'elderberries').
// This prototype is intentionally created outside of  the ZOMBULL namespace.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

// Define a prototype to access the last element in the array.
if (!Array.prototype.back) {
    Array.prototype.back = function () {
        if (this.length > 0) {
            return this[this.length - 1];
        }
        return null;
    };
}

// All functions in utilities.js are designed to be called from other modules and so are defined
// relative to the ZOMBULL namespace.  When calling a function, the caller must also scope the call
// using the namespace, e.g. ZOMBULL.getCurrentTab(function() {});
(function(ZOMBULL) {

    // Call chrome.tabs.query to request the active tab of the current window.  The query will invoke
    // our callback with a list of tabs that match the query.  As we are requesting the active tab, we
    // can safely assume there is a single tab in the array as there can be at most one active tab.
    // It is the caller's responsibility to check whether or not the tab is valid.
    ZOMBULL.getCurrentTab = function(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            callback(tabs[0]);
        });
    };

    // Call chrome.tabs.query to request all tabs of all windows.  The query will invoke our local
    // callback with a list of tabs that match the query.  Iterate over all matching tabs and invoke
    // the passed in callback for each tab.  It is the caller's responsibility to check whether or
    // not any particular tab is valid.
    ZOMBULL.forEachTab = function(callback) {
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; ++i) {
                callback(tabs[i]);
            }
        });
    };


    // Call chrome.tabs.query to request all tabs of all windows.  The query will invoke our local
    // callback with a list of tabs that match the query.  Iterate over all matching tabs and invoke
    // the passed in callback for each tab.  It is the caller's responsibility to check whether or
    // not any particular tab is valid.
    ZOMBULL.forEachTabInWindow = function (windowId, callback) {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            for (var i = 0; i < tabs.length; ++i) {
                callback(tabs[i]);
            }
        });
    };

    // Invoke a method on tab(s) with a connection-less request, used for one-off things.
    // ZOMBULL.invokeMethodOnTab = function(method, allTabs) {
    //     function tabCallback(tab) {
    //         if (tab != null && typeof tab.id !== 'undefined') {
    //             chrome.tabs.sendMessage(tab.id, { method: method, tab: tab }, function() { });
    //         }
    //     }

    //     if (allTabs) {
    //         ZOMBULL.forEachTab(tabCallback);
    //     }
    //     else {
    //         ZOMBULL.getCurrentTab(tabCallback);
    //     }
    // };

    // Invoke the method specified in the message in the context of 'this' object.  The sender and
    // sendResponse parameters allow this function to be used a callback for handling messages in
    // Chrome's message passing system.  If the method exists then sendResponse will be called to
    // let the sender know its message was received and handled.  The invoked method can make their
    // own sendResponse call if they need to pass back data in the sendResponse call, Chrome will
    // only service the first call to sendResponse.
    ZOMBULL.invokeMethod = function(message, sender, sendResponse) {
        if (typeof message.method === 'string') {
            if (message.method in Object.getPrototypeOf(this)) {
                this[message.method](message, sendResponse);

                if (sendResponse) {
                    sendResponse();
                }

                return true;
            }
        }
        return false;
    };

    // Extract the specified parameter from a query string.  Returns an empty string if the parameter was not found.
    ZOMBULL.getQueryParameterValue = function(queryString, parameterName) {
        parameterName = parameterName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]{0}=([^&#]*)'.format(parameterName));
        var results = regex.exec(queryString);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    ZOMBULL.getLink = function (element) {
        for (; element; element = element.parentNode) {
            if (element.href) {
                return element.href;
            }
        }
        return null;
    };

    ZOMBULL.getImage = function (element) {
        if (element.nodeName == 'IMG') {
            return element.src;
        }
        return null;
    };

    ZOMBULL.cancelEvent = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };

    ZOMBULL.popCount = function (num) {
        num = num - ((num >> 1) & 0x55555555);
        num = (num & 0x33333333) + ((num >> 2) & 0x33333333);
        return (((num + (num >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
    };

    ZOMBULL.bitTest = function (num, bit) {
        return ((1 << bit) & num) != 0;
    };

    // ZOMBULL.sanitizeOptions = function (options) {
    //
    //     // Add new options with their default value.
    //     for (var key in ZOMBULL.DefaultOptions) {
    //         if (ZOMBULL.DefaultOptions.hasOwnProperty(key) && !options.hasOwnProperty(key)) {
    //             options[key] = ZOMBULL.DefaultOptions[key];
    //         }
    //     }
    //
    //     // Add missing actions as empty entries (no gestures), we can't risk a collision with
    //     // an existing gesture configured by the user.
    //     for (var key in ZOMBULL.DefaultOptions.actions) {
    //         if (ZOMBULL.DefaultOptions.actions.hasOwnProperty(key) && !options.actions.hasOwnProperty(key)) {
    //             options.actions[key] = [];
    //         }
    //     }
    //
    //     // Remove any options that no longer exist.
    //     for (var key in options) {
    //         if (!ZOMBULL.DefaultOptions.hasOwnProperty(key) && options.hasOwnProperty(key)) {
    //             delete options[key];
    //         }
    //     }
    //
    //     // Remove any actions that no longer exist.
    //     for (var key in options.actions) {
    //         if (!ZOMBULL.DefaultOptions.actions.hasOwnProperty(key) && options.actions.hasOwnProperty(key)) {
    //             delete options.actions[key];
    //         }
    //     }
    // };

    return ZOMBULL;

}(window.ZOMBULL = window.ZOMBULL || {}));