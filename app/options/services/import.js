gestures.factory('importOptions', function($mdDialog) {
    'use strict';

    return function (event) {
        var importDialog = {
            targetEvent: event,
            controller: 'ImportController',
            controllerAs: 'ctrl',
            ariaLabel: 'import-dialog',
            templateUrl: 'options/dialogs/import.html'
        };

        return $mdDialog.show(importDialog);
    };
});

gestures.controller('ImportController', function ImportController($scope, $mdDialog, $timeout, $filter) {
    'use strict';

    $scope.options = undefined;
    $scope.error = undefined;

    function error(message, params) {
        throw $filter('i18n')(message, params);
    }

    function verifyObject(name, expected, actual) {
        _.each(_.keys(expected), function(key) {
            if (!_.has(actual, key)) {
                error('importMissingProperty', [key, name]);
            }

            var expectedType = _.isArray(expected[key]) ? 'array' : _.isNull(expected[key]) ? 'null' : (typeof expected[key]);
            var actualType = _.isArray(actual[key]) ? 'array' : _.isNull(actual[key]) ? 'null' : (typeof actual[key]);
            if (expectedType !== actualType) {
                error('importInvalidPropertyType', [name, key, expectedType, actualType]);
            }
        });

        _.each(_.keys(actual), function(key) {
            if (!_.has(expected, key)) {
                error('importUnknownProperty', [key, name]);
            }
        });
    }

    $scope.verify = function() {
        try {
            $scope.options = undefined;

            var options = JSON.parse($scope.unverified);
            options.name = 'Imported';

            verifyObject('options', ZOMBULL.DefaultOptions, options);
            verifyObject('actions', ZOMBULL.DefaultOptions.actions, options.actions);

            var _gestures = (new ZOMBULL.Gestures())._gestures;

            var referenceGesture = { gesture: 'string', type: 'string' };
            _.each(_.keys(options.actions), function(action) {
                _.each(options.actions[action], function(gesture) {
                    verifyObject('{0}'.format(action), referenceGesture, gesture);

                    var target = ZOMBULL.ActionTargets[action];

                    if (!gesture.gesture) {
                        error('importEmptyGesture', action);
                    }

                    if (gesture.type === ZOMBULL.GestureType.MOUSE) {
                        if (gesture.gesture.indexOf('U') === -1 && gesture.gesture.indexOf('D') === -1 && gesture.gesture.indexOf('L') === -1 && gesture.gesture.indexOf('R') === -1) {
                            error('importInvalidMouse', [gesture.gesture, action]);
                        }
                    }
                    else if (gesture.type === ZOMBULL.GestureType.ROCKER) {
                        if (gesture.gesture.indexOf('U') !== -1 || gesture.gesture.indexOf('D') !== -1) {
                            error('importInvalidRockerUD', [code, action]);
                        }

                        var leftButton = false;
                        var rightButton = false;

                        _.each(gesture.gesture, function(code) {
                            if (code === 'L') {
                                if (leftButton) {
                                    error('importInvalidRocker', [code, action]);
                                }
                                leftButton = true;
                            }
                            else if (code === 'R') {
                                if (rightButton) {
                                    error('importInvalidRocker', [code, action]);
                                }
                                rightButton = true;
                            }
                        });

                        if (!leftButton || !rightButton) {
                            error('importInvalidRocker', [gesture.gesture, action]);
                        }
                    }
                    else {
                        error('importUnknownType', [gesture.type, action]);
                    }

                    var known = 'camsUDLR';
                    var allowed = 'camsUDLR';
                    _.each(gesture.gesture, function(code) {
                        if (known.indexOf(code) === -1) {
                            error('importUnknownCode', [code, action]);
                        }

                        if (allowed.indexOf(code) === -1) {
                            error('importInvalidModifier', [code, action]);
                        }

                        var split = (code === 'U' || code ==='D' || code === 'L' || code ==='R') ? 's' : code;
                        allowed = allowed.split(split).pop();
                    });

                    var existing = _gestures[target][gesture.type][gesture.gesture];
                    if (existing) {
                        error('importDuplicateGesture', [action, existing]);
                    }

                    _gestures[target][gesture.type][gesture.gesture] = action;
                });
            });

            if (options.button !== ZOMBULL.MouseButton.LEFT && options.button !== ZOMBULL.MouseButton.MIDDLE && options.button !== ZOMBULL.MouseButton.RIGHT) {
                error('importInvalidButton', [ZOMBULL.MouseButton.LEFT, ZOMBULL.MouseButton.MIDDLE, ZOMBULL.MouseButton.RIGHT]);
            }

            // Wipe the name, these options will not be saved in the database.
            options.name = null;

            $scope.options = options;
            $scope.error = undefined;

            // Focus on the confirmation button so the user can just hit enter to copy the options
            // to the clipboard.  Do this is a zero-delay timeout so that the focus happens after
            // Angular does its refresh, else we'll try to focus the button before it exists.
            $timeout(function() { document.getElementById('import-confirm').focus(); });
        }
        catch (e) {
            $scope.options = undefined;
            $scope.error = e.message || e;
        }

    }

    $scope.import = function() {
        // No need to deep clone, options was created from JSON.parse and can serve as the object.
        $mdDialog.hide($scope.options);
    }

    $scope.cancel = function() {
        $mdDialog.cancel();
    }

    $timeout(function() { document.getElementById('port-content').focus(); });
});
