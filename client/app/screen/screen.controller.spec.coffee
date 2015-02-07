'use strict'

describe 'Controller: ScreenCtrl', ->

  # load the controller's module
  beforeEach module 'mhimcApp'
  ScreenCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ScreenCtrl = $controller 'ScreenCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
