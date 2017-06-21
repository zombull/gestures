/**
 *
 */
gestures.controller('SearchController', function SearchController($filter, $timeout) {
    'use strict';

    var self = this;

    var FORWARD_SLASH = 191;

    var focusSearch = function(event) {
        if (event.keyCode === FORWARD_SLASH && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
            // Do not perform the focus if the target of the key is an input element or if there
            // is a dialog showing.
            if (event.target.tagName.toLowerCase() !== 'input' && !document.body.className.match('md-dialog-is-showing')) {
                document.getElementById('search').focus();

                // Do not fill search field with forward slash.
                event.preventDefault();
                event.stopPropagation();
            }
        }
    };
    window.addEventListener('keydown', focusSearch, false);

    // Clear the search text when the input is focused.  This needs to be done in $timeout,
    // adjusting searchText while Angular is doing its thing will make it think the selection
    // change and Angular will display the list again and again and again.  Adding the event
    // listener also needs to be in $timeout as the input won't be stamped to the page when
    // this controller is first run.
    $timeout(function() {
        document.getElementById('search').addEventListener('focus', function() { $timeout(function() { self.searchText = ""; }); }, false);
    });


    var options = [];
    function addOptions(object) {
        _.each(_.keys(object), function(option) {
            if (option !== "name") {
                options.push({ name: $filter('i18n')(option), lname: $filter('i18n')(option).toLowerCase(), id: option });
            }
        });
    }

    // Save the keys for each type based on DefaultOptions to provide a stable order for ng-repeat.
    addOptions(_.pick(ZOMBULL.DefaultOptions, _.isBoolean));
    addOptions(_.pick(ZOMBULL.DefaultOptions, _.isString));
    addOptions(ZOMBULL.DefaultOptions.actions);

    // Sort the list of options by name.
    options = _.sortBy(options, 'lname');

    self.search = function (query) {
        if (!query) {
            return options;
        }
        var lowercaseQuery = query.toLowerCase().replace(/^\s+/, '');
        return options.filter(function(option) {
            return (!lowercaseQuery || option.lname.indexOf(lowercaseQuery) !== -1);
        });
    };

    self.selectedItemChange = function(option) {
        if (option && option.id) {
            // Focus on the element.
            var element = document.getElementById(option.id);
            element.focus();

            // Center (more or less) the window on the element.  This has to be in $timeout so that it happens
            // after Angular does its thing, else our update to the window will get crushed by Angular's updates.
            $timeout(function() {
                var offsetY = 0;
                for ( ; element && element != document.body; element = element.offsetParent) {
                    offsetY += element.offsetTop || 0;
                }
                offsetY = offsetY - (window.innerHeight / 2);
                window.scrollTo(window.scrollX, offsetY);
            });
        }
    };
});