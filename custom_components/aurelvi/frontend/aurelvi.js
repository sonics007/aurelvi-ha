/* Aurelvi controls: own protocol, confirmed states and configurable fan template. MIT. */
(function (root) {
  "use strict";
  function tr(key,vars){return window.AurelviI18n?window.AurelviI18n.t(key,vars):key;}
  function backendMessage(text){return window.AurelviI18n&&window.AurelviI18n.message?window.AurelviI18n.message(text):text;}
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
    function mix(a,b,n) {
      var result="#";
      for(var i=1;i<7;i+=2) result+=Math.round(parseInt(a.slice(i,i+2),16)*(1-n)+parseInt(b.slice(i,i+2),16)*n).toString(16).padStart(2,"0");
      return result;
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
      var skin = (window.AurelviSkins || []).find(function (item) { return item.id === name; });
      document.body.classList.toggle("dark", skin ? skin.dark : name === "night");
      document.body.style.setProperty("--label-size",Math.max(8,Math.min(32,Number(d.labelSize)||14))+"px");
      document.body.style.setProperty("--label-offset",Math.max(-40,Math.min(40,Number(d.labelOffsetY)||0))+"px");
      document.body.style.setProperty("--icon-size",Math.max(16,Math.min(96,Number(d.iconSize)||40))+"px");
      var wallpaper=d.wallpaper || {}, backgrounds={morning:"linear-gradient(150deg,#598ac1,#e6bdd1 60%,#ffe1b0)",forest:"radial-gradient(ellipse at 20% 0,#679f83,transparent 60%),linear-gradient(135deg,#173a38,#091c22)",sea:"linear-gradient(155deg,#72d3dc,#18779f 55%,#102e5e)",sunset:"linear-gradient(145deg,#e9b079,#bd6b8f 50%,#413563)",graphite:"repeating-linear-gradient(135deg,#29323a 0 3px,#252b34 3px 6px)"};
      var wall=backgrounds[wallpaper.id];
      if(wallpaper.id==="custom" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(wallpaper.image || ""))wall='url("'+wallpaper.image+'")';
      if(wall){var opacity=Math.max(0,Math.min(.8,Number(wallpaper.dim || 0)/100));document.body.style.backgroundImage="linear-gradient(rgba(0,0,0,"+opacity+"),rgba(0,0,0,"+opacity+")),"+wall;document.body.style.backgroundSize="cover";document.body.style.backgroundPosition="center";}
      else{document.body.style.removeProperty("background-image");document.body.style.removeProperty("background-size");document.body.style.removeProperty("background-position");}
      document.body.dataset.skin = name;
      document.body.dataset.material = skin ? skin.material : "soft";
      document.body.dataset.texture = skin ? (skin.texture || "") : "";
      document.body.dataset.trim = skin ? (skin.trim || "") : "";
      var texture=skin && skin.texture;
      document.body.style.setProperty("--texture-image",texture ? 'url("materials/'+texture+'.webp")' : "none");
      document.body.style.setProperty("--material-tint",skin ? skin.bg+"99" : "transparent");
      document.body.dataset.skinVariant = skin ? String(skin.variant || 0) : "0";
      document.body.classList.toggle("aurelvi-night", skin ? skin.dark : name === "night");
      if (skin) {
        var vars = {"--bg":skin.bg,"--ink":skin.ink,"--led":skin.accent,"--muted":skin.dark ? "#a8b8b0" : "#778078",
          "--surface-hi":mix(skin.bg,skin.dark ? "#ffffff" : "#ffffff",skin.dark ? .08 : .45),
          "--surface-lo":mix(skin.bg,"#000000",skin.dark ? .05 : .035),
          "--surface-border":mix(skin.bg,skin.ink,.18),"--shadow":mix(skin.bg,"#000000",.18),"--highlight":mix(skin.bg,"#ffffff",skin.dark ? .09 : .65)};
        Object.keys(vars).forEach(function (key) {document.body.style.setProperty(key,vars[key]);});
      }
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
        ? tr("panel.fan.hours_minutes", { hours: Math.floor(s / 3600), minutes: Math.ceil((s % 3600) / 60) })
        : tr("panel.fan.minutes", { minutes: Math.ceil(s / 60) });
    }
    function timerSheet(page) {
      var existing = document.getElementById("aur-sheet");
      if (existing) existing.remove();
      var sheet = el("section", "aur-sheet");
      sheet.id = "aur-sheet";
      sheet.setAttribute("role", "dialog");
      sheet.appendChild(el("h2", "", tr("panel.fan.turn_off_in")));
      [15, 30, 60, 120].forEach(function (min) {
        sheet.appendChild(
          control(
            page.id + ".timer",
            min < 60 ? tr("panel.fan.minutes", { minutes: min }) : tr("panel.fan.hours", { hours: min / 60 }),
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
            tr("panel.fan.cancel_timer"),
            "x",
            false,
            true,
            function () {
              send(page.id + ".cancel_timer", "press");
              sheet.remove();
            },
          ),
        );
      var close = el("button", "aur-close", tr("common.back"));
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
          f.lightLabel || tr("panel.fan.light"),
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
            ? tr("panel.status.unavailable")
            : light.on
              ? tr("common.on") +
                (light.brightness !== undefined
                  ? " · " + Math.round(light.brightness * 100) + " %"
                  : "")
              : tr("common.off"),
        );
        hero.appendChild(info);
        box.appendChild(hero);
      }
      var heading = el("div", "aur-section-head");
      heading.appendChild(el("span", "", tr("panel.fan.fan_speed")));
      heading.appendChild(
        el(
          "span",
          "aur-state-label",
          fan.available === false
            ? tr("panel.fan.unavailable")
            : fan.on
              ? tr("panel.fan.state_on")
              : tr("panel.fan.state_off"),
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
        b.setAttribute("aria-label", tr("panel.fan.speed", { speed: s.label || i + 1 }));
        speedrow.appendChild(b);
      });
      box.appendChild(speedrow);
      var utility = el("div", "aur-utility");
      utility.appendChild(
        control(
          page.id + ".off",
          tr("panel.fan.turn_off"),
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
              ? tr("panel.fan.direction_back")
              : fan.direction === "forward"
                ? tr("panel.fan.direction_forward")
                : tr("panel.fan.direction"),
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
            tr("panel.fan.all_off"),
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
      var meter=el("div","aur-vu"),meterLabel=el("div","aur-vu-label",tr("panel.fan.output",{value:fan.available===false?"—":Math.round(fan.on?Number(fan.percentage)||0:0)+" %"})),track=el("div","aur-vu-track"),fill=el("div","aur-vu-fill");
      fill.style.width=Math.max(0,Math.min(100,fan.on?Number(fan.percentage)||0:0))+"%";track.appendChild(fill);meter.appendChild(meterLabel);meter.appendChild(track);meter.appendChild(el("div","aur-vu-scale","0     20     40     60     80     100"));box.appendChild(meter);
      if (f.lightEntity && cfg.brightness)
        box.appendChild(
          slider(
            page.id,
            "brightness",
            tr("panel.fan.brightness"),
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
            tr("panel.fan.light_temperature"),
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
          timer.active ? tr("panel.fan.shutdown_in", { time: timerText() }) : tr("panel.fan.shutdown_timer"),
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
      var id = event.eventId;
      pending[id] = { button: event.button, started: Date.now() };
      document.querySelectorAll("[data-control]").forEach(function (b) {
        if (b.dataset.control === event.button) b.classList.add("pending");
      });
      setTimeout(function () {
        if (pending[id]) {
          delete pending[id];
          ctx.toast(tr("panel.fan.command_unconfirmed"));
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
        if (doc.ok === false) ctx.toast(doc.message ? backendMessage(doc.message) : tr("panel.fan.command_failed"));
      } else if (name === "timer") {
        timer = doc;
        timerAt = Date.now();
        var label = document.getElementById("aur-timer-label");
        if (label) {
          var span = label.querySelector("span");
          if (span)
            span.textContent = doc.active
              ? tr("panel.fan.shutdown_in", { time: timerText() })
              : tr("panel.fan.shutdown_timer");
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
        if (span) span.textContent = tr("panel.fan.shutdown_in", { time: timerText() });
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
