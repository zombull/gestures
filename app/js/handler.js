'use strict';

ZOMBULL.Handler = function () {
    this._gestures = new ZOMBULL.Gestures();

    this._options = null;

    this._mouse = new ZOMBULL.MouseGesture(this.processGesture.bind(this));
    this._rocker = new ZOMBULL.RockerGesture(this.processGesture.bind(this));
    this._eventManager = new ZOMBULL.EventManager(this);

    this._linux = true;
    this._blockContextMenu = false;

    chrome.runtime.onMessage.addListener(ZOMBULL.invokeMethod.bind(this));

    chrome.runtime.sendMessage({ method: 'onTabAdded' });
};

ZOMBULL.Handler.prototype.init = function (options) {
    this._eventManager.addEventListener('contextmenu', this.onContextMenu);

    this._options = options;

    this._gestures.init(options);
    this._mouse.init(options);
    this._rocker.init(options);

    chrome.storage.session.get('linux', function(result) {
        if (result != undefined && result.hasOwnProperty('linux')) {
            this._linux = result.linux;
        }
    });
};

ZOMBULL.Handler.prototype.destroy = function () {
    this._mouse.destroy();
    this._rocker.destroy();
    this._eventManager.removeEventListeners();
};

ZOMBULL.Handler.prototype.tabInactive = function (message) {
    this._blockContextMenu = false;

    this._mouse.end();
    this._rocker.end();
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