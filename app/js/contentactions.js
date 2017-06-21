'use strict';

(function(ZOMBULL) {

    ZOMBULL.ContentActions = function() {
    };

    ZOMBULL.ContentActions.prototype.stop = function(message) {
        window.stop();
    };

    ZOMBULL.ContentActions.prototype.back = function(message) {
        history.back();
    };

    ZOMBULL.ContentActions.prototype.forward = function(message) {
        history.forward();
    };

    ZOMBULL.ContentActions.prototype.print = function(message) {
        window.print();
    };

    ZOMBULL.ContentActions.prototype.enableMouseGestures = function(message) {
        ZOMBULL.mouseGesturesDisabled = false;
    };

    ZOMBULL.ContentActions.prototype.disableMouseGestures = function(message) {
        ZOMBULL.mouseGesturesDisabled = true;
    };

}(window.ZOMBULL = window.ZOMBULL || {}));