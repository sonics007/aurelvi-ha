/* Uses actual APK renderer. Preview actions never reach the MQTT broker. */
(function () {
  "use strict";
  var demo = window.OpenPanelDemo;
  if (!demo) return;
  var configSignature = "",
    deviceSignature = "",
    lastStates = {},
    currentPage = -1;
  var prefix = "aurelvi/panel/nspanel-7tmv73";
  demo.setClient({
    prefix: prefix,
    publish: function () {
      return true;
    },
    subscribe: function () {},
    unsubscribe: function () {},
  });
  document.body.classList.add("studio-preview");
  document.getElementById("menu").disabled = true;
  document.getElementById("save").disabled = true;
  window.addEventListener("message", function (event) {
    if (
      event.source !== window.parent ||
      event.origin !== location.origin ||
      !event.data ||
      event.data.type !== "aurelvi-preview"
    )
      return;
    try {
      var data = event.data,
        config = JSON.stringify(data.config),
        device = JSON.stringify(data.device || {});
      if (config !== configSignature) {
        configSignature = config;
        demo.set(data.config, data.states || {});
        lastStates = {};
        currentPage = -1;
      } else
        Object.keys(data.states || {}).forEach(function (key) {
          var value = JSON.stringify(data.states[key]);
          if (value !== lastStates[key]) {
            lastStates[key] = value;
            demo.message(prefix + "/state/" + key, value, true);
          }
        });
      if (device !== deviceSignature) {
        deviceSignature = device;
        demo.setDevice(data.device || {});
      }
      if (data.pageIndex !== currentPage) {
        currentPage = data.pageIndex;
        demo.goPage(data.pageIndex || 0);
      }
      var page = (data.config.pages || [])[data.pageIndex || 0];
      if (page && page.type === "weather") {
        var entity = (page.weather || {}).entity,
          key = String(entity || "").replace(/[^a-z0-9]+/g, "_"),
          weather = data.states[key];
        if (weather)
          demo.message(
            prefix + "/state/weather",
            JSON.stringify(
              Object.assign(
                {
                  entity: entity,
                  condition: weather.value,
                  attributes: weather,
                  ts: Date.now(),
                },
                weather,
              ),
            ),
            true,
          );
      }
    } catch (e) {
      document.getElementById("toast").textContent =
        ((data && data.labels && data.labels.error) || "Preview") + ": " + e.message;
      document.getElementById("toast").hidden = false;
    }
  });
  if (window.parent !== window)
    window.parent.postMessage(
      { type: "aurelvi-ready" },
      location.origin === "null" ? "*" : location.origin,
    );
})();
