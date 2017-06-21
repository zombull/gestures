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
        this._contextMenuEvent = null;
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
            this._blockContextMenu = this._blockContextMenu || this._mouse.blockContextMenu || this._rocker.blockContextMenu;
        }
        if (this._blockContextMenu) {
            ZOMBULL.cancelEvent(event);

            this._blockContextMenu = false;
            this._contextMenuEvent = event;
            this._eventManager.addEventListener('mouseup', this.onMouseUp, true);
        }
        else {
            // Cancel any ongoing gesture if the context menu is being shown.
            this._mouse.end();
            this._rocker.end();
        }
    };

    ZOMBULL.Handler.prototype.onMouseUp = function (event) {
        var contextMenuEvent = new MouseEvent('contextmenu', {
            'bubbles': this._contextMenuEvent.bubbles,
            'cancelable': this._contextMenuEvent.cancelable,
            'scoped': this._contextMenuEvent.scoped,
            'composed': this._contextMenuEvent.composed,
            'sourceCapabilities': this._contextMenuEvent.sourceCapabilities,
            'view': event.view,
            'detail': event.detail,
            'screenX': event.screenX,
            'screenY': event.screenY,
            'clientX': event.clientX,
            'clientY': event.clientY,
            'ctrlKey': event.ctrlKey,
            'shiftKey': event.shiftKey,
            'altKey': event.altKey,
            'metaKey': event.metaKey,
            'button': event.button,
            'buttons': event.buttons,
            'relatedTarget': event.relatedTarget,
            'region': event.region,
        });

        event.target.dispatchEvent(contextMenuEvent);

        this._contextMenuEvent = null;

        this._eventManager.removeEventListeners(true);
    };
}(window.ZOMBULL = window.ZOMBULL || {}));