'use strict';

if (typeof importScripts === 'function') {
    importScripts("enums.js");
    importScripts("utilities.js");
    importScripts("defaultoptions.js");
    importScripts("chromeactions.js");

    (function (ZOMBULL) {
        ZOMBULL.Background = function() {
            this._chromeActions = new ZOMBULL.ChromeActions();

            this._tabIds = {};
            this._activeTabId = chrome.tabs.TAB_ID_NONE;
        };

        ZOMBULL.Background.prototype.initialize = function () {
            chrome.runtime.getPlatformInfo(function(info) {
                chrome.storage.session.set({ linux: info.os == 'linux' });
            });

            ZOMBULL.getCurrentTab(function(tab) {
                background.setCurrentTab(tab.id);
            });

            chrome.storage.sync.get('options', function(storage) {
                if (storage.options) {
                    background._options = storage.options;
                }
                else {
                    chrome.storage.sync.set({ options: ZOMBULL.DefaultOptions });
                }

                chrome.storage.onChanged.addListener(background.onChanged);
                chrome.runtime.onMessage.addListener(ZOMBULL.invokeMethod.bind(background));

                chrome.tabs.onActivated.addListener(background.onTabActivated);
                chrome.tabs.onRemoved.addListener(background.onTabRemoved);

                chrome.windows.onFocusChanged.addListener(background.onFocusChanged);
                chrome.runtime.onInstalled.addListener(background.onInstalled);
            });
        };

        ZOMBULL.Background.prototype.onChanged = function (changes, namespace) {
            if (namespace === 'sync' && changes.hasOwnProperty('options') && changes.options.newValue) {
                background._chromeActions.reloadAllTabs();
            }
        };

        ZOMBULL.Background.prototype.setCurrentTab = function (tabId) {
            if (background._activeTabId != tabId) {
                if (background._activeTabId != chrome.tabs.TAB_ID_NONE &&
                    this._tabIds.hasOwnProperty(background._activeTabId)) {
                    chrome.tabs.sendMessage(background._activeTabId, { method: 'tabInactive' });
                }

                background._activeTabId = tabId;
            }
        };

        ZOMBULL.Background.prototype.onInstalled = function (details) {
            // Reload all tabs to inject the content scripts on all tabs when this
            // extension is installed or updated.  This is obviously a big hammer,
            // but any alternative would require a lot more code and would be more
            // fragile.  Given that this scenario will occur very infrequently,
            // using a big hammer is a-ok since it allows a simple implementation.
            // This also handles reloading the extension via Developer Mode.
            if (details.reason == 'installed' || details.reason == 'update') {
                background._chromeActions.reloadAllTabs();
            }
        };

        ZOMBULL.Background.prototype.onTabActivated = function (activeInfo) {
            background.setCurrentTab(activeInfo.tabId);
        };

        ZOMBULL.Background.prototype.onFocusChanged = function (winId) {
            ZOMBULL.getCurrentTab(function(tab) {
                if (tab == undefined) {
                    background.setCurrentTab(chrome.tabs.TAB_ID_NONE);
                } else {
                    background.setCurrentTab(tab.id);
                }
            });
        };

        ZOMBULL.Background.prototype.onTabAdded = function (message, sender) {
            background._tabIds[sender.tab.id] = sender.tab.id;
            chrome.tabs.sendMessage(sender.tab.id, { method: 'Added tab: ' + sender.tab.id });
        };

        ZOMBULL.Background.prototype.onTabRemoved = function (tabId, removeInfo) {
            delete background._tabIds[tabId];

            if (background._activeTabId == tabId) {
                background._activeTabId = chrome.tabs.TAB_ID_NONE;
            }
        };

        ZOMBULL.Background.prototype.onGesture = function (message, sender) {
            // Get the original message, the message sent to this (the service worker)
            // is doGesture, which is a wrapper of the actual gesture message.
            message = message.message;

            // Add the sender's tab to the message.  Almost all Chrome-level
            // actions require the current tab.
            message.tab = sender.tab;
            ZOMBULL.invokeMethod.call(background._chromeActions, message);
        };

        var background = new ZOMBULL.Background();
        background.initialize();
    }(ZOMBULL));
}