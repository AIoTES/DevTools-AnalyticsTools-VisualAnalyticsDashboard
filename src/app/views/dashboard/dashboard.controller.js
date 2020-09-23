(function () {

    angular
        .module('app.views.dashboard')
        .controller('DashboardController', DashboardController)
        .controller('ChartController', ChartController)
        .controller('GraphController', GraphController)
        .controller('Nvd3Controller', Nvd3Controller)
        .controller('AnalyticsChartController', AnalyticsChartController)
        .controller('ActivityController', ActivityController);

    /**
     * Dashboard Controller for the App
     * @param $window
     * @param $log
     * @param $mdSidenav
     * @param $localStorage
     * @constructor
     */
    DashboardController.$inject = ['$scope', '$window', '$log', '$mdSidenav', '$localStorage', 'api', '$mdSelect', '$http', 'appConfig', '$timeout', '$location'];
    function DashboardController($scope, $window, $log, $mdSidenav, $localStorage, api, $mdSelect, $http, appConfig, $timeout , $location) {
        var vm = this;

        vm.spinnerHidden = true;
        var fileTypes = [
            0, // => csv
            1 // => json
        ];
        var activeFile = {
            fileType: undefined,
            fileName: ""
        };


        $scope.logout  = function() {
            localStorage.removeItem('access_token');
            return $location.path('/login');
        }

        $scope.loadDataFromClipboard = function () {

            var req = {
                method: 'GET',
                url: $scope.transfer_files_url + '/cache.json',
            }

            $http(req).then(res => {
                activeFile.fileType = fileTypes[1];

                setFileData(JSON.parse(angular.toJson(res.data)));
                console.log(res.data);
                console.log( vm.fileData);
                console.log( vm.fileData.columns);
            });
        }

        $scope.data_analytics_api_url = appConfig.getConfig('data_analytics_api_url');
        $scope.semantic_translation_api_url = appConfig.getConfig('semantic_translation_api_url');
        $scope.data_lake_api_url = appConfig.getConfig('data_lake_api_url');
        $scope.transfer_files_url = appConfig.getConfig('transfer_files_url');

        //
        // $scope.saveSettings = function() {
        //     localStorage.setItem('data_analytics_api_url',$scope.data_analytics_api_url);
        //     localStorage.setItem('semantic_translation_api_url',$scope.semantic_translation_api_url);
        //     localStorage.setItem('data_lake_api_url',$scope.data_lake_api_url);
        //     localStorage.setItem('transfer_files_url',$scope.transfer_files_url);
        // };


        //Parse the file uploaded by the user
        var papaParse = {
            fileUploaded: function (file, e) {
                vm.visualAnalytics.showAnalyticsColumnsSelection = true;

                //Get the extension and filename
                var parts = file.name.split(".");
                var ext = parts[parts.length - 1];
                var fileName = "";
                parts.forEach(function (item) {
                    fileName += item + ".";
                });
                activeFile.fileName = fileName.substring(0, fileName.length - 1);

                //Parse
                if (ext == "csv") {
                    activeFile.fileType = fileTypes[0];

                    Papa.parse(file, {
                        complete: function (results, file) {
                            setFileData(results.data);
                        }
                    });
                } else if (ext == "json") {
                    activeFile.fileType = fileTypes[1];

                    var reader = new FileReader();
                    reader.onload = papaParse.onReaderLoad;
                    reader.readAsText(event.target.files[0]);
                }

            },
            onReaderLoad: function (event) {
                var obj = JSON.parse(event.target.result);
                setFileData(obj);
            }
        };

        vm.toolbarTitle = "Visual Analytics Web Portal";
        vm.selected = null;
        vm.datePicker = $localStorage.$default({
            startDate: $window.moment().startOf('isoWeek').toDate(),
            endDate: $window.moment().toDate()
        });
        vm.fileData = null;
        vm.charts = [];
        vm.availableCharts = [];
        vm.selectedChartColumns = [];
        vm.activeChart = undefined;
        vm.visualAnalytics = {
            activeMethod: undefined,
            activeChart: undefined,
            result: undefined
        };

        vm.analytics = [];
        $scope.analyzedData = {};
        $scope.jsoneditorOptions = { mode: 'tree' };
        vm.selectedAnalysisChartColumns = [];
        vm.visualAnalytics.showAnalyticsColumnsSelection = false;


        $http.get("assets/data/analytics/analyticsMethods.json").then(x => {
            vm.analytics = x.data.analysisAlgorithms;
        });

        $scope.selectedAnalysisChartColumnsChanged = function () {
            if (vm.selectedAnalysisChartColumns && vm.selectedAnalysisChartColumns.length > 2) {
                vm.selectedAnalysisChartColumns.splice(0, 1);
            }

            if (vm.selectedAnalysisChartColumns && vm.selectedAnalysisChartColumns.length == 2) {
                $mdSelect.hide();
            }

            vm.visualAnalytics.showAnalyticsChart = true;
        }


        // Query Builder
        $scope.deviceID = '';
        $scope.selectedDeviceTypes = [];
        $scope.selectedPlatforms= [];
        $scope.selectedDeploymentSites= [];
        $scope.SidebarFromDate = new Date(2018,6,1);
        $scope.SidebarToDate = new Date(2018,6,2);


        //Load Sidebar Select Options from JSON
        $scope.loadSidebarInputOptions = function(){
            $http.get("assets/data/selectOptionsData.json").then(x => {
                $scope.selectedDeviceTypesOptions = x.data.deviceTypes;
                $scope.selectedPlatformOptions= x.data.platforms;
                $scope.selectedDeploymentSiteOptions = x.data.ds;

            });
        }

        $scope.validateSearchQuerySubmit = function(){

            let validated = true;

            if($scope.deviceID === '' && $scope.selectedDeviceTypes.length < 1){
                validated =  false;
            }

            if($scope.selectedPlatforms.length < 1 && $scope.selectedDeploymentSites.length < 1){
                validated =  false;
            }

            if($scope.SidebarFromDate === '' || $scope.SidebarToDate === ''){
                validated =  false;
            }

            return validated;
        }

        $scope.searchQuerySubmit = function(){

            let object = {};

            //In case we select deviceID Method
            if($scope.deviceID !== ''){
                //In case we select Platforms
                if($scope.selectedPlatforms.length >= 1 ){
                    object = {
                        "deviceID": $scope.deviceID.split(","),
                        "platform": $scope.selectedPlatforms,
                        "startDate": $scope.SidebarFromDate,
                        "endDate": $scope.SidebarToDate
                    }
                }
                //In case we select Deployment Sites
                else{
                    object = {
                        "deviceID": $scope.deviceID.split(","),
                        "ds": $scope.selectedDeploymentSites,
                        "startDate": $scope.SidebarFromDate,
                        "endDate": $scope.SidebarToDate
                    }
                }
            }
            //In case we select Device Types method
            else{
                //In case we select Platforms
                if($scope.selectedPlatforms.length >= 1 ){
                    object = {
                        "deviceType": $scope.selectedDeviceTypes,
                        "platform": $scope.selectedPlatforms,
                        "startDate": $scope.SidebarFromDate,
                        "endDate": $scope.SidebarToDate
                    }
                }
                //In case we select Deployment Sites
                else{
                    object = {
                        "deviceType": $scope.selectedDeviceTypes,
                        "ds": $scope.selectedDeploymentSites,
                        "startDate": $scope.SidebarFromDate,
                        "endDate": $scope.SidebarToDate
                    }
                }
            }


            var req = {
                method: 'POST',
                url: $scope.data_lake_api_url+'/query',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: object
            }

            // var req = {
            //     method: 'GET',
            //     url: 'assets/data/testResponse.json',
            // }



            $http(req).then(x => {

                let data = x.data;

                console.log("Data Before Call " , data);

                let req = {
                    method: 'POST',
                    url: $scope.semantic_translation_api_url+'/ActivageTranslator/JsonTranslator',
                    headers: {'Content-Type': 'application/json'},
                    data:data
                }

                $http(req).then(res => {
                    console.log("Response of Final Request", res);

                    activeFile.fileType = fileTypes[1];

                    setFileData(JSON.parse(angular.toJson(res.data)));

                    console.log( vm.fileData);
                    console.log( vm.fileData.columns);

                });


            });


        }

        $scope.loadSidebarInputOptions();

        $scope.addFeature = function (item) {
            if (!item.items)
                item.items = [];

            item.items.push(JSON.parse(JSON.stringify(item.options)));
        }

        $scope.analyseData = function () {
            const url = vm.visualAnalytics.activeMethod.serviceUrl;
            vm.visualAnalytics.showAnalyticsMethodSelection = null;

            const payload = {
                data: vm.fileData.tableData,
                options: { }
            };


            if(vm.visualAnalytics.activeMethod.id === 'clustering_hierarchical') {

                let transformedData = [];

                payload.data = JSON.parse(angular.toJson(payload.data))

                payload.data.forEach( item =>{
                    transformedData.push({"coords" : Object.values(item)})
                })

                payload.data = transformedData;

                // console.log(payload.data);
            }



            vm.visualAnalytics.activeMethod.options.attributes.forEach(x => {
                if (x.type == 'selectSingle' || x.type == 'inputNumber' || x.type == 'selectMultiple') {
                    payload.options[x.propertyName] = x.selectedAttributeValue;
                }

                if (x.type == 'minMax') {
                    payload.options[x.propertyName] = [x.selectedAttributeValueMin, x.selectedAttributeValueMax];
                }

                if(x.type == 'integerArray') {
                    let tmpStrings = x.selectedAttributeValue.split(',');
                    let tmpIntegers = [];

                    tmpStrings.forEach(item => {tmpIntegers.push(parseInt(item));})

                    payload.options[x.propertyName] = tmpIntegers;
                }


                if(x.type == 'inputTextArea') {

                    payload.options[x.propertyName] = JSON.parse(x.selectedAttributeValue);
                    console.log(  payload.options[x.propertyName]);

                }

                if (x.type == 'objectArray') {

                    payload.options[x.propertyName] = [];
                    x.items.forEach(y => {
                        const ob = {};
                        y.forEach(z => {
                            if (z.type == 'selectMultiple' || z.type == 'inputText') {
                                ob[z.propertyName] = z.selectedAttributeValue;
                            }
                        });
                        payload.options[x.propertyName].push(ob);
                    });
                }


            });

            var finalUrl = $scope.data_analytics_api_url +  '/' + url;
            finalUrl = finalUrl.replace("/data_analytics_api", "");

            // if(url.indexOf("http") == -1) {
            //     finalUrl = $scope.data_analytics_api_url + '/' + url;
            // }

            let finalPayload = payload;

            $http.post(finalUrl, finalPayload).then(x => {
                $scope.showAnalyzedDataJson = false;
                $scope.showAnalyzedDataTable = false;
                vm.visualAnalytics.showAnalyticsChart = false;
                vm.visualAnalytics.result = x;

                $scope.analyzedData.data = x.data;
                $scope.analyzedData.columns = getAnalyzedDataColumns();

                $scope.analyzedData.innerColumns = [];

                if (Array.isArray($scope.analyzedData.data)) {
                    $scope.showAnalyzedDataTable = true;
                } else {
                    if(vm.visualAnalytics.activeMethod.responseType === 'string'){

                        $scope.showAnalyzedDataJsonAsString = true;

                        if(vm.visualAnalytics.activeMethod.id === 'clustering_hierarchical') {

                            //Ads an extra key for clustered data.
                            let extraKey = {title: "Clustered", key: "cluster"};

                            //Copys the data from the file loaded
                            $scope.dataWithCluster =JSON.parse(angular.toJson(vm.fileData));

                            //Adds the extra key in the new dataset
                            $scope.dataWithCluster.columns.push(extraKey);


                            let i= 0;

                            // item -> {a: 5.8, b: 4, c: 1.2, d: 0.2}
                            $scope.dataWithCluster.tableData.forEach( item => {
                                item.cluster = $scope.analyzedData.data.clusters[i];
                                i+=1;
                            })

                            // console.log("$scope.analyzedData.data"  , $scope.analyzedData.data);
                            // console.log("vm.fileData", $scope.dataWithCluster);
                            // console.log("$scope.analyzedData", $scope.analyzedData);

                            $scope.responseOfAlogrithm = $scope.analyzedData.data;

                            $scope.analyzedData.columns = $scope.dataWithCluster.columns;
                            $scope.analyzedData.data = $scope.dataWithCluster.tableData;
                            $scope.showAnalyzedDataTable = true;


                        }


                    }else{
                        $scope.showAnalyzedDataJson = true;

                        for (p in $scope.analyzedData.data) {

                            var col = { key: p, title: p, innerColumns: [] };
                            $scope.analyzedData.innerColumns.push(col);
                            if ($scope.analyzedData.data[p] && $scope.analyzedData.data[p].length > 0) {
                                for (pp in $scope.analyzedData.data[p][0]) {
                                    col.innerColumns.push({
                                        key: pp,
                                        title: pp
                                    });
                                }
                            }
                        }
                    }
                }

                vm.visualAnalytics.showAnalyticsMethodSelection = true;

                initiateAnalyzedDataContainer();
            });
        }

        $scope.showAnalysisChart = function () {
            vm.visualAnalytics.activeChart = undefined;
            vm.selectedChartColumns = [];

            $timeout(function () {
                vm.visualAnalytics.activeChart = vm.visualAnalytics.rawDataChart;
                vm.visualAnalytics.activeChart.properties.forEach(x => {
                    if (x[x.modelVariable]) {
                        if (x.type == "singleSelect") {
                            vm.selectedChartColumns.push({ title: x[x.modelVariable].title, key: x[x.modelVariable].key });
                        } else if (x.type == "multipleSelect") {
                            x[x.modelVariable].forEach(z => {
                                vm.selectedChartColumns.push({ title: z.title, key: z.key });
                            });
                        }
                    }
                });
            }, 10);
        }

        function initiateAnalyzedDataContainer() {
            vm.tableOptionsAnalyzed = {
                query: {
                    limit: 5,
                    page: 1,
                    order: '',
                    total: $scope.analyzedData.data.length
                },
                limitOptions: [5, 10, 15, 20, 50, {
                    label: 'All',
                    value: function () {
                        return $scope.analyzedData.data ? $scope.analyzedData.data.length : 0;
                    }
                }],
                filter: {
                    value: "",
                    options: {
                        debounce: 500
                    },
                    remove: function () {
                        vm.tableOptionsAnalyzed.filter.show = false;
                        vm.tableOptionsAnalyzed.filter.value = '';

                        if (vm.tableOptionsAnalyzed.filter.form && vm.tableOptionsAnalyzed.filter.form.$dirty) {
                            vm.tableOptionsAnalyzed.filter.form.$setPristine();
                        }
                    }
                }
            };


        }

        function getAnalyzedDataColumns() {
            var columns = [];
            if ($scope.analyzedData.data.length > 0) {
                Object.keys($scope.analyzedData.data[0]).forEach(x => {
                    columns.push({ title: x, key: x });
                });
            } else if (typeof $scope.analyzedData.data === 'object') {
                Object.keys($scope.analyzedData.data).forEach(x => {
                    columns.push({ title: x, key: x });
                });
            }

            return columns;
        }

        vm.toggleSidenav = toggleSidenav;
        vm.dateRangeApplied = dateRangeApplied;

        //On chart click change the active chart
        vm.changeChart = changeChart;
        vm.changeVisualMethod = changeVisualMethod;
        vm.changeVisualMethodActiveChart = changeVisualMethodActiveChart;
        vm.spinnerHidden = true;
        vm.visualAnalytics.showAnalyticsChart = false;

        vm.showAnalysisChartButton = function (chart) {
            if (chart.alias == 'graph' && !$scope.showAnalyzedDataJson) {
                return false;
            }

            if (chart.alias != 'graph' && $scope.showAnalyzedDataJson) {
                return false;
            }

            return true;
        }

        activate();

        // *********************************
        // Internal methods
        // *********************************

        function activate() {
            api.charts.types.get().$promise.then(function (res) {
                vm.charts = res.data;
            });

            $scope.$on('apsUploadFile.uploaded', function (event, data) {
                papaParse.fileUploaded(data);
            });
        }

        function toggleSidenav(name) {
            $mdSidenav(name).toggle();
        }

        function dateRangeApplied() {
            // TODO
        }

        function changeChart(chartIndex) {
            vm.rawDataChart = JSON.parse(JSON.stringify(vm.charts[chartIndex]));
        }

        $scope.runRawData = function () {
            vm.selectedChartColumns = [];
            vm.activeChart = undefined;

            $timeout(function () {

                console.log(vm.rawDataChart.properties);

                vm.rawDataChart.properties.forEach(x => {
                    if (x[x.modelVariable]) {
                        if (x.type == "singleSelect") {
                            vm.selectedChartColumns.push({ title: x[x.modelVariable].title, key: x[x.modelVariable].key });
                        } else if (x.type == "multipleSelect") {
                            x[x.modelVariable].forEach(z => {
                                vm.selectedChartColumns.push({ title: z.title, key: z.key });
                            });
                        }
                    }
                });
                vm.activeChart = JSON.parse(JSON.stringify(vm.rawDataChart));
            }, 10);

        }

        function changeVisualMethod() {
            vm.visualAnalytics.result = null;
            vm.spinnerHidden = true;
            vm.visualAnalytics.activeChart = null;
        }

        function changeVisualMethodActiveChart(selectedChart) {
            vm.visualAnalytics.showAnalyticsColumnsSelection = true;
            vm.visualAnalytics.rawDataChart = JSON.parse(JSON.stringify(selectedChart));
        }

        //Set the data in appropriate format to show on table
        function setFileData(loadedData) {
            vm.selectedChartColumns = [];
            vm.fileData = {};
            vm.fileData.tableData = JSON.parse(JSON.stringify(loadedData));

            vm.fileData.columns = [];

            if (vm.fileData.tableData && vm.fileData.tableData.length > 0) {
                if (activeFile.fileType == 1) {
                    Object.keys(vm.fileData.tableData[0]).forEach(x => {
                        vm.fileData.columns.push({ title: x, key: x });
                    });
                } else if (activeFile.fileType == 0) {
                    vm.fileData.tableData[0].forEach((x, index) => {
                        vm.fileData.columns.push({ title: x, key: index });
                    });
                    vm.fileData.tableData.splice(0, 1);
                }
            }

            vm.tableOptions = {
                query: {
                    limit: 5,
                    page: 1,
                    order: '',
                    total: vm.fileData.tableData.length
                },
                limitOptions: [5, 10, 15, 20, 50, {
                    label: 'All',
                    value: function () {
                        return vm.fileData.tableData ? vm.fileData.tableData.length : 0;
                    }
                }],
                filter: {
                    value: "",
                    options: {
                        debounce: 500
                    },
                    remove: function () {
                        vm.tableOptions.filter.show = false;
                        vm.tableOptions.filter.value = '';

                        if (vm.tableOptions.filter.form && vm.tableOptions.filter.form.$dirty) {
                            vm.tableOptions.filter.form.$setPristine();
                        }
                    }
                }
            };

            //Show only appropriate charts
            vm.availableCharts = [];
            vm.activeChart = null;
            vm.charts.forEach(function (chart) {
                vm.availableCharts.push(chart);
            });

            vm.visualAnalytics = {
                activeMethod: undefined,
                activeChart: undefined,
                result: undefined
            };

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    }

    Nvd3Controller.$inject = ['$scope', '$window', 'appConfig'];
    function Nvd3Controller($scope, $window, appConfig) {
        var vm = this;
        var parentVm = $scope.$parent.$parent.vm;

        vm.data = [];
        vm.options = {};

        var drawChart = function () {
            if (parentVm && parentVm.activeChart && parentVm.activeChart.alias && parentVm.fileData && parentVm.fileData.data) {
                var data = parentVm.fileData.data;
                data.forEach((d, i) => d.clusterLabel = i > 100 ? "Cluster 0" : "Cluster 1");
                //var groups = d3.nest().key(d => d.clusterLabel).entries(data);
                //var colorScale = d3.scale.category10().domain(groups.map(d => d.key));
                //var keys = Object.keys(data[0]);

                var keys = [
                    "anxiety_perception",
                    "comorbidities_count",
                    "depression_total_score",
                    "life_quality",
                    "pain_perception"
                ];

                vm.options = {
                    chart: {
                        type: 'parallelCoordinates',
                        height: 370,
                        margin: {
                            top: 30,
                            right: 10,
                            bottom: 10,
                            left: 10
                        },
                        color: (d) => 'steelblue',
                        dimensionNames: keys
                    }
                };

                vm.data = data;
            }
        }

        activate();

        function activate() {
            drawChart();
        }
    }

    ChartController.$inject = ['$scope', '$window', 'appConfig'];
    function ChartController($scope, $window, appConfig) {
        var vm = this;
        var parentVm = $scope.$parent.$parent.vm;

        vm.data = [];
        vm.labels = [];
        vm.series = ['Data'];
        vm.colors = ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];

        vm.options = {
            // responsive: true,
            // maintainAspectRatio: false,
            // showLines: false,
            legend: {
                position: "top",
                display: true
            },
            // elements: {
            //     point: {
            //         radius: 4
            //     }
            // },
            scales: {
                xAxes: [{
                    // type: 'time',
                    // // distribution: 'series',
                    // // bounds: 'ticks',
                    // time: {
                    //     tooltipFormat: 'll HH:mm',
                    //     displayFormats: {
                    //         'hour': 'MMM D, HH:mm'
                    //     }//,
                    //     // unit: 'hour',
                    //     // unitStepSize: 8
                    // },
                    ticks: {
                        // fontSize: 10,
                        // maxRotation: 0,
                        autoSkipPadding: 10
                    }
                }],
                yAxes: [{
                    ticks: {
                        // beginAtZero: true,
                        // fontSize: 10,
                        // maxRotation: 0,
                        // autoSkipPadding: 10
                    },
                    scaleLabel: {
                        display: false,
                        // labelString: '',
                        // fontSize: 11
                    }
                }]
            }
        };

        activate();

        function activate() {
            if (parentVm && parentVm.activeChart && parentVm.activeChart.alias && parentVm.fileData && parentVm.fileData.tableData) {
                var data = parentVm.fileData.tableData;
                var axes = {};
                if (parentVm.activeChart && parentVm.activeChart.properties && parentVm.activeChart.properties.length) {
                    parentVm.activeChart.properties.forEach(x => {
                        if (x.type == "singleSelect") {
                            if (x[x.modelVariable]) {
                                axes[x.modelVariable] = x[x.modelVariable].key;
                            }
                        } else if (x.type == "multipleSelect") {
                            x[x.modelVariable].forEach(z => {
                                axes[z.key] = z.key;
                            });
                        }

                    });
                }

                var chartType = parentVm.activeChart.alias;
                configureCharts(data, axes, chartType)
            }
        }

        function configureCharts(data, axes, chartType) {
            var i = 0, l = data.length;
            if (chartType === 'scatter') {
                if (axes) {


                    var seriesData = [];
                    var series = [];
                    for (i; i < l; i++) {
                        var item = data[i];
                        var ob = {
                            x: item[axes.xAxis],
                            y: item[axes.yAxis],
                            series: 1
                        };

                        if (Object.keys(axes).length > 2) {
                            if (!series.find(x => x == item[axes.color])) {
                                series.push(item[axes.color]);
                            }
                            ob.series = item[axes.color];
                        } else {
                            if (series.length == 0) series.push(1);
                        }

                        seriesData.push(ob);
                    }

                    for (i = 0; i < series.length; i++) {
                        vm.data[i] = seriesData.filter(x => x.series == series[i]);
                    }

                }


                vm.options.legend.display = false;
            }
            else if (chartType === 'radar') {
                if (axes) {
                    for (axe in axes) {
                        vm.labels.push(axe);
                    }
                }

                for (i; i < l; i++) {
                    var arr = [];
                    for (property in data[i]) {
                        arr.push(data[i][property]);
                    }
                    vm.data.push(arr);
                }

                vm.options.legend.display = false;
                vm.options.scales.xAxes[0].display = false;
                vm.options.scales.yAxes[0].display = false;
            }
            else {
                var seriesData = [];

                if (axes) {
                    for (i; i < l; i++) {
                        var item = data[i];
                        seriesData.push(parseFloat(item[axes.yAxis]));
                        var label = item[axes.xAxis];
                        if (axes.xAxis.toLowerCase().indexOf('date') > -1) {
                            label = $window.moment.utc(label).local().format(appConfig.getConfig('dateFormat'));
                        }
                        vm.labels.push(label);
                    }
                    console.log(" ON Line Labels: " , vm.labels);
                }

                if (chartType === "bar") {

                    vm.data[0] = seriesData;



                }
                if (chartType === "line") {

                    console.log("DATA: " , data) ;
                    seriesData = [];
                    let seriesDataNew = [];
                    seriesDataNew[0] = [];
                    seriesDataNew[1] = [];
                    vm.labels = [];

                    console.log( data.length);
                    for (i=0; i < data.length; i++) {
                        var item = data[i];
                        seriesDataNew[0].push(parseFloat(item[axes.yAxis1]));
                        seriesDataNew[1].push(parseFloat(item[axes.yAxis2]));

                        var label = item[axes.xAxis];

                        // if (axes.xAxis.toLowerCase().indexOf('d') > -1) {
                        //
                        //  label = $window.moment.utc(label).local().format(appConfig.getConfig('dateFormat'));
                        // }
                         vm.labels.push(label);
                    }
                    vm.series[1] = axes.yAxis2;
                    vm.series[0] = axes.yAxis1;

                    vm.data[0] = seriesDataNew[0];
                    vm.data[1] = seriesDataNew[1];


                    console.log("Final Labels = " , vm.labels)
                    console.log("Final Data = " , vm.data );
                }

                else if (chartType === "pie" || chartType === "doughnut") {
                    vm.data = seriesData;
                    vm.options.legend.display = false;
                    vm.options.scales.xAxes[0].display = false;
                    vm.options.scales.yAxes[0].display = false;
                }
            }
        }
    }

    GraphController.$inject = ['$scope', '$window'];
    function GraphController($scope, $window) {
        var vm = this;
        var parentVm = $scope.$parent.$parent.vm;
        var graphAttrDescs = [
            {
                name: "social_visits",
                domain: [0, 20],
                thresholds: 10
            },
            {
                name: "social_text",
                domain: [0, 5],
                thresholds: 10
            },
            {
                name: "social_skype",
                domain: [0, 5],
                thresholds: 10
            },
            {
                name: "avg_systolic",
                domain: [80, 160],
                thresholds: 10
            },
            {
                name: "avg_diastolic",
                domain: [80, 160],
                thresholds: 10
            },
            {
                name: "cognitive_total_score",
                domain: [0, 40],
                thresholds: 10
            },
            {
                name: "mmse_total_score",
                domain: [0, 40],
                thresholds: 10
            },
            {
                name: "anxiety_perception",
                domain: [0, 10],
                thresholds: 10
            },
            {
                name: "depression_total_score",
                domain: [0, 15],
                thresholds: 10
            },
            {
                name: "gait_get_up",
                domain: [0, 100],
                thresholds: 10
            },
            {
                name: "gait_speed_4m",
                domain: [0, 30],
                thresholds: 10
            },
            {
                name: "raise_chair_time",
                domain: [0, 50],
                thresholds: 10
            }
        ];

        var graphColorAttrs = [
            "fried_status",
            "birth_year"
        ];

        // var coloringFunctions = {
        //     "fried_status": friedToColor,
        //     "birth_year": birthYearToColor
        // };

        function friedToColor(fried_status) {
            if (fried_status == "Non frail")
                return "green";
            if (fried_status == "Pre-frail")
                return "orange";
            if (fried_status == "Frail")
                return "red";
        }

        function birthYearToColor(year) {
            var yearScale = d3.scale.linear().domain([1920, 1960]).range(["red", "blue"])
            return yearScale(year);
        }

        function normalize(arr) {
            var sum = d3.sum(arr);
            return sum <= 0 ? arr.map(d => 0) : arr.map(d => d / sum);
        }


        // D3 v3x -------------------------------------------------------------------------

        function extractFeature(measurements, attrDesc) {
            var histGen = d3.layout.histogram().range(attrDesc.domain).bins(attrDesc.thresholds);
            var values = measurements
                .filter(d => d.parameter == attrDesc.name)
                .map(d => parseFloat(d.value));
            var hist = histGen(values).map(d => d.length);
            return normalize(hist);
        }

        // function extractFeature(measurements, attrDesc) {
        // var histGen = d3.histogram().domain(attrDesc.domain).thresholds(attrDesc.thresholds);
        // var values = measurements
        // .filter(d => d.parameter == attrDesc.name)
        // .map(d => parseFloat(d.value));
        // var hist = histGen(values).map(d => d.length);
        // return normalize(hist);
        // }

        function extractFeatures(measurements, attrDescs) {
            return attrDescs.map(desc => extractFeature(measurements, desc));
        }

        function allVectorsNonZero(vectors) {
            return vectors
                .map(v => d3.sum(v) > 0)
                .reduce((a, b) => a && b, true);
        }

        // Computes L1 distance
        function distL1(f1, f2) {
            var diff = f1.map((d, i) => d - f2[i]).map(Math.abs);
            return diff.reduce((a, b) => a + b, 0);
        }

        // Computes the Minimum Spanning Tree from a distance matrix.
        function getMst(ids, distMat) {
            var N = distMat.length;
            var edges = [];

            // define accessory arrays
            var traversed = new Array(N);
            var bucketVertex = new Array(N);
            var bucketWeight = new Array(N);
            for (var i = 0; i < N; i++) {
                traversed[i] = false;
                bucketVertex[i] = -1;
                bucketWeight[i] = 0;
            }

            // start with first vertex
            traversed[0] = true;
            var currentVertex = 0;

            var iter = 0;
            while (true) {
                for (var i = 0; i < N; i++) {
                    var w = distMat[currentVertex][i];

                    if (!traversed[i]) {
                        if (bucketVertex[i] == -1 || bucketWeight[i] > w) {
                            bucketVertex[i] = currentVertex;
                            bucketWeight[i] = w;
                        }
                    }
                }

                // sequential search for lightest bucket
                var minWeight = 10000000;
                var bestNextVertex = -1;
                for (var i = 0; i < N; i++) {
                    if (!traversed[i] && bucketWeight[i] < minWeight) {
                        minWeight = bucketWeight[i];
                        bestNextVertex = i;
                    }
                }

                if (bestNextVertex == -1) break;

                edges.push({
                    source: bestNextVertex,
                    target: bucketVertex[bestNextVertex],
                    // source: ids[bestNextVertex],
                    // target: ids[bucketVertex[bestNextVertex]],
                    // value: Math.exp(-minWeight)
                    value: 1
                });

                // add vertex to tree
                traversed[bestNextVertex] = true;
                currentVertex = bestNextVertex;

                iter++;
            }

            return edges;
        }

        function createGraph(ids, featureArray) {
            var distMat = featureArray.map(f1 => featureArray.map(f2 => distL1(f1, f2)));
            var mst = getMst(ids, distMat);
            return {
                nodes: ids.map(d => ({ id: d })),
                links: mst
            };
        }

        function combineGraphs(graphs) {
            return {
                nodes: graphs[0].nodes,
                links: mergeMsts(graphs.map(g => g.links))
            };
        }

        function mergeMsts(mstArr) {
            var result = [];
            for (var i = 0; i < mstArr.length; i++) {
                for (var j = 0; j < mstArr[i].length; j++) {
                    var edgeIdx = findEdge(result, mstArr[i][j]);
                    if (edgeIdx < 0) {
                        result.push(mstArr[i][j]);
                    }
                    else {
                        result[edgeIdx].value += mstArr[i][j].value;
                    }
                }
            }
            return result;
        }

        function findEdge(mst, edge) {
            for (var i = 0; i < mst.length; i++) {
                if ((mst[i].source == edge.source && mst[i].target == edge.target) ||
                    (mst[i].target == edge.source && mst[i].source == edge.target))
                    return i;
            }
            return -1;
        }

        function createMultimodalGraph(data, attrDescs, users, colorAttr, valueToColor) {
            // console.log("CREATE MULTIMODAL GRAPH");
            var dataPerUser = d3.nest().key(d => d.pid).entries(data);
            var userFeatures = dataPerUser.map(g => ({
                pid: g.key,
                features: extractFeatures(g.values, attrDescs)
            }));

            var filteredFeatures = userFeatures.filter(user => allVectorsNonZero(user.features));

            var userIDs = filteredFeatures.map(u => u.pid);
            var featureArrays = attrDescs.map((desc, i) => filteredFeatures.map(u => u.features[i]));
            var graphs = featureArrays.map(featureArray => createGraph(userIDs, featureArray));

            var graph = combineGraphs(graphs);

            // add colors
            graph.nodes.forEach(g => {
                g.color = "gray";
                var info = users.find(d => d.participant_id == g.id);
                if (info)
                    g.color = valueToColor(info[colorAttr]);
                g.info = info;
            });

            return graph;
        }

        /*
        D3 v3x -------------------------------------------------------------------------
        
        function createGraphChart(selection, width, height, graph) {
            var svg = selection.append("svg")
                .attr("width", width)
                .attr("height", height);
        
            var force = d3.layout.force()
                .nodes(graph.nodes)
                .links(graph.links)
                .size([width, height])
                .gravity(.2)
                .charge(-240)
                .linkDistance(50)
                .linkStrength(5)
                .on("tick", tick)
                .start();
        
            var link = svg.selectAll(".link")
                .data(graph.links)
                .enter().append("line")
                    .attr("stroke", "lightgray")
                    .attr("class", "link");
        
            var node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("circle")
                    .attr("class", "node")
                    .attr("r", 4.5)
                    .attr("fill", function (d) { return d.color; });
        
            function tick() {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });
        
                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
            }
        }
        */

        function genTooltipContents(info_raw) {
            if (info_raw) {
                var info = {};
                info["ID"] = info_raw.participant_id;
                info["Frailty status"] = info_raw.fried_status;
                info["Location"] = info_raw.location;
                info["Gender"] = info_raw.gender == "F" ? "Female" : "Male";
                info["Birth year"] = info_raw.birth_year;
                var html = "";
                html += "<table>";
                for (key in info) {
                    html += `<tr><td>${key}:</td><td>${info[key]}</td></tr>`;
                }
                html += "</table>";
                return html;
            }
            else {
                return "";
            }
        }

        // function createGraphChart(selection, width, height, graph) {
        //     var svg = selection.append("svg");
        //     svg.attr("width", width);
        //     svg.attr("height", height);

        //     var div = d3.select("body").append("div")
        //         .attr("class", "tooltip")
        //         .style("opacity", 0);

        //     var simulation = d3.forceSimulation()
        //         .force("link", d3.forceLink().id(function (d) { return d.id; }))
        //         .force("charge", d3.forceManyBody())
        //         .force("center", d3.forceCenter(width / 2, height / 2));

        //     var link = svg.append("g")
        //         .attr("class", "links")
        //         .selectAll("line")
        //         .data(graph.links)
        //         .enter().append("line")
        //         // .attr("stroke-width", function(d) { return Math.sqrt(d.value); });
        //         .attr("stroke", "lightgray");

        //     var node = svg.append("g")
        //         .attr("class", "nodes")
        //         .selectAll("circle")
        //         .data(graph.nodes)
        //         .enter().append("circle")
        //         .attr("r", 5)
        //         .attr("fill", function (d) { return d.color; })
        //         .call(d3.drag()
        //             .on("start", dragstarted)
        //             .on("drag", dragged)
        //             .on("end", dragended));

        //     node.on("mouseover", d => {
        //         div.transition()
        //             .duration(200)
        //             .style("opacity", .9);
        //         div.html(genTooltipContents(d.info))
        //             .style("left", (d3.event.pageX) + "px")
        //             .style("top", (d3.event.pageY - 100) + "px");
        //     });

        //     node.on("mouseout", function (d) {
        //         div.transition()
        //             .duration(500)
        //             .style("opacity", 0);
        //     });

        //     simulation
        //         .nodes(graph.nodes)
        //         .on("tick", ticked);

        //     simulation.force("link")
        //         .links(graph.links);

        //     function ticked() {
        //         link
        //             .attr("x1", function (d) { return d.source.x; })
        //             .attr("y1", function (d) { return d.source.y; })
        //             .attr("x2", function (d) { return d.target.x; })
        //             .attr("y2", function (d) { return d.target.y; });

        //         node
        //             .attr("cx", function (d) { return d.x; })
        //             .attr("cy", function (d) { return d.y; });
        //     }

        //     function dragstarted(d) {
        //         if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        //         d.fx = d.x;
        //         d.fy = d.y;
        //     }

        //     function dragged(d) {
        //         d.fx = d3.event.x;
        //         d.fy = d3.event.y;
        //     }

        //     function dragended(d) {
        //         if (!d3.event.active) simulation.alphaTarget(0);
        //         d.fx = null;
        //         d.fy = null;
        //     }

        //     function friedToNum(fried_status) {
        //         if (fried_status == "Non frail")
        //             return 0;
        //         if (fried_status == "Pre-frail")
        //             return 1;
        //         if (fried_status == "Frail")
        //             return 2;
        //     }
        // }


        activate();

        function activate() {
            if (parentVm && parentVm.fileData && parentVm.fileData.data) {
                var data = parentVm.fileData.data;

                var measurements = data.measurements;
                var demographics = data.users;

                var graph_feature_variables = [
                    "cognitive_total_score",
                    "mmse_total_score"
                ];
                var attr = graphAttrDescs.filter(d => graph_feature_variables.includes(d.name));

                var colorVariable = "fried_status";
                var coloringFunction = friedToColor;
                var graph = createMultimodalGraph(measurements, attr, demographics, colorVariable, coloringFunction);

                var color = d3.scale.category20()

                vm.options = {
                    chart: {
                        type: 'forceDirectedGraph',
                        height: 450,
                        width: document.getElementById('graph-container').offsetWidth,
                        margin: { top: 20, right: 20, bottom: 20, left: 20 },
                        color: function (d) {
                            return d.color;
                        },
                        charge: -100,
                        linkStrength: 1,
                        linkDist: 50,
                        tooltip: {
                            contentGenerator: d => genTooltipContents(d.info)
                        },
                        nodeExtras: function (node) {
                            node && node
                                .append("text")
                                .attr("dx", 8)
                                .attr("dy", ".35em")
                                // .text(function(d) { return d.id })
                                .style('font-size', '10px');
                        }
                    }
                };

                vm.data = {
                    "nodes": graph.nodes,
                    "links": graph.links
                }

            }
        }
    }

    AnalyticsChartController.$inject = ['$scope', '$window', 'appConfig'];
    function AnalyticsChartController($scope, $window, appConfig) {
        var vm = this;
        var parentVm = $scope.$parent.$parent.vm;

        vm.nvd3 = {
            data: [],
            options: {}
        };

        vm.data = [];
        vm.labels = [];
        vm.series = ['Data'];

        vm.options = {
            // responsive: true,
            // maintainAspectRatio: false,
            // showLines: false,
            legend: {
                position: "top",
                display: true
            },
            // elements: {
            //     point: {
            //         radius: 4
            //     }
            // },
            scales: {
                xAxes: [{
                    // type: 'time',
                    // // distribution: 'series',
                    // // bounds: 'ticks',
                    // time: {
                    //     tooltipFormat: 'll HH:mm',
                    //     displayFormats: {
                    //         'hour': 'MMM D, HH:mm'
                    //     }//,
                    //     // unit: 'hour',
                    //     // unitStepSize: 8
                    // },
                    ticks: {
                        // fontSize: 10,
                        // maxRotation: 0,
                        autoSkipPadding: 10
                    }
                }],
                yAxes: [{
                    ticks: {
                        // beginAtZero: true,
                        // fontSize: 10,
                        // maxRotation: 0,
                        // autoSkipPadding: 10
                    },
                    scaleLabel: {
                        display: false,
                        // labelString: '',
                        // fontSize: 11
                    }
                }]
            }
        };

        vm.colors = ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];

        activate();

        function activate() {
            if (parentVm && parentVm.visualAnalytics.activeChart && parentVm.visualAnalytics.activeChart.alias && parentVm.visualAnalytics.result) {
                var data = parentVm.visualAnalytics.result.data;
                var serialData = parentVm.visualAnalytics.result.data;

                var axes = {};
                if (parentVm.visualAnalytics.activeChart.properties && parentVm.visualAnalytics.activeChart.properties.length > 0) {
                    parentVm.visualAnalytics.activeChart.properties.forEach(x => {
                        if (x.type == "singleSelect" || x.type == "singleInnerSelect") {
                            if (x[x.modelVariable]) {
                                axes[x.modelVariable] = x[x.modelVariable].key;
                            }
                        } else if (x.type == "multipleSelect") {
                            x[x.modelVariable].forEach(z => {
                                axes[z.key] = z.key;
                            });
                        }

                    });
                }
                var colorAttr = null;

                var chartType = parentVm.visualAnalytics.activeChart.alias;
                configureCharts(data, serialData, axes, chartType, colorAttr);
            }
        }

        function drawNvd3Chart(type, data, axes) {
            var clusters = [];
            var tableData = {};

            // data.forEach(function (item) {
            //     clusters.push(item.key);
            //     item.values.forEach(function (v) {
            //         v.clusterLabel = item.key;
            //         tableData.push(v);
            //     });

            // });

            var colorScale = d3.scale.category10();

            // var keys = [
            //     "anxiety_perception",
            //     "comorbidities_count",
            //     "depression_total_score",
            //     "life_quality",
            //     "pain_perception"
            // ];

            tableData.links = data[axes.links];
            tableData.nodes = data[axes.nodes];

            vm.nvd3.options = {
                chart: {
                    type: type,
                    height: 370,
                    width: 600,
                    margin: {
                        top: 30,
                        right: 10,
                        bottom: 10,
                        left: 10
                    },
                    color: function (d) {
                        return colorScale(d[axes.color]);
                    }
                }
            };

            vm.nvd3.data = tableData;
        }

        function configureCharts(data, serialData, axes, chartType, colorAttr) {
            var i = 0, l = data.length;
            if (data && data.length) {
                if (chartType === 'scatter') {
                    if (data[0].key && data[0].values) {
                        for (i; i < l; i++) {
                            vm.data[i] = [];
                            var item = data[i];
                            if (axes) {
                                var j = 0, m = item.values.length;
                                for (j; j < m; j++) {
                                    var value = item.values[j];
                                    vm.data[i].push({
                                        x: value[axes[Object.keys(axes)[0]]],
                                        y: value[axes[Object.keys(axes)[1]]]
                                    });
                                }
                            }
                            vm.series.push(item.key);
                        }
                    }
                    else {
                        if (axes) {
                            var seriesData = [];
                            var series = [];
                            for (i; i < l; i++) {
                                var item = data[i];
                                var ob = {
                                    x: item[axes.xAxis],
                                    y: item[axes.yAxis],
                                    series: 1
                                };

                                if (Object.keys(axes).length > 2) {
                                    if (!series.find(x => x == item[axes.color])) {
                                        series.push(item[axes.color]);
                                    }
                                    ob.series = item[axes.color];
                                } else {
                                    if (series.length == 0) series.push(1);
                                }
                                seriesData.push(ob);
                            }

                            for (i = 0; i < series.length; i++) {
                                vm.data[i] = seriesData.filter(x => x.series == series[i]);
                            }
                        }
                    }
                    vm.options.legend.display = false;
                } else if (chartType === 'radar') {
                    if (axes) {
                        for (axe in axes) {
                            vm.labels.push(axe);
                        }
                    }

                    for (i; i < l; i++) {
                        var arr = [];
                        for (property in data[i]) {
                            arr.push(data[i][property]);
                        }
                        vm.data.push(arr);
                    }

                    vm.options.legend.display = false;
                    vm.options.scales.xAxes[0].display = false;
                    vm.options.scales.yAxes[0].display = false;
                }
                else {
                    var seriesData = [];
                    if (axes) {
                        for (i; i < l; i++) {
                            var item = data[i];
                            seriesData.push(parseFloat(item[axes[Object.keys(axes)[1]]]));
                            var label = item[axes[Object.keys(axes)[0]]];
                            if (axes[Object.keys(axes)[0]].toLowerCase().indexOf('date') > -1) {
                                label = $window.moment.utc(label).local().format(appConfig.getConf('dateFormat'));
                            }
                            vm.labels.push(label);
                        }
                    }

                    if (chartType === "line" || chartType === "bar") {
                        vm.data[0] = seriesData;
                    }
                    else if (chartType === "pie" || chartType === "doughnut") {
                        vm.data = seriesData;
                        vm.options.legend.display = false;
                        vm.options.scales.xAxes[0].display = false;
                        vm.options.scales.yAxes[0].display = false;
                    }
                }
            }
            else if (chartType == 'parallel') {
                drawNvd3Chart("parallelCoordinates", data, axes);
            }
            else if (chartType == 'graph') {
                drawNvd3Chart("forceDirectedGraph", data, axes);
            }
        }
    }

    // TODO
    ActivityController.$inject = ['$window', '$log', 'api', 'appConfig'];
    function ActivityController($window, $log, api, appConfig) {
        var vm = this;

        vm.labels = [];
        vm.data = [[]];
        vm.series = ['Activity'];
        vm.chartType = 'line';

        vm.options = {
            // responsive: true,
            // maintainAspectRatio: false,
            // showLines: false,
            legend: {
                position: "top",
                display: true
            },
            // elements: {
            //     point: {
            //         radius: 4
            //     }
            // },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    type: 'category',
                    position: 'left',
                    display: true,
                    scaleLabel: {
                        display: true,
                    },
                    ticks: {
                        reverse: true
                    }
                }]
            }
        };

        activate();

        function activate() {
            api.charts.activity.get().$promise.then(function (response) {
                if (response.data) {
                    var i = 0, l = response.data.length;
                    for (i; i < l; i++) {
                        var item = response.data[i];
                        vm.labels.push($window.moment.utc(item.date).local().format(appConfig.getConfig('dateFormat')));
                        vm.data[0].push(item.value);
                    }
                }
            },
                function (response) {
                    $log.error(response);
                });
        }
    }
})();




