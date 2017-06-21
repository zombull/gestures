gestures.filter('i18n', function() {
    return function(str, param, translateParam) {
        if (param) {
            if (_.isArray(param)) {
                return chrome.i18n.getMessage(str, param);
            }
            if (translateParam) {
                return chrome.i18n.getMessage(str, [chrome.i18n.getMessage(param)]);
            }
            return chrome.i18n.getMessage(str, [param]);
        }
        return chrome.i18n.getMessage(str);
    }

    // return function(str, text) {
    //     if (text) {
    //         return chrome.i18n.getMessage(str);
    //     }
    //     return $sce.trustAsHtml(chrome.i18n.getMessage(str));
    // }
});