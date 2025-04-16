var oapBootstrapVer = "2013-06-24-11-28",
    _gaq = _gaq || [];

(function() {
    (function(f) {
        f(document).ready(function(c) {
            var e = {
                current: {},
                threeday: {}
            };
            e.current.selector = ".aw-widget-current";
            e.current.baseClass = "aw-widget-current";
            e.current.url = "https://www.accuweather.com/ajax-service/oap/current";

            if (-1 != document.domain.indexOf("accuweather") || c(".aw-widget-legal").length) {
                var b = f(e.current.selector).add(e.threeday.selector),
                    a = c();
                b.each(function() {
                    this.awInit || a.length || (a = c(this), this.awType = -1 != a.data("uid").indexOf("awcc") ? "current" : "threeday",
                        this.awInit = !0)
                });
                b = a.data();
                b.css = null;

                f.get(e[a.get(0).awType].url, function(data) {
                    // Strip the leading "callback({'html':'" and trailing "'});",
                    // which apparently is all the callback script does...
                    data = data.substring(18, data.length);
                    data = data.substring(0, data.length - 4);

                    f.each(f.parseHTML(data), function(i, d) {
                        if (d.type === 'text/css') {
                            f('head')[0].appendChild(d);
                        } 
                        else if (d.tagName === 'DIV') {
                            a[0].append(d);
                            f(".aw-widget-current-inner a").first().attr("href", "https://www.google.com/search?q=portland+weather&oq=portland+weather");
                            f('#link_get_widget').remove();
                            f('.aw-get-widget-footer').remove();
                        }
                    });
                });
            }
        })
    }(window.jQuery));
})();
