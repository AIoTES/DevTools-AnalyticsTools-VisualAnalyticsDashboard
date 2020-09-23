(function() {
    'use strict';

    angular.module('app.core')

    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('en', {
            "kmeans": "K-means clustering",
            "dbscan": "DBSCAN clustering",
            "lof": "Local Outlier Factor (LOF) anomaly detection",
            "histogram": "Histogram feature extraction",
            "count": "Aggregation feature extraction"
        });

        $translateProvider.registerAvailableLanguageKeys(['en']);

		$translateProvider.preferredLanguage('en');
		$translateProvider.useSanitizeValueStrategy('escapeParameters');
    }]);
})();