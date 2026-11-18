(function () {
  var host = document.querySelector("elevenlabs-convai");
  if (!host) return;
  // The orb ramps through black, the first color, the second color, then white.
  // Color Mode uses the page red. Color off stays in steel and white.
  var on = ["#ff2020", "#c8d0d8"];
  var off = ["#8e97a3", "#f4f6f8"];

  function colorOff() {
    if (document.documentElement.dataset.colorMode) {
      return document.documentElement.dataset.colorMode === "off";
    }
    try { return localStorage.getItem("yiran-color-mode") === "off"; } catch (error) { return false; }
  }

  function apply() {
    var colors = colorOff() ? off : on;
    host.setAttribute("avatar-orb-color-1", colors[0]);
    host.setAttribute("avatar-orb-color-2", colors[1]);
  }

  apply();
  new MutationObserver(apply).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-mode"]
  });
})();
