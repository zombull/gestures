'use strict';

(function (ZOMBULL) {

    ZOMBULL.Capture = function (updateGesture, target) {
        ZOMBULL.Handler.call(this);

        // When capturing we'll have a forced target, e.g. LINK, IMAGE or SELECTION
        this._target = target;

        this._updateGesture = updateGesture;
    };

    ZOMBULL.Capture.prototype = Object.create(ZOMBULL.Handler.prototype);
    ZOMBULL.Capture.constructor = ZOMBULL.Capture;

    ZOMBULL.Capture.prototype.processGesture = function (gesture, event) {
        // Jam in the target before searching for an existing gesture.  ZOMBULL.Gesture has code to
        // check for an externally set target even it does not use the variable itself.
        gesture.target = this._target;

        this._updateGesture(gesture, this._gestures.find(gesture));

        // Clear the selected stuff in the window (if anything was selected).
        window.getSelection().removeAllRanges();

        ZOMBULL.cancelEvent(event);

        this._blockContextMenu = this._blockContextMenu || gesture.blockContextMenu;

        gesture.end();

        return false;
    };
}(window.ZOMBULL = window.ZOMBULL || {}));