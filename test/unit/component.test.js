'use strict';

var test      = require('tape');
var sinon     = require('sinon');
var component = require('../../js/loader/component.js');
var Events    = require('../../js/loader/Events.js');
var utils     = require('../utils.js');

utils.contentLoaded(window, function() {

  var frameOptions = {
    tagName: 'article',
    attrs: {
      'class': 'test'
    },
    styles: {
      'background-color': 'black'
    },
    html: '<p>I\'m an article with a paragraph inside</p>'
  };

  var containerOptions = {
    tagName: 'section',
    attrs: {
      'id': 'myContainerId'
    }
  };

  test('setState', function(assert) {

    var myComponent = component();
    var triggerStub = sinon.stub(myComponent, 'trigger');

    // Initialization
    myComponent.state = {
      state1: false,
    };

    myComponent.setState('state1', true);
    assert.equal(myComponent.state.state1, true, 'State should have changed for state1');
    assert.ok(triggerStub.calledTwice,'state change should trigger 2 events');
    assert.ok(triggerStub.firstCall.calledWith('change', myComponent.state),
      'trigger a `change` event with the states map as parameter');
    assert.ok(triggerStub.secondCall.calledWith('change:state1', true),
      'trigger a `change:[state name]` event with the state value as parameter');

    myComponent.trigger.restore();
    assert.end();
  });

  test('getState', function(assert) {

    var myComponent = component();

    // Initialization
    myComponent.state = {
      state1: false,
      state2: true,
      state3: 'coucou'
    };

    var state1 = myComponent.getState('state1');
    var state2 = myComponent.getState('state2');
    var state3 = myComponent.getState('state3');

    assert.equal(state1, myComponent.state.state1);
    assert.equal(state2, myComponent.state.state2);
    assert.equal(state3, myComponent.state.state3);

    assert.end();
  });

  test('createEl', function(assert) {

    var myComponent = component();
    var el = myComponent.createEl(frameOptions);

    assert.equal(el.tagName, 'ARTICLE');
    assert.equal(el.className,'test');
    assert.equal(el.attributes.length, 2); // class + styles
    assert.equal(el.style.backgroundColor, 'black');
    assert.equal(el.innerHTML, '<p>I\'m an article with a paragraph inside</p>');

    assert.end();
  });

  test('insertInContainer by id', function(assert) {

    var myComponent = component();
    var el = myComponent.createEl(frameOptions);
    var containerEl = myComponent.createEl(containerOptions);
    document.body.appendChild(containerEl);

    myComponent.insertInContainer(el, 'myContainerId');

    assert.equal(containerEl.childNodes.length, 1, 'container should have 1 and only child');
    assert.equal(containerEl.childNodes[0], el, 'that child should be el');

    // clean up:
    document.body.removeChild(containerEl);

    assert.end();
  });

  test('insertInContainer using existing container element ref', function(assert) {

    var myComponent = component();
    var el = myComponent.createEl(frameOptions);
    var containerEl = myComponent.createEl(containerOptions);
    document.body.appendChild(containerEl);

    myComponent.insertInContainer(el, containerEl);

    var domEl = document.getElementsByClassName('test')[0];

    assert.equal(domEl, el, 'el is in the Dom');
    assert.equal(domEl.parentNode, containerEl, 'and has container for parentNode');

    // clean up:
    document.body.removeChild(containerEl);

    assert.end();
  });

  test('hide', function(assert) {

    var myComponent = component();

    // Assign myComponent.el to component:
    myComponent.el = myComponent.createEl(frameOptions);
    myComponent.show();
    myComponent.hide();

    assert.equal(myComponent.el.style.display, 'none',
      'component element should be hidden now');

    // window should be focused
    assert.equal(document.activeElement, document.body);

    assert.end();
  });

  test('show', function(assert) {

    var myComponent = component();

    // Assign myComponent.el to myComponent:
    myComponent.el = myComponent.createEl(frameOptions);

    // first hide (set display to none)
    myComponent.hide();

    // Then show (should remove the display style property)
    myComponent.show();

    assert.equal(myComponent.el.style.display, '');
    assert.end();
  });

  test('setAttributes', function(assert) {

    var myComponent = component();

    var el = myComponent.createEl(frameOptions);

    myComponent.setAttributes(el, {
      'class': 'test 2',
      'id': 'testId'
    });

    assert.equal(el.attributes.length, 3);
    assert.equal(el.className, 'test 2');
    assert.equal(el.id, 'testId');

    assert.end();
  });

  test('setInlineStyle', function(assert) {

    var myComponent = component();

    var el = myComponent.createEl(frameOptions);

    // Should work with single properties
    myComponent.setInlineStyle(el, 'background', 'blue');

    // And a map
    myComponent.setInlineStyle(el, {
      'display': 'inline-block',
      'height': '50px',
      'padding': '20px'
    });

    assert.equal(el.style.background, 'blue');
    assert.equal(el.style.display, 'inline-block');
    assert.equal(el.style.height, '50px');
    assert.equal(el.style.padding, '20px');

    assert.end();
  });

  test('removeInlineStyle', function(assert) {

    var myComponent = component();

    var el = myComponent.createEl(frameOptions);

    // Should work with single properties
    myComponent.setInlineStyle(el, 'background-color', 'blue');
    myComponent.setInlineStyle(el, 'right', '20px');
    myComponent.removeInlineStyle(el, 'background-color');

    assert.equal(el.style.backgroundColor, '');

    assert.end();
  });

  test('delegateEvents on self', function(assert) {

    var myComponent = component();
    var greetings = '';

    // Create an object that extends myComponent and has an events map:
    var childcomponent = utils.extend(myComponent, {
      events: {
        'greet': 'onGreet'
      },

      initialize: function() {
        // Pass in regular context, delegate to this
        this.delegateEvents(this, this.events, this);
      },

      onGreet: function() {
        greetings = 'Hi!';
      },
    });

    // Delegate events
    childcomponent.initialize();

    // Trigger an event present in the map
    childcomponent.trigger('greet');

    // `onGreet should have been called
    assert.equal(greetings, 'Hi!');

    assert.end();
  });

  test('delegateEvents on another object', function(assert) {

    var myComponent = component();
    var greetings = '';

    var eventBus = utils.extend({}, Events);

    // Create an object that extends myComponent and has an events map:
    var childcomponent = utils.extend(myComponent, {
      events: {
        'greet': 'onGreet'
      },

      initialize: function() {
        // Pass in regular context, delegate to this
        this.delegateEvents(eventBus, this.events, this);
      },

      onGreet: function() {
        greetings = 'Hi!';
      },
    });

    // Delegate events
    childcomponent.initialize();

    // Trigger an event present in the map
    eventBus.trigger('greet');

    // `onGreet should have been called
    assert.equal(greetings, 'Hi!');

    assert.end();
  });

  test('undelegateEvents bound to self', function(assert) {

    var myComponent = component();
    var greetings = '';

    // Create an object that extends myComponent and has an events map:
    var childcomponent = utils.extend(myComponent, {
      events: {
        'greet': 'onGreet'
      },

      initialize: function() {
        // Pass in regular context, delegate to this
        this.delegateEvents(this, this.events, this);
      },

      onGreet: function() {
        greetings = 'Hi!';
      },
    });

    // Delegate events
    childcomponent.initialize();

    // Undelegate events
    childcomponent.undelegateEvents();

    // Trigger an event present in the map
    childcomponent.trigger('greet');

    // `onGreet should not have been called
    assert.equal(greetings, '');

    assert.end();
  });

  test('undelegateEvents bound to another object', function(assert) {

    var myComponent = component();
    var greetings = '';

    var eventBus = utils.extend({}, Events);

    // Create an object that extends myComponent and has an events map:
    var childcomponent = utils.extend(myComponent, {
      events: {
        'greet': 'onGreet'
      },

      initialize: function() {
        // Pass in regular context, delegate to this
        this.delegateEvents(eventBus, this.events, this);
      },

      onGreet: function() {
        greetings = 'Hi!';
      },
    });

    // Delegate events
    childcomponent.initialize();

    // Undelegate events
    childcomponent.undelegateEvents(eventBus);

    // Trigger an event present in the map
    eventBus.trigger('greet');

    // `onGreet should not have been called
    assert.equal(greetings, '');

    assert.end();
  });

  test('forwardStateChangeEvents should make state change events available on the mediator eventBus', function(assert) {
    var myComponent = component();
    myComponent.uid = 'testComponent';

    var eventBus = utils.extend({}, Events);
    var triggerStub = sinon.stub(eventBus, 'trigger');

    myComponent.state = {
      'state1': true
    };

    // Forward to eventBus
    myComponent.forwardStateChangeEvents(eventBus, myComponent.state, myComponent);

    // Change state
    myComponent.setState('state1', false);

    // A change event should have been triggered on eventBus
    assert.ok(triggerStub.calledOnce);
    assert.ok(triggerStub.firstCall.calledWith('testComponent.change:state1', false));

    eventBus.trigger.restore();
    assert.end();
  });

  test('remove', function(assert) {

    var myComponent = component();

    // Create myComponent own el
    myComponent.el = myComponent.createEl(frameOptions);

    // Insert in body
    myComponent.insertInContainer(myComponent.el, document.body);

    // Remove
    myComponent.remove();

    // Element shouldn't be found in the DOM
    assert.equal(document.getElementsByClassName('test').length, 0);

    assert.end();
  });

});
