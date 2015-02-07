'use strict'

describe 'Controller: ResultCtrl', ->

  # load the controller's module
  beforeEach module 'mhimcApp'
  ResultCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ResultCtrl = $controller 'ResultCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
