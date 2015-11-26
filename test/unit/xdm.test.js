'use strict';

var test      = require('tape');
var sinon     = require('sinon');
var mediator  = require('../../js/loader/mediator.js');
var component = require('../../js/loader/component.js');
var xdm       = require('../../js/loader/xdm.js');
var utils     = require('../utils.js');

utils.contentLoaded(window, function() {

  test('xdm.sendMessage sends a message via postMessage to another frame', function(assert) {

    // Another frame extends component and xdm,
    // because xdm will always be used by an instance of component
    var anotherFrame = utils.extend(component(), {
      origin: '*',

      state: {
        // Init to true for the purpose of this test
        load: true
      },

      initialize: function() {

        // create an iframe and store its contentWindow in `this.frame`
        var iframe = this.createEl({
          tagName: 'iframe',
        });

        this.el = this.insertInContainer(iframe, document.body);
        this.frame = iframe.contentWindow;
      }
    }, xdm);

    // Initialize the component
    anotherFrame.initialize();

    var origPostMessage = anotherFrame.frame.postMessage;
    var postMessageSpy = sinon.spy(anotherFrame.frame, 'postMessage');

    // Send a message to the Iframe
    anotherFrame.sendMessage('coucou');

    var expectedSentMessage = JSON.stringify({
      'scope': 'client',
      'name': 'coucou'
    });

    // postMessga was used to send the message to `anotherFrame`
    assert.ok(postMessageSpy.calledWith(expectedSentMessage, '*'));

    //Clean up
    anotherFrame.remove();
    anotherFrame.frame.postMessage = origPostMessage;
    assert.end();
  });

  test('xdm.sendMessage sends a message when frame has loaded', function(assert) {

    // Another frame extends component and xdm,
    // because xdm will always be used by an instance of component
    var anotherFrame = utils.extend(component(), {
      origin: '*',

      state: {
        // Init to false this time
        load: false
      },

      initialize: function() {

        // create an iframe and store its contentWindow in `this.frame`
        var iframe = this.createEl({
          tagName: 'iframe',
        });

        this.el = this.insertInContainer(iframe, document.body);
        this.frame = iframe.contentWindow;
      }
    }, xdm);

    // Initialize the component
    anotherFrame.initialize();

    var origPostMessage = anotherFrame.frame.postMessage;
    var postMessageSpy = sinon.spy(anotherFrame.frame, 'postMessage');

    // Send a message to the Iframe
    anotherFrame.sendMessage('coucou');

    // postMessga was used to send the message to `anotherFrame`
    assert.notOk(postMessageSpy.called, 'the message should be on hold');

    // Change state
    anotherFrame.setState('load', true);
    assert.ok(postMessageSpy.called, 'the message should now have been sent');

    //Clean up
    anotherFrame.remove();
    anotherFrame.frame.postMessage = origPostMessage;
    assert.end();
  });
});
