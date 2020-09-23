(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('menuLink', ['menu', function (menu) {
            return {
                scope: {
                    section: '='
                },
                restrict: 'E',
                templateUrl: 'app/core/directives/site-sidemenu/menu-link.html',
                link: link
            };

            function link(scope) {
                scope.isSelected = function () {
                    return menu.isPageSelected(scope.section);
                };
                scope.select = function () {
                    menu.selectPage(scope.section);
                };
            }
        }]);
          
})();