'use strict';

(function (ZOMBULL) {

    // Minimize size for a mouse movement to be considered the start of a gesture.
    ZOMBULL.MIN_GESTURE_SIZE = 15;

    ZOMBULL.GestureType = {
        MOUSE: 'mouse',
        ROCKER: 'rocker',
    };

    ZOMBULL.GestureTarget = {
        GENERIC: 'generic',
        LINK: 'link',
        IMAGE: 'image',
        SELECTION: 'selection',
    };

    ZOMBULL.MouseButton = {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2,
    };

    // Note that these are the bit positions, not the shifted bit.
    ZOMBULL.MouseMultiButtonBits = {
        LEFT: 0,
        RIGHT: 1,
        MIDDLE: 2,
        BACK: 3,
        FORWARD: 4,
    };

    ZOMBULL.DisableKey = {
        NONE: 0,
        ALT: 1,
        CTRL: 2,
        META: 3,
        SHIFT: 4
    };

}(window.ZOMBULL = window.ZOMBULL || {}));