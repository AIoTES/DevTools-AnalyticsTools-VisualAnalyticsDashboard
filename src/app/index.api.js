(function () {
    'use strict';

    angular
        .module('app')
        .factory('api', apiService);

    apiService.$inject = ['$resource', 'appConfig'];
    function apiService($resource, appConfig) {
        /**
         * You can use this service to define your API urls. The "api" service
         * is designed to work in parallel with "apiResolver" service which you can
         * find in the "app/core/services/api-resolver.service.js" file.
         *
         * You can structure your API urls whatever the way you want to structure them.
         * You can either use very simple definitions, or you can use multi-dimensional
         * objects.
         *
         * Here's a very simple API url definition example:
         *
         *      api.getBlogList = $resource('http://api.example.com/getBlogList');
         *
         * While this is a perfectly valid $resource definition, most of the time you will
         * find yourself in a more complex situation where you want url parameters:
         *
         *      api.getBlogById = $resource('http://api.example.com/blog/:id', {id: '@id'});
         *
         * You can also define your custom methods. Custom method definitions allow you to
         * add hardcoded parameters to your API calls that you want to sent every time you
         * make that API call:
         *
         *      api.getBlogById = $resource('http://api.example.com/blog/:id', {id: '@id'}, {
         *         'getFromHomeCategory' : {method: 'GET', params: {blogCategory: 'home'}}
         *      });
         *
         * In addition to these definitions, you can also create multi-dimensional objects.
         * They are nothing to do with the $resource object, it's just a more convenient
         * way that we have created for you to packing your related API urls together:
         *
         *      api.blog = {
         *                   list     : $resource('http://api.example.com/blog'),
         *                   getById  : $resource('http://api.example.com/blog/:id', {id: '@id'}),
         *                   getByDate: $resource('http://api.example.com/blog/:date', {id: '@date'}, {
         *                       get: {
         *                            method: 'GET',
         *                            params: {
         *                                getByDate: true
         *                            }
         *                       }
         *                   })
         *       }
         *
         * If you look at the last example from above, we overrode the 'get' method to put a
         * hardcoded parameter. Now every time we make the "getByDate" call, the {getByDate: true}
         * object will also be sent along with whatever data we are sending.
         *
         * All the above methods are using standard $resource service. You can learn more about
         * it at: https://docs.angularjs.org/api/ngResource/service/$resource
         *
         * -----
         *
         * After you defined your API urls, you can use them in Controllers, Services and even
         * in the UIRouter state definitions.
         *
         * If we use the last example from above, you can do an API call in your Controllers and
         * Services like this:
         *
         *      function MyController (api)
         *      {
         *          // Get the blog list
         *          api.blog.list.get({},
         *
         *              // Success
         *              function (response)
         *              {
         *                  console.log(response);
         *              },
         *
         *              // Error
         *              function (response)
         *              {
         *                  console.error(response);
         *              }
         *          );
         *
         *          // Get the blog with the id of 3
         *          var id = 3;
         *          api.blog.getById.get({'id': id},
         *
         *              // Success
         *              function (response)
         *              {
         *                  console.log(response);
         *              },
         *
         *              // Error
         *              function (response)
         *              {
         *                  console.error(response);
         *              }
         *          );
         *
         *          // Get the blog with the date by using custom defined method
         *          var date = 112314232132;
         *          api.blog.getByDate.get({'date': date},
         *
         *              // Success
         *              function (response)
         *              {
         *                  console.log(response);
         *              },
         *
         *              // Error
         *              function (response)
         *              {
         *                  console.error(response);
         *              }
         *          );
         *      }
         *
         * Because we are directly using $resource service, all your API calls will return a
         * $promise object.
         *
         * --
         *
         * If you want to do the same calls in your UI Router state definitions, you need to use
         * "apiResolver" service we have prepared for you:
         *
         *      $stateProvider.state('app.blog', {
         *          url      : '/blog',
         *          views    : {
         *               'content@app': {
         *                   templateUrl: 'app/main/apps/blog/blog.html',
         *                   controller : 'BlogController as vm'
         *               }
         *          },
         *          resolve  : {
         *              Blog: function (apiResolver)
         *              {
         *                  return apiResolver.resolve('blog.list@get');
         *              }
         *          }
         *      });
         *
         *  You can even use parameters with apiResolver service:
         *
         *      $stateProvider.state('app.blog.show', {
         *          url      : '/blog/:id',
         *          views    : {
         *               'content@app': {
         *                   templateUrl: 'app/main/apps/blog/blog.html',
         *                   controller : 'BlogController as vm'
         *               }
         *          },
         *          resolve  : {
         *              Blog: function (apiResolver, $stateParams)
         *              {
         *                  return apiResolver.resolve('blog.getById@get', {'id': $stateParams.id);
         *              }
         *          }
         *      });
         *
         *  And the "Blog" object will be available in your BlogController:
         *
         *      function BlogController(Blog)
         *      {
         *          var vm = this;
         *
         *          // Data
         *          vm.blog = Blog;
         *
         *          ...
         *      }
         */

        var api = {};

        // Base Url
        api.baseUrl = appConfig.getConfig('apiBaseUrl');
        // Analytics Url
        api.analyticsUrl = appConfig.getConfig('apiAnalyticsUrl');

        api.site = {
            list: $resource(api.baseUrl + 'sites', {}, {
                get: {
                    method: 'GET',
                    params: {
                        tenantAuthToken: appConfig.getConfig('tenantAuthToken')
                    }
                }
            }),
            assignments: $resource(api.baseUrl + 'sites/:siteToken/assignments', {siteToken: '@siteToken'}, {
                get: {
                    method: 'GET',
                    params: {
                        tenantAuthToken: appConfig.getConfig('tenantAuthToken'),
                        status: "Active",
                        includeDevice: true
                    }
                }
            })
        };

        api.device = {
            getById  : $resource(api.baseUrl + 'devices/:hardwareId', {hardwareId: '@hardwareId'}, {
                get: {
                    method: 'GET',
                    params: {
                        tenantAuthToken: appConfig.getConfig('tenantAuthToken')
                    }
                }
            })
        }

        api.assignments = {
            measurementSeries: $resource(api.baseUrl + 'assignments/:assignmentToken/measurements/series', {assignmentToken: '@assignmentToken'}, {
                query: {
                    method: 'GET',
                    params: {
                        tenantAuthToken: appConfig.getConfig('tenantAuthToken')
                    },
                    isArray: true
                }
            })
        };

        api.tree = {
            default: $resource(api.baseUrl + 'trees/defaultTree', {}, {
                query: {
                    method: 'GET',
                    params: {
                        tenantAuthToken: appConfig.getConfig('tenantAuthToken')
                    },
                    isArray: true
                }
            })
        };

        api.analytics = {
            // calculate: $resource(api.analyticsUrl + ':category/:method', {category: '@category', method: '@method'}, {
            //     post: {
            //         method: 'POST',
            //         params: {
            //             tenantAuthToken: appConfig.getConfig('tenantAuthToken')
            //         }
            //     }
            // }),
            // listMethods: $resource("assets/data/analytics/methods.json"),
            // listCategories: $resource("assets/data/analytics/categories.json")
            calculate: $resource(api.analyticsUrl + ':method', {method: '@method'})
        };



        api.charts = {
            types: $resource('/assets/data/charts/types.json'),
            graph: $resource("assets/data/charts/graph_data.json"),
            scatter: $resource("assets/data/charts/2d_data.json"),
            activity: $resource("assets/data/charts/activity_data.json"),
            activitySummary: $resource("assets/data/charts/activity_summary_data.json"),
            lifeQuality: $resource("assets/data/charts/life_quality_data.json"),
            luminance: $resource("assets/data/charts/luminance_data.json"),
            multidimensional: $resource("assets/data/charts/multi_dimensional.json")
        }

        return api;
    }

})();