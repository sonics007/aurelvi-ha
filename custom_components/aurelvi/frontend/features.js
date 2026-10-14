/* OpenPanel feature suite. Independently implemented against public APIs. MIT. */
(function (root) {
  "use strict";
  function node(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function button(text, fn, className) {
    var n = node("button", className || "feature-button", text);
    n.type = "button";
    n.addEventListener("click", fn);
    return n;
  }
  function httpUrl(value) {
    try {
      var u = new URL(value);
      return /^(http:|https:)$/.test(u.protocol) && !u.username && !u.password
        ? u.href
        : null;
    } catch (e) {
      return null;
    }
  }
  function topic(value) {
    return typeof value === "string" &&
      value.length > 0 &&
      value.length <= 256 &&
      !/[+#\x00]/.test(value)
      ? value
      : null;
  }
  function color(value, fallback) {
    return /^#[0-9a-f]{3,8}$/i.test(value || "") ? value : fallback;
  }
  function shade(hex, amount) {
    var n = parseInt(hex.slice(1), 16),
      a = [];
    for (var s = 16; s >= 0; s -= 8) {
      var c = (n >> s) & 255;
      a.push(
        Math.round(c + (amount > 0 ? (255 - c) * amount : c * amount))
          .toString(16)
          .padStart(2, "0"),
      );
    }
    return "#" + a.join("");
  }
  var palettes = {
    cream: ["#eee8db", "#565144"],
    creamLed: ["#eee8db", "#565144"],
    "warm-minimal": ["#eae2d3", "#514735"],
    "nordic-oak": ["#e8d8bf", "#55452e"],
    "classic-study": ["#d1bb97", "#493b28"],
    "vintage-amber": ["#dbc49a", "#5d421d"],
    japandi: ["#e2ddcc", "#555345"],
    "tech-loft": ["#dbe3e7", "#3b4e59"],
    "pop-studio": ["#efd8df", "#6c4353"],
    industrial: ["#b7bfbc", "#303c38"],
    "art-deco": ["#303936", "#e5c67a"],
    coastal: ["#d9e5e3", "#3a6469"],
    cyberpunk: ["#242337", "#cdbae8"],
    "gallery-white": ["#f0f0eb", "#494d44"],
    "scandi-night": ["#293330", "#dce6dc"],
    "moody-lounge": ["#39302e", "#eaded5"],
    terracotta: ["#e2c5b6", "#6a4636"],
    "emerald-study": ["#263b33", "#d4e4d8"],
    "deep-ocean": ["#243844", "#c4dce8"],
    "blush-boudoir": ["#ead1d3", "#715155"],
    "wood-carve": ["#d7ba92", "#60482c"],
    "hifi-90": ["#cbd0cd", "#343c37"],
    "hifi-steel": ["#d6dce0", "#424e56"],
    "rocker-white": ["#eeeae0", "#555248"],
    "paddle-decora": ["#e1e2dd", "#4f5650"],
    "walnut-brass": ["#654c3b", "#eeddb4"],
    "toggle-white": ["#f0ecdf", "#595448"],
    "neon-pill": ["#30313c", "#d7d9ef"],
    "neon-white": ["#e2e6f1", "#4a5279"],
    tech: ["#d4dce2", "#3d4e5b"],
    white: ["#f0f0eb", "#444a42"],
    techLed: ["#cad8df", "#354c5b"],
    "carbon-weave": ["#282d2b", "#e0e5dc"],
  };
  function create(ctx) {
    var N = ctx.Native,
      P = ctx.P,
      extraTopics = [],
      alarmStates = Object.create(null),
      notification = null,
      notificationQueue = [],
      notificationTimer,
      weather = null,
      weatherByEntity = Object.create(null),
      weatherPending = false,
      weatherAt = 0,
      requests = Object.create(null),
      requestId = 0;
    var cameraIndex = Object.create(null),
      cameraImage = null,
      cameraEntity = null,
      cameraSrc = "",
      cameraRepeat,
      media = { state: "idle", volume: 1, muted: false },
      clockAlarm = { enabled: false, hour: 7, minute: 0 },
      ringing = false,
      alarmPin = "";
    var maAuth = null,
      maSocket = null,
      maReady = false,
      maPending = Object.create(null),
      maSerial = 0,
      maTimer,
      maItems = [],
      maPlayers = [],
      maPlayer = "",
      maQuery = "",
      maCategory = "tracks",
      maError = "",
      maConnecting = false,
      maPath = null;
    var sensorData = {},
      motion = false,
      motionTimer,
      infoTimer,
      lastReadouts = 0,
      pendingVisual = Object.create(null),
      sendspin = null,
      deferredNotification = null,
      renderedAlarmPage = null;
    function publish(suffix, doc, retained) {
      var c = ctx.client();
      if (c && ctx.online())
        return c.publish(ctx.prefix() + "/" + suffix, doc, !!retained);
      return false;
    }
    function safeRender() {
      if (
        ctx.page() &&
        ["clock", "weather", "camera", "music", "alarm"].indexOf(
          ctx.page().type,
        ) >= 0
      )
        ctx.render();
    }
    function applyTheme(name) {
      var p = palettes[name] || palettes.cream,
        bg = p[0],
        dark = parseInt(bg.slice(1, 3), 16) < 100;
      document.body.classList.toggle("dark", dark);
      var style = document.documentElement.style;
      style.setProperty("--bg", bg);
      style.setProperty("--ink", p[1]);
      style.setProperty("--muted", dark ? "#aab5b0" : "#787363");
      style.setProperty("--led", dark ? "#90d79d" : "#318743");
      style.setProperty("--surface-hi", shade(bg, 0.12));
      style.setProperty("--surface-lo", shade(bg, -0.06));
      style.setProperty("--shadow", shade(bg, -0.15));
      style.setProperty("--highlight", shade(bg, 0.22));
      style.setProperty("--surface-border", shade(bg, -0.05));
    }
    function backendRequest(path, method, body, callback) {
      if (!N || !N.haRequest) {
        callback(null, "Home Assistant nie je pripojený");
        return;
      }
      var id = "ha-" + ++requestId;
      var timer = setTimeout(function () {
        var item = requests[id];
        if (item) {
          delete requests[id];
          item.callback(null, "Home Assistant neodpovedá");
        }
      }, 15000);
      requests[id] = { callback: callback, timer: timer };
      N.haRequest(id, path, method || "GET", JSON.stringify(body || {}));
    }
    function weatherEntity() {
      var p = ctx.page() || {},
        d = ctx.device(),
        s = ctx.settings();
      return (
        (p.weather || {}).entity ||
        d.weatherEntity ||
        (d.weather || {}).entity ||
        s.weatherEntity
      );
    }
    function refreshWeather(force) {
      var entity = weatherEntity(),
        s = ctx.settings();
      if (weatherPending || !/^weather\.[a-z0-9_]+$/i.test(entity || ""))
        return;
      if (!s.haUrl || !s.haToken) return;
      if (
        !force &&
        Date.now() - weatherAt <
          Math.max(
            30000,
            Number((ctx.device().weather || {}).refreshS || 600) * 1000,
          )
      )
        return;
      weatherPending = true;
      weatherAt = Date.now();
      backendRequest(
        "/api/states/" + encodeURIComponent(entity),
        "GET",
        {},
        function (data, error) {
          weatherPending = false;
          if (error) {
            if (!weather) weather = { error: error };
            safeRender();
            return;
          }
          weather = {
            entity: entity,
            condition: data.state,
            attributes: data.attributes || {},
            ts: Date.now(),
            forecast: [],
          };
          safeRender();
          backendRequest(
            "/api/services/weather/get_forecasts?return_response",
            "POST",
            { entity_id: entity, type: "daily" },
            function (result) {
              if (result && weather && weather.entity === entity) {
                var response = result.service_response || result;
                weather.forecast = (
                  (response[entity] || {}).forecast || []
                ).slice(0, 5);
                safeRender();
              }
            },
          );
        },
      );
    }
    var conditions = {
      sunny: "Slnečno",
      "clear-night": "Jasná noc",
      cloudy: "Zamračené",
      partlycloudy: "Polooblačno",
      rainy: "Dážď",
      pouring: "Silný dážď",
      snowy: "Sneženie",
      "snowy-rainy": "Dážď so snehom",
      fog: "Hmla",
      windy: "Veterno",
      lightning: "Búrka",
      "lightning-rainy": "Búrka s dažďom",
      exceptional: "Neobvyklé počasie",
    };
    function renderWeather(surface) {
      var entity = weatherEntity();
      if (weatherByEntity[entity]) weather = weatherByEntity[entity];
      else if (weather && weather.entity && weather.entity !== entity)
        weather = null;
      var box = node("div", "weather-page");
      surface.appendChild(box);
      if (!weather || weather.error) {
        box.appendChild(ctx.glyph("weather"));
        box.appendChild(
          node(
            "h2",
            "",
            (weather && weather.error) || "Počasie nie je nastavené",
          ),
        );
        box.appendChild(
          node(
            "p",
            "hint",
            "V nastaveniach panela zadaj adresu a token Home Assistanta a entitu weather.…, alebo použi MQTT prepojenie z balíka.",
          ),
        );
        box.appendChild(button("Nastavenia", ctx.openSettings));
        refreshWeather(false);
        return;
      }
      var a = weather.attributes || weather,
        temperature =
          a.temperature !== undefined ? a.temperature : weather.temperature;
      box.appendChild(ctx.glyph("weather"));
      box.appendChild(
        node(
          "div",
          "weather-temp",
          temperature === undefined
            ? "—"
            : Math.round(Number(temperature)) + (a.temperature_unit || "°C"),
        ),
      );
      box.appendChild(
        node(
          "h2",
          "weather-condition",
          conditions[weather.condition] || weather.condition || "Počasie",
        ),
      );
      var details = [];
      if (a.humidity !== undefined)
        details.push("Vlhkosť " + a.humidity + " %");
      if (a.wind_speed !== undefined)
        details.push(
          "Vietor " + a.wind_speed + " " + (a.wind_speed_unit || ""),
        );
      box.appendChild(node("p", "hint", details.join(" · ")));
      var forecast = node("div", "forecast-row");
      (weather.forecast || []).slice(0, 5).forEach(function (f) {
        var card = node("div", "forecast-day"),
          date = new Date(f.datetime);
        card.appendChild(
          node(
            "span",
            "",
            isNaN(date.getTime())
              ? ""
              : date.toLocaleDateString("sk-SK", { weekday: "short" }),
          ),
        );
        card.appendChild(ctx.glyph("weather"));
        card.appendChild(
          node(
            "strong",
            "",
            String(
              f.temperature === undefined ? "—" : Math.round(f.temperature),
            ) + "°",
          ),
        );
        if (f.templow !== undefined)
          card.appendChild(node("small", "hint", Math.round(f.templow) + "°"));
        forecast.appendChild(card);
      });
      box.appendChild(forecast);
      var refresh = button("Obnoviť", function () {
        refreshWeather(true);
      });
      box.appendChild(refresh);
      box.appendChild(
        node(
          "small",
          "hint",
          "Aktualizované " +
            new Date(weather.ts || Date.now()).toLocaleTimeString("sk-SK", {
              hour: "2-digit",
              minute: "2-digit",
            }),
        ),
      );
      refreshWeather(false);
    }
    function svgElement(tag, attrs) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.keys(attrs).forEach(function (k) {
        e.setAttribute(k, String(attrs[k]));
      });
      return e;
    }
    function renderClock(surface) {
      var d = ctx.device(),
        box = node("div", "clock-page"),
        now = new Date();
      surface.appendChild(box);
      var clockTheme = ctx.sleeping() ? (d.screensaverTheme || d.clockTheme) : d.clockTheme;
      var locale = d.clockLanguage || "en-GB";
      if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)) locale="en-GB";
      var clockSkin=(window.AurelviSkins || []).find(function(item){return item.id===clockTheme;});
      if(clockSkin){box.style.background=clockSkin.bg;box.style.color=clockSkin.ink;box.style.setProperty("--ink",clockSkin.ink);box.style.setProperty("--bg",clockSkin.bg);}
      box.style.setProperty("--clock-date-size",Math.max(8,Math.min(32,Number(d.clockDateSize)||13))+"px");
      if (clockTheme && clockTheme !== "match-app" && clockTheme !== "custom")
        box.dataset.clockTheme=clockTheme;
      if (d.clockAppearance === "dark") box.classList.add("clock-dark");
      box.style.setProperty("--clock-accent", color(d.clockAccent, "#318743"));
      if (d.clockFace === "analog") {
        var svg = svgElement("svg", {
          viewBox: "0 0 240 240",
          class: "analog-clock",
          "aria-label": now.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        svg.appendChild(
          svgElement("circle", {
            cx: 120,
            cy: 120,
            r: 110,
            class: "clock-face",
          }),
        );
        for (var i = 0; i < 12; i++) {
          var angle = (i * Math.PI) / 6;
          svg.appendChild(
            svgElement("line", {
              x1: 120 + 91 * Math.sin(angle),
              y1: 120 - 91 * Math.cos(angle),
              x2: 120 + 99 * Math.sin(angle),
              y2: 120 - 99 * Math.cos(angle),
              class: "clock-mark",
            }),
          );
        }
        function hand(degrees, length, width, className) {
          var angle = (degrees * Math.PI) / 180;
          svg.appendChild(
            svgElement("line", {
              x1: 120,
              y1: 120,
              x2: 120 + length * Math.sin(angle),
              y2: 120 - length * Math.cos(angle),
              "stroke-width": width,
              class: className,
              "stroke-linecap": "round",
            }),
          );
        }
        hand(
          (now.getHours() % 12) * 30 + now.getMinutes() / 2,
          56,
          6,
          "clock-hand",
        );
        hand(now.getMinutes() * 6 + now.getSeconds() / 10, 82, 4, "clock-hand");
        hand(now.getSeconds() * 6, 89, 2, "clock-second");
        svg.appendChild(
          svgElement("circle", {
            cx: 120,
            cy: 120,
            r: 5,
            class: "clock-center",
          }),
        );
        box.appendChild(svg);
      } else
        box.appendChild(
          node(
            "div",
            "clock-time",
            now.toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: d.clockFormat24h === false,
            }),
          ),
        );
      box.appendChild(
        node(
          "div",
          "clock-date",
          now.toLocaleDateString(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
        ),
      );
      box.appendChild(
        button(
          clockAlarm.enabled
            ? "Budík " +
                String(clockAlarm.hour).padStart(2, "0") +
                ":" +
                String(clockAlarm.minute).padStart(2, "0")
            : "Nastaviť budík",
          openAlarmEditor,
          "feature-button clock-alarm-button",
        ),
      );
    }
    var alarmPreviewAudio=null;
    function stopAlarmPreview(){
      if(N && N.stopAlarmPreview)N.stopAlarmPreview();
      if(alarmPreviewAudio){alarmPreviewAudio.pause();alarmPreviewAudio=null;}
    }
    function openAlarmEditor() {
      stopAlarmPreview();
      var old = document.getElementById("clock-alarm-editor");
      if (old) old.remove();
      var box = node("section", "feature-overlay");
      box.id = "clock-alarm-editor";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Budík");
      box.appendChild(node("h1", "", "Budík"));
      var time = node("input");time.type = "time";time.id = "alarm-editor-time";
      time.value = String(clockAlarm.hour === undefined ? 7 : clockAlarm.hour).padStart(2,"0")+":"+String(clockAlarm.minute || 0).padStart(2,"0");
      time.setAttribute("aria-label", "Čas budíka");box.appendChild(time);
      var label = node("label", "alarm-enabled"), enabled = node("input");
      enabled.type = "checkbox";enabled.checked = !!clockAlarm.enabled;enabled.id="alarm-editor-enabled";
      label.appendChild(enabled);label.appendChild(node("span", "", "Budík zapnutý"));box.appendChild(label);
      var toneLabel=node("label","", "Tón budíka"),tone=node("select","feature-input");tone.id="alarm-editor-tone";
      [["birds","Ranné vtáčiky"],["dawn","Pokojné ráno"],["chimes","Jemné zvončeky"],["classic","Klasické pípanie"]].forEach(function(item){var option=node("option","",item[1]);option.value=item[0];tone.appendChild(option);});
      tone.value=clockAlarm.tone || "classic";toneLabel.appendChild(tone);box.appendChild(toneLabel);
      var volumeLabel=node("label","", "Hlasitosť tónu"),volume=node("input");volume.type="range";volume.min="0";volume.max="100";volume.id="alarm-editor-volume";volume.value=clockAlarm.volume===undefined?80:clockAlarm.volume;
      var volumeValue=node("span","",volume.value+" %");volumeLabel.appendChild(volumeValue);volumeLabel.appendChild(volume);volume.addEventListener("input",function(){volumeValue.textContent=volume.value+" %";});box.appendChild(volumeLabel);
      var fadeLabel=node("label","alarm-enabled"),fade=node("input");fade.type="checkbox";fade.id="alarm-editor-fade";fade.checked=!!clockAlarm.fadeIn;fadeLabel.appendChild(fade);fadeLabel.appendChild(node("span","","Postupné zosilnenie (30 s)"));box.appendChild(fadeLabel);
      var previewRow=node("div","row");
      previewRow.appendChild(button("Vypočuť tón",function(){stopAlarmPreview();if(N && N.previewAlarm)N.previewAlarm(tone.value,Number(volume.value));else{var file={birds:"alarm-birds.wav",dawn:"alarm-dawn.wav",chimes:"alarm-chimes.wav",classic:"alarm_beep.wav"}[tone.value];alarmPreviewAudio=new Audio("sounds/"+file);alarmPreviewAudio.volume=Number(volume.value)/100;var result=alarmPreviewAudio.play();if(result && result.catch)result.catch(function(){ctx.toast("Ukážku sa nepodarilo prehrať");});}}));
      previewRow.appendChild(button("Zastaviť ukážku",stopAlarmPreview));box.appendChild(previewRow);
      tone.addEventListener("change",stopAlarmPreview);
      var row = node("div", "row");
      row.appendChild(button("Späť", function(){stopAlarmPreview();box.remove();}));
      row.appendChild(button("Uložiť budík", function(){
        if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time.value)) {ctx.toast("Zadaj platný čas");return;}
        var parts=time.value.split(":"), cfg={enabled:enabled.checked,hour:Number(parts[0]),minute:Number(parts[1]),tone:tone.value,volume:Number(volume.value),fadeIn:fade.checked};
        if (N && N.setAlarmClock) {
          var result=N.setAlarmClock(JSON.stringify(cfg));
          if(result!=="OK"){ctx.toast(result);return;}
        }
        stopAlarmPreview();clockAlarm=cfg;publish("sys/alarm",cfg,true);box.remove();ctx.render();ctx.toast("Budík uložený");
      }));
      box.appendChild(row);document.body.appendChild(box);
    }
    function currentCamera(page) {
      var cameras = (page.camera || {}).cameras || [],
        index = cameraIndex[page.id] || 0;
      return cameras[Math.min(index, cameras.length - 1)];
    }
    function stopCamera() {
      clearInterval(cameraRepeat);
      if (cameraImage) {
        cameraImage.removeAttribute("src");
        cameraImage = null;
      }
      cameraEntity = null;
      cameraSrc = "";
    }
    function updateCamera() {
      var p = ctx.page(),
        cam = p && p.type === "camera" && currentCamera(p);
      if (!cam || !cameraImage) return;
      var mirrored = ctx.states()[P.entityKey(cam.entity)] || {},
        url = httpUrl(mirrored.stream || "");
      if (url && url !== cameraSrc) {
        cameraSrc = url;
        cameraImage.src = url;
      } else if (!url) {
        cameraImage.removeAttribute("src");
        cameraSrc = "";
      }
    }
    function renderCamera(page, surface) {
      var cfg = page.camera || {},
        cameras = cfg.cameras || [],
        cam = currentCamera(page),
        box = node("div", "camera-page");
      surface.appendChild(box);
      if (!cam) {
        box.appendChild(node("p", "", "Pridaj kameru v editore."));
        return;
      }
      var select = node("select", "feature-input");
      cameras.forEach(function (c, i) {
        var option = node("option", "", c.name || c.entity);
        option.value = String(i);
        select.appendChild(option);
      });
      select.value = String(cameraIndex[page.id] || 0);
      select.addEventListener("change", function () {
        cameraIndex[page.id] = Number(select.value);
        ctx.render();
      });
      box.appendChild(select);
      var stage = node("div", "camera-stage");
      var image = node("img", "camera-stream");
      image.alt = cam.name || cam.entity;
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", function () {
        stage.classList.add("camera-failed");
      });
      var fallback = node("div", "camera-fallback", "Čakám na stream kamery…");
      stage.appendChild(image);
      stage.appendChild(fallback);
      image.addEventListener("load", function () {
        stage.classList.remove("camera-failed");
        fallback.hidden = true;
      });
      box.appendChild(stage);
      cameraImage = image;
      cameraEntity = cam.entity;
      updateCamera();
      var pad = node("div", "ptz-pad"),
        directions = [
          ["up", "↑"],
          ["left", "←"],
          ["right", "→"],
          ["down", "↓"],
        ];
      directions.forEach(function (entry) {
        var dir = entry[0],
          id = page.id + ".ptz." + P.entityKey(cam.entity) + "." + dir;
        var b = button(
          entry[1],
          function () {
            ctx.send(id, "press");
          },
          "feature-button ptz-" + dir,
        );
        b.setAttribute("aria-label", dir);
        b.disabled = !ctx.online() || !(cam.ptz || {})[dir];
        var repeat = Number(
          cfg.holdRepeatMs === undefined ? 400 : cfg.holdRepeatMs,
        );
        b.addEventListener("pointerdown", function () {
          if (b.disabled || repeat <= 0) return;
          clearInterval(cameraRepeat);
          cameraRepeat = setInterval(
            function () {
              ctx.send(id, "press");
            },
            Math.max(150, repeat),
          );
        });
        ["pointerup", "pointercancel", "pointerleave"].forEach(function (e) {
          b.addEventListener(e, function () {
            clearInterval(cameraRepeat);
          });
        });
        pad.appendChild(b);
      });
      box.appendChild(pad);
    }
    function alarmConfig(page) {
      return page.alarm || {};
    }
    function alarmState(page) {
      return (
        alarmStates[alarmConfig(page).stateTopic || "alarmo/state"] || "unknown"
      );
    }
    var alarmLabels = {
      disarmed: "Vypnutý",
      armed_home: "Stráženie doma",
      armed_away: "Stráženie mimo domu",
      armed_night: "Nočný režim",
      arming: "Zapína sa",
      pending: "Čas na vypnutie",
      triggered: "POPLACH",
      unavailable: "Nedostupný",
      unknown: "Čakám na stav",
    };
    function syncAlarmDisplay() {
      var page = renderedAlarmPage || ctx.page(),
        state = page && page.type === "alarm" ? alarmState(page) : "unknown";
      var label = document.getElementById("alarm-state");
      if (label) {
        label.textContent = alarmLabels[state] || state;
        label.classList.toggle("alarm-triggered", state === "triggered");
      }
      var pin = document.getElementById("alarm-pin");
      if (pin) pin.value = alarmPin;
    }
    function alarmAction(page, action) {
      if (!ctx.online()) {
        ctx.toast("MQTT je odpojené");
        return;
      }
      var cfg = alarmConfig(page),
        cmdTopic = topic(cfg.commandTopic || "alarmo/command");
      if (!cmdTopic) return;
      var requires = action === "disarm" || cfg.codeArmRequired !== false;
      if (requires && !alarmPin) {
        ctx.toast("Zadaj PIN");
        return;
      }
      var body = { command: action };
      if (alarmPin) body.code = alarmPin;
      if (cfg.area) body.area = cfg.area;
      ctx.client().publish(cmdTopic, body, false);
      alarmPin = "";
      syncAlarmDisplay();
    }
    function renderAlarm(page, surface) {
      renderedAlarmPage = page;
      var box = node("div", "alarm-page"),
        state = node("strong", "alarm-state");
      state.id = "alarm-state";
      box.appendChild(state);
      var pin = node("input", "feature-input alarm-pin");
      pin.id = "alarm-pin";
      pin.type = "password";
      pin.readOnly = true;
      pin.setAttribute("aria-label", "PIN alarmu");
      pin.autocomplete = "off";
      box.appendChild(pin);
      var keypad = node("div", "alarm-keypad");
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "C"].forEach(
        function (value) {
          keypad.appendChild(
            button(
              value,
              function () {
                if (value === "C") alarmPin = "";
                else if (value === "⌫") alarmPin = alarmPin.slice(0, -1);
                else if (alarmPin.length < 12) alarmPin += value;
                syncAlarmDisplay();
              },
              "feature-button",
            ),
          );
        },
      );
      box.appendChild(keypad);
      var actions = node("div", "feature-row");
      (
        (page.alarm && page.alarm.actions) || ["arm_home", "arm_away", "disarm"]
      ).forEach(function (action) {
        var b = button(
          { arm_home: "Doma", arm_away: "Odísť", disarm: "Vypnúť" }[action] ||
            action,
          function () {
            alarmAction(page, action);
          },
        );
        b.disabled = !ctx.online();
        actions.appendChild(b);
      });
      box.appendChild(actions);
      surface.appendChild(box);
      syncAlarmDisplay();
    }
    function alarmTopics() {
      var list = [];
      ((ctx.config() && ctx.config().pages) || []).forEach(function (page) {
        if (page.type !== "alarm") return;
        var cfg = page.alarm || {};
        [
          cfg.stateTopic || "alarmo/state",
          cfg.eventTopic || "alarmo/event",
        ].forEach(function (t) {
          if (topic(t) && list.indexOf(t) < 0) list.push(t);
        });
      });
      return list;
    }
    function subscribeAlarms() {
      var c = ctx.client();
      if (!c || !ctx.online()) return;
      var next = alarmTopics(),
        removed = extraTopics.filter(function (t) {
          return next.indexOf(t) < 0;
        });
      if (removed.length && c.unsubscribe) c.unsubscribe(removed);
      var added = next.filter(function (t) {
        return extraTopics.indexOf(t) < 0;
      });
      if (added.length) c.subscribe(added);
      extraTopics = next;
    }
    function notificationState(doc) {
      publish("sys/notification", doc, true);
    }
    function closeNotification(status, actionId) {
      if (!notification) return;
      clearTimeout(notificationTimer);
      var old = notification;
      notification = null;
      var overlay = document.getElementById("notification-overlay");
      if (overlay) overlay.remove();
      var result = { id: old.id, status: status, ts: Date.now() };
      if (actionId) result.actionId = actionId;
      publish("sys/notification", result, false);
      notificationState({});
      if (notificationQueue.length) showNotification(notificationQueue.shift());
    }
    function priority(doc) {
      return doc.priority === "high" ||
        (doc.priority === undefined && doc.level === "error")
        ? 1
        : 0;
    }
    function showNotification(doc) {
      doc = Object.assign({}, doc);
      doc.id = doc.id || "local-" + Date.now();
      if (!priority(doc) && ctx.sleeping()) {
        deferredNotification = doc;
        return;
      }
      if (notification) {
        if (priority(doc) < priority(notification)) {
          if (notificationQueue.length < 10) notificationQueue.push(doc);
          return;
        }
        notificationQueue = [];
        closeNotification("dismissed");
      }
      notification = doc;
      if (priority(doc)) ctx.wake();
      var overlay = node(
        "section",
        "feature-overlay notification-overlay" +
          (priority(doc) ? "" : " notification-banner"),
      );
      overlay.id = "notification-overlay";
      overlay.dataset.level = ["info","success","warning","error"].indexOf(doc.level)>=0 ? doc.level : "info";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-label", doc.title || "Oznámenie");
      var close = button(
        "×",
        function () {
          closeNotification("dismissed");
        },
        "overlay-close",
      );
      overlay.appendChild(close);
      overlay.appendChild(ctx.glyph(doc.icon || "bell"));
      overlay.appendChild(node("h2", "", doc.title || "Oznámenie"));
      var imageUrl = httpUrl(doc.image || "");
      if (imageUrl) {
        var image = node("img", "notification-image");
        image.src = imageUrl;
        image.alt = "";
        image.referrerPolicy = "no-referrer";
        overlay.appendChild(image);
      }
      overlay.appendChild(node("p", "notification-message", doc.message || ""));
      var actions = node("div", "feature-row");
      (doc.actions || []).slice(0, 3).forEach(function (action) {
        if (typeof action === "string") action = { id: action, label: action };
        actions.appendChild(
          button(action.label || action.id, function () {
            closeNotification("action", action.id);
          }),
        );
      });
      if (!actions.children.length)
        actions.appendChild(
          button("Zavrieť", function () {
            closeNotification("dismissed");
          }),
        );
      overlay.appendChild(actions);
      document.body.appendChild(overlay);
      notificationState(
        Object.assign({}, doc, { status: "shown", ts: Date.now() }),
      );
      if (doc.speak && N && N.speak) N.speak(String(doc.speak).slice(0,2000));
      else if (doc.sound)
        playMedia({
          action: "play",
          url: httpUrl(doc.sound) || undefined,
          asset: httpUrl(doc.sound) ? undefined : doc.sound,
          title: doc.title || "Oznámenie",
        });
      var timeout = doc.timeoutS === undefined ? 30 : Number(doc.timeoutS);
      if (timeout > 0)
        notificationTimer = setTimeout(
          function () {
            closeNotification("expired");
          },
          Math.min(86400, timeout) * 1000,
        );
    }
    function playMedia(cmd) {
      if (N && N.mediaCommand) N.mediaCommand(JSON.stringify(cmd));
      else ctx.toast("Natívny zvuk je dostupný na paneli");
    }
    function clockAlarmFired() {
      ringing = true;
      ctx.wake();
      ctx.send("alarm", "alarm_fired");
      var old = document.getElementById("clock-alarm-overlay");
      if (old) old.remove();
      var box = node("section", "feature-overlay clock-alarm-overlay");
      box.id = "clock-alarm-overlay";
      box.setAttribute("role", "dialog");
      box.appendChild(ctx.glyph("clock"));
      box.appendChild(node("h1", "", "Budík"));
      box.appendChild(
        button("Odložiť o 5 minút", function () {
          ringing = false;
          if (N && N.snoozeAlarm) N.snoozeAlarm();
          box.remove();
        }),
      );
      box.appendChild(
        button("Vypnúť", function () {
          ringing = false;
          if (N && N.dismissAlarm) N.dismissAlarm();
          box.remove();
        }),
      );
      document.body.appendChild(box);
    }
    function requestMA(command, args, callback) {
      if (!maSocket || maSocket.readyState !== 1) {
        if (callback) callback(null, "Music Assistant nie je pripojený");
        return;
      }
      var id = "ma-" + ++maSerial,
        timer = setTimeout(function () {
          var item = maPending[id];
          if (item) {
            delete maPending[id];
            item.callback(null, "Music Assistant neodpovedá");
          }
        }, 12000);
      maPending[id] = { callback: callback || function () {}, timer: timer };
      maSocket.send(
        JSON.stringify({ message_id: id, command: command, args: args || {} }),
      );
    }
    function maConfig() {
      var s = ctx.settings(),
        d = ctx.device().musicAssistant || {};
      return {
        url: s.maUrl || (maAuth && maAuth.url) || d.url,
        token: s.maToken || (maAuth && maAuth.token),
        username: maAuth && maAuth.username,
        password: maAuth && maAuth.password,
        enabled: d.enabled !== false,
      };
    }
    function closeMA() {
      if (sendspin) {
        sendspin.disconnect();
        sendspin = null;
      }
      if (sendspinSocket) {
        sendspinSocket.close();
        sendspinSocket = null;
      }
      clearTimeout(maTimer);
      if (maSocket) {
        var socket = maSocket;
        maSocket = null;
        socket.onclose = null;
        socket.close();
      }
      maReady = false;
      maConnecting = false;
      Object.keys(maPending).forEach(function (id) {
        clearTimeout(maPending[id].timer);
      });
      maPending = Object.create(null);
    }
    function loadMA() {
      if (!maReady) return;
      requestMA(
        "players/all",
        { return_unavailable: false },
        function (data, error) {
          if (data) {
            maPlayers = Array.isArray(data) ? data : data.items || [];
            if (!maPlayer) {
              maPlayer =
                ctx.settings().maPlayerId ||
                (
                  maPlayers.filter(function (p) {
                    return (
                      String(p.player_id || "").indexOf(
                        ctx.settings().deviceId,
                      ) >= 0
                    );
                  })[0] ||
                  maPlayers[0] ||
                  {}
                ).player_id ||
                "";
            }
            loadMusic();
          } else {
            maError = error;
            safeRender();
          }
        },
      );
    }
    function connectMA() {
      var cfg = maConfig();
      if (!cfg.enabled || !httpUrl(cfg.url || "")) return;
      if (maSocket && (maSocket.readyState === 0 || maSocket.readyState === 1))
        return;
      maConnecting = true;
      maError = "";
      var url = new URL(cfg.url);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      url.pathname = url.pathname.replace(/\/$/, "") + "/ws";
      url.search = "";
      maSocket = new WebSocket(url.href);
      maSocket.onopen = function () {
        function done(data, error) {
          maConnecting = false;
          if (error) {
            maError = error;
            safeRender();
            return;
          }
          maReady = true;
          loadMA();
          maAuth = Object.assign({}, maAuth || {}, cfg);
        }
        if (cfg.token) requestMA("auth", { token: cfg.token }, done);
        else if (cfg.username)
          requestMA(
            "auth/login",
            {
              username: cfg.username,
              password: cfg.password || "",
              device_name: "OpenPanel",
            },
            function (data, error) {
              if (error) {
                done(null, error);
                return;
              }
              var token = data && (data.access_token || data.token);
              if (token) {
                cfg.token = token;
                requestMA("auth", { token: token }, done);
              } else done(data);
            },
          );
        else done({});
      };
      maSocket.onmessage = function (e) {
        var data;
        try {
          data = JSON.parse(e.data);
        } catch (error) {
          return;
        }
        var id = data.message_id,
          item = id && maPending[id];
        if (item) {
          if (data.partial) return;
          clearTimeout(item.timer);
          delete maPending[id];
          if (data.error_code !== undefined || data.error)
            item.callback(
              null,
              data.details || data.error || "Chyba Music Assistanta",
            );
          else item.callback(data.result === undefined ? data : data.result);
        } else if (data.event && ctx.page() && ctx.page().type === "music") {
          var current = maPlayers.filter(function (p) {
            return p.player_id === maPlayer;
          })[0];
          if (data.data && current && data.data.player_id === maPlayer) {
            Object.assign(current, data.data);
            updateMediaLabels();
          }
        }
      };
      maSocket.onerror = function () {
        maError = "Spojenie s Music Assistantom zlyhalo";
        maConnecting = false;
      };
      maSocket.onclose = function () {
        maSocket = null;
        maReady = false;
        maConnecting = false;
        safeRender();
        maTimer = setTimeout(function () {
          if ((ctx.device().musicAssistant || {}).enabled) connectMA();
        }, 10000);
      };
    }
    function loadMusic() {
      if (!maReady) return;
      var command, args;
      if (maQuery) {
        command = "music/search";
        args = {
          search_query: maQuery,
          limit: 20,
          media_types: ["track", "album", "playlist", "radio"],
        };
      } else if (maCategory === "browse") {
        command = "music/browse";
        args = { path: maPath || "root", player_id: maPlayer || undefined };
      } else {
        command = "music/library/" + maCategory;
        args = { limit: 30, offset: 0, order_by: "name" };
      }
      var query = maQuery;
      requestMA(command, args, function (data, error) {
        if (query !== maQuery) return;
        if (error) {
          maError = error;
          maItems = [];
        } else {
          maError = "";
          if (Array.isArray(data)) maItems = data;
          else if (data && Array.isArray(data.items)) maItems = data.items;
          else {
            maItems = [];
            ["tracks", "albums", "playlists", "radio"].forEach(function (key) {
              if (data && Array.isArray(data[key]))
                maItems = maItems.concat(data[key]);
            });
          }
        }
        if (ctx.page() && ctx.page().type === "music") ctx.render();
      });
    }
    function queueCommand(command, args) {
      if (!maPlayer) {
        ctx.toast("Vyber prehrávač");
        return;
      }
      requestMA(
        command,
        Object.assign({ queue_id: maPlayer }, args || {}),
        function (data, error) {
          if (error) ctx.toast(error);
        },
      );
    }
    function updateMediaLabels() {
      var title = document.getElementById("media-title"),
        current = maPlayers.filter(function (p) {
          return p.player_id === maPlayer;
        })[0],
        name = media.title || media.asset || "Žiadna skladba";
      if (current && current.current_media)
        name =
          current.current_media.title || current.current_media.name || name;
      if (title) title.textContent = name;
      var state = document.getElementById("media-state");
      if (state)
        state.textContent =
          {
            playing: "Prehráva sa",
            paused: "Pozastavené",
            buffering: "Načítava sa",
            idle: "Zastavené",
          }[media.state] || media.state;
    }
    function renderMusic(surface) {
      var box = node("div", "music-page");
      surface.appendChild(box);
      var title = node("strong", "media-title");
      title.id = "media-title";
      box.appendChild(title);
      var status = node("small", "hint");
      status.id = "media-state";
      box.appendChild(status);
      var controls = node("div", "feature-row");
      [
        [
          "‹",
          function () {
            queueCommand("player_queues/previous");
          },
        ],
        [
          "▶ / Ⅱ",
          function () {
            if (maReady && maPlayer) queueCommand("player_queues/play_pause");
            else
              playMedia({
                action: media.state === "playing" ? "pause" : "resume",
              });
          },
        ],
        [
          "■",
          function () {
            if (maReady && maPlayer) queueCommand("player_queues/stop");
            else playMedia({ action: "stop" });
          },
        ],
        [
          "›",
          function () {
            queueCommand("player_queues/next");
          },
        ],
      ].forEach(function (item) {
        controls.appendChild(button(item[0], item[1]));
      });
      box.appendChild(controls);
      var volume = node("input", "feature-range");
      volume.type = "range";
      volume.min = "0";
      volume.max = "100";
      volume.value = String(
        Math.round((media.volume === undefined ? 1 : media.volume) * 100),
      );
      volume.setAttribute("aria-label", "Hlasitosť");
      volume.addEventListener("change", function () {
        if (maReady && maPlayer)
          requestMA(
            "players/cmd/volume_set",
            { player_id: maPlayer, volume_level: Number(volume.value) },
            function (data, error) {
              if (error) ctx.toast(error);
            },
          );
        else
          playMedia({ action: "volume", volume: Number(volume.value) / 100 });
      });
      box.appendChild(volume);
      if (maPlayers.length) {
        var select = node("select", "feature-input");
        maPlayers.forEach(function (p) {
          var option = node(
            "option",
            "",
            p.display_name || p.name || p.player_id,
          );
          option.value = p.player_id;
          select.appendChild(option);
        });
        select.value = maPlayer;
        select.addEventListener("change", function () {
          maPlayer = select.value;
          ctx.settings().maPlayerId = maPlayer;
          updateMediaLabels();
        });
        box.appendChild(select);
      }
      if (!httpUrl(maConfig().url || "")) {
        box.appendChild(
          node(
            "p",
            "hint",
            "Pre knižnicu nastav Music Assistant server a token. Zvuk a TTS z Home Assistanta fungujú aj bez neho.",
          ),
        );
        box.appendChild(button("Nastavenia", ctx.openSettings));
        updateMediaLabels();
        return;
      }
      box.appendChild(
        button("Zapnúť reproduktor panela", function () {
          if (sendspin && sendspin.unlock)
            Promise.resolve(sendspin.unlock()).catch(function () {
              ctx.toast("Zvuk sa nepodarilo odomknúť");
            });
          else {
            startSendspin(maConfig());
            ctx.toast("Pripájam reproduktor; po pripojení stlač znova");
          }
        }),
      );
      var search = node("input", "feature-input");
      search.placeholder = "Hľadať skladbu, album alebo rádio";
      search.value = maQuery;
      var debounce;
      search.addEventListener("input", function () {
        maQuery = search.value;
        clearTimeout(debounce);
        debounce = setTimeout(loadMusic, 400);
      });
      box.appendChild(search);
      var tabs = node("div", "music-tabs");
      [
        ["tracks", "Skladby"],
        ["albums", "Albumy"],
        ["playlists", "Playlisty"],
        ["radio", "Rádiá"],
        ["browse", "Zdroje"],
      ].forEach(function (item) {
        tabs.appendChild(
          button(
            item[1],
            function () {
              maCategory = item[0];
              maQuery = "";
              maPath = null;
              loadMusic();
            },
            "feature-button" + (maCategory === item[0] ? " selected" : ""),
          ),
        );
      });
      box.appendChild(tabs);
      var list = node("div", "music-list");
      maItems.slice(0, 40).forEach(function (item) {
        var b = button(
          item.name || item.title || item.uri || "Položka",
          function () {
            if (item.media_type === "folder" || item.path) {
              maCategory = "browse";
              maPath = item.path || item.uri;
              maQuery = "";
              loadMusic();
            } else if (maPlayer)
              queueCommand("player_queues/play_media", {
                media: item.uri || item,
              });
            else ctx.toast("Vyber prehrávač");
          },
          "music-item",
        );
        list.appendChild(b);
      });
      box.appendChild(list);
      if (maError) box.appendChild(node("small", "hint", maError));
      else if (!maReady)
        box.appendChild(
          node(
            "small",
            "hint",
            maConnecting
              ? "Pripájam Music Assistant…"
              : "Čakám na Music Assistant",
          ),
        );
      updateMediaLabels();
      connectMA();
    }
    var sendspinLoading = false,
      sendspinSocket = null;
    function startSendspin(cfg) {
      if (sendspin || sendspinSocket || !cfg.token) return;
      if (!root.SendspinSdk) {
        if (sendspinLoading) return;
        if (!root.AudioContext || !root.BigInt) {
          ctx.toast("Sendspin vyžaduje novší Android WebView");
          return;
        }
        sendspinLoading = true;
        var script = document.createElement("script");
        script.src = "sendspin.js";
        script.onload = function () {
          sendspinLoading = false;
          startSendspin(cfg);
        };
        script.onerror = function () {
          sendspinLoading = false;
          ctx.toast("Sendspin sa nepodarilo načítať");
        };
        document.head.appendChild(script);
        return;
      }
      try {
        var storage =
          N && N.readSecret
            ? {
                getItem: function (k) {
                  return N.readSecret("sendspin-" + k) || null;
                },
                setItem: function (k, v) {
                  N.writeSecret("sendspin-" + k, v);
                },
                removeItem: function (k) {
                  N.writeSecret("sendspin-" + k, "");
                },
              }
            : null;
        var identity = root.SendspinSdk.loadSendspinClientIdentity(storage),
          u = new URL(cfg.url);
        u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
        u.pathname = u.pathname.replace(/\/$/, "") + "/sendspin";
        u.search = "";
        var ws = new WebSocket(u.href);
        sendspinSocket = ws;
        var timeout = setTimeout(function () {
          ws.close();
          sendspinSocket = null;
        }, 12000);
        ws.onopen = function () {
          ws.send(
            JSON.stringify({
              type: "auth",
              token: cfg.token,
              client_id: identity.clientId,
            }),
          );
        };
        ws.onmessage = function (event) {
          clearTimeout(timeout);
          var reply;
          try {
            reply = JSON.parse(event.data);
          } catch (e) {
            ws.close();
            sendspinSocket = null;
            return;
          }
          if (
            reply.error ||
            reply.type === "auth_failed" ||
            reply.type === "auth_error"
          ) {
            ws.close();
            sendspinSocket = null;
            ctx.toast("Sendspin: overenie zlyhalo");
            return;
          }
          ws.onmessage = null;
          sendspin = new root.SendspinSdk.SendspinPlayer({
            webSocket: ws,
            clientName: "Aurelvi " + ctx.settings().deviceId,
            productName: "Aurelvi",
            storage: storage,
            codecs: ["pcm"],
            requiredLeadTimeMs: 300,
          });
          Promise.resolve(sendspin.connect()).catch(function () {
            ctx.toast("Sendspin sa nepripojil");
            sendspin = null;
            ws.close();
            sendspinSocket = null;
          });
        };
        ws.onerror = function () {
          clearTimeout(timeout);
          ctx.toast("Sendspin nie je dostupný");
        };
        ws.onclose = function () {
          clearTimeout(timeout);
          sendspinSocket = null;
          sendspin = null;
        };
      } catch (e) {
        sendspin = null;
        sendspinSocket = null;
        ctx.toast("Sendspin nie je podporovaný týmto WebView");
      }
    }
    var githubRelease = null,
      githubTimer;
    function githubRepo(raw) {
      var value = (raw || "")
        .trim()
        .replace(/^https:\/\/github\.com\//, "")
        .replace(/\/+$/, "");
      if (
        !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value) ||
        /\/\.\.?$/.test(value)
      )
        throw Error("GitHub repozitár má mať tvar vlastnik/repozitar");
      return value;
    }
    function checkGitHub(force) {
      var s = ctx.settings();
      if (
        !s.githubRepo ||
        (s.githubAutoCheck === false && !force) ||
        !N ||
        !N.checkGitHub
      )
        return;
      N.checkGitHub(s.githubRepo, s.githubAsset || "", !!force);
    }
    function updateGitHubStatus() {
      var label = ctx.$("github-status"),
        download = ctx.$("github-download");
      if (!label || !download) return;
      label.textContent = githubRelease
        ? githubRelease.available
          ? "Vydanie " +
            githubRelease.tag +
            " · " +
            githubRelease.asset +
            " · nainštalované " +
            githubRelease.current
          : "Nainštalovaná verzia je aktuálna alebo novšia"
        : "Zadaj verejný GitHub repozitár a skontroluj vydania.";
      download.disabled = !githubRelease || !githubRelease.available;
    }
    function settingsFields() {
      var parent = ctx.$("settings"),
        before = parent.querySelector(".row"),
        group = node("div", "advanced-settings");
      group.id = "advanced-settings";
      function input(id, label, type, placeholder) {
        group.appendChild(node("label", "", label));
        var n = node("input");
        n.id = id;
        n.type = type || "text";
        n.placeholder = placeholder || "";
        n.autocomplete = "off";
        group.appendChild(n);
        return n;
      }
      group.appendChild(node("h2", "", "Home Assistant"));
      input(
        "ha-url",
        "Adresa Home Assistanta",
        "url",
        "http://IP_HOME_ASSISTANTA:8123",
      );
      input("ha-token", "Dlhodobý prístupový token", "password");
      input(
        "weather-entity",
        "Entita počasia",
        "text",
        "weather.forecast_home",
      );
      group.appendChild(node("h2", "", "Music Assistant"));
      input(
        "ma-url",
        "Music Assistant server",
        "url",
        "http://IP_MUSIC_ASSISTANTA:8095",
      );
      input("ma-token", "Music Assistant token", "password");
      group.appendChild(node("h2", "", "Budík"));
      var enabled = input("clock-alarm-enabled", "Budík zapnutý", "checkbox");
      enabled.className = "native-checkbox";
      input("clock-alarm-time", "Čas budíka", "time");
      group.appendChild(
        button("Uložiť budík", function () {
          var time = ctx.$("clock-alarm-time").value.split(":"),
            cfg = Object.assign({},clockAlarm,{
              enabled: ctx.$("clock-alarm-enabled").checked,
              hour: Number(time[0] || 7),
              minute: Number(time[1] || 0),
            });
          clockAlarm = cfg;
          if (N && N.setAlarmClock) {
            var result = N.setAlarmClock(JSON.stringify(cfg));
            if (result !== "OK") ctx.toast(result);
          }
          publish("sys/alarm", cfg, true);
          ctx.toast("Budík uložený");
        }),
      );
      group.appendChild(button("Tón a hlasitosť budíka",openAlarmEditor));
      if (N && N.openDateSettings)
        group.appendChild(
          button("Systémový dátum a čas", function () {
            N.openDateSettings();
          }),
        );
      group.appendChild(node("h2", "", "Aktualizácia z GitHubu"));
      input(
        "github-repo",
        "Verejný GitHub repozitár",
        "text",
        "vlastnik/repozitar",
      );
      input("github-asset", "Názov APK (voliteľné)", "text", "OpenPanel.apk");
      input(
        "github-auto-check",
        "Automaticky kontrolovať každých 6 hodín",
        "checkbox",
      ).className = "native-checkbox";
      var ghStatus = node("p", "hint");
      ghStatus.id = "github-status";
      group.appendChild(ghStatus);
      group.appendChild(
        button("Skontrolovať GitHub", function () {
          try {
            if (!N || !N.checkGitHub) {
              ctx.toast("Kontrola je dostupná na paneli");
              return;
            }
            githubRelease = null;
            updateGitHubStatus();
            N.checkGitHub(
              githubRepo(ctx.$("github-repo").value),
              ctx.$("github-asset").value.trim(),
              true,
            );
          } catch (e) {
            ctx.toast(e.message);
          }
        }),
      );
      var ghDownload = button("Stiahnuť z GitHubu", function () {
        if (githubRelease && githubRelease.available && N && N.installUpdate)
          N.installUpdate(githubRelease.url);
      });
      ghDownload.id = "github-download";
      ghDownload.disabled = true;
      group.appendChild(ghDownload);
      group.appendChild(
        node(
          "p",
          "hint",
          "Ulož nastavenia pre automatickú kontrolu. Inštaláciu potvrdíš v Androide. Súkromné repozitáre nie sú podporované.",
        ),
      );
      group.appendChild(node("h2", "", "Vlastná adresa APK"));
      input(
        "update-url",
        "HTTPS adresa nového podpísaného APK",
        "url",
        "https://…/OpenPanel.apk",
      );
      group.appendChild(
        button("Stiahnuť aktualizáciu", function () {
          var url = ctx.$("update-url").value;
          if (N && N.installUpdate) N.installUpdate(url);
          else ctx.toast("Aktualizáciu nainštaluj cez ADB");
        }),
      );
      var capabilities = node("p", "hint");
      capabilities.id = "sensor-capabilities";
      group.appendChild(capabilities);
      parent.insertBefore(group, before);
    }
    function openSettings() {
      var s = ctx.settings();
      [
        "haUrl",
        "haToken",
        "weatherEntity",
        "maUrl",
        "maToken",
        "updateUrl",
      ].forEach(function (key) {
        var id = {
          haUrl: "ha-url",
          haToken: "ha-token",
          weatherEntity: "weather-entity",
          maUrl: "ma-url",
          maToken: "ma-token",
          updateUrl: "update-url",
        }[key];
        ctx.$(id).value = s[key] || "";
      });
      ctx.$("github-repo").value = s.githubRepo || "";
      ctx.$("github-asset").value = s.githubAsset || "";
      ctx.$("github-auto-check").checked = s.githubAutoCheck !== false;
      updateGitHubStatus();
      ctx.$("clock-alarm-enabled").checked = !!clockAlarm.enabled;
      ctx.$("clock-alarm-time").value =
        String(clockAlarm.hour || 0).padStart(2, "0") +
        ":" +
        String(clockAlarm.minute || 0).padStart(2, "0");
      ctx.$("sensor-capabilities").textContent =
        "Senzor svetla: " +
        (sensorData.hasLight ? "dostupný" : "nehlásený") +
        " · Senzor priblíženia: " +
        (sensorData.hasProximity ? "dostupný" : "nehlásený");
    }
    function addSettings(doc) {
      [
        ["haUrl", "ha-url"],
        ["haToken", "ha-token"],
        ["weatherEntity", "weather-entity"],
        ["maUrl", "ma-url"],
        ["maToken", "ma-token"],
        ["updateUrl", "update-url"],
      ].forEach(function (item) {
        doc[item[0]] = ctx.$(item[1]).value.trim();
      });
      if (doc.haUrl && !httpUrl(doc.haUrl))
        throw Error("Neplatná adresa Home Assistanta");
      if (doc.maUrl && !httpUrl(doc.maUrl))
        throw Error("Neplatná adresa Music Assistanta");
      doc.githubRepo = ctx.$("github-repo").value.trim()
        ? githubRepo(ctx.$("github-repo").value)
        : "";
      doc.githubAsset = ctx.$("github-asset").value.trim();
      if (doc.githubAsset && !/^[^\/\\]+\.apk$/i.test(doc.githubAsset))
        throw Error("Názov súboru musí končiť .apk");
      doc.githubAutoCheck = ctx.$("github-auto-check").checked;
      return doc;
    }
    function sensorUpdate(data) {
      sensorData = data;
      var d = ctx.device(),
        auto = d.autoBrightness || {},
        screen = d.screensaver || {};
      if (data.lux !== undefined) {
        publish(
          "sys/light",
          {
            raw: Math.round(data.lux),
            unit: "lx",
            available: true,
            ts: Date.now(),
          },
          true,
        );
        if (auto.enabled) {
          var level =
            (data.lux < Number(auto.nightThresholdLux || 130)
              ? Number(auto.nightBrightness || 30)
              : Number(auto.dayBrightness || 100)) / 100;
          if (ctx.sleeping())
            level = Math.max(
              0.05,
              level - Number(auto.screensaverDropPoints || 10) / 100,
            );
          ctx.brightness(level);
        }
      }
      if (data.hasProximity && data.proximity !== undefined) {
        var near = data.near === true;
        var max=Number(data.proximityMax), value=Number(data.proximity);
        var wakeNear=near, motionNear=near;
        if(max>0 && isFinite(value)) {
          if((d.proximity || {}).on!==undefined)wakeNear=value<=max*Number(d.proximity.on)/100;
          if((d.motion || {}).on!==undefined)motionNear=value<=max*Number(d.motion.on)/100;
        }
        if (wakeNear && screen.wakeOnProximity !== false) ctx.wake();
        if (motionNear) {
          if ((d.motion || {}).enabled === true) {
            motion = true;
            publish(
              "sys/motion",
              { motion: true, available: true, ts: Date.now() },
              true,
            );
            clearTimeout(motionTimer);
            motionTimer = setTimeout(
              function () {
                motion = false;
                publish(
                  "sys/motion",
                  { motion: false, available: true, ts: Date.now() },
                  true,
                );
              },
              Math.max(1, Number((d.motion || {}).clearS || 15)) * 1000,
            );
          }
        }
      }
    }
    function refreshReadouts() {
      if (
        !ctx.settings().haUrl ||
        !ctx.settings().haToken ||
        Date.now() - lastReadouts < 30000
      )
        return;
      var ids = [];
      ((ctx.config() && ctx.config().pages) || []).forEach(function (page) {
        (page.tiles || []).forEach(function (t) {
          if (t.readout && t.entity && ids.indexOf(t.entity) < 0)
            ids.push(t.entity);
        });
      });
      if (!ids.length) return;
      lastReadouts = Date.now();
      backendRequest("/api/states", "GET", {}, function (data) {
        if (!Array.isArray(data)) return;
        data.forEach(function (state) {
          if (ids.indexOf(state.entity_id) >= 0)
            ctx.states()[P.entityKey(state.entity_id)] = {
              value: state.state,
              attributes: state.attributes || {},
              on: state.state === "on",
            };
        });
        ctx.render();
      });
    }
    function nativeEvent(type, data) {
      if (type === "ha") {
        var item = requests[data.id];
        if (item) {
          clearTimeout(item.timer);
          delete requests[data.id];
          item.callback(
            data.ok ? data.data : null,
            data.ok
              ? null
              : "Home Assistant: " + (data.status || "spojenie zlyhalo"),
          );
        }
      } else if (type === "speech" && data.error) ctx.toast(data.error);
      else if (type === "sensors") sensorUpdate(data);
      else if (type === "media") {
        media = data;
        publish("sys/media", data, true);
        updateMediaLabels();
        if (data.error) ctx.toast("Prehrávanie zvuku zlyhalo");
      } else if (type === "screenshot") publish("sys/screenshot", data, false);
      else if (type === "clockAlarm") {
        clockAlarm = data;
        publish("sys/alarm", data, true);
      } else if (type === "alarmFired") clockAlarmFired();
      else if (type === "githubRelease") {
        githubRelease = data;
        updateGitHubStatus();
        if (data.available)
          ctx.toast(
            "Dostupné vydanie " +
              data.tag +
              " · otvor Nastavenia → Aktualizácia",
          );
      } else if (type === "update") {
        ctx.toast(data.message || "Aktualizácia");
        if (ctx.$("github-status") && data.message)
          ctx.$("github-status").textContent = data.message;
      }
    }
    settingsFields();
    githubTimer = setInterval(function () {
      checkGitHub(false);
    }, 21600000);
    setTimeout(function () {
      checkGitHub(false);
    }, 3000);
    root.OpenPanelNativeEvent = nativeEvent;
    try {
      if (N && N.alarmInfo) clockAlarm = JSON.parse(N.alarmInfo());
      if (N && N.getSensors) sensorData = JSON.parse(N.getSensors());
      if (N && N.mediaInfo) media = JSON.parse(N.mediaInfo());
    } catch (e) {}
    return {
      beforeRender: function () {
        renderedAlarmPage = null;
        stopCamera();
        applyTheme(
          ctx.device().theme || (ctx.config() && ctx.config().theme) || "cream",
        );
      },
      renderPage: function (page, surface) {
        if (page.type === "clock") renderClock(surface);
        else if (page.type === "weather") renderWeather(surface);
        else if (page.type === "camera") renderCamera(page, surface);
        else if (page.type === "alarm") renderAlarm(page, surface);
        else if (page.type === "music") renderMusic(surface);
        else return false;
        return true;
      },
      renderClock: function (surface) {
        var armed = ((ctx.config() && ctx.config().pages) || []).filter(
          function (p) {
            return (
              p.type === "alarm" &&
              (p.alarm || {}).screensaverWhenArmed !== false &&
              /^armed_/.test(alarmState(p))
            );
          },
        )[0];
        if (ctx.sleeping() && armed) renderAlarm(armed, surface);
        else renderClock(surface);
      },
      stopCamera: stopCamera,
      keepAwake: function () {
        var p = ctx.page();
        return !!(
          notification ||
          ringing ||
          (p && p.type === "camera" && (p.camera || {}).keepAwake)
        );
      },
      keepOnPage: function () {
        var p = ctx.page();
        return !!(
          p &&
          p.type === "camera" &&
          (p.camera || {}).keepOnPage !== false
        );
      },
      renderTile: function (tile) {
        if (!tile.readout && tile.type !== "readout") return null;
        var value =
            ctx.states()[tile.stateKey || P.entityKey(tile.entity)] || {},
          box = node("div", "tile readout-tile");
        box.appendChild(ctx.glyph(tile.icon || "generic"));
        box.appendChild(
          node(
            "strong",
            "readout-value",
            (value.value === undefined ? "—" : value.value) +
              " " +
              (tile.unit ||
                value.unit_of_measurement ||
                (value.attributes || {}).unit_of_measurement ||
                ""),
          ),
        );
        box.appendChild(
          node("span", "label", tile.label || tile.entity || tile.id),
        );
        refreshReadouts();
        return box;
      },
      onRaw: function (t, payload) {
        var handled = false;
        ((ctx.config() && ctx.config().pages) || []).forEach(function (p) {
          if (p.type !== "alarm") return;
          var cfg = p.alarm || {};
          if (t === (cfg.stateTopic || "alarmo/state")) {
            var state = payload;
            try {
              var data = JSON.parse(payload);
              state = typeof data === "string" ? data : data.state || payload;
            } catch (e) {}
            alarmStates[t] = state;
            syncAlarmDisplay();
            handled = true;
          } else if (t === (cfg.eventTopic || "alarmo/event")) {
            var event;
            try {
              event = JSON.parse(payload);
            } catch (e) {
              event = { event: payload };
            }
            if (
              event.event === "INVALID_CODE_PROVIDED" ||
              event.event === "NO_CODE_PROVIDED"
            )
              ctx.toast("Alarmo: nesprávny alebo chýbajúci PIN");
            handled = true;
          }
        });
        return handled;
      },
      onState: function (key, data) {
        var p = ctx.page();
        if (key === "weather") {
          if (data.entity) weatherByEntity[data.entity] = data;
          weather = data;
          weather.ts = weather.ts || Date.now();
          if (
            p &&
            p.type === "weather" &&
            (!data.entity || weatherEntity() === data.entity)
          )
            ctx.render();
          return true;
        }
        if (p && p.type === "camera") {
          if (key === P.entityKey(cameraEntity)) updateCamera();
          return true;
        }
        if (p && p.type === "alarm") return true;
        return false;
      },
      onConfig: function () {
        subscribeAlarms();
      },
      onDevice: function () {
        var d = ctx.device();
        clearInterval(infoTimer);
        infoTimer = setInterval(
          ctx.publishInfo,
          Math.max(10, Number(d.sysInfoIntervalS || 60)) * 1000,
        );
        if ((d.musicAssistant || {}).enabled) connectMA();
        else closeMA();
      },
      onConnect: function () {
        extraTopics = [];
        subscribeAlarms();
        notificationState(
          notification
            ? Object.assign({}, notification, { status: "shown" })
            : {},
        );
        publish("sys/media", media, true);
        publish("sys/alarm", clockAlarm, true);
        sensorUpdate(sensorData);
      },
      onCommand: function (name, doc) {
        if (name === "notify") showNotification(doc);
        else if (name === "notify_clear") {
          if (
            deferredNotification &&
            (!doc.id || doc.id === deferredNotification.id)
          )
            deferredNotification = null;
          notificationQueue = notificationQueue.filter(function (n) {
            return doc.id && n.id !== doc.id;
          });
          if (!doc.id || (notification && doc.id === notification.id))
            closeNotification("dismissed");
        } else if (name === "media") playMedia(doc);
        else if (name === "play_media")
          playMedia(Object.assign({ action: "play" }, doc));
        else if (name === "stop_media") playMedia({ action: "stop" });
        else if (name === "set_alarm") {
          clockAlarm = {
            enabled: !!doc.enabled,
            hour: doc.hour,
            minute: doc.minute,
          };
          if (N && N.setAlarmClock) N.setAlarmClock(JSON.stringify(clockAlarm));
          publish("sys/alarm", clockAlarm, true);
        } else if (name === "screenshot") {
          if (N && N.screenshot) N.screenshot(String(doc.id || ""));
        } else if (name === "ma_auth") {
          maAuth = doc;
          closeMA();
          connectMA();
        } else return false;
        return true;
      },
      openSettings: openSettings,
      addSettings: addSettings,
      onSettingsSaved: function () {
        githubRelease = null;
        updateGitHubStatus();
        checkGitHub(false);
        weather = null;
        weatherAt = 0;
        closeMA();
        connectMA();
      },
      tick: function () {
        if (deferredNotification && !ctx.sleeping()) {
          var pending = deferredNotification;
          deferredNotification = null;
          showNotification(pending);
        }
        if (ctx.page() && ctx.page().type === "weather") refreshWeather(false);
        refreshReadouts();
      },
      nativeEvent: nativeEvent,
      close: function () {
        stopAlarmPreview();
        clearInterval(githubTimer);
        stopCamera();
        closeMA();
        clearInterval(infoTimer);
        clearTimeout(notificationTimer);
        clearTimeout(motionTimer);
        if (sendspin && sendspin.disconnect) sendspin.disconnect();
      },
      debug: {
        alarmAction: alarmAction,
        showNotification: showNotification,
        closeNotification: closeNotification,
        requestMA: requestMA,
        refreshWeather: refreshWeather,
        media: function () {
          return media;
        },
        palettes: palettes,
      },
    };
  }
  root.OpenPanelFeatureFactory = {
    create: create,
    httpUrl: httpUrl,
    topic: topic,
    palettes: palettes,
  };
})(window);
