(function () {
  var OLD = /not allowed by the user agent|not allowed by the platform|permission denied|denied permission/i;

  function hint() {
    var ua = navigator.userAgent || "";
    var zh = false;
    try {
      zh = localStorage.getItem("yiran-language") === "zh" || document.documentElement.lang.indexOf("zh") === 0;
    } catch (error) {}
    var instagram = /Instagram/i.test(ua);
    var ios = /iPhone|iPad|iPod/i.test(ua);
    var chromeIos = /CriOS/i.test(ua);
    var android = /Android/i.test(ua);
    var chrome = /Chrome/i.test(ua);
    if (zh) {
      if (instagram) return "麦克风没开。请到手机「设置」→ Instagram → 麦克风，打开后再试。如果还不行，用 Safari 打开这个页面。";
      if (ios && chromeIos) return "麦克风没开。请到手机「设置」→ Chrome → 麦克风，打开后重新加载这个页面。";
      if (ios) return "麦克风没开。请到手机「设置」→ Safari → 麦克风，选允许，然后重新加载这个页面。";
      if (android && chrome) return "麦克风没开。请到手机「设置」→ 应用 → Chrome → 权限 → 麦克风，允许后重新加载。";
      return "麦克风没开。请到手机「设置」里为现在用的浏览器打开麦克风，然后重新加载这个页面。";
    }
    if (instagram) return "The microphone is off. Open Settings → Instagram → Microphone and turn it on. If it still fails, open this page in Safari.";
    if (ios && chromeIos) return "The microphone is off. Open Settings → Chrome → Microphone, turn it on, then reload this page.";
    if (ios) return "The microphone is off. Open Settings → Safari → Microphone, choose Allow, then reload this page.";
    if (android && chrome) return "The microphone is off. Open Settings → Apps → Chrome → Permissions → Microphone, allow it, then reload.";
    return "The microphone is off. Open Settings and turn Microphone on for this browser, then reload this page.";
  }

  function denied(error) {
    var name = error && error.name;
    var message = error && error.message ? String(error.message) : "";
    return name === "NotAllowedError" || name === "PermissionDeniedError" || OLD.test(message);
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function (constraints) {
      return original(constraints).catch(function (error) {
        if (!denied(error)) throw error;
        throw new DOMException(hint(), "NotAllowedError");
      });
    };
  }

  function rewrite(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !OLD.test(node.nodeValue)) continue;
      node.nodeValue = hint();
    }
  }

  function watch(host) {
    if (!host.shadowRoot || host.dataset.micHint) return;
    host.dataset.micHint = "1";
    var apply = function () { rewrite(host.shadowRoot); };
    apply();
    new MutationObserver(apply).observe(host.shadowRoot, { childList: true, subtree: true, characterData: true });
  }

  function attach() {
    var host = document.querySelector("elevenlabs-convai");
    if (!host) return;
    if (host.shadowRoot) watch(host);
    else {
      var timer = setInterval(function () {
        if (!host.shadowRoot) return;
        clearInterval(timer);
        watch(host);
      }, 50);
    }
  }

  attach();
  new MutationObserver(attach).observe(document.documentElement, { childList: true, subtree: true });
})();
