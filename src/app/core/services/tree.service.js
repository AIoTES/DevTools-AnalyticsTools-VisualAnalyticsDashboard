(function () {

    'use strict';

    angular
        .module('app.core')
        .factory('tree', treeService);

    treeService.$inject = ['$log', 'api'];
    function treeService($log, api) {
        return {
            getTreeConfig: getTreeConfig,
            getTreeData: getTreeData
        };

        function getTreeConfig(plugins) {
            return {
                core: {
                    multiple: true,
                    animation: true,
                    error: function (error) {
                        $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                    },
                    check_callback: true,
                    worker: true,
                    themes: {
                        name: 'proton',
                        responsive: true
                    }
                },
                types: {
                    client:{
                        icon : 'icomoon-office'
                    },
                    site:{
                        icon : 'icomoon-home'
                    },
                    device:{
                        icon : 'icomoon-meter'
                    },
                    measurement:{
                        icon : 'icomoon-stats-dots'
                    }
                },
                checkbox: { 
                    three_state: false 
                },
                dnd: {
                    large_drop_target: true
                },
                version: 0,
                plugins: plugins
            };
        }

        function getTreeData() {
            return api.tree.default.query().$promise.then(function (response) {
                return processTreeData(response);
            },
            function (response) {
                $log.error(response);
                return null;
            });
        }

        function processTreeData(treeData) {
            var texts = {};
            treeData.forEach(function (node, j) {
                if (!nodeType(node, "client")) {
                    texts[node.id] = node.text;
                }
            });
            treeData.forEach(function (node, j) {
                if (node.text != null) {
                    var foo = node.text;
                    if (node.text.search(texts[node.parent]) == 0) {
                        node.text = node.text.replace(texts[node.parent], "");
                        node.text = node.text.trim();
                        if (/^\d+$/.test(node.text)) {
                            node.text = "#" + node.text;
                        }
                    }
                    if (!nodeType(node, "measurement")) {
                        node.state = { checkbox_disabled: true };
                    }
                    // Restore
                    if (node.text == "") node.text = foo;
                }
            });

            var pos = 0;
            var parent = '';
            var children = [];
            // var foo = _.clone(treeData);
            var foo = [];
            angular.copy(treeData, foo);
            foo.forEach(function (node, j) {
                if (nodeType(node, "measurement")) {
                    if (node.parent != parent) {
                        if (children.length) {
                            // Sort measurements
                            children.sort(function (a, b) {
                                var nameA = a.specs.friendlyName.toLowerCase(), nameB = b.specs.friendlyName.toLowerCase()
                                if (nameA < nameB) // Sort string ascending
                                    return -1
                                if (nameA > nameB)
                                    return 1
                                return 0 // efault return value (no sorting)
                            });

                            // Insert new sorted array in place of old values
                            treeData.splice.apply(treeData, [pos, children.length].concat(children));
                        }

                        pos = j;
                        children = [];
                        children.push(node);
                        parent = node.parent;
                    }
                    else {
                        children.push(node);
                    }
                }
            });
            var groupIds = [];
            var siteIds = [];
            var tenantIds = [];
            var portfolioIds = [];
            for (var i = 0; i < treeData.length; i++) {
                if (treeData[i].type === "deviceGroup") {
                    groupIds.push(treeData[i].id)
                }
                else if (treeData[i].type === "site") {
                    siteIds.push(treeData[i].id)
                }
                else if (treeData[i].type === "portfolio") {
                    portfolioIds.push(treeData[i].id)
                }
                else if (treeData[i].type === "client") {
                    tenantIds.push(treeData[i].id)
                }
            }
            treeData = removeEmpty(treeData, groupIds);
            treeData = removeEmpty(treeData, siteIds);
            treeData = removeEmpty(treeData, portfolioIds);
            treeData = removeEmpty(treeData, tenantIds);
            for (var i = 0; i < treeData.length; i++) {
                treeData[i]["__uiNodeId"] = i + 1;
            }

            return treeData;
        }

        function removeEmpty(tree, ids) {
            var fl = false;
            var groupT = -1;
            for (var j = 0; j < ids.length; j++) {
                fl = false;
                groupT = -1;
                for (var i = 0; i < tree.length; i++) {
                    if (tree[i].id == ids[j]) {
                        groupT = i;
                    }
                    if (tree[i].parent == ids[j]) {
                        fl = true;
                    }
                }
                if (!fl) {
                    tree.splice(groupT, 1);
                }
            }
            return tree;
        }

        function nodeType(node, type) {
            return node.id.indexOf(type + "_") == 0;
        }
    }

})();