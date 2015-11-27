'use strict';

var test     = require('tape');
var sdk      = require('../../js/sdk.js');
var mediator = require('../../js/mediator.js');
var utils    = require('../utils.js');

utils.contentLoaded(window, function() {

  test('sdk exposes two public method: `api`', function(assert) {
    assert.ok(sdk.hasOwnProperty('api'));
    assert.ok(sdk.hasOwnProperty('calledBeforeLoad'));
    assert.equal(Object.keys(sdk).length, 2);

    assert.end();
  });

  test('calling the `api` method on sdk with a known method name as argument', function(assert) {

    var apiMethodStub = sinon.spy(mediator, 'trigger');

    // Call config
    sdk.api('app1.show');
    assert.ok(apiMethodStub.calledWith('app1.show'), 'should call the so-called method');

    mediator.trigger.restore();
    assert.end();
  });

  test('calling the `api` method on sdk with an unknown method name as argument', function(assert) {

    var warnSpy = sinon.spy(console, 'warn');

    // Call config
    sdk.api('unknown.api.method');
    assert.ok(warnSpy.called, 'should warn the user in the console');

    console.warn.restore();
    assert.end();
  });

  test('calling the `api` method on sdk with an invalid argument as name', function(assert) {

    assert.throws(function() {
      // Call api with an invalid arg
      sdk.api(function isInvalidArg() {});
    }, 'should throw an exeption');

    assert.throws(function() {
      // Call api with an invalid arg
      sdk.api({ invalidArg: 'invalid'});
    }, 'should throw an exeption');

    assert.end();
  });
});
