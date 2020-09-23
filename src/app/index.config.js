(function () {
    'use strict';

    angular
        .module('app')
        .config(config);

    config.$inject = ['$routeProvider', '$httpProvider', '$provide', '$mdThemingProvider', '$mdDateLocaleProvider', 'appConfigProvider', 'ChartJsProvider'];
    function config($routeProvider, $httpProvider, $provide, $mdThemingProvider, $mdDateLocaleProvider, appConfigProvider, ChartJsProvider) {
        /**
         * App configurations
         */
        appConfigProvider.config({
            apiBaseUrl: "http://160.40.50.78:1080/api/",
            tenantAuthToken: "a7e46008-b5ab-449c-8777-e39c4b30ed49",
            basicAuthToken: "YWRtaW46UEBzc3cwcmQ=",
            apiAnalyticsUrl: "http://160.40.50.208:8081/",
            dateFormat: "D MMM YYYY",
            // loginUrl: "{{TRANSFER_FILES_URL}}",
            // data_analytics_api_url: "{{DATA_ANALYTICS_API_URL}}",
            // semantic_translation_api_url: "{{SEMANTIC_TRANSLATION_API_URL}}",
            // data_lake_api_url: "{{DATA_LAKE_API_URL}}",
            // transfer_files_url: "{{TRANSFER_FILES_URL}}",

            loginUrl: "{{TRANSFER_FILES_URL}}",
            data_analytics_api_url: "http://160.40.50.208:8081",
            semantic_translation_api_url: "{{SEMANTIC_TRANSLATION_API_URL}}",
            data_lake_api_url: "{{DATA_LAKE_API_URL}}",
            transfer_files_url: "{{TRANSFER_FILES_URL}}",
        });

        /**
         * Setup the default route
         */
        $routeProvider.otherwise({
            redirectTo: '/dashboard'
        });

        /**
         * Register the interceptor for basic auth
         */
        $provide.factory('authInterceptor', function () {
            return {
                'request': function (config) {
                    if(config.url && config.url.indexOf(appConfigProvider.$get().getConfig('apiBaseUrl'))>-1 && config.method) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = 'Basic ' + appConfigProvider.$get().getConfig('basicAuthToken');
                    }
                    return config;
                }
            };
        });
        $httpProvider.interceptors.push('authInterceptor');

        $provide.factory('basicInterceptor', function () {
            // var baseUrl = location.href.indexOf("demo.activageproject.eu") > -1 ? "/analytics" : "";
            var baseUrl = "";
            return {
                'request': function (config) {
                    console.log(config);
                    if(config.url && config.url.startsWith("/assets") && config.method) {
                        config.url = baseUrl + config.url;
                    }
                    return config;
                }
            };
        });
        $httpProvider.interceptors.push('basicInterceptor');

        /**
         * Setup the theme
         */
        // $mdThemingProvider.definePalette('analytics-blue', $mdThemingProvider.extendPalette('blue', {
        //     '50': '#DCEFFF',
        //     '100': '#AAD1F9',
        //     '200': '#7BB8F5',
        //     '300': '#4C9EF1',
        //     '400': '#1C85ED',
        //     '500': '#106CC8',
        //     '600': '#0159A2',
        //     '700': '#025EE9',
        //     '800': '#014AB6',
        //     '900': '#013583',
        //     'contrastDefaultColor': 'light',
        //     'contrastDarkColors': '50 100 200 A100',
        //     'contrastStrongLightColors': '300 400 A200 A400'
        // }));
        $mdThemingProvider.definePalette('activage-blue', {
            '50': 'e1f5fb',
            '100': 'b3e5f6',
            '200': '81d4f0',
            '300': '4ec2e9',
            '400': '28b5e5',
            '500': '02a8e0',
            '600': '02a0dc',
            '700': '0197d8',
            '800': '018dd3',
            '900': '017dcb',
            'A100': 'f3faff',
            'A200': 'c0e3ff',
            'A400': '8dcdff',
            'A700': '74c2ff',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': [
                '50',
                '100',
                '200',
                '300',
                '400',
                'A100',
                'A200',
                'A400',
                'A700'
            ],
            'contrastLightColors': [
                '500',
                '600',
                '700',
                '800',
                '900'
            ]
        });
        $mdThemingProvider.definePalette('activage-red', $mdThemingProvider.extendPalette('red', {
            'A100': '#DE3641'
        }));

        $mdThemingProvider
            .theme('default')
            .primaryPalette('activage-blue')
            .accentPalette('activage-red');

        /**
         * @param date {Date}
         * @returns {string} string representation of the provided date
         */
        $mdDateLocaleProvider.formatDate = function (date) {
            return date ? moment(date).format(appConfigProvider.$get().getConfig('dateFormat')) : '';
        };

        /**
         * @param dateString {string} string that can be converted to a Date
         * @returns {Date} JavaScript Date object created from the provided dateString
         */
        $mdDateLocaleProvider.parseDate = function (dateString) {
            var m = moment(dateString, appConfigProvider.$get().getConfig('dateFormat'), true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };
  
        /**
         * Check if the date string is complete enough to parse. This avoids calls to parseDate
         * when the user has only typed in the first digit or two of the date.
         * Allow only a day and month to be specified.
         * @param dateString {string} date string to evaluate for parsing
         * @returns {boolean} true if the date string is complete enough to be parsed
         */
        $mdDateLocaleProvider.isDateComplete = function (dateString) {
            dateString = dateString.trim();
            // Look for two chunks of content (either numbers or text) separated by delimiters.
            var re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ .,]+|[/-]))([a-zA-Z]{3,}|[0-9]{1,4})/;
            return re.test(dateString);
        };

        // Configure all charts
        ChartJsProvider.setOptions({
            global:{
                colors: ['#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb', '#9966ff', '#c9cbcf'],
                defaultFontFamily: 'Roboto',
                defaultFontSize: 10
            }
        });
        // Configure all doughnut charts
        // ChartJsProvider.setOptions('doughnut', {
        //     cutoutPercentage: 60
        // });
        ChartJsProvider.setOptions('bubble', {
            tooltips: { enabled: false }
        });
    }
})();
