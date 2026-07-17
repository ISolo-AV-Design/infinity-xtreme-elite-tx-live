/* =====================================================================
   jackrabbit.js — Jackrabbit Class live class-listing integration
   ---------------------------------------------------------------------
   STATUS: STUBBED. Not yet live.

   >>> BLOCKED: needs the gym's Jackrabbit ORGANIZATION ID <<<
   Set JACKRABBIT_ORG_ID below once the gym's Jackrabbit account is set up.
   Until then, this script renders a friendly "enrollment opening soon"
   placeholder instead of a live table, and does NOT make any network call.

   Approach (per PROJECT-BRIEF.md, decided): use the Jackrabbit JSON feed
   and render our OWN table so it matches site styling — NOT the stock embed
   widget. The fetch scaffold below is ready; it is intentionally left
   inert until the Org ID is supplied and the feed shape is confirmed.
   ===================================================================== */
(function () {
  "use strict";

  // TODO(Ivan): replace null with the gym's Jackrabbit Organization ID (string).
  var JACKRABBIT_ORG_ID = null;

  // Jackrabbit's public "Openings" JSON endpoint pattern. Confirm the exact
  // URL/params against the gym's account before enabling (cat1/cat2 filters,
  // etc. may be needed). Left here as documentation of the intended call.
  function feedUrl(orgId) {
    return "https://app.jackrabbitclass.com/jr3.0/Openings/OpeningsJSON?OrgID=" +
      encodeURIComponent(orgId);
  }

  var mount = document.getElementById("jackrabbit-classes");
  if (!mount) return;

  if (!JACKRABBIT_ORG_ID) {
    mount.innerHTML =
      '<div class="notice">' +
      '<strong>Live class schedule &amp; online registration are coming soon.</strong>' +
      '<p class="muted mt-2">Enrollment opens July 2026. Our real-time class ' +
      'listings will appear here once registration goes live. In the meantime, ' +
      'call <a href="tel:+19727574182">972-757-4182</a> or use the ' +
      '<a href="contact.html">contact form</a> to reserve a spot or ask about a program.</p>' +
      '<p class="small mt-4">[ Developer note: this table is stubbed — set ' +
      'JACKRABBIT_ORG_ID in assets/js/jackrabbit.js once the gym’s ' +
      'Jackrabbit account is active. ]</p>' +
      '</div>';
    return;
  }

  /* ---- Live path (runs only once an Org ID is set) ----
     Renders a custom-styled table from the JSON feed so it matches the site.
     Field names below are placeholders — verify against the real feed. */
  mount.innerHTML = '<p class="muted">Loading class schedule…</p>';
  fetch(feedUrl(JACKRABBIT_ORG_ID), { mode: "cors" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      var rows = (data && (data.rows || data.Openings || data)) || [];
      if (!rows.length) { mount.innerHTML = '<p class="muted">No classes are currently open for registration. Please check back soon.</p>'; return; }
      var html = '<div class="table-wrap"><table class="pricing"><thead><tr>' +
        '<th>Class</th><th>Day &amp; Time</th><th>Ages</th><th>Openings</th><th></th>' +
        '</tr></thead><tbody>';
      rows.forEach(function (c) {
        html += '<tr>' +
          '<td>' + (c.name || c.ClassName || "") + '</td>' +
          '<td>' + (c.meetingDay || c.Day || "") + ' ' + (c.meetingTime || c.Time || "") + '</td>' +
          '<td>' + (c.ages || c.AgeRange || "") + '</td>' +
          '<td>' + (c.openings != null ? c.openings : (c.Openings != null ? c.Openings : "")) + '</td>' +
          '<td><a class="btn btn--secondary" href="' + (c.registerUrl || c.RegLink || "#") + '">Register</a></td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';
      mount.innerHTML = html;
    })
    .catch(function (err) {
      mount.innerHTML = '<div class="notice"><strong>We couldn’t load the live schedule.</strong>' +
        '<p class="muted mt-2">Please call <a href="tel:+19727574182">972-757-4182</a> ' +
        'or use the <a href="contact.html">contact form</a>.</p></div>';
      if (window.console) console.error("Jackrabbit feed error:", err);
    });
})();
