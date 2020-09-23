
(function () {
    'use strict';
    
    angular
        .module('app.core')

        .directive('menuToggle', ['menu', function (menu) {
            return {
                scope: {
                    section: '='
                },
                restrict: 'E',
                templateUrl: 'app/core/directives/site-sidemenu/menu-toggle.html',
                link: link
            };

            function link(scope) {
                scope.isOpen = function () {
                    return menu.isSectionSelected(scope.section);
                };
                scope.toggle = function () {
                    menu.toggleSelectSection(scope.section);
                };
            }
        }]);
})();