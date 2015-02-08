'use strict'

angular.module 'mhimcApp'
.config ($stateProvider) ->
  $stateProvider.state 'unsafe',
    url: '/unsafe'
    templateUrl: 'app/unsafe/unsafe.html'
    controller: 'UnsafeCtrl'
