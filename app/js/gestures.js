'use strict';

(function (ZOMBULL) {

    ZOMBULL.Gestures = function () {
        this._gestures = {};
        this._reset();
    };

    ZOMBULL.Gestures.prototype._init = function(target) {
        this._gestures[target] = {};
        this._gestures[target][ZOMBULL.GestureType.MOUSE] = {};
        this._gestures[target][ZOMBULL.GestureType.ROCKER] = {};
    };

    ZOMBULL.Gestures.prototype._reset = function() {
        this._init(ZOMBULL.GestureTarget.GENERIC);
        this._init(ZOMBULL.GestureTarget.LINK);
        this._init(ZOMBULL.GestureTarget.IMAGE);
        this._init(ZOMBULL.GestureTarget.SELECTION);
    };

    ZOMBULL.Gestures.prototype.reset = function (options, targets) {
        this._reset();

        if (options) {
            for (var action in options.actions) {
                if (options.actions.hasOwnProperty(action) && options.actions[action]) {
                    for (var i = 0; i < options.actions[action].length; i++) {
                        var target = targets[action];
                        var gesture = options.actions[action][i];
                        this._gestures[target][gesture.type][gesture.gesture] = action;
                    }
                }
            }
        }
    };

    ZOMBULL.Gestures.prototype._find = function (target, key, type) {
        return this._gestures[target][type].hasOwnProperty(key);
    };

    ZOMBULL.Gestures.prototype.find = function (gesture) {

        var method = null;
        if (gesture.valid) {
            var key = gesture.key();
            var type = gesture.type;

            if (gesture.isSelection() && this._find(ZOMBULL.GestureTarget.SELECTION, key, type)) {
                method = this._gestures[ZOMBULL.GestureTarget.SELECTION][type][key];
            }
            else if (gesture.isLink() && this._find(ZOMBULL.GestureTarget.LINK, key, type)) {
                method = this._gestures[ZOMBULL.GestureTarget.LINK][type][key];
            }
            else if (gesture.isImage() && this._find(ZOMBULL.GestureTarget.IMAGE, key, type)) {
                method = this._gestures[ZOMBULL.GestureTarget.IMAGE][type][key];
            }
            else if (gesture.isGeneric() && this._find(ZOMBULL.GestureTarget.GENERIC, key, type)) {
                method = this._gestures[ZOMBULL.GestureTarget.GENERIC][type][key];
            }
        }

        return method;
    };
}(window.ZOMBULL = window.ZOMBULL || {}));