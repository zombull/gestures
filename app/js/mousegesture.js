'use strict';

(function (ZOMBULL) {

    ZOMBULL.mouseGesturesDisabled = false;

    // Cache enums to reduce the amount of typing required.
    var mouse = ZOMBULL.MouseButton;
    var multi = ZOMBULL.MouseMultiButton;

    var MIN_GESTURE_SIZE = ZOMBULL.MIN_GESTURE_SIZE;

    // Minimum size for a mouse movement to be considered a line.
    var MIN_LINE_SIZE = 15;

    // Maximum number of lines allowed in a gesture.
    var MAX_LINES = 100;

    // Maximum size of a diagonal line we'll allow before ending the gesture.
    var MAX_DIAG_SIZE = 50;


    ZOMBULL.MouseGesture = function (processGesture) {
        ZOMBULL.Gesture.call(this, processGesture, ZOMBULL.GestureType.MOUSE);

        this._points = [];
        this._lines = [];

        this._canvas = document.createElement('canvas');
        if (this._canvas.style) {
            this._canvas.style.position = 'fixed';
            this._canvas.style.top = 0;
            this._canvas.style.left = 0;
            this._canvas.style.zIndex = 10001;
            this._canvas.style.background = 'transparent';
        }
        this.onResize();
    };

    ZOMBULL.MouseGesture.prototype = Object.create(ZOMBULL.Gesture.prototype);
    ZOMBULL.MouseGesture.constructor = ZOMBULL.MouseGesture;

    ZOMBULL.MouseGesture.prototype.isGesture = function (event) {

        if (ZOMBULL.mouseGesturesDisabled) {
            return false;
        }

        // Not a new gesture if the button being pressed is not the mouse gesture button.
        if (event.button != this._options.button) {
            return false;
        }

        // Not a gesture if multiple buttons are pressed.
        if (event.buttons && (ZOMBULL.popCount(event.buttons) > 1)) {
            return false;
        }

        return true;
    };


    ZOMBULL.MouseGesture.prototype.start = function (event) {
        this.end();

        this.blockContextMenu = this._options.button == mouse.RIGHT;

        this._points = [{ x: event.clientX, y: event.clientY }];
        this._lines = [];

        this.onResize();

        this.addTemporaryEventListener('resize', this.onResize);
        this.addTemporaryEventListener('mouseup', this.onMouseUp);
        this.addTemporaryEventListener('mousemove', this.onMouseMove);

        if (this._options.button == mouse.LEFT || this._options.button == mouse.MIDDLE) {
            ZOMBULL.cancelEvent(event);
        }

        this.valid = true;
    };

    ZOMBULL.MouseGesture.prototype.end = function () {
        this.blockContextMenu = false;

        if (this.valid) {
            this.valid = false;

            this._points = [];
            this._lines = [];

            if (this._canvas.parentNode) {
                this._canvas.parentNode.removeChild(this._canvas);
            }

            this.removeTemporaryEventListeners();
        }
    };

    ZOMBULL.MouseGesture.prototype.key = function () {
        if (this._lines.length) {
            var key = this._lines.reduce(function (a, b) { return a + b; });
            return this.addModifiers(key);
        }
        return '';
    };

    ZOMBULL.MouseGesture.prototype.onResize = function () {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
    };

    ZOMBULL.MouseGesture.prototype.onMouseMove = function (event) {
        var next = { x: event.clientX, y: event.clientY };
        var prev = this._points.back();

        var diff = { x: next.x - prev.x, y: next.y - prev.y };
        var abs = { x: Math.abs(diff.x), y: Math.abs(diff.y) };

        var prevLine = this._lines.back();
        var nextLine = null;
        var diagonal = false;

        if (abs.x > (2 * abs.y)) {
            nextLine = (diff.x > 0) ? 'R' : 'L';
        }
        else if (abs.y > (2 * abs.x)) {
            nextLine = (diff.y > 0) ? 'D' : 'U';
        }
        else {
            diagonal = true;
        }

        if (!diagonal) {

            // If we're moving in the same direction simply add the new point to the array.  If we've
            // changed direction, then only perform an update if the new line meets the minimum size
            // to be considered a unique line.  Similar to a diagonal movement, the user may correct
            // course and end up continuing the existing line.
            if (nextLine == prevLine) {
                this._points.push(next);
            }
            else if (abs.x > MIN_LINE_SIZE || abs.y > MIN_LINE_SIZE) {
                this._points.push(next);

                this._lines.push(nextLine);
            }
        }
        else if (abs.x > MAX_DIAG_SIZE || abs.y > MAX_DIAG_SIZE) {
            // end the gesture if we've moved diagonally for a sizable distance.
            this.end();
        }

        if (this._lines.length > MAX_LINES) {
            // end the gesture if the user has made an absurd number of lines.
            this.end();
        }

        if (this.valid && !this._canvas.parentNode && (abs.x > MIN_GESTURE_SIZE || abs.y > MIN_GESTURE_SIZE)) {
            document.body.appendChild(this._canvas);
        }
    };

    ZOMBULL.MouseGesture.prototype.onMouseUp = function (event) {
        if (event.button == this._options.button) {

            // Account for any final mouse movement.
            this.onMouseMove(event);

            this.process(event);
        }
        else {
            this.end();
        }
    };

}(window.ZOMBULL = window.ZOMBULL || {}));
