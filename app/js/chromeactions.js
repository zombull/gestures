'use strict';

(function (ZOMBULL) {

    ZOMBULL.ChromeActions = function() {

    };

    ZOMBULL.ChromeActions.prototype.newWindow = function (message, url) {
        var properties = {
            url: url || (message.incognito ? message.options.newIncognitoTabUrl : message.options.newTabUrl),
            incognito: message.incognito,
            focused: true,
            state: 'maximized'
        };
        chrome.windows.create(properties);
    };

    ZOMBULL.ChromeActions.prototype.newIncognitoWindow = function(message) {
        message.incognito = true;
        this.newWindow(message);
    };

    ZOMBULL.ChromeActions.prototype.newWindowFromLink = function(message) {
        this.newWindow(message, message.link);
    };

    ZOMBULL.ChromeActions.prototype.newIncognitoWindowFromLink = function(message) {
        message.incognito = true;
        this.newWindow(message, message.link);
    };

    ZOMBULL.ChromeActions.prototype.newWindowFromImage = function (message) {
        this.newWindow(message, message.image);
    };

    ZOMBULL.ChromeActions.prototype.newIncognitoWindowFromImage = function (message) {
        message.incognito = true;
        this.newWindow(message, message.image);
    };

    ZOMBULL.ChromeActions.prototype.closeWindow = function (message) {
        chrome.windows.remove(message.tab.windowId);

        if (message.options.focusChromeOnCloseWindow) {
            chrome.windows.getAll({}, function (windows) {
                for (var i = 0; i < windows.length; i++) {
                    if (windows[i].id != message.tab.windowId) {
                        chrome.windows.update(windows[i].id, { focused: true });
                        break;
                    }
                }
            });
        }
    };

    ZOMBULL.ChromeActions.prototype.closeOtherWindows = function(message) {
        chrome.windows.getAll({}, function (windows) {
            windows.forEach(function (window) {
                if (window.id != message.tab.windowId) {
                    chrome.windows.remove(window.id);
                }
            });
        });
    };

    ZOMBULL.ChromeActions.prototype.closeAllWindows = function (message) {
        chrome.windows.getAll({}, function (windows) {
            windows.forEach(function (window) {
                chrome.windows.remove(window.id);
            });
        });
    };

    ZOMBULL.ChromeActions.prototype.closeAllIncognitoWindows = function (message) {
        chrome.windows.getAll({}, function (windows) {
            windows.forEach(function (window) {
                if (window.incognito) {
                    chrome.windows.remove(window.id);
                }
            });
        });
    };

    ZOMBULL.ChromeActions.prototype.mergeAllWindows = function (message) {
        chrome.windows.getAll({ populate: true }, function (windows) {
            windows.forEach(function (window) {
                if (window.id != message.tab.windowId) {
                    window.tabs.forEach(function (tab) {
                        chrome.tabs.move(tab.id, { windowId: message.tab.windowId, index: -1 });
                    });
                }
            });
        });
    };

    ZOMBULL.ChromeActions.prototype.gotoNewTabPage = function (message) {
        chrome.tabs.update(message.tab.id, { url: message.options.newTabUrl });
    };

    ZOMBULL.ChromeActions.prototype.reloadAllTabs = function (message) {
        ZOMBULL.forEachTab(function (tab) {
            chrome.tabs.reload(tab.id);
        });
    };

     ZOMBULL.ChromeActions.prototype.reloadAllTabsBypassCache = function (message) {
        ZOMBULL.forEachTab(function (tab) {
            chrome.tabs.reload(tab.id, { bypassCache: true });
        });
    };

    ZOMBULL.ChromeActions.prototype.reloadTab = function (message) {
        chrome.tabs.reload(message.tab.id);
    };

    ZOMBULL.ChromeActions.prototype.reloadTabBypassCache = function (message) {
        chrome.tabs.reload(message.tab.id, { bypassCache: true });
    };

    ZOMBULL.ChromeActions.prototype.newTab = function (message, url) {
        var properties = {
            url: url || (message.tab.incognito ? message.options.newIncognitoTabUrl : message.options.newTabUrl),
            windowId: message.tab.windowId,
            openerTabId: message.tab.id,
            index: ((url && message.options.newTabFromUrlRight ) || (!url && message.options.newTabRight)) ? message.tab.index + 1 : undefined,
            active: !message.background,
        };
        chrome.tabs.create(properties);
    };

    ZOMBULL.ChromeActions.prototype.newBackgroundTab = function (message) {
        message.background = true;
        this.newTab(message);
    };

    ZOMBULL.ChromeActions.prototype.newTabFromLink = function (message) {
        this.newTab(message, message.link);
    };

    ZOMBULL.ChromeActions.prototype.newBackgroundTabFromLink = function (message) {
        message.background = true;
        this.newTabFromLink(message);
    };

    ZOMBULL.ChromeActions.prototype.newTabFromImage = function (message) {
        this.newTab(message, message.image);
    };

    ZOMBULL.ChromeActions.prototype.newBackgroundTabFromImage = function (message) {
        message.background = true;
        this.newTabFromImage(message);
    };

    ZOMBULL.ChromeActions.prototype.downloadImage = function (message) {
        chrome.downloads.download({ url: message.image, conflictAction: 'uniquify' });
    };

    ZOMBULL.ChromeActions.prototype.duplicateTab = function (message) {
        chrome.tabs.duplicate(message.tab.id);
    };

    ZOMBULL.ChromeActions.prototype.splitTabs = function (message) {
        chrome.tabs.query({ windowId: message.tab.windowId }, function (tabs) {
            var properties = {
                tabId: message.tab.id,
                incognito: message.incognito,
                focused: true,
                state: 'maximized'
            };
            chrome.windows.create(properties, function (window) {
                for (var i = message.tab.index + 1; i < tabs.length; i++) {
                    chrome.tabs.move(tabs[i].id, { windowId: window.id, index: i - message.tab.index });
                }
            });
        });
    };

    ZOMBULL.ChromeActions.prototype.closeTab = function (message) {
        if (!message.tab.pinned || !message.options.doNotClosePinnedTabs) {
            chrome.tabs.remove(message.tab.id);
        }
    };

    ZOMBULL.ChromeActions.prototype.closeOtherTabsInWindow = function (message) {
        ZOMBULL.forEachTabInWindow(message.tab.windowId, function (tab) {
            if ((tab.id != message.tab.id) && (!tab.pinned || !message.options.doNotClosePinnedTabs)) {
                chrome.tabs.remove(tab.id);
            }
        });
    };

    ZOMBULL.ChromeActions.prototype.closeAllOtherTabs = function (message) {
        this.closeOtherTabsInWindow(message);
        this.closeOtherWindows(message);
    };


    ZOMBULL.ChromeActions.prototype.closeTabsLeft = function (message) {
        ZOMBULL.forEachTabInWindow(message.tab.windowId, function (tab) {
            if ((tab.index < message.tab.index) && (!tab.pinned || !message.options.doNotClosePinnedTabs)) {
                chrome.tabs.remove(tab.id);
            }
        });
    };

    ZOMBULL.ChromeActions.prototype.closeTabsRight = function (message) {
        ZOMBULL.forEachTabInWindow(message.tab.windowId, function (tab) {
            if ((tab.index > message.tab.index) && (!tab.pinned || !message.options.doNotClosePinnedTabs)) {
                chrome.tabs.remove(tab.id);
            }
        });
    };

    ZOMBULL.ChromeActions.prototype.previousTab = function (message) {
        chrome.tabs.query({ windowId: message.tab.windowId }, function (tabs) {
            var index = message.tab.index == 0 ? tabs.length - 1 : message.tab.index - 1;
            chrome.tabs.update(tabs[index].id, { active: true });
        });
    };

    ZOMBULL.ChromeActions.prototype.nextTab = function (message) {
        chrome.tabs.query({ windowId: message.tab.windowId }, function (tabs) {
            var index = ((message.tab.index + 1) == tabs.length) ? 0 : message.tab.index + 1;
            chrome.tabs.update(tabs[index].id, { active: true });
        });
    };

    ZOMBULL.ChromeActions.prototype.moveTabLeft = function (message) {
        chrome.tabs.move(message.tab.id, { index: message.tab.index > 0 ? message.tab.index - 1 : 0 });
    };

    ZOMBULL.ChromeActions.prototype.moveTabRight = function (message) {
        chrome.tabs.move(message.tab.id, { index: message.tab.index + 1 });
    };

    ZOMBULL.ChromeActions.prototype.toggleTabPinned = function (message) {
        chrome.tabs.update(message.tab.id, { pinned: !message.tab.pinned });
    };

    ZOMBULL.ChromeActions.prototype.pinTab = function (message) {
        chrome.tabs.update(message.tab.id, { pinned: true });
    };

    ZOMBULL.ChromeActions.prototype.unpinTab = function (message) {
        chrome.tabs.update(message.tab.id, { pinned: false });
    };

    ZOMBULL.ChromeActions.prototype.stashTab = function (message) {
        chrome.tabs.move(message.tab.id, { index: 0 });
        chrome.tabs.duplicate(message.tab.id);
        chrome.tabs.query({ windowId: message.tab.windowId }, function (tabs) {
            chrome.tabs.update(tabs[tabs.length - 1].id, { active: true });
        });
        chrome.tabs.remove(message.tab.id);
    };

    ZOMBULL.ChromeActions.prototype.toggleTabMuted = function (message) {
        chrome.tabs.update(message.tab.id, { muted: !(message.tab.mutedInfo && message.tab.mutedInfo.muted) });
    };

    ZOMBULL.ChromeActions.prototype.muteTab = function (message) {
        chrome.tabs.update(message.tab.id, { muted: true });
    };

    ZOMBULL.ChromeActions.prototype.unmuteTab = function (message) {
        chrome.tabs.update(message.tab.id, { muted: false });
    };

    ZOMBULL.ChromeActions.prototype.muteAllTabs = function (message) {
        ZOMBULL.forEachTab(function (tab) {
            chrome.tabs.update(tab.id, { muted: true });
        });
    };

    ZOMBULL.ChromeActions.prototype.unmuteAllTabs = function (message) {
        ZOMBULL.forEachTab(function (tab) {
            chrome.tabs.update(tab.id, { muted: false });
        });
    };

    ZOMBULL.ChromeActions.prototype.muteAllOtherTabs = function (message) {
        ZOMBULL.forEachTab(function (tab) {
            if (message.tab.id != tab.id) {
                chrome.tabs.update(tab.id, { muted: true });
            }
        });
    };

    ZOMBULL.ChromeActions.prototype.openHistory = function (message) {
        this.newTab(message, 'chrome://history/');
    };

    ZOMBULL.ChromeActions.prototype.openBookmarks = function (message) {
        this.newTab(message, 'bookmarks.html');
    };

    ZOMBULL.ChromeActions.prototype.openDownloads = function (message) {
        this.newTab(message, 'chrome://downloads/');
    };

    ZOMBULL.ChromeActions.prototype.openExtensions = function (message) {
        this.newTab(message, 'chrome://extensions/');
    };


    ZOMBULL.ChromeActions.prototype.openSettings = function (message) {
        this.newTab(message, 'chrome://settings/');
    };

    ZOMBULL.ChromeActions.prototype.openClearBrowsingData = function (message) {
        this.newTab(message, 'chrome://settings/clearBrowserData');
    };

    ZOMBULL.ChromeActions.prototype.openOptions  = function (message) {
        this.newTab(message, chrome.extension.getURL('options.html'));
    };

    ZOMBULL.ChromeActions.prototype.searchSelectionInNewTab = function (message) {
        this.newTab(message, 'http://www.google.com/search?q={0}'.format(message.selection));
    };

    ZOMBULL.ChromeActions.prototype.searchSelectionInNewBackgroundTab = function (message) {
        message.background = true;
        this.searchSelectionInNewTab(message);
    };

    ZOMBULL.ChromeActions.prototype.viewSource = function (message) {
        this.newTab(message, 'view-source:{0}'.format(message.tab.url));
    };

    // The bookmark API is absolutely horrendous.  Only the explicit getTree and getSubTree
    // functions return nodes with the children object filled in, which makes retrieving a
    // folder given its name a pain in the ass as you must first search for the folder and
    // then get its sub tree.  Even more annoying is that the subtree result is not a single
    // node but rather an array of nodes (which makes no sense since you're passing in an
    // exact ID).  Long story short, _getReadingList handles all of the stupidity and calls
    // the callback with the fully functional 'Reading List' node, creating it if necessary.
    ZOMBULL.ChromeActions.prototype._getReadingList = function (callback) {
        function getReadListSubTree(readingListNode) {
            chrome.bookmarks.getSubTree(readingListNode.id, function (readingList) {
                if (readingList.length) {
                    callback(readingList[0]);
                }
            });
        }

        chrome.bookmarks.search({ title: 'Reading List' }, function (bookmarks) {
            bookmarks = bookmarks.filter(function (bookmark) { return !bookmark.url && bookmark.title == 'Reading List'; });
            if (bookmarks.length) {
                getReadListSubTree(bookmarks[0]);
            }
            else {
                chrome.bookmarks.create({ title: 'Reading List' }, getReadListSubTree);
            }
        });
    };

    ZOMBULL.ChromeActions.prototype.addToReadingList = function (message) {
        if (message.options.allowIncognitoAddToReadingList || !message.tab.incognito) {
            this._getReadingList(function(readingList) {
                var bookmarks = readingList.children.filter(function (bookmark) { return bookmark.url == message.tab.url; });
                if (!bookmarks.length) {
                    chrome.bookmarks.create({ parentId: readingList.id, title: message.tab.title, url: message.tab.url });
                }
            });
        }
    };

    ZOMBULL.ChromeActions.prototype.removeFromReadingList = function (message) {
        this._getReadingList(function (readingList) {
            readingList.children.forEach(function (bookmark) {
                if (bookmark.url == message.tab.url) {
                    chrome.bookmarks.remove(bookmark.id);
                }
            });
        });
    };

    ZOMBULL.ChromeActions.prototype.openReadingList = function (message) {
        var actions = this;
        this._getReadingList(function (readingList) {
            actions.newTab(message, 'chrome://bookmarks/#{0}'.format(readingList.id));
        });
    };

}(window.ZOMBULL = window.ZOMBULL || {}));