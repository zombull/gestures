'use strict';

ZOMBULL.Gestures = function () {
    this._gestures = {};
    this.initTargets();
};

ZOMBULL.Gestures.prototype.initTarget = function(target) {
    this._gestures[target] = {};
    this._gestures[target][ZOMBULL.GestureType.MOUSE] = {};
    this._gestures[target][ZOMBULL.GestureType.ROCKER] = {};
};

ZOMBULL.Gestures.prototype.initTargets = function() {
    this.initTarget(ZOMBULL.GestureTarget.GENERIC);
    this.initTarget(ZOMBULL.GestureTarget.LINK);
    this.initTarget(ZOMBULL.GestureTarget.IMAGE);
    this.initTarget(ZOMBULL.GestureTarget.SELECTION);
};

ZOMBULL.Gestures.prototype.init = function (options) {
    this.initTargets();

    for (var action in options.actions) {
        if (options.actions.hasOwnProperty(action) && options.actions[action]) {
            for (var i = 0; i < options.actions[action].length; i++) {
                var target = ZOMBULL.ActionTargets[action];
                var gesture = options.actions[action][i];
                this._gestures[target][gesture.type][gesture.gesture] = action;
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