/**
 *
 */
gestures.controller('UIController', function UIController($scope, $filter, $mdDialog, safeApply, database, helpDialog, gestureDetails, editGesture, importOptions, exportOptions, lsdOptions) {
    'use strict';

    var db = database();

    $scope.savedName = null;
    $scope.options = null;
    $scope.databaseUsage = null;
    $scope.gestureDetails = gestureDetails;

    // Save the keys for each type based on DefaultOptions to provide a stable order for ng-repeat.
    $scope.bools = _.keys(_.pick(ZOMBULL.DefaultOptions, _.isBoolean));
    $scope.strings = _.filter(_.keys(_.pick(ZOMBULL.DefaultOptions, _.isString)), function(key) { return key !== 'name'; });
    $scope.actions = _.keys(ZOMBULL.DefaultOptions.actions);

    db.init(onChanged);

    function onChanged (options) {
        db.usage(safeApply.bind($scope, function(used, remaining) {
            $scope.options = options;
            $scope.savedName = null;
            $scope.databaseUsage = [ used, remaining ];

            // When comparing the reference options against the current options Lodash's matches() needs
            // to be invoked in both directions, as it will only compare objects/properties/arrays that
            // are in the reference.  If the user adds a gesture to an action that had no gestures then
            // the first _.matches() will return true because it won't check the empty array.
            var referenceOptions = db.get($scope.options.name);
            if (referenceOptions && _.matches(referenceOptions)($scope.options) && _.matches($scope.options)(referenceOptions)) {
                $scope.savedName = $scope.options.name;
            }
        }));
    };

    $scope.sync = function (options) {
        if (options) {
            $scope.options = options;
        }
        db.set('options', $scope.options);

        // chrome.runtime.sendMessage({ method: "setOptions", options: $scope.options });
    };

    $scope.help = function (event, option) {
        if (option && _.isBoolean($scope.options[option])) {
            if (event.target.localName === 'md-switch' || event.target.className === 'md-label') {
                // Hijack the user clicking on the text portion of the switch to display the
                // help message for the option.  Squash the event to prevent the toggling.
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
            else {
                // The user clicked on the switch button itself, this event is not for us.
                return;
            }
        }
        helpDialog(event, option);
    };

    $scope.edit = function(event, action, gesture) {
        editGesture(event, action, gesture, $scope.options).then(function(options) {
            $scope.sync(options);
        }, function() {

        });
    };

    $scope.delete = function (event, action, deleteGesture) {
        _.remove($scope.options.actions[action], function(gesture) {
            return (gesture.gesture === deleteGesture.gesture && gesture.type === deleteGesture.type);
        });
        $scope.sync();
    };

    $scope.import = function (event) {
        importOptions(event).then(function(options) {
            $scope.sync(options);
        }, function() {
            // Do nothing
        });
    };

    $scope.export = function (event) {
        exportOptions(event, $scope.options);
    };

    $scope.lsd = function(event, operation) {
        lsdOptions(event, operation, $scope.savedName).then(function(name) {
            if (operation === 'save') {
                $scope.options.name = name;
                db.set(name, $scope.options);
                $scope.sync();
            }
            else if (operation === 'load') {
                $scope.sync(db.get(name));
            }
            else if (operation === 'delete') {
                db.remove(name);
            }
        }, function() {
            // Do nothing if the user canceled the operation.
        });
    }
});
