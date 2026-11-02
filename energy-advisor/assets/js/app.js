(function () {
  "use strict";

  const RULES = window.EA_DATA.rules;
  const ALERTS = window.EA_DATA.alerts.slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const VIEWS = ["home", "dashboard", "insights", "rules", "about"];

  /* ---------- storage (safe if blocked) ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("ea:" + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("ea:" + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  const state = {
    view: "home",
    rules: Object.assign({ 1: true, 2: true, 3: true }, store.get("rules", {})),
    status: store.get("status", {}), // id -> "accepted" | "dismissed"
    filter: "all",
    query: "",
    openId: null
  };

  /* ---------- helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt1 = (n) => Number(n).toFixed(1);
  const fmt2 = (n) => Number(n).toFixed(2);

  function parseTs(ts) {
    const [d, t] = ts.split(" ");
    const [y, m, day] = d.split("-").map(Number);
    const [h] = t.split(":").map(Number);
    return { date: new Date(y, m - 1, day, h), hour: h, time: t };
  }
  function niceDate(ts, opts) {
    const p = parseTs(ts);
    return p.date.toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  const visibleAlerts = () => ALERTS.filter((a) => state.rules[a.rule]);
  const statusOf = (a) => state.status[a.id] || "new";

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ---------- alert card ---------- */
  function metricsFor(a) {
    let third = ["Load", fmt2(a.usage_kwh) + " kWh"];
    let fourth = ["HVAC mode", a.hvac_mode.charAt(0).toUpperCase() + a.hvac_mode.slice(1)];
    if (a.rule === 1) fourth = ["Dishwasher", "Running"];
    if (a.rule === 2) third = ["Heat set", fmt1(a.heat_setpoint) + " °C"];
    if (a.rule === 3) third = ["Cool set", fmt1(a.cool_setpoint) + " °C"];
    return [
      ["Tariff", a.tariff_period, a.tariff_period === "Peak" ? "peak" : "off"],
      ["In / Out", fmt1(a.indoor_temp_c) + "° / " + fmt1(a.outdoor_temp_c) + "°", ""],
      [third[0], third[1], ""],
      [fourth[0], fourth[1], ""]
    ];
  }

  function alertCard(a, compact) {
    const r = RULES[a.rule];
    const st = statusOf(a);
    const p = parseTs(a.timestamp);
    const statusLabel = st === "accepted" ? "Done" : st === "dismissed" ? "Dismissed" : "New";
    let actions;
    if (st === "new") {
      actions = `<button class="btn btn-primary btn-sm" data-action="accept" data-id="${a.id}">${esc(r.accept)}</button>
                 <button class="btn btn-ghost btn-sm" data-action="dismiss" data-id="${a.id}">Dismiss</button>`;
    } else {
      actions = `${st === "accepted" ? `<span class="done-note">✓ ${esc(r.accepted)}</span>` : `<span class="muted small">You dismissed this alert.</span>`}
                 <button class="btn btn-ghost btn-sm" data-action="undo" data-id="${a.id}">Undo</button>`;
    }
    return `
      <article class="alert ${compact ? "" : "card"} r${a.rule}">
        <div class="alert-top">
          <div>
            <div class="alert-when">${esc(p.time)} <span class="muted">·</span> ${esc(niceDate(a.timestamp))}</div>
          </div>
          <div class="actions">
            <span class="rule-tag">${esc(r.short)}</span>
            <span class="status ${st}">${statusLabel}</span>
          </div>
        </div>
        <dl class="metrics">
          ${metricsFor(a).map(([k, v, cls]) => `<div class="metric"><dt>${esc(k)}</dt><dd class="${cls}">${esc(v)}</dd></div>`).join("")}
        </dl>
        <div class="message">
          <p class="msg">${esc(a.alert_message)}</p>
          <p class="tip"><b>Energy-saving tip</b>${esc(a.energy_tip)}</p>
        </div>
        <div class="actions">${actions}</div>
      </article>`;
  }

  /* ---------- HOME ---------- */
  function renderHome() {
    const vis = visibleAlerts();
    const byHour = {};
    vis.forEach((a) => { const h = parseTs(a.timestamp).hour; (byHour[h] = byHour[h] || []).push(a); });
    let cells = "";
    for (let h = 0; h < 24; h++) {
      const cls = h >= 17 && h <= 22 ? "peak" : h < 5 ? "night" : "";
      const pips = (byHour[h] || []).map((a) => `<span class="pip r${a.rule}" title="${esc(RULES[a.rule].short)} · ${esc(a.timestamp)}"></span>`).join("");
      cells += `<div class="hour ${cls}">${pips}</div>`;
    }
    $("#hour-strip").innerHTML = cells;
    if (!$(".hour-labels")) {
      $("#hour-strip").insertAdjacentHTML("afterend", `<div class="hour-labels" aria-hidden="true"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span></div>`);
    }
    $("#hero-count").textContent = vis.length + " alerts";
    const latest = vis[0];
    $("#hero-latest").innerHTML = latest
      ? `<div class="message r${latest.rule}"><span class="label">Latest · ${esc(latest.timestamp)}</span><p class="msg">${esc(latest.alert_message)}</p></div>`
      : `<p class="muted small">All rules are off. <a href="#rules">Turn one on</a> to see alerts.</p>`;

    $("#home-rules").innerHTML = [1, 2, 3].map((id) => {
      const r = RULES[id];
      return `<div class="card rule-card r${id}">
        <span class="rule-tag">${esc(r.short)}</span>
        <h3>${esc(r.name)}</h3>
        <p>${esc(r.logic)}</p>
        <code class="cond">${esc(r.condition)}</code>
      </div>`;
    }).join("");
  }

  /* ---------- DASHBOARD ---------- */
  function renderDashboard() {
    const vis = visibleAlerts();
    const latest = vis.find((a) => statusOf(a) !== "dismissed") || null;
    const enabledCount = Object.values(state.rules).filter(Boolean).length;
    const peakKwh = vis.filter((a) => a.tariff_period === "Peak").reduce((s, a) => s + a.usage_kwh, 0);
    const accepted = vis.filter((a) => statusOf(a) === "accepted").length;
    const open = vis.filter((a) => statusOf(a) === "new").length;

    $("#stats").innerHTML = [
      ["Open alerts", open, "", `${vis.length} shown in total`],
      ["Peak load flagged", fmt1(peakKwh), "kWh", "Used in peak-tariff hours"],
      ["Suggestions taken", accepted, "", accepted ? "Nice work" : "Accept one below"],
      ["Rules on", enabledCount, "/ 3", `<a href="#rules">Change</a>`]
    ].map(([k, v, u, sub]) => `<div class="card stat"><span class="label">${k}</span><span class="val">${v} <small>${u}</small></span><span class="sub">${sub}</span></div>`).join("");

    $("#latest").innerHTML = latest
      ? alertCard(latest, false)
      : `<div class="card empty">${vis.length ? "Every alert has been dismissed." : `No alerts to show. <a href="#rules">Turn on a rule</a>.`}</div>`;

    // chips
    const counts = { all: vis.length };
    [1, 2, 3].forEach((id) => { counts[id] = vis.filter((a) => a.rule === id).length; });
    $("#chips").innerHTML = [["all", "All"]].concat([1, 2, 3].filter((id) => state.rules[id]).map((id) => [String(id), RULES[id].short]))
      .map(([key, label]) => `<button type="button" class="chip ${key !== "all" ? "r" + key : ""}" data-filter="${key}" aria-pressed="${state.filter === key}">${key !== "all" ? '<span class="pip"></span>' : ""}${esc(label)} <span class="mono">${counts[key]}</span></button>`)
      .join("");

    const q = state.query.trim().toLowerCase();
    const list = vis.filter((a) => a !== latest)
      .filter((a) => state.filter === "all" || String(a.rule) === state.filter)
      .filter((a) => !q || [a.timestamp, a.alert_message, a.energy_tip, RULES[a.rule].name, a.hvac_mode, a.tariff_period].join(" ").toLowerCase().includes(q));

    $("#archive-count").textContent = "(" + list.length + ")";
    $("#archive-list").innerHTML = list.length ? list.map((a) => {
      const isOpen = state.openId === a.id;
      const st = statusOf(a);
      return `<div class="row r${a.rule}">
        <button class="row-btn" type="button" data-toggle="${a.id}" aria-expanded="${isOpen}">
          <span class="pip"></span>
          <span><span class="row-title">${esc(RULES[a.rule].name)}</span><span class="row-time">${esc(a.timestamp)}${st !== "new" ? " · " + (st === "accepted" ? "done" : "dismissed") : ""}</span></span>
          <span class="row-kwh">${fmt2(a.usage_kwh)} kWh</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        ${isOpen ? `<div class="row-body">${alertCard(a, true)}</div>` : ""}
      </div>`;
    }).join("") : `<div class="empty">No alerts match.</div>`;
  }

  /* ---------- INSIGHTS ---------- */
  function renderInsights() {
    const vis = visibleAlerts().slice().reverse(); // oldest first
    const legendRules = [1, 2, 3].filter((id) => state.rules[id]);
    $("#legend-usage").innerHTML = legendRules.map((id) => `<span><i class="sw r${id}" style="background:var(--rc)"></i>${esc(RULES[id].short)}</span>`).join("");

    if (!vis.length) {
      const msg = `<p class="muted">No data. <a href="#rules">Turn on a rule</a>.</p>`;
      $("#chart-usage").innerHTML = msg; $("#chart-temp").innerHTML = msg; $("#chart-rules").innerHTML = msg;
      return;
    }

    // Bar chart: usage kWh
    {
      const W = 640, H = 270, m = { l: 44, r: 12, t: 24, b: 48 };
      const iw = W - m.l - m.r, ih = H - m.t - m.b, max = 5;
      const band = iw / vis.length, bw = Math.min(46, band * 0.58);
      const y = (v) => m.t + ih - (v / max) * ih;
      let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of kWh at each alert">`;
      for (let t = 0; t <= max; t++) {
        s += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/>`;
        s += `<text class="axis-text" x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`;
      }
      s += `<text class="axis-text" x="${m.l - 8}" y="${m.t - 10}" text-anchor="end">kWh</text>`;
      vis.forEach((a, i) => {
        const cx = m.l + band * i + band / 2;
        const top = y(a.usage_kwh);
        s += `<rect class="bar-${a.rule}" x="${cx - bw / 2}" y="${top}" width="${bw}" height="${m.t + ih - top}" rx="4"><title>${esc(a.timestamp)} · ${fmt2(a.usage_kwh)} kWh</title></rect>`;
        s += `<text class="val-text" x="${cx}" y="${top - 6}" text-anchor="middle">${fmt2(a.usage_kwh)}</text>`;
        s += `<text class="axis-text" x="${cx}" y="${H - m.b + 18}" text-anchor="middle">${esc(niceDate(a.timestamp, { day: "numeric", month: "short" }))}</text>`;
        s += `<text class="axis-text" x="${cx}" y="${H - m.b + 33}" text-anchor="middle">${parseTs(a.timestamp).date.getFullYear()}</text>`;
      });
      $("#chart-usage").innerHTML = s + "</svg>";
    }

    // Dumbbell: indoor vs outdoor
    {
      const rowH = 32, m = { l: 92, r: 16, t: 12, b: 34 }, W = 640;
      const H = m.t + rowH * vis.length + m.b, max = 35;
      const iw = W - m.l - m.r;
      const x = (v) => m.l + (v / max) * iw;
      let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Indoor and outdoor temperature for each alert">`;
      for (let t = 0; t <= max; t += 5) {
        s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${m.t}" y2="${H - m.b}"/>`;
        s += `<text class="axis-text" x="${x(t)}" y="${H - m.b + 18}" text-anchor="middle">${t}°</text>`;
      }
      vis.forEach((a, i) => {
        const cy = m.t + rowH * i + rowH / 2;
        const free = a.hvac_mode === "cool" && a.outdoor_temp_c <= a.indoor_temp_c;
        s += `<text class="axis-text" x="${m.l - 12}" y="${cy + 4}" text-anchor="end">${esc(niceDate(a.timestamp, { day: "numeric", month: "short", year: "2-digit" }))}</text>`;
        s += `<line class="link ${free ? "free" : ""}" x1="${x(a.outdoor_temp_c)}" x2="${x(a.indoor_temp_c)}" y1="${cy}" y2="${cy}"/>`;
        s += `<circle class="dot-out" cx="${x(a.outdoor_temp_c)}" cy="${cy}" r="6"><title>Outdoor ${fmt1(a.outdoor_temp_c)} °C</title></circle>`;
        s += `<circle class="dot-in" cx="${x(a.indoor_temp_c)}" cy="${cy}" r="6"><title>Indoor ${fmt1(a.indoor_temp_c)} °C</title></circle>`;
      });
      $("#chart-temp").innerHTML = s + "</svg>";
    }

    // Rule share
    {
      const total = vis.length;
      const parts = [1, 2, 3].map((id) => ({ id, n: vis.filter((a) => a.rule === id).length, kwh: vis.filter((a) => a.rule === id).reduce((s, a) => s + a.usage_kwh, 0) }));
      $("#chart-rules").innerHTML = `
        <div class="stack" role="img" aria-label="Share of alerts by rule">
          ${parts.filter((p) => p.n).map((p) => `<div class="r${p.id}" style="flex:${p.n}">${p.n}</div>`).join("")}
        </div>
        <div class="stack-legend">
          ${parts.map((p) => `<div class="r${p.id}"><span class="muted small">${esc(RULES[p.id].name)}</span><b>${Math.round((p.n / total) * 100)}%</b><span class="muted small mono">${p.n} alerts · ${fmt1(p.kwh)} kWh</span></div>`).join("")}
        </div>`;
    }
  }

  /* ---------- RULES ---------- */
  function renderRules() {
    $("#rule-list").innerHTML = [1, 2, 3].map((id) => {
      const r = RULES[id];
      const n = ALERTS.filter((a) => a.rule === id).length;
      return `<div class="card rule-item r${id}">
        <div>
          <h3><span class="rule-tag">${esc(r.short)}</span>${esc(r.name)} <span class="count">${n} alerts</span></h3>
          <p>${esc(r.logic)}</p>
          <code class="cond">${esc(r.condition)}</code>
        </div>
        <label class="switch" for="rule-${id}">
          <input type="checkbox" role="switch" id="rule-${id}" data-rule="${id}" ${state.rules[id] ? "checked" : ""} aria-label="${esc(r.name)}">
          <span class="track"></span>
        </label>
      </div>`;
    }).join("");
  }

  function renderAbout() {
    $("#about-rules").innerHTML = [1, 2, 3].map((id) => `<li><b>${esc(RULES[id].name)}.</b> ${esc(RULES[id].logic)}</li>`).join("");
  }

  const renderers = { home: renderHome, dashboard: renderDashboard, insights: renderInsights, rules: renderRules, about: renderAbout };
  const render = () => renderers[state.view]();

  /* ---------- routing ---------- */
  function route() {
    const v = location.hash.slice(1);
    const next = VIEWS.includes(v) ? v : "home";
    const changed = next !== state.view;
    state.view = next;
    VIEWS.forEach((n) => { document.getElementById("view-" + n).hidden = n !== next; });
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === next) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.title = next === "home" ? "Energy Advisor" : next.charAt(0).toUpperCase() + next.slice(1) + " · Energy Advisor";
    render();
    if (changed) window.scrollTo(0, 0);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const act = e.target.closest("[data-action]");
    if (act) {
      const id = act.dataset.id;
      const a = ALERTS.find((x) => x.id === id);
      const kind = act.dataset.action;
      if (kind === "accept") { state.status[id] = "accepted"; toast(RULES[a.rule].accepted); }
      if (kind === "dismiss") { state.status[id] = "dismissed"; toast("Alert dismissed"); }
      if (kind === "undo") { delete state.status[id]; toast("Change undone"); }
      store.set("status", state.status);
      render();
      return;
    }
    const tog = e.target.closest("[data-toggle]");
    if (tog) { state.openId = state.openId === tog.dataset.toggle ? null : tog.dataset.toggle; render(); return; }
    const chip = e.target.closest("[data-filter]");
    if (chip) { state.filter = chip.dataset.filter; render(); }
  });

  document.addEventListener("change", (e) => {
    const sw = e.target.closest("[data-rule]");
    if (!sw) return;
    const id = sw.dataset.rule;
    state.rules[id] = sw.checked;
    if (!sw.checked && state.filter === id) state.filter = "all";
    store.set("rules", state.rules);
    toast(RULES[id].name + (sw.checked ? " turned on" : " turned off"));
  });

  $("#search").addEventListener("input", (e) => { state.query = e.target.value; renderDashboard(); });

  $("#reset").addEventListener("click", () => {
    state.rules = { 1: true, 2: true, 3: true };
    state.status = {};
    state.filter = "all";
    store.set("rules", state.rules);
    store.set("status", state.status);
    renderRules();
    $("#reset-note").textContent = "All rules on, alert choices cleared.";
  });

  $("#theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set("theme", next);
  });

  window.addEventListener("hashchange", route);
  route();
})();
