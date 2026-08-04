/* =========================================================
   15A Capital — interactions
   Progressive enhancement: the page works without JS.
   ========================================================= */
(function () {
  "use strict";

  /* ---- current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- sticky header shadow on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el, i) {
      // small stagger within the same viewport band
      el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + "ms";
      io.observe(el);
    });
  }

  /* ---- contact form: AJAX submit to FormSubmit, same-page success ---- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var note = document.getElementById("form-note");
  var successPanel = document.getElementById("form-success");
  var submitBtn = form.querySelector(".btn-submit");

  var setNote = function (msg, isError) {
    if (!note) return;
    note.textContent = msg || "";
    note.classList.toggle("is-error", !!isError);
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot: silently drop bot submissions.
    var honey = form.querySelector('input[name="_honey"]');
    if (honey && honey.value) return;

    // Native validation surfaces field-level messages.
    if (!form.checkValidity()) {
      form.reportValidity();
      setNote("Please complete the required fields.", true);
      return;
    }

    setNote("");
    form.classList.add("is-sending");
    if (submitBtn) submitBtn.setAttribute("disabled", "disabled");

    var data = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          return { ok: res.ok, body: body };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.hidden = true;
          if (successPanel) {
            successPanel.hidden = false;
            successPanel.setAttribute("tabindex", "-1");
            successPanel.focus({ preventScroll: true });
          }
          form.reset();
        } else {
          var msg = (result.body && result.body.message) ||
            "Something went wrong. Please try again in a moment.";
          setNote(msg, true);
        }
      })
      .catch(function () {
        setNote("We couldn't reach the server. Please check your connection and try again.", true);
      })
      .finally(function () {
        form.classList.remove("is-sending");
        if (submitBtn) submitBtn.removeAttribute("disabled");
      });
  });
})();
