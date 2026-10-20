/* ===== Wedding RSVP ===== */

// ---------------------------------------------------------------
// SETTINGS - the only thing you need to touch in this file
// ---------------------------------------------------------------
const CONFIG = {
  // Where RSVPs get emailed (delivered by the free FormSubmit.co service)
  recipient: "tallulah95@m.floydcraft.co.uk",
  // Shown in the email subject line
  subjectPrefix: "Reception RSVP",
  // Used for the "add to calendar" button on the thank-you screen
  coupleNames: "Michael & Lucy",
  // Date only = all-day calendar entry. Once you know the start time use e.g. "2027-03-05T19:00:00"
  // (and keep it in step with data-date on the countdown in index.html)
  receptionStart: "2027-03-05",
  receptionMinutes: 240,
  receptionLocation: "Glasshoughton Sports and Social",
  calendarNotes: "Wedding reception at Glasshoughton Sports and Social.",
};
// ---------------------------------------------------------------

(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- twinkling stars -------------------------------------------------
  const starsG = $("#stars");
  if (starsG) {
    const NS = "http://www.w3.org/2000/svg";
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", (rnd() * 800).toFixed(1));
      c.setAttribute("cy", (rnd() * 650).toFixed(1));
      c.setAttribute("r", (rnd() * 1.6 + 0.4).toFixed(2));
      c.setAttribute("fill", "#fff6d6");
      c.style.animationDelay = (rnd() * 3).toFixed(2) + "s";
      c.style.animationDuration = (2 + rnd() * 3).toFixed(2) + "s";
      starsG.appendChild(c);
    }
  }

  // ---- falling snow + rising embers (snow and glowing embers) ---------
  const canvas = $("#snow");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, flakes = [], raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const make = (initial) => {
      const ember = Math.random() < 0.22;
      return {
        ember,
        x: Math.random() * W,
        y: initial ? Math.random() * H : ember ? H + 10 : -10,
        r: ember ? Math.random() * 1.8 + 0.8 : Math.random() * 2.6 + 0.8,
        vy: ember ? -(Math.random() * 0.5 + 0.25) : Math.random() * 0.7 + 0.3,
        sway: Math.random() * 1.5 + 0.3,
        ph: Math.random() * Math.PI * 2,
        a: Math.random() * 0.5 + 0.35,
      };
    };
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(90, Math.round(W / 14));
      flakes = Array.from({ length: n }, () => make(true));
    };
    const tick = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const f of flakes) {
        f.y += f.vy;
        f.x += Math.sin(t / 1400 + f.ph) * 0.35 * f.sway;
        if (f.ember) {
          ctx.fillStyle = `rgba(255,${130 + Math.sin(t / 300 + f.ph) * 40 | 0},40,${f.a})`;
          ctx.shadowColor = "rgba(255,122,26,.9)"; ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(243,236,217,${f.a})`;
          ctx.shadowColor = "rgba(243,236,217,.6)"; ctx.shadowBlur = 4;
        }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        if (f.y > H + 12 || f.y < -14) Object.assign(f, make(false));
      }
      raf = requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    });
    raf = requestAnimationFrame(tick);
  }

  // ---- countdown -------------------------------------------------------
  const cd = $("#countdown");
  if (cd) {
    const target = new Date(cd.dataset.date).getTime();
    const el = (u) => $(`[data-u="${u}"]`, cd);
    const pad = (n) => String(n).padStart(2, "0");
    const update = () => {
      let d = target - Date.now();
      if (isNaN(d)) { cd.hidden = true; return; }
      if (d < 0) d = 0;
      el("d").textContent = Math.floor(d / 864e5);
      el("h").textContent = pad(Math.floor(d / 36e5) % 24);
      el("m").textContent = pad(Math.floor(d / 6e4) % 60);
      el("s").textContent = pad(Math.floor(d / 1e3) % 60);
    };
    update();
    setInterval(update, 1000);
  }

  // ---- pointer effects: card spotlight + scene parallax ----------------
  const card = $("#rsvp");
  const sceneSvg = $(".scene svg");
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
      const dx = (e.clientX / window.innerWidth - 0.5) * 2;
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      sceneSvg.style.transform = `translate(${(-dx * 14).toFixed(1)}px, ${(-dy * 8).toFixed(1)}px) scale(1.04)`;
    }, { passive: true });
  }

  // ---- form elements ---------------------------------------------------
  const form = $("#rsvpForm");
  const attendingOnly = $("#attendingOnly");
  const guestsSel = $("#guests");
  const extraWrap = $("#extraGuestsWrap");
  const formView = $("#formView");
  const thanksView = $("#thanksView");
  const submitBtn = $("#submitBtn");
  const formError = $("#formError");

  // Safe field reader: a missing/removed field never breaks the form
  const val = (id) => {
    const el = form.elements[id];
    return el && typeof el.value === "string" ? el.value.trim() : "";
  };
  const checked = (name) => $$(`input[name="${name}"]:checked`, form).map((i) => i.value);
  const attendingValue = () => {
    const r = $('input[name="attending"]:checked', form);
    return r ? r.value : "";
  };
  const isAttending = () => attendingValue().startsWith("Yes");
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  // Show the extra questions only if they're coming
  function syncVisibility() {
    attendingOnly.hidden = !isAttending();
    extraWrap.hidden = !(isAttending() && guestsSel && parseInt(guestsSel.value, 10) > 1);
  }

  // ---- progress bar ----------------------------------------------------
  const fill = $("#progressFill");
  const ptext = $("#progressText");
  const messages = [
    "Let's get you on the guest list",
    "Splendid start...",
    "Nearly there...",
    "All set! Press the big orange button",
  ];
  function updateProgress() {
    const done =
      (val("name").length >= 2 ? 1 : 0) +
      (emailOk(val("email")) ? 1 : 0) +
      (attendingValue() ? 1 : 0);
    fill.style.width = (done / 3) * 100 + "%";
    ptext.textContent = messages[done];
    submitBtn.classList.toggle("ready", done === 3);
  }
  form.addEventListener("input", updateProgress);
  form.addEventListener("change", updateProgress);

  // ---- validation ------------------------------------------------------
  const setInvalid = (key, bad) => {
    const err = $(`.err[data-for="${key}"]`);
    if (err) err.closest(".field").classList.toggle("invalid", bad);
  };

  function validate() {
    const checks = {
      name: val("name").length < 2,
      email: !emailOk(val("email")),
      attending: !attendingValue(),
    };
    Object.entries(checks).forEach(([k, bad]) => setInvalid(k, bad));
    const firstBad = Object.keys(checks).find((k) => checks[k]);
    if (!firstBad) return true;
    const field = $(`.err[data-for="${firstBad}"]`).closest(".field");
    field.scrollIntoView({ behavior: "smooth", block: "center" });
    const f = $("input[type=text],input[type=email],textarea,select", field);
    if (f) f.focus({ preventScroll: true });
    return false;
  }
  ["name", "email"].forEach((id) =>
    form.elements[id].addEventListener("input", () => setInvalid(id, false))
  );

  // choosing yes / no: reveal sections + a little magic
  $$('input[name="attending"]').forEach((r) =>
    r.addEventListener("change", () => {
      syncVisibility();
      setInvalid("attending", false);
      if (isAttending()) burst(["🎃", "🦇", "🧡"], 10);
      else burst(["👻", "🖤"], 6);
    })
  );
  if (guestsSel) guestsSel.addEventListener("change", syncVisibility);
  syncVisibility();
  updateProgress();

  // ---- build the email -------------------------------------------------
  function buildPayload() {
    const attending = isAttending();
    const name = val("name");
    const data = {
      _subject: `${CONFIG.subjectPrefix}: ${name} (${attending ? "ATTENDING" : "NOT attending"})`,
      _template: "table",
      _captcha: "false",
      _honey: val("_honey"),
      "Name": name,
      "Email": val("email"),
      "Phone": val("phone") || "-",
      "Attending?": attendingValue(),
      "Invite type": "RECEPTION ONLY - Glasshoughton Sports and Social",
    };
    if (attending) {
      data["Party size"] = guestsSel ? guestsSel.value : "1";
      data["Other guests"] = val("extraGuests") || "-";
      data["Dietary needs"] = checked("dietary").join(", ") || "None ticked";
      data["Allergy / dietary details"] = val("allergies") || "-";
      if (form.elements["song"]) data["Song request"] = val("song") || "-";
    }
    data["Message to the couple"] = val("message") || "-";
    data._autoresponse = attending
      ? `Hi ${name}, thank you for your RSVP! We've got you down for our wedding reception and we can't wait to see you. Love, ${CONFIG.coupleNames}.`
      : `Hi ${name}, thank you for letting us know. We'll miss you, but you'll be there in spirit! Love, ${CONFIG.coupleNames}.`;
    return data;
  }

  // Plain-text fallback if the email service is unreachable
  function mailtoFallback(payload) {
    const lines = Object.entries(payload)
      .filter(([k]) => !k.startsWith("_"))
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    return `mailto:${CONFIG.recipient}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(lines)}`;
  }

  // ---- submit ----------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.hidden = true;
    if (!validate()) return;

    const payload = buildPayload();

    // A bot filled in the hidden field: pretend it worked, send nothing.
    if (payload._honey) return showThanks(payload);

    submitBtn.classList.add("busy");
    submitBtn.disabled = true;

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.recipient)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || String(result.success) === "false") {
        throw new Error(result.message || "Request failed");
      }
      showThanks(payload);
    } catch (err) {
      console.error("RSVP send failed:", err);
      formError.innerHTML =
        `Oh no, the bat got lost on the way! Please try again, or ` +
        `<a href="${mailtoFallback(payload)}">tap here to send your RSVP by email instead</a>.`;
      formError.hidden = false;
      formError.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      submitBtn.classList.remove("busy");
      submitBtn.disabled = false;
    }
  });

  // ---- thank-you -------------------------------------------------------
  function showThanks(payload) {
    const coming = isAttending();
    $("#thanksEmoji").textContent = coming ? "🦇" : "👻";
    $("#thanksTitle").textContent = coming ? "Thank You!" : "We'll miss you!";
    $("#thanksText").textContent = coming
      ? "Your RSVP has flown off to the happy couple on the wings of a bat. A confirmation is on its way to your inbox too."
      : "Thank you for letting us know. You'll be there in spirit! Your reply has flown off to the happy couple.";
    $("#ticket").hidden = !coming;
    $("#thanksSign").hidden = !coming;
    $("#calBtn").hidden = !coming;
    if (coming) {
      $("#ticketName").textContent = payload.Name;
      const n = parseInt(payload["Party size"], 10) || 1;
      $("#ticketParty").textContent = n > 1 ? `Party of ${n}` : "Party of one";
    }
    formView.hidden = true;
    thanksView.hidden = false;
    thanksView.focus({ preventScroll: true });
    $("#rsvp").scrollIntoView({ behavior: "smooth", block: "start" });
    if (coming) confetti();
  }

  $("#againBtn").addEventListener("click", () => {
    form.reset();
    syncVisibility();
    updateProgress();
    $$(".field.invalid").forEach((f) => f.classList.remove("invalid"));
    thanksView.hidden = true;
    formView.hidden = false;
    $("#rsvp").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---- add to calendar (.ics download) ---------------------------------
  $("#calBtn").addEventListener("click", () => {
    const [d, t] = CONFIG.receptionStart.split("T");
    const [y, mo, da] = d.split("-").map(Number);
    const allDay = !t;
    const [h, mi] = allDay ? [0, 0] : t.split(":").map(Number);
    const p2 = (n) => String(n).padStart(2, "0");
    const fmtDate = (dt) => `${dt.getUTCFullYear()}${p2(dt.getUTCMonth() + 1)}${p2(dt.getUTCDate())}`;
    const fmt = (dt) => `${fmtDate(dt)}T${p2(dt.getUTCHours())}${p2(dt.getUTCMinutes())}00`;
    const start = new Date(Date.UTC(y, mo - 1, da, h, mi));
    const end = new Date(start.getTime() + (allDay ? 1440 : CONFIG.receptionMinutes) * 60000);
    const esc = (s) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    // Timed events use floating local time (no Z): shows at the same clock time in any calendar
    const when = allDay
      ? [`DTSTART;VALUE=DATE:${fmtDate(start)}`, `DTEND;VALUE=DATE:${fmtDate(end)}`]
      : [`DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`];
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Reception RSVP//EN", "BEGIN:VEVENT",
      `UID:reception-${fmt(start)}@rsvp`,
      `DTSTAMP:${fmt(new Date())}Z`,
      ...when,
      `SUMMARY:${esc(CONFIG.coupleNames + "'s Wedding Reception")}`,
      `LOCATION:${esc(CONFIG.receptionLocation)}`,
      `DESCRIPTION:${esc(CONFIG.calendarNotes)}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "wedding-reception.ics";
    document.body.appendChild(a); a.click(); a.remove();
  });

  // ---- falling emoji ---------------------------------------------------
  function burst(bits, count) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = bits[Math.floor(Math.random() * bits.length)];
      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = 18 + Math.random() * 22 + "px";
      s.style.animationDuration = 3 + Math.random() * 3 + "s";
      s.style.animationDelay = Math.random() * 0.8 + "s";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 8000);
    }
  }
  const confetti = () => burst(["🦇", "🎃", "💀", "🕸️", "👻", "🧡", "🖤"], 40);
})();
