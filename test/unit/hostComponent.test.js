'use strict';

var test          = require('tape');
var sinon         = require('sinon');
var mediator      = require('../../js/loader/mediator.js');
var hostComponent = require('../../js/loader/hostComponent.js');
var _             = require('../../js/loader/utils.js');
var utils         = require('../utils.js');

utils.contentLoaded(window, function() {

  function messageSender() {

    // channel is the host `window`. When comming from an iframe,
    // we get the reference to the parent `window` using `window.opener || window.parent`
    var channel = window;

    function _postMessage(message) {

      // Message comming from registered app `exampleApp`
      message.sender = 'exampleApp';
      message = JSON.stringify(message);
      channel.postMessage(message, '*');
    }

    // Sends a message strictly to this frame's host object
    function sendHostMessage(name, params) {
      params = params || [];

      _postMessage({
        scope: 'myApp',
        name: name,
        data: params
      });
    }

    return {
      sendHostMessage: sendHostMessage
    };
  }

  // Create a dummy app, with a reference to the host's location host and origin
  var exampleApp = {
    host: _.getHost(window.location.href),
    origin: _.getOrigin(window.location.href),
  };

  // Register it in the mediator for future retrival in the `onTargetMessage` method
  mediator.registerApp(exampleApp, 'exampleApp');

  test('onTargetMessage', function(assert) {

    var host = hostComponent();
    var sender = messageSender();
    var triggerSpy = sinon.spy(mediator, 'trigger');
    var loadExtStylesStub = sinon.stub(host, 'loadExtStyles');

    // bind `onTargetMessage` the host window on 'message'
    host.initialize();

    sender.sendHostMessage('coucou', {
      myparam: 'param'
    });

    // onTargetMessage will be called asynchronously (postMessage works asynchronously)
    setTimeout(function() {
      assert.ok(triggerSpy.called, 'should trigger an event on mediator when receiving a valid message');
      assert.ok(triggerSpy.calledWith('coucou', {
        myparam: 'param'
      }), 'should receive the exact same message');

      mediator.trigger.restore();
      assert.end();
    }, 0);

    host.loadExtStyles.restore();
  });

  test('loadExtStyles gets called on initialize', function(assert) {

    var host = hostComponent();
    var loadExtStylesStub = sinon.stub(host, 'loadExtStyles');

    host.initialize();

    assert.ok(loadExtStylesStub.called);

    // Clean up
    host.loadExtStyles.restore();
    assert.end();
  });
});
