'use strict';

(function (ZOMBULL) {

    ZOMBULL.EventManager = function (owner) {
        this._owner = owner;
        this._eventListenerRemovalFunctions = [];
        this._temporaryEventListenerRemovalFunctions = [];
    };

    ZOMBULL.EventManager.prototype.addEventListener = function (event, func, temporary) {
        var listener = func.bind(this._owner);
        window.addEventListener(event, listener, true);

        if (!temporary) {
            this._eventListenerRemovalFunctions.push(function () { window.removeEventListener(event, listener, true); });
        }
        else {
            this._temporaryEventListenerRemovalFunctions.push(function () { window.removeEventListener(event, listener, true); });
        }
    };

    ZOMBULL.EventManager.prototype.removeEventListeners = function (temporary) {
        this._temporaryEventListenerRemovalFunctions.forEach(function(removalFunction) { removalFunction(); });
        this._temporaryEventListenerRemovalFunctions = [];

        if (!temporary) {
            this._eventListenerRemovalFunctions.forEach(function(removalFunction) { removalFunction(); });
            this._eventListenerRemovalFunctions = [];
        }
    };
}(window.ZOMBULL = window.ZOMBULL || {}));