gestures.factory('gestureDetails', function($filter, $sce) {

    var codeToElement = {
        s: '<span>{0}</span>'.format($filter('i18n')('shift')),
        m: '<span>{0}</span>'.format($filter('i18n')('meta')),
        a: '<span>{0}</span>'.format($filter('i18n')('alt')),
        c: '<span>{0}</span>'.format($filter('i18n')('ctrl')),

        U: '<i class="material-icons">keyboard_arrow_up</i>',
        D: '<i class="material-icons">keyboard_arrow_down</i>',
        L: '<i class="material-icons">keyboard_arrow_left</i>',
        R: '<i class="material-icons">keyboard_arrow_right</i>'
    }

    var typeToElement = {
        rocker: '<span>{0}</span>'.format($filter('i18n')('rocker')),
        mouse: ''
    }

    return function (gesture) {
        var html = "";
        if (gesture) {
            html = _.reduce(gesture.gesture, function(result, code) { return result + codeToElement[code]; }, typeToElement[gesture.type]).replace(/span><span/g, 'span>&nbsp;<span');
        }
        return $sce.trustAsHtml(html);
    };
});
