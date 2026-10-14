/* Aurelvi Studio — dependency-free Home Assistant custom panel. MIT. */
(function () {
  "use strict";
  const skinChoices = [{"value": "cream", "label": "Cream"}, {"value": "night", "label": "Night"}, {"value": "rose-room", "label": "Rose Room"}, {"value": "sea-breeze", "label": "Sea Breeze"}, {"value": "cream-glow", "label": "Cream Glow"}, {"value": "porcelain", "label": "Porcelain"}, {"value": "silver-audio", "label": "Silver Audio"}, {"value": "silver-desk", "label": "Silver Desk"}, {"value": "zen-linen", "label": "Zen Linen"}, {"value": "northern-ash", "label": "Northern Ash"}, {"value": "ivory-paddle", "label": "Ivory Paddle"}, {"value": "pastel-pop", "label": "Pastel Pop"}, {"value": "pearl-rocker", "label": "Pearl Rocker"}, {"value": "clay-house", "label": "Clay House"}, {"value": "amber-radio", "label": "Amber Radio"}, {"value": "soft-sand", "label": "Soft Sand"}, {"value": "snow", "label": "Snow"}, {"value": "golden-arch", "label": "Golden Arch"}, {"value": "graphite-fiber", "label": "Graphite Fiber"}, {"value": "walnut-library", "label": "Walnut Library"}, {"value": "violet-city", "label": "Violet City"}, {"value": "abyss", "label": "Abyss"}, {"value": "jade-library", "label": "Jade Library"}, {"value": "retro-receiver", "label": "Retro Receiver"}, {"value": "workshop", "label": "Workshop"}, {"value": "velvet-lounge", "label": "Velvet Lounge"}, {"value": "neon-capsule", "label": "Neon Capsule"}, {"value": "polar-glow", "label": "Polar Glow"}, {"value": "carved-cedar", "label": "Carved Cedar"}, {"value": "circuit", "label": "Circuit"}, {"value": "circuit-glow", "label": "Circuit Glow"}, {"value": "urban-loft", "label": "Urban Loft"}];
  let language = "en";
  const translations = {"Integrácia nie je dostupná": "Integration is unavailable", "Pripojený": "Connected", "Odpojený": "Disconnected", "Spojenie s HA prerušené": "Connection to Home Assistant lost", "Neuložené zmeny": "Unsaved changes", "Lokálne ovládanie": "Local control", "STUDIO · DOMOV NA DOTYK": "STUDIO · HOME AT A TOUCH", "Nový panel · pridať": "New panel · add", "Opustiť neuložené zmeny?": "Discard unsaved changes?", "+ Pridať panel": "+ Add panel", "Načítavam Aurelvi…": "Loading Aurelvi…", "Pripoj aplikáciu na paneli k rovnakému MQTT brokeru a vyber integráciu Aurelvi. Panel sa tu objaví automaticky. Môžeš ho pridať aj pomocou jeho ID.": "Connect the panel app to the same MQTT broker and select Aurelvi mode. The panel will appear here automatically. You can also add it using its ID.", "Pridať prvý panel": "Add your first panel", "Späť zmenu": "Undo", "Uložiť na panel": "Save to panel", "Nový panel čaká na pridanie. Týmto povolíš jeho ovládacie akcie.": "A new panel is waiting to be added. Adding it enables its control actions.", "Pridať tento panel": "Add this panel", "Stránky": "Pages", "Displej": "Display", "Správa": "Manage", "+ Stránka": "+ Page", "Stránka": "Page", "Názov": "Name", "Duplikovať": "Duplicate", "Odstrániť": "Remove", "Zachovaj aspoň jednu stránku": "Keep at least one page", "Počasie z Home Assistanta": "Weather from Home Assistant", "Počasie posiela integrácia cez MQTT. Token HA na paneli nie je potrebný.": "The integration sends weather over MQTT. No Home Assistant token is required on the panel.", "Vyžadovať PIN pri zapnutí": "Require PIN when arming", "Server a token nastavíš na paneli. Natívny reproduktor je aj samostatná media_player entita v HA. Sendspin zostáva experimentálny.": "Configure the server and token on the panel. Its native speaker is also a separate media_player entity in Home Assistant. Sendspin is experimental.", "Vzhľad hodín, šetrič a nočný režim upravíš v záložke Displej.": "Configure the clock, screensaver and night mode in the Display tab.", "NÁHĽAD PANELA": "PANEL PREVIEW", "Skutočné stavy · ovládanie v náhľade je vizuálne": "Live states · preview controls are visual only", "Náhľad Aurelvi": "Aurelvi preview", "Zmeny odošleš tlačidlom Uložiť na panel. Zelená označuje potvrdený stav zariadenia.": "Use Save to panel to send changes. Green indicates a confirmed device state.", "Ventilátor so svetlom": "Fan and light", "Ventilátor": "Fan", "Svetlo (voliteľné)": "Light (optional)", "Počet rýchlostí": "Number of speeds", "Aktuálne: ": "Current: ", " · režimy: ": " · presets: ", "Vlastné rýchlosti": "Custom speeds", "Rýchlosť ": "Speed ", "Názov tlačidla": "Button label", "Spôsob ovládania": "Control method", "Percentá": "Percentage", "Pomenovaný režim": "Named preset", "Vlastná HA akcia": "Custom Home Assistant action", "Rýchlosť v percentách": "Speed percentage", "Názov režimu": "Preset name", "Entita potvrdeného stavu (voliteľné)": "Confirmed state entity (optional)", "Atribút stavu (prázdne = hlavný stav)": "State attribute (empty = main state)", "Hodnota pri aktívnej rýchlosti": "Value when speed is active", "Zobrazované ovládače": "Visible controls", "Smer": "Direction", "Jas": "Brightness", "Teplota svetla": "Light temperature", "Všetko vypnúť": "Turn everything off", "Časovač": "Timer", "Jas, teplota a smer sú aktívne, keď entita v HA poskytuje príslušné údaje. Nejasné symboly z ovládača priraď cez vlastné tlačidlá.": "Brightness, temperature and direction are available when the Home Assistant entity provides the required data. Use custom buttons for additional controls.", "Vlastné tlačidlá": "Custom buttons", "+ Vlastné tlačidlo": "+ Custom button", "Vlastná akcia": "Custom action", "Akcia Home Assistanta": "Home Assistant action", "Cieľová entita": "Target entity", "Parametre akcie (voliteľné)": "Action parameters (optional)", "Odstrániť akciu": "Remove action", "+ Ďalšia akcia": "+ Another action", "Rozloženie": "Layout", "Stĺpce": "Columns", "Riadky": "Rows", "+ Tlačidlo": "+ Button", "Mriežka je plná. Zväčši rozmery.": "The grid is full. Increase its dimensions.", "Riadok": "Row", "Stĺpec": "Column", "Výška": "Height", "Šírka": "Width", "Správanie": "Behavior", "Položky": "Items", "Prepínače": "Switches", "Vlastná akcia namiesto predvoleného ovládania": "Custom action instead of the default control", "Vlastné akcie podľa udalosti": "Custom actions by event", "Odstrániť prvok": "Remove element", "PTZ akcie podľa smeru": "PTZ actions by direction", "Zostať na kamerovej stránke": "Stay on the camera page", "Držať displej zapnutý": "Keep screen on", "Vzhľad a šetrič": "Appearance and screensaver", "Dizajn": "Theme", "Cream · teplá krémová": "Cream · warm cream", "Night · tmavá zelená": "Night · dark green", "Digitálne": "Digital", "Analógové": "Analog", "24-hodinový formát": "24-hour format", "Šetrič po sekundách": "Screensaver delay in seconds", "Jas šetriča (%)": "Screensaver brightness (%)", "Predvolená stránka": "Default page", "Návrat na predvolenú stránku po sekundách (0 = vypnuté)": "Return to default page after seconds (0 = disabled)", "Automatický nočný vzhľad": "Automatic night theme", "Noc začína o hodine": "Night start hour", "Nočný jas (%)": "Night brightness (%)", "Noc končí o hodine": "Night end hour", "Automatický jas podľa senzora": "Automatic sensor brightness", "Prebudiť pri priblížení": "Wake on proximity", "Publikovať pohyb zo senzora": "Publish sensor motion", "Senzory fungujú iba ak ich Android poskytne. Nočný režim používa čas panela.": "Sensors work only when Android provides them. Night mode uses the panel clock.", "Model čaká na pripojenie": "Waiting for panel model", "Názov panela": "Panel name", "Premenovať panel": "Rename panel", "Názov panela uložený": "Panel name saved", "Kontrola pripojenia": "Connection check", "MQTT, panel aj priradené entity sú dostupné.": "MQTT, the panel and assigned entities are available.", "Našli sa problémy:": "Issues found:", "Posledná správa: ": "Last message: ", "Obnoviť stav": "Refresh status", "Znovu odoslať konfiguráciu": "Resend configuration", "Uložená konfigurácia pripravená pre panel. Rozpracované zmeny sa neposielajú.": "Saved configuration sent to the panel. Unsaved changes are excluded.", "Prebudiť": "Wake", "Informácie": "Information", "Príkaz odoslaný": "Command sent", "Aktuálny displej panela": "Current panel screen", "Záloha a obnova": "Backup and restore", "Exportovať konfiguráciu": "Export configuration", "Importovať konfiguráciu": "Import configuration", "Súbor neobsahuje stránky": "The file does not contain pages", "Import načítaný. Skontroluj entity a ulož.": "Import loaded. Check the entities and save.", "Obnoviť predchádzajúcu konfiguráciu": "Restore previous configuration", "Najprv ulož alebo odlož aktuálne zmeny.": "Save or discard your current changes first.", "Predchádzajúca konfigurácia obnovená": "Previous configuration restored", "Kopírovať na ďalší panel": "Copy to another panel", "Cieľový panel": "Target panel", "Skopírovať stránky": "Copy pages", "Konfigurácia skopírovaná": "Configuration copied", "Aktualizácie z GitHubu": "GitHub updates", "Verejný repozitár": "Public repository", "Názov APK (voliteľné)": "APK filename (optional)", "Lokálna adresa Home Assistanta pre kamery": "Local Home Assistant URL for cameras", "Uložiť a skontrolovať": "Save and check", "Nastavenie aktualizácií uložené": "Update settings saved", "Stiahnuť APK na panel": "Download APK to panel", "Na paneli potvrď inštaláciu v Androide.": "Confirm the Android installation on the panel.", "Releases musia obsahovať APK podpísané rovnakým kľúčom. Inštalácia vyžaduje potvrdenie na paneli.": "Releases must contain an APK signed with the same key. Installation requires confirmation on the panel.", "Oznámenie": "Notification", "Bežná · bez prebudenia": "Normal · do not wake", "Urgentná · prebudiť": "Urgent · wake panel", "Odoslať": "Send", "Oznámenie odoslané": "Notification sent", "Stiahnuť diagnostiku": "Download diagnostics", "Bez zaznamenaných chýb.": "No errors recorded.", "Rozšírené chyby nájdeš aj v Nastavenia → Systém → Protokoly.": "See Settings → System → Logs for more details.", "Uložené v HA. Panel konfiguráciu dostane po obnovení pripojenia.": "Saved in Home Assistant. The panel will receive the configuration when it reconnects.", "Uložené. Konfigurácia bola odoslaná na panel.": "Saved. Configuration sent to the panel.", "Nová stránka": "New page", "Typ stránky": "Page type", "Ventilátor so svetlom · 6 rýchlostí": "Fan and light · 6 speeds", "Vlastná mriežka": "Custom grid", "Počasie": "Weather", "Hodiny": "Clock", "Pridať": "Add", "Pridať panel": "Add panel", "Obývačka": "Living room", "ID z aplikácie panela": "ID from panel app", "Názov miestnosti": "Room name", "Zavrieť": "Close", "Domov": "Home", "PANELY": "PANELS"};
  const tr = (text) => language.startsWith("sk") ? text : (translations[text] || text);

  Object.assign(translations,{"Ikona Lucide": "Lucide icon", "Jas svetla": "Light brightness", "Segmenty s akciami": "Segments with actions", "TVOJE PANELY": "YOUR PANELS", "Vitaj v Aurelvi": "Welcome to Aurelvi", "Vyber panel": "Select panel", "Vydanie ": "Release ", "Weather entita": "Weather entity", "Zmena smeru": "Change direction", "Kamera": "Camera", "+ Kamera": "+ Camera", "Entita": "Entity"});
  Object.assign(translations,{"Ikona": "Icon", "Svetlo": "Light", "Priorita": "Priority", "Diagnostika": "Diagnostics"});
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const style = `:host{display:block;height:100%;font-family:var(--paper-font-body1_-_font-family,Roboto,Arial);color:#263d31;background:#f4f1e9;--green:#28664f;--line:#dddcd2;--muted:#738277}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer;color:inherit}button:disabled{opacity:.5;cursor:default}.top{height:72px;padding:14px 28px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;background:#faf8f2}.mark{width:34px;height:34px}.brand{font-size:25px;font-weight:650;letter-spacing:-1px}.sub{font-size:12px;color:var(--muted)}.top .sub{margin-left:10px}.grow{flex:1}.pill{font-size:11px;border:1px solid var(--line);border-radius:20px;padding:6px 12px}.layout{display:grid;grid-template-columns:224px 1fr;height:calc(100% - 72px)}aside{border-right:1px solid var(--line);padding:22px 16px;overflow:auto;background:#edece4}.overline{font-size:10px;color:var(--muted);letter-spacing:1.5px;font-weight:700;margin:0 8px 12px}.panel{width:100%;border:1px solid transparent;background:none;border-radius:13px;padding:13px 12px;text-align:left;margin-bottom:8px;display:flex;gap:10px;align-items:center}.panel.active{border-color:#aabeb0;background:#f9f8f1}.panel strong{font-size:14px}.panel small{display:block;font-size:10px;color:var(--muted);margin-top:4px}.dot{width:7px;height:7px;border-radius:50%;background:#ae9871;flex-shrink:0}.dot.online{background:#37825b}.content{overflow:auto;padding:26px 30px}.toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:23px}.toolbar h1{margin:0;font-size:27px;font-weight:600;letter-spacing:-.6px}.btn{min-height:38px;border:1px solid var(--line);border-radius:10px;background:#faf9f4;padding:8px 13px;font-size:12px}.primary{background:var(--green);color:#fff;border-color:var(--green)}.tabs{display:flex;gap:7px;margin-bottom:22px}.tabs button{border:0;background:none;padding:10px 14px;font-size:13px;border-radius:10px}.tabs button.active{background:#e3eadf;color:var(--green);font-weight:600}.editor{display:grid;grid-template-columns:minmax(280px,1fr) minmax(280px,430px);gap:28px;align-items:start}.card{background:#fcfaf5;border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:16px}.card h2{font-size:17px;margin:0 0 14px}.fields{display:grid;gap:12px}.field{display:flex;flex-direction:column;gap:5px;font-size:12px}.field>span{color:#637469;font-weight:500}.field input,.field select,.field textarea{width:100%;padding:9px 10px;border:1px solid #cfdbcf;border-radius:8px;background:white;color:#263d31;font-size:13px;min-height:38px}.field textarea{min-height:92px;font:12px ui-monospace,monospace}.field input[type=checkbox]{accent-color:var(--green);width:20px;min-height:20px}.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.row>*{flex:1;min-width:0}.pages{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:15px}.page{border:1px solid var(--line);padding:7px 12px;border-radius:9px;background:#faf9f4;font-size:12px}.page.active{color:var(--green);border-color:#80a58d;background:#e8efdf}.hint{font-size:12px;color:var(--muted);line-height:1.6}.preview-wrap{position:sticky;top:0}.preview-label{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin:0 3px 11px}.preview-shell{padding:13px;border-radius:29px;background:#222b25;box-shadow:0 15px 30px #283e3321}.preview-shell iframe{width:100%;aspect-ratio:1;border:0;border-radius:17px;background:#f2ece1;display:block}.empty{text-align:center;max-width:560px;margin:70px auto}.empty h1{font-size:30px}.empty p{font-size:14px;line-height:1.8;color:var(--muted)}.notice{padding:11px 15px;border-radius:10px;background:#e5eddf;border:1px solid #b9d0bd;font-size:12px;margin-bottom:18px;line-height:1.5}.notice.error{background:#f9e9dd;border-color:#dca690;color:#8b4329}.tile-list{display:grid;gap:7px}.tile-row{padding:11px;border:1px solid var(--line);border-radius:10px;background:white;display:flex;gap:8px;align-items:center;font-size:12px}.tile-row[draggable=true]{cursor:grab}.tile-row.selected{border-color:#6d9c7f}.log{font:12px ui-monospace,monospace;line-height:1.7;overflow-wrap:anywhere}.log.error{color:#a34334}.screenshot{max-width:100%;border-radius:12px}.speed-form{display:grid;gap:9px;margin-top:10px}.speed-form .card{padding:12px;margin:0}.badge{font-size:10px;padding:3px 7px;background:#e6ede0;color:#397d55;border-radius:7px}.footer{font-size:10px;color:var(--muted);margin-top:20px}.modal{position:fixed;inset:0;background:#1e332e88;display:flex;align-items:center;justify-content:center;z-index:20;padding:25px}.modal>.card{width:520px;max-height:85vh;overflow:auto}.grid-map{display:grid;gap:6px;margin-bottom:16px;min-height:130px}.grid-cell{border:1px dashed #bdcabc;border-radius:8px;min-height:42px;padding:6px;background:#f1f2e8;font-size:11px}.grid-cell.occupied{background:#e2eadb;border-style:solid;cursor:grab}.warn{color:#9b7040}.dirty{font-size:11px;color:#997842}@media(max-width:1050px){.editor{grid-template-columns:1fr}.preview-wrap{position:static;max-width:430px;grid-row:1}.layout{grid-template-columns:185px 1fr}.content{padding:20px}.top{padding:15px 20px}.top .sub{display:none}}@media(max-width:650px){.layout{display:block;height:auto}aside{display:flex;gap:6px;overflow-x:auto;border-right:0;border-bottom:1px solid var(--line);padding:9px}.panel{min-width:150px;margin:0}.overline{display:none}.top{height:61px}.content{padding:16px}.toolbar h1{font-size:23px}.top .pill{display:none}.preview-shell{padding:9px}.row>*{min-width:100px}:host{overflow:auto}.card{padding:15px}}`;
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
      this.notificationDraft = null;
      this.boundMessage = this.onMessage.bind(this);
    }
    set hass(value) {
      const previousLanguage = language;
      language = (value.locale && value.locale.language) || value.language || "en";
      this._hass = value;
      if (previousLanguage !== language && this.data) this.render();
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
        this.notice(e.message || tr("Integrácia nie je dostupná"), true);
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
            node.textContent = panel.status.online ? tr("Pripojený") : tr("Odpojený");
          const shot=this.shadowRoot.querySelector("#live-panel-screenshot");
          if(shot && panel && panel.status.screenshot){shot.src="data:image/png;base64,"+panel.status.screenshot;shot.hidden=false;}
          // Preserve partially entered management forms during background polling.
          this.preview();
        }
      } catch (e) {
        let node = this.shadowRoot.querySelector("#connection");
        if (node) node.textContent = tr("Spojenie s HA prerušené");
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
        if (d) d.textContent = tr("Neuložené zmeny");
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
              : (input.type === "number" || input.type === "range")
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
      css.textContent = style + "\n/* Studio 0.3.4: pages / preview / inspector workspace. */\n:host{background:#f1f3f5;--line:#dce2e4;--muted:#75828a;color:#293c43}\n.top{background:#f7f9fa;padding:12px 28px;height:72px}.top .sub{display:none}.top select{min-width:190px;max-width:300px;border:1px solid var(--line);background:white;padding:10px;border-radius:12px;font-size:13px;color:inherit}\n.layout{display:block;height:calc(100% - 72px);overflow:auto}.layout>aside{display:none}.content{max-width:1480px;margin:auto;padding:22px 28px;overflow:visible}.toolbar{margin-bottom:14px}.toolbar h1{font-size:24px}.tabs{border-bottom:1px solid var(--line);border-radius:0;padding-bottom:6px}.tabs button.active{background:#e1efea}\n.workspace{display:grid;grid-template-columns:185px minmax(0,1fr);gap:18px;align-items:start}.workspace>.pages{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:15px;padding:12px;gap:8px;position:sticky;top:0}.workspace>.pages .page{text-align:left;width:100%;min-height:48px}.workspace>.editor{grid-template-columns:minmax(280px,480px) minmax(280px,1fr);gap:20px}.workspace>.editor>.preview-wrap{grid-column:1;grid-row:1;position:sticky;top:0}.workspace>.editor>.inspector{grid-column:2;min-width:0}\n.card{background:#fff;border-radius:15px;padding:18px}.preview-shell{border-radius:30px;padding:14px;background:linear-gradient(140deg,#31383c,#171c20);box-shadow:0 18px 30px #1a252b24}.preview-shell iframe{border-radius:18px}.studio-hero{background:linear-gradient(120deg,#e1eee9,#f9fbfa);border:1px solid #c6dcd0;border-radius:15px;padding:18px 20px;display:flex;gap:20px;align-items:center;margin-bottom:18px}.studio-hero h2{font-size:18px;margin:0 0 5px}.studio-hero p{font-size:13px;color:#657a70;margin:0;line-height:1.5}.studio-hero button{white-space:nowrap}\n.theme-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.theme-swatch{min-height:64px;border:2px solid transparent;border-radius:10px;padding:7px;text-align:left;font-size:10px;cursor:pointer;box-shadow:inset 0 0 0 1px #0001}.theme-swatch.selected{outline:2px solid var(--green);outline-offset:1px}.theme-swatch i{display:block;border-radius:5px;height:18px;width:65%;margin-bottom:4px;box-shadow:1px 2px 3px #0003}.wallpaper-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.wallpaper-swatch{height:65px;border:2px solid transparent;border-radius:10px;font-size:10px;color:white;text-shadow:0 1px 3px #000b;cursor:pointer}.wallpaper-swatch.selected{outline:2px solid var(--green)}.device-grid{display:grid;grid-template-columns:repeat(3,minmax(240px,1fr));gap:16px;align-items:start}.device-grid .card{margin-bottom:0}.wallpaper-thumb{width:100%;max-height:140px;object-fit:cover;border-radius:10px;margin-top:8px}.panel-screenshot{width:100%;border-radius:10px;background:#111;min-height:120px;object-fit:contain}.version-pill{font-size:11px;color:#58766b}\n@media(max-width:1150px){.workspace{grid-template-columns:155px 1fr}.workspace>.editor{grid-template-columns:1fr}.workspace>.editor>.preview-wrap{position:static;max-width:430px;grid-column:1}.workspace>.editor>.inspector{grid-column:1;grid-row:2}.device-grid{grid-template-columns:repeat(2,minmax(230px,1fr))}}\n@media(max-width:700px){.top{padding:10px;height:auto;flex-wrap:wrap}.top select{min-width:120px;max-width:190px}.content{padding:14px}.workspace{display:block}.workspace>.pages{position:static;display:flex;flex-direction:row;overflow:auto;margin-bottom:14px}.workspace>.pages .page{min-width:110px}.device-grid{display:block}.device-grid .card{margin-bottom:14px}.studio-hero{display:block}.studio-hero button{margin-top:12px}.theme-grid{grid-template-columns:repeat(4,1fr)}}\n";
      r.append(css);
      let top = make("header", "top");
      let logo = make("img", "mark");
      logo.src = "/aurelvi-static/logo-symbol.svg";
      logo.alt = "";
      top.append(
        logo,
        make("span", "brand", "Aurelvi"),
        make("span", "sub", tr("STUDIO · DOMOV NA DOTYK")),
        make("span", "grow"),
        make("span", "pill", tr("Lokálne ovládanie")),
      );
      top.append(make("span","version-pill","Studio "+((this.data || {}).version || "0.3.4")));
      if(this.data && this.data.panels.length){
        const selector=make("select");selector.setAttribute("aria-label",language.startsWith("sk")?"Panel":"Panel");
        this.data.panels.forEach(p=>{const option=make("option","",p.name+" · "+(p.status.online?tr("Pripojený"):tr("Odpojený")));option.value=p.id;selector.append(option);});selector.value=this.selected;
        selector.onchange=()=>{if(this.dirty && !window.confirm(tr("Opustiť neuložené zmeny?"))){selector.value=this.selected;return;}this.selected=selector.value;this.loadDraft();this.render();};
        top.append(selector);
      }
      top.append(this.btn(tr("+ Pridať panel"),()=>this.addPanelDialog()));
      r.append(top);
      let layout = make("div", "layout"),
        aside = make("aside");
      aside.append(make("div", "overline", tr("TVOJE PANELY")));
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
              p.paired ? p.status.info.ip || p.id : tr("Nový panel · pridať"),
            ),
          );
          b.append(dot, text);
          b.onclick = () => {
            if (this.dirty && !window.confirm(tr("Opustiť neuložené zmeny?")))
              return;
            this.selected = p.id;
            this.loadDraft();
            this.render();
          };
          aside.append(b);
        });
      aside.append(this.btn(tr("+ Pridať panel"), () => this.addPanelDialog()));
      let content = make("main", "content");
      layout.append(content);
      if (!this.data) {
        content.append(make("div", "empty", tr("Načítavam Aurelvi…")));
        return;
      }
      let p = this.current();
      if (!p) {
        let box = make("div", "empty");
        box.append(
          make("h1", "", tr("Vitaj v Aurelvi")),
          make(
            "p",
            "",
            tr("Pripoj aplikáciu na paneli k rovnakému MQTT brokeru a vyber integráciu Aurelvi. Panel sa tu objaví automaticky. Môžeš ho pridať aj pomocou jeho ID."),
          ),
          this.btn(tr("Pridať prvý panel"), () => this.addPanelDialog(), true),
        );
        content.append(box);
        return;
      }
      let toolbar = make("div", "toolbar");
      toolbar.append(make("h1", "", p.name));
      let connection = make(
        "span",
        "badge",
        p.status.online ? tr("Pripojený") : tr("Odpojený"),
      );
      connection.id = "connection";
      toolbar.append(connection, make("span", "grow"));
      let dirty = make("span", "dirty", this.dirty ? tr("Neuložené zmeny") : "");
      dirty.id = "dirty";
      toolbar.append(
        dirty,
        this.btn(tr("Späť zmenu"), () => {
          let old = this.undo.pop();
          if (old) {
            this.draft = old.config;
            this.device = old.device;
            this.dirty = true;
            this.render();
          }
        }),
        this.btn(language.startsWith("sk") ? "Vytvoriť miestnosť" : "Build room", () => this.roomWizard()),
        this.btn(tr("Uložiť na panel"), () => this.save(), true),
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
            tr("Nový panel čaká na pridanie. Týmto povolíš jeho ovládacie akcie."),
          ),
          this.btn(
            tr("Pridať tento panel"),
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
        ["pages", tr("Stránky")],
        ["display", tr("Displej")],
        ["notify", language.startsWith("sk") ? "Oznámenia" : "Notify"],
        ["manage", tr("Správa")],
        ["advanced", language.startsWith("sk") ? "Pokročilé" : "Advanced"],
      ].forEach(([id, label]) => {
        let b = this.btn(label, () => {
          this.tab = id;
          this.render();
        });
        b.className = this.tab === id ? "active" : "";
        tabs.append(b);
      });
      content.append(tabs);
      const hero=make("section","studio-hero"),intro=make("div","grow");
      intro.append(make("h2","",language.startsWith("sk")?"Vytvor ovládanie celej miestnosti":"Build controls for an entire room"),make("p","",language.startsWith("sk")?"Vyber miestnosť z HA. Aurelvi navrhne stránky podľa jej zariadení; pred uložením ich môžeš upraviť.":"Choose a Home Assistant room. Aurelvi drafts pages from its devices; review and edit before saving."));
      hero.append(intro,this.btn(language.startsWith("sk")?"Vytvoriť miestnosť":"Build room",()=>this.roomWizard(),true));content.append(hero);
      if (this.tab === "pages") this.renderPages(content);
      else if (this.tab === "display") this.renderDisplay(content);
      else if(this.tab === "notify") this.renderNotify(content);
      else if(this.tab === "advanced") this.renderAdvanced(content);
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
      pages.append(this.btn(tr("+ Stránka"), () => this.pageDialog()));
      const workspace=make("div","workspace");workspace.append(pages);parent.append(workspace);
      const shot=make("img","panel-screenshot");shot.id="live-panel-screenshot";shot.alt=language.startsWith("sk")?"Snímka panela":"Panel screenshot";shot.hidden=!this.current().status.screenshot;if(!shot.hidden)shot.src="data:image/png;base64,"+this.current().status.screenshot;
      pages.append(this.btn(language.startsWith("sk")?"Obnoviť snímku":"Refresh screenshot",async()=>{try{await this.api("command",{name:"screenshot",payload:{id:"studio"}});await this.refreshStatus();}catch(e){this.notice(e.message,true);}}),shot);
      this.pageIndex = Math.max(
        0,
        Math.min(this.pageIndex, this.draft.pages.length - 1),
      );
      let page = this.draft.pages[this.pageIndex];
      let editor = make("div", "editor"),
        form = make("div","inspector"),
        preview = make("div", "preview-wrap");
      editor.append(preview, form);
      workspace.append(editor);
      this.renderAppearance(form);
      let info = this.card(form, tr("Stránka"));
      this.field(info, tr("Názov"), page.title, (v) =>
        this.update(() => (page.title = v)),
      );
      let actions = make("div", "row");
      actions.append(
        this.btn(tr("Duplikovať"), () =>
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
        this.btn(tr("Odstrániť"), () => {
          if (this.draft.pages.length < 2) {
            this.notice(tr("Zachovaj aspoň jednu stránku"), true);
            return;
          }
          this.update(() => this.draft.pages.splice(this.pageIndex, 1), true);
        }),
      );
      info.append(actions);
      if (page.type === "fan") this.renderFanForm(form, page);
      else if (page.type === "grid") this.renderGridForm(form, page);
      else if (page.type === "weather") {
        let box = this.card(form, tr("Počasie z Home Assistanta"));
        page.weather = page.weather || {};
        this.entity(
          box,
          tr("Weather entita"),
          page.weather.entity,
          "weather",
          (v) => this.update(() => (page.weather.entity = v)),
        );
        box.append(
          make(
            "p",
            "hint",
            tr("Počasie posiela integrácia cez MQTT. Token HA na paneli nie je potrebný."),
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
          tr("Vyžadovať PIN pri zapnutí"),
          page.alarm.codeArmRequired !== false,
          (v) => this.update(() => (page.alarm.codeArmRequired = v)),
          { type: "checkbox" },
        );
      } else if (page.type === "music") {
        this.card(form, "Music Assistant").append(
          make(
            "p",
            "hint",
            tr("Server a token nastavíš na paneli. Natívny reproduktor je aj samostatná media_player entita v HA. Sendspin zostáva experimentálny."),
          ),
        );
      } else {
        this.card(form, tr("Hodiny")).append(
          make(
            "p",
            "hint",
            tr("Vzhľad hodín, šetrič a nočný režim upravíš v záložke Displej."),
          ),
        );
      }
      let label = make("div", "preview-label");
      label.append(
        make("span", "", tr("NÁHĽAD PANELA")),
        make("span", "", tr("Skutočné stavy · ovládanie v náhľade je vizuálne")),
      );
      let shell = make("div", "preview-shell"),
        iframe = make("iframe");
      iframe.id = "preview";
      iframe.title = tr("Náhľad Aurelvi");
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
          tr("Zmeny odošleš tlačidlom Uložiť na panel. Zelená označuje potvrdený stav zariadenia."),
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
        box = this.card(parent, tr("Ventilátor so svetlom"));
      this.entity(box, tr("Ventilátor"), f.fanEntity, "fan", (v) =>
        this.update(() => (f.fanEntity = v), true),
      );
      this.entity(box, tr("Svetlo (voliteľné)"), f.lightEntity, "light", (v) =>
        this.update(() => (f.lightEntity = v), true),
      );
      this.field(
        box,
        tr("Počet rýchlostí"),
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
            tr("Aktuálne: ") +
              (attrs.percentage !== undefined
                ? attrs.percentage + " % · "
                : "") +
              (attrs.direction || "") +
              (attrs.preset_modes
                ? tr(" · režimy: ") + attrs.preset_modes.join(", ")
                : ""),
          ),
        );
      }
      let speeds = this.card(parent, tr("Vlastné rýchlosti"));
      f.speeds.forEach((s, i) => {
        let row = make("div", "card");
        row.append(make("span", "badge", tr("Rýchlosť ") + (i + 1)));
        this.field(row, tr("Názov tlačidla"), s.label, (v) =>
          this.update(() => (s.label = v)),
        );
        let mode = s.actions
          ? "custom"
          : s.preset_mode !== undefined
            ? "preset"
            : "percent";
        this.field(
          row,
          tr("Spôsob ovládania"),
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
              { value: "percent", label: tr("Percentá") },
              { value: "preset", label: tr("Pomenovaný režim") },
              { value: "custom", label: tr("Vlastná HA akcia") },
            ],
          },
        );
        if (mode === "percent")
          this.field(
            row,
            tr("Rýchlosť v percentách"),
            s.percentage,
            (v) => this.update(() => (s.percentage = v)),
            { type: "number", min: 1, max: 100 },
          );
        else if (mode === "preset")
          this.field(row, tr("Názov režimu"), s.preset_mode, (v) =>
            this.update(() => (s.preset_mode = v)),
          );
        else {
          this.actionForm(row, s.actions, (v) =>
            this.update(() => (s.actions = v)),
          );
          s.match = s.match || {};
          this.entity(
            row,
            tr("Entita potvrdeného stavu (voliteľné)"),
            s.match.entity || "",
            "",
            (v) => this.update(() => (s.match.entity = v)),
          );
          this.field(
            row,
            tr("Atribút stavu (prázdne = hlavný stav)"),
            s.match.attribute || "",
            (v) => this.update(() => (s.match.attribute = v)),
          );
          this.field(
            row,
            tr("Hodnota pri aktívnej rýchlosti"),
            s.match.value === undefined ? "" : s.match.value,
            (v) => this.update(() => (s.match.value = v)),
          );
        }
        speeds.append(row);
      });
      let controls = this.card(parent, tr("Zobrazované ovládače"));
      f.controls = f.controls || {};
      [
        ["direction", tr("Zmena smeru")],
        ["brightness", tr("Jas svetla")],
        ["temperature", tr("Teplota svetla")],
        ["allOff", tr("Všetko vypnúť")],
        ["timer", tr("Časovač")],
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
          tr("Jas, teplota a smer sú aktívne, keď entita v HA poskytuje príslušné údaje. Nejasné symboly z ovládača priraď cez vlastné tlačidlá."),
        ),
      );
      let extras = this.card(parent, tr("Vlastné tlačidlá"));
      f.extras = f.extras || [];
      f.extras.forEach((x, i) => {
        let box = make("div", "card");
        this.field(box, tr("Názov"), x.label, (v) =>
          this.update(() => (x.label = v)),
        );
        this.field(box, tr("Ikona Lucide"), x.icon, (v) =>
          this.update(() => (x.icon = v)),
        );
        this.actionForm(box, x.actions, (v) =>
          this.update(() => (x.actions = v)),
        );
        box.append(
          this.btn(tr("Odstrániť"), () =>
            this.update(() => f.extras.splice(i, 1), true),
          ),
        );
        extras.append(box);
      });
      extras.append(
        this.btn(tr("+ Vlastné tlačidlo"), () =>
          this.update(
            () =>
              f.extras.push({
                id: "custom_" + Date.now().toString(36),
                label: tr("Vlastná akcia"),
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
          tr("Akcia Home Assistanta"),
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
          tr("Cieľová entita"),
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
          tr("Parametre akcie (voliteľné)"),
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
            this.btn(tr("Odstrániť akciu"), () => {
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
        this.btn(tr("+ Ďalšia akcia"), () => {
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
      let box = this.card(parent, tr("Rozloženie"));
      this.field(
        box,
        tr("Stĺpce"),
        page.grid.columns,
        (v) => this.update(() => (page.grid.columns = v), true),
        { type: "number", min: 1, max: 12 },
      );
      this.field(
        box,
        tr("Riadky"),
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
        this.btn(tr("+ Tlačidlo"), () => {
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
            this.notice(tr("Mriežka je plná. Zväčši rozmery."), true);
            return;
          }
          this.update(() => {
            page.tiles.push({
              id: "tile_" + Date.now().toString(36),
              type: "button",
              behavior: "toggle",
              label: tr("Svetlo"),
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
      this.field(edit, tr("Názov"), tile.label, (v) =>
        this.update(() => (tile.label = v)),
      );
      this.field(edit, tr("Ikona"), tile.icon, (v) =>
        this.update(() => (tile.icon = v)),
      );
      this.entity(edit, tr("Entita"), tile.entity, "", (v) =>
        this.update(() => (tile.entity = v)),
      );
      ["row", "col", "rowSpan", "colSpan"].forEach((k) =>
        this.field(
          edit,
          { row: tr("Riadok"), col: tr("Stĺpec"), rowSpan: tr("Výška"), colSpan: tr("Šírka") }[
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
          tr("Správanie"),
          tile.behavior || "toggle",
          (v) => this.update(() => (tile.behavior = v)),
          { choices: ["toggle", "push", "state"] },
        );
      if (tile.type === "split")
        this.jsonField(edit, tr("Segmenty s akciami"), tile.buttons || [], (v) =>
          this.update(() => (tile.buttons = v)),
        );
      if (tile.type === "switcher")
        this.jsonField(edit, tr("Položky"), tile.items || [], (v) =>
          this.update(() => (tile.items = v)),
        );
      if (tile.type === "rocker")
        this.jsonField(edit, tr("Prepínače"), tile.rockers || [], (v) =>
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
          tr("Vlastná akcia namiesto predvoleného ovládania"),
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
        tr("Vlastné akcie podľa udalosti"),
        tile.bindings || {},
        (v) => this.update(() => (tile.bindings = v)),
        'Napríklad {"press":[{"service":"scene.turn_on","target":{"entity_id":"scene.vecer"}}]}',
      );
      edit.append(
        this.btn(tr("Odstrániť prvok"), () =>
          this.update(() => page.tiles.splice(this.tileIndex, 1), true),
        ),
      );
    }
    renderCameraForm(parent, page) {
      page.camera = page.camera || { cameras: [] };
      let box = this.card(parent, "Kamery");
      page.camera.cameras.forEach((cam, i) => {
        let card = make("div", "card");
        this.entity(card, tr("Kamera"), cam.entity, "camera", (v) =>
          this.update(() => (cam.entity = v)),
        );
        this.field(card, tr("Názov"), cam.name, (v) =>
          this.update(() => (cam.name = v)),
        );
        this.jsonField(card, tr("PTZ akcie podľa smeru"), cam.ptz || {}, (v) =>
          this.update(() => (cam.ptz = v)),
        );
        card.append(
          this.btn(tr("Odstrániť"), () =>
            this.update(() => page.camera.cameras.splice(i, 1), true),
          ),
        );
        box.append(card);
      });
      box.append(
        this.btn(tr("+ Kamera"), () =>
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
        tr("Zostať na kamerovej stránke"),
        page.camera.keepOnPage !== false,
        (v) => this.update(() => (page.camera.keepOnPage = v)),
        { type: "checkbox" },
      );
      this.field(
        box,
        tr("Držať displej zapnutý"),
        !!page.camera.keepAwake,
        (v) => this.update(() => (page.camera.keepAwake = v)),
        { type: "checkbox" },
      );
    }
    renderAppearance(parent) {
      const sk=language.startsWith("sk"),box=this.card(parent,sk?"Vzhľad a tapeta":"Appearance and wallpaper");
      this.field(box,sk?"Vzhľad panela":"Panel skin",this.draft.theme || "cream",v=>this.update(()=>{this.draft.theme=v;this.device.theme=v;},true),{choices:skinChoices});
      const themes=make("div","theme-grid");
      const definitions=[{"id":"cream","label":"Cream","bg":"#f2ece1","ink":"#293b32","accent":"#2f805b","material":"soft","dark":false},{"id":"night","label":"Night","bg":"#171f1c","ink":"#e6ece7","accent":"#8fdbad","material":"soft","dark":true},{"id":"rose-room","label":"Rose Room","bg":"#f0dfe1","ink":"#644750","accent":"#af5676","material":"soft","dark":false},{"id":"sea-breeze","label":"Sea Breeze","bg":"#e4efed","ink":"#345d61","accent":"#218b90","material":"flat","dark":false},{"id":"cream-glow","label":"Cream Glow","bg":"#efe9dc","ink":"#494f3c","accent":"#39a56e","material":"glow","dark":false},{"id":"porcelain","label":"Porcelain","bg":"#f5f6f2","ink":"#344541","accent":"#288978","material":"flat","dark":false},{"id":"silver-audio","label":"Silver Audio","bg":"#cfd7db","ink":"#293a43","accent":"#2ba0b8","material":"metal","dark":false},{"id":"silver-desk","label":"Silver Desk","bg":"#d7dcde","ink":"#34434a","accent":"#218f85","material":"brushed","dark":false},{"id":"zen-linen","label":"Zen Linen","bg":"#e7e3d6","ink":"#4c5548","accent":"#6c895b","material":"linen","dark":false},{"id":"northern-ash","label":"Northern Ash","bg":"#e9d8b9","ink":"#514530","accent":"#6f8b4d","material":"wood","dark":false},{"id":"ivory-paddle","label":"Ivory Paddle","bg":"#e8ece5","ink":"#37473f","accent":"#45945d","material":"paddle","dark":false},{"id":"pastel-pop","label":"Pastel Pop","bg":"#eadbf2","ink":"#51405f","accent":"#a85dce","material":"pop","dark":false},{"id":"pearl-rocker","label":"Pearl Rocker","bg":"#f0eee7","ink":"#464d43","accent":"#429e62","material":"rocker","dark":false},{"id":"clay-house","label":"Clay House","bg":"#e8cfc0","ink":"#704e3c","accent":"#b4613e","material":"linen","dark":false},{"id":"amber-radio","label":"Amber Radio","bg":"#e8d3ac","ink":"#634c27","accent":"#bf862c","material":"retro","dark":false},{"id":"soft-sand","label":"Soft Sand","bg":"#eee4d2","ink":"#57513c","accent":"#89854f","material":"flat","dark":false},{"id":"snow","label":"Snow","bg":"#fbfbf8","ink":"#3c4944","accent":"#3a9e82","material":"flat","dark":false},{"id":"golden-arch","label":"Golden Arch","bg":"#202e2b","ink":"#ead5a0","accent":"#d5af56","material":"deco","dark":true},{"id":"graphite-fiber","label":"Graphite Fiber","bg":"#252b2b","ink":"#dce5e0","accent":"#78d5ad","material":"carbon","dark":true},{"id":"walnut-library","label":"Walnut Library","bg":"#352d28","ink":"#e7d8bb","accent":"#c4a573","material":"wood","dark":true},{"id":"violet-city","label":"Violet City","bg":"#211b31","ink":"#e6d9f5","accent":"#cc84ff","material":"glow","dark":true},{"id":"abyss","label":"Abyss","bg":"#172e40","ink":"#d5e7f2","accent":"#56bce9","material":"flat","dark":true},{"id":"jade-library","label":"Jade Library","bg":"#16382e","ink":"#d9ece1","accent":"#7bd3aa","material":"deco","dark":true},{"id":"retro-receiver","label":"Retro Receiver","bg":"#262d31","ink":"#e4e5d9","accent":"#f0c271","material":"retro","dark":true},{"id":"workshop","label":"Workshop","bg":"#2e3435","ink":"#d9e0db","accent":"#e4b264","material":"brushed","dark":true},{"id":"velvet-lounge","label":"Velvet Lounge","bg":"#372a32","ink":"#efdce5","accent":"#dca9b9","material":"soft","dark":true},{"id":"neon-capsule","label":"Neon Capsule","bg":"#22233a","ink":"#e0e3fc","accent":"#a2a6ff","material":"capsule","dark":true},{"id":"polar-glow","label":"Polar Glow","bg":"#222d3d","ink":"#e6f1ff","accent":"#80cfff","material":"glow","dark":true},{"id":"carved-cedar","label":"Carved Cedar","bg":"#4a3529","ink":"#f0dcc3","accent":"#bcd78a","material":"wood","dark":true},{"id":"circuit","label":"Circuit","bg":"#1e2e35","ink":"#d2e8ed","accent":"#57cfda","material":"circuit","dark":true},{"id":"circuit-glow","label":"Circuit Glow","bg":"#1e3138","ink":"#dcf5ef","accent":"#58e5b9","material":"glow","dark":true},{"id":"urban-loft","label":"Urban Loft","bg":"#283038","ink":"#e0e7ee","accent":"#edaf7d","material":"brushed","dark":true}];
      definitions.forEach(skin=>{const button=make("button","theme-swatch"+(skin.id===(this.device.theme || this.draft.theme)?" selected":""));button.type="button";button.style.background=skin.bg;button.style.color=skin.ink;button.title=skin.label;const tile=make("i");tile.style.background=skin.accent;button.append(tile,make("span","",skin.label));button.onclick=()=>this.update(()=>{this.draft.theme=skin.id;this.device.theme=skin.id;},true);themes.append(button);});const gallery=make("details");gallery.append(make("summary","hint",sk?"32 vzhľadov — otvoriť galériu":"32 skins — open gallery"),themes);box.append(gallery);
      const wallpapers=[{id:"none",name:sk?"Bez tapety":"None",background:"linear-gradient(135deg,#64746f,#9ca8a0)"},{id:"morning",name:sk?"Ranná obloha":"Morning sky",background:"linear-gradient(150deg,#598ac1,#e6bdd1 60%,#ffe1b0)"},{id:"forest",name:sk?"Les":"Forest",background:"radial-gradient(ellipse at 20% 0,#679f83,transparent 60%),linear-gradient(135deg,#173a38,#091c22)"},{id:"sea",name:sk?"More":"Sea",background:"linear-gradient(155deg,#72d3dc,#18779f 55%,#102e5e)"},{id:"sunset",name:sk?"Súmrak":"Sunset",background:"linear-gradient(145deg,#e9b079,#bd6b8f 50%,#413563)"},{id:"graphite",name:sk?"Grafit":"Graphite",background:"repeating-linear-gradient(135deg,#29323a 0 3px,#252b34 3px 6px)"}];
      box.append(make("h3","",sk?"Tapeta":"Wallpaper"));const wall=make("div","wallpaper-grid"),current=this.device.wallpaper || {id:"none"};
      wallpapers.forEach(w=>{const b=this.btn(w.name,()=>this.update(()=>{this.device.wallpaper={id:w.id,dim:current.dim===undefined?15:current.dim};},true));b.className="wallpaper-swatch"+(current.id===w.id?" selected":"");b.style.background=w.background;wall.append(b);});box.append(wall);
      const file=make("input");file.type="file";file.accept="image/jpeg,image/png,image/webp";file.setAttribute("aria-label",sk?"Nahrať vlastnú tapetu":"Upload custom wallpaper");
      file.onchange=()=>{const selected=file.files[0];if(!selected)return;if(selected.size>8*1024*1024){this.notice(sk?"Obrázok má najviac 8 MB.":"Choose an image up to 8 MB.",true);return;}const reader=new FileReader();reader.onerror=()=>this.notice(sk?"Obrázok sa nedá načítať.":"Could not read image.",true);reader.onload=()=>{const image=new Image();image.onerror=()=>this.notice(sk?"Neplatný obrázok.":"Invalid image.",true);image.onload=()=>{const canvas=document.createElement("canvas"),scale=Math.min(1,900/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);let quality=.8,data;do{data=canvas.toDataURL("image/jpeg",quality);quality-=.1;}while(data.length>180000&&quality>.25);if(data.length>180000){this.notice(sk?"Vyber jednoduchší alebo menší obrázok.":"Choose a smaller or simpler image.",true);return;}this.update(()=>{this.device.wallpaper={id:"custom",image:data,dim:15};},true);};image.src=reader.result;};reader.readAsDataURL(selected);};file.hidden=true;box.append(file,this.btn(sk?"Nahrať vlastný obrázok":"Upload custom image",()=>file.click()));
      if(current.id==='custom' && current.image){const image=make("img","wallpaper-thumb");image.src=current.image;image.alt=sk?"Vlastná tapeta":"Custom wallpaper";box.append(image);}
      this.field(box,sk?"Stmavenie tapety (%)":"Wallpaper dimming (%)",current.dim===undefined?15:current.dim,v=>this.update(()=>{this.device.wallpaper={...current,dim:v};}),{type:"range",min:0,max:80});
      [["labelSize",sk?"Veľkosť textu (px)":"Label text size (px)",14,8,32],["labelOffsetY",sk?"Zvislý posun popisov (px)":"Label vertical offset (px)",0,-40,40],["iconSize",sk?"Veľkosť ikon (px)":"Icon size (px)",40,16,96]].forEach(([key,label,value,min,max])=>this.field(box,label,this.device[key]===undefined?value:this.device[key],v=>this.update(()=>this.device[key]=v),{type:"range",min,max}));
    }
    renderDisplay(parent) {
      const grid=make("div","device-grid");parent.append(grid);parent=grid;
      this.renderAppearance(parent);
      let box = this.card(parent, tr("Vzhľad a šetrič"));
      this.field(
        box,
        tr("Dizajn"),
        this.draft.theme || "cream",
        (v) =>
          this.update(() => {
            this.draft.theme = v;
            this.device.theme = v;
          }),
        {
          choices: skinChoices,
        },
      );
      [["labelSize", "Veľkosť textu", "Label text size", 14, 8, 32],
       ["labelOffsetY", "Zvislý posun popisov", "Label vertical offset", 0, -40, 40],
       ["iconSize", "Veľkosť ikon", "Icon size", 40, 16, 96]].forEach(([key,sk,en,fallback,min,max]) => {
        const current=this.device[key] === undefined ? fallback : this.device[key];
        const input=this.field(box, (language.startsWith("sk") ? sk : en)+" (px)", current,
          (value)=>this.update(()=>{this.device[key]=value;}), {type:"range",min,max});
        const output=make("output", "hint", String(current)+" px");
        input.parentNode.append(output);
        input.addEventListener("input",()=>{output.textContent=input.value+" px";this.device[key]=Number(input.value);this.dirty=true;this.preview();});
      });
      this.field(
        box,
        tr("Hodiny"),
        this.device.clockFace || "digital",
        (v) => this.update(() => (this.device.clockFace = v)),
        {
          choices: [
            { value: "digital", label: tr("Digitálne") },
            { value: "analog", label: tr("Analógové") },
          ],
        },
      );
      this.field(
        box,
        tr("24-hodinový formát"),
        this.device.clockFormat24h !== false,
        (v) => this.update(() => (this.device.clockFormat24h = v)),
        { type: "checkbox" },
      );
      this.device.screensaver = this.device.screensaver || {};
      this.field(
        box,
        tr("Šetrič po sekundách"),
        this.device.screensaver.after || 180,
        (v) => this.update(() => (this.device.screensaver.after = v)),
        { type: "number", min: 10, max: 3600 },
      );
      this.field(
        box,
        tr("Jas šetriča (%)"),
        Math.round((this.device.screensaver.dimLevel || 0.15) * 100),
        (v) => this.update(() => (this.device.screensaver.dimLevel = v / 100)),
        { type: "number", min: 5, max: 100 },
      );
      this.field(
        box,
        tr("Predvolená stránka"),
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
        tr("Návrat na predvolenú stránku po sekundách (0 = vypnuté)"),
        this.device.inactivityTimeout || 0,
        (v) => this.update(() => (this.device.inactivityTimeout = v)),
        { type: "number", min: 0, max: 3600 },
      );
      this.device.nightMode = this.device.nightMode || {};
      this.field(
        box,
        tr("Automatický nočný vzhľad"),
        !!this.device.nightMode.enabled,
        (v) => this.update(() => (this.device.nightMode.enabled = v)),
        { type: "checkbox" },
      );
      this.field(
        box,
        tr("Noc začína o hodine"),
        this.device.nightMode.start === undefined
          ? 22
          : this.device.nightMode.start,
        (v) => this.update(() => (this.device.nightMode.start = v)),
        { type: "number", min: 0, max: 23 },
      );
      this.field(
        box,
        tr("Nočný jas (%)"),
        this.device.nightMode.brightness || 20,
        (v) => this.update(() => (this.device.nightMode.brightness = v)),
        { type: "number", min: 5, max: 100 },
      );
      this.field(
        box,
        tr("Noc končí o hodine"),
        this.device.nightMode.end === undefined ? 7 : this.device.nightMode.end,
        (v) => this.update(() => (this.device.nightMode.end = v)),
        { type: "number", min: 0, max: 23 },
      );
      this.device.autoBrightness = this.device.autoBrightness || {};
      this.field(
        box,
        tr("Automatický jas podľa senzora"),
        !!this.device.autoBrightness.enabled,
        (v) => this.update(() => (this.device.autoBrightness.enabled = v)),
        { type: "checkbox" },
      );
      this.field(
        box,
        tr("Prebudiť pri priblížení"),
        this.device.screensaver.wakeOnProximity !== false,
        (v) => this.update(() => (this.device.screensaver.wakeOnProximity = v)),
        { type: "checkbox" },
      );
      this.device.motion = this.device.motion || {};
      this.field(
        box,
        tr("Publikovať pohyb zo senzora"),
        !!this.device.motion.enabled,
        (v) => this.update(() => (this.device.motion.enabled = v)),
        { type: "checkbox" },
      );
      box.append(
        make(
          "p",
          "hint",
          tr("Senzory fungujú iba ak ich Android poskytne. Nočný režim používa čas panela."),
        ),
      );
      const sk=language.startsWith("sk");
      this.device.autoBrightness=this.device.autoBrightness||{};this.device.motion=this.device.motion||{};this.device.proximity=this.device.proximity||{};
      const extra=this.card(parent,sk ? "Podrobné nastavenia panela" : "Detailed panel settings");
      const options=[[this.device,"sysInfoIntervalS",sk ? "Obnoviť diagnostiku (s)" : "Diagnostics interval (s)",60,10,3600],
        [this.device.autoBrightness,"nightThresholdLux",sk ? "Hranica noci (lx)" : "Night threshold (lx)",130,0,100000],
        [this.device.autoBrightness,"dayBrightness",sk ? "Denný jas (%)" : "Day brightness (%)",100,5,100],
        [this.device.autoBrightness,"nightBrightness",sk ? "Nočný jas senzora (%)" : "Sensor night brightness (%)",30,5,100],
        [this.device.autoBrightness,"screensaverDropPoints",sk ? "Stlmenie šetriča navyše (%)" : "Additional screensaver dimming (%)",10,0,95],
        [this.device.motion,"clearS",sk ? "Vypnúť prítomnosť po (s)" : "Presence clear delay (s)",15,1,600],
        [this.device.motion,"on",sk ? "Prah detekcie (% rozsahu senzora)" : "Detection threshold (% of sensor range)",40,1,100],
        [this.device.proximity,"on",sk ? "Prah prebudenia (% rozsahu senzora)" : "Wake threshold (% of sensor range)",40,1,100],
        [this.device.screensaver,"nightOffAfter",sk ? "V noci zhasnúť po (s; 0 = nikdy)" : "Night screen off after (s; 0 = never)",0,0,86400],
        [this.device,"clockDateSize",sk ? "Veľkosť dátumu (px)" : "Date size (px)",13,8,32]];
      options.forEach(([object,key,label,fallback,min,max])=>this.field(extra,label,object[key]===undefined?fallback:object[key],v=>this.update(()=>object[key]=v),{type:"number",min,max}));
      this.field(extra,sk ? "Jazyk hodín" : "Clock language",this.device.clockLanguage||"en-GB",v=>this.update(()=>this.device.clockLanguage=v),{choices:["en-GB","sk-SK","hu-HU","de-DE","cs-CZ","it-IT"]});
      this.field(extra,sk ? "Farba hodín" : "Clock accent",this.device.clockAccent||"#318743",v=>this.update(()=>this.device.clockAccent=v),{type:"color"});
      const clockThemes=[{value:"match-app",label:sk ? "Podľa panela" : "Match panel"},{value:"custom",label:sk ? "Vlastná farba" : "Custom accent"},...skinChoices];
      this.field(extra,sk ? "Vzhľad stránky hodín" : "Clock page theme",this.device.clockTheme||"match-app",v=>this.update(()=>this.device.clockTheme=v),{choices:clockThemes});
      this.field(extra,sk ? "Vzhľad šetriča" : "Screensaver theme",this.device.screensaverTheme||"match-app",v=>this.update(()=>this.device.screensaverTheme=v),{choices:clockThemes});
    }
    buildRoomDraft(area, records) {
      const sk=language.startsWith("sk"), pages=[], tiles=[];
      
      const states=this._hass.states || {};
      const stamp=Date.now().toString(36);let sequence=0;
      const id=(prefix)=>prefix+"_"+stamp+"_"+(sequence++);
      for(const record of records){
        const entity=record.entity_id,state=states[entity];
        if(!state || record.disabled_by || record.hidden_by)continue;
        const domain=entity.split(".")[0],attrs=state.attributes || {},name=attrs.friendly_name || entity;
        if(domain==='fan'){
          const presets=attrs.preset_modes || [],step=Number(attrs.percentage_step),count=step>0?Math.max(1,Math.min(12,Math.round(100/step))):6;
          const speeds=presets.length && !('percentage' in attrs) ? presets.slice(0,12).map(mode=>({label:mode,preset_mode:mode})) : Array.from({length:count},(_,i)=>({label:String(i+1),percentage:Math.round((i+1)*100/count)}));
          const light=record.device_id && records.find(r=>r.device_id===record.device_id && r.entity_id.startsWith('light.') && !r.disabled_by && !r.hidden_by && states[r.entity_id]);
          const la=light ? states[light.entity_id].attributes || {} : {};
          const fan={fanEntity:entity,speeds,controls:{direction:['forward','reverse'].includes(attrs.direction),brightness:'brightness' in la,temperature:'color_temp_kelvin' in la || (la.supported_color_modes || []).includes('color_temp'),allOff:!!light,timer:true},extras:[]};
          if(light)fan.lightEntity=light.entity_id;
          pages.push({id:id('fan'),type:'fan',title:name,fan});
        }else if(['light','switch','input_boolean','scene','script','cover','sensor','binary_sensor'].includes(domain)){
          const type=domain==='cover'?'rocker':['sensor','binary_sensor'].includes(domain)?'readout':domain==='light' && 'brightness' in attrs?'dimmer':'button';
          tiles.push({id:id('tile'),entity,type,label:name,icon:domain==='cover'?'blinds':domain==='light'?'lightbulb':domain==='sensor'?'activity':'power',behavior:['scene','script'].includes(domain)?'push':'toggle',row:1,col:1,rowSpan:1,colSpan:1});
        }else if(domain==='weather')pages.push({id:id('weather'),type:'weather',title:name,weather:{entity}});
      }
      for(let start=0;start<tiles.length;start+=9){const chunk=tiles.slice(start,start+9);chunk.forEach((t,i)=>{t.row=Math.floor(i/3)+1;t.col=i%3+1;});pages.push({id:id('room'),type:'grid',title:area.name+(start?' '+(Math.floor(start/9)+1):''),grid:{rows:Math.ceil(chunk.length/3),columns:3},tiles:chunk});}
      if(!pages.length)throw Error(sk ? "Miestnosť nemá podporované entity." : "This room has no supported entities.");
      const existing=this.draft.pages.filter(p=>!(p.type==='grid' && !(p.tiles || []).length));
      if(existing.length+pages.length>30)throw Error(sk ? "Najviac 30 stránok." : "Up to 30 pages.");
      this.update(()=>{this.draft.pages=[...existing,...pages];this.pageIndex=existing.length;},true);
      this.notice(sk ? "Návrh miestnosti pripravený. Skontroluj stránky a ulož na panel." : "Room draft created. Review the pages and save to panel.");
      return pages;
    }
    async roomWizard() {
      const sk=language.startsWith("sk");
      try{
        const [areas,entities,devices]=await Promise.all([
          this._hass.callWS({type:"config/area_registry/list"}),this._hass.callWS({type:"config/entity_registry/list"}),this._hass.callWS({type:"config/device_registry/list"})]);
        if(!Array.isArray(areas)||!Array.isArray(entities)||!Array.isArray(devices))throw Error(sk ? "Nepodarilo sa načítať miestnosti HA." : "Could not load Home Assistant rooms.");
        if(!areas.length)throw Error(sk ? "Najprv vytvor miestnosti v HA a priraď im zariadenia." : "Create rooms in Home Assistant and assign devices first.");
        let selected=areas[0].area_id;
        this.dialog(sk ? "Vytvoriť ovládanie miestnosti" : "Build room controls",box=>{
          this.field(box,sk ? "Miestnosť" : "Room",selected,v=>selected=v,{choices:areas.map(a=>({value:a.area_id,label:a.name}))});
          box.append(make("p","hint",sk ? "Vytvorí návrh zo svetiel, ventilátorov, žalúzií a senzorov. Existujúce stránky zostanú zachované. Pred uložením skontroluj priradenia." : "Creates a draft from lights, fans, covers and sensors. Existing pages are preserved. Review the assignments before saving."));
          box.append(this.btn(sk ? "Vytvoriť návrh" : "Create draft",()=>{
            try{
              const area=areas.find(a=>a.area_id===selected),deviceAreas=new Map(devices.map(d=>[d.id,d.area_id]));
              const records=entities.filter(e=>(e.area_id || deviceAreas.get(e.device_id))===selected);
              const modal=box.closest('.modal');this.buildRoomDraft(area,records);if(modal)modal.remove();
            }catch(e){this.notice(e.message,true);}
          },true));
        });
      }catch(e){this.notice(e.message,true);}
    }
    renderAdvanced(parent) {
      const sk=language.startsWith("sk"),box=this.card(parent,sk ? "Pokročilá konfigurácia JSON" : "Advanced JSON configuration");
      box.append(make("p","hint",sk ? "Zmeny sa najprv načítajú do editora. Na odoslanie použi Uložiť na panel." : "Changes are applied to the draft first. Use Save to panel to publish them."));
      const input=make("textarea");input.style.cssText="width:100%;min-height:450px;font:13px monospace";
      input.value=JSON.stringify({config:this.draft,device:this.device},null,2);box.append(input);
      box.append(this.btn(sk ? "Použiť do editora" : "Apply to editor",()=>{
        try{const doc=JSON.parse(input.value);if(!doc.config || !Array.isArray(doc.config.pages) || !doc.config.pages.length || !doc.device || Array.isArray(doc.device) || typeof doc.device!=="object")throw Error(sk ? "Neplatný dokument" : "Invalid document");
          this.update(()=>{this.draft=doc.config;this.device=doc.device;},true);this.notice(sk ? "Načítané do editora. Skontroluj a ulož." : "Applied to editor. Review and save.");
        }catch(e){this.notice(e.message,true);}
      },true),this.btn(sk ? "Vrátiť text" : "Revert text",()=>{input.value=JSON.stringify({config:this.draft,device:this.device},null,2);}),this.btn(sk ? "Stiahnuť JSON" : "Download JSON",()=>this.download("aurelvi-config.json",{config:this.draft,device:this.device})));
    }
    renderNotify(parent) {
      const sk=language.startsWith("sk"),form=this.card(parent,sk ? "Oznámenie na panel" : "Panel notification");
      const data=this.notificationDraft || (this.notificationDraft={id:"",title:"Aurelvi",message:"",level:"info",priority:"normal",timeoutS:30,icon:"bell",image:"",sound:"",speak:"",actions:[]});
      const preview=this.card(parent,sk ? "Náhľad a akcia pre HA" : "Preview and Home Assistant action");
      const previewContent=make("div");preview.append(previewContent);
      const updatePreview=()=>{previewContent.textContent="";previewContent.append(make("h2","",data.title || "Aurelvi"),make("p","",data.message));for(const a of data.actions)previewContent.append(make("span","badge",a.label || a.id));previewContent.append(make("pre","log",JSON.stringify({action:"aurelvi.notify",data:{panel_id:this.selected,...data}},null,2)));};
      const fields=[["id",sk ? "ID oznámenia" : "Notification ID"],["title",sk ? "Nadpis" : "Title"],["message",sk ? "Správa" : "Message"],["icon",sk ? "Ikona Lucide" : "Lucide icon"],["image",sk ? "Adresa obrázka" : "Image URL"],["sound",sk ? "Zvuk alebo URL" : "Sound or URL"],["speak",sk ? "Prečítať nahlas" : "Speak aloud"]];
      fields.forEach(([key,label])=>this.field(form,label,data[key],v=>{data[key]=v;updatePreview();},{rows:key==='message' || key==='speak' ? 3 : undefined}));
      this.field(form,sk ? "Úroveň" : "Level",data.level,v=>{data.level=v;updatePreview();},{choices:["info","success","warning","error"]});
      this.field(form,tr("Priorita"),data.priority,v=>{data.priority=v;updatePreview();},{choices:["normal","high"]});
      this.field(form,sk ? "Čas zobrazenia (s; 0 = bez limitu)" : "Timeout (seconds; 0 = unlimited)",data.timeoutS,v=>{data.timeoutS=v;updatePreview();},{type:"number",min:0,max:86400});
      this.jsonField(form,sk ? "Tlačidlá (najviac 3)" : "Buttons (up to 3)",data.actions,v=>{if(!Array.isArray(v)||v.length>3)throw Error(sk ? "Najviac 3 tlačidlá" : "Up to 3 buttons");data.actions=v;updatePreview();},'[{"id":"ok","label":"OK","on_press":[{"service":"light.turn_on","target":{"entity_id":"light.room"}}]}]');
      form.append(make("p","hint",sk ? "Hlas vyžaduje dostupný Android TTS engine. Tlačidlá môžu spúšťať vlastné HA akcie." : "Speech requires an available Android TTS engine. Buttons can run custom Home Assistant actions."));
      form.append(this.btn(sk ? "Odoslať teraz" : "Send now",async()=>{try{await this.api("notify",data);this.notice(sk ? "Odoslané" : "Sent");}catch(e){this.notice(e.message,true);}},true),this.btn(sk ? "Vymazať oznámenia" : "Clear notifications",async()=>{try{await this.api("command",{name:"notify_clear",payload:{}});}catch(e){this.notice(e.message,true);}}),this.btn(sk ? "Resetovať formulár" : "Reset form",()=>{this.notificationDraft=null;this.render();}));
      preview.append(this.btn(sk ? "Kopírovať akciu" : "Copy action",async()=>{try{await navigator.clipboard.writeText(JSON.stringify({action:"aurelvi.notify",data:{panel_id:this.selected,...data}},null,2));}catch(e){this.notice(e.message,true);}}));
      updatePreview();
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
            (p.status.info.model || tr("Model čaká na pripojenie")) +
            " · " +
            (p.status.info.version || "") +
            " · " +
            (p.status.info.ip || ""),
        ),
      );
      let panelName = p.name;
      this.field(box, tr("Názov panela"), panelName, (v) => (panelName = v));
      box.append(
        this.btn(tr("Premenovať panel"), async () => {
          try {
            await this.api("rename", { name: panelName });
            await this.refreshStatus();
            this.render();
            this.notice(tr("Názov panela uložený"));
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let healthBox = this.card(parent, tr("Kontrola pripojenia"));
      let health = p.health;
      if (health) {
        healthBox.append(
          make(
            "p",
            "hint",
            health.ok
              ? tr("MQTT, panel aj priradené entity sú dostupné.")
              : tr("Našli sa problémy:"),
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
              tr("Posledná správa: ") + new Date(health.lastSeen).toLocaleString(),
            ),
          );
      }
      healthBox.append(
        this.btn(tr("Obnoviť stav"), async () => {
          await this.refreshStatus();
          this.render();
        }),
        this.btn(tr("Znovu odoslať konfiguráciu"), async () => {
          try {
            await this.api("push");
            this.notice(
              tr("Uložená konfigurácia pripravená pre panel. Rozpracované zmeny sa neposielajú."),
            );
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let row = make("div", "row");
      [
        [tr("Prebudiť"), "wake"],
        [tr("Informácie"), "info"],
        ["Screenshot", "screenshot"],
      ].forEach(([label, name]) =>
        row.append(
          this.btn(label, async () => {
            try {
              await this.api("command", {
                name,
                payload: { id: Date.now().toString() },
              });
              this.notice(tr("Príkaz odoslaný"));
            } catch (e) {
              this.notice(e.message, true);
            }
          }),
        ),
      );
      box.append(row);
      if (p.status.screenshot) {
        let image = make("img", "screenshot");
        image.alt = tr("Aktuálny displej panela");
        image.src = "data:image/png;base64," + p.status.screenshot;
        box.append(image);
      }
      let backup = this.card(parent, tr("Záloha a obnova"));
      backup.append(
        this.btn(tr("Exportovať konfiguráciu"), () =>
          this.download(p.name + "-aurelvi.json", {
            format: "aurelvi",
            version: 1,
            config: this.draft,
            device: this.device,
          }),
        ),
        this.btn(tr("Importovať konfiguráciu"), () => {
          let input = make("input");
          input.type = "file";
          input.accept = ".json,application/json";
          input.onchange = async () => {
            try {
              let imported = JSON.parse(await input.files[0].text());
              let config = imported.config || imported;
              if (!Array.isArray(config.pages))
                throw Error(tr("Súbor neobsahuje stránky"));
              this.update(() => {
                this.draft = config;
                this.device = imported.device || {};
              }, true);
              this.notice(tr("Import načítaný. Skontroluj entity a ulož."));
            } catch (e) {
              this.notice(e.message, true);
            }
          };
          input.click();
        }),
        this.btn(tr("Obnoviť predchádzajúcu konfiguráciu"), async () => {
          if (this.dirty) {
            this.notice(tr("Najprv ulož alebo odlož aktuálne zmeny."), true);
            return;
          }
          try {
            await this.api("restore", { revision: this.revision });
            await this.load();
            this.notice(tr("Predchádzajúca konfigurácia obnovená"));
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let copy = this.card(parent, tr("Kopírovať na ďalší panel"));
      let target = "";
      this.field(copy, tr("Cieľový panel"), "", (v) => (target = v), {
        choices: [
          { value: "", label: tr("Vyber panel") },
          ...this.data.panels
            .filter((x) => x.paired && x.id !== p.id)
            .map((x) => ({ value: x.id, label: x.name })),
        ],
      });
      copy.append(
        this.btn(tr("Skopírovať stránky"), async () => {
          let t = this.data.panels.find((x) => x.id === target);
          if (!t) return;
          try {
            await this.api(
              "save",
              { config: this.draft, device: this.device, revision: t.revision },
              target,
            );
            this.notice(tr("Konfigurácia skopírovaná"));
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let local = this.card(parent, language.startsWith("sk") ? "Nastavenia z panela" : "Settings reported by panel");
      local.append(make("p", "hint", language.startsWith("sk") ? "Heslá a tokeny zostávajú na paneli. Aktualizácia APK je potrebná na prvý prenos." : "Passwords and tokens stay on the panel. Update the APK to enable the initial transfer."));
      local.append(make("pre", "log", JSON.stringify(p.localSettings || {}, null, 2)));
      let update = this.card(parent, tr("Aktualizácie z GitHubu"));
      let settings = clone(this.data.settings || {});
      this.field(
        update,
        tr("Verejný repozitár"),
        settings.githubRepo || "",
        (v) => (settings.githubRepo = v),
      );
      this.field(
        update,
        tr("Názov APK (voliteľné)"),
        settings.githubAsset || "",
        (v) => (settings.githubAsset = v),
      );
      this.field(
        update,
        tr("Lokálna adresa Home Assistanta pre kamery"),
        settings.haUrl || "",
        (v) => (settings.haUrl = v),
      );
      update.append(
        this.btn(tr("Uložiť a skontrolovať"), async () => {
          try {
            await this.api("settings", settings, null);
            await this.refreshStatus();
            this.notice(tr("Nastavenie aktualizácií uložené"));
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
            tr("Vydanie ") +
              this.data.latest.version +
              " · " +
              this.data.latest.asset,
          ),
          this.btn(
            tr("Stiahnuť APK na panel"),
            async () => {
              try {
                await this.api("install_update");
                this.notice(tr("Na paneli potvrď inštaláciu v Androide."));
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
          tr("Releases musia obsahovať APK podpísané rovnakým kľúčom. Inštalácia vyžaduje potvrdenie na paneli."),
        ),
      );
      let notify = this.card(parent, tr("Oznámenie"));
      let data = {
        title: "Aurelvi",
        message: "",
        priority: "normal",
        timeoutS: 20,
      };
      this.field(notify, "Text", data.message, (v) => (data.message = v));
      this.field(
        notify,
        tr("Priorita"),
        data.priority,
        (v) => (data.priority = v),
        {
          choices: [
            { value: "normal", label: tr("Bežná · bez prebudenia") },
            { value: "high", label: tr("Urgentná · prebudiť") },
          ],
        },
      );
      notify.append(
        this.btn(tr("Odoslať"), async () => {
          try {
            await this.api("notify", data);
            this.notice(tr("Oznámenie odoslané"));
          } catch (e) {
            this.notice(e.message, true);
          }
        }),
      );
      let log = this.card(parent, tr("Diagnostika"));
      log.append(
        this.btn(tr("Stiahnuť diagnostiku"), async () => {
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
        log.append(make("p", "hint", tr("Bez zaznamenaných chýb.")));
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
          tr("Rozšírené chyby nájdeš aj v Nastavenia → Systém → Protokoly."),
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
            ? tr("Uložené v HA. Panel konfiguráciu dostane po obnovení pripojenia.")
            : tr("Uložené. Konfigurácia bola odoslaná na panel."),
        );
      } catch (e) {
        this.notice(e.message, true);
      }
    }
    pageDialog() {
      this.dialog(tr("Nová stránka"), (box) => {
        let type = "fan";
        this.field(box, tr("Typ stránky"), type, (v) => (type = v), {
          choices: [
            { value: "fan", label: tr("Ventilátor so svetlom · 6 rýchlostí") },
            { value: "grid", label: tr("Vlastná mriežka") },
            { value: "clock", label: tr("Hodiny") },
            { value: "weather", label: tr("Počasie") },
            { value: "camera", label: tr("Kamera") },
            { value: "alarm", label: "Alarmo" },
            { value: "music", label: "Hudba" },
          ],
        });
        box.append(
          this.btn(
            tr("Pridať"),
            () => {
              this.update(() => {
                let id = "page_" + Date.now().toString(36),
                  page = {
                    id,
                    title: {
                      fan: tr("Ventilátor"),
                      grid: tr("Domov"),
                      clock: tr("Hodiny"),
                      weather: tr("Počasie"),
                      camera: tr("Kamera"),
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
      this.dialog(tr("Pridať panel"), (box) => {
        let id = "nspanel-7tmv73",
          name = tr("Obývačka");
        this.field(box, tr("ID z aplikácie panela"), id, (v) => (id = v));
        this.field(box, tr("Názov miestnosti"), name, (v) => (name = v));
        box.append(
          this.btn(
            tr("Pridať"),
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
      box.append(this.btn(tr("Zavrieť"), () => overlay.remove()));
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
