(function () {
    'use strict';

    angular
        .module('app.core')
        .config(config);

    config.$inject = ['$ariaProvider', '$logProvider', 'appConfigProvider'];
    function config($ariaProvider, $logProvider, appConfigProvider) {
         // Enable debug logging
         $logProvider.debugEnabled(true);

         /*eslint-disable */
 
         // ng-aria configuration
         $ariaProvider.config({
             tabindex: false
         });
 
         // Fuse theme configurations
         appConfigProvider.config({
             'disableCustomScrollbars': false,
             'disableCustomScrollbarsOnMobile': true,
             'disableMdInkRippleOnMobile': true
         });
    }
})();