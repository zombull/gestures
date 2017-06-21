'use strict';

(function(ZOMBULL) {
    function initGesture(gesture, type) {
        return [{gesture: gesture, type: type || ZOMBULL.GestureType.MOUSE}];
    }

    ZOMBULL.DefaultOptions = {
        name: 'Default',
        button: ZOMBULL.MouseButton.RIGHT,
        disableKey: ZOMBULL.DisableKey.NONE,

        newTabRight: false,
        newTabFromUrlRight: true,

        doNotClosePinnedTabs: true,
        focusChromeOnCloseWindow: true,

        reloadAllTabsOnUpdate: true,
        allowIncognitoAddToReadingList: false,

        rockerContextMenu: true,
        showAdvancedOptions: false,

        newTabUrl: 'chrome://newtab',
        newIncognitoTabUrl: 'https://www.google.com',

        actions: {
            // Navigation Actions
            stop: [],
            back: initGesture('L'),
            forward: initGesture('R'),

            // Tab Actions
            gotoNewTabPage: initGesture('U'),
            newTab: initGesture('D'),
            newBackgroundTab: [],
            searchSelectionInNewTab: initGesture('caLR', ZOMBULL.GestureType.ROCKER),
            searchSelectionInNewBackgroundTab: initGesture('caRL', ZOMBULL.GestureType.ROCKER),
            newTabFromLink: initGesture('U').concat(initGesture('LR', ZOMBULL.GestureType.ROCKER)),
            newBackgroundTabFromLink: initGesture('D').concat(initGesture('RL', ZOMBULL.GestureType.ROCKER)),
            newTabFromImage: [],
            newBackgroundTabFromImage: [],
            downloadImage: initGesture('cD'),
            splitTabs: initGesture('cUR').concat(initGesture('cLR', ZOMBULL.GestureType.ROCKER)),
            closeTab: initGesture('DR'),
            closeOtherTabsInWindow: [],
            closeAllOtherTabs: [],
            closeTabsLeft: [],
            closeTabsRight: [],
            reloadTab: initGesture('UD'),
            reloadTabBypassCache: initGesture('aUD'),
            reloadAllTabs: initGesture('cUD'),
            reloadAllTabsBypassCache: initGesture('caUD'),
            previousTab: [],
            nextTab: [],
            moveTabLeft: [],
            moveTabRight: [],
            toggleTabPinned: [],
            pinTab: [],
            unpinTab: [],
            stashTab: initGesture('LR', ZOMBULL.GestureType.ROCKER),

            toggleTabMuted: initGesture('RL', ZOMBULL.GestureType.ROCKER),
            muteTab: initGesture('aD'),
            unmuteTab: initGesture('aU'),
            muteAllTabs: initGesture('aUL'),
            unmuteAllTabs: initGesture('aUR'),
            muteAllOtherTabs: initGesture('aDR'),
            duplicateTab: [],

            // Window Actions
            newWindow: initGesture('UR'),
            newIncognitoWindow: initGesture('UL'),
            newWindowFromLink: initGesture('UR'),
            newIncognitoWindowFromLink: initGesture('UL'),
            newWindowFromImage: [],
            newIncognitoWindowFromImage: [],
            closeWindow: initGesture('DL'),
            closeOtherWindows: [],
            closeAllWindows: initGesture('DLR').concat(initGesture('cDL')),
            closeAllIncognitoWindows: initGesture('DRL').concat(initGesture('aDL')),
            mergeAllWindows: initGesture('cUL').concat(initGesture('cRL', ZOMBULL.GestureType.ROCKER)),

            // Shortcut Actions
            addToReadingList: initGesture('aLR', ZOMBULL.GestureType.ROCKER).concat(initGesture('mLR', ZOMBULL.GestureType.ROCKER)),
            removeFromReadingList: initGesture('aRL', ZOMBULL.GestureType.ROCKER).concat(initGesture('mRL', ZOMBULL.GestureType.ROCKER)),
            openExtensions: initGesture('cU'),
            openDownloads: initGesture('cD'),
            openHistory: initGesture('cL'),
            openBookmarks: initGesture('cR'),

            openOptions: initGesture('caU'),
            openSettings: initGesture('caD'),
            openClearBrowsingData: initGesture('caL'),
            openReadingList: initGesture('caR'),

            // Gesture Actions
            enableMouseGestures: initGesture('cmLR', ZOMBULL.GestureType.ROCKER),
            disableMouseGestures: initGesture('cmRL', ZOMBULL.GestureType.ROCKER),

            // Misc Actions
            viewSource: [],
            print: []
        }
    };

    ZOMBULL.ActionTargets = {
        newTabFromLink: ZOMBULL.GestureTarget.LINK,
        newBackgroundTabFromLink: ZOMBULL.GestureTarget.LINK,
        newWindowFromLink: ZOMBULL.GestureTarget.LINK,
        newIncognitoWindowFromLink: ZOMBULL.GestureTarget.LINK,

        newTabFromImage: ZOMBULL.GestureTarget.IMAGE,
        newBackgroundTabFromImage: ZOMBULL.GestureTarget.IMAGE,
        newWindowFromImage: ZOMBULL.GestureTarget.IMAGE,
        newIncognitoWindowFromImage: ZOMBULL.GestureTarget.IMAGE,
        downloadImage: ZOMBULL.GestureTarget.IMAGE,

        searchSelectionInNewTab: ZOMBULL.GestureTarget.SELECTION,
        searchSelectionInNewBackgroundTab: ZOMBULL.GestureTarget.SELECTION,
    };

    for (var key in ZOMBULL.DefaultOptions.actions) {
        if (ZOMBULL.DefaultOptions.actions.hasOwnProperty(key)) {
            if (!ZOMBULL.ActionTargets.hasOwnProperty(key)) {
                ZOMBULL.ActionTargets[key] = ZOMBULL.GestureTarget.GENERIC;
            }
        }
    }
}(window.ZOMBULL = window.ZOMBULL || {}));