'use strict'

angular.module 'mhimcApp'
.config ($stateProvider) ->
  $stateProvider.state 'results',
    url: '/results'
    templateUrl: 'app/results/results.html'
    controller: 'ResultsCtrl'
