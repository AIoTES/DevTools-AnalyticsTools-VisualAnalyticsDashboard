(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('errorSrc', [function () {
            return {
                restrict: 'A',
                link: link
            };

            function link(scope, element, attrs) {
                var defaultSrc = attrs.src;
                element.bind('error', function () {
                    if (attrs.errorSrc) {
                        element.attr('src', attrs.errorSrc);
                    }
                    else if (attrs.src) {
                        element.attr('src', defaultSrc);
                    }
                });
            }
        }]);
})();