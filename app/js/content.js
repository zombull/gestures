'use strict';

ZOMBULL.Content = function () {
    ZOMBULL.Handler.call(this);

    this._tabActions = new ZOMBULL.ContentActions();
};

ZOMBULL.Content.prototype = Object.create(ZOMBULL.Handler.prototype);
ZOMBULL.Content.constructor = ZOMBULL.Content;

ZOMBULL.Content.prototype.processGesture = function (gesture, event) {

    var method = this._gestures.find(gesture);
    if (method) {
        var message = {
            method: method,
            link: gesture.link,
            image: gesture.image,
            selection: gesture.selection,
            options: this._options
        };

        if (!ZOMBULL.invokeMethod.call(this._tabActions, message)) {
            // Note, the RPC name needs to be different than processGesture so that
            // other tabs don't try to process this tab's gesture, i.e. so that only
            // the service worker processes the gesture.
            chrome.runtime.sendMessage({ method: 'onGesture', message: message });
        }

        // Clear the selected stuff in the window (if anything was selected).
        window.getSelection().removeAllRanges();

        ZOMBULL.cancelEvent(event);

        this._blockContextMenu = this._blockContextMenu || gesture.blockContextMenu;

        gesture.end();

        return true;
    }

    gesture.end();

    return false;
};

chrome.storage.sync.get('options', function(storage) {
    var options = {};

    if (storage.options) {
        options = storage.options;
    } else {
        // The current options property needs to be a deep copy of DefaultOptions.  As we're not using
        // lodash in the core extension, stringify and reparse the options to create a copy.  This is a
        // one-time thing, performance is more than fast enough for our purposes.
        options = JSON.parse(JSON.stringify(ZOMBULL.DefaultOptions));
    }

    (new ZOMBULL.Content()).init(options);
});
