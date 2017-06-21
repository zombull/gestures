var gestures = angular.module('gestures', ['ngMaterial', 'ngSanitize']);
gestures.config(function($mdThemingProvider) {

     var zpink = $mdThemingProvider.extendPalette('pink', {
        '600': '#FF3900',
    });

    $mdThemingProvider.definePalette('zpink', zpink);
    $mdThemingProvider.theme('default').accentPalette('zpink', {
        'default': '600',
    });
});