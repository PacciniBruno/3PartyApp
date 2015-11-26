'use strict';

var test     = require('tape');
var sinon    = require('sinon');
var sdk      = require('../../js/loader/sdk.js');
var mediator = require('../../js/loader/mediator.js');
var utils    = require('../utils.js');

utils.contentLoaded(window, function() {

  test('sdk exposes two public methods: `api` and `config`', function(assert) {
    assert.ok(sdk.hasOwnProperty('api'));
    assert.ok(sdk.hasOwnProperty('config'));
    assert.ok(sdk.hasOwnProperty('calledBeforeLoad'));
    assert.equal(Object.keys(sdk).length, 3);

    assert.end();
  });

  test('calling the `config` method on sdk with a known method name as argument', function(assert) {

    var configMethodStub = sinon.spy(mediator, 'trigger');

    // Call config
    sdk.config('chat.setOperatorGroup', '1');

    // the resulting method called should call trigger on the mediator
    assert.ok(configMethodStub.calledWith('app1.setOperatorGroup', '1'), 'should call the so-called method');

    mediator.trigger.restore();
    assert.end();
  });

  test('calling the `api` method on sdk with a known method name as argument', function(assert) {

    var apiMethodStub = sinon.spy(mediator, 'trigger');

    // Call config
    sdk.api('app2.show');
    assert.ok(apiMethodStub.calledWith('app2.show'), 'should call the so-called method');

    mediator.trigger.restore();
    assert.end();
  });

  test('calling the `config` method on sdk with an unknown method name as argument', function(assert) {

    var warnSpy = sinon.spy(console, 'warn');

    // Call config
    sdk.config('unknown.config.method');
    assert.ok(warnSpy.called, 'should warn the user in the console');

    console.warn.restore();
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

  test('calling the `api` or `config` method on sdk with an invalid argument as name', function(assert) {

    assert.throws(function() {
      // Call api with an invalid arg
      sdk.api(function isInvalidArg() {});
    }, 'should throw an exeption');

    assert.throws(function() {
      // Call api with an invalid arg
      sdk.api({ invalidArg: 'invalid'});
    }, 'should throw an exeption');

    assert.throws(function() {
      // Call api with an invalid arg
      sdk.config(function isInvalidArg() {});
    }, 'should throw an exeption');

    assert.throws(function() {
      // Call api with an invalid arg
      sdk.config({ invalidArg: 'invalid'});
    }, 'should throw an exeption');

    assert.end();
  });
});
