/* =====================================================================
   interest-form.js — posts the on-brand interest form into the gym's
   existing Google Form ("IXTX Child Care Interest Form"). Responses land
   in the same Google Sheet as the native Google Form.

   The form POSTs to the Google Forms /formResponse endpoint, targeting a
   hidden iframe so the visitor stays on our site. Because the response is
   cross-origin we can't read it, so success is shown when the hidden
   iframe finishes loading after a submit.

   Field IDs (from the live Google Form — if the gym edits the form's
   questions, re-check these):
     Parent's Name ........ entry.1903632102
     Phone Number ......... entry.1098857518
     Email Address ........ entry.2088446142
     Child's Name ......... entry.134178174
     Date of Birth ........ entry.1411289452  (date -> _year/_month/_day)
     Child's Grade ........ entry.339031264
     Child Care Interest .. entry.2140668153  (checkboxes)
     School Attending ..... entry.1338480700
     Child's Hobbies ...... entry.543896961
   ===================================================================== */
(function () {
  "use strict";
  var DATE_ENTRY = "entry.1411289452";
  var forms = document.querySelectorAll("form.interest-form");

  Array.prototype.forEach.call(forms, function (form, idx) {
    var errorBox = form.querySelector(".form-error");
    var successBox = form.parentNode.querySelector(".form-success");

    // Create a fully hidden submission target so nothing renders on the page.
    var iframe = document.createElement("iframe");
    iframe.name = "ixtx_sink_" + idx;
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    document.body.appendChild(iframe);
    form.setAttribute("target", iframe.name);

    var submitted = false;

    // Visual state for the styled checkboxes
    Array.prototype.forEach.call(form.querySelectorAll(".checkbox-item input"), function (cb) {
      var sync = function () { cb.closest(".checkbox-item").classList.toggle("checked", cb.checked); };
      cb.addEventListener("change", sync);
      sync();
    });

    // Populate the Date-of-Birth dropdowns (Month / Day / Year)
    function addOptions(sel, items) {
      if (!sel) return;
      items.forEach(function (it) {
        var o = document.createElement("option");
        o.value = it.value; o.textContent = it.label;
        sel.appendChild(o);
      });
    }
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    addOptions(form.querySelector('[data-dob="month"]'), months.map(function (m, i) { return { value: i + 1, label: m }; }));
    var days = []; for (var dd = 1; dd <= 31; dd++) days.push({ value: dd, label: dd });
    addOptions(form.querySelector('[data-dob="day"]'), days);
    var years = []; var thisYear = new Date().getFullYear();
    for (var yy = thisYear; yy >= thisYear - 21; yy--) years.push({ value: yy, label: yy });
    addOptions(form.querySelector('[data-dob="year"]'), years);

    form.addEventListener("submit", function (e) {
      if (errorBox) errorBox.textContent = "";

      // At least one "Child Care Interest" checkbox is required
      var checks = form.querySelectorAll('input[name="entry.2140668153"]');
      var anyChecked = Array.prototype.some.call(checks, function (c) { return c.checked; });
      if (!anyChecked) {
        e.preventDefault();
        if (errorBox) errorBox.textContent = "Please choose at least one Child Care Interest option.";
        if (checks[0]) checks[0].focus();
        return;
      }

      submitted = true; // native submit proceeds into the hidden iframe
    });

    // Hidden iframe finishes loading after a successful POST
    if (iframe) {
      iframe.addEventListener("load", function () {
        if (!submitted) return;      // ignore the initial about:blank load
        submitted = false;
        form.reset();
        Array.prototype.forEach.call(form.querySelectorAll(".checkbox-item.checked"), function (el) {
          el.classList.remove("checked");
        });
        if (successBox) {
          form.hidden = true;
          successBox.hidden = false;
          successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  });
})();
