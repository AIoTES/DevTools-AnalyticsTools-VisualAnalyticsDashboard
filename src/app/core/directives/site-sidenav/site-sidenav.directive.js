(function() {
    'use strict';

    angular
        .module('app.core')

        .directive('siteSidenav', [function() {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'app/core/directives/site-sidenav/site-sidenav.html',
                controller: ['$rootScope', '$timeout', 'tree', SiteSitenavController],
                controllerAs: 'vm',
                link: function(scope, elem, attrs) {
                    
                }
            };

            function SiteSitenavController($rootScope, $timeout, tree) {
                var vm = this;

                tree.getTreeData().then(function(res) {
                    vm.tree = {
                        config: tree.getTreeConfig(['types', 'wholerow', 'state', 'checkbox', 'sort']),
                        data: res,
                        instance: null,
                        ignoreChanges: false,
                        applyModelChanges: function() {
                            return !vm.tree.ignoreChanges;
                        },
                        reCreateTree: function() {
                            vm.tree.ignoreChanges = true;
                            vm.tree.config.version++;
                        },
                        events: {
                            ready: function() {
                                $timeout(function() {
                                    vm.tree.ignoreChanges = false;
                                    // console.log('success', 'JS Tree Ready', 'Js Tree issued the ready event');
                                });
                            },
                            create_node: function(e, item) {
                                $timeout(function() {
                                    // console.log('success', 'Node Added', 'Added new node with the text ' + item.node.text);
                                });
                            },
                            select_node: function(e, item) {
                                if(item.node.type==="measurement") {
                                    var ref = vm.tree.instance.jstree(true);
                                    var parent = ref.get_node(item.node.parent);
                                    item.node.original.parent = parent.text;
                                    $timeout(function() {
                                        $rootScope.$broadcast("sidenav.tree.select_node", item.node.original);
                                    });
                                }
                            },
                            deselect_node: function(e, item) {
                                if(item.node.type==="measurement") {
                                    $timeout(function() {
                                        $rootScope.$broadcast("sidenav.tree.deselect_node", item.node.original);
                                    });
                                }
                            }
                        }
                    };
                });
            }
        }]);
})();