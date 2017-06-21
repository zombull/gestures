'use strict';

(function(ZOMBULL) {
    ZOMBULL.Handler = function () {
        this._gestures = new ZOMBULL.Gestures();

        this._options = null;

        this._background = null;

        this._mouse = new ZOMBULL.MouseGesture(this.processGesture.bind(this));
        this._rocker = new ZOMBULL.RockerGesture(this.processGesture.bind(this));
        this._eventManager = new ZOMBULL.EventManager(this);

        this._linux = false;
        this._blockContextMenu = false;
    };

    ZOMBULL.Handler.prototype.init = function () {
        this._eventManager.addEventListener('contextmenu', this.onContextMenu);

        this._background = chrome.runtime.connect({ name: 'handler' });
        this._background.onMessage.addListener(ZOMBULL.invokeMethod.bind(this));
        this._background.onDisconnect.addListener(this.disconnected.bind(this));
    };

    ZOMBULL.Handler.prototype.destroy = function () {
        if (this._background) {
            this._background.disconnect();
        }

        this._mouse.destroy();
        this._rocker.destroy();
        this._eventManager.removeEventListeners();
    };


    ZOMBULL.Handler.prototype.reset = function (message) {
        this._linux = message.linux;
        this._blockContextMenu = false;

        this._options = message.options;

        this._gestures.reset(this._options, message.targets);
        this._mouse.reset(this._options);
        this._rocker.reset(this._options);
    };

    ZOMBULL.Handler.prototype.tabInactive = function (message) {
        this._blockContextMenu = false;

        this._mouse.end();
        this._rocker.end();
    };

    ZOMBULL.Handler.prototype.disconnected = function () {
        this._background = null;

        this._mouse.reset(null);
        this._rocker.reset(null);
    };

    ZOMBULL.Handler.prototype.onContextMenu = function (event) {
        if (this._linux) {
            this._blockContextMenu = false;
            if (this._mouse.blockContextMenu) {
                this._blockContextMenu = true;
            }
            else if (this._rocker.blockContextMenu) {
                this._blockContextMenu = (!this._options.rockerContextMenu || this._rocker.isLink() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
            }
        }

        if (this._blockContextMenu) {
            ZOMBULL.cancelEvent(event);

            this._blockContextMenu = false;
        }
        else {
            // Cancel any ongoing gesture if the context menu is being shown.
            this._mouse.end();
            this._rocker.end();
        }
    };
}(window.ZOMBULL = window.ZOMBULL || {}));