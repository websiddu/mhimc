'use strict'

describe 'Service: crimeData', ->

  # load the service's module
  beforeEach module 'mhimcApp'

  # instantiate service
  crimeData = undefined
  beforeEach inject (_crimeData_) ->
    crimeData = _crimeData_

  it 'should do something', ->
    expect(!!crimeData).toBe true
