/*globals cast*/
"use strict";

var _ = require('lodash');
var config = require('config');

function setHudMessage(elementId, message) {
  document.getElementById(elementId).innerHTML = '' + JSON.stringify(message);
}

if (config.castEnabled) {
  window.castReceiverManager = null;
  window.messageBus = null;
  window.connectedCastSenders = []; // {senderId:'', channel:obj}

  cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);

  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

  /**
   * Called to process 'ready' event. Only called after calling castReceiverManager.start(config) and the
   * system becomes ready to start receiving messages.
   *
   * @param {cast.receiver.CastReceiverManager.Event} event - can be null
   *
   * There is no default handler
   */
  window.castReceiverManager.onReady = function(event) {
    console.log(event);
  };

  /**
   * If provided, it processes the 'senderconnected' event.
   * Called to process the 'senderconnected' event.
   * @param {cast.receiver.CastReceiverManager.Event} event - can be null
   *
   * There is no default handler
   */
  window.castReceiverManager.onSenderConnected = function(event) {
    // TODO - add sender and grab CastChannel from CastMessageBus.getCastChannel(senderId)
    var senders = window.castReceiverManager.getSenders();
    console.log(event, senders);
  };

  /**
   * If provided, it processes the 'senderdisconnected' event.
   * Called to process the 'senderdisconnected' event.
   * @param {cast.receiver.CastReceiverManager.Event} event - can be null
   *
   * There is no default handler
   */
  window.castReceiverManager.onSenderDisconnected = function(event) {
    var senders = window.castReceiverManager.getSenders();

    //If last sender explicity disconnects, turn off
    if (senders.length === 0 && event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
      window.close();
    }
  };

  /**
   * Called to process the 'visibilitychanged' event.
   *
   * Fired when the visibility of the application has changed (for example
   * after a HDMI Input change or when the TV is turned off/on and the cast
   * device is externally powered). Note that this API has the same effect as
   * the webkitvisibilitychange event raised by your document, we provided it
   * as CastReceiverManager API for convenience and to avoid a dependency on a
   * webkit-prefixed event.
   *
   * @param {cast.receiver.CastReceiverManager.Event} event - can be null
   *
   * There is no default handler for this event type.
   */
  window.castReceiverManager.onVisibilityChanged = function(event) {
    /** check if visible and pause media if not - add a timer to tear down after a period of time
       if visibilty does not change back **/
    if (event.isVisible) {
      window.clearTimeout(window.timeout);
      window.timeout = null;
    } else {
      window.timeout = window.setTimeout(function () { window.close(); }, 600000); // 10 Minute timeout
    }
  };

  /**
   * Use the messageBus to listen for incoming messages on a virtual channel using a namespace string.
   * Also use messageBus to send messages back to a sender or broadcast a message to all senders.
   * You can check the cast.receiver.CastMessageBus.MessageType that a message bus processes though a call
   * to getMessageType. As well, you get the namespace of a message bus by calling getNamespace()
   */
  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:blackwidow');

  window.messageBus.onMessage = function(event) {
    setHudMessage('redText', event);

    document.getElementById('redText').style.color = _.sample(['white', 'orange', 'yellow', 'green', 'blue']);
  };

  var appConfig = new cast.receiver.CastReceiverManager.Config();
  appConfig.statusText = 'Ready to play';
  appConfig.maxInactivity = 6000;
  window.castReceiverManager.start(appConfig);
}

