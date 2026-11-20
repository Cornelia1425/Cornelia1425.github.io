(function () {
  var host = document.querySelector("elevenlabs-convai");
  if (!host) return;
  var active = null;
  var suppressClick = false;

  function layoutName() {
    return window.matchMedia("(max-width: 700px)").matches ? "mobile" : "web";
  }

  function storageKey() {
    var page = location.pathname.indexOf("/2d") === 0 ? "2d" : "3d";
    return "eleven-orb:" + page + ":" + layoutName();
  }

  function sheetOf(root) {
    return root.querySelector(".rounded-compact-sheet")
      || root.querySelector(".rounded-sheet:has(canvas)");
  }

  function zoomOf(sheet) {
    var zoom = parseFloat(getComputedStyle(sheet).zoom);
    return zoom > 0 ? zoom : 1;
  }

  function pin(sheet, x, y) {
    var box = sheet.getBoundingClientRect();
    var zoom = zoomOf(sheet);
    x = Math.min(Math.max(8, x), Math.max(8, window.innerWidth - box.width - 8));
    y = Math.min(Math.max(8, y), Math.max(8, window.innerHeight - box.height - 8));
    sheet.style.setProperty("position", "fixed", "important");
    sheet.style.setProperty("left", (x / zoom) + "px", "important");
    sheet.style.setProperty("top", (y / zoom) + "px", "important");
    sheet.style.setProperty("right", "auto", "important");
    sheet.style.setProperty("bottom", "auto", "important");
    sheet.style.setProperty("margin", "0", "important");
    return { x: x, y: y };
  }

  function restore(sheet) {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey()) || "null");
      if (!saved || typeof saved.x !== "number" || typeof saved.y !== "number") return;
      pin(sheet, saved.x, saved.y);
    } catch (error) {}
  }

  function paintScale(root) {
    if (host.getAttribute("variant") === "tiny" || root.getElementById("orb-scale")) return;
    var style = document.createElement("style");
    style.id = "orb-scale";
    style.textContent = [
      ".rounded-sheet:has(canvas) { zoom: 0.6; touch-action: none; cursor: grab; user-select: none; }",
      "@media (max-width: 700px) { .rounded-sheet:has(canvas) { zoom: 0.3333; } }"
    ].join("\n");
    root.appendChild(style);
  }

  function paintOpacity(root) {
    if (root.getElementById("orb-opacity")) return;
    var style = document.createElement("style");
    style.id = "orb-opacity";
    // The round ElevenLabs disk only. Cards, terms, and errors stay solid.
    style.textContent = ".relative.shrink-0:has(canvas) { opacity: 0.8 !important; }";
    root.appendChild(style);
  }

  function arm(sheet) {
    if (sheet.dataset.orbDrag) return;
    sheet.dataset.orbDrag = "1";
    restore(sheet);
    function move(event) {
      if (!active || event.pointerId !== active.pointer) return;
      var dx = event.clientX - active.x;
      var dy = event.clientY - active.y;
      if (!active.moved && Math.hypot(dx, dy) < 8) return;
      active.moved = true;
      pin(sheet, active.left + dx, active.top + dy);
    }
    function finish(event) {
      if (!active || event.pointerId !== active.pointer) return;
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", finish, true);
      window.removeEventListener("pointercancel", finish, true);
      if (active.moved) {
        suppressClick = true;
        var box = sheet.getBoundingClientRect();
        try {
          localStorage.setItem(storageKey(), JSON.stringify({ x: box.left, y: box.top }));
        } catch (error) {}
      }
      active = null;
    }
    sheet.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      var box = sheet.getBoundingClientRect();
      active = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: box.left,
        top: box.top,
        moved: false
      };
      window.addEventListener("pointermove", move, true);
      window.addEventListener("pointerup", finish, true);
      window.addEventListener("pointercancel", finish, true);
    });
    sheet.addEventListener("click", function (event) {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  function scan() {
    var root = host.shadowRoot;
    if (!root) return;
    paintScale(root);
    paintOpacity(root);
    var sheet = sheetOf(root);
    if (sheet) arm(sheet);
  }

  function watch() {
    scan();
    new MutationObserver(scan).observe(host.shadowRoot, { childList: true, subtree: true });
  }

  if (host.shadowRoot) watch();
  else {
    var timer = setInterval(function () {
      if (!host.shadowRoot) return;
      clearInterval(timer);
      watch();
    }, 50);
  }
})();
