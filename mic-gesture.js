(function () {
  // iOS only shows the microphone prompt when getUserMedia runs in the same
  // tap that the user just made. The widget waits on the terms dialog first,
  // so the prompt never appears and Safari reports a permission error instead.
  var requesting = false;
  var touched = false;

  function isAccept(event) {
    var path = event.composedPath ? event.composedPath() : [];
    for (var i = 0; i < path.length; i++) {
      var node = path[i];
      if (!node || node.nodeType !== 1 || node.tagName !== "BUTTON") continue;
      var row = node.parentElement;
      var card = row && row.parentElement;
      if (!card || !card.querySelector(".terms")) continue;
      var buttons = row.getElementsByTagName("button");
      return buttons.length > 0 && buttons[buttons.length - 1] === node;
    }
    return false;
  }

  function prime(event) {
    if (requesting || !isAccept(event)) return false;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
    requesting = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      stream.getTracks().forEach(function (track) { track.stop(); });
    }).catch(function () {
      requesting = false;
    });
    return true;
  }

  document.addEventListener("touchend", function (event) {
    if (prime(event)) touched = true;
  }, true);
  document.addEventListener("click", function (event) {
    if (touched) {
      touched = false;
      return;
    }
    prime(event);
  }, true);
})();
