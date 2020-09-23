(function() {
    'use strict';

    angular.module('app.core')

    .directive('siteToolbar', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                toolbarTitle: '=toolbarTitle',
                toolbarSearch: '=toolbarSearch'
            },
            templateUrl: 'app/core/directives/site-toolbar/site-toolbar.html',
            controller: ['$scope', '$mdSidenav', SiteToolbarController],
            controllerAs: 'vm',
            link: function(scope, elem, attrs) {

            }
        };

        function SiteToolbarController($scope, $mdSidenav) {
            var vm = this;
            
            vm.toggleSidenav = function(name) {
                $mdSidenav(name).toggle();
            };
            
            vm.showSearch = false;
            vm.toggleSearch = function() {
                vm.showSearch = !vm.showSearch;
                if(vm.showSearch===false) {
                    $scope.toolbarSearch = '';
                }
            };
        }
    }]);
})();