/* =====================================================================
   jackrabbit.js — Jackrabbit Class live class-listing integration
   ---------------------------------------------------------------------
   LIVE. Org ID: 558575 (Infinity Xtreme Elite TX).

   Pulls the gym's Jackrabbit "Openings" JSON feed and renders a
   custom-styled table that matches the site (per PROJECT-BRIEF.md —
   NOT the stock embed widget). Each row deep-links to that class in the
   Jackrabbit registration form. If the feed can't be reached from the
   browser (e.g. a cross-origin block), it degrades gracefully to an
   on-brand "Register Online / Call us" call-to-action so families can
   always act.
   ===================================================================== */
(function () {
  "use strict";

  var ORG_ID  = "558575";
  var FEED     = "https://app.jackrabbitclass.com/jr3.0/Openings/OpeningsJSON?OrgID=" + ORG_ID;
  var REG_URL  = "https://app.jackrabbitclass.com/regv2.asp?id=" + ORG_ID;
  var PHONE    = "972-757-4182";

  var mount = document.getElementById("jackrabbit-classes");
  if (!mount) return;

  mount.innerHTML = '<p class="muted">Loading class schedule…</p>';

  fetch(FEED, { mode: "cors" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      var rows = (data && (data.rows || data.Openings)) || [];
      mount.innerHTML = rows.length ? buildTable(rows) : emptyNotice();
    })
    .catch(function (err) {
      if (window.console) console.error("Jackrabbit feed error:", err);
      mount.innerHTML = errorNotice();
    });

  /* ---------- table ---------- */
  function buildTable(rows) {
    rows.sort(function (a, b) {
      var ca = a.category1 || "", cb = b.category1 || "";
      if (ca !== cb) return ca < cb ? -1 : 1;
      return (a.name || "") < (b.name || "") ? -1 : 1;
    });

    var html = '<div class="table-wrap"><table class="pricing"><thead><tr>' +
      '<th>Class</th><th>Day &amp; Time</th><th>Ages</th><th>Tuition</th>' +
      '<th>Openings</th><th><span class="visually-hidden">Register</span></th>' +
      '</tr></thead><tbody>';

    rows.forEach(function (c) {
      var reg = decodeEntities(c.online_reg_link || REG_URL);
      var when = [days(c.meeting_days), timeRange(c.start_time, c.end_time)]
        .filter(Boolean).join(" · ");
      html += '<tr>' +
        '<td>' + esc(c.name || "Class") +
          (c.category1 ? '<span class="jr-cat">' + esc(c.category1) + '</span>' : '') + '</td>' +
        '<td>' + esc(when || "—") + '</td>' +
        '<td>' + esc(ages(c.min_age, c.max_age)) + '</td>' +
        '<td class="price-col">' + esc(tuition(c)) + '</td>' +
        '<td>' + openings(c) + '</td>' +
        '<td><a class="btn btn--primary btn--sm" href="' + esc(reg) +
          '" target="_blank" rel="noopener">Register</a></td>' +
      '</tr>';
    });

    html += '</tbody></table></div>' +
      '<p class="small mt-4 muted">Openings update in real time from our Jackrabbit ' +
      'registration system. Questions? Call <a href="tel:+1' + PHONE.replace(/-/g, "") +
      '">' + PHONE + '</a>.</p>';
    return html;
  }

  /* ---------- field formatters ---------- */
  function days(md) {
    if (!md) return "";
    var order = [["mon","Mon"],["tue","Tue"],["wed","Wed"],["thu","Thu"],
                 ["fri","Fri"],["sat","Sat"],["sun","Sun"]];
    var out = [];
    order.forEach(function (d) { if (md[d[0]]) out.push(d[1]); });
    return out.join("/");
  }

  function to12(t) {
    if (!t) return "";
    var p = String(t).split(":");
    if (p.length < 2) return "";
    var h = parseInt(p[0], 10);
    if (isNaN(h)) return "";
    var ap = h >= 12 ? "PM" : "AM";
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ":" + p[1] + " " + ap;
  }

  function timeRange(s, e) {
    var a = to12(s), b = to12(e);
    if (!a && !b) return "";
    return a + (b ? "–" + b : "");
  }

  function parseDur(s) {
    if (!s) return null;
    var m = /P(?:(\d+)Y)?(?:(\d+)M)?/.exec(s);
    if (!m) return null;
    var y = parseInt(m[1] || "0", 10), mo = parseInt(m[2] || "0", 10);
    if (!y && !mo) return null;
    return { y: y, mo: mo };
  }

  function fmtAge(d) {
    var parts = [];
    if (d.y) parts.push(d.y + "y");
    if (d.mo) parts.push(d.mo + "m");
    return parts.join(" ");
  }

  function ages(min, max) {
    var a = parseDur(min), b = parseDur(max);
    if (!a && !b) return "All ages";
    if (a && b)   return fmtAge(a) + "–" + fmtAge(b);
    if (a)        return fmtAge(a) + "+";
    return "Up to " + fmtAge(b);
  }

  function tuition(c) {
    var fee = c.tuition && typeof c.tuition.fee === "number" ? c.tuition.fee : null;
    if (fee == null) return "—";
    var amt = fee % 1 === 0 ? "$" + fee.toFixed(0) : "$" + fee.toFixed(2);
    var cyc = c.BillingCycle === "Weekly" ? "/wk"
            : c.BillingCycle === "Monthly" ? "/mo" : "";
    return amt + cyc;
  }

  function openings(c) {
    var o = c.openings && typeof c.openings.calculated_openings === "number"
          ? c.openings.calculated_openings : null;
    if (o == null) return '<span class="jr-wait">Call</span>';
    if (o <= 0)    return '<span class="jr-wait">' + (c.waitlist ? "Waitlist" : "Full") + '</span>';
    return '<span class="jr-open">' + o + ' open</span>';
  }

  /* ---------- fallbacks ---------- */
  function emptyNotice() {
    return '<div class="notice"><strong>No classes are open for registration right now.</strong>' +
      '<p class="muted mt-2">New classes are added often — check back soon, or call ' +
      '<a href="tel:+19727574182">' + PHONE + '</a> and we\'ll help you find a spot.</p>' +
      '<div class="btn-row mt-4"><a class="btn btn--primary" href="' + REG_URL +
      '" target="_blank" rel="noopener">Open Registration</a></div></div>';
  }

  function errorNotice() {
    return '<div class="notice"><strong>Our live class list is taking a moment to load.</strong>' +
      '<p class="muted mt-2">You can still register online or reach us directly.</p>' +
      '<div class="btn-row mt-4">' +
      '<a class="btn btn--primary" href="' + REG_URL + '" target="_blank" rel="noopener">Register Online</a>' +
      '<a class="btn btn--secondary" href="tel:+19727574182">Call ' + PHONE + '</a></div></div>';
  }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch];
    });
  }

  function decodeEntities(s) {
    if (!s) return s;
    var ta = document.createElement("textarea");
    ta.innerHTML = s;
    return ta.value;
  }
})();
