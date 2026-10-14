/* Aurelvi Studio — dependency-free Home Assistant custom panel. MIT. */
(function () {
  "use strict";
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const style = `:host{display:block;height:100%;font-family:var(--paper-font-body1_-_font-family,Roboto,Arial);color:#263d31;background:#f4f1e9;--green:#28664f;--line:#dddcd2;--muted:#738277}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer;color:inherit}button:disabled{opacity:.5;cursor:default}.top{height:72px;padding:14px 28px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;background:#faf8f2}.mark{width:34px;height:34px}.brand{font-size:25px;font-weight:650;letter-spacing:-1px}.sub{font-size:12px;color:var(--muted)}.top .sub{margin-left:10px}.grow{flex:1}.pill{font-size:11px;border:1px solid var(--line);border-radius:20px;padding:6px 12px}.layout{display:grid;grid-template-columns:224px 1fr;height:calc(100% - 72px)}aside{border-right:1px solid var(--line);padding:22px 16px;overflow:auto;background:#edece4}.overline{font-size:10px;color:var(--muted);letter-spacing:1.5px;font-weight:700;margin:0 8px 12px}.panel{width:100%;border:1px solid transparent;background:none;border-radius:13px;padding:13px 12px;text-align:left;margin-bottom:8px;display:flex;gap:10px;align-items:center}.panel.active{border-color:#aabeb0;background:#f9f8f1}.panel strong{font-size:14px}.panel small{display:block;font-size:10px;color:var(--muted);margin-top:4px}.dot{width:7px;height:7px;border-radius:50%;background:#ae9871;flex-shrink:0}.dot.online{background:#37825b}.content{overflow:auto;padding:26px 30px}.toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:23px}.toolbar h1{margin:0;font-size:27px;font-weight:600;letter-spacing:-.6px}.btn{min-height:38px;border:1px solid var(--line);border-radius:10px;background:#faf9f4;padding:8px 13px;font-size:12px}.primary{background:var(--green);color:#fff;border-color:var(--green)}.tabs{display:flex;gap:7px;margin-bottom:22px}.tabs button{border:0;background:none;padding:10px 14px;font-size:13px;border-radius:10px}.tabs button.active{background:#e3eadf;color:var(--green);font-weight:600}.editor{display:grid;grid-template-columns:minmax(280px,1fr) minmax(280px,430px);gap:28px;align-items:start}.card{background:#fcfaf5;border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:16px}.card h2{font-size:17px;margin:0 0 14px}.fields{display:grid;gap:12px}.field{display:flex;flex-direction:column;gap:5px;font-size:12px}.field>span{color:#637469;font-weight:500}.field input,.field select,.field textarea{width:100%;padding:9px 10px;border:1px solid #cfdbcf;border-radius:8px;background:white;color:#263d31;font-size:13px;min-height:38px}.field textarea{min-height:92px;font:12px ui-monospace,monospace}.field input[type=checkbox]{width:20px;min-height:20px}.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.row>*{flex:1;min-width:0}.pages{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:15px}.page{border:1px solid var(--line);padding:7px 12px;border-radius:9px;background:#faf9f4;font-size:12px}.page.active{color:var(--green);border-color:#80a58d;background:#e8efdf}.hint{font-size:12px;color:var(--muted);line-height:1.6}.preview-wrap{position:sticky;top:0}.preview-label{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin:0 3px 11px}.preview-shell{padding:13px;border-radius:29px;background:#222b25;box-shadow:0 15px 30px #283e3321}.preview-shell iframe{width:100%;aspect-ratio:1;border:0;border-radius:17px;background:#f2ece1;display:block}.empty{text-align:center;max-width:560px;margin:70px auto}.empty h1{font-size:30px}.empty p{font-size:14px;line-height:1.8;color:var(--muted)}.notice{padding:11px 15px;border-radius:10px;background:#e5eddf;border:1px solid #b9d0bd;font-size:12px;margin-bottom:18px;line-height:1.5}.notice.error{background:#f9e9dd;border-color:#dca690;color:#8b4329}.tile-list{display:grid;gap:7px}.tile-row{padding:11px;border:1px solid var(--line);border-radius:10px;background:white;display:flex;gap:8px;align-items:center;font-size:12px}.tile-row[draggable=true]{cursor:grab}.tile-row.selected{border-color:#6d9c7f}.log{font:12px ui-monospace,monospace;line-height:1.7;overflow-wrap:anywhere}.log.error{color:#a34334}.screenshot{max-width:100%;border-radius:12px}.speed-form{display:grid;gap:9px;margin-top:10px}.speed-form .card{padding:12px;margin:0}.badge{font-size:10px;padding:3px 7px;background:#e6ede0;color:#397d55;border-radius:7px}.footer{font-size:10px;color:var(--muted);margin-top:20px}.modal{position:fixed;inset:0;background:#1e332e88;display:flex;align-items:center;justify-content:center;z-index:20;padding:25px}.modal>.card{width:520px;max-height:85vh;overflow:auto}.grid-map{display:grid;gap:6px;margin-bottom:16px;min-height:130px}.grid-cell{border:1px dashed #bdcabc;border-radius:8px;min-height:42px;padding:6px;background:#f1f2e8;font-size:11px}.grid-cell.occupied{background:#e2eadb;border-style:solid;cursor:grab}.warn{color:#9b7040}.dirty{font-size:11px;color:#997842}@media(max-width:1050px){.editor{grid-template-columns:1fr}.preview-wrap{position:static;max-width:430px;grid-row:1}.layout{grid-template-columns:185px 1fr}.content{padding:20px}.top{padding:15px 20px}.top .sub{display:none}}@media(max-width:650px){.layout{display:block;height:auto}aside{display:flex;gap:6px;overflow-x:auto;border-right:0;border-bottom:1px solid var(--line);padding:9px}.panel{min-width:150px;margin:0}.overline{display:none}.top{height:61px}.content{padding:16px}.toolbar h1{font-size:23px}.top .pill{display:none}.preview-shell{padding:9px}.row>*{min-width:100px}:host{overflow:auto}.card{padding:15px}}`;
  class AurelviStudio extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._hass = null;
      this.data = null;
      this.selected = null;
      this.pageIndex = 0;
      this.tab = "pages";
      this.draft = null;
      this.device = {};
      this.dirty = false;
      this.undo = [];
      this.message = "";
      this.error = false;
      this.tileIndex = 0;
      this.loading = false;
      this.poll = null;
      this.boundMessage = this.onMessage.bind(this);
    }
    set hass(value) {
      this._hass = value;
      if (this.isConnected && !this.data && !this.loading) this.load();
      else if (this.data) this.preview();
    }
    get hass() {
      return this._hass;
    }
    connectedCallback() {
      window.addEventListener("message", this.boundMessage);
      this.render();
      if (this._hass) this.load();
      this.poll = setInterval(() => this.refreshStatus(), 12000);
    }
    disconnectedCallback() {
      window.removeEventListener("message", this.boundMessage);
      clearInterval(this.poll);
    }
    async api(action, data = {}, pid = this.selected) {
      return this._hass.callWS({
        type: "aurelvi/command",
        action,
        panel_id: pid || undefined,
        data,
      });
    }
    async load() {
      this.loading = true;
      try {
        this.data = await this.api("list", {}, null);
        if (!this.selected)
          this.selected =
            (
              this.data.panels.find((p) => p.paired) ||
              this.data.panels[0] ||
              {}
            ).id || null;
        this.loadDraft();
        this.render();
      } catch (e) {
        this.notice(e.message || "Integrácia nie je dostupná", true);
      } finally {
        this.loading = false;
      }
    }
    async refreshStatus() {
      if (!this.data) return;
      try {
        let data = await this.api("list", {}, null);
        let oldIds = this.data.panels.map((p) => p.id).join();
        this.data = data;
        if (oldIds !== data.panels.map((p) => p.id).join()) this.render();
        else {
          let node = this.shadowRoot.querySelector("#connection");
          let panel = this.current();
          if (node && panel)
            node.textContent = panel.status.online ? "Pripojený" : "Odpojený";
          // Preserve partially entered management forms during background polling.
          this.preview();
        }
      } catch (e) {
        let node = this.shadowRoot.querySelector("#connection");
        if (node) node.textContent = "Spojenie s HA prerušené";
      }
    }
    current() {
      return this.data && this.data.panels.find((p) => p.id === this.selected);
    }
    loadDraft() {
      let p = this.current();
      this.draft = p ? clone(p.config) : null;
      this.device = p ? clone(p.device) : {};
      this.revision = p ? p.revision : 0;
      this.pageIndex = 0;
      this.dirty = false;
      this.undo = [];
    }
    notice(text, error = false) {
      this.message = text;
      this.error = error;
      let n = this.shadowRoot.querySelector("#notice");
      if (n) {
        n.textContent = text;
        n.className = "notice" + (error ? " error" : "");
        n.hidden = !text;
      }
    }
    update(fn, redraw = false) {
      this.undo.push({ config: clone(this.draft), device: clone(this.device) });
      if (this.undo.length > 30) this.undo.shift();
      fn();
      this.dirty = true;
      this.message = "";
      if (redraw) this.render();
      else {
        let d = this.shadowRoot.querySelector("#dirty");
        if (d) d.textContent = "Neuložené zmeny";
        this.preview();
      }
    }
    btn(text, fn, primary = false) {
      let b = make("button", "btn" + (primary ? " primary" : ""), text);
      b.type = "button";
      b.addEventListener("click", fn);
      return b;
    }
    field(parent, label, value, change, options = {}) {
      let l = make("label", "field"),
        caption = make("span", "", label),
        input = make(
          options.rows ? "textarea" : options.choices ? "select" : "input",
        );
      l.append(caption, input);
      parent.append(l);
      if (options.choices) {
        options.choices.forEach((item) => {
          let o = make(
            "option",
            "",
            typeof item === "string" ? item : item.label,
          );
          o.value = typeof item === "string" ? item : item.value;
          input.append(o);
        });
      } else if (!options.rows) input.type = options.type || "text";
      if (input.type === "checkbox") input.checked = !!value;
      else
        input.value =
          value === undefined || value === null ? "" : String(value);
      if (options.min !== undefined) input.min = options.min;
      if (options.max !== undefined) input.max = options.max;
      if (options.list) input.setAttribute("list", options.list);
      input.addEventListener("change", () => {
        try {
          change(
            input.type === "checkbox"
              ? input.checked
              : input.type === "number"
                ? Number(input.value)
                : input.value,
          );
        } catch (e) {
          this.notice(e.message, true);
        }
      });
      return input;
    }
    entity(parent, label, value, domain, change) {
      let input = this.field(parent, label, value, change, {
        list: "entities-" + domain,
      });
      let list = make("datalist");
      list.id = "entities-" + domain;
      Object.keys(this._hass.states || {})
        .filter((id) => !domain || id.startsWith(domain + "."))
        .sort()
        .forEach((id) => {
          let o = make("option");
          o.value = id;
          o.label = this._hass.states[id].attributes.friendly_name || id;
          list.append(o);
        });
      parent.append(list);
      return input;
    }
    card(parent, title) {
      let box = make("section", "card");
      box.append(make("h2", "", title));
      parent.append(box);
      return box;
    }
    render() {
      let r = this.shadowRoot;
      r.textContent = "";
      let css = make("style");
      css.textContent = style;
      r.append(css);
      let top = make("header", "top");
      let logo = make("img", "mark");
      logo.src = "/aurelvi-static/logo-symbol.svg";
      logo.alt = "";
      top.append(
        logo,
        make("span", "brand", "Aurelvi"),
        make("span", "sub", "STUDIO · DOMOV NA DOTYK"),
        make("span", "grow"),
        make("span", "pill", "Lokálne ovládanie"),
      );
      r.append(top);
      let layout = make("div", "layout"),
        aside = make("aside");
      aside.append(make("div", "overline", "TVOJE PANELY"));
      layout.append(aside);
      r.append(layout);
      if (this.data)
        this.data.panels.forEach((p) => {
          let b = make(
              "button",
              "panel" + (p.id === this.selected ? " active" : ""),
            ),
            dot = make("span", "dot" + (p.status.online ? " online" : "")),
            text = make("span");
          text.append(
            make("strong", "", p.name),
            make(
              "small",
              "",
              p.paired ? p.status.info.ip || p.id : "Nový panel · pridať",
            ),
          );
          b.append(dot, text);
          b.onclick = () => {
            if (this.dirty && !window.confirm("Opustiť neuložené zmeny?"))
              return;
            this.selected = p.id;
            this.loadDraft();
            this.render();
          };
          aside.append(b);
        });
      aside.append(this.btn("+ Pridať panel", () => this.addPanelDialog()));
      let content = make("main", "content");
      layout.append(content);
      if (!this.data) {
        content.append(make("div", "empty", "Načítavam Aurelvi…"));
        return;
      }
      let p = this.current();
      if (!p) {
        let box = make("div", "empty");
        box.append(
          make("h1", "", "Vitaj v Aurelvi"),
          make(
            "p",
            "",
            "Pripoj aplikáciu na paneli k rovnakému MQTT brokeru a vyber integráciu Aurelvi. Panel sa tu objaví automaticky. Môžeš ho pridať aj pomocou jeho ID.",
          ),
          this.btn("Pridať prvý panel", () => this.addPanelDialog(), true),
        );
        content.append(box);
        return;
      }
      let toolbar = make("div", "toolbar");
      toolbar.append(make("h1", "", p.name));
      let connection = make(
        "span",
        "badge",
        p.status.online ? "Pripojený" : "Odpojený",
      );
      connection.id = "connection";
      toolbar.append(connection, make("span", "grow"));
      let dirty = make("span", "dirty", this.dirty ? "Neuložené zmeny" : "");
      dirty.id = "dirty";
      toolbar.append(
        dirty,
        this.btn("Späť zmenu", () => {
          let old = this.undo.pop();
          if (old) {
            this.draft = old.config;
            this.device = old.device;
            this.dirty = true;
            this.render();
          }
        }),
        this.btn("Uložiť na panel", () => this.save(), true),
      );
      content.append(toolbar);
      let notice = make(
        "div",
        "notice" + (this.error ? " error" : ""),
        this.message,
      );
      notice.id = "notice";
      notice.hidden = !this.message;
      content.append(notice);
      if (!p.paired) {
        content.append(
          make(
            "p",
            "hint",
            "Nový panel čaká na pridanie. Týmto povolíš jeho ovládacie akcie.",
          ),
          this.btn(
            "Pridať tento panel",
            async () => {
              try {
                await this.api("add", { name: p.name });
                await this.load();
              } catch (e) {
                this.notice(e.message, true);
              }
            },
            true,
          ),
        );
        return;
      }
      let tabs = make("nav", "tabs");
      [
        ["pages", "Stránky"],
        ["display", "Displej"],
        ["manage", "Správa"],
      ].forEach(([id, label]) => {
        let b = this.btn(label, () => {
          this.tab = id;
          this.render();
        });
        b.className = this.tab === id ? "active" : "";
        tabs.append(b);
      });
      content.append(tabs);
      if (this.tab === "pages") this.renderPages(content);
      else if (this.tab === "display") this.renderDisplay(content);
      else this.renderManage(content);
    }
    renderPages(parent) {
      let pages = make("div", "pages");
      this.draft.pages.forEach((page, i) => {
        let b = this.btn(page.title || page.id, () => {
          this.pageIndex = i;
          this.tileIndex = 0;
          this.render();
        });
        b.className = "page" + (i === this.pageIndex ? " active" : "");
        pages.append(b);
      });
      pages.append(this.btn("+ Stránka", () => this.pageDialog()));
      parent.append(pages);
      this.pageIndex = Math.max(
        0,
        Math.min(this.pageIndex, this.draft.pages.length - 1),
      );
      let page = this.draft.pages[this.pageIndex];
      let editor = make("div", "editor"),
        form = make("div"),
        preview = make("div", "preview-wrap");
      editor.append(form, preview);
      parent.append(editor);
      let info = this.card(form, "Stránka");
      this.field(info, "Názov", page.title, (v) =>
        this.update(() => (page.title = v)),
      );
      let actions = make("div", "row");
      actions.append(
        this.btn("Duplikovať", () =>
          this.update(() => {
            let copy = clone(page);
            copy.id = "page_" + Date.now().toString(36);
            if (copy.tiles)
              copy.tiles.forEach((t, i) => (t.id = copy.id + "_" + i));
            this.draft.pages.push(copy);
            this.pageIndex = this.draft.pages.length - 1;
          }, true),
        ),
        this.btn("←", () => this.movePage(-1)),
        this.btn("→", () => this.movePage(1)),
        this.btn("Odstrániť", () => {
          if (this.draft.pages.length < 2) {
            this.notice("Zachovaj aspoň jednu stránku", true);
            return;
          }
          this.update(() => this.draft.pages.splice(this.pageIndex, 1), true);
        }),
      );
      info.append(actions);
      if (page.type === "fan") this.renderFanForm(form, page);
      else if (page.type === "grid") this.renderGridForm(form, page);
      else if (page.type === "weather") {
        let box = this.card(form, "Počasie z Home Assistanta");
        page.weather = page.weather || {};
        this.entity(
          box,
          "Weather entita",
          page.weather.entity,
          "weather",
          (v) => this.update(() => (page.weather.entity = v)),
        );
        box.append(
          make(
            "p",
            "hint",
            "Počasie posiela integrácia cez MQTT. Token HA na paneli nie je potrebný.",
          ),
        );
      } else if (page.type === "camera") this.renderCameraForm(form, page);
      else if (page.type === "alarm") {
        let box = this.card(form, "Alarmo");
        page.alarm = page.alarm || {};
        ["stateTopic", "commandTopic", "eventTopic", "area"].forEach((k) =>
          this.field(
            box,
            k,
            page.alarm[k] ||
              {
                stateTopic: "alarmo/state",
                commandTopic: "alarmo/command",
                eventTopic: "alarmo/event",
              }[k] ||
              "",
            (v) => this.update(() => (page.alarm[k] = v)),
          ),
        );
        this.field(
          box,
          "Vyžadovať PIN pri zapnutí",
          page.alarm.codeArmRequired !== false,
          (v) => this.update(() => (page.alarm.codeArmRequired = v)),
          { type: "checkbox" },
        );
      } else if (page.type === "music") {
        this.card(form, "Music Assistant").append(
          make(
            "p",
            "hint",
            "Server a token nastavíš na paneli. Natívny reproduktor je aj samostatná media_player entita v HA. Sendspin zostáva experimentálny.",
          ),
        );
      } else {
        this.card(form, "Hodiny").append(
          make(
            "p",
            "hint",
            "Vzhľad hodín, šetrič a nočný režim upravíš v záložke Displej.",
          ),
        );
      }
      let label = make("div", "preview-label");
      label.append(
        make("span", "", "NÁHĽAD PANELA"),
        make("span", "", "Skutočné stavy · ovládanie v náhľade je vizuálne"),
      );
      let shell = make("div", "preview-shell"),
        iframe = make("iframe");
      iframe.id = "preview";
      iframe.title = "Náhľad Aurelvi";
      iframe.src = "/aurelvi-static/preview.html?studio=1";
      iframe.onload = () => {
        this.lastPreview = null;
        this.preview();
      };
      shell.append(iframe);
      preview.append(
        label,
        shell,
        make(
          "p",
          "hint",
          "Zmeny odošleš tlačidlom Uložiť na panel. Zelená označuje potvrdený stav zariadenia.",
        ),
      );
    }
    movePage(delta) {
      let next = this.pageIndex + delta;
      if (next < 0 || next >= this.draft.pages.length) return;
      this.update(() => {
        let a = this.draft.pages;
        [a[next], a[this.pageIndex]] = [a[this.pageIndex], a[next]];
        this.pageIndex = next;
      }, true);
    }
    renderFanForm(parent, page) {
      let f = page.fan,
        box = this.card(parent, "Ventilátor so svetlom");
      this.entity(box, "Ventilátor", f.fanEntity, "fan", (v) =>
        this.update(() => (f.fanEntity = v), true),
      );
      this.entity(box, "Svetlo (voliteľné)", f.lightEntity, "light", (v) =>
        this.update(() => (f.lightEntity = v), true),
      );
      this.field(
        box,
        "Počet rýchlostí",
        f.speeds.length,
        (v) =>
          this.update(() => {
            f.speeds = Array.from(
              { length: v },
              (_, i) =>
                f.speeds[i] || {
                  label: String(i + 1),
                  percentage: Math.round((100 * (i + 1)) / v),
                },
            );
          }, true),
        { choices: ["1", "2", "3", "4", "5", "6"] },
      );
      let source = this._hass.states[f.fanEntity];
      if (source) {
        let attrs = source.attributes;
        box.append(
          make(
            "p",
            "hint",
            "Aktuálne: " +
              (attrs.percentage !== undefined
                ? attrs.percentage + " % · "
                : "") +
              (attrs.direction || "") +
              (attrs.preset_modes
                ? " · režimy: " + attrs.preset_modes.join(", ")
                : ""),
          ),
        );
      }
      let speeds = this.card(parent, "Vlastné rýchlosti");
      f.speeds.forEach((s, i) => {
        let row = make("div", "card");
        row.append(make("span", "badge", "Rýchlosť " + (i + 1)));
        this.field(row, "Názov tlačidla", s.label, (v) =>
          this.update(() => (s.label = v)),
        );
        let mode = s.actions
          ? "custom"
          : s.preset_mode !== undefined
            ? "preset"
            : "percent";
        this.field(
          row,
          "Spôsob ovládania",
          mode,
          (v) =>
            this.update(() => {
              delete s.actions;
              delete s.preset_mode;
              delete s.percentage;
              if (v === "percent")
                s.percentage = Math.round((100 * (i + 1)) / f.speeds.length);
              if (v === "preset")
                s.preset_mode =
                  ((source && source.attributes.preset_modes) || [])[i] || "";
              if (v === "custom")
                s.actions = [
                  {
                    service: "script.turn_on",
                    target: { entity_id: "script.vlastna_rychlost" },
                  },
                ];
            }, true),
          {
            choices: [
              { value: "percent", label: "Percentá" },
              { value: "preset", label: "Pomenovaný režim" },
              { value: "custom", label: "Vlastná HA akcia" },
            ],
          },
        );
        if (mode === "percent")
          this.field(
            row,
            "Rýchlosť v percentách",
            s.percentage,
            (v) => this.update(() => (s.percentage = v)),
            { type: "number", min: 1, max: 100 },
          );
        else if (mode === "preset")
          this.field(row, "Názov režimu", s.preset_mode, (v) =>
            this.update(() => (s.preset_mode = v)),
          );
        else {
          this.actionForm(row, s.actions, (v) =>
            this.update(() => (s.actions = v)),
          );
          s.match = s.match || {};
          this.entity(
            row,
            "Entita potvrdeného stavu (voliteľné)",
            s.match.entity || "",
            "",
            (v) => this.update(() => (s.match.entity = v)),
          );
          this.field(
            row,
            "Atribút stavu (prázdne = hlavný stav)",
            s.match.attribute || "",
            (v) => this.update(() => (s.match.attribute = v)),
          );
          this.field(
            row,
            "Hodnota pri aktívnej rýchlosti",
            s.match.value === undefined ? "" : s.match.value,
            (v) => this.update(() => (s.match.value = v)),
          );
        }
        speeds.append(row);
      });
      let controls = this.card(parent, "Zobrazované ovládače");
      f.controls = f.controls || {};
      [
        ["direction", "Zmena smeru"],
        ["brightness", "Jas svetla"],
        ["temperature", "Teplota svetla"],
        ["allOff", "Všetko vypnúť"],
        ["timer", "Časovač"],
      ].forEach(([key, label]) =>
        this.field(
          controls,
          label,
          !!f.controls[key],
          (v) => this.update(() => (f.controls[key] = v)),
          { type: "checkbox" },
        ),
      );
      controls.append(
        make(
          "p",
          "hint",
          "Jas, teplota a smer sú aktívne, keď entita v HA poskytuje príslušné údaje. Nejasné symboly z ovládača priraď cez vlastné tlačidlá.",
        ),
      );
      let extras = this.card(parent, "Vlastné tlačidlá");
      f.extras = f.extras || [];
      f.extras.forEach((x, i) => {
        let box = make("div", "card");
        this.field(box, "Názov", x.label, (v) =>
          this.update(() => (x.label = v)),
        );
        this.field(box, "Ikona Lucide", x.icon, (v) =>
          this.update(() => (x.icon = v)),
        );
        this.actionForm(box, x.actions, (v) =>
          this.update(() => (x.actions = v)),
        );
        box.append(
          this.btn("Odstrániť", () =>
            this.update(() => f.extras.splice(i, 1), true),
          ),
        );
        extras.append(box);
      });
      extras.append(
        this.btn("+ Vlastné tlačidlo", () =>
          this.update(
            () =>
              f.extras.push({
                id: "custom_" + Date.now().toString(36),
                label: "Vlastná akcia",
                icon: "sparkles",
                actions: [
                  {
                    service: "script.turn_on",
                    target: { entity_id: "script.vlastna_akcia" },
                  },
                ],
              }),
            true,
          ),
        ),
      );
    }
    actionForm(parent, spec, change) {
      let list = Array.isArray(spec) ? spec : [spec];
      let services = Object.entries(this._hass.services || {}).flatMap(
        ([domain, items]) =>
          Object.entries(items).map(([name, meta]) => ({
            value: domain + "." + name,
            label: domain + "." + name + (meta.name ? " · " + meta.name : ""),
          })),
      );
      if (!services.length)
        services = [
          "script.turn_on",
          "scene.turn_on",
          "light.turn_on",
          "light.turn_off",
          "fan.set_percentage",
          "fan.set_direction",
          "cover.open_cover",
          "cover.close_cover",
        ].map((value) => ({ value, label: value }));
      list.forEach((action, i) => {
        let row = make("div", "card"),
          options = services.slice();
        if (action.service && !options.some((x) => x.value === action.service))
          options.unshift({ value: action.service, label: action.service });
        this.field(
          row,
          "Akcia Home Assistanta",
          action.service,
          (v) => {
            let next = clone(list);
            next[i].service = v;
            list = next;
            change(next);
          },
          { choices: options },
        );
        this.entity(
          row,
          "Cieľová entita",
          (action.target || {}).entity_id || action.entity_id || "",
          "",
          (v) => {
            let next = clone(list);
            next[i].target = { entity_id: v };
            delete next[i].entity_id;
            list = next;
            change(next);
          },
        );
        this.jsonField(
          row,
          "Parametre akcie (voliteľné)",
          action.data || {},
          (v) => {
            let next = clone(list);
            next[i].data = v;
            list = next;
            change(next);
          },
        );
        if (list.length > 1)
          row.append(
            this.btn("Odstrániť akciu", () => {
              let next = clone(list);
              next.splice(i, 1);
              list = next;
              change(next);
              this.render();
            }),
          );
        parent.append(row);
      });
      parent.append(
        this.btn("+ Ďalšia akcia", () => {
          let next = clone(list);
          next.push({
            service: "script.turn_on",
            target: { entity_id: "script.vlastna_akcia" },
          });
          list = next;
          change(next);
          this.render();
        }),
      );
    }
    jsonField(parent, label, value, change, hint) {
      this.field(
        parent,
        label,
        JSON.stringify(value, null, 2),
        (v) => change(JSON.parse(v)),
        { rows: 5 },
      );
      if (hint) parent.append(make("p", "hint", hint));
    }
    renderGridForm(parent, page) {
      let box = this.card(parent, "Rozloženie");
      this.field(
        box,
        "Stĺpce",
        page.grid.columns,
        (v) => this.update(() => (page.grid.columns = v), true),
        { type: "number", min: 1, max: 12 },
      );
      this.field(
        box,
        "Riadky",
        page.grid.rows,
        (v) => this.update(() => (page.grid.rows = v), true),
        { type: "number", min: 1, max: 12 },
      );
      let map = make("div", "grid-map");
      map.style.gridTemplateColumns = "repeat(" + page.grid.columns + ",1fr)";
      for (let row = 1; row <= page.grid.rows; row++)
        for (let col = 1; col <= page.grid.columns; col++) {
          let tile = page.tiles.find((t) => t.row === row && t.col === col),
            cell = make(
              "button",
              "grid-cell" + (tile ? " occupied" : ""),
              tile ? tile.label || tile.id : "＋",
            );
          cell.dataset.row = row;
          cell.dataset.col = col;
          cell.onclick = () => {
            if (tile) {
              this.tileIndex = page.tiles.indexOf(tile);
              this.render();
            }
          };
          cell.ondragover = (e) => e.preventDefault();
          cell.ondrop = (e) => {
            e.preventDefault();
            let index = Number(e.dataTransfer.getData("text/plain"));
            if (!Number.isInteger(index) || !page.tiles[index]) return;
            this.update(() => {
              let moved = page.tiles[index];
              if (tile) {
                tile.row = moved.row;
                tile.col = moved.col;
              }
              moved.row = row;
              moved.col = col;
            }, true);
          };
          if (tile) {
            cell.draggable = true;
            cell.ondragstart = (e) =>
              e.dataTransfer.setData("text/plain", page.tiles.indexOf(tile));
          }
          map.append(cell);
        }
      box.append(map);
      let list = make("div", "tile-list");
      page.tiles.forEach((tile, i) => {
        let b = this.btn((tile.label || tile.id) + " · " + tile.type, () => {
          this.tileIndex = i;
          this.render();
        });
        b.className = "tile-row" + (i === this.tileIndex ? " selected" : "");
        list.append(b);
      });
      box.append(
        list,
        this.btn("+ Tlačidlo", () => {
          let occupied = new Set();
          page.tiles.forEach((t) => {
            for (let y = t.row; y < t.row + (t.rowSpan || 1); y++)
              for (let x = t.col; x < t.col + (t.colSpan || 1); x++)
                occupied.add(x + "," + y);
          });
          let position;
          for (let y = 1; y <= page.grid.rows; y++)
            for (let x = 1; x <= page.grid.columns; x++)
              if (!position && !occupied.has(x + "," + y))
                position = { row: y, col: x };
          if (!position) {
            this.notice("Mriežka je plná. Zväčši rozmery.", true);
            return;
          }
          this.update(() => {
            page.tiles.push({
              id: "tile_" + Date.now().toString(36),
              type: "button",
              behavior: "toggle",
              label: "Svetlo",
              icon: "lightbulb",
              ...position,
            });
            this.tileIndex = page.tiles.length - 1;
          }, true);
        }),
      );
      let tile = page.tiles[Math.min(this.tileIndex, page.tiles.length - 1)];
      if (!tile) return;
      let edit = this.card(parent, "Prvok");
      this.field(
        edit,
        "Typ",
        tile.type,
        (v) =>
          this.update(() => {
            tile.type = v;
            tile.readout = v === "readout";
          }, true),
        {
          choices: [
            "button",
            "dimmer",
            "readout",
            "switcher",
            "split",
            "rocker",
          ],
        },
      );
      this.field(edit, "Názov", tile.label, (v) =>
        this.update(() => (tile.label = v)),
      );
      this.field(edit, "Ikona", tile.icon, (v) =>
        this.update(() => (tile.icon = v)),
      );
      this.entity(edit, "Entita", tile.entity, "", (v) =>
        this.update(() => (tile.entity = v)),
      );
      ["row", "col", "rowSpan", "colSpan"].forEach((k) =>
        this.field(
          edit,
          { row: "Riadok", col: "Stĺpec", rowSpan: "Výška", colSpan: "Šírka" }[
            k
          ],
          tile[k] || 1,
          (v) => this.update(() => (tile[k] = v)),
          { type: "number", min: 1, max: 12 },
        ),
      );
      if (tile.type === "button")
        this.field(
          edit,
          "Správanie",
          tile.behavior || "toggle",
          (v) => this.update(() => (tile.behavior = v)),
          { choices: ["toggle", "push", "state"] },
        );
      if (tile.type === "split")
        this.jsonField(edit, "Segmenty s akciami", tile.buttons || [], (v) =>
          this.update(() => (tile.buttons = v)),
        );
      if (tile.type === "switcher")
        this.jsonField(edit, "Položky", tile.items || [], (v) =>
          this.update(() => (tile.items = v)),
        );
      if (tile.type === "rocker")
        this.jsonField(edit, "Prepínače", tile.rockers || [], (v) =>
          this.update(() => (tile.rockers = v)),
        );
      if (["button", "dimmer"].includes(tile.type)) {
        let event =
          tile.type === "dimmer"
            ? "dim"
            : tile.behavior === "push"
              ? "press"
              : tile.behavior === "state"
                ? "state"
                : "toggle";
        tile.bindings = tile.bindings || {};
        this.field(
          edit,
          "Vlastná akcia namiesto predvoleného ovládania",
          !!tile.bindings[event],
          (v) =>
            this.update(() => {
              if (v)
                tile.bindings[event] = [
                  {
                    service: "script.turn_on",
                    target: { entity_id: "script.vlastna_akcia" },
                  },
                ];
              else delete tile.bindings[event];
            }, true),
          { type: "checkbox" },
        );
        if (tile.bindings[event])
          this.actionForm(edit, tile.bindings[event], (v) =>
            this.update(() => (tile.bindings[event] = v)),
          );
      }
      this.jsonField(
        edit,
        "Vlastné akcie podľa udalosti",
        tile.bindings || {},
        (v) => this.update(() => (tile.bindings = v)),
        'Napríklad {"press":[{"service":"scene.turn_on","target":{"entity_id":"scene.vecer"}}]}',
      );
      edit.append(
        this.btn("Odstrániť prvok", () =>
          this.update(() => page.tiles.splice(this.tileIndex, 1), true),
        ),
      );
    }
    renderCameraForm(parent, page) {
      page.camera = page.camera || { cameras: [] };
      let box = this.card(parent, "Kamery");
      page.camera.cameras.forEach((cam, i) => {
        let card = make("div", "card");
        this.entity(card, "Kamera", cam.entity, "camera", (v) =>
          this.update(() => (cam.entity = v)),
        );
        this.field(card, "Názov", cam.name, (v) =>
          this.update(() => (cam.name = v)),
        );
        this.jsonField(card, "PTZ akcie podľa smeru", cam.ptz || {}, (v) =>
          this.update(() => (cam.ptz = v)),
        );
        card.append(
          this.btn("Odstrániť", () =>
            this.update(() => page.camera.cameras.splice(i, 1), true),
          ),
        );
        box.append(card);
      });
      box.append(
        this.btn("+ Kamera", () =>
          this.update(
            () =>
              page.camera.cameras.push({
                entity: "camera.vchod",
                name: "Vchod",
              }),
            true,
          ),
        ),
      );
      this.field(
        box,
        "Zostať na kamerovej stránke",
        page.camera.keepOnPage !== false,
        (v) => this.update(() => (page.camera.keepOnPage = v)),
        { type: "checkbox" },
      );
      this.field(
        box,
        "Držať displej zapnutý",
        !!page.camera.keepAwake,
        (v) => this.update(() => (page.camera.keepAwake = v)),
        { type: "checkbox" },
      );
    }
    renderDisplay(parent) {
      let box = this.card(parent, "Vzhľad a šetrič");
      this.field(
        box,
        "Dizajn",
        this.draft.theme || "cream",
        (v) =>
          this.update(() => {
            this.draft.theme = v;
            this.device.theme = v;
          }),
        {
          choices: [
            { value: "cream", label: "Cream · teplá krémová" },
            { value: "night", label: "Night · tmavá zelená" },
          ],
        },
      );
      this.field(
        box,
        "Hodiny",
        this.device.clockFace || "digital",
        (v) => this.update(() => (this.device.clockFace = v)),
        {
          choices: [
            { value: "digital", label: "Digitálne" },
            { value: "analog", label: "Analógové" },
          ],
        },
      );
      this.field(
        box,
        "24-hodinový formát",
        this.device.clockFormat24h !== false,
        (v) => this.update(() => (this.device.clockFormat24h = v)),
        { type: "checkbox" },
      );
      this.device.screensaver = this.device.screensaver || {};
      this.field(
        box,
        "Šetrič po sekundách",
        this.device.screensaver.after || 180,
        (v) => this.update(() => (this.device.screensaver.after = v)),
        { type: "number", min: 10, max: 3600 },
      );
      this.field(
        box,
        "Jas šetriča (%)",
        Math.round((this.device.screensaver.dimLevel || 0.15) * 100),
        (v) => this.update(() => (this.device.screensaver.dimLevel = v / 100)),
        { type: "number", min: 5, max: 100 },
      );
      this.field(
        box,
        "Predvolená stránka",
        this.device.defaultPage || 0,
        (v) => this.update(() => (this.device.defaultPage = Number(v))),
        {
          choices: this.draft.pages.map((p, i) => ({
            value: String(i),
            label: p.title || p.id,
          })),
        },
      );
      this.field(
        box,
        "Návrat na predvolenú stránku po sekundách (0 = vypnuté)",
        this.device.inactivityTimeout || 0,
        (v) => this.update(() => (this.device.inactivityTimeout = v)),
        { type: "number", min: 0, max: 3600 },
      );
      this.device.nightMode = this.device.nightMode || {};
      this.field(
        box,
        "Automatický nočný vzhľad",
        !!this.device.nightMode.enabled,
        (v) => this.update(() => (this.device.nightMode.enabled = v)),
        { type: "checkbox" },
      );
      this.field(
        box,
        "Noc začína o hodine",
        this.device.nightMode.start === undefined
          ? 22
          : this.device.nightMode.start,
        (v) => this.update(() => (this.device.nightMode.start = v)),
        { type: "number", min: 0, max: 23 },
      );
      this.field(
        box,
        "Nočný jas (%)",
        this.device.nightMode.brightness || 20,
        (v) => this.update(() => (this.device.nightMode.brightness = v)),
        { type: "number", min: 5, max: 100 },
      );
      this.field(
        box,
        "Noc končí o hodine",
        this.device.nightMode.end === undefined ? 7 : this.device.nightMode.end,
        (v) => this.update(() => (this.device.nightMode.end = v)),
        { type: "number", min: 0, max: 23 },
      );
      this.device.autoBrightness = this.device.autoBrightness || {};
      this.field(
        box,
        "Automatický jas podľa senzora",
        !!this.device.autoBrightness.enabled,
        (v) => this.update(() => (this.device.autoBrightness.enabled = v)),
        { type: "checkbox" },
      );
      this.field(
        box,
        "Prebudiť pri priblížení",
        this.device.screensaver.wakeOnProximity !== false,
        (v) => this.update(() => (this.device.screensaver.wakeOnProximity = v)),
        { type: "checkbox" },
      );
      this.device.motion = this.device.motion || {};
      this.field(
        box,
        "Publikovať pohyb zo senzora",
        !!this.device.motion.enabled,
        (v) => this.update(() => (this.device.motion.enabled = v)),
        { type: "checkbox" },
      );
      box.append(
        make(
          "p",
          "hint",
          "Senzory fungujú iba ak ich Android poskytne. Nočný režim používa čas panela.",
        ),
      );
    }
    renderManage(parent) {
      let p = this.current();
      let box = this.card(parent, "Panel");
      box.append(
        make(
          "p",
          "hint",
          p.id +
            " · " +
            (p.status.info.model || "Model čaká na pripojenie") +
            " · " +
            (p.status.info.version || "") +
            " · " +
            (p.status.info.ip || ""),
        ),
      );
      let panelName = p.name;
      this.field(box, "Názov panela", panelName, (v) => (panelName = v));
      box.append(
        this.btn("Premenovať panel", async () => {
          try {
            await this.api("rename", { name: panelName });
            await this.refreshStatus();
            this.render();
            this.notice("Názov panela uložený");
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let healthBox = this.card(parent, "Kontrola pripojenia");
      let health = p.health;
      if (health) {
        healthBox.append(
          make(
            "p",
            "hint",
            health.ok
              ? "MQTT, panel aj priradené entity sú dostupné."
              : "Našli sa problémy:",
          ),
        );
        for (let issue of health.issues) {
          let item = make("div", "log " + issue.level);
          item.append(
            make("p", "", issue.message),
            make("p", "hint", issue.hint),
          );
          if (issue.entities)
            item.append(make("p", "hint", issue.entities.join(", ")));
          healthBox.append(item);
        }
        if (health.lastSeen)
          healthBox.append(
            make(
              "p",
              "hint",
              "Posledná správa: " + new Date(health.lastSeen).toLocaleString(),
            ),
          );
      }
      healthBox.append(
        this.btn("Obnoviť stav", async () => {
          await this.refreshStatus();
          this.render();
        }),
        this.btn("Znovu odoslať konfiguráciu", async () => {
          try {
            await this.api("push");
            this.notice(
              "Uložená konfigurácia pripravená pre panel. Rozpracované zmeny sa neposielajú.",
            );
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let row = make("div", "row");
      [
        ["Prebudiť", "wake"],
        ["Informácie", "info"],
        ["Screenshot", "screenshot"],
      ].forEach(([label, name]) =>
        row.append(
          this.btn(label, async () => {
            try {
              await this.api("command", {
                name,
                payload: { id: Date.now().toString() },
              });
              this.notice("Príkaz odoslaný");
            } catch (e) {
              this.notice(e.message, true);
            }
          }),
        ),
      );
      box.append(row);
      if (p.status.screenshot) {
        let image = make("img", "screenshot");
        image.alt = "Aktuálny displej panela";
        image.src = "data:image/png;base64," + p.status.screenshot;
        box.append(image);
      }
      let backup = this.card(parent, "Záloha a obnova");
      backup.append(
        this.btn("Exportovať konfiguráciu", () =>
          this.download(p.name + "-aurelvi.json", {
            format: "aurelvi",
            version: 1,
            config: this.draft,
            device: this.device,
          }),
        ),
        this.btn("Importovať konfiguráciu", () => {
          let input = make("input");
          input.type = "file";
          input.accept = ".json,application/json";
          input.onchange = async () => {
            try {
              let imported = JSON.parse(await input.files[0].text());
              let config = imported.config || imported;
              if (!Array.isArray(config.pages))
                throw Error("Súbor neobsahuje stránky");
              this.update(() => {
                this.draft = config;
                this.device = imported.device || {};
              }, true);
              this.notice("Import načítaný. Skontroluj entity a ulož.");
            } catch (e) {
              this.notice(e.message, true);
            }
          };
          input.click();
        }),
        this.btn("Obnoviť predchádzajúcu konfiguráciu", async () => {
          if (this.dirty) {
            this.notice("Najprv ulož alebo odlož aktuálne zmeny.", true);
            return;
          }
          try {
            await this.api("restore", { revision: this.revision });
            await this.load();
            this.notice("Predchádzajúca konfigurácia obnovená");
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let copy = this.card(parent, "Kopírovať na ďalší panel");
      let target = "";
      this.field(copy, "Cieľový panel", "", (v) => (target = v), {
        choices: [
          { value: "", label: "Vyber panel" },
          ...this.data.panels
            .filter((x) => x.paired && x.id !== p.id)
            .map((x) => ({ value: x.id, label: x.name })),
        ],
      });
      copy.append(
        this.btn("Skopírovať stránky", async () => {
          let t = this.data.panels.find((x) => x.id === target);
          if (!t) return;
          try {
            await this.api(
              "save",
              { config: this.draft, device: this.device, revision: t.revision },
              target,
            );
            this.notice("Konfigurácia skopírovaná");
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let update = this.card(parent, "Aktualizácie z GitHubu");
      let settings = clone(this.data.settings || {});
      this.field(
        update,
        "Verejný repozitár",
        settings.githubRepo || "",
        (v) => (settings.githubRepo = v),
      );
      this.field(
        update,
        "Názov APK (voliteľné)",
        settings.githubAsset || "",
        (v) => (settings.githubAsset = v),
      );
      this.field(
        update,
        "Lokálna adresa Home Assistanta pre kamery",
        settings.haUrl || "",
        (v) => (settings.haUrl = v),
      );
      update.append(
        this.btn("Uložiť a skontrolovať", async () => {
          try {
            await this.api("settings", settings, null);
            await this.refreshStatus();
            this.notice("Nastavenie aktualizácií uložené");
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      if (this.data.latest.url) {
        update.append(
          make(
            "p",
            "hint",
            "Vydanie " +
              this.data.latest.version +
              " · " +
              this.data.latest.asset,
          ),
          this.btn(
            "Stiahnuť APK na panel",
            async () => {
              try {
                await this.api("install_update");
                this.notice("Na paneli potvrď inštaláciu v Androide.");
              } catch (e) {
                this.notice(e.message, true);
              }
            },
            true,
          ),
        );
      }
      update.append(
        make(
          "p",
          "hint",
          "Releases musia obsahovať APK podpísané rovnakým kľúčom. Inštalácia vyžaduje potvrdenie na paneli.",
        ),
      );
      let notify = this.card(parent, "Oznámenie");
      let data = {
        title: "Aurelvi",
        message: "",
        priority: "normal",
        timeoutS: 20,
      };
      this.field(notify, "Text", data.message, (v) => (data.message = v));
      this.field(
        notify,
        "Priorita",
        data.priority,
        (v) => (data.priority = v),
        {
          choices: [
            { value: "normal", label: "Bežná · bez prebudenia" },
            { value: "high", label: "Urgentná · prebudiť" },
          ],
        },
      );
      notify.append(
        this.btn("Odoslať", async () => {
          try {
            await this.api("notify", data);
            this.notice("Oznámenie odoslané");
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let log = this.card(parent, "Diagnostika");
      log.append(
        this.btn("Stiahnuť diagnostiku", async () => {
          try {
            this.download(
              "aurelvi-diagnostika.json",
              await this.api("diagnostics"),
            );
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let logs = this.data.logs.filter((x) => !x.panel || x.panel === p.id);
      if (!logs.length)
        log.append(make("p", "hint", "Bez zaznamenaných chýb."));
      logs
        .slice(-12)
        .reverse()
        .forEach((x) =>
          log.append(
            make(
              "p",
              "log " + x.level,
              new Date(x.ts).toLocaleTimeString() + " · " + x.message,
            ),
          ),
        );
      log.append(
        make(
          "p",
          "hint",
          "Rozšírené chyby nájdeš aj v Nastavenia → Systém → Protokoly.",
        ),
      );
    }
    async save() {
      try {
        let result = await this.api("save", {
          config: this.draft,
          device: this.device,
          revision: this.revision,
        });
        this.revision = result.revision;
        this.dirty = false;
        await this.load();
        let health = this.current().health;
        this.notice(
          health && (!health.mqttConnected || !health.panelOnline)
            ? "Uložené v HA. Panel konfiguráciu dostane po obnovení pripojenia."
            : "Uložené. Konfigurácia bola odoslaná na panel.",
        );
      } catch (e) {
        this.notice(e.message, true);
      }
    }
    pageDialog() {
      this.dialog("Nová stránka", (box) => {
        let type = "fan";
        this.field(box, "Typ stránky", type, (v) => (type = v), {
          choices: [
            { value: "fan", label: "Ventilátor so svetlom · 6 rýchlostí" },
            { value: "grid", label: "Vlastná mriežka" },
            { value: "clock", label: "Hodiny" },
            { value: "weather", label: "Počasie" },
            { value: "camera", label: "Kamera" },
            { value: "alarm", label: "Alarmo" },
            { value: "music", label: "Hudba" },
          ],
        });
        box.append(
          this.btn(
            "Pridať",
            () => {
              this.update(() => {
                let id = "page_" + Date.now().toString(36),
                  page = {
                    id,
                    title: {
                      fan: "Ventilátor",
                      grid: "Domov",
                      clock: "Hodiny",
                      weather: "Počasie",
                      camera: "Kamera",
                      alarm: "Alarm",
                      music: "Hudba",
                    }[type],
                    type,
                  };
                if (type === "fan")
                  page.fan = {
                    fanEntity:
                      Object.keys(this._hass.states).find((x) =>
                        x.startsWith("fan."),
                      ) || "fan.stropny_ventilator",
                    lightEntity:
                      Object.keys(this._hass.states).find((x) =>
                        x.startsWith("light."),
                      ) || "",
                    speeds: [17, 33, 50, 67, 83, 100].map((p, i) => ({
                      label: String(i + 1),
                      percentage: p,
                    })),
                    controls: {
                      direction: true,
                      brightness: true,
                      temperature: true,
                      allOff: true,
                      timer: true,
                    },
                    extras: [],
                  };
                if (type === "grid") {
                  page.grid = { columns: 2, rows: 2 };
                  page.tiles = [];
                }
                this.draft.pages.push(page);
                this.pageIndex = this.draft.pages.length - 1;
              }, true);
            },
            true,
          ),
        );
      });
    }
    addPanelDialog() {
      this.dialog("Pridať panel", (box) => {
        let id = "nspanel-7tmv73",
          name = "Obývačka";
        this.field(box, "ID z aplikácie panela", id, (v) => (id = v));
        this.field(box, "Názov miestnosti", name, (v) => (name = v));
        box.append(
          this.btn(
            "Pridať",
            async () => {
              try {
                await this.api("add", { name }, id);
                this.selected = id;
                await this.load();
              } catch (e) {
                this.notice(e.message, true);
              }
            },
            true,
          ),
        );
      });
    }
    dialog(title, render) {
      let overlay = make("div", "modal"),
        box = make("div", "card");
      box.append(make("h2", "", title));
      render(box);
      box.append(this.btn("Zavrieť", () => overlay.remove()));
      overlay.append(box);
      this.shadowRoot.append(overlay);
    }
    download(name, data) {
      let url = URL.createObjectURL(
          new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          }),
        ),
        a = make("a");
      a.href = url;
      a.download = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    async preview() {
      let frame = this.shadowRoot.querySelector("#preview");
      if (!frame || !frame.contentWindow || !this.draft) return;
      let needed = new Set();
      const collect = (value) => {
        if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === "object")
          Object.entries(value).forEach(([key, v]) => {
            if (
              ["entity", "entity_id", "fanEntity", "lightEntity"].includes(key)
            ) {
              (Array.isArray(v) ? v : [v]).forEach((id) => {
                if (typeof id === "string") needed.add(id);
              });
            }
            collect(v);
          });
      };
      collect(this.draft);
      let mirrors = {};
      for (let id of needed) {
        let state = (this._hass.states || {})[id];
        if (!state) {
          mirrors[id.replace(/[^a-z0-9]+/g, "_")] = {
            available: false,
            on: false,
            value: "unavailable",
          };
          continue;
        }
        let a = state.attributes;
        let data = {
          on: state.state === "on",
          value: state.state,
          available: !["unknown", "unavailable"].includes(state.state),
          ...a,
          brightness:
            a.brightness === undefined ? undefined : a.brightness / 255,
        };
        if (id.startsWith("camera.") && a.access_token)
          data.stream =
            location.origin +
            "/api/camera_proxy_stream/" +
            id +
            "?token=" +
            encodeURIComponent(a.access_token);
        mirrors[id.replace(/[^a-z0-9]+/g, "_")] = data;
      }
      let payload = {
          type: "aurelvi-preview",
          config: this.draft,
          device: this.device,
          states: mirrors,
          pageIndex: this.pageIndex,
        },
        signature = JSON.stringify(payload);
      if (signature === this.lastPreview) return;
      this.lastPreview = signature;
      frame.contentWindow.postMessage(
        payload,
        location.origin === "null" ? "*" : location.origin,
      );
    }
    onMessage(event) {
      if (event.origin !== location.origin) return;
      let frame = this.shadowRoot.querySelector("#preview");
      if (!frame || event.source !== frame.contentWindow) return;
      if (event.data && event.data.type === "aurelvi-ready") {
        this.lastPreview = null;
        this.preview();
      }
    }
  }
  if (!customElements.get("aurelvi-studio"))
    customElements.define("aurelvi-studio", AurelviStudio);
})();
