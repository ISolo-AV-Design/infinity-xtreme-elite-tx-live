/* Infinity Xtreme Elite TX — shared site behavior.
   Plain vanilla JS, no framework (per project constraint). */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu when a link is tapped (mobile)
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Highlight the current page in the nav.
     Each page sets <body data-page="home|about|..."> */
  var page = document.body.getAttribute("data-page");
  if (page) {
    var current = document.querySelector('.nav-links a[data-nav="' + page + '"]');
    if (current) current.classList.add("active");
  }

  /* Auto-update footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
