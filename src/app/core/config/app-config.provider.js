(function () {
    'use strict';

    angular
        .module('app.core')
        .provider('appConfig', appConfigProvider);

    function appConfigProvider() {
        // Default configuration
        var appConfiguration = {
            'disableCustomScrollbars': false,
            'disableMdInkRippleOnMobile': true,
            'disableCustomScrollbarsOnMobile': true
        };

        // Methods
        this.config = config;

        //////////

        /**
         * Extend default configuration with the given one
         *
         * @param configuration
         */
        function config(configuration) {
            appConfiguration = angular.extend({}, appConfiguration, configuration);
        }

        /**
         * Service
         */
        this.$get = function () {
            var service = {
                getConfig: getConfig,
                setConfig: setConfig
            };

            return service;

            //////////

            /**
             * Returns a config value
             */
            function getConfig(configName) {
                if (angular.isUndefined(appConfiguration[configName])) {
                    return false;
                }

                return appConfiguration[configName];
            }

            /**
             * Creates or updates config object
             *
             * @param configName
             * @param configValue
             */
            function setConfig(configName, configValue) {
                appConfiguration[configName] = configValue;
            }
        };
    }

})();