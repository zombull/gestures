gestures.factory('lsdOptions', function($mdDialog) {
    'use strict';

    return function (event, operation, saved) {
        var lsdDialog = {
            targetEvent: event,
            controller: 'LSDController',
            controllerAs: 'ctrl',
            locals: { operation: operation, saved: saved },
            ariaLabel: 'lsd-dialog',
            clickOutsideToClose: true,
            templateUrl: 'options/dialogs/lsd.html',
            onComplete: function(scope, element, options) {
                scope.ready = true;
            }
        };

        return $mdDialog.show(lsdDialog);
    };
});

gestures.controller('LSDController', function LSDController($mdDialog, $scope, $q, $timeout, database, operation, saved) {
    'use strict';

    var db = database();

    var self = this;
    self.isSave = (operation === 'save');
    self.isLoad = (operation === 'load');
    self.isDelete = (operation === 'delete');
    self.unsavedOptions = !saved;

    var savedList = _.map(db.keys(), function(name) {
        return { name: name, lname: name.toLowerCase().replace(/^\s+/, '') };
    });
    if (self.isLoad) {
        savedList.push({ name: 'Default', lname: 'default' });
    }

    self.confirm = function(name) {
        $mdDialog.hide(name);
    };

    self.cancel = function() {
        $mdDialog.cancel();
    };

    self.search = function (query) {
        // Immediately populating the search results (autofocus + min-length==0) causes weirdness because Angular
        // is still in the process of stamping and showing the dialog, essentially creating race conditions where
        // some or all of the results will be missing, or the results will be incorrectly positioned and/or sized.
        // Defer results until the dialog is ready (set in an anonymous function attached to onComplete).
        if (!$scope.ready) {
            var deferred = $q.defer();
            $timeout(function() {
                deferred.resolve(self.search());
            });
            return deferred.promise;
        }

        if (!query) {
            return savedList;
        }

        // Only A-Z, 0-9 and _ are allowed.
        if (/\W/.test(query)) {
              return [];
        }

        var lowercaseQuery = query.toLowerCase().replace(/^\s+/, '');

        // When saving, add the query to the list of results to be saved as a new name.
        var results = (!self.isSave || db.has(query)) ? [] : [{name: query, lname: lowercaseQuery}];

        return results.concat(savedList.filter(function(option) {
            return (!lowercaseQuery || option.lname.indexOf(lowercaseQuery) !== -1);
        }));
    };

    self.selectedItemChange = function(item) {
        self.name = item ? item.name : null;

        // Do not allow the user to save options as Default or Options.  JSON is case sensitive, but our search function is not.
        self.invalid = self.isSave && self.name && (self.name.toLowerCase() === 'default' || self.name.toLowerCase() === 'options');

        // Nuke the name if it's invalid.  If the name is still valid, focus on the confirmation button so the user can just hit enter to load/save/delete
        // the selected options.  Do this is a zero-delay timeout so that the focus happens after
        // Angular does its refresh, else we'll try to focus the button before it exists.
        if (self.invalid) {
            self.name = null;
        }
        else if (self.name) {
            $timeout(function() { document.getElementById('lsd-confirm').focus(); });
        }
    };
});
