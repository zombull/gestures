'use strict';

(function (ZOMBULL) {

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
                this._background.postMessage({ method: 'processGesture', message: message });
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

    (new ZOMBULL.Content()).init();

}(window.ZOMBULL = window.ZOMBULL || {}));
