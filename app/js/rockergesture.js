'use strict';

(function (ZOMBULL) {

    // Cache a few things to reduce the amount of typing required.
    var mouse = ZOMBULL.MouseButton;
    var multi = ZOMBULL.MouseMultiButtonBits;
    var bitTest = ZOMBULL.bitTest;

    // Maximum size for a mouse movement before we cancel this gesture.  This is tied to the min gesture
    // size so that we'll cancel a rocker gesture at the same time we start a mouse gesture..
    var MAX_MOUSE_MOVE_SIZE = ZOMBULL.MIN_GESTURE_SIZE;

    ZOMBULL.RockerGesture = function (processGesture) {
        ZOMBULL.Gesture.call(this, processGesture, ZOMBULL.GestureType.ROCKER);

        this._buttonToKey = {};
        this._buttonToKey[mouse.LEFT] = 'L';
        this._buttonToKey[mouse.RIGHT] = 'R';

        this._keys = [];
        this._buttons = [];

        this._start = null;

        this.addEventListener('click', this.onMouseClick);
    };

    ZOMBULL.RockerGesture.prototype = Object.create(ZOMBULL.Gesture.prototype);
    ZOMBULL.RockerGesture.constructor = ZOMBULL.RockerGesture;

    ZOMBULL.RockerGesture.prototype.isGesture = function (event) {
        // Need exactly LEFT and RIGHT buttons, no more, no less.
        return (event.buttons && ZOMBULL.popCount(event.buttons) == 2 && bitTest(event.buttons, multi.LEFT) && bitTest(event.buttons, multi.RIGHT));
    };

    ZOMBULL.RockerGesture.prototype.start = function (event) {
        this.end();

        this.blockContextMenu = bitTest(event.buttons, multi.RIGHT);

        if (event.button != mouse.LEFT && bitTest(event.buttons, multi.LEFT)) {
            this.push(mouse.LEFT);
        }
        else if (event.button != mouse.RIGHT && bitTest(event.buttons, multi.RIGHT)) {
            this.push(mouse.RIGHT);
        }
        this.push(event.button);

        if (this._buttons.length === 2) {
            this._start = { x: event.clientX, y: event.clientY };

            this.addTemporaryEventListener('mouseup', this.onMouseUp);
            this.addTemporaryEventListener('mousemove', this.onMouseMove);

            this.valid = true;
        }
    };

    ZOMBULL.RockerGesture.prototype.end = function () {
        this.blockContextMenu = false;

        if (this.valid) {
            this.valid = false;

            this._keys = [];
            this._buttons = [];

            this._start = null;

            this.removeTemporaryEventListeners();
        }
    };

    ZOMBULL.RockerGesture.prototype.key = function () {
        var key = this._keys.reduce(function (a, b) { return a + b; });
        return this.addModifiers(key);
    };

    ZOMBULL.RockerGesture.prototype.push = function (button) {
        this._buttons.push(button);
        this._keys.push(this._buttonToKey[button]);
    };

    ZOMBULL.RockerGesture.prototype.onMouseMove = function (event) {
        var diff = { x: event.clientX - this._start.x, y: this._start.y - event.clientY };
        var abs = { x: Math.abs(diff.x), y: Math.abs(diff.y) };

        if (abs.x > MAX_MOUSE_MOVE_SIZE || abs.y > MAX_MOUSE_MOVE_SIZE) {
            this.end();
        }
    };

    ZOMBULL.RockerGesture.prototype.onMouseUp = function (event) {
        if (this._buttons.length == 2 && this._buttons.back() == event.button) {
            this.process(event);
        }
        else {
            this.end();
        }
    };

    ZOMBULL.RockerGesture.prototype.onMouseClick = function (event) {
        // TODO: Check if the gesture is actually defined.
        if (event.buttons && bitTest(event.buttons, multi.RIGHT)) {
            ZOMBULL.cancelEvent(event);
        }
    };

}(window.ZOMBULL = window.ZOMBULL || {}));
