'use strict'

angular.module 'mhimcApp'
.config ($stateProvider) ->
  $stateProvider.state 'result',
    url: '/result'
    templateUrl: 'app/result/result.html'
    controller: 'ResultCtrl'
