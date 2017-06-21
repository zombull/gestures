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

}(window.ZOMBULL = window.ZOMBULL || {}));