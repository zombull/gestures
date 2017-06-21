gestures.factory('database', function(errorDialog) {

    var database = null;
    var ownerOnChanged = null;

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace === 'sync') {
            _.each(changes, function(change, key) {
                if (change.newValue) {
                    database[key] = change.newValue;
                }
                else {
                    delete database[key];
                }
            });

            if (ownerOnChanged) {
                ownerOnChanged(database.options);
            }
        }
    });

    return function () {
        return {
            init: function(onChange) {
                ownerOnChanged = onChange;

                if (database) {
                    ownerOnChanged(database.options);
                }
                else {
                    // Get the database from synchronized storage.  If nothing has been saved to the database then the default
                    // options are also the current options.  Don't bother saving anything until the user changes something,
                    // it's easier to let the normal sync/save flows deal with it.
                    chrome.storage.sync.get(null, function (db) {
                        database = db;
                        ownerOnChanged(database.options);
                    });
                }
            },

            keys: function() {
                return _.keys(_.omit(database, 'options'));
            },

            has: function(name) {
                return database.hasOwnProperty(name);
            },

            get: function(name) {
                if (name) {
                    if (name.toLowerCase() === 'default') {
                        return _.cloneDeep(ZOMBULL.DefaultOptions);
                    }
                    else if (database.hasOwnProperty(name)) {
                        return _.cloneDeep(database[name]);
                    }
                }
                return null;
            },

            set: function(name, value) {
                var keyValuePair = {};
                keyValuePair[name] = value;
                chrome.storage.sync.set(keyValuePair, function() {
                    if (chrome.runtime.lastError) {
                        errorDialog('storageError');
                    }
                });
            },

            remove: function(name) {
                chrome.storage.sync.remove(name);
            },

            usage: function(callback) {
                chrome.storage.sync.getBytesInUse(null, function(sizeInBytes) {
                    var used = _.keys(database).length;
                    var remaining = Math.floor((chrome.storage.sync.QUOTA_BYTES - sizeInBytes) / (sizeInBytes / used));

                    // Lie to the user, the current config doesn't count from their perspective.
                    callback(used - 1, remaining);
                });
            }
        };
    };
});
