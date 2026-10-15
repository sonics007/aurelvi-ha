/* Own renderer and kiosk controls; uses only the integration's public protocol. */
(function () {
  "use strict";
  function uiText(en,legacy){return window.AurelviI18n?window.AurelviI18n.t(en):legacy;}
  var P = window.OpenPanelProtocol,
    N = window.OpenPanelNative,
    $ = function (id) {
      return document.getElementById(id);
    },
    client = null,
    epoch = 0,
    config = null,
    deviceCfg = {},
    states = Object.create(null),
    pageIndex = 0,
    online = false,
    lastTouch = Date.now(),
    sleeping = false,
    blanked = false,
    toastTimer,
    F = null,
    A = null,
    pointerActive = false,
    deferredRender = false;
  function read(key, fallback) {
    try {
      return (
        JSON.parse(
          N ? N.readCache(key) : localStorage.getItem("openpanel-" + key),
        ) || fallback
      );
    } catch (e) {
      return fallback;
    }
  }
  function cache(key, doc) {
    try {
      if (N) N.writeCache(key, JSON.stringify(doc));
      else localStorage.setItem("openpanel-" + key, JSON.stringify(doc));
    } catch (e) {}
  }
  function loadSettings() {
    try {
      return (
        JSON.parse(
          N ? N.loadSettings() : localStorage.getItem("openpanel-settings"),
        ) || {}
      );
    } catch (e) {
      return {};
    }
  }
  var settings = loadSettings();
  settings.url = settings.url || "ws://10.10.40.4:1884";
  settings.deviceId = settings.deviceId || "nspanel-7tmv73";
  settings.username = settings.username || "";
  settings.password = settings.password || "";
  settings.namespace = "aurelvi";
  P.setNamespace(settings.namespace);
  function toast(text) {
    $("toast").textContent = text;
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      $("toast").hidden = true;
    }, 4000);
  }
  var paths = {
    light: "M9 18h6m-5 3h4M8 13a6 6 0 1 1 8 0c-1.5 1-2 2-2 4h-4c0-2-.5-3-2-4Z",
    fan: "M12 12c-7 0-7-8-3-8 3 0 3 5 3 8Zm0 0c3-6 10-3 8 1-1 3-6 1-8-1Zm0 0c4 5-1 11-4 8-2-2 1-6 4-8Z",
    power: "M12 2v10M6 5a9 9 0 1 0 12 0",
    direction:
      "M20 7h-9a6 6 0 0 0-6 6m15-6-4-4m4 4-4 4M4 17h9a6 6 0 0 0 6-6m-15 6 4-4m-4 4 4 4",
    clock: "M12 7v5l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    weather: "M7 18a5 5 0 1 1 1-10 6 6 0 0 1 11 3 3.5 3.5 0 0 1-1 7H7Z",
    generic: "M5 5h14v14H5Z",
  };
  function glyph(name) {
    if (window.OpenPanelIcons && window.OpenPanelIcons[name]) {
      var parsed = new DOMParser().parseFromString(
        window.OpenPanelIcons[name],
        "image/svg+xml",
      ).documentElement;
      var result = document.importNode(parsed, true);
      result.setAttribute("class", "glyph");
      result.setAttribute("aria-hidden", "true");
      return result;
    }
    var key = /light|bulb|lamp/i.test(name || "")
      ? "light"
      : /fan/i.test(name || "")
        ? "fan"
        : /power|off/i.test(name || "")
          ? "power"
          : /refresh|rotate|reverse|swap|direction/i.test(name || "")
            ? "direction"
            : /clock/i.test(name || "")
              ? "clock"
              : /weather|cloud/i.test(name || "")
                ? "weather"
                : "generic";
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "glyph");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", paths[key]);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.7");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }
  function label(node, text) {
    var el = document.createElement("span");
    el.className = "label";
    el.textContent = text || "";
    node.appendChild(el);
    return el;
  }
  function content(button, icon, text, position) {
    if (position === "above") {
      label(button, text);
      button.appendChild(glyph(icon));
    } else {
      button.appendChild(glyph(icon));
      label(button, text);
    }
  }
  function visual(button, on, inset) {
    button.classList.toggle("lit", online && !!on);
    button.classList.toggle("inset", online && !!inset);
    button.setAttribute("aria-pressed", String(online && !!on));
    button.disabled = !online;
  }
  function empty(title, text, icon) {
    var box = document.createElement("div");
    box.className = "empty";
    box.appendChild(glyph(icon));
    var h = document.createElement("h1");
    h.textContent = title;
    box.appendChild(h);
    var p = document.createElement("p");
    p.textContent = text;
    box.appendChild(p);
    $("surface").appendChild(box);
  }
  function sendEvent(id, action, value, state) {
    if (!online || !client) {
      toast(uiText("Panel is not connected to MQTT","Panel nie je pripojený k MQTT"));
      return;
    }
    var page = config && config.pages[pageIndex];
    var event = P.event(id, page && page.id, action, value, state);
    if (A) A.begin(event);
    client.publish(client.prefix + "/event", event, false);
  }
  function stateOf(tile) {
    return P.stateFor(tile, states);
  }
  function gestures(button, tile, press) {
    var timer,
      long = false,
      down = false,
      lastClick = 0,
      pending,
      hasDouble = (tile.events || []).indexOf("double") >= 0;
    function start() {
      lastTouch = Date.now();
      long = false;
      down = true;
      if ((tile.events || []).indexOf("long") >= 0)
        timer = setTimeout(function () {
          long = true;
          sendEvent(tile.id, "long");
        }, 650);
    }
    function stop() {
      clearTimeout(timer);
      if (down && (tile.events || []).indexOf("release") >= 0)
        sendEvent(tile.id, "release");
      down = false;
    }
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", function () {
      clearTimeout(timer);
      down = false;
    });
    button.addEventListener("pointerleave", function () {
      clearTimeout(timer);
      down = false;
    });
    button.addEventListener("click", function () {
      if (long) {
        long = false;
        return;
      }
      if (!hasDouble) {
        press();
        return;
      }
      var now = Date.now();
      if (now - lastClick < 300) {
        clearTimeout(pending);
        lastClick = 0;
        sendEvent(tile.id, "double");
      } else {
        lastClick = now;
        pending = setTimeout(press, 300);
      }
    });
  }
  function buttonTile(tile) {
    var b = document.createElement("button"),
      state = stateOf(tile),
      choice = (tile.states || []).filter(function (v) {
        return String(v.value) === String(state.value);
      })[0];
    b.type = "button";
    b.className = "tile" + (tile.shape === "circle" ? " circle" : "");
    b.dataset.tile = tile.id;
    b.dataset.control = tile.id;
    content(
      b,
      (choice && choice.icon) || tile.icon,
      (choice && choice.label) || tile.label || tile.id,
      tile.labelPosition,
    );
    var on =
      tile.behavior === "state"
        ? !!(choice && choice.active)
        : state.on === true;
    visual(b, on, on && tile.activeMode === "inset");
    gestures(b, tile, function () {
      if (tile.behavior === "state") {
        var choices = tile.states || [],
          current = stateOf(tile).value,
          index = -1;
        choices.forEach(function (v, i) {
          if (String(v.value) === String(current)) index = i;
        });
        var next = choices[(index + 1) % choices.length];
        if (next) sendEvent(tile.id, "state", next.value);
      } else if (tile.behavior === "push") sendEvent(tile.id, "press");
      else sendEvent(tile.id, "toggle", !stateOf(tile).on);
    });
    if (tile.statusDot) {
      var rule = tile.statusDot,
        lit = rule === true;
      if (typeof rule === "object")
        lit = P.compare((states[P.entityKey(rule.entity)] || {}).value, rule);
      if (online && lit) {
        var dot = document.createElement("span");
        dot.className = "dot";
        b.appendChild(dot);
      }
    }
    return b;
  }
  function segmentBox(tile) {
    var box = document.createElement("div");
    box.className =
      "tile segments" + (tile.orientation === "vertical" ? " vertical" : "");
    return box;
  }
  function switcherTile(tile) {
    var box = segmentBox(tile);
    (tile.items || []).forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "segment";
      content(b, item.icon, item.label || item.value, tile.labelPosition);
      visual(b, String(stateOf(tile).value) === String(item.value));
      b.addEventListener("click", function () {
        sendEvent(tile.id, "state", item.value);
      });
      box.appendChild(b);
    });
    return box;
  }
  function splitTile(tile) {
    var box = segmentBox(tile);
    (tile.buttons || []).forEach(function (segment) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "segment";
      b.dataset.segment = tile.id + "." + segment.id;
      b.dataset.control = b.dataset.segment;
      content(
        b,
        segment.icon,
        segment.label || segment.id,
        segment.labelPosition,
      );
      var state = P.splitState(segment, states);
      visual(b, state === "on", state === "inset");
      b.addEventListener("click", function () {
        sendEvent(
          tile.id + "." + segment.id,
          "press",
          undefined,
          P.splitState(segment, states),
        );
      });
      box.appendChild(b);
    });
    return box;
  }
  function rockerTile(tile) {
    if (/^cover\./.test(tile.entity || "")) {
      var cover = document.createElement("div");cover.className="tile cover-rocker";
      label(cover,tile.label || tile.entity);
      [ ["↑","open"], ["■","stop"], ["↓","close"] ].forEach(function(item){
        var control=document.createElement("button");control.type="button";control.textContent=item[0];
        control.className="aur-control";control.setAttribute("aria-label",item[1]);
        control.disabled=!online || stateOf(tile).available===false;
        control.addEventListener("click",function(){sendEvent(tile.id,item[1]);});cover.appendChild(control);
      });
      return cover;
    }
    var box = segmentBox({ orientation: "vertical" });
    var rockers = tile.rockers || [
      { entity: tile.entity, label: tile.label, icon: tile.icon },
    ];
    rockers.forEach(function (rocker, index) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "segment";
      content(b, rocker.icon, rocker.label || rocker.entity);
      visual(b, (states[P.entityKey(rocker.entity)] || {}).on);
      b.addEventListener("click", function () {
        sendEvent(tile.id + "." + index, "toggle");
      });
      box.appendChild(b);
    });
    return box;
  }
  function dimmerTile(tile) {
    var box = document.createElement("div");
    box.className =
      "tile dimmer" +
      (tile.orientation === "vertical" ? " vertical" : "") +
      (tile.dimmerSurface === "raised" ? " raised" : "");
    label(box, tile.label || tile.id);
    var controls = document.createElement("div");
    controls.className = "dimmer-controls";
    var input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.step = String(tile.step || 1);
    input.value = String(Math.round((stateOf(tile).brightness || 0) * 100));
    input.setAttribute("aria-label", tile.label || "Jas");
    input.disabled = !online;
    var value = document.createElement("span");
    value.className = "hint";
    value.textContent = input.value + " %";
    function commit() {
      value.textContent = input.value + " %";
      sendEvent(tile.id, "dim", Number(input.value) / 100);
    }
    function stepButton(delta) {
      var b = document.createElement("button"),
        timer,
        held = false;
      b.type = "button";
      b.disabled = !online;
      b.setAttribute("aria-label", delta < 0 ? uiText("Decrease brightness","Znížiť jas") : uiText("Increase brightness","Zvýšiť jas"));
      b.appendChild(
        glyph(delta < 0 ? tile.iconLow || "minus" : tile.icon || "plus"),
      );
      function step() {
        input.value = String(
          Math.max(
            0,
            Math.min(100, Number(input.value) + delta * (tile.step || 5)),
          ),
        );
        commit();
      }
      b.addEventListener("pointerdown", function () {
        held = false;
        if (Number(tile.holdRepeatMs) > 0)
          timer = setInterval(
            function () {
              held = true;
              step();
            },
            Math.max(120, Number(tile.holdRepeatMs)),
          );
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (e) {
        b.addEventListener(e, function () {
          clearInterval(timer);
        });
      });
      b.addEventListener("click", function () {
        if (!held) step();
        held = false;
      });
      return b;
    }
    input.addEventListener("input", function () {
      lastTouch = Date.now();
      value.textContent = input.value + " %";
    });
    input.addEventListener("change", commit);
    if (tile.segments) {
      var marks = document.createElement("datalist");
      marks.id = "ticks-" + tile.id;
      var count = Math.min(100, Math.max(1, Number(tile.segments)));
      for (var i = 0; i <= count; i++) {
        var mark = document.createElement("option");
        mark.value = String((100 * i) / count);
        marks.appendChild(mark);
      }
      input.setAttribute("list", marks.id);
      box.appendChild(marks);
    }
    controls.appendChild(stepButton(-1));
    controls.appendChild(input);
    controls.appendChild(stepButton(1));
    box.appendChild(controls);
    box.appendChild(value);
    return box;
  }
  function clock(surface) {
    if (F) {
      F.renderClock(surface);
      return;
    }
    var now = new Date(),
      box = document.createElement("div");
    box.className = "empty";
    var time = document.createElement("div");
    time.className = "clock-time";
    time.textContent = now.toLocaleTimeString("sk-SK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: deviceCfg.clockFormat24h === false,
    });
    box.appendChild(time);
    var date = document.createElement("div");
    date.className = "clock-date";
    date.textContent = now.toLocaleDateString("sk-SK", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    box.appendChild(date);
    surface.appendChild(box);
  }
  function render() {
    if (pointerActive) {
      deferredRender = true;
      return;
    }
    if (F) F.beforeRender();
    if (A) A.beforeRender();
    var surface = $("surface");
    surface.textContent = "";
    surface.style.display = "block";
    if (config)
      pageIndex = Math.max(0, Math.min(config.pages.length - 1, pageIndex));
    $("next").hidden = !config || config.pages.length < 2;
    $("pages").textContent = config
      ? pageIndex + 1 + " / " + config.pages.length
      : "";
    if (!config) {
      $("title").textContent = "OpenPanel";
      empty(
        uiText("Ready to connect","Pripravené na pripojenie"),
        "V Aurelvi Studio pridaj panel " +
          settings.deviceId +
          uiText(" and save its page."," a ulož jeho stránku."),
        "generic",
      );
      return;
    }
    var page = config.pages[pageIndex];
    $("title").textContent = page.title || "OpenPanel";
    if (A && A.renderPage(page, surface)) return;
    if (page.type === "grid") {
      surface.style.display = "grid";
      surface.style.gridTemplateColumns =
        "repeat(" + page.grid.columns + ",minmax(0,1fr))";
      surface.style.gridTemplateRows =
        "repeat(" + page.grid.rows + ",minmax(0,1fr))";
      if (!page.tiles.length) {
        surface.style.display = "block";
        empty(
          uiText("Empty page","Prázdna stránka"),
          uiText("Add a control in Aurelvi Studio and save the configuration.","Pridaj tlačidlo v editore NSPanel Pro a ulož konfiguráciu."),
          "generic",
        );
        return;
      }
      page.tiles.forEach(function (tile) {
        var node = F && F.renderTile(tile);
        if (!node)
          node =
            tile.type === "button"
              ? buttonTile(tile)
              : tile.type === "split"
                ? splitTile(tile)
                : tile.type === "switcher"
                  ? switcherTile(tile)
                  : tile.type === "rocker"
                    ? rockerTile(tile)
                    : tile.type === "dimmer"
                      ? dimmerTile(tile)
                      : null;
        if (!node) {
          node = document.createElement("div");
          node.className = "tile unsupported";
          node.textContent = uiText("Unsupported control: ","Nepodporovaný prvok: ") + tile.type;
        }
        node.style.gridColumn = tile.col + " / span " + (tile.colSpan || 1);
        node.style.gridRow = tile.row + " / span " + (tile.rowSpan || 1);
        if (tile.entity && stateOf(tile).available === false) {
          if (node.tagName === "BUTTON") node.disabled = true;
          node
            .querySelectorAll("button,input,select")
            .forEach(function (control) {
              control.disabled = true;
            });
          node.classList.remove("lit");
        }
        surface.appendChild(node);
      });
    } else if (F && F.renderPage(page, surface)) return;
    else if (page.type === "clock") clock(surface);
    else
      empty(
        uiText("Page ","Stránka ") + page.type,
        uiText("Unknown page type.","Neznámy typ stránky."),
        page.type === "weather" ? "weather" : "generic",
      );
  }
  function brightness(value) {
    if (A) A.screen(value, !sleeping);
    if (N) N.setBrightness(Math.max(0.05, Math.min(1, Number(value) || 0.05)));
  }
  function info() {
    var doc = {
      v: 1,
      model: "NSPanel Pro / Aurelvi",
      version: "Aurelvi 0.3.7",
      deviceId: settings.deviceId,
      ts: Date.now(),
    };
    try {
      if (N) {
        var native = JSON.parse(N.getInfo());
        Object.keys(native).forEach(function (key) {
          doc[key] = native[key];
        });
      }
    } catch (e) {}
    return doc;
  }
  function safeAppSettings() {
    var out = {};
    ["githubRepo", "githubAsset", "githubAutoCheck", "haUrl", "maUrl", "weatherEntity"].forEach(function (key) {
      var value = settings[key];
      if (value === undefined) return;
      if (/Url$/.test(key)) {
        try { var u = new URL(value); if (u.username || u.password || u.search || u.hash || !/^https?:$/.test(u.protocol)) return; }
        catch (e) { return; }
      }
      out[key] = value;
    });
    return out;
  }
  function publishInfo() {
    if(window.AurelviLicence && client && client.online)client.publish(client.prefix+"/sys/licence",window.AurelviLicence.info(),false);
    if (client && online) {
      client.publish(client.prefix + "/sys/info", info(), true);
      if (settings.namespace === "aurelvi") {
        var device = {};
        ["theme", "defaultPage", "inactivityTimeout", "screensaver", "nightMode", "autoBrightness", "motion", "sysInfoIntervalS", "clock", "clockFace", "clockFormat24h", "clockTheme", "wallpaper", "clockAccent", "clockLanguage", "clockDateSize", "screensaverTheme", "proximity", "labelSize", "labelOffsetY", "iconSize"].forEach(function (key) {
          if (deviceCfg[key] !== undefined) device[key] = deviceCfg[key];
        });
        client.publish(client.prefix + "/sys/settings", {v: 1, settings: safeAppSettings(), config: config, device: device}, false);
      }
      client.publish(
        client.prefix + "/sys/awake",
        { awake: !sleeping, ts: Date.now() },
        true,
      );
    }
  }
  function wake() {
    lastTouch = Date.now();
    if (sleeping) {
      sleeping = false;
      blanked = false;
      document.body.classList.remove("screen-blanked");
      brightness(A ? A.defaultBrightness() : 1);
      render();
      publishInfo();
    }
  }
  function applyDevice(doc) {
    if(window.AurelviI18n){var languageDevice=arguments[0]||{};window.AurelviI18n.setLanguage(window.AurelviI18n.preferred(languageDevice.uiLanguage||languageDevice.clockLanguage||'en'));}

    deviceCfg = doc || {};
    var imported = deviceCfg.appSettings;
    if (imported && settings.namespace === "aurelvi") {
      var before = JSON.stringify(settings);
      ["githubRepo", "githubAsset", "githubAutoCheck", "haUrl"].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(imported, key)) settings[key] = imported[key];
      });
      if (JSON.stringify(settings) !== before) {
        if (N) N.saveSettings(JSON.stringify(settings));
        else localStorage.setItem("openpanel-settings", JSON.stringify(settings));
        if (F) F.onSettingsSaved();
      }
    }
    document.body.classList.toggle(
      "dark",
      /dark|night|carbon|deep|emerald/.test(
        deviceCfg.theme || (config && config.theme) || "",
      ),
    );
    cache("device", deviceCfg);
    if (F) F.onDevice();
    render();
  }
  function message(topic, payload, retained) {
    if (A && A.onRaw(topic, payload, retained)) return;
    if (F && F.onRaw(topic, payload, retained)) return;
    var prefix = P.base(settings.deviceId),
      doc;
    try {
      doc = JSON.parse(payload);
    } catch (e) {
      return;
    }
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) return;
    if (topic === prefix + "/config/panels") {
      try {
        var validated = P.validateConfig(doc);
        config = validated;
        cache("panels", config);
        if (Number.isInteger(deviceCfg.defaultPage))
          pageIndex = deviceCfg.defaultPage;
        if (F) F.onConfig();
        applyDevice(deviceCfg);
        $("summary").textContent = uiText("Pages received: ","Prijatých stránok: ") + config.pages.length;
      } catch (e) {
        toast(uiText("Configuration error: ","Chyba konfigurácie: ") + e.message);
      }
      return;
    }
    if (topic === prefix + "/config/device") {
      if (doc && typeof doc === "object" && !Array.isArray(doc))
        applyDevice(doc);
      return;
    }
    if (topic.indexOf(prefix + "/state/") === 0) {
      if (doc && typeof doc === "object" && !Array.isArray(doc)) {
        var key = topic.slice((prefix + "/state/").length);
        states[key] = doc;
        var handled = F && F.onState(key, doc);
        if (!sleeping && !handled) render();
      }
      return;
    }
    if (topic === settings.namespace + "/panel/discover") {
      client.publish(
        prefix + "/sys/discovery",
        Object.assign(info(), { id: doc.id }),
        false,
      );
      return;
    }
    if (topic.indexOf(prefix + "/cmd/") !== 0 || retained) return;
    var cmd = topic.slice((prefix + "/cmd/").length);
    if(window.AurelviLicence){var licenceResult=window.AurelviLicence.command(cmd,doc);if(licenceResult){client.publish(prefix+"/sys/licence",licenceResult,false);return;}}
    if (A && A.onCommand(cmd, doc)) return;
    if (F && F.onCommand(cmd, doc)) return;
    if (cmd === "ping")
      client.publish(
        prefix + "/sys/pong",
        Object.assign({}, doc, { deviceId: settings.deviceId, ts: Date.now() }),
        false,
      );
    else if (cmd === "info") publishInfo();
    else if (cmd === "wake" || cmd === "reload") {
      wake();
      render();
    } else if (cmd === "page" && config) {
      var target = doc.index !== undefined ? doc.index : doc.id,
        index =
          typeof target === "number"
            ? target
            : config.pages.findIndex(function (p) {
                return p.id === target;
              });
      if (index >= 0 && index < config.pages.length) {
        pageIndex = index;
        wake();
        render();
      }
    } else if (cmd === "screen") {
      wake();
      if (doc.action === "off") {
        sleeping = true;
        blanked = true;
        if (F) F.stopCamera();
        brightness(0.05);
        $("surface").textContent = "";
      } else if (doc.action === "dim")
        brightness(doc.brightness === undefined ? 0.3 : doc.brightness);
      publishInfo();
    }
  }
  function status(value, detail) {
    online = value === "online";
    $("status").className = online ? "online" : "";
    $("status").setAttribute(
      "aria-label",
      online ? uiText("MQTT connected","MQTT pripojené") : uiText("MQTT disconnected","MQTT odpojené"),
    );
    $("connection-detail").textContent = online
      ? uiText("MQTT connected","MQTT pripojené")
      : value === "connecting"
        ? uiText("Connecting…","Pripájam sa…")
        : detail || uiText("MQTT disconnected","MQTT odpojené");
    if (detail) toast(detail);
    if (!sleeping) render();
  }
  function connect() {
    var current = ++epoch;
    if (client) client.close();
    online = false;
    states = Object.create(null);
    try {
      client = new P.Client({
        url: settings.url,
        deviceId: settings.deviceId,
        username: settings.username,
        password: settings.password,
        status: function (v, d) {
          if (epoch === current) status(v, d);
        },
        message: function (t, p, r) {
          if (epoch === current) message(t, p, r);
        },
        connected: function () {
          publishInfo();
          if (F) F.onConnect();
        },
      });
    } catch (e) {
      status("offline", e.message);
    }
  }
  function openSettings() {
    wake();
    $("namespace").value = settings.namespace;
    $("broker").value = settings.url;
    $("device").value = settings.deviceId;
    $("username").value = settings.username;
    $("password").value = settings.password;
    if (F) F.openSettings();
    $("settings").hidden = false;
  }
  $("menu").addEventListener("click", openSettings);
  $("cancel").addEventListener("click", function () {
    $("settings").hidden = true;
  });
  $("save").addEventListener("click", function () {
    var url = $("broker").value.trim(),
      id = $("device").value.trim(),
      next;
    try {
      P.base(id);
      var parsed = new URL(url);
      if (
        (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") ||
        parsed.username ||
        parsed.password
      )
        throw Error(uiText("Use ws:// or wss:// without a password in the URL","Použi ws:// alebo wss:// bez hesla v adrese"));
      next = {
        namespace: $("namespace").value,
        url: url,
        deviceId: id,
        username: $("username").value,
        password: $("password").value,
        maPlayerId: settings.maPlayerId,
      };
      if (F) F.addSettings(next);
    } catch (e) {
      toast(e.message);
      return;
    }
    var oldId = settings.deviceId,
      oldNamespace = settings.namespace;
    settings = next;
    P.setNamespace(settings.namespace);
    try {
      if (N) {
        if (N.saveSettings(JSON.stringify(settings)) !== "OK")
          throw Error(uiText("Save failed","Uloženie zlyhalo"));
      } else
        localStorage.setItem("openpanel-settings", JSON.stringify(settings));
    } catch (e) {
      toast(uiText("Could not save settings","Nastavenie sa nepodarilo uložiť"));
      return;
    }
    if (oldId !== id) {
      config = null;
      deviceCfg = {};
      cache("panels", null);
      cache("device", {});
    }
    cache("setup-complete", true);
    $("settings").hidden = true;
    connect();
    if (F) F.onSettingsSaved();
    render();
  });
  function pageBy(delta) {
    if (config) {
      wake();
      pageIndex =
        (pageIndex + delta + config.pages.length) % config.pages.length;
      render();
    }
  }
  $("next").addEventListener("click", function () {
    pageBy(1);
  });
  var touch;
  $("main").addEventListener(
    "touchstart",
    function (e) {
      if (e.target.tagName !== "INPUT")
        touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    { passive: true },
  );
  $("main").addEventListener("touchend", function (e) {
    if (!touch) return;
    var dx = e.changedTouches[0].clientX - touch.x,
      dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      e.preventDefault();
      pageBy(dx < 0 ? 1 : -1);
    } else if (dy > 100 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      e.preventDefault();
      openSettings();
    }
    touch = null;
  });
  document.addEventListener("touchstart", wake, { passive: true });
  document.addEventListener("mousedown", wake);
  document.addEventListener("pointerdown", function () {
    pointerActive = true;
  });
  ["pointerup", "pointercancel"].forEach(function (e) {
    document.addEventListener(e, function () {
      pointerActive = false;
      setTimeout(function () {
        if (deferredRender) {
          deferredRender = false;
          render();
        }
      }, 0);
    });
  });
  window.addEventListener("beforeunload", function () {
    if (F) F.close();
    if (A) A.close();
    if (client) client.close();
  });
  setInterval(function () {
    if (!config || !$("settings").hidden) return;
    if (F) F.tick();
    var idle = (Date.now() - lastTouch) / 1000,
      timeout = Number(deviceCfg.inactivityTimeout || 0),
      defaultIndex = Number(deviceCfg.defaultPage || 0);
    if (
      timeout > 0 &&
      idle > timeout &&
      !sleeping &&
      pageIndex !== defaultIndex &&
      defaultIndex >= 0 &&
      defaultIndex < config.pages.length &&
      !(F && F.keepOnPage())
    ) {
      pageIndex = defaultIndex;
      render();
    }
    var after = Number((deviceCfg.screensaver || {}).after) || 180;
    if (
      Date.now() - lastTouch > after * 1000 &&
      !sleeping &&
      !(F && F.keepAwake()) && !(window.AurelviIntercom && window.AurelviIntercom.isBusy())
    ) {
      sleeping = true;
      blanked = false;
      if (F) F.stopCamera();
      $("surface").textContent = "";
      $("surface").style.display = "block";
      clock($("surface"));
      brightness(Number((deviceCfg.screensaver || {}).dimLevel) || 0.15);
      publishInfo();
    } else if (sleeping && !blanked) {
      var nightAfter=Number((deviceCfg.screensaver || {}).nightOffAfter || 0),hour=new Date().getHours(),night=deviceCfg.nightMode || {},start=Number(night.start===undefined?22:night.start),end=Number(night.end===undefined?7:night.end);
      var inNight=start>end ? hour>=start || hour<end : hour>=start && hour<end;
      if(nightAfter>0 && inNight && idle>after+nightAfter){blanked=true;$("surface").textContent="";document.body.classList.add("screen-blanked");brightness(.05);return;}
      $("surface").textContent = "";
      clock($("surface"));
    } else if (!sleeping && config.pages[pageIndex].type === "clock") render();
  }, 1000);
  setInterval(publishInfo, 60000);
  var featureContext = {
    P: P,
    Native: N,
    $: $,
    settings: function () {
      return settings;
    },
    config: function () {
      return config;
    },
    device: function () {
      return deviceCfg;
    },
    states: function () {
      return states;
    },
    page: function () {
      return config && config.pages[pageIndex];
    },
    client: function () {
      return client;
    },
    online: function () {
      return online;
    },
    sleeping: function () {
      return sleeping;
    },
    prefix: function () {
      return P.base(settings.deviceId);
    },
    render: render,
    publishInfo: publishInfo,
    toast: toast,
    wake: wake,
    brightness: brightness,
    send: sendEvent,
    glyph: glyph,
    openSettings: openSettings,
  };
  if (window.OpenPanelFeatureFactory)
    F = window.OpenPanelFeatureFactory.create(featureContext);
  if (window.AurelviFactory) A = window.AurelviFactory.create(featureContext);
  window.addEventListener("aurelvi-intercom-incoming",wake);
  var cached = read("panels", null);
  try {
    if (cached) config = P.validateConfig(cached);
  } catch (e) {}
  applyDevice(read("device", {}));
  if (
    location.search.indexOf("demo=1") >= 0 ||
    location.search.indexOf("studio=1") >= 0
  ) {
    window.OpenPanelDemo = {
      set: function (doc, mirrors) {
        config = P.validateConfig(doc);
        states = mirrors || Object.create(null);
        online = true;
        pageIndex = 0;
        if (F) F.onConfig();
        render();
      },
      setClient: function (c) {
        client = c;
      },
      message: message,
      disconnect: function () {
        status("offline");
      },
      render: render,
      setDevice: applyDevice,
      goPage: function (i) {
        pageIndex = i;
        render();
      },
      features: F,
      aurelvi: A,
    };
    return;
  }
  if (read("setup-complete", false)) connect();
  else openSettings();
})();
