'use strict';

(function(ZOMBULL) {

    ZOMBULL.Background = function() {
        // The current options property needs to be a deep copy of DefaultOptions.  As we're not using
        // lodash in the core extension, stringify and reparse the options to create a copy.  This is a
        // one-time thing, performance is more than fast enough for our purposes.
        this._options = JSON.parse(JSON.stringify(ZOMBULL.DefaultOptions));
        this._chromeActions = new ZOMBULL.ChromeActions();

        this._handlers = {};

        this._linux = false;
    };

    ZOMBULL.Background.prototype.initialize = function () {
        chrome.runtime.getPlatformInfo(function(info) {
            background._linux = (info.os == 'linux');
        });

        chrome.storage.sync.get('options', function(storage) {
            if (storage.options) {
                background._options = storage.options;
            }
            else {
                chrome.storage.sync.set({ options: ZOMBULL.DefaultOptions });
            }

            chrome.storage.onChanged.addListener(background.onChanged);
            chrome.runtime.onConnect.addListener(background.onConnect);

            // Set the current tab.
            ZOMBULL.getCurrentTab(background.setCurrentTab);

            chrome.tabs.onActivated.addListener(background.onTabActivated);
            chrome.tabs.onRemoved.addListener(background.onTabRemoved);

            chrome.windows.onFocusChanged.addListener(background.onFocusChanged);
            chrome.runtime.onInstalled.addListener(background.onInstalled);
        });
    };

    ZOMBULL.Background.prototype.onChanged = function (changes, namespace) {
        if (namespace === 'sync' && changes.hasOwnProperty('options') && changes.options.newValue) {
            background._options = changes.options.newValue;

            // Notify all connected handlers (tabs and frames) of the new options.
            for (var tabKey in background._handlers) {
                if (background._handlers.hasOwnProperty(tabKey)) {
                    var handlers = background._handlers[tabKey];
                    for (var key in handlers) {
                        if (handlers.hasOwnProperty(key)) {
                            handlers[key].postMessage({ method: 'reset', options: background._options, targets: ZOMBULL.ActionTargets, linux: background._linux });
                        }
                    }
                }
            }
        }
    };


    ZOMBULL.Background.prototype.setCurrentTab = function (tabId) {

        if (background._currentTabId != tabId) {

            var handlers = background._handlers[background._currentTabId];
            for (var key in handlers) {
                if (handlers.hasOwnProperty(key)) {
                    handlers[key].postMessage({ method: 'tabInactive' });
                }
            }

            background._currentTabId = tabId;
        }
    };

    ZOMBULL.Background.prototype.onInstalled = function (details) {

        // Reload all tabs to inject the content scripts on all tabs when this extension installed or updated.
        // This is obviously a big hammer, but any alternative would require a lot more code and would be more
        // fragile.  Given that this scenario will occur very infrequently, using a big hammer is a-ok since it
        // allows a super simple implementation.  This also handles reloading the extension via Developer Mode.
        if (background._options.reloadAllTabsOnUpdate) {
            if (details.reason == 'installed' || details.reason == 'update') {
                background._chromeActions.reloadAllTabs();
            }
        }
    };

    ZOMBULL.Background.prototype.onConnect = function (port) {
        if (port.sender != null && port.name == 'handler') {

            var sender = port.sender;
            if (sender.id == chrome.runtime.id && sender.tab != null) {

                if (background._handlers.hasOwnProperty(sender.tab.id)) {
                    var oldPort = background._handlers[sender.tab.id][sender.frameId];
                    if (oldPort) {
                        oldPort.disconnect();
                    }
                }
                else {
                    background._handlers[sender.tab.id] = {};
                }

                background._handlers[sender.tab.id][sender.frameId] = port;

                port.onMessage.addListener(ZOMBULL.invokeMethod.bind(background));
                port.onDisconnect.addListener(function () {
                    if (background._handlers.hasOwnProperty(sender.tab.id)) {
                        delete background._handlers[sender.tab.id][sender.frameId];
                    }
                });

                // Send a message back to reset the the handler, passing in the current options.
                port.postMessage({ method: 'reset', options: background._options, targets: ZOMBULL.ActionTargets, linux: background._linux });
            }
        }
    };

    ZOMBULL.Background.prototype.onTabActivated = function (activeInfo) {
        background.setCurrentTab(activeInfo.tabId);
    };

    ZOMBULL.Background.prototype.onFocusChanged = function (winId) {
        ZOMBULL.getCurrentTab(background.setCurrentTab);
    };

    ZOMBULL.Background.prototype.onTabRemoved = function (tabId, removeInfo) {
        delete background._handlers[tabId];
    };

    ZOMBULL.Background.prototype.processGesture = function (message) {

        // Get the original message, the message we get was to processGesture, we want the actual gesture message.
        message = message.message;

        // Get the current tab and add it to the message.  Almost all Chrome-level actions require the current tab.
        ZOMBULL.getCurrentTab(function (tab) {
            message.tab = tab;
            ZOMBULL.invokeMethod.call(background._chromeActions, message);
        });
    };

    var background = new ZOMBULL.Background();
    background.initialize();


}(window.ZOMBULL = window.ZOMBULL || {}));