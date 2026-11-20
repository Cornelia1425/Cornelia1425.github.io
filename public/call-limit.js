(function () {
  // Each browser gets five voice conversations a day. This does not read the
  // ElevenLabs account balance; it only stops this browser from starting more.
  var LIMIT = 5;
  var KEY = "elevenlabs-daily-usage";
  var host = document.querySelector("elevenlabs-convai");
  if (!host) return;

  function today() {
    return new Date().toLocaleDateString("en-CA");
  }

  function read() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || raw.date !== today() || typeof raw.count !== "number" || raw.count < 0) {
        return { date: today(), count: 0 };
      }
      return { date: raw.date, count: raw.count };
    } catch (error) {
      return { date: today(), count: 0 };
    }
  }

  function write(count) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ date: today(), count: count }));
    } catch (error) {}
  }

  function chinese() {
    try {
      return localStorage.getItem("yiran-language") === "zh"
        || (document.documentElement.lang || "").indexOf("zh") === 0;
    } catch (error) {
      return false;
    }
  }

  var note = document.createElement("div");
  note.id = "voice-daily-limit";
  note.hidden = true;
  note.setAttribute("role", "status");

  function paintNote() {
    var mobile = window.matchMedia("(max-width: 700px)").matches;
    var twoD = location.pathname.indexOf("/2d") === 0;
    note.textContent = chinese()
      ? "今天的五次对话用完了，明天再来。"
      : "Five conversations today. The guide is back tomorrow.";
    note.style.cssText = [
      "position:fixed",
      "z-index:1001",
      "right:16px",
      mobile ? "bottom:calc(76px + env(safe-area-inset-bottom))" : "bottom:16px",
      "max-width:220px",
      "margin:0",
      "padding:10px 12px",
      "font:12px/1.45 Inter,Helvetica Neue,Helvetica,Arial,sans-serif",
      twoD
        ? "color:#444;background:#f2f5f1;border:1px solid #d5d8d2"
        : "color:#dedede;background:#090909;border:1px solid #333"
    ].join(";");
  }

  function lock() {
    host.style.setProperty("display", "none", "important");
    paintNote();
    note.hidden = false;
  }

  function unlock() {
    host.style.removeProperty("display");
    note.hidden = true;
  }

  document.body.appendChild(note);

  var sawLive = false;
  var recentStart = 0;
  var watching = false;

  function callIsOpen(root) {
    if (!root) return false;
    if (root.querySelector("[aria-label='End']")) return true;
    var heading = root.querySelector("h1, h2");
    return !!(heading && /an error occurred/i.test(heading.textContent || ""));
  }

  function checkEnd() {
    if (read().count < LIMIT || !host.shadowRoot) return;
    if (callIsOpen(host.shadowRoot)) {
      sawLive = true;
      return;
    }
    var start = host.shadowRoot.querySelector("[aria-label='Start a call']");
    if (sawLive && start) lock();
  }

  function watch() {
    if (watching || !host.shadowRoot) return;
    watching = true;
    new MutationObserver(checkEnd).observe(host.shadowRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label"]
    });
  }

  function ensureWatch() {
    if (host.shadowRoot) {
      watch();
      return;
    }
    var timer = setInterval(function () {
      if (!host.shadowRoot) return;
      clearInterval(timer);
      watch();
    }, 50);
  }

  if (read().count >= LIMIT) lock();

  host.addEventListener("elevenlabs-convai:call", function () {
    var usage = read();
    if (usage.count >= LIMIT) return;
    var next = usage.count + 1;
    write(next);
    recentStart = Date.now();
    sawLive = false;
    if (next >= LIMIT) ensureWatch();
  });

  document.addEventListener("pointerdown", function (event) {
    if (read().count < LIMIT) return;
    var path = event.composedPath ? event.composedPath() : [];
    var onHost = false;
    for (var i = 0; i < path.length; i++) {
      if (path[i] === host) onHost = true;
    }
    if (!onHost || callIsOpen(host.shadowRoot)) return;
    if (Date.now() - recentStart < 2000) return;
    event.preventDefault();
    event.stopPropagation();
    lock();
  }, true);

  new MutationObserver(function () {
    if (!note.hidden) paintNote();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  window.addEventListener("storage", function (event) {
    if (event.key !== KEY && event.key !== "yiran-language") return;
    if (read().count >= LIMIT && !callIsOpen(host.shadowRoot)) lock();
    else if (read().count < LIMIT) unlock();
    else if (!note.hidden) paintNote();
  });
})();
