'use strict';

(function (ZOMBULL) {

    var mouse = ZOMBULL.MouseButton;

    ZOMBULL.Gesture = function (processGesture, type) {
        this.valid = false;
        this.type = type;

        this._processGesture = processGesture;
        this._options = null;

        this._alt = false;
        this._ctrl = false;
        this._meta = false;
        this._shift = false;

        this.link = null;
        this.image = null;
        this.selection = null;

        this._eventManager = new ZOMBULL.EventManager(this);

        this.blockContextMenu = false;

        this.addEventListener('mousedown', this.onMouseDown);
    };

    ZOMBULL.Gesture.prototype.destroy = function() {
        this.end();
        this.removeEventListeners();
    };

    ZOMBULL.Gesture.prototype.reset = function (options) {
        this.end();

        this._options = options;
    };

    ZOMBULL.Gesture.prototype.disableGesture = function(event) {
        return ((this._options.disableKey !== ZOMBULL.DisableKey.NONE) &&
               ((event.altKey && this._options.disableKey === ZOMBULL.DisableKey.ALT) ||
                (event.ctrlKey && this._options.disableKey === ZOMBULL.DisableKey.CTRL) ||
                (event.metaKey && this._options.disableKey === ZOMBULL.DisableKey.META) ||
                (event.shiftKey && this._options.disableKey === ZOMBULL.DisableKey.SHIFT)));
    };

    ZOMBULL.Gesture.prototype.onMouseDown = function (event) {
        // Always clear any ongoing gestures.  Either we're starting a new gesture or a different
        // button is being clicked, which cancels the gesture.
        this.end();

        if (this._options && this.isGesture(event) && !this.disableGesture(event)) {
            this._alt = false;
            this._ctrl = false;
            this._meta = false;
            this._shift = false;

            this.link = ZOMBULL.getLink(event.target);
            this.image = ZOMBULL.getImage(event.target);
            this.selection = window.getSelection().toString();

            this.start(event);
        }
    };

    ZOMBULL.Gesture.prototype.addModifier = function (key, modifier, code) {
        return (modifier ? code : '') + key;
    };

    ZOMBULL.Gesture.prototype.addModifiers = function(key) {
        key = this.addModifier(key, this._shift, 's');
        key = this.addModifier(key, this._meta, 'm');
        key = this.addModifier(key, this._alt, 'a');
        key = this.addModifier(key, this._ctrl, 'c');
        return key;
    };

    ZOMBULL.Gesture.prototype.process = function (event) {
        if (this.valid) {
            this._alt = event.altKey;
            this._ctrl = event.ctrlKey;
            this._meta = event.metaKey;
            this._shift = event.shiftKey;

            this._processGesture(this, event);
        }
    };

    ZOMBULL.Gesture.prototype.addEventListener = function (event, func) {
        this._eventManager.addEventListener(event, func);
    };

    ZOMBULL.Gesture.prototype.removeEventListeners = function () {
        this._eventManager.removeEventListeners();
    };

    ZOMBULL.Gesture.prototype.addTemporaryEventListener = function (event, func) {
        this._eventManager.addEventListener(event, func, true);
    };

    ZOMBULL.Gesture.prototype.removeTemporaryEventListeners = function () {
        this._eventManager.removeEventListeners(true);
    };

    ZOMBULL.Gesture.prototype.isRocker = function () {
        return (this.type == ZOMBULL.GestureType.ROCKER);
    };

    ZOMBULL.Gesture.prototype.isMouse = function () {
        return (this.type == ZOMBULL.GestureType.MOUSE);
    };

    ZOMBULL.Gesture.prototype.isGeneric = function () {
        return (!this.target || this.target === ZOMBULL.GestureTarget.GENERIC);
    };

    ZOMBULL.Gesture.prototype.isSelection = function () {
        return (this.selection || this.target === ZOMBULL.GestureTarget.SELECTION);
    };

    ZOMBULL.Gesture.prototype.isLink = function () {
        return (this.link || this.target === ZOMBULL.GestureTarget.LINK);
    };

    ZOMBULL.Gesture.prototype.isImage = function () {
        return (this.image || this.target === ZOMBULL.GestureTarget.IMAGE);
    };

}(window.ZOMBULL = window.ZOMBULL || {}));
