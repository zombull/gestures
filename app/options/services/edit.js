gestures.factory('editGesture', function($mdDialog) {
    'use strict';

    return function (event, action, oldGesture, options) {
        var editDialog = {
            targetEvent: event,
            controller: 'EditController',
            controllerAs: 'ctrl',
            locals: { action: action, oldGesture: oldGesture, options: options },
            ariaLabel: 'edit-dialog',
            templateUrl: 'options/dialogs/edit.html'
        };

        return $mdDialog.show(editDialog);
    };
});

gestures.controller('EditController', function EditController($scope, $mdDialog, $timeout, safeApply, gestureDetails, action, oldGesture, options) {
    'use strict';

    $scope.options = options;
    $scope.action = action;

    $scope.gestureDetails = undefined;
    $scope.existingGesture = undefined;
    $scope.newGesture = undefined;

    var updateGesture = function(gesture, existingGesture) {
        $scope.newGesture = { type: gesture.type, gesture: gesture.key() };
        $scope.gestureDetails = gestureDetails($scope.newGesture);
        $scope.existingGesture = existingGesture;
    }

    var capture = new window.ZOMBULL.Capture(safeApply.bind($scope, updateGesture), ZOMBULL.ActionTargets[action]);
    capture.init();

    $scope.save = function() {
        capture.destroy();

        if (oldGesture) {
            _.remove($scope.options.actions[action], function(gesture) {
                return (gesture.gesture === oldGesture.gesture && gesture.type === oldGesture.type);
            });
        }
        $scope.options.actions[action].push($scope.newGesture);

        $mdDialog.hide($scope.options);
    }

    $scope.cancel = function() {
        capture.destroy();
        $mdDialog.cancel();
    }
});
