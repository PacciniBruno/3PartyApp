
module.exports = (function() {

  return {
    sendMessage: function(name, data) {
      var message = JSON.stringify({
        scope: 'client',
        name: name,
        data: data
      });

      var send = (function(target, message) {
        return function() {
          var targetWindow = target.frame;
          if (targetWindow) {
            targetWindow.postMessage(message, target.origin);
          } else {
            setTimeout(send, 500);
          }
        };

      })(this, message);

      if (this.getState('load')) {
        send();
      } else {
        this.on('change:load', send);
      }
    }
  };

})();

