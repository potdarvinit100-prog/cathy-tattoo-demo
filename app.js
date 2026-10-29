/* ============ CATHY TATTOO STUDIO — DEMO APP ============ */
(function () {
  "use strict";

  /* ---------- THEME (light / dark) ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  function syncThemeLabel() {
    if (!themeToggle) return;
    var dark = root.getAttribute("data-theme") !== "light";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  if (themeToggle) {
    syncThemeLabel();
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("cathy-theme", next); } catch (e) { /* private mode — theme just won't persist */ }
      syncThemeLabel();
    });
  }

  /* ---------- NAV ---------- */
  var nav = document.getElementById("topnav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  /* ---------- BOOKING WIDGET (service / date / time / summary) ---------- */
  var serviceSelect = document.getElementById("fService");
  var dateInput = document.getElementById("fDate");
  var nameInput = document.getElementById("fName");
  var slotWrap = document.getElementById("slotPills");
  var selectedSlot = "";

  function fmtDate(val) {
    if (!val) return "";
    var parts = val.split("-");
    if (parts.length !== 3) return val;
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  if (dateInput) {
    var now = new Date();
    var iso = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    dateInput.min = iso;
  }

  if (slotWrap) {
    var hours = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"];
    hours.forEach(function (h) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot-pill";
      b.textContent = h;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", function () {
        selectedSlot = (selectedSlot === h) ? "" : h;
        slotWrap.querySelectorAll(".slot-pill").forEach(function (p) {
          var on = p.textContent === selectedSlot;
          p.classList.toggle("selected", on);
          p.setAttribute("aria-checked", on ? "true" : "false");
        });
        updateSummary();
      });
      slotWrap.appendChild(b);
    });
  }

  function updateSummary() {
    var s = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val || "—"; };
    s("sumService", serviceSelect ? serviceSelect.value : "");
    s("sumDate", dateInput ? fmtDate(dateInput.value) : "");
    s("sumTime", selectedSlot);
    s("sumName", nameInput ? nameInput.value.trim() : "");
  }
  [serviceSelect, dateInput, nameInput].forEach(function (el) {
    if (el) { el.addEventListener("input", updateSummary); el.addEventListener("change", updateSummary); }
  });
  updateSummary();

  /* ---------- SERVICE PRE-SELECT LINKS ---------- */
  document.querySelectorAll("[data-service]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (serviceSelect) { serviceSelect.value = el.getAttribute("data-service"); updateSummary(); }
    });
  });

  /* ---------- ENQUIRY FORM → WHATSAPP ---------- */
  var form = document.getElementById("enquiryForm");
  var formError = document.getElementById("formError");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = nameInput.value.trim();
      var phone = document.getElementById("fPhone").value.trim();
      var service = serviceSelect.value;
      var msg = document.getElementById("fMsg").value.trim();
      var phoneOk = /^[0-9+\s\-]{8,15}$/.test(phone);
      if (!name || !phoneOk || !service) {
        formError.hidden = false;
        return;
      }
      formError.hidden = true;
      var text =
        "Hey! 👋 I'm " + name + ".\n" +
        "I'd like to book: " + service + ".\n" +
        (dateInput && dateInput.value ? "Preferred date: " + fmtDate(dateInput.value) + ".\n" : "") +
        (selectedSlot ? "Preferred time: " + selectedSlot + ".\n" : "") +
        (msg ? msg + "\n" : "") +
        "My number: " + phone;
      window.open("https://wa.me/919890003038?text=" + encodeURIComponent(text), "_blank");
    });
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var target = parseInt(entry.target.getAttribute("data-count"), 10);
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1400, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          entry.target.textContent = Math.round(target * eased).toLocaleString("en-IN");
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = parseInt(c.getAttribute("data-count"), 10).toLocaleString("en-IN");
    });
  }

  /* ---------- GSAP SCROLL REVEALS (progressive enhancement) ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 42,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
    gsap.to(".hero-mandala", {
      rotate: 40, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
    });
  }

  /* ---------- THREE.JS INK-SMOKE HERO (with graceful fallback) ---------- */
  function webglAvailable() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function initInk() {
    var canvas = document.getElementById("inkCanvas");
    if (!canvas || !window.THREE || !webglAvailable()) return; // hero keeps its CSS gradient

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch (e) { return; }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 8;

    // Soft round sprite texture drawn on a 2D canvas — no external assets.
    function makeSprite(inner, outer) {
      var s = document.createElement("canvas"); s.width = s.height = 64;
      var ctx = s.getContext("2d");
      var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, inner);
      g.addColorStop(0.4, outer);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(s);
    }

    function makeCloud(count, color, size, tex, opacity) {
      var geo = new THREE.BufferGeometry();
      var pos = new Float32Array(count * 3);
      var seeds = [];
      for (var i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 18;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
        seeds.push(Math.random() * Math.PI * 2);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      var mat = new THREE.PointsMaterial({
        size: size, map: tex, transparent: true, opacity: opacity,
        color: color, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
      });
      var pts = new THREE.Points(geo, mat);
      pts.userData = { seeds: seeds, base: pos.slice() };
      scene.add(pts);
      return pts;
    }

    var smokeTex = makeSprite("rgba(255,255,255,0.55)", "rgba(255,255,255,0.16)");
    var emberTex = makeSprite("rgba(255,255,255,0.9)", "rgba(255,255,255,0.25)");
    var smoke = makeCloud(90, 0x8a8378, 3.4, smokeTex, 0.16);   // slow ivory-grey ink smoke
    var embers = makeCloud(140, 0xc8102e, 0.55, emberTex, 0.5);  // fine crimson embers

    var mouseX = 0, mouseY = 0;
    window.addEventListener("pointermove", function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    function resize() {
      var w = canvas.clientWidth || canvas.parentElement.clientWidth;
      var h = canvas.clientHeight || canvas.parentElement.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var running = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
      }).observe(canvas);
    }

    var clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!running) return;
      var t = clock.getElapsedTime();
      [smoke, embers].forEach(function (cloud, ci) {
        var posAttr = cloud.geometry.attributes.position;
        var arr = posAttr.array, base = cloud.userData.base, seeds = cloud.userData.seeds;
        var speed = ci === 0 ? 0.05 : 0.12;
        var amp = ci === 0 ? 0.55 : 0.3;
        for (var i = 0; i < seeds.length; i++) {
          arr[i * 3] = base[i * 3] + Math.sin(t * speed * 2 + seeds[i]) * amp;
          arr[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * speed * 1.6 + seeds[i] * 1.7) * amp + (reduceMotion ? 0 : Math.sin(t * 0.05 + seeds[i]) * 0.4);
        }
        posAttr.needsUpdate = true;
        cloud.rotation.z = t * 0.008 * (ci === 0 ? 1 : -1);
      });
      camera.position.x += (mouseX * 0.7 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.45 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      try { renderer.render(scene, camera); } catch (e) { running = false; }
    })();
  }

  /* ---------- PORTFOLIO FILTER TABS ---------- */
  var filterTabs = document.querySelectorAll(".filter-tab");
  var pfItems = document.querySelectorAll(".pf-item");
  filterTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var f = tab.getAttribute("data-filter");
      filterTabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      pfItems.forEach(function (item) {
        var show = f === "all" || item.getAttribute("data-cat") === f;
        item.classList.remove("pf-enter");
        if (show) {
          item.classList.remove("pf-hide");
          // restart the entry animation
          void item.offsetWidth;
          item.classList.add("pf-enter");
          if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 650);
        } else {
          item.classList.add("pf-hide");
        }
      });
    });
  });

  /* ---------- COVER-UP BEFORE / AFTER SLIDER ---------- */
  var ba = document.getElementById("baSlider");
  if (ba) {
    var baPos = 50;
    function setBA(pct) {
      baPos = Math.max(2, Math.min(98, pct));
      ba.style.setProperty("--ba", baPos + "%");
      ba.setAttribute("aria-valuenow", Math.round(baPos));
    }
    setBA(50);
    var baDrag = false;
    function baFromEvent(e) {
      var r = ba.getBoundingClientRect();
      var x = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      setBA(((x - r.left) / r.width) * 100);
    }
    ba.addEventListener("pointerdown", function (e) { baDrag = true; try { ba.setPointerCapture(e.pointerId); } catch (err) {} baFromEvent(e); });
    ba.addEventListener("pointermove", function (e) { if (baDrag) baFromEvent(e); });
    ["pointerup", "pointercancel"].forEach(function (ev) { ba.addEventListener(ev, function () { baDrag = false; }); });
    ba.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { setBA(baPos - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { setBA(baPos + 4); e.preventDefault(); }
    });
  }

  /* ---------- STYLE FINDER QUIZ ---------- */
  var quizAnswers = {};
  var quizSteps = document.querySelectorAll("[data-quiz-step]");
  var quizResult = document.getElementById("quizResult");
  var quizBar = document.getElementById("quizProgressBar");
  var styleMap = {
    "Bold": {
      title: "Bold Traditional",
      text: "Strong lines, solid colour, zero apologies. A bold traditional piece on the {placement} will age beautifully and read from across the room. The studio will sketch a design with real staying power."
    },
    "Minimal": {
      title: "Fine-Line Minimal",
      text: "Delicate, understated, effortlessly personal. A small fine-line piece on the {placement} keeps things elegant — perfect worn close, easy to grow from later."
    },
    "Spiritual": {
      title: "Sacred Geometry & Dotwork",
      text: "Mandalas, dotwork shading and symbols that mean something. A spiritual piece on the {placement} is as much meditation as tattoo — the studio loves this kind of slow, detailed work."
    },
    "Colourful": {
      title: "Vibrant Colour Work",
      text: "Saturated colour, playful blends, artwork that pops. A colourful piece on the {placement} turns skin into a canvas — ask about watercolour and neo-traditional directions."
    }
  };
  function showQuizStep(idx) {
    quizSteps.forEach(function (s) { s.hidden = (+s.getAttribute("data-quiz-step") !== idx); });
    if (quizBar) quizBar.style.width = ((idx + 1) / 3 * 100) + "%";
    var card = document.querySelector(".quiz-card");
    if (window.gsap && card && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var visible = quizSteps[idx];
      if (visible) gsap.fromTo(visible, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" });
    }
  }
  document.querySelectorAll(".quiz-opt").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-quiz");
      quizAnswers[key] = btn.getAttribute("data-value");
      btn.parentElement.querySelectorAll(".quiz-opt").forEach(function (o) { o.classList.toggle("selected", o === btn); });
      var stepEl = btn.closest("[data-quiz-step]");
      var step = +stepEl.getAttribute("data-quiz-step");
      setTimeout(function () {
        if (step < 2) { showQuizStep(step + 1); }
        else { finishQuiz(); }
      }, 260);
    });
  });
  function finishQuiz() {
    var vibe = quizAnswers.vibe || "Bold";
    var placement = quizAnswers.placement || "Arm";
    var first = quizAnswers.first || "No";
    var rec = styleMap[vibe] || styleMap.Bold;
    var placementText = placement === "Other" ? "your chosen spot" : "the " + placement.toLowerCase();
    var titleEl = document.getElementById("quizResultTitle");
    var textEl = document.getElementById("quizResultText");
    if (titleEl) titleEl.textContent = rec.title;
    if (textEl) {
      textEl.textContent = rec.text.replace("{placement}", placementText) +
        (first === "Yes" ? " And since it's your first tattoo — the studio will walk you through every step, no question too small." : "");
    }
    var waText =
      "Hey! 👋 I used the Style Finder on the Cathy Tattoo Studio demo.\n" +
      "My vibe: " + vibe + "\n" +
      "Placement: " + placement + "\n" +
      "First tattoo: " + first + "\n" +
      "Recommended style: " + rec.title + "\n" +
      "I'd love to talk about it!";
    var waBtn = document.getElementById("quizWaBtn");
    if (waBtn) waBtn.href = "https://wa.me/919890003038?text=" + encodeURIComponent(waText);
    quizSteps.forEach(function (s) { s.hidden = true; });
    if (quizBar) quizBar.style.width = "100%";
    if (quizResult) {
      quizResult.hidden = false;
      if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(quizResult, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      }
    }
  }
  var quizRestart = document.getElementById("quizRestart");
  if (quizRestart) {
    quizRestart.addEventListener("click", function () {
      quizAnswers = {};
      document.querySelectorAll(".quiz-opt").forEach(function (o) { o.classList.remove("selected"); });
      if (quizResult) quizResult.hidden = true;
      showQuizStep(0);
      var quizSec = document.getElementById("quiz");
      if (quizSec) quizSec.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  showQuizStep(0);

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // close the others for a clean single-open accordion
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        if (other === item) return;
        other.classList.remove("open");
        var oq = other.querySelector(".faq-q");
        var oa = other.querySelector(".faq-a");
        if (oq) oq.setAttribute("aria-expanded", "false");
        if (oa) {
          if (window.gsap) { gsap.to(oa, { height: 0, opacity: 0, duration: 0.35, ease: "power2.inOut", onComplete: function () { oa.hidden = true; oa.style.height = ""; oa.style.opacity = ""; } }); }
          else { oa.hidden = true; }
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        q.setAttribute("aria-expanded", "false");
        if (window.gsap) { gsap.to(a, { height: 0, opacity: 0, duration: 0.35, ease: "power2.inOut", onComplete: function () { a.hidden = true; a.style.height = ""; a.style.opacity = ""; } }); }
        else { a.hidden = true; }
      } else {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
        a.hidden = false;
        if (window.gsap) {
          gsap.fromTo(a, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.45, ease: "power2.out", onComplete: function () { a.style.height = ""; } });
        }
      }
    });
  });

  /* ---------- MICRO-INTERACTIONS: MAGNETIC CTAs ---------- */
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var reduceM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fine && !reduceM) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = "translate(" + (x * 10) + "px," + (y * 8 - 2) + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform .45s cubic-bezier(.22,.9,.3,1.4)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 460);
      });
    });

    /* ---------- MICRO-INTERACTIONS: 3D TILT ON SERVICE CARDS ---------- */
    document.querySelectorAll(".svc").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        card.classList.add("tilting");
        card.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("tilting");
        card.style.transform = "";
      });
    });
  }

  try { initInk(); } catch (e) { /* hero gradient fallback stays */ }
})();
