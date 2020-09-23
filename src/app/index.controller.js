(function () {
    'use strict';

    angular
        .module('app')
        .controller('IndexController', IndexController);

    IndexController.$inject = ['$scope' , '$rootScope', '$location' ];
    function IndexController($scope, $rootScope, $location) {
        // $rootScope.$on('$routeChangeStart', function (event, next, nextParams, previous, previousParams) {
        //     if(next.$$route.controller !== 'LoginController' && !localStorage.getItem('access_token')) {
        //         $location.path('/login');
        //     }
        // });
    }
})();
