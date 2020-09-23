(function () {
    'use strict';

    angular
        .module('app.views.login')
        .config(config)
        .controller('LoginController', LoginController);
config.$inject = ['$routeProvider'];
    function config($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'app/views/login/login.html',
            controller: "LoginController"
        });
    }
    LoginController.$inject = ['$rootScope', '$scope', '$http', '$route','$location','appConfig'];

    function LoginController($rootScope, $scope, $http, $route, $location,appConfig) {
        var vm = this;

        $scope.credentials = {
            username: "",
            password: ""
        };
        $scope.authenticateUser = authenticateUser;

        function authenticateUser(credentials, form) {
            return $location.path('/dashboard');
            $http.post(appConfig.getConfig('loginUrl'), {username: $scope.credentials.username, password: $scope.credentials.password})
                .then(function (res) {
                    if(res && res.data) {
                        localStorage.setItem("access_token", res.data.access_token);
                        return $location.path('/dashboard');
                    }

                })
                .catch(function (ex) {
                    $rootScope.$broadcast("server-error");
                });
        }
    }
})();
