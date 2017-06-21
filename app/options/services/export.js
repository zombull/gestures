gestures.factory('exportOptions', function($mdDialog) {
    'use strict';

    return function (event, options) {
        var exportDialog = {
            targetEvent: event,
            controller: 'ExportController',
            controllerAs: 'ctrl',
            locals: { options: options },
            ariaLabel: 'export-dialog',
            templateUrl: 'options/dialogs/export.html'
        };

        return $mdDialog.show(exportDialog);
    };
});

gestures.controller('ExportController',  function ExportController($scope, $mdDialog, $timeout, options) {
    'use strict';

    $scope.options = options;

    $scope.copy = function() {
        var range = document.createRange();
        range.selectNodeContents(document.getElementById('port-content'));

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        document.execCommand('copy');

        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    // Focus on the confirmation button so the user can just hit enter to copy the options
    // to the clipboard.  Do this is a zero-delay timeout so that the focus happens after
    // Angular does its refresh, else we'll try to focus the button before it exists.
    $timeout(function() { document.getElementById('export-confirm').focus(); });
});
