gestures.factory('helpDialog', function($mdDialog, $filter) {
    'use strict';

    return function (event, option) {
        if (option) {
            $mdDialog.show($mdDialog.alert()
                .title($filter('i18n')(option))
                .content($filter('i18n')(option + 'Help'))
                .ariaLabel($filter('i18n')(option) + ' Help')
                .ok('OK')
                .targetEvent(event)
                .clickOutsideToClose(true)
            );
        }
        else {
            var helpDialog = {
                targetEvent: event,
                ariaLabel: 'Help Dialog',
                clickOutsideToClose: true,
                templateUrl: 'options/dialogs/help.html',
            };
            $mdDialog.show(helpDialog);
        }
    };
});
