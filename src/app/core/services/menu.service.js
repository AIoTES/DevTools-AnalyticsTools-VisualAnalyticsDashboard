(function () {

    'use strict';

    angular
        .module('app.core')
        .factory('menu', menuService)
    
    menuService.$inject = ['$location', '$log', '$mdSidenav', 'api'];
    function menuService($location, $log, $mdSidenav, api) {
        var self;
        var sections = [];

        return self = {
            setSections: function (tmpSections) {
                sections = tmpSections;
            },

            addSection: function (section) {
                sections.push(section);
            },

            getSections: function () {
                return sections;
            },

            toggleSelectSection: function (section) {
                self.openedSection = (self.openedSection === section ? null : section);
            },
            isSectionSelected: function (section) {
                return self.openedSection === section;
            },

            selectPage: function (page) {
                page && page.url && $location.path(page.url);
                self.currentPage = page;
                $mdSidenav('left').close().then(function () { });
            },
            isPageSelected: function (page) {
                return self.currentPage === page || $location.path().indexOf(page.url) === 0;
            }
        };
    }

})();