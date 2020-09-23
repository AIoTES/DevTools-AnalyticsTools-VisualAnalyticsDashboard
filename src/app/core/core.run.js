(function () {
    'use strict';

    angular
        .module('app.core')
        .run(runBlock);

    runBlock.$inject = ['utils', 'appConfig'];
    function runBlock(utils, appConfig) {
        /**
         * Disable md-ink-ripple effects on mobile
         * if 'disableMdInkRippleOnMobile' config enabled
         */
        if (appConfig.getConfig('disableMdInkRippleOnMobile') && utils.isMobile()) {
            var bodyEl = angular.element('body');
            bodyEl.attr('md-no-ink', true);
        }

        /**
         * Put isMobile() to the html as a class
         */
        if (utils.isMobile()) {
            angular.element(document.getElementsByTagName('html')[0]).addClass('is-mobile');
        }

        /**
         * Put browser information to the html as a class
         */
        var browserInfo = utils.detectBrowser();
        if (browserInfo) {
            var htmlClass = browserInfo.browser + ' ' + browserInfo.version + ' ' + browserInfo.os;
            angular.element(document.getElementsByTagName('html')[0]).addClass(htmlClass);
        }
    }
})();