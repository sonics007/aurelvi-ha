/* Aurelvi controls: own protocol, confirmed states and configurable fan template. MIT. */
(function (root) {
  "use strict";
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    n.className = cls || "";
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function create(ctx) {
    var pending = Object.create(null),
      timer = { active: false },
      timerAt = 0,
      tickTimer,
      themeTimer,
      screenBrightness = 1,
      lastNight = null;
    function publish(suffix, doc, retained) {
      var c = ctx.client();
      if (c && ctx.online())
        c.publish(ctx.prefix() + "/" + suffix, doc, !!retained);
    }
    function defaultBrightness() {
      var d = ctx.device(),
        profile = d.nightMode || {},
        hour = new Date().getHours(),
        start = Number(profile.start === undefined ? 22 : profile.start),
        end = Number(profile.end === undefined ? 7 : profile.end),
        night =
          profile.enabled &&
          (start > end
            ? hour >= start || hour < end
            : hour >= start && hour < end);
      return night ? Number(profile.brightness || 20) / 100 : 1;
    }
    function theme() {
      var p = ctx.config() || {},
        d = ctx.device(),
        name = d.theme || p.theme || "cream",
        profile = d.nightMode || {};
      if (profile.enabled) {
        var hour = new Date().getHours(),
          start = Number(profile.start === undefined ? 22 : profile.start),
          end = Number(profile.end === undefined ? 7 : profile.end),
          night =
            start > end
              ? hour >= start || hour < end
              : hour >= start && hour < end;
        if (night) name = "night";
      }
      document.body.classList.toggle(
        "aurelvi-night",
        name === "night" || name === "scandi-night",
      );
      document.body.classList.add("aurelvi-ui");
      var nowNight = name === "night";
      if (lastNight !== nowNight) {
        lastNight = nowNight;
        if (!ctx.sleeping() && !(d.autoBrightness || {}).enabled)
          ctx.brightness(defaultBrightness());
      }
    }
    function send(button, action, value) {
      ctx.send(button, action, value);
    }
    function mirror(entity) {
      return (
        ctx.states()[ctx.P.entityKey(entity)] || {
          available: false,
          on: false,
          value: "unknown",
        }
      );
    }
    function control(id, text, icon, on, available, fn, cls) {
      var b = el("button", "aur-control " + (cls || ""), undefined);
      b.type = "button";
      b.dataset.control = id;
      if (icon) b.appendChild(ctx.glyph(icon));
      if (text !== undefined) b.appendChild(el("span", "", text));
      b.classList.toggle("is-on", ctx.online() && !!on);
      b.disabled = !ctx.online() || available === false;
      b.setAttribute("aria-pressed", String(!!on));
      b.addEventListener("click", fn);
      if (
        Object.values(pending).some(function (p) {
          return p.button === id;
        })
      )
        b.classList.add("pending");
      return b;
    }
    function slider(
      pageId,
      action,
      title,
      icon,
      value,
      min,
      max,
      step,
      available,
      format,
    ) {
      var row = el("label", "aur-slider");
      row.appendChild(ctx.glyph(icon));
      var body = el("span", "aur-slider-body"),
        head = el("span", "aur-slider-head"),
        caption = el("span", "", title),
        output = el("strong", "", format(value));
      head.appendChild(caption);
      head.appendChild(output);
      var range = el("input");
      range.type = "range";
      range.min = min;
      range.max = max;
      range.step = step;
      range.value = value;
      range.disabled = !ctx.online() || !available;
      range.setAttribute("aria-label", title);
      range.dataset.control = pageId + "." + action;
      range.addEventListener("input", function () {
        output.textContent = format(Number(range.value));
      });
      range.addEventListener("change", function () {
        send(pageId + "." + action, "set", Number(range.value));
      });
      body.appendChild(head);
      body.appendChild(range);
      row.appendChild(body);
      return row;
    }
    function remaining() {
      return timer.active
        ? Math.max(
            0,
            Math.ceil(
              Number(timer.remainingS || 0) - (Date.now() - timerAt) / 1000,
            ),
          )
        : 0;
    }
    function timerText() {
      var s = remaining();
      return Math.floor(s / 3600) > 0
        ? Math.floor(s / 3600) + " h " + Math.ceil((s % 3600) / 60) + " min"
        : Math.ceil(s / 60) + " min";
    }
    function timerSheet(page) {
      var existing = document.getElementById("aur-sheet");
      if (existing) existing.remove();
      var sheet = el("section", "aur-sheet");
      sheet.id = "aur-sheet";
      sheet.setAttribute("role", "dialog");
      sheet.appendChild(el("h2", "", "Vypnúť ventilátor o…"));
      [15, 30, 60, 120].forEach(function (min) {
        sheet.appendChild(
          control(
            page.id + ".timer",
            min < 60 ? min + " min" : min / 60 + " h",
            "timer",
            false,
            true,
            function () {
              send(page.id + ".timer", "set", min);
              sheet.remove();
            },
          ),
        );
      });
      if (timer.active)
        sheet.appendChild(
          control(
            page.id + ".cancel_timer",
            "Zrušiť časovač",
            "x",
            false,
            true,
            function () {
              send(page.id + ".cancel_timer", "press");
              sheet.remove();
            },
          ),
        );
      var close = el("button", "aur-close", "Späť");
      close.onclick = function () {
        sheet.remove();
      };
      sheet.appendChild(close);
      document.body.appendChild(sheet);
    }
    function renderFan(page, surface) {
      var f = page.fan || {},
        fan = mirror(f.fanEntity),
        light = mirror(f.lightEntity),
        cfg = f.controls || {},
        box = el("div", "aur-fan");
      box.dataset.page = page.id;
      surface.appendChild(box);
      if (f.lightEntity) {
        var hero = control(
          page.id + ".light",
          f.lightLabel || "Svetlo",
          "lightbulb",
          light.on,
          light.available,
          function () {
            send(page.id + ".light", "toggle");
          },
          "aur-light",
        );
        var info = el(
          "span",
          "aur-control-note",
          light.available === false
            ? "Nedostupné"
            : light.on
              ? "Zapnuté" +
                (light.brightness !== undefined
                  ? " · " + Math.round(light.brightness * 100) + " %"
                  : "")
              : "Vypnuté",
        );
        hero.appendChild(info);
        box.appendChild(hero);
      }
      var heading = el("div", "aur-section-head");
      heading.appendChild(el("span", "", "RÝCHLOSŤ VENTILÁTORA"));
      heading.appendChild(
        el(
          "span",
          "aur-state-label",
          fan.available === false
            ? "Nedostupný"
            : fan.on
              ? "Zapnutý"
              : "Vypnutý",
        ),
      );
      box.appendChild(heading);
      var speedrow = el("div", "aur-speeds"),
        speeds = f.speeds || [],
        nearest = -1,
        distance = Infinity;
      if (fan.on && fan.percentage !== undefined)
        speeds.forEach(function (s, i) {
          if (
            s.percentage !== undefined &&
            Math.abs(s.percentage - fan.percentage) < distance
          ) {
            distance = Math.abs(s.percentage - fan.percentage);
            nearest = i;
          }
        });
      speeds.forEach(function (s, i) {
        var match =
          s.preset_mode !== undefined
            ? fan.preset_mode === s.preset_mode
            : i === nearest;
        if (s.match && s.match.value !== undefined) {
          var st = mirror(s.match.entity || f.fanEntity),
            actual = s.match.attribute ? st[s.match.attribute] : st.value;
          match = ctx.P.compare(actual, {
            operator: s.match.operator,
            compareTo: s.match.value,
          });
        }
        var b = control(
          page.id + ".speed." + (i + 1),
          s.label || String(i + 1),
          null,
          fan.on && match,
          fan.available,
          function () {
            send(page.id + ".speed." + (i + 1), "press");
          },
          "aur-speed",
        );
        b.setAttribute("aria-label", "Rýchlosť " + (s.label || i + 1));
        speedrow.appendChild(b);
      });
      box.appendChild(speedrow);
      var utility = el("div", "aur-utility");
      utility.appendChild(
        control(
          page.id + ".off",
          "Vypnúť",
          "power",
          fan.available !== false && !fan.on,
          fan.available,
          function () {
            send(page.id + ".off", "press");
          },
        ),
      );
      if (cfg.direction)
        utility.appendChild(
          control(
            page.id + ".direction",
            fan.direction === "reverse"
              ? "Späť"
              : fan.direction === "forward"
                ? "Dopredu"
                : "Smer",
            "repeat",
            false,
            fan.available !== false && !!fan.direction,
            function () {
              send(page.id + ".direction", "press");
            },
          ),
        );
      if (cfg.allOff)
        utility.appendChild(
          control(
            page.id + ".all_off",
            "Všetko vypnúť",
            "power",
            !fan.on && (!f.lightEntity || !light.on),
            fan.available !== false &&
              (!f.lightEntity || light.available !== false),
            function () {
              send(page.id + ".all_off", "press");
            },
          ),
        );
      box.appendChild(utility);
      if (f.lightEntity && cfg.brightness)
        box.appendChild(
          slider(
            page.id,
            "brightness",
            "Jas",
            "sun",
            Math.round((light.brightness || 0) * 100) / 100,
            0,
            1,
            0.01,
            light.available !== false && light.brightness !== undefined,
            function (v) {
              return Math.round(v * 100) + " %";
            },
          ),
        );
      if (f.lightEntity && cfg.temperature)
        box.appendChild(
          slider(
            page.id,
            "temperature",
            "Teplota svetla",
            "thermometer",
            light.color_temp_kelvin || 3000,
            light.min_color_temp_kelvin || 2000,
            light.max_color_temp_kelvin || 6500,
            50,
            light.available !== false && light.color_temp_kelvin !== undefined,
            function (v) {
              return Math.round(v) + " K";
            },
          ),
        );
      if (cfg.timer) {
        var b = control(
          page.id + ".timer",
          timer.active ? "Vypnutie o " + timerText() : "Časovač vypnutia",
          "timer",
          timer.active,
          fan.available,
          function () {
            timerSheet(page);
          },
          "aur-timer",
        );
        b.id = "aur-timer-label";
        box.appendChild(b);
      }
      if ((f.extras || []).length) {
        var extras = el("div", "aur-extras");
        f.extras.forEach(function (x) {
          extras.appendChild(
            control(
              page.id + ".extra." + x.id,
              x.label || x.id,
              x.icon || "sparkles",
              false,
              true,
              function () {
                send(page.id + ".extra." + x.id, "press");
              },
            ),
          );
        });
        box.appendChild(extras);
      }
    }
    function begin(event) {
      if (ctx.settings().namespace === "domodreams") return;
      var id = event.eventId;
      pending[id] = { button: event.button, started: Date.now() };
      document.querySelectorAll("[data-control]").forEach(function (b) {
        if (b.dataset.control === event.button) b.classList.add("pending");
      });
      setTimeout(function () {
        if (pending[id]) {
          delete pending[id];
          ctx.toast("Príkaz nebol potvrdený. Skontroluj spojenie.");
          refreshPending();
        }
      }, 10000);
    }
    function refreshPending() {
      document.querySelectorAll("[data-control]").forEach(function (b) {
        b.classList.toggle(
          "pending",
          Object.values(pending).some(function (p) {
            return p.button === b.dataset.control;
          }),
        );
      });
    }
    function raw(t, payload) {
      if (t.indexOf(ctx.prefix() + "/sys/") !== 0) return false;
      var doc;
      try {
        doc = JSON.parse(payload);
      } catch (e) {
        return true;
      }
      var name = t.split("/").pop();
      if (name === "ack") {
        if (doc.eventId) delete pending[doc.eventId];
        refreshPending();
        if (doc.ok === false) ctx.toast(doc.message || "Príkaz zlyhal");
      } else if (name === "timer") {
        timer = doc;
        timerAt = Date.now();
        var label = document.getElementById("aur-timer-label");
        if (label) {
          var span = label.querySelector("span");
          if (span)
            span.textContent = doc.active
              ? "Vypnutie o " + timerText()
              : "Časovač vypnutia";
          label.classList.toggle("is-on", doc.active);
        }
      }
      return true;
    }
    function onCommand(name, doc) {
      if (name === "update") {
        if (ctx.Native && ctx.Native.installUpdate)
          ctx.Native.installUpdate(doc.url);
        return true;
      }
      if (name === "check_update") {
        if (ctx.Native && ctx.Native.checkGitHub)
          ctx.Native.checkGitHub(
            ctx.settings().githubRepo || "",
            ctx.settings().githubAsset || "",
            true,
          );
        return true;
      }
      return false;
    }
    tickTimer = setInterval(function () {
      var label = document.getElementById("aur-timer-label");
      if (label && timer.active) {
        var span = label.querySelector("span");
        if (span) span.textContent = "Vypnutie o " + timerText();
      }
    }, 1000);
    themeTimer = setInterval(theme, 60000);
    theme();
    return {
      defaultBrightness: defaultBrightness,
      renderPage: function (p, s) {
        if (p.type !== "fan") return false;
        renderFan(p, s);
        return true;
      },
      beforeRender: theme,
      onRaw: raw,
      onCommand: onCommand,
      begin: begin,
      screen: function (brightness, awake) {
        screenBrightness = brightness;
        publish("sys/screen", { brightness: brightness, awake: awake }, true);
      },
      close: function () {
        clearInterval(tickTimer);
        clearInterval(themeTimer);
      },
      debug: { pending: pending, remaining: remaining },
    };
  }
  root.AurelviFactory = { create: create };
})(window);
