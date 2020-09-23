(function () {
    'use strict';

    angular
        .module('app.views.dashboard')
        .config(config);

    config.$inject = ['$routeProvider'];
    function config($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'app/views/dashboard/dashboard.html',
            controller: "DashboardController",
            controllerAs: "vm"
        });
    }
})();