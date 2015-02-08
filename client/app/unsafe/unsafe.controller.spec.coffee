'use strict'

describe 'Controller: UnsafeCtrl', ->

  # load the controller's module
  beforeEach module 'mhimcApp'
  UnsafeCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    UnsafeCtrl = $controller 'UnsafeCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
