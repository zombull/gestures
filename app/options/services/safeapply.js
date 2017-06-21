gestures.factory('safeApply', function() {
    return function(fn, one, two, three) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            fn(one, two, three);
        }
        else {
            this.$apply(fn.bind(undefined, one, two, three));
        }
    }
});
