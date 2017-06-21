gestures.factory('errorDialog', function($mdDialog, $filter) {
    'use strict';

    return function (message) {
        $mdDialog.show($mdDialog.alert()
            .title($filter('i18n')(message + 'Title'))
            .content($filter('i18n')(message))
            .ariaLabel(message + ' Error')
            .ok('OK')
            .clickOutsideToClose(true)
        );
    };
});
