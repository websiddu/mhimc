'use strict'

angular.module 'mhimcApp'
.config ($stateProvider) ->
  $stateProvider.state 'screen',
    url: '/screen'
    templateUrl: 'app/screen/screen.html'
    controller: 'ScreenCtrl'
